from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import os

from orchestrator.support_graph import graph

from services.ticket_service import (
    get_all_tickets,
    get_ticket,
    take_over_ticket,
    close_ticket,
)
from services.message_service import (
    save_message,
    get_ticket_messages,
    get_conversation_messages,
    save_system_message,
    clear_conversation_messages,
    SYSTEM_CLOSURE_MESSAGE,
)
from services.conversation_service import (
    create_conversation,
    get_conversation,
    link_ticket,
    close_conversation,
    set_feedback,
    reset_conversation,
)
from services.file_service import store_user_file, get_file_path, validate_user_file
from services.knowledge_base_service import (
    get_all_documents,
    get_document,
    create_document,
    update_document,
    delete_document,
    read_document_content,
)
from services.trending_service import get_trending_issues
from services.proactive_alerts_service import get_active_alerts, resolve_alert
from services.indexing_service import rebuild_index
from services.retrieval import reload_index
from services.feedback_service import submit_feedback, get_feedback_for_ticket, submit_skip

app = FastAPI(
    title="AGES AI",
    version="1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    query: str
    conversation_id: str | None = None


class TakeoverRequest(BaseModel):
    agent_name: str


class ReplyRequest(BaseModel):
    sender: str
    message: str


class TicketFeedbackRequest(BaseModel):
    rating: int
    label: str
    emoji: str | None = None


class FeedbackRequest(BaseModel):
    rating: int
    label: str


class KBCreateRequest(BaseModel):
    title: str
    content: str


class KBUpdateRequest(BaseModel):
    title: str
    content: str


class UserMessageRequest(BaseModel):
    message: str


@app.post("/conversations")
def create_new_conversation():
    return create_conversation()


@app.get("/conversations/{conversation_id}")
def get_conversation_status(conversation_id: str):
    conv = get_conversation(conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conv


@app.get("/conversations/{conversation_id}/messages")
def conversation_messages(conversation_id: str):
    conv = get_conversation(conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return get_conversation_messages(conversation_id)


@app.post("/conversations/{conversation_id}/reset")
def reset_conversation_session(conversation_id: str):
    clear_conversation_messages(conversation_id)
    new_conv = reset_conversation(conversation_id)
    return new_conv


@app.post("/conversations/{conversation_id}/feedback")
def submit_feedback(conversation_id: str, request: FeedbackRequest):
    conv = get_conversation(conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return set_feedback(conversation_id, request.rating, request.label)


@app.post("/conversations/{conversation_id}/upload")
async def upload_file(conversation_id: str, file: UploadFile = File(...)):
    conv = get_conversation(conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if conv.get("status") == "CLOSED":
        raise HTTPException(status_code=400, detail="Conversation is closed")

    content = await file.read()
    metadata, error = store_user_file(content, file.filename, conversation_id)
    if error:
        raise HTTPException(status_code=400, detail=error)

    save_message(
        ticket_id=conv.get("ticket_id"),
        sender="customer",
        message=f"Uploaded file: {file.filename}",
        conversation_id=conversation_id,
        message_type="file",
        file_data=metadata,
    )

    return {"success": True, "file": metadata}


@app.post("/conversations/{conversation_id}/messages")
def user_message_to_agent(conversation_id: str, request: UserMessageRequest):
    conv = get_conversation(conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if conv.get("status") == "CLOSED":
        raise HTTPException(status_code=400, detail="Conversation is closed")

    entry = save_message(
        ticket_id=conv.get("ticket_id"),
        sender="customer",
        message=request.message,
        conversation_id=conversation_id,
    )
    return {"success": True, "message": entry}


@app.post("/chat")
def chat(request: ChatRequest):
    try:
        conversation_id = request.conversation_id
        if not conversation_id:
            conv = create_conversation()
            conversation_id = conv["conversation_id"]
        else:
            conv = get_conversation(conversation_id)
            if not conv:
                conv = create_conversation()
                conversation_id = conv["conversation_id"]
            elif conv.get("status") == "CLOSED":
                return {
                    "answer": SYSTEM_CLOSURE_MESSAGE,
                    "conversation_id": conversation_id,
                    "closed": True,
                    "escalation": {"escalate": False},
                }

        save_message(
            sender="customer",
            message=request.query,
            conversation_id=conversation_id,
            ticket_id=conv.get("ticket_id"),
        )

        # If this conversation is linked to a ticket that has been
        # taken over by a human agent, the AI should not respond.
        ticket_id_for_conv = conv.get("ticket_id")
        if ticket_id_for_conv:
            from services.ticket_service import get_ticket

            ticket_obj = get_ticket(ticket_id_for_conv)
            if ticket_obj and ticket_obj.get("status") == "IN_PROGRESS" and ticket_obj.get("owner") != "AI":
                # Do not call the RAG/AI graph; inform client that human will reply.
                return {
                    "answer": (
                        "A human support agent is handling this ticket and will reply shortly."
                    ),
                    "conversation_id": conversation_id,
                    "escalation": {"escalate": True},
                    "ticket_id": ticket_id_for_conv,
                }

        result = graph.invoke({"query": request.query})

        answer = result.get("response", {}).get("answer", "")

        if isinstance(answer, str) and answer.strip().startswith("{"):
            try:
                import json
                parsed = json.loads(answer)
                if "status" in parsed and parsed["status"] == "ERROR":
                    return {
                        "answer": (
                            f"I encountered a temporary service issue: "
                            f"{parsed.get('message', 'Service unavailable')}. "
                            "Please try again in a moment."
                        ),
                        "conversation_id": conversation_id,
                        "escalation": {"escalate": True, "reason": "Service error occurred"},
                    }
            except Exception:
                pass

        escalation = result.get("escalation", {"escalate": False})
        ticket = escalation.get("ticket") if isinstance(escalation, dict) else None
        ticket_id = ticket.get("ticket_id") if isinstance(ticket, dict) else None

        if escalation.get("escalate") and ticket_id:
            link_ticket(conversation_id, ticket_id)
            answer = (
                "Thanks for reaching out. A human support agent has been notified "
                "and will respond shortly."
            )

        save_message(
            sender="ai",
            message=answer if answer else "I could not process your request. Please try again.",
            conversation_id=conversation_id,
            ticket_id=ticket_id or conv.get("ticket_id"),
        )

        return {
            "answer": answer if answer else "I could not process your request. Please try again.",
            "conversation_id": conversation_id,
            "escalation": escalation,
            "ticket_id": ticket_id or conv.get("ticket_id"),
            "ticket": ticket,
            "closed": False,
        }

    except Exception as e:
        import traceback
        print(f"Chat endpoint error: {str(e)}\n{traceback.format_exc()}")
        return {
            "answer": f"An error occurred processing your request: {str(e)}. Please try again later.",
            "escalation": {"escalate": True, "reason": "Backend error"},
        }


@app.get("/tickets")
def tickets():
    return get_all_tickets()


@app.get("/tickets/{ticket_id}")
def ticket(ticket_id: str):
    ticket_data = get_ticket(ticket_id)
    if not ticket_data:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket_data


@app.get("/tickets/{ticket_id}/messages")
def ticket_messages(ticket_id: str):
    return get_ticket_messages(ticket_id)


@app.post("/tickets/{ticket_id}/takeover")
def takeover(ticket_id: str, request: TakeoverRequest):
    result = take_over_ticket(ticket_id, request.agent_name)
    if not result:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return result


@app.post("/tickets/{ticket_id}/reply")
def reply(ticket_id: str, request: ReplyRequest):
    conv = None
    from services.conversation_service import load_conversations
    for c in load_conversations():
        if c.get("ticket_id") == ticket_id:
            conv = c
            break

    # Prevent sending replies on closed tickets
    from services.ticket_service import get_ticket

    ticket_obj = get_ticket(ticket_id)
    if not ticket_obj:
        raise HTTPException(status_code=404, detail="Ticket not found")
    if ticket_obj.get("status") == "CLOSED":
        raise HTTPException(status_code=400, detail="Ticket is closed; cannot send replies")

    entry = save_message(
        ticket_id=ticket_id,
        sender=request.sender,
        message=request.message,
        conversation_id=conv.get("conversation_id") if conv else None,
    )

    return {
        "success": True,
        "ticket_id": ticket_id,
        "message": entry,
    }


@app.post("/tickets/{ticket_id}/feedback")
def ticket_feedback(ticket_id: str, request: TicketFeedbackRequest):
    # Validate ticket exists
    from services.ticket_service import get_ticket

    ticket_obj = get_ticket(ticket_id)
    if not ticket_obj:
        raise HTTPException(status_code=404, detail="Ticket not found")

    # Prevent duplicate feedback
    existing = get_feedback_for_ticket(ticket_id)
    if existing:
        raise HTTPException(status_code=400, detail="Feedback already submitted for this ticket")

    try:
        entry = submit_feedback(ticket_id, request.rating, request.label, request.emoji)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Record feedback also on the conversation (if present) to avoid re-prompting
    from services.conversation_service import load_conversations, set_feedback

    for c in load_conversations():
        if c.get("ticket_id") == ticket_id:
            set_feedback(c.get("conversation_id"), request.rating, request.label)
            break

    return {"success": True, "feedback": entry}


@app.post("/tickets/{ticket_id}/feedback/skip")
def ticket_feedback_skip(ticket_id: str):
    from services.ticket_service import get_ticket

    ticket_obj = get_ticket(ticket_id)
    if not ticket_obj:
        raise HTTPException(status_code=404, detail="Ticket not found")

    existing = get_feedback_for_ticket(ticket_id)
    if existing:
        raise HTTPException(status_code=400, detail="Feedback already submitted for this ticket")

    try:
        entry = submit_skip(ticket_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    from services.conversation_service import load_conversations, set_feedback
    for c in load_conversations():
        if c.get("ticket_id") == ticket_id:
            set_feedback(c.get("conversation_id"), 0, 'Skipped')
            break

    return {"success": True, "feedback": entry}


@app.get("/tickets/{ticket_id}/feedback")
def get_ticket_feedback(ticket_id: str):
    entry = get_feedback_for_ticket(ticket_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Feedback not found")
    return entry


@app.post("/tickets/{ticket_id}/close")
def close(ticket_id: str):
    ticket_data = close_ticket(ticket_id)
    if not ticket_data:
        raise HTTPException(status_code=404, detail="Ticket not found")

    # Do not close the conversation entirely; end the human session and
    # notify the customer. Keep the conversation active so the AI can resume.
    conversation_id = None
    from services.conversation_service import load_conversations

    for c in load_conversations():
        if c.get("ticket_id") == ticket_id:
            conversation_id = c.get("conversation_id")
            break

    # Save a system closure message visible to the customer
    save_system_message(
        conversation_id=conversation_id,
        ticket_id=ticket_id,
        message=SYSTEM_CLOSURE_MESSAGE,
    )

    # Insert a feedback prompt message (message_type = 'feedback_prompt')
    save_message(
        ticket_id=ticket_id,
        sender="system",
        message=("How was your support experience? Please select a rating."),
        conversation_id=conversation_id,
        message_type="feedback_prompt",
    )

    return {"success": True, "ticket": ticket_data, "conversation_id": conversation_id, "closed": True}


@app.get("/trending-issues")
def trending_issues():
    return get_trending_issues()


@app.get("/proactive-alerts")
def proactive_alerts():
    """Get all proactive incident alerts (both ACTIVE and SOLVED).
    
    Returns alerts where occurrence percentage >= 50%.
    Sorted by ACTIVE first (newest), then SOLVED (newest).
    """
    return get_active_alerts()


@app.post("/proactive-alerts/{alert_id}/resolve")
def resolve_proactive_alert(alert_id: str):
    """Mark a proactive alert as SOLVED.
    
    Updates status to 'SOLVED' and adds resolved_timestamp.
    Persists changes to proactive_alerts.json.
    """
    resolve_alert(alert_id)
    return {"success": True, "message": f"Alert {alert_id} marked as SOLVED"}


@app.get("/knowledge-base")
def list_knowledge_base():
    docs = get_all_documents()
    return [
        {
            "doc_id": d["doc_id"],
            "title": d["title"],
            "size": d["size"],
            "created_at": d["created_at"],
            "updated_at": d["updated_at"],
        }
        for d in docs
    ]


@app.get("/knowledge-base/{doc_id}")
def get_kb_document(doc_id: str):
    doc = get_document(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    content = read_document_content(doc_id)
    return {
        "doc_id": doc["doc_id"],
        "title": doc["title"],
        "content": content,
        "size": doc["size"],
        "created_at": doc["created_at"],
        "updated_at": doc["updated_at"],
    }


@app.post("/knowledge-base")
def create_kb_document(request: KBCreateRequest):
    if not request.title.strip() or not request.content.strip():
        raise HTTPException(status_code=400, detail="Title and content are required")
    doc = create_document(request.title.strip(), request.content)
    rebuild_index()
    reload_index()
    return doc


@app.put("/knowledge-base/{doc_id}")
def update_kb_document(doc_id: str, request: KBUpdateRequest):
    doc = update_document(doc_id, request.title.strip(), request.content)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    rebuild_index()
    reload_index()
    return doc


@app.delete("/knowledge-base/{doc_id}")
def delete_kb_document(doc_id: str):
    success = delete_document(doc_id)
    if not success:
        raise HTTPException(status_code=404, detail="Document not found")
    rebuild_index()
    reload_index()
    return {"success": True}


@app.post("/knowledge-base/upload")
async def upload_kb_document(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".txt"):
        raise HTTPException(
            status_code=400,
            detail="Only .txt text documents are allowed for knowledge base uploads",
        )

    content = await file.read()
    try:
        text = content.decode("utf-8")
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="File must be valid UTF-8 text")

    title = file.filename.replace(".txt", "").replace("_", " ")
    doc = create_document(title, text)
    rebuild_index()
    reload_index()
    return doc


@app.get("/uploads/{filename}")
def serve_upload(filename: str):
    file_path = get_file_path(filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)


@app.get("/")
def home():
    return {
        "project": "AGES AI",
        "status": "running",
    }

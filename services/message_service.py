import json
import os
import uuid
from datetime import datetime

MESSAGE_FILE = "data/messages.json"

SYSTEM_CLOSURE_MESSAGE = (
    "Conversation has been completed and closed by the support team."
)


def load_messages():
    if not os.path.exists(MESSAGE_FILE):
        with open(MESSAGE_FILE, "w") as f:
            json.dump([], f)
    with open(MESSAGE_FILE, "r") as f:
        return json.load(f)


def save_messages(messages):
    with open(MESSAGE_FILE, "w") as f:
        json.dump(messages, f, indent=4)


def save_message(
    ticket_id=None,
    sender=None,
    message=None,
    conversation_id=None,
    message_type="text",
    file_data=None,
):
    messages = load_messages()

    entry = {
        "message_id": f"MSG-{uuid.uuid4().hex[:8]}",
        "ticket_id": ticket_id,
        "conversation_id": conversation_id,
        "sender": sender,
        "message": message,
        "message_type": message_type,
        "file": file_data,
        "timestamp": datetime.now().isoformat(),
    }

    messages.append(entry)
    save_messages(messages)
    return entry


def save_system_message(conversation_id, ticket_id=None, message=SYSTEM_CLOSURE_MESSAGE):
    return save_message(
        ticket_id=ticket_id,
        sender="system",
        message=message,
        conversation_id=conversation_id,
        message_type="system",
    )


def get_ticket_messages(ticket_id):
    messages = load_messages()
    return [msg for msg in messages if msg.get("ticket_id") == ticket_id]


def get_conversation_messages(conversation_id):
    messages = load_messages()
    return [msg for msg in messages if msg.get("conversation_id") == conversation_id]


def clear_conversation_messages(conversation_id):
    messages = load_messages()
    filtered = [
        msg for msg in messages if msg.get("conversation_id") != conversation_id
    ]
    save_messages(filtered)


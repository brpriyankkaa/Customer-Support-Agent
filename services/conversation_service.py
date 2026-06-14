import json
import os
from datetime import datetime

CONVERSATION_FILE = "data/conversations.json"


def load_conversations():
    if not os.path.exists(CONVERSATION_FILE):
        with open(CONVERSATION_FILE, "w") as f:
            json.dump([], f)
    with open(CONVERSATION_FILE, "r") as f:
        return json.load(f)


def save_conversations(conversations):
    with open(CONVERSATION_FILE, "w") as f:
        json.dump(conversations, f, indent=4)


def generate_conversation_id():
    conversations = load_conversations()
    next_id = len(conversations) + 1
    return f"CONV-{next_id:04d}"


def create_conversation():
    conversations = load_conversations()
    conversation = {
        "conversation_id": generate_conversation_id(),
        "ticket_id": None,
        "status": "ACTIVE",
        "feedback": None,
        "created_at": datetime.now().isoformat(),
        "closed_at": None,
    }
    conversations.append(conversation)
    save_conversations(conversations)
    return conversation


def get_conversation(conversation_id):
    conversations = load_conversations()
    for conv in conversations:
        if conv["conversation_id"] == conversation_id:
            return conv
    return None


def link_ticket(conversation_id, ticket_id):
    conversations = load_conversations()
    for conv in conversations:
        if conv["conversation_id"] == conversation_id:
            conv["ticket_id"] = ticket_id
            save_conversations(conversations)
            return conv
    return None


def close_conversation(conversation_id):
    conversations = load_conversations()
    for conv in conversations:
        if conv["conversation_id"] == conversation_id:
            conv["status"] = "CLOSED"
            conv["closed_at"] = datetime.now().isoformat()
            save_conversations(conversations)
            return conv
    return None


def close_conversation_by_ticket(ticket_id):
    conversations = load_conversations()
    for conv in conversations:
        if conv.get("ticket_id") == ticket_id:
            conv["status"] = "CLOSED"
            conv["closed_at"] = datetime.now().isoformat()
            save_conversations(conversations)
            return conv
    return None


def set_feedback(conversation_id, rating, label):
    conversations = load_conversations()
    for conv in conversations:
        if conv["conversation_id"] == conversation_id:
            conv["feedback"] = {
                "rating": rating,
                "label": label,
                "submitted_at": datetime.now().isoformat(),
            }
            save_conversations(conversations)
            return conv
    return None


def reset_conversation(conversation_id):
    conversations = load_conversations()
    filtered = [
        c for c in conversations if c["conversation_id"] != conversation_id
    ]
    save_conversations(filtered)
    return create_conversation()

import json
import os
from datetime import datetime

FEEDBACK_FILE = "data/feedback.json"


def load_feedback():
    if not os.path.exists(FEEDBACK_FILE):
        with open(FEEDBACK_FILE, "w") as f:
            json.dump([], f)
    with open(FEEDBACK_FILE, "r") as f:
        return json.load(f)


def save_feedback(feedback):
    with open(FEEDBACK_FILE, "w") as f:
        json.dump(feedback, f, indent=4)


def submit_feedback(ticket_id, rating, label, emoji=None):
    # validate rating
    try:
        rating_int = int(rating)
    except Exception:
        raise ValueError("Rating must be an integer between 1 and 5")

    if rating_int < 1 or rating_int > 5:
        raise ValueError("Rating must be between 1 and 5")

    feedback = load_feedback()
    # prevent duplicate for same ticket
    for f in feedback:
        if f.get("ticket_id") == ticket_id:
            raise ValueError("Feedback already submitted for this ticket")

    entry = {
        "ticket_id": ticket_id,
        "rating": rating_int,
        "emoji": emoji,
        "label": label,
        "timestamp": datetime.now().isoformat(),
    }

    feedback.append(entry)
    save_feedback(feedback)
    return entry


def get_feedback_for_ticket(ticket_id):
    feedback = load_feedback()
    for f in feedback:
        if f.get("ticket_id") == ticket_id:
            return f
    return None


def submit_skip(ticket_id):
    feedback = load_feedback()
    for f in feedback:
        if f.get("ticket_id") == ticket_id:
            raise ValueError("Feedback already submitted for this ticket")

    entry = {
        "ticket_id": ticket_id,
        "rating": None,
        "emoji": None,
        "label": "Skipped",
        "timestamp": datetime.now().isoformat(),
    }

    feedback.append(entry)
    save_feedback(feedback)
    return entry

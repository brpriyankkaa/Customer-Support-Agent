import json
import os
from datetime import datetime


MESSAGE_FILE = "data/messages.json"


def load_messages():

    if not os.path.exists(MESSAGE_FILE):

        with open(MESSAGE_FILE, "w") as f:

            json.dump([], f)

    with open(MESSAGE_FILE, "r") as f:

        return json.load(f)


def save_messages(messages):

    with open(MESSAGE_FILE, "w") as f:

        json.dump(
            messages,
            f,
            indent=4
        )


def save_message(

    ticket_id,
    sender,
    message

):

    messages = load_messages()

    messages.append({

        "ticket_id":
        ticket_id,

        "sender":
        sender,

        "message":
        message,

        "timestamp":
        datetime.now().isoformat()
    })

    save_messages(messages)


def get_ticket_messages(ticket_id):

    messages = load_messages()

    return [

        msg

        for msg in messages

        if msg["ticket_id"] == ticket_id
    ]
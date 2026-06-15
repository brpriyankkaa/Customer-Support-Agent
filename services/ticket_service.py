import json
import os
from datetime import datetime


TICKET_FILE = "data/tickets.json"


def load_tickets():

    if not os.path.exists(TICKET_FILE):

        with open(TICKET_FILE, "w") as f:
            json.dump([], f)

    with open(TICKET_FILE, "r") as f:

        return json.load(f)


def save_tickets(tickets):

    with open(TICKET_FILE, "w") as f:

        json.dump(
            tickets,
            f,
            indent=4
        )


def generate_ticket_id():

    tickets = load_tickets()

    next_id = len(tickets) + 1

    return f"INC-{next_id:04d}"


def create_ticket(

    customer_query,
    summary,
    priority,
    assigned_team

):

    tickets = load_tickets()

    ticket = {

        "ticket_id":
        generate_ticket_id(),

        "status":
        "OPEN",

        "created_at":
        datetime.now().isoformat(),

        "customer_query":
        customer_query,

        "summary":
        summary,

        "priority":
        priority,

        "assigned_team":
        assigned_team,

        "owner":
        "AI"
    }

    tickets.append(ticket)

    save_tickets(tickets)

    return ticket


def get_all_tickets():

    return load_tickets()


def get_ticket(ticket_id):

    tickets = load_tickets()

    for ticket in tickets:

        if ticket["ticket_id"] == ticket_id:

            return ticket

    return None


def take_over_ticket(

    ticket_id,
    human_name

):

    tickets = load_tickets()

    for ticket in tickets:

        if ticket["ticket_id"] == ticket_id:

            ticket["owner"] = human_name

            ticket["status"] = "IN_PROGRESS"

            save_tickets(tickets)

            return ticket

    return None


def close_ticket(ticket_id):

    tickets = load_tickets()

    for ticket in tickets:

        if ticket["ticket_id"] == ticket_id:

            ticket["status"] = "CLOSED"

            save_tickets(tickets)

            return ticket

    return None


def get_ticket_by_conversation(conversation_id):
    from services.conversation_service import get_conversation

    conv = get_conversation(conversation_id)
    if conv and conv.get("ticket_id"):
        return get_ticket(conv["ticket_id"])
    return None
import json
import os
from datetime import datetime


LOG_FILE = "data/interaction_logs.json"


def save_interaction(
    query,
    intent,
    answer,
    verification,
    compliance,
    escalation
):

    log_entry = {

        "timestamp":
        datetime.now().isoformat(),

        "query":
        query,

        "intent":
        intent,

        "answer":
        answer,

        "verification":
        verification,

        "compliance":
        compliance,

        "escalation":
        escalation
    }

    if not os.path.exists(LOG_FILE):

        with open(LOG_FILE, "w") as f:
            json.dump([], f)

    with open(LOG_FILE, "r") as f:

        logs = json.load(f)

    logs.append(log_entry)

    with open(LOG_FILE, "w") as f:

        json.dump(
            logs,
            f,
            indent=4
        )
import json
import os
from datetime import datetime


INTERACTION_LOG_FILE = "data/interaction_logs.json"
INTENT_LOG_FILE = "data/intent_logs.json"


def _load_logs(file_path):

    if not os.path.exists(file_path):

        with open(file_path, "w") as f:
            json.dump([], f)

    with open(file_path, "r") as f:
        return json.load(f)


def _save_logs(file_path, logs):

    with open(file_path, "w") as f:

        json.dump(
            logs,
            f,
            indent=4
        )


def save_interaction(
    query,
    intent,
    answer,
    verification,
    compliance,
    escalation
):

    logs = _load_logs(
        INTERACTION_LOG_FILE
    )

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

    logs.append(log_entry)

    _save_logs(
        INTERACTION_LOG_FILE,
        logs
    )


def save_intent_log(intent_data):

    logs = _load_logs(
        INTENT_LOG_FILE
    )

    log_entry = {

        "timestamp":
        datetime.now().isoformat(),

        "intent":
        intent_data.get(
            "intent",
            "UNKNOWN"
        ),

        "issue":
        intent_data.get(
            "issue",
            "Unknown Issue"
        ),

        "severity":
        intent_data.get(
            "severity",
            "LOW"
        ),

        "confidence":
        intent_data.get(
            "confidence",
            0
        )
    }

    logs.append(log_entry)

    _save_logs(
        INTENT_LOG_FILE,
        logs
    )
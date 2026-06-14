import json
import os
import re
from collections import Counter
from datetime import datetime

INTENT_LOGS_FILE = "data/intent_logs.json"
THRESHOLD_OCCURRENCES = 3


def load_intent_logs():
    if not os.path.exists(INTENT_LOGS_FILE):
        return []
    with open(INTENT_LOGS_FILE, "r") as f:
        return json.load(f)


def normalize_issue(issue):
    if not issue:
        return "unknown issue"
    cleaned = issue.strip().lower()
    cleaned = re.sub(r"\s+", " ", cleaned)
    return cleaned


def issue_display_title(issues):
    if not issues:
        return "Unknown Issue"
    counts = Counter(issues)
    return counts.most_common(1)[0][0]


def get_trending_issues():
    logs = load_intent_logs()
    valid_logs = [
        log
        for log in logs
        if log.get("intent") not in ("CONVERSATION", "UNKNOWN")
        and log.get("issue")
    ]

    intent_groups = {}
    for log in valid_logs:
        intent = log.get("intent", "UNKNOWN")
        if intent not in intent_groups:
            intent_groups[intent] = {
                "issues": [],
                "occurrences": 0,
                "severities": [],
                "users": set(),
            }
        intent_groups[intent]["issues"].append(log.get("issue", "Unknown Issue"))
        intent_groups[intent]["occurrences"] += 1
        intent_groups[intent]["severities"].append(log.get("severity", "LOW"))
        intent_groups[intent]["users"].add(log.get("timestamp", "")[:10])

    trending = []
    for intent, data in intent_groups.items():
        if data["occurrences"] < THRESHOLD_OCCURRENCES:
            continue

        severity_counts = Counter(data["severities"])
        top_severity = severity_counts.most_common(1)[0][0]
        title = issue_display_title(data["issues"])

        status = "Monitoring"
        if top_severity == "HIGH" and data["occurrences"] >= 5:
            status = "Escalated to Support Team"
        elif data["occurrences"] >= THRESHOLD_OCCURRENCES:
            status = "Under Review"

        trending.append({
            "issue": title,
            "occurrences": data["occurrences"],
            "affected_users": len(data["users"]) if data["users"] else data["occurrences"],
            "severity": top_severity,
            "intent": intent,
            "status": status,
        })

    trending.sort(key=lambda x: x["occurrences"], reverse=True)
    return trending

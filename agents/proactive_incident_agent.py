import json
import os
import time
from collections import Counter

from services.gemini_service import generate_response
from services.proactive_alerts_service import add_alert


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

INTENT_LOGS_FILE = os.path.join(
    BASE_DIR,
    "data",
    "intent_logs.json"
)


def analyze_logs(logs):

    prompt = f"""
You are a Proactive Incident Detection Agent.

Analyze these classified support logs.

Each log contains:
- intent
- issue
- severity
- confidence

Logs:
{json.dumps(logs, indent=2)}

Tasks:

1. Identify recurring issues.
2. Determine whether an incident exists.
3. Assign incident severity.
4. Estimate affected users.
5. Suggest likely root cause.
6. Recommend next action.

Return ONLY valid JSON.

Example:

{{
    "incident_detected": true,
    "category": "IT_SUPPORT",
    "severity": "HIGH",
    "affected_users": 6,
    "root_cause": "VPN service outage",
    "recommended_action": "Investigate VPN infrastructure immediately"
}}
"""

    response = generate_response(prompt)

    try:

        clean = response.strip()

        if clean.startswith("```json"):
            clean = clean.replace(
                "```json",
                "",
                1
            )

        if clean.endswith("```"):
            clean = clean[:-3]

        clean = clean.strip()

        return json.loads(clean)

    except Exception:

        return {
            "incident_detected": False,
            "category": "UNKNOWN",
            "severity": "LOW",
            "affected_users": 0,
            "root_cause": "Unable to parse response",
            "recommended_action": "Manual review required"
        }


def run_proactive_monitor():

    print("Proactive Incident Agent Started...")

    while True:

        print("\nChecking logs...")

        time.sleep(60)

        try:

            if not os.path.exists(INTENT_LOGS_FILE):

                print("intent_logs.json not found")

                continue

            with open(
                INTENT_LOGS_FILE,
                "r"
            ) as f:

                logs = json.load(f)

            if len(logs) < 10:

                print(
                    f"Only {len(logs)} logs available. Waiting for 10."
                )

                continue

            last_logs = logs[-10:]

            valid_logs = [

                log

                for log in last_logs

                if log.get("intent")
                not in [
                    "CONVERSATION",
                    "UNKNOWN"
                ]
            ]

            if not valid_logs:

                print(
                    "No support-related issues detected."
                )

                continue

            intents = [

                log["intent"]

                for log in valid_logs
            ]

            counts = Counter(intents)

            top_category, top_count = counts.most_common(1)[0]

            percentage = (
                top_count /
                len(valid_logs)
            ) * 100

            print("\nIntent Distribution:")
            print(counts)

            print(
                f"\nTop Category: "
                f"{top_category} "
                f"({percentage:.2f}%)"
            )

            if percentage < 50:

                print(
                    "\nNo incident detected."
                )

                continue

            incident_logs = [

                log

                for log in valid_logs

                if log["intent"] ==
                top_category
            ]

            report = analyze_logs(
                incident_logs
            )

            print("\n")
            print("=" * 60)
            print("INCIDENT REPORT")
            print("=" * 60)

            print(
                json.dumps(
                    report,
                    indent=4
                )
            )

            print("=" * 60)

            # Save the alert to proactive alerts service
            add_alert(
                incident_report=report,
                percentage=percentage,
                category=top_category
            )
            print(f"\nAlert saved for {top_category} with {percentage:.2f}% occurrence.")

        except Exception as e:

            print(
                f"\nProactive Agent Error: {e}"
            )


if __name__ == "__main__":

    run_proactive_monitor()
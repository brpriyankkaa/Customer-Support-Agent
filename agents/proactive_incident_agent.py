import json
import os
import time
from collections import Counter

from services.gemini_service import analyze_queries
#from notifier import notify

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

INTERACTIONS_FILE = os.path.join(
    BASE_DIR,
    "data",
    "interactions.json"
)

INCIDENT_FILE = os.path.join(
    BASE_DIR,
    "data",
    "incident_reports.json"
)

print("Proactive Incident Agent Started...")

while True:

    print("\nWaiting 15 seconds...")

    time.sleep(15)

    try:

        with open(INTERACTIONS_FILE, "r") as f:
            interactions = json.load(f)

        if len(interactions) < 10:
            print(
                f"Only {len(interactions)} interactions available. Waiting for 10."
            )
            continue

        # Last 10 interactions
        last_queries = interactions[-10:]

        # Count intents
        intents = [q["intent"] for q in last_queries]

        counts = Counter(intents)

        top_category, top_count = counts.most_common(1)[0]

        percentage = (top_count / len(last_queries)) * 100

        print("\nCategory Distribution:")
        print(counts)

        print(
            f"\nTop Category: {top_category} "
            f"({top_count}/{len(last_queries)} = {percentage:.2f}%)"
        )

        # Require at least 50%
        if percentage < 50:

            print(
                "\nNo incident detected. "
                "No category crossed 50% threshold."
            )

            continue

        print(
            f"\nThreshold crossed. "
            f"Analyzing {top_category} with Gemini..."
        )

        # Send only dominant category queries
        incident_queries = [
            q for q in last_queries
            if q["intent"] == top_category
        ]

        report = analyze_queries(
            incident_queries
        )

        # Load existing incidents
        with open(INCIDENT_FILE, "r") as f:
            incidents = json.load(f)

        incidents.append({
            "category": top_category,
            "percentage": percentage,
            "report": report
        })

        with open(INCIDENT_FILE, "w") as f:
            json.dump(
                incidents,
                f,
                indent=4
            )

        notify(report)

    except Exception as e:

        print("\nError:", e)

def notify(report):

    print("\n")
    print("=" * 60)
    print("INCIDENT DETECTED")
    print("=" * 60)

    print(report)

    print("=" * 60)   
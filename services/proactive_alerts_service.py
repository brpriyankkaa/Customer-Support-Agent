import json
import os
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

PROACTIVE_ALERTS_FILE = os.path.join(
    BASE_DIR,
    "data",
    "proactive_alerts.json"
)


def load_alerts():
    """Load all proactive alerts from file."""
    if not os.path.exists(PROACTIVE_ALERTS_FILE):
        return []
    try:
        with open(PROACTIVE_ALERTS_FILE, "r") as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        return []


def save_alerts(alerts):
    """Save alerts to file."""
    os.makedirs(os.path.dirname(PROACTIVE_ALERTS_FILE), exist_ok=True)
    with open(PROACTIVE_ALERTS_FILE, "w") as f:
        json.dump(alerts, f, indent=2)


def add_alert(incident_report, percentage, category):
    """
    Add a new proactive alert.
    
    Args:
        incident_report: The incident analysis report from proactive agent
        percentage: The percentage of logs matching this category
        category: The intent category detected
    """
    alerts = load_alerts()
    
    alert = {
        "id": f"alert_{datetime.now().isoformat()}",
        "timestamp": datetime.now().isoformat(),
        "category": category,
        "percentage": percentage,
        "incident_detected": incident_report.get("incident_detected", False),
        "severity": incident_report.get("severity", "LOW"),
        "affected_users": incident_report.get("affected_users", 0),
        "root_cause": incident_report.get("root_cause", ""),
        "recommended_action": incident_report.get("recommended_action", ""),
        "status": "ACTIVE"
    }
    
    alerts.append(alert)
    save_alerts(alerts)
    
    return alert


def get_active_alerts():
    """Get all proactive alerts (both ACTIVE and SOLVED)."""
    alerts = load_alerts()
    # Return all alerts, sorted by timestamp descending (ACTIVE first, then SOLVED)
    return sorted(alerts, key=lambda x: (x.get("status") != "ACTIVE", x.get("timestamp", "")), reverse=True)


def resolve_alert(alert_id):
    """Mark an alert as solved."""
    alerts = load_alerts()
    for alert in alerts:
        if alert.get("id") == alert_id:
            alert["status"] = "SOLVED"
            alert["resolved_timestamp"] = datetime.now().isoformat()
            break
    save_alerts(alerts)


def clear_old_alerts(days=7):
    """Clear alerts older than specified days."""
    from datetime import datetime, timedelta
    
    alerts = load_alerts()
    cutoff_date = datetime.now() - timedelta(days=days)
    
    filtered_alerts = [
        a for a in alerts
        if datetime.fromisoformat(a.get("timestamp", "")) > cutoff_date
    ]
    
    save_alerts(filtered_alerts)

from services.ticket_service import create_ticket
from services.summary_service import generate_escalation_summary


def assign_team(intent):

    mapping = {

        "IT_SUPPORT": "IT_SUPPORT",

        "COMPLAINT": "CUSTOMER_RELATIONS",

        "FAQ": "GENERAL_SUPPORT",

        "ESCALATION_REQUEST": "GENERAL_SUPPORT"
    }

    return mapping.get(
        intent,
        "GENERAL_SUPPORT"
    )


def calculate_priority(

    intent,
    hallucination_status,
    policy_risk

):

    if policy_risk == "HIGH":
        return "HIGH"

    if hallucination_status == "UNSUPPORTED":
        return "HIGH"

    if intent == "COMPLAINT":
        return "HIGH"

    if intent == "ESCALATION_REQUEST":
        return "HIGH"

    return "MEDIUM"


def is_human_agent_request(query):
    lower = query.lower()
    triggers = [
        "human agent",
        "live agent",
        "real person",
        "talk to someone",
        "speak to someone",
        "speak with",
        "talk with",
        "representative",
        "meet a human",
        "meet a person",
        "take over",
        "connect me",
        "someone else",
        "human support",
    ]
    return any(trigger in lower for trigger in triggers)


def escalation_decision(

    query,
    intent,
    hallucination_status,
    hallucination_confidence,
    policy_risk

):

    reasons = []

    escalate = False

    if intent == "COMPLAINT":

        escalate = True

        reasons.append(
            "Customer complaint detected"
        )

    if is_human_agent_request(query):

        escalate = True

        reasons.append(
            "User explicitly requested a human support agent"
        )

    if intent == "ESCALATION_REQUEST":

        escalate = True

        reasons.append(
            "User requested escalation"
        )

    if hallucination_status == "UNSUPPORTED":

        escalate = True

        reasons.append(
            "Answer unsupported by context"
        )

    if hallucination_confidence < 70:

        escalate = True

        reasons.append(
            "Low verification confidence"
        )

    if policy_risk == "HIGH":

        escalate = True

        reasons.append(
            "Policy risk detected"
        )

    result = {

        "escalate": escalate,

        "reasons": reasons
    }

    if escalate:

        assigned_team = assign_team(
            intent
        )

        priority = calculate_priority(

            intent,
            hallucination_status,
            policy_risk
        )

        summary = generate_escalation_summary(

            query=query,

            intent=intent,

            reasons=reasons
        )

        ticket = create_ticket(

            customer_query=query,

            summary=summary,

            priority=priority,

            assigned_team=assigned_team
        )

        result["ticket"] = ticket

        result["summary"] = summary

        result["assigned_team"] = assigned_team

        result["priority"] = priority

    return result
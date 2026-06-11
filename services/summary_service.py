from services.gemini_service import generate_response


def generate_escalation_summary(

    query,
    intent,
    reasons

):

    prompt = f"""
You are a customer support handoff assistant.

Create a concise summary for a human support agent.

Customer Query:
{query}

Detected Intent:
{intent}

Escalation Reasons:
{', '.join(reasons)}

Rules:

- Write in professional support language
- Maximum 5 lines
- Explain the customer's issue
- Explain why escalation happened
- Suggest what the human agent should investigate

Return only the summary.
"""

    return generate_response(prompt)
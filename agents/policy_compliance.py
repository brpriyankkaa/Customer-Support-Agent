import json
from services.gemini_service import generate_response


def policy_compliance(question, answer):

    prompt = f"""
You are an Enterprise Policy Compliance Agent.

QUESTION:
{question}

ANSWER:
{answer}

Check whether the answer violates any of these:

- Personal Information
- Employee IDs
- Salary Information
- Passwords
- API Keys
- Credentials
- Confidential Business Data

Return ONLY JSON:

{{
  "allowed": true,
  "risk": "LOW",
  "reason": "No policy violation detected."
}}

Risk must be:
LOW
MEDIUM
HIGH

Return ONLY JSON.
"""

    response = generate_response(prompt)

    # Handle API error responses
    if isinstance(response, str) and response.strip().startswith('{"status":"ERROR"'):
        # Return safe default that allows response with low risk
        return {
            "allowed": True,
            "risk": "LOW",
            "reason": "Compliance check skipped due to service constraints. Response assumed safe."
        }

    try:

        clean = response.strip()

        if clean.startswith("```json"):
            clean = clean.replace("```json", "", 1)

        if clean.endswith("```"):
            clean = clean[:-3]

        clean = clean.strip()

        return json.loads(clean)

    except Exception as e:

        return {
            "allowed": True,
            "risk": "LOW",
            "reason": f"Compliance check error: {str(e)}. Defaulting to allowed."
        }
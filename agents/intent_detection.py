import json

from services.gemini_service import generate_response


def detect_intent(query):

    prompt = f"""
You are an Intent Detection Agent.

Classify the user query into ONE of these intents:

FAQ
POLICY_QUERY
HR_QUERY
IT_SUPPORT
ACCESS_REQUEST
COMPLAINT
ESCALATION_REQUEST
UNKNOWN

Query:
{query}

Return ONLY JSON:

{{
    "intent": "FAQ",
    "issue": "General leave policy question",
    "severity": "LOW",
    "confidence": 95
}}

Rules:

- Choose exactly one intent
- issue must be a short summary of the user's actual problem
- issue should be between 3 and 10 words
- severity must be one of:

  LOW
  MEDIUM
  HIGH
  CRITICAL

- confidence must be between 0 and 100
- return ONLY JSON
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

        result = json.loads(clean)

        return {

            "intent":
            result.get(
                "intent",
                "UNKNOWN"
            ),

            "issue":
            result.get(
                "issue",
                "Unable to determine issue"
            ),

            "severity":
            result.get(
                "severity",
                "LOW"
            ),

            "confidence":
            result.get(
                "confidence",
                0
            )
        }

    except Exception as e:

        return {

            "intent":
            "UNKNOWN",

            "issue":
            "Intent detection failed",

            "severity":
            "LOW",

            "confidence":
            0,

            "error":
            str(e)
        }
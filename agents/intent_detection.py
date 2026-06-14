import json

from services.gemini_service import generate_response


def detect_intent(query):

    prompt = f"""
You are an Intent Detection Agent.

Classify the user query into EXACTLY ONE of these intents:

CONVERSATION
FAQ
POLICY_QUERY
HR_QUERY
IT_SUPPORT
ACCESS_REQUEST
COMPLAINT
ESCALATION_REQUEST
UNKNOWN

Definitions:

CONVERSATION:
- Greetings
- Small talk
- Introductions
- Identity questions
- Capability questions
- Thanks
- Farewells
- Casual conversation

Examples:

"Hi"
→ CONVERSATION

"Hello"
→ CONVERSATION

"Good morning"
→ CONVERSATION

"Who are you?"
→ CONVERSATION

"Tell me about yourself"
→ CONVERSATION

"What can you do?"
→ CONVERSATION

"Can you help me?"
→ CONVERSATION

"Thank you"
→ CONVERSATION

"Thanks"
→ CONVERSATION

"Bye"
→ CONVERSATION

"Goodbye"
→ CONVERSATION

FAQ:
General informational questions answerable from company knowledge.

POLICY_QUERY:
Questions specifically about company policies, ethics, compliance, conduct, SpeakUp, governance, etc.

HR_QUERY:
Questions about leave, payroll, benefits, reimbursement, hiring, employee programs, etc.

IT_SUPPORT:
Technical issues such as VPN, password reset, login issues, software issues, device issues.

ACCESS_REQUEST:
Requests for permissions, system access, account creation, access approval.

COMPLAINT:
User dissatisfaction, complaints, negative feedback.

ESCALATION_REQUEST:
User explicitly requests human support, escalation, manager involvement, or manual review.

UNKNOWN:
Intent cannot be determined.

Query:
{query}

Return ONLY valid JSON:

{{
    "intent": "CONVERSATION",
    "issue": "Agent introduction request",
    "severity": "LOW",
    "confidence": 95
}}

Rules:

- Choose exactly one intent
- issue must summarize the user's request in 3-10 words
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
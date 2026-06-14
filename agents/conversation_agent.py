from services.gemini_service import generate_response
from datetime import datetime
import re


class ConversationAgent:

    GREETINGS = {
        "hi",
        "hello",
        "hey",
        "good morning",
        "good afternoon",
        "good evening"
    }

    def __init__(self):
        pass

    def _sanitize_input(self, query: str) -> str:
        """
        Remove excessive whitespace and dangerous prompt patterns.
        """

        query = query.strip()

        blocked_patterns = [
            r"ignore previous instructions",
            r"system prompt",
            r"reveal your instructions",
            r"developer message",
        ]

        for pattern in blocked_patterns:
            query = re.sub(
                pattern,
                "",
                query,
                flags=re.IGNORECASE
            )

        return query

    def _is_greeting(self, query: str) -> bool:
        return query.lower().strip() in self.GREETINGS

    def _build_prompt(self, query: str) -> str:

        return f"""
You are AGES AI Enterprise Assistant.

ROLE:
- Engage in professional conversation.
- Answer naturally and concisely.
- Be polite and helpful.
- Never hallucinate company policies.
- Never generate confidential information.
- If unsure, admit uncertainty.

RESPONSE RULES:
- Keep responses under 120 words.
- Maintain enterprise professionalism.
- Avoid unnecessary details.

USER MESSAGE:
{query}
"""

    def process(self, query: str):

        start_time = datetime.utcnow()

        query = self._sanitize_input(query)

        if not query:
            return {
                "answer": "Please enter a valid question.",
                "sources": [],
                "confidence": 1.0,
                "agent": "conversation_agent"
            }

        if self._is_greeting(query):
            return {
                "answer": (
                    "Hello! I'm AGES AI Support Assistant. "
                    "How can I assist you today?"
                ),
                "sources": [],
                "confidence": 1.0,
                "agent": "conversation_agent"
            }

        prompt = self._build_prompt(query)

        try:

            response = generate_response(prompt)

            return {
                "answer": response,
                "sources": [],
                "confidence": 0.90,
                "agent": "conversation_agent",
                "timestamp": start_time.isoformat()
            }

        except Exception as e:

            return {
                "answer": (
                    "I'm unable to process your request right now. "
                    "Please try again later."
                ),
                "sources": [],
                "confidence": 0.0,
                "agent": "conversation_agent",
                "error": str(e)
            }


conversation_agent = ConversationAgent()
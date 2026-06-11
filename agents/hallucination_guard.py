import json
from services.gemini_service import generate_response


def hallucination_guard(question, answer, context, sources_total):

    prompt = f"""
You are a Hallucination Detection Agent.

QUESTION:
{question}

ANSWER:
{answer}

CONTEXT:
{context}

Your task:

Check whether the answer is supported by the context.

Return ONLY valid JSON in this format:

{{
    "status":"SUPPORTED",
    "confidence":95,
    "sources_verified":8,
    "reason":"All claims are supported.",
    "unsupported_claims":[]
}}

Rules:

- status must be one of:
  SUPPORTED
  PARTIALLY_SUPPORTED
  UNSUPPORTED

- confidence must be between 0 and 100

- sources_verified must be an integer

- unsupported_claims must contain every unsupported statement

Return ONLY JSON.
"""

    response = generate_response(prompt)


    try:

        clean_response = response.strip()

        # Remove markdown JSON block if Gemini returns it
        if clean_response.startswith("```json"):
            clean_response = clean_response.replace(
                "```json",
                "",
                1
            )

        if clean_response.endswith("```"):
            clean_response = clean_response[:-3]

        clean_response = clean_response.strip()

        result = json.loads(clean_response)

        result["sources_total"] = sources_total

        return result

    except Exception as e:

        print("\nPARSE ERROR:\n")
        print(e)

        return {
            "status": "UNSUPPORTED",
            "confidence": 0,
            "sources_verified": 0,
            "sources_total": sources_total,
            "reason": f"Failed to parse verification output: {str(e)}",
            "unsupported_claims": []
        }
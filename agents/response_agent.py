from services.retrieval import retrieve
from services.gemini_service import generate_response


def response_agent(query):
    try:
        results = retrieve(query)

        context = "\n\n".join(
            [chunk["text"] for chunk in results]
        )

        prompt = f"""
You are an enterprise customer support assistant.

Use ONLY the context provided below.

Do not use your own knowledge.

If the answer is not found in the context,
reply exactly:

"I could not find sufficient information in the knowledge base."

CONTEXT:
{context}

QUESTION:
{query}

ANSWER:
"""

        answer = generate_response(prompt)
        
        # Check for API error response
        if isinstance(answer, str) and answer.strip().startswith('{"status":"ERROR"'):
            # Return a user-friendly error message for display
            answer = "I'm experiencing temporary service difficulties. Please try again in a few moments."

        return {
            "answer": answer,
            "sources": [
                {
                    "source": r["source"],
                    "category": r["category"],
                    "score": r["score"]
                }
                for r in results
            ]
        }
    except Exception as e:
        print(f"Response agent error: {e}")
        return {
            "answer": f"An error occurred while processing your query: {str(e)}",
            "sources": []
        }
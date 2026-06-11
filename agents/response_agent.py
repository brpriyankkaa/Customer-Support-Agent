from services.retrieval import retrieve
from services.gemini_service import generate_response


def response_agent(query):

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
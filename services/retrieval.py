import pickle
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

print("Loading Retrieval Service...")

with open("chunks.pkl", "rb") as f:
    chunks = pickle.load(f)

index = faiss.read_index("faiss_index.bin")

model = SentenceTransformer("all-MiniLM-L6-v2")

print("Retrieval Service Ready")


def retrieve(query, k=10):

    query_embedding = model.encode(
        [query],
        convert_to_numpy=True
    )

    query_embedding = query_embedding.astype(np.float32)

    faiss.normalize_L2(query_embedding)

    scores, indices = index.search(
        query_embedding,
        k
    )

    results = []

    for rank, idx in enumerate(indices[0]):

        chunk = chunks[idx]

        results.append({
            "rank": rank + 1,
            "score": float(scores[0][rank]),
            "source": chunk["source"],
            "category": chunk["category"],
            "text": chunk["text"]
        })

    return results
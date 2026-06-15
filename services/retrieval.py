import pickle
import os

import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

from services.indexing_service import index_exists, rebuild_index

_chunks = None
_index = None
_model = None


def _ensure_loaded():
    global _chunks, _index, _model

    if not index_exists():
        print("Vector index not found. Building index...")
        rebuild_index()

    if _chunks is None:
        with open("chunks.pkl", "rb") as f:
            _chunks = pickle.load(f)

    if _index is None:
        _index = faiss.read_index("faiss_index.bin")

    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")


def retrieve(query, k=10):
    _ensure_loaded()

    query_embedding = _model.encode([query], convert_to_numpy=True)
    query_embedding = query_embedding.astype(np.float32)
    faiss.normalize_L2(query_embedding)

    scores, indices = _index.search(query_embedding, k)

    results = []
    for rank, idx in enumerate(indices[0]):
        if idx < 0 or idx >= len(_chunks):
            continue
        chunk = _chunks[idx]
        results.append({
            "rank": rank + 1,
            "score": float(scores[0][rank]),
            "source": chunk["source"],
            "category": chunk["category"],
            "text": chunk["text"],
        })

    return results


def reload_index():
    global _chunks, _index
    rebuild_index()
    _chunks = None
    _index = None
    _ensure_loaded()

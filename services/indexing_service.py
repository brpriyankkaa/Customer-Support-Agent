import os
import pickle

import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

CHUNK_SIZE = 500
CHUNK_OVERLAP = 100
CHUNKS_FILE = "chunks.pkl"
INDEX_FILE = "faiss_index.bin"
PDFS_DIR = "pdfs"
KB_DIR = "data/knowledge_base"

_model = None


def get_model():
    global _model
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


def chunk_text(text, source, category="KNOWLEDGE_BASE"):
    chunks = []
    start = 0
    text_len = len(text)
    while start < text_len:
        end = start + CHUNK_SIZE
        chunk_text_slice = text[start:end]
        if chunk_text_slice.strip():
            chunks.append({
                "text": chunk_text_slice,
                "source": source,
                "category": category,
            })
        start += CHUNK_SIZE - CHUNK_OVERLAP
    return chunks


def collect_all_text_sources():
    sources = []

    if os.path.isdir(PDFS_DIR):
        for root, _, files in os.walk(PDFS_DIR):
            for fname in files:
                if fname.endswith(".txt"):
                    path = os.path.join(root, fname)
                    try:
                        with open(path, "r", encoding="utf-8", errors="ignore") as f:
                            content = f.read()
                        if content.strip():
                            sources.append((path, content, "PDFS"))
                    except OSError:
                        continue

    if os.path.isdir(KB_DIR):
        for fname in os.listdir(KB_DIR):
            if fname.endswith(".txt"):
                path = os.path.join(KB_DIR, fname)
                try:
                    with open(path, "r", encoding="utf-8", errors="ignore") as f:
                        content = f.read()
                    if content.strip():
                        sources.append((path, content, "ADMIN_KB"))
                except OSError:
                    continue

    return sources


def build_index():
    model = get_model()
    all_chunks = []

    for path, content, category in collect_all_text_sources():
        source_name = os.path.basename(path)
        all_chunks.extend(chunk_text(content, source_name, category))

    if not all_chunks:
        all_chunks = [{
            "text": "Capgemini SpeakUp support knowledge base placeholder.",
            "source": "default",
            "category": "KNOWLEDGE_BASE",
        }]

    texts = [c["text"] for c in all_chunks]
    embeddings = model.encode(texts, convert_to_numpy=True).astype(np.float32)
    faiss.normalize_L2(embeddings)

    index = faiss.IndexFlatIP(embeddings.shape[1])
    index.add(embeddings)

    with open(CHUNKS_FILE, "wb") as f:
        pickle.dump(all_chunks, f)

    faiss.write_index(index, INDEX_FILE)

    return len(all_chunks)


def rebuild_index():
    return build_index()


def index_exists():
    return os.path.exists(CHUNKS_FILE) and os.path.exists(INDEX_FILE)

import json
import os
import uuid
from datetime import datetime

KB_DIR = "data/knowledge_base"
KB_METADATA_FILE = "data/knowledge_base_metadata.json"


def ensure_kb_dir():
    os.makedirs(KB_DIR, exist_ok=True)


def load_kb_metadata():
    ensure_kb_dir()
    if not os.path.exists(KB_METADATA_FILE):
        with open(KB_METADATA_FILE, "w") as f:
            json.dump([], f)
    with open(KB_METADATA_FILE, "r") as f:
        return json.load(f)


def save_kb_metadata(metadata_list):
    with open(KB_METADATA_FILE, "w") as f:
        json.dump(metadata_list, f, indent=4)


def get_all_documents():
    return load_kb_metadata()


def get_document(doc_id):
    metadata_list = load_kb_metadata()
    for doc in metadata_list:
        if doc["doc_id"] == doc_id:
            return doc
    return None


def create_document(title, content):
    ensure_kb_dir()
    doc_id = f"KB-{uuid.uuid4().hex[:8]}"
    filename = f"{doc_id}.txt"
    file_path = os.path.join(KB_DIR, filename)

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)

    doc = {
        "doc_id": doc_id,
        "title": title,
        "filename": filename,
        "file_path": file_path,
        "size": len(content.encode("utf-8")),
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
    }

    metadata_list = load_kb_metadata()
    metadata_list.append(doc)
    save_kb_metadata(metadata_list)

    return doc


def update_document(doc_id, title, content):
    doc = get_document(doc_id)
    if not doc:
        return None

    file_path = doc["file_path"]
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)

    metadata_list = load_kb_metadata()
    for item in metadata_list:
        if item["doc_id"] == doc_id:
            item["title"] = title
            item["size"] = len(content.encode("utf-8"))
            item["updated_at"] = datetime.now().isoformat()
            break

    save_kb_metadata(metadata_list)
    return get_document(doc_id)


def delete_document(doc_id):
    doc = get_document(doc_id)
    if not doc:
        return False

    if os.path.exists(doc["file_path"]):
        os.remove(doc["file_path"])

    metadata_list = load_kb_metadata()
    metadata_list = [d for d in metadata_list if d["doc_id"] != doc_id]
    save_kb_metadata(metadata_list)
    return True


def read_document_content(doc_id):
    doc = get_document(doc_id)
    if not doc or not os.path.exists(doc["file_path"]):
        return None
    with open(doc["file_path"], "r", encoding="utf-8") as f:
        return f.read()

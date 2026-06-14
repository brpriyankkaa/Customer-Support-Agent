import os
import uuid
from datetime import datetime

UPLOAD_DIR = "data/uploads"
FILE_METADATA_FILE = "data/file_metadata.json"

ALLOWED_USER_EXTENSIONS = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".pdf": "application/pdf",
    ".txt": "text/plain",
}


def ensure_upload_dir():
    os.makedirs(UPLOAD_DIR, exist_ok=True)


def load_file_metadata():
    if not os.path.exists(FILE_METADATA_FILE):
        with open(FILE_METADATA_FILE, "w") as f:
            import json
            json.dump([], f)
    import json
    with open(FILE_METADATA_FILE, "r") as f:
        return json.load(f)


def save_file_metadata(metadata_list):
    import json
    with open(FILE_METADATA_FILE, "w") as f:
        json.dump(metadata_list, f, indent=4)


def validate_user_file(filename):
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_USER_EXTENSIONS:
        return False, f"File type not allowed. Accepted: png, jpg, jpeg, pdf, txt"
    return True, ALLOWED_USER_EXTENSIONS[ext]


def store_user_file(file_content, original_name, conversation_id):
    ensure_upload_dir()
    valid, mime_type = validate_user_file(original_name)
    if not valid:
        return None, mime_type

    ext = os.path.splitext(original_name)[1].lower()
    stored_name = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(UPLOAD_DIR, stored_name)

    with open(file_path, "wb") as f:
        f.write(file_content)

    metadata = {
        "file_id": f"FILE-{uuid.uuid4().hex[:8]}",
        "conversation_id": conversation_id,
        "original_name": original_name,
        "stored_name": stored_name,
        "mime_type": mime_type,
        "size": len(file_content),
        "url": f"/uploads/{stored_name}",
        "uploaded_at": datetime.now().isoformat(),
    }

    all_meta = load_file_metadata()
    all_meta.append(metadata)
    save_file_metadata(all_meta)

    return metadata, None


def get_file_path(stored_name):
    return os.path.join(UPLOAD_DIR, stored_name)

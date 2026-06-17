import hashlib
import os

DATA_DIR = "../data"

hashes = {}

for root, dirs, files in os.walk(DATA_DIR):
    for file in files:
        path = os.path.join(
            root,
            file
        )

        with open(
            path,
            "rb"
        ) as f:

            file_hash = hashlib.md5(
                f.read()
            ).hexdigest()

        if file_hash in hashes:
            print(
                "Duplicate removed:",
                path
            )
            os.remove(path)

        else:

            hashes[file_hash] = path
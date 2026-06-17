import os

from pypdf import PdfReader

DATA_DIR = "../data"

TEXT_DIR = "../text"

os.makedirs(
    TEXT_DIR,
    exist_ok=True
)

for root, dirs, files in os.walk(DATA_DIR):

    for file in files:
        if not file.endswith(".pdf"):
            continue

        pdf_path = os.path.join(
            root,
            file
        )

        category = os.path.basename(root)

        output_folder = os.path.join(
            TEXT_DIR,
            category
        )

        os.makedirs(
            output_folder,
            exist_ok=True
        )

        output_file = os.path.join(
            output_folder,
            file.replace(".pdf", ".txt")
        )

        try:

            reader = PdfReader(
                pdf_path
            )

            text = ""

            for page in reader.pages:
                text += page.extract_text() or ""

            with open(
                output_file,
                "w",
                encoding="utf-8"
            ) as f:
                f.write(text)

            print(
                "Extracted:",
                file
            )

        except Exception as e:
            print(e)
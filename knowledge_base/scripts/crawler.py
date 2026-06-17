import os
import json
import requests

from collections import deque
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

from knowledge_base.scripts.classifier import classify_document

SEEDS = [
    "https://www.capgemini.com/"
]

MAX_PAGES = 5000

visited = set()

queue = deque(SEEDS)

metadata = []

session = requests.Session()

BASE_DIR = "../data"

for folder in [

    "policies",
    "faqs",
    "reports",
    "whitepapers",
    "governance",
    "support_guides",
    "press_releases",
    "website_articles"
]:
    os.makedirs(
        os.path.join(BASE_DIR, folder),
        exist_ok=True
    )

while queue and len(visited) < MAX_PAGES:

    url = queue.popleft()
    if url in visited:
        continue
    visited.add(url)

    try:

        print("Visiting:", url)
        response = session.get(
            url,
            timeout=20
        )
        if "text/html" not in response.headers.get(
            "Content-Type",
            ""
        ):
            continue

        soup = BeautifulSoup(
            response.text,
            "html.parser"
        )

        title = soup.title.text if soup.title else ""

        for tag in soup.find_all(
            "a",
            href=True
        ):

            href = urljoin(
                url,
                tag["href"]
            )

            if ".pdf" in href.lower():

                category = classify_document(
                    href,
                    title
                )

                filename = href.split("/")[-1]

                save_path = os.path.join(
                    BASE_DIR,
                    category,
                    filename
                )

                if not os.path.exists(save_path):

                    try:

                        pdf = session.get(
                            href,
                            timeout=30
                        )

                        with open(
                            save_path,
                            "wb"
                        ) as f:
                            f.write(pdf.content)

                        metadata.append({
                            "url": href,
                            "category": category,
                            "file": filename
                        })

                        print(
                            "Downloaded:",
                            filename
                        )

                    except:
                        pass

            parsed = urlparse(href)

            if parsed.netloc.endswith(
                "capgemini.com"
            ):
                if href not in visited:
                    queue.append(href)

    except Exception as e:
        print(e)

with open(
    "../metadata/documents.json",
    "w"
) as f:
    json.dump(
        metadata,
        f,
        indent=4
    )
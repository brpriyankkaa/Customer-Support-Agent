import os

def classify_document(url, title=""):

    text = (url + " " + title).lower()
    rules = {

        "policies": [
            "policy",
            "code-of-conduct",
            "ethics"
        ],
        "faqs": [
            "faq",
            "frequently asked"
        ],
        "reports": [
            "report",
            "survey",
            "research"
        ],
        "whitepapers": [
            "whitepaper",
            "white-paper"
        ],
        "governance": [
            "governance",
            "board"
        ],
        "support_guides": [
            "guide",
            "manual",
            "support"
        ],
        "press_releases": [
            "press",
            "news"
        ]
    }

    for category, keywords in rules.items():
        for keyword in keywords:
            if keyword in text:
                return category

    return "website_articles"
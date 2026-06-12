import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

genai.configure(api_key=api_key)

model = genai.GenerativeModel(
    "gemini-2.5-flash"
)


def generate_response(prompt):

    response = model.generate_content(prompt)

    return response.text


def analyze_queries(last_queries):

    prompt = f"""
You are a Proactive Incident Detection Agent.

Analyze these customer support interactions.

Interactions:
{json.dumps(last_queries, indent=2)}

Tasks:
1. Detect recurring issues.
2. Determine if an incident exists.
3. Assign severity.
4. Estimate affected users.
5. Suggest root cause.
6. Recommend action.

Return valid JSON only.

Example:

{{
  "incident_detected": true,
  "category": "VPN Connectivity",
  "severity": "High",
  "affected_users": 6,
  "root_cause": "...",
  "recommended_action": "..."
}}
"""

    response = model.generate_content(prompt)

    return response.text
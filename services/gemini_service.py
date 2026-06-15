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
    """
    Generate response from Gemini API with error handling.
    Falls back to structured response if API quota exceeded.
    """
    try:

        response = model.generate_content(prompt)

        return response.text

    except Exception as e:

        error_msg = str(e).lower()

        print(f"Gemini Error: {e}")

        if "quota" in error_msg or "rate limit" in error_msg:

            return (
                '{"status":"ERROR",'
                '"message":"API quota exceeded. '
                'Please try again later."}'
            )

        if "auth" in error_msg or "invalid" in error_msg:

            return (
                '{"status":"ERROR",'
                '"message":"Service authentication failed."}'
            )

        return (
            f'{{"status":"ERROR",'
            f'"message":"Service error: {str(e)[:100]}"}}'
        )
import os
from dotenv import load_dotenv
from google import genai
from google.genai import types
from google.genai import errors

# Load environment variables from .env
load_dotenv()

# Retrieve API key from environment variable
api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY is missing from .env")

# Initialize Gemini Client
client = genai.Client(
    api_key=api_key,
    http_options=types.HttpOptions(
        timeout=30000
    )
)

try:
    print("Calling Gemini API...")
    response = client.models.generate_content(
        model="gemini-3.5-flash-lite",
        contents="Explain Python in simple words."
    )
    print("\nResponse:")
    print(response.text)

except Exception as e:
    print(f"\nGemini API error: {e}")
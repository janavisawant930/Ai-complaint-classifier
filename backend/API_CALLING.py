# Sample curl invocation for testing Gemini API using environment variable
# Usage:
#   export GEMINI_API_KEY="your_api_key_here"
#   bash backend/API_CALLING.py

curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent" \
  -H 'Content-Type: application/json' \
  -H "X-goog-api-key: ${GEMINI_API_KEY}" \
  -X POST \
  -d '{
    "contents": [
      {
        "parts": [
          {
            "text": "Explain how AI works in a few words"
          }
        ]
      }
    ]
  }'
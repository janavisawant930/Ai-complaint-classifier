import re
from typing import Dict, Any

# Category definitions and keyword maps
CATEGORY_RULES = {
    "Fraud/Security": {
        "keywords": [
            "fraud", "unauthorized", "scam", "stolen", "hack", "hacked", "phishing",
            "security", "breach", "suspicious", "identity theft", "compromised",
            "unrecognized charge", "fake transaction", "stolen card", "card stolen"
        ],
        "default_priority": "High",
        "base_confidence": 96
    },
    "Billing": {
        "keywords": [
            "payment", "charge", "charged", "refund", "invoice", "billing", "bill",
            "overcharge", "double charged", "deducted", "receipt", "money deducted",
            "tax", "subscription", "pricing", "cost", "fee", "penalty"
        ],
        "default_priority": "High",
        "base_confidence": 94
    },
    "Technical Issues": {
        "keywords": [
            "login", "sign in", "password", "crash", "crashing", "error", "bug",
            "technical", "app not opening", "glitch", "server", "timeout", "freeze",
            "frozen", "loading forever", "blank screen", "failed to load", "api error"
        ],
        "default_priority": "Medium",
        "base_confidence": 91
    },
    "Delivery": {
        "keywords": [
            "delivery", "shipping", "arrive", "package", "courier", "delayed",
            "not delivered", "tracking", "dispatch", "shipment", "late delivery",
            "wrong address", "transit", "lost package", "order not received"
        ],
        "default_priority": "Medium",
        "base_confidence": 89
    },
    "Account": {
        "keywords": [
            "account", "profile", "phone number", "email update", "verification",
            "otp", "kyc", "deactivate", "delete account", "change number", "locked",
            "reset password", "personal details", "profile picture"
        ],
        "default_priority": "Low",
        "base_confidence": 93
    },
    "Product/Service": {
        "keywords": [
            "product", "service", "damaged", "broken", "quality", "defective",
            "faulty", "poor quality", "item broken", "bad service", "wrong item",
            "warranty", "replacement", "missing parts", "not working"
        ],
        "default_priority": "High",
        "base_confidence": 95
    }
}

# High urgency indicators
URGENCY_KEYWORDS = [
    "urgent", "immediately", "emergency", "critical", "asap", "severe", "legal",
    "police", "court", "threat", "huge loss", "lawyer"
]

def classify_complaint(text: str) -> Dict[str, Any]:
    """
    AI NLP Classifier for customer complaints.
    Analyzes input text and classifies it into Category, Priority, and Confidence Score.
    """
    if not text or not isinstance(text, str):
        return {
            "category": "Other",
            "priority": "Medium",
            "confidence": 80,
            "matched_keywords": []
        }

    normalized_text = text.lower()
    scores = {}
    matched_by_category = {}

    for category, config in CATEGORY_RULES.items():
        score = 0
        matches = []
        for kw in config["keywords"]:
            # Use regex word boundary or exact phrase match
            pattern = r'\b' + re.escape(kw) + r'\b' if ' ' not in kw else re.escape(kw)
            if re.search(pattern, normalized_text):
                score += len(kw.split()) * 2  # Give higher weight to multi-word phrases
                matches.append(kw)
        
        if score > 0:
            scores[category] = score
            matched_by_category[category] = matches

    if not scores:
        # Fallback to general classification
        return {
            "category": "Other",
            "priority": "Medium",
            "confidence": 82,
            "matched_keywords": []
        }

    # Best matching category
    best_category = max(scores, key=scores.get)
    category_config = CATEGORY_RULES[best_category]
    base_confidence = category_config["base_confidence"]
    priority = category_config["default_priority"]
    matched_keywords = matched_by_category.get(best_category, [])

    # Adjust confidence slightly based on number of matched signals (capped between 85% and 98%)
    match_count = len(matched_keywords)
    confidence = min(98, max(85, base_confidence + min(match_count - 1, 3)))

    # Urgency override for priority
    has_urgent_signal = any(
        re.search(r'\b' + re.escape(u) + r'\b', normalized_text)
        for u in URGENCY_KEYWORDS
    )
    if has_urgent_signal:
        priority = "High"
        confidence = min(98, confidence + 2)

    return {
        "category": best_category,
        "priority": priority,
        "confidence": int(confidence),
        "matched_keywords": matched_keywords
    }

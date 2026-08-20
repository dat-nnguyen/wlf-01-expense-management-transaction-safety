import re
from typing import Dict

# Common merchant aliases mapping to clean canonical names
MERCHANT_MAPPINGS: Dict[str, str] = {
    r"netflix": "Netflix",
    r"spotify": "Spotify",
    r"chatgpt|openai": "OpenAI ChatGPT",
    r"amzn|amazon": "Amazon",
    r"apple\.com|itunes": "Apple",
    r"google\*|youtube": "Google",
    r"github": "GitHub",
    r"adobe": "Adobe",
    r"uber": "Uber",
    r"grab": "Grab",
    r"starbucks": "Starbucks",
}


def normalize_merchant_name(raw_merchant: str) -> str:
    """Clean raw merchant descriptor from statement strings."""
    if not raw_merchant:
        return "Unknown Merchant"

    cleaned = raw_merchant.strip()
    # Check regex patterns
    for pattern, canonical in MERCHANT_MAPPINGS.items():
        if re.search(pattern, cleaned, re.IGNORECASE):
            return canonical

    # Clean generic prefixes/suffixes like *123, .COM, INC, LTD
    cleaned = re.sub(r"[\*#]\s*\d+", "", cleaned)
    cleaned = re.sub(r"(?i)\b(inc|llc|ltd|corp|corporation|\.com)\b", "", cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned.title() if cleaned else raw_merchant.strip()


def normalize_amount(amount: float | str) -> float:
    """Ensure positive absolute float amount."""
    if isinstance(amount, str):
        cleaned = amount.replace("$", "").replace(",", "").strip()
        return abs(float(cleaned))
    return abs(float(amount))

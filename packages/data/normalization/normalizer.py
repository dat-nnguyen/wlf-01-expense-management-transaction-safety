import re
from typing import Dict, Tuple, Optional

# Rich merchant dictionary with normalized names and clear explanations
MERCHANT_DICTIONARY: Dict[str, Dict[str, str]] = {
    r"netflix": {
        "name": "Netflix",
        "explanation": "Dịch vụ phát trực tuyến phim và chương trình giải trí (Streaming Subscription).",
    },
    r"spotify": {
        "name": "Spotify",
        "explanation": "Dịch vụ nghe nhạc và podcast trực tuyến định kỳ (Music Streaming Subscription).",
    },
    r"chatgpt|openai": {
        "name": "OpenAI ChatGPT",
        "explanation": "Phí thuê bao trí tuệ nhân tạo OpenAI ChatGPT Plus / API.",
    },
    r"amzn|amazon(?:\s+mktp)?": {
        "name": "Amazon",
        "explanation": "Thanh toán mua sắm hàng hóa hoặc dịch vụ trên sàn thương mại điện tử Amazon.",
    },
    r"apple(?:\.com)?|itunes|app\s*store": {
        "name": "Apple Services",
        "explanation": "Thanh toán mua ứng dụng, dịch vụ iCloud hoặc nội dung số trên hệ sinh thái Apple.",
    },
    r"google\*(?:ads|services|cloud|yt|youtube)": {
        "name": "Google Services",
        "explanation": "Thanh toán dịch vụ quảng cáo Google Ads, YouTube Premium hoặc lưu trữ đám mây Google Cloud.",
    },
    r"google(?:\s+ads)?": {
        "name": "Google Ads",
        "explanation": "Chi phí chạy chiến dịch quảng cáo tìm kiếm và hiển thị Google Ads.",
    },
    r"facebook(?:\s+\*ads)?|meta\s+ads|facebk": {
        "name": "Facebook Ads (Meta)",
        "explanation": "Chi phí thanh toán chiến dịch quảng cáo trên nền tảng Facebook & Instagram Ads.",
    },
    r"tiktok(?:\s+ads)?": {
        "name": "TikTok Ads",
        "explanation": "Chi phí thanh toán chiến dịch quảng cáo trên mạng xã hội TikTok.",
    },
    r"github": {
        "name": "GitHub",
        "explanation": "Phí dịch vụ lưu trữ mã nguồn và công cụ lập trình GitHub Copilot / Team.",
    },
    r"adobe": {
        "name": "Adobe Creative Cloud",
        "explanation": "Phí bản quyền phần mềm thiết kế đồ họa Adobe Creative Cloud (Photoshop, Illustrator...).",
    },
    r"aws|amazon\s+web\s+services": {
        "name": "Amazon Web Services (AWS)",
        "explanation": "Chi phí thuê máy chủ đám mây và hạ tầng công nghệ thông tin AWS.",
    },
    r"canva": {
        "name": "Canva Pro",
        "explanation": "Gói thuê bao phần mềm thiết kế đồ họa trực tuyến Canva Pro.",
    },
    r"figma": {
        "name": "Figma",
        "explanation": "Gói thuê bao công cụ thiết kế giao diện UI/UX cộng tác Figma.",
    },
    r"notion": {
        "name": "Notion",
        "explanation": "Phí phần mềm quản lý công việc, ghi chú và cơ sở dữ liệu Notion Plus.",
    },
    r"midjourney": {
        "name": "Midjourney",
        "explanation": "Gói thuê bao tạo hình ảnh bằng trí tuệ nhân tạo Midjourney AI.",
    },
    r"dropbox": {
        "name": "Dropbox",
        "explanation": "Gói dung lượng lưu trữ tệp đám mây Dropbox.",
    },
    r"uber": {
        "name": "Uber",
        "explanation": "Dịch vụ gọi xe di chuyển hoặc đặt đồ ăn Uber / UberEats.",
    },
    r"grab": {
        "name": "Grab",
        "explanation": "Dịch vụ vận chuyển hành khách hoặc giao hàng / đồ ăn Grab.",
    },
    r"starbucks": {
        "name": "Starbucks",
        "explanation": "Thanh toán đồ uống và dịch vụ tại chuỗi cửa hàng Starbucks.",
    },
    r"stripe(?:\s+payout)?": {
        "name": "Stripe Payout",
        "explanation": "Tiền giải ngân doanh thu bán hàng trực tuyến qua cổng thanh toán Stripe.",
    },
    r"shopify(?:\s+payout)?": {
        "name": "Shopify Payout",
        "explanation": "Doanh thu thanh toán giải ngân từ sàn thương mại điện tử Shopify.",
    },
    r"payoneer(?:\s+payout)?": {
        "name": "Payoneer Payout",
        "explanation": "Doanh thu thanh toán giải ngân quốc tế từ cổng Payoneer.",
    },
    r"pingpong(?:\s+payout)?": {
        "name": "PingPong Payout",
        "explanation": "Doanh thu thanh toán giải ngân bán hàng quốc tế từ PingPong Payments.",
    },
    r"paddle(?:\.net)?": {
        "name": "Paddle.net",
        "explanation": "Cổng thanh toán và đăng ký phần mềm số định kỳ Paddle.net.",
    },
    r"volcano": {
        "name": "Volcano Ads / Virtual Card Top-up",
        "explanation": "Giao dịch nạp số dư chạy quảng cáo và phát hành thẻ ảo Volcano.",
    },
    r"atm\s+fee|service\s+fee|monthly\s+fee|overdraft": {
        "name": "Phí Dịch Vụ Ngân Hàng",
        "explanation": "Phí duy trì tài khoản, phí rút tiền ATM hoặc phí giao dịch ngân hàng phát hành.",
    },
    r"wallet\s+topup|nap\s+vi|wealify\s+wallet": {
        "name": "Wealify Wallet Top-up",
        "explanation": "Giao dịch chuyển tiền nạp vào số dư ví Wealify.",
    },
}


def normalize_merchant(raw_merchant: Optional[str]) -> Tuple[str, str]:
    """
    Normalizes merchant name and provides detailed explanation.
    Returns (normalized_name, explanation).
    If merchant cannot be determined, returns ("Chưa xác định được", explanation).
    """
    if not raw_merchant or not str(raw_merchant).strip():
        return ("Chưa xác định được", "Không có thông tin mô tả đơn vị thụ hưởng trong dữ liệu sao kê.")

    cleaned = str(raw_merchant).strip()
    
    # Check regex patterns
    for pattern, info in MERCHANT_DICTIONARY.items():
        if re.search(pattern, cleaned, re.IGNORECASE):
            return (info["name"], info["explanation"])

    # Attempt basic cleaning
    simple = re.sub(r"[\*#]\s*\d+", "", cleaned)
    simple = re.sub(r"(?i)\b(inc|llc|ltd|corp|corporation|\.com)\b", "", simple)
    simple = re.sub(r"\s+", " ", simple).strip()

    # If it looks like a generic code or unknown
    if (
        not simple
        or len(simple) <= 2
        or any(u in simple.lower() for u in ["unknown", "n/a", "none", "null", "chưa xác định", "unidentifiable"])
        or ("_" in simple and not re.search(r"[a-zA-Z]{4,}\s+[a-zA-Z]{4,}", simple))
    ):
        return ("Chưa xác định được", "Mã giao dịch hoặc tên đơn vị thụ hưởng chưa có trong cơ sở dữ liệu định danh.")

    # Return cleaned name with fallback explanation
    return (simple.title(), f"Giao dịch thanh toán tại {simple.title()} (Chưa có phân loại chi tiết).")



def normalize_merchant_name(raw_merchant: Optional[str]) -> str:
    """Clean raw merchant descriptor from statement strings."""
    name, _ = normalize_merchant(raw_merchant)
    return name


def explain_merchant_descriptor(raw_merchant: Optional[str]) -> str:
    """Explain obscure merchant descriptor or return fallback."""
    name, exp = normalize_merchant(raw_merchant)
    if name == "Chưa xác định được":
        return "Chưa xác định được"
    return exp



from packages.data.schemas.transaction import TransactionType


def classify_transaction_type(
    description: str,
    amount: float,
    direction: str = "debit",
    raw_type: str = "",
) -> TransactionType:
    """Classifies a transaction into Pay-in, Payout, Transfer to card, Fee, Subscription, Card purchase, Ad spend."""
    d_lower = (description or "").lower()
    t_lower = (raw_type or "").lower()

    if (
        (("transfer" in d_lower or "chuyển" in d_lower or "topup" in d_lower or "nạp" in d_lower) and ("card" in d_lower or "thẻ" in d_lower))
        or any(k in t_lower or k in d_lower for k in ["transfer to card", "topup card", "nap the", "sang the", "nạp thẻ", "transfer to volcano"])
    ):
        return TransactionType.TRANSFER_TO_CARD
    if any(ad in d_lower for ad in ["facebook *ads", "google *ads", "tiktok ads", "meta ads", "facebk", "facebook ads"]):
        return TransactionType.AD_SPEND

    if "sub" in t_lower or any(s in d_lower for s in ["netflix", "adobe", "openai", "chatgpt", "spotify", "canva", "figma", "notion"]):
        return TransactionType.SUBSCRIPTION
    if "fee" in t_lower or any(k in d_lower for k in ["fee", "phí", "atm", "service charge", "maintenance"]):
        return TransactionType.FEE
    if "payout" in t_lower or "payout" in d_lower:
        return TransactionType.PAYOUT
    if "payin" in t_lower or direction.lower() in ["credit", "in", "deposit", "receive", "cộng"]:
        return TransactionType.PAYIN
    if "card" in t_lower:
        return TransactionType.CARD_PURCHASE
    return TransactionType.EXPENSE if direction.lower() == "debit" else TransactionType.PAYIN


def normalize_amount(amount: float | str) -> float:
    """Ensure positive absolute float amount."""
    if isinstance(amount, str):
        cleaned = amount.replace("$", "").replace(",", "").replace("₫", "").replace("VND", "").strip()
        try:
            return abs(float(cleaned))
        except ValueError:
            return 0.0
    try:
        return abs(float(amount))
    except (ValueError, TypeError):
        return 0.0



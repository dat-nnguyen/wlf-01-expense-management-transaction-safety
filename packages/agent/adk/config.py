"""Google Agent Development Kit (ADK) Configuration for Wealify Guardian.

Manages LLM model resolution, timeout configs, and system-wide instructions
strictly adhering to the 10 Golden Safety Invariants of the WLF-01 challenge.
"""

import os
from typing import Optional


def get_adk_model_name() -> str:
    """
    Dynamically resolves the LLM model identifier for Google ADK.
    Prioritizes explicit LLM_MODEL, Gemini direct, or OpenRouter models.
    """
    model = os.getenv("LLM_MODEL")
    if model:
        return model

    provider = os.getenv("LLM_PROVIDER", "gemini").lower()
    if provider == "gemini":
        return "gemini-2.0-flash"
    elif provider == "openai":
        return "openai/gpt-4o-mini"
    elif provider == "claude":
        return "anthropic/claude-3-5-sonnet-20241022"
    elif provider == "deepseek":
        return "deepseek/deepseek-chat"
    elif provider == "openrouter":
        return "openai/gpt-4o-mini"
    
    return "gemini-2.0-flash"


def configure_adk_environment() -> None:
    """
    Ensures environment variables (OpenRouter, Gemini, OpenAI) are properly
    mapped for Google ADK and LiteLLM runners.
    """
    openrouter_key = os.getenv("OPENROUTER_API_KEY")
    if openrouter_key and openrouter_key != "sk-or-v1-your_openrouter_api_key_here":
        os.environ["OPENAI_API_KEY"] = openrouter_key
        os.environ["OPENAI_API_BASE"] = "https://openrouter.ai/api/v1"

    gemini_key = os.getenv("GEMINI_API_KEY")
    if gemini_key and gemini_key != "your_gemini_api_key_here":
        os.environ["GOOGLE_API_KEY"] = gemini_key


# ==============================================================================
# WLF-01 10 GOLDEN INVARIANTS SYSTEM INSTRUCTION
# ==============================================================================

GUARDIAN_ROOT_INSTRUCTION = """
Bạn là Wealify Guardian — Trợ lý AI Quản lý Chi tiêu & An toàn Giao dịch (AI Expense Management & Transaction Safety Copilot) được xây dựng theo chuẩn Google Agent Development Kit (ADK 2.4.0).

BẠN ĐIỀU PHỐI CÁC SUB-AGENTS VÀ CÔNG CỤ TÀI CHÍNH ĐỂ HỖ TRỢ DOANH NGHIỆP THƯƠNG MẠI ĐIỆN TỬ XUYÊN BIÊN GIỚI (CROSS-BORDER E-COMMERCE & SMES).

10 NGUYÊN TẮC BẤT BIẾN THEO QUY CHUẨN ĐỀ THI WLF-01:
1. Ranh giới Read-Only: Tuyệt đối KHÔNG tự ý thực hiện giao dịch chuyển tiền, KHÔNG tự hủy gói dịch vụ, KHÔNG tự mở khiếu nại/chargeback, KHÔNG khóa/mở thẻ. Mọi hành động chỉ mang tính chất hướng dẫn và soạn thảo bản nháp (Draft) để người dùng tự quyết định.
2. Email Báo Cáo & Tự Gửi: Chỉ gửi email báo cáo tới CHÍNH ĐỊA CHỈ EMAIL CỦA NGƯỜI DÙNG khi có yêu cầu và PHẢI XÁC NHẬN (Confirm) trước khi gửi. CẤM tự ý gửi email cho ngân hàng, cửa hàng hoặc bên thứ ba.
3. Ba nhãn phân loại chuẩn bắt buộc: Mỗi cảnh báo hoặc phát hiện phải được gắn chính xác 1 trong 3 nhãn:
   - 'Định kỳ đã xác định' (Identified Recurring)
   - 'Cần bạn tự xác nhận' (Needs your confirmation)
   - 'Chưa đủ dữ liệu' (Insufficient data)
   Tuyệt đối không phán quyết chắc chắn "100% gian lận" hoặc "100% lừa đảo".
4. Mốc hạn khiếu nại quy định 60 ngày: Mọi giao dịch đáng ngờ/lệch lạc phải nhắc nhở mốc hạn khiếu nại 60 ngày theo luật Ngân hàng Mỹ (Regulation E) kể từ ngày nhận sao kê.
5. CẤM câu trấn an tuyệt đối: Không bao giờ nói 'Tài khoản của bạn an toàn tuyệt đối' hoặc 'Không có gì bất thường'. Khi người dùng hỏi về an toàn, giải thích rõ: 'Hệ thống chỉ có thể chỉ ra những giao dịch có dấu hiệu cần kiểm tra dựa trên dữ liệu hiện có, không đưa ra kết luận an toàn tuyệt đối.'
6. Khi 3 nguồn lệch nhau (Account <-> Wallet <-> Card), phải diễn giải chính xác: 'Lệch $X giữa [Nguồn A] và [Nguồn B] — chưa xác định nguyên nhân.'
7. Tên cửa hàng / Đơn vị thụ hưởng: Nếu không nhận diện được rõ ràng, ghi 'Chưa xác định được', không đoán bừa.
8. Giữ an toàn bảo mật: Che số thẻ (chỉ hiện 4 số cuối) và số tài khoản, không bao giờ hiện hay lưu mã CVV 3 số.
9. Hỗ trợ song ngữ chuẩn mực: Tự động phát hiện và phản hồi chuẩn xác bằng tiếng Việt hoặc tiếng Anh tương ứng với ngôn ngữ của người dùng.
10. Phong cách chuyên nghiệp & thực dụng: Trực diện vào số liệu và bảng biểu phân tích, súc tích, không chèn emoji rườm rà, tập trung giải quyết bài toán tài chính cho doanh nghiệp.
"""

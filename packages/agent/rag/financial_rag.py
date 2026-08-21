"""Financial RAG (Retrieval-Augmented Generation) Engine for Wealify Guardian.

Grounds all AI responses in Canonical Financial Records, 148-Email Evidence Corpus,
Merchant Knowledge Base, and 60-day US Banking Dispute Regulations (Regulation E).
"""

import re
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from packages.connectors.mock.mock_sources import MockTransactionSource, MockEmailSource
from packages.connectors.excel_inbox_connector import ExcelInboxConnector


class RAGDocument(BaseModel):
    id: str
    category: str  # 'TRANSACTION', 'EMAIL_EVIDENCE', 'MERCHANT_KNOWLEDGE', 'BANKING_REGULATION'
    title: str
    content: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
    score: float = 0.0


# ==============================================================================
# FINANCIAL KNOWLEDGE BASE (Merchant Disambiguation & Banking Regulations)
# ==============================================================================

MERCHANT_KNOWLEDGE_BASE = [
    {
        "id": "KB-MKT-001",
        "merchant_raw": "AMZN MKTP US",
        "merchant_clean": "Amazon Marketplace US",
        "description": "Các khoản thanh toán mua hàng hoặc phí tài khoản bán hàng trên sàn thương mại điện tử Amazon.",
        "category": "E-Commerce / Retail",
    },
    {
        "id": "KB-MKT-002",
        "merchant_raw": "FACEBK *ADS",
        "merchant_clean": "Meta Facebook Ads",
        "description": "Chi phí chạy quảng cáo trực tuyến trên Facebook / Instagram. Thường phát sinh tự động khi đạt ngưỡng chi tiêu (Threshold) hoặc cuối tháng.",
        "category": "Digital Advertising",
    },
    {
        "id": "KB-MKT-003",
        "merchant_raw": "GOOGLE *ADS / GOOGLE *CLOUD",
        "merchant_clean": "Google Ads / Google Cloud Platform",
        "description": "Chi phí dịch vụ hạ tầng đám mây Google Cloud hoặc ngân sách quảng cáo tìm kiếm Google Ads.",
        "category": "Cloud & Advertising",
    },
    {
        "id": "KB-MKT-004",
        "merchant_raw": "PAYPAL *NETFLIX",
        "merchant_clean": "Netflix Streaming Subscription via PayPal",
        "description": "Gói đăng ký xem phim định kỳ hàng tháng của Netflix được thanh toán ủy quyền qua cổng PayPal.",
        "category": "Subscription SaaS",
    },
    {
        "id": "KB-MKT-005",
        "merchant_raw": "OPENAI *CHATGPT",
        "merchant_clean": "OpenAI ChatGPT Plus Subscription",
        "description": "Gói thuê bao $20/tháng cho dịch vụ trí tuệ nhân tạo ChatGPT Plus của OpenAI.",
        "category": "AI / SaaS Subscription",
    },
    {
        "id": "KB-MKT-006",
        "merchant_raw": "STRIPE *PAYOUT / AMAZON DISBURSEMENT",
        "merchant_clean": "E-Commerce Seller Payout Settlement",
        "description": "Khoản giải ngân doanh thu bán hàng từ cổng thanh toán Stripe hoặc sàn Amazon về tài khoản ngân hàng Wealify.",
        "category": "Payout / Settlement",
    },
]

BANKING_REGULATION_KNOWLEDGE = [
    {
        "id": "KB-REG-001",
        "title": "Thời hạn tra soát khiếu nại 60 ngày (Regulation E - Electronic Fund Transfers)",
        "content": (
            "Theo quy định của Luật Chuyển tiền Điện tử Hoa Kỳ (Regulation E) và quy chế hiệp hội thẻ Visa/Mastercard, "
            "khách hàng có tối đa 60 ngày kể từ ngày ngân hàng phát hành gửi sao kê định kỳ để gửi yêu cầu tra soát hoặc khiếu nại (Dispute/Chargeback). "
            "Sau 60 ngày, ngân hàng có quyền từ chối thụ lý hồ sơ hoàn tiền."
        ),
    },
    {
        "id": "KB-REG-002",
        "title": "Quy chuẩn đối chiếu 3 nguồn độc lập (3-Way Reconciliation)",
        "content": (
            "Một giao dịch tài chính chỉ được xem là hoàn tất và hợp lệ khi khớp cả 3 chiều: "
            "(1) Sổ cái ghi có ngân hàng (Ledger), (2) Biến động số dư ví thực tế (Wallet Balance), và (3) Thông báo/Biên lai xác thực (Email Evidence)."
        ),
    },
    {
        "id": "KB-REG-003",
        "title": "Nguyên tắc nhận diện mạo danh Phishing (Homograph Attack)",
        "content": (
            "Kẻ gian thường tạo tên miền giống hệt Wealify bằng cách thay thế chữ cái bằng chữ số (ví dụ: wea1ify-support.com dùng số 1 thay chữ l) "
            "để gửi email giả mạo yêu cầu chuyển tiền hoặc thông báo trúng thưởng. Hệ thống luôn gắn cờ mức rủi ro CAO (Phishing Threat)."
        ),
    },
]


class FinancialRAGEngine:
    """
    Retrieval-Augmented Generation Engine for Financial Evidence & Knowledge.
    Performs keyword & lexical similarity matching across transactions, emails, and merchant KB.
    """

    def __init__(self):
        self.tx_source = MockTransactionSource()
        self.email_source = MockEmailSource()
        self.excel_inbox = ExcelInboxConnector()

    def search_evidence(self, query: str, top_k: int = 4) -> List[RAGDocument]:
        """
        Retrieves relevant financial context across all corpora based on query.
        """
        results: List[RAGDocument] = []
        tokens = set(re.findall(r"\w+", query.lower()))
        if not tokens:
            return results

        # 1. Search Merchant Knowledge Base
        for kb in MERCHANT_KNOWLEDGE_BASE:
            score = self._calc_similarity(tokens, f"{kb['merchant_raw']} {kb['merchant_clean']} {kb['description']}")
            if score > 0.1:
                results.append(RAGDocument(
                    id=kb["id"],
                    category="MERCHANT_KNOWLEDGE",
                    title=kb["merchant_clean"],
                    content=f"Tên viết tắt: `{kb['merchant_raw']}` | Phân loại: {kb['category']}. {kb['description']}",
                    score=score + 0.3,  # Boost KB relevance
                ))

        # 2. Search Banking Regulations
        for reg in BANKING_REGULATION_KNOWLEDGE:
            score = self._calc_similarity(tokens, f"{reg['title']} {reg['content']}")
            if score > 0.1:
                results.append(RAGDocument(
                    id=reg["id"],
                    category="BANKING_REGULATION",
                    title=reg["title"],
                    content=reg["content"],
                    score=score + 0.2,
                ))

        # 3. Search Email Evidence (from verified email records)
        emails = self.email_source._emails
        for em in emails:
            snippet = em.body_snippet or em.subject
            text = f"{em.sender} {em.subject} {snippet} {em.merchant or ''} {em.amount or ''}"
            score = self._calc_similarity(tokens, text)
            if score > 0.15:
                results.append(RAGDocument(
                    id=em.id,
                    category="EMAIL_EVIDENCE",
                    title=em.subject,
                    content=f"Từ: {em.sender} | Số tiền: ${em.amount or 0:.2f} | Trích lục: {snippet}",
                    metadata={"sender": em.sender, "merchant": em.merchant, "amount": em.amount},
                    score=score,
                ))

        # 4. Search Card / Account Transactions
        txs = self.tx_source._data
        for tx in txs:
            text = f"{tx.merchant_raw} {tx.merchant_normalized or ''} {tx.amount} {tx.source} {tx.source_reference or ''}"
            score = self._calc_similarity(tokens, text)
            if score > 0.15:
                results.append(RAGDocument(
                    id=tx.id,
                    category="TRANSACTION",
                    title=tx.merchant_raw,
                    content=f"Giao dịch ${tx.amount:,.2f} USD ({tx.direction.value}) tại '{tx.merchant_raw}' trên nguồn {tx.source} ngày {tx.occurred_at.strftime('%Y-%m-%d')}",
                    metadata={"amount": tx.amount, "merchant": tx.merchant_raw, "source": tx.source},
                    score=score,
                ))

        # Sort by score descending and return top_k
        results.sort(key=lambda x: x.score, reverse=True)
        return results[:top_k]

    def get_grounding_context(self, query: str) -> str:
        """
        Builds a structured grounding context block ready to inject into the LLM prompt.
        """
        docs = self.search_evidence(query, top_k=3)
        if not docs:
            return ""

        lines = ["--- Căn cứ Dữ liệu & Tri thức Đối soát Tài chính (RAG Grounding) ---"]
        for idx, doc in enumerate(docs, 1):
            lines.append(f"[{idx}] [{doc.category}] {doc.title}:\n    {doc.content}")
        lines.append("-----------------------------------------------------------------")
        return "\n".join(lines)

    @staticmethod
    def _calc_similarity(query_tokens: set, document_text: str) -> float:
        doc_tokens = set(re.findall(r"\w+", document_text.lower()))
        if not doc_tokens:
            return 0.0
        intersection = query_tokens.intersection(doc_tokens)
        return len(intersection) / (len(query_tokens) + 0.5)


# Global Singleton RAG Engine
financial_rag = FinancialRAGEngine()

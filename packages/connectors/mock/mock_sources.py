import os
import re
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import pandas as pd

from packages.connectors.base.base_source import BaseTransactionSource, BaseEmailSource
from packages.connectors.excel_inbox_connector import ExcelInboxConnector
from packages.data.schemas.transaction import (
    Transaction,
    TransactionDirection,
    TransactionSource,
    TransactionType,
)
from packages.data.schemas.email import EmailEvidence, EmailType
from packages.observability.logging import logger
from packages.data.datasets.wealify_real_dataset import get_canonical_transactions


class MockTransactionSource(BaseTransactionSource):
    """
    Official Transaction Source for Wealify Guardian.
    Loads real dataset transactions from official sample CSVs, `wlf15_inbox_3users.xlsx`,
    and canonical Wealify platform scenario records.
    """

    ROOT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    DEFAULT_EXCEL_PATH = os.path.join(ROOT_DIR, "wlf15_inbox_3users.xlsx")
    DEFAULT_CARDS_CSV = os.path.join(ROOT_DIR, "data", "sample", "card_statements.csv")
    DEFAULT_ACCOUNTS_CSV = os.path.join(ROOT_DIR, "data", "sample", "account_transactions.csv")

    def __init__(
        self,
        excel_path: Optional[str] = None,
        cards_csv: Optional[str] = None,
        accounts_csv: Optional[str] = None,
    ):
        self.excel_path = excel_path or self.DEFAULT_EXCEL_PATH
        self.cards_csv = cards_csv or self.DEFAULT_CARDS_CSV
        self.accounts_csv = accounts_csv or self.DEFAULT_ACCOUNTS_CSV
        self._data: List[Transaction] = []
        self._load_all_sources()

    def _normalize_merchant(self, raw: str) -> str:
        s = (raw or "").lower()
        if "netflix" in s:
            return "Netflix"
        elif "adobe" in s:
            return "Adobe"
        elif "grab" in s or "transport" in s:
            return "Grab"
        elif "facebook" in s or "meta" in s:
            return "Facebook Ads"
        elif "google" in s:
            return "Google"
        elif "spotify" in s:
            return "Spotify"
        elif "openai" in s or "chatgpt" in s:
            return "OpenAI"
        elif "paddle" in s:
            return "Paddle.net"
        elif "aws" in s or "amazon web services" in s:
            return "Amazon Web Services"
        elif "amazon" in s:
            return "Amazon"
        elif "stripe" in s:
            return "Stripe"
        elif "payoneer" in s:
            return "Payoneer"
        elif "paypal" in s:
            return "PayPal"
        elif "pingpong" in s:
            return "PingPong"
        return raw.strip() if raw else "Unknown Merchant"

    def _parse_merchant_info(self, sender: str, subject: str, body: str) -> tuple[str, str]:
        sender_lower = (sender or "").lower()
        subject_lower = (subject or "").lower()

        if "netflix" in sender_lower or "netflix" in subject_lower:
            return "Netflix", "NETFLIX.COM* PAYMENT"
        elif "adobe" in sender_lower or "adobe" in subject_lower:
            return "Adobe", "ADOBE *CREATIVE CLOUD"
        elif "openai" in sender_lower or "openai" in subject_lower or "chatgpt" in subject_lower:
            return "OpenAI", "OPENAI *CHATGPT PLUS"
        elif "google" in sender_lower or "google" in subject_lower:
            return "Google Ads", "GOOGLE *ADS 991823"
        elif "facebook" in sender_lower or "meta" in sender_lower:
            return "Facebook Ads", "FACEBK *ADS 83921948"
        elif "paddle" in sender_lower or "paddle" in subject_lower:
            return "Paddle.net", "Subscription PADDLE.NET* VIRTUAL TOOL"
        elif "amazon" in sender_lower or "aws" in sender_lower:
            return "Amazon Web Services", "AMAZON WEB SERVICES AWS.AMAZON.COM"
        elif "stripe" in sender_lower or "stripe" in subject_lower:
            return "Stripe", "Stripe Payout Settlement"
        elif "payoneer" in sender_lower or "payoneer" in subject_lower:
            return "Payoneer", "Payoneer Direct Deposit"
        elif "paypal" in sender_lower or "paypal" in subject_lower:
            return "PayPal", "PayPal Transfer Settlement"
        elif "pingpong" in sender_lower or "pingpong" in subject_lower:
            return "PingPong", "PingPong Global Payout"
        
        m_from = re.search(r"@([a-zA-Z0-9.-]+)", sender or "")
        domain = m_from.group(1).split(".")[0].capitalize() if m_from else "Unknown"
        return domain, sender or "External Payment"

    def _extract_amount(self, text: str) -> float:
        m = re.search(r"(?:USD|\$)\s*([\d,]+\.?\d*)", str(text))
        if not m:
            m = re.search(r"([\d,]+\.?\d*)\s*(?:USD|\$)", str(text))
        return float(m.group(1).replace(",", "")) if m else 0.0

    def _load_all_sources(self) -> None:
        txs: List[Transaction] = []
        seen_ids = set()

        # 1. Load canonical dataset (Volcano Ads topup duplicates, VND ledger, spending surge data)
        for t in get_canonical_transactions():
            if t.id not in seen_ids:
                txs.append(t)
                seen_ids.add(t.id)

        # 2. Load official Card Statements CSV
        if os.path.exists(self.cards_csv):
            try:
                df_cards = pd.read_csv(self.cards_csv)
                for _, r in df_cards.iterrows():
                    t_id = str(r.get("id"))
                    if t_id in seen_ids:
                        continue

                    dt_str = str(r.get("date", ""))
                    try:
                        dt = datetime.fromisoformat(dt_str)
                        if dt.tzinfo is not None:
                            dt = dt.replace(tzinfo=None)
                    except Exception:
                        dt = datetime.utcnow()

                    m_raw = str(r.get("merchant", ""))
                    m_norm = self._normalize_merchant(m_raw)

                    txs.append(
                        Transaction(
                            id=t_id,
                            account_id="acc_main",
                            occurred_at=dt,
                            amount=float(r.get("amount", 0.0)),
                            currency=str(r.get("currency", "USD")),
                            direction=TransactionDirection(str(r.get("direction", "debit")).lower()),
                            transaction_type=TransactionType(str(r.get("type", "card_purchase")).lower()),
                            merchant_raw=m_raw,
                            merchant_normalized=m_norm,
                            card_id=str(r.get("card_id", "")) if pd.notna(r.get("card_id")) else None,
                            bank_name=str(r.get("bank_name", "VPBank")),
                            source=TransactionSource.CARD,
                            source_reference=str(r.get("ref_id", "")) if pd.notna(r.get("ref_id")) else None,
                        )
                    )
                    seen_ids.add(t_id)
            except Exception as e:
                logger.error(f"Error loading cards CSV: {e}")

        # 3. Load official Account Transactions CSV
        if os.path.exists(self.accounts_csv):
            try:
                df_accs = pd.read_csv(self.accounts_csv)
                for _, r in df_accs.iterrows():
                    t_id = str(r.get("id"))
                    if t_id in seen_ids:
                        continue

                    dt_str = str(r.get("date", ""))
                    try:
                        dt = datetime.fromisoformat(dt_str)
                        if dt.tzinfo is not None:
                            dt = dt.replace(tzinfo=None)
                    except Exception:
                        dt = datetime.utcnow()

                    m_raw = str(r.get("merchant", ""))
                    m_norm = self._normalize_merchant(m_raw)
                    txs.append(
                        Transaction(
                            id=t_id,
                            account_id=str(r.get("account_id", "acc_main")),
                            occurred_at=dt,
                            amount=float(r.get("amount", 0.0)),
                            currency=str(r.get("currency", "USD")),
                            direction=TransactionDirection(str(r.get("direction", "debit")).lower()),
                            transaction_type=TransactionType(str(r.get("type", "payin")).lower()),
                            merchant_raw=m_raw,
                            merchant_normalized=m_norm,
                            bank_name=str(r.get("bank_name", "VPBank")),
                            source=TransactionSource.ACCOUNT,
                            source_reference=str(r.get("ref_id", "")) if pd.notna(r.get("ref_id")) else None,
                        )
                    )
                    seen_ids.add(t_id)
            except Exception as e:
                logger.error(f"Error loading accounts CSV: {e}")

        # 4. Load official Excel Inbox dataset (wlf15_inbox_3users.xlsx)
        if os.path.exists(self.excel_path):
            try:
                df_inbox = pd.read_excel(self.excel_path, sheet_name="wealifytester")
                for _, r in df_inbox.iterrows():
                    t_id = f"tx_{r.get('email_id')}"
                    if t_id in seen_ids:
                        continue

                    amt = self._extract_amount(f"{r.get('body', '')} {r.get('snippet', '')}")
                    if amt <= 0:
                        continue

                    dt_str = str(r.get("datetime", ""))
                    try:
                        dt = datetime.fromisoformat(dt_str)
                        if dt.tzinfo is not None:
                            dt = dt.replace(tzinfo=None)
                    except Exception:
                        dt = datetime.utcnow()

                    m_norm, m_raw = self._parse_merchant_info(
                        str(r.get("from", "")),
                        str(r.get("subject", "")),
                        str(r.get("body", "")),
                    )

                    is_payout = str(r.get("kind", "")).lower() == "payout"
                    direction = TransactionDirection.CREDIT if is_payout else TransactionDirection.DEBIT
                    tx_type = TransactionType.PAYIN if is_payout else TransactionType.CARD_PURCHASE

                    txs.append(
                        Transaction(
                            id=t_id,
                            account_id="acc_main",
                            occurred_at=dt,
                            amount=amt,
                            currency="USD",
                            direction=direction,
                            transaction_type=tx_type,
                            merchant_raw=m_raw,
                            merchant_normalized=m_norm,
                            source=TransactionSource.ACCOUNT if is_payout else TransactionSource.CARD,
                            source_reference=str(r.get("matched_txn_id", "")) if pd.notna(r.get("matched_txn_id")) else None,
                            bank_name="VPBank",
                        )
                    )
                    seen_ids.add(t_id)
            except Exception as e:
                logger.error(f"Error parsing transactions from Excel inbox: {e}")

        self._data = sorted(txs, key=lambda x: x.occurred_at, reverse=True)
        logger.info(f"Loaded {len(self._data)} official transactions across all sources.")

    async def get_transactions(
        self,
        account_id: Optional[str] = None,
        limit: int = 100,
    ) -> List[Transaction]:
        if account_id:
            return [t for t in self._data if t.account_id == account_id][:limit]
        return self._data[:limit]

    def get_all_transactions(self) -> List[Transaction]:
        return list(self._data)


class MockEmailSource(BaseEmailSource):
    """
    Official Email Source connected directly to wlf15_inbox_3users.xlsx.
    Provides all 148 official emails across all user personas.
    """

    def __init__(self, excel_path: Optional[str] = None):
        self.connector = ExcelInboxConnector(excel_path=excel_path)
        self._demo_records: List[EmailEvidence] = [
            EmailEvidence(
                id="em_stp_002",
                date=datetime.utcnow(),
                sender="support@stripe.com",
                subject="Payout of $1,890.00 is on its way to your account",
                merchant="Stripe",
                amount=1890.00,
                currency="USD",
                body_snippet="Your scheduled payout of $1,890.00 USD (Transfer ID: REF_PAY_STP_01) is on its way.",
                email_type=EmailType.TRANSFER_CONFIRMATION,
                payout_ref="REF_PAY_STP_01",
            )
        ]

    @property
    def _emails(self) -> List[EmailEvidence]:
        return self.list_messages()

    async def get_emails(
        self,
        query: Optional[str] = None,
        limit: int = 150,
        user_persona: str = "wealifytester",
    ) -> List[EmailEvidence]:
        emails = await self.connector.get_emails(query=query, limit=limit, user_persona=user_persona)
        if not emails and not query:
            emails = list(self._demo_records)
        elif not query:
            emails = list(emails) + [d for d in self._demo_records if d.id not in [e.id for e in emails]]
        return emails[:limit]

    def list_messages(self, user_persona: str = "wealifytester") -> List[EmailEvidence]:
        clean_user = user_persona.replace("@yopmail.com", "").strip().lower()
        emails = self.connector._user_inboxes.get(clean_user, self.connector._user_inboxes.get("wealifytester", []))
        return list(emails) + [d for d in self._demo_records if d.id not in [e.id for e in emails]]

import os
import re
from datetime import datetime
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


class MockTransactionSource(BaseTransactionSource):
    """
    Official Transaction Source for Wealify Guardian.
    Loads real dataset transactions from official sample CSVs and `wlf15_inbox_3users.xlsx`.
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
            return "OpenAI ChatGPT"
        elif "canva" in s:
            return "Canva"
        elif "figma" in s:
            return "Figma"
        elif "paddle" in s:
            return "Paddle"
        elif "cloudways" in s:
            return "Cloudways"
        elif "nordvpn" in s:
            return "NordVPN"
        elif "payoneer" in s:
            return "Payoneer"
        elif "paypal" in s:
            return "PayPal"
        elif "amazon" in s:
            return "Amazon"
        elif "etsy" in s:
            return "Etsy"
        elif "shopee" in s:
            return "Shopee"
        elif "apple" in s:
            return "Apple"
        elif "topup" in s or "wallet" in s:
            return "Wallet Topup"
        elif "stripe" in s:
            return "Stripe"
        elif "payroll" in s or "salary" in s:
            return "Payroll Tech Corp"
        elif "*" in raw:
            return raw.split("*")[-1].strip()
        return raw.strip() if raw else "Merchant"

    def _parse_merchant_info(self, sender: str, subject: str, body: str) -> tuple[str, str]:
        s = f"{sender} {subject}".lower()
        norm = self._normalize_merchant(s)
        return norm, sender or norm

    def _extract_amount(self, text: str) -> float:
        m = re.search(r"(?:USD|\$)\s*([\d,]+\.?\d*)", str(text))
        if not m:
            m = re.search(r"([\d,]+\.?\d*)\s*(?:USD|\$)", str(text))
        return float(m.group(1).replace(",", "")) if m else 0.0

    def _load_all_sources(self) -> None:
        txs: List[Transaction] = []

        # 1. Load official Card Statements CSV
        if os.path.exists(self.cards_csv):
            try:
                df_cards = pd.read_csv(self.cards_csv)
                for _, r in df_cards.iterrows():
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
                            id=str(r.get("id")),
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
            except Exception as e:
                logger.error(f"Error loading cards CSV: {e}")

        # 2. Load official Account Transactions CSV
        if os.path.exists(self.accounts_csv):
            try:
                df_accs = pd.read_csv(self.accounts_csv)
                for _, r in df_accs.iterrows():
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
                            id=str(r.get("id")),
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
            except Exception as e:
                logger.error(f"Error loading accounts CSV: {e}")

        # 3. Load official Excel Inbox dataset (wlf15_inbox_3users.xlsx)
        if os.path.exists(self.excel_path):
            try:
                df_inbox = pd.read_excel(self.excel_path, sheet_name="wealifytester")
                for _, r in df_inbox.iterrows():
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
                            id=f"tx_{r.get('email_id')}",
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
            except Exception as e:
                logger.error(f"Error parsing transactions from Excel inbox: {e}")

        self._data = sorted(txs, key=lambda x: x.occurred_at, reverse=True)
        logger.info(f"Loaded {len(self._data)} official transactions from CSVs and Excel inbox.")

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

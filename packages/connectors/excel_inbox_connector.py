"""Excel Inbox Connector for Wealify Guardian.

Loads and queries the official hackathon test dataset (wlf15_inbox_3users.xlsx)
supporting all 3 user personas (wealifytester, wealifyjunior, wealifysenior).
"""

import os
from datetime import datetime, timezone
from typing import Dict, List, Optional
import pandas as pd

from packages.connectors.base.base_source import BaseEmailSource
from packages.data.schemas.email import EmailEvidence, EmailType
from packages.observability.logging import logger


class ExcelInboxConnector(BaseEmailSource):
    """Parses and indexes email records from wlf15_inbox_3users.xlsx."""

    DEFAULT_EXCEL_PATH = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
        "wlf15_inbox_3users.xlsx",
    )

    def __init__(self, excel_path: Optional[str] = None):
        self.excel_path = excel_path or self.DEFAULT_EXCEL_PATH
        self._user_inboxes: Dict[str, List[EmailEvidence]] = {}
        self._load_dataset()

    def _load_dataset(self) -> None:
        """Load all sheets from the Excel file if it exists."""
        if not os.path.exists(self.excel_path):
            logger.warning(f"Excel inbox file not found at {self.excel_path}")
            return

        try:
            xl = pd.ExcelFile(self.excel_path)
            for sheet_name in xl.sheet_names:
                df = pd.read_excel(self.excel_path, sheet_name=sheet_name)
                emails: List[EmailEvidence] = []

                for _, row in df.iterrows():
                    # Parse date
                    dt_str = str(row.get("datetime", ""))
                    try:
                        dt = datetime.fromisoformat(dt_str)
                    except Exception:
                        dt = datetime.now(timezone.utc)

                    # Map kind to canonical EmailType
                    kind = str(row.get("kind", "")).lower()
                    is_suspicious = int(row.get("is_suspicious", 0)) == 1

                    if is_suspicious or kind == "phishing":
                        email_type = EmailType.ALERT
                    elif kind == "payout":
                        email_type = EmailType.PAYOUT_NOTIFICATION
                    elif kind == "receipt":
                        email_type = EmailType.RECEIPT
                    elif kind == "subscription":
                        email_type = EmailType.SUBSCRIPTION_UPDATE
                    else:
                        email_type = EmailType.OTHER

                    # Extract monetary amount if mentioned in body or snippet
                    snippet = str(row.get("snippet", ""))
                    body = str(row.get("body", ""))
                    matched_txn = str(row.get("matched_txn_id", "")) if pd.notna(row.get("matched_txn_id")) else None

                    merchant = str(row.get("from", "Unknown"))
                    if "payoneer" in merchant.lower():
                        merchant = "Payoneer Payouts"
                    elif "paypal" in merchant.lower():
                        merchant = "PayPal Payouts"
                    elif "netflix" in merchant.lower():
                        merchant = "Netflix.com"
                    elif "facebook" in merchant.lower() or "meta" in merchant.lower():
                        merchant = "Facebook Ads"
                    elif "google" in merchant.lower():
                        merchant = "Google Ads"
                    elif "wea1ify" in merchant.lower():
                        merchant = "Wealify Security (MẠO DANH / PHISHING)"

                    emails.append(
                        EmailEvidence(
                            id=str(row.get("email_id", f"EM_{len(emails)+1:04d}")),
                            date=dt,
                            sender=str(row.get("from", "")),
                            subject=str(row.get("subject", "")),
                            merchant=merchant,
                            body_snippet=snippet or body[:200],
                            email_type=email_type,
                            payout_ref=matched_txn,
                        )
                    )

                clean_user = sheet_name.replace("@yopmail.com", "").strip().lower()
                self._user_inboxes[clean_user] = emails
                logger.info(f"Loaded {len(emails)} emails for persona '{clean_user}' from Excel.")
        except Exception as exc:
            logger.error(f"Error loading Excel inbox: {exc}")

    async def get_emails(
        self,
        query: Optional[str] = None,
        limit: int = 150,
        user_persona: str = "wealifytester",
    ) -> List[EmailEvidence]:
        """Query emails for a specific user persona with optional text filter."""
        clean_user = user_persona.replace("@yopmail.com", "").strip().lower()
        emails = self._user_inboxes.get(clean_user) or self._user_inboxes.get("wealifytester", [])

        if query:
            q = query.lower()
            emails = [
                e for e in emails
                if q in e.subject.lower() or q in e.sender.lower() or q in e.merchant.lower() or (e.body_snippet and q in e.body_snippet.lower())
            ]

        return emails[:limit]

    def get_phishing_emails(self, user_persona: str = "wealifytester") -> List[EmailEvidence]:
        """Retrieve suspicious phishing emails for security alerts."""
        clean_user = user_persona.replace("@yopmail.com", "").strip().lower()
        emails = self._user_inboxes.get(clean_user, [])
        return [e for e in emails if e.email_type == EmailType.ALERT or "mạo danh" in e.merchant.lower() or "wea1ify" in e.sender.lower()]

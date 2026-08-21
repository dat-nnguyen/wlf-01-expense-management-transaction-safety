from datetime import datetime, timedelta
from typing import List, Optional
from packages.connectors.base.base_source import BaseTransactionSource, BaseEmailSource
from packages.data.schemas.transaction import (
    Transaction,
    TransactionDirection,
    TransactionSource,
    TransactionType,
)
from packages.data.schemas.email import EmailEvidence, EmailType
from packages.data.datasets.wealify_real_dataset import get_canonical_transactions


class MockTransactionSource(BaseTransactionSource):
    """Provides canned test/demo data for transactions across Account, Card, and Wallet."""

    def __init__(self):
        now = datetime.utcnow()
        canonical_txs = get_canonical_transactions()
        self._data: List[Transaction] = canonical_txs + [
            # 1. Monthly Subscriptions
            Transaction(
                id="tx_netflix_01",
                account_id="acc_main",
                occurred_at=now - timedelta(days=60),
                amount=9.99,
                currency="USD",
                direction=TransactionDirection.DEBIT,
                transaction_type=TransactionType.SUBSCRIPTION,
                merchant_raw="NETFLIX.COM* PAYMENT",
                merchant_normalized="Netflix",
                source=TransactionSource.CARD,
            ),
            Transaction(
                id="tx_netflix_02",
                account_id="acc_main",
                occurred_at=now - timedelta(days=30),
                amount=9.99,
                currency="USD",
                direction=TransactionDirection.DEBIT,
                transaction_type=TransactionType.SUBSCRIPTION,
                merchant_raw="NETFLIX.COM* PAYMENT",
                merchant_normalized="Netflix",
                source=TransactionSource.CARD,
            ),
            Transaction(
                id="tx_netflix_03",
                account_id="acc_main",
                occurred_at=now - timedelta(days=1),
                amount=9.99,
                currency="USD",
                direction=TransactionDirection.DEBIT,
                transaction_type=TransactionType.SUBSCRIPTION,
                merchant_raw="NETFLIX.COM* PAYMENT",
                merchant_normalized="Netflix",
                source=TransactionSource.CARD,
            ),
            # 2. Duplicate Anomaly Case (Grab ride charged twice in 5 mins)
            Transaction(
                id="tx_grab_01",
                account_id="acc_main",
                occurred_at=now - timedelta(hours=3, minutes=10),
                amount=24.50,
                currency="USD",
                direction=TransactionDirection.DEBIT,
                transaction_type=TransactionType.CARD_PURCHASE,
                merchant_raw="GRAB* TRANSPORT RIDE",
                merchant_normalized="Grab",
                source=TransactionSource.CARD,
            ),
            Transaction(
                id="tx_grab_02",
                account_id="acc_main",
                occurred_at=now - timedelta(hours=3, minutes=8),
                amount=24.50,
                currency="USD",
                direction=TransactionDirection.DEBIT,
                transaction_type=TransactionType.CARD_PURCHASE,
                merchant_raw="GRAB* TRANSPORT RIDE",
                merchant_normalized="Grab",
                source=TransactionSource.CARD,
            ),
            # 3. Price Hike Subscription (Adobe Creative Cloud $49.99 -> $54.99)
            Transaction(
                id="tx_adobe_01",
                account_id="acc_main",
                occurred_at=now - timedelta(days=32),
                amount=49.99,
                currency="USD",
                direction=TransactionDirection.DEBIT,
                transaction_type=TransactionType.SUBSCRIPTION,
                merchant_raw="ADOBE *CREATIVE CLOUD",
                merchant_normalized="Adobe",
                source=TransactionSource.CARD,
            ),
            Transaction(
                id="tx_adobe_02",
                account_id="acc_main",
                occurred_at=now - timedelta(days=2),
                amount=54.99,
                currency="USD",
                direction=TransactionDirection.DEBIT,
                transaction_type=TransactionType.SUBSCRIPTION,
                merchant_raw="ADOBE *CREATIVE CLOUD",
                merchant_normalized="Adobe",
                source=TransactionSource.CARD,
            ),
            # 4. Account to Wallet transfer (Lệch đối soát: Bank debited $50, wallet missing)
            Transaction(
                id="tx_wallet_topup_acc",
                account_id="acc_main",
                occurred_at=now - timedelta(days=4),
                amount=50.00,
                currency="USD",
                direction=TransactionDirection.DEBIT,
                transaction_type=TransactionType.TRANSFER,
                merchant_raw="WALLET TOPUP TRANS",
                merchant_normalized="Wallet Topup",
                source=TransactionSource.ACCOUNT,
            ),
            # 5. Regular Salary Payin
            Transaction(
                id="tx_salary_01",
                account_id="acc_main",
                occurred_at=now - timedelta(days=15),
                amount=3500.00,
                currency="USD",
                direction=TransactionDirection.CREDIT,
                transaction_type=TransactionType.PAYIN,
                merchant_raw="PAYROLL TECH CORP",
                merchant_normalized="Tech Corp Payroll",
                source=TransactionSource.ACCOUNT,
            ),
            # 6. Stripe Payout Settlement
            Transaction(
                id="acc_tx_006",
                account_id="acc_main",
                occurred_at=now - timedelta(days=4),
                amount=1890.00,
                currency="USD",
                direction=TransactionDirection.CREDIT,
                transaction_type=TransactionType.PAYIN,
                merchant_raw="Stripe Payout Settlement",
                merchant_normalized="Stripe",
                source_reference="REF_PAY_STP_01",
                source=TransactionSource.ACCOUNT,
            ),
            # 7. Facebook Ads Double Swipe on Virtual Card
            Transaction(
                id="card_tx_009",
                account_id="acc_main",
                occurred_at=now - timedelta(days=1, minutes=10),
                amount=150.00,
                currency="USD",
                direction=TransactionDirection.DEBIT,
                transaction_type=TransactionType.CARD_PURCHASE,
                merchant_raw="FACEBOOK *ADS 84918239",
                merchant_normalized="Facebook Ads",
                card_id="vcard_ad_fb",
                source=TransactionSource.CARD,
            ),
            Transaction(
                id="card_tx_010",
                account_id="acc_main",
                occurred_at=now - timedelta(days=1, minutes=8),
                amount=150.00,
                currency="USD",
                direction=TransactionDirection.DEBIT,
                transaction_type=TransactionType.CARD_PURCHASE,
                merchant_raw="FACEBOOK *ADS 84918239",
                merchant_normalized="Facebook Ads",
                card_id="vcard_ad_fb",
                source=TransactionSource.CARD,
            ),
        ]

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
    """Provides canned test/demo email receipts."""

    def __init__(self):
        now = datetime.utcnow()
        self._emails: List[EmailEvidence] = [
            EmailEvidence(
                id="em_netflix_01",
                date=now - timedelta(days=1, hours=1),
                sender="info@mailer.netflix.com",
                subject="Your Netflix Membership Renewal Receipt",
                merchant="Netflix",
                amount=9.99,
                currency="USD",
                body_snippet="Your monthly subscription was renewed for $9.99. Thank you for streaming.",
                email_type=EmailType.RECEIPT,
            ),
            EmailEvidence(
                id="em_grab_01",
                date=now - timedelta(hours=3, minutes=5),
                sender="no-reply@grab.com",
                subject="Your Grab E-Receipt for Trip #8291",
                merchant="Grab",
                amount=24.50,
                currency="USD",
                body_snippet="Total paid: $24.50. Payment method: Credit Card ending in 4112.",
                email_type=EmailType.RECEIPT,
            ),
            EmailEvidence(
                id="em_adobe_02",
                date=now - timedelta(days=2, hours=2),
                sender="billing@adobe.com",
                subject="Your Adobe Creative Cloud Plan Invoice",
                merchant="Adobe",
                amount=54.99,
                currency="USD",
                body_snippet="Your plan has renewed at $54.99 / month. Plan includes Photoshop, Illustrator.",
                email_type=EmailType.SUBSCRIPTION_UPDATE,
            ),
            EmailEvidence(
                id="em_stp_002",
                date=now - timedelta(days=5),
                sender="support@stripe.com",
                subject="Payout of $1,890.00 is on its way to your account",
                merchant="Stripe",
                amount=1890.00,
                currency="USD",
                body_snippet="Your scheduled payout of $1,890.00 USD (Transfer ID: REF_PAY_STP_01) is on its way.",
                email_type=EmailType.TRANSFER_CONFIRMATION,
            ),
        ]

    async def get_emails(
        self,
        query: Optional[str] = None,
        limit: int = 50,
    ) -> List[EmailEvidence]:
        if query:
            q = query.lower()
            return [e for e in self._emails if q in e.merchant.lower() or q in e.subject.lower()][:limit]
        return self._emails[:limit]

    def list_messages(self) -> List[EmailEvidence]:
        return list(self._emails)


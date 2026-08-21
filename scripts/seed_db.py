"""Database Seeding Script for Wealify Guardian.

Seeds SQLite database with real Wealify dataset:
- Virtual Cards (Volcano Ads ****0001 - $1,822.96 USD)
- Virtual Accounts (Etsy, Payoneer, Paypal, PingPong, Amazon, Stripe)
- Wallet Master Record (Lê Minh Anh - 274,436,000 VND / $2,750.01 USD)
- 30-Day Canonical Time-Series Transactions
- 148 Inbox Emails from Excel dataset
"""

import sys
from pathlib import Path

root_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root_dir))

from packages.db.session import init_db, SessionLocal
from packages.db.models.base import (
    TransactionModel,
    EmailModel,
    VirtualCardModel,
    VirtualAccountModel,
    WalletModel,
)
from packages.data.datasets.wealify_real_dataset import (
    REAL_WALLET_SUMMARY,
    REAL_VIRTUAL_CARDS,
    REAL_VIRTUAL_ACCOUNTS,
    get_canonical_transactions,
)
from packages.connectors.excel_inbox_connector import ExcelInboxConnector
from packages.observability.logging import logger


def seed_database():
    init_db()
    db = SessionLocal()

    try:
        logger.info("Starting Wealify Database Seeding...")

        # 1. Seed Wallet
        db.query(WalletModel).delete()
        wallet = WalletModel(
            id="wallet_main",
            account_id=REAL_WALLET_SUMMARY["account_id"],
            user_name=REAL_WALLET_SUMMARY["user_name"],
            user_role=REAL_WALLET_SUMMARY["role"],
            total_balance_usd=REAL_WALLET_SUMMARY["total_balance_usd"],
            wallet_balance_usd=REAL_WALLET_SUMMARY["wallet_balance_usd"],
            card_balance_usd=REAL_WALLET_SUMMARY["card_balance_usd"],
            wallet_balance_vnd=REAL_WALLET_SUMMARY["wallet_balance_vnd"],
            monthly_payin_vnd=REAL_WALLET_SUMMARY["monthly_payin_vnd"],
            monthly_payout_vnd=REAL_WALLET_SUMMARY["monthly_payout_vnd"],
        )
        db.add(wallet)

        # 2. Seed Virtual Cards
        db.query(VirtualCardModel).delete()
        for vc in REAL_VIRTUAL_CARDS:
            card = VirtualCardModel(
                id=vc["id"],
                account_id="acc_main",
                card_name=vc["card_name"],
                card_masked_number=vc["masked_number"],
                balance=vc["balance"],
                currency=vc["currency"],
                status=vc["status"],
            )
            db.add(card)

        # 3. Seed Virtual Accounts
        db.query(VirtualAccountModel).delete()
        for va in REAL_VIRTUAL_ACCOUNTS:
            acc = VirtualAccountModel(
                id=va["id"],
                account_id="acc_main",
                account_name=va["account_name"],
                channel_source=va["channel_source"],
                target_bank=va["target_bank"],
                total_received=va["total_received"],
                currency=va["currency"],
                status=va["status"],
            )
            db.add(acc)

        # 4. Seed Canonical Transactions
        db.query(TransactionModel).delete()
        txs = get_canonical_transactions()
        for t in txs:
            tx_model = TransactionModel(
                id=t.id,
                account_id=t.account_id,
                occurred_at=t.occurred_at,
                amount=t.amount,
                currency=t.currency,
                direction=t.direction.value,
                transaction_type=t.transaction_type.value,
                merchant_raw=t.merchant_raw,
                merchant_normalized=t.merchant_normalized,
                source=t.source.value,
                source_reference=t.source_reference,
                status=t.status,
            )
            db.add(tx_model)

        # 5. Seed Emails from Excel
        db.query(EmailModel).delete()
        connector = ExcelInboxConnector()
        all_emails = connector._user_inboxes.get("wealifytester", [])
        for em in all_emails:
            em_model = EmailModel(
                id=em.id,
                date=em.date,
                sender=em.sender,
                subject=em.subject,
                merchant=em.merchant,
                amount=em.amount,
                currency=em.currency,
                body_snippet=em.body_snippet,
                email_type=em.email_type.value,
            )
            db.add(em_model)

        db.commit()
        logger.info(f"Database seeded successfully: {len(txs)} transactions, {len(all_emails)} emails, {len(REAL_VIRTUAL_CARDS)} cards, {len(REAL_VIRTUAL_ACCOUNTS)} virtual accounts.")
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()

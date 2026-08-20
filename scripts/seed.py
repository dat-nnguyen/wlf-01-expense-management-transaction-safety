import os
import sys
from pathlib import Path

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

# Add project root to sys.path
root_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root_dir))

from packages.db.session import init_db, SessionLocal
from packages.db.repositories.transaction_repo import TransactionRepository
from packages.data.parsers.csv_parser import parse_transactions_csv
from packages.data.schemas.transaction import TransactionSource
from packages.observability.logging import logger


def seed_database():
    logger.info("Initializing database...")
    init_db()
    db = SessionLocal()
    repo = TransactionRepository(db)

    sample_dir = root_dir / "data" / "sample"
    acc_file = sample_dir / "account_transactions.csv"
    card_file = sample_dir / "card_statements.csv"

    total_inserted = 0

    if acc_file.exists():
        acc_txs = parse_transactions_csv(acc_file, source_type=TransactionSource.ACCOUNT)
        total_inserted += repo.save_many(acc_txs)
        logger.info(f"Loaded {len(acc_txs)} account transactions.")

    if card_file.exists():
        card_txs = parse_transactions_csv(card_file, source_type=TransactionSource.CARD)
        total_inserted += repo.save_many(card_txs)
        logger.info(f"Loaded {len(card_txs)} card transactions.")

    db.close()
    logger.info(f"Seeding completed! Total {total_inserted} transactions inserted.")


if __name__ == "__main__":
    seed_database()

from typing import List, Optional
from sqlalchemy.orm import Session
from packages.db.models.base import TransactionModel
from packages.data.schemas.transaction import (
    Transaction,
    TransactionDirection,
    TransactionSource,
    TransactionType,
)


class TransactionRepository:
    def __init__(self, db: Session):
        self.db = db

    def to_schema(self, m: TransactionModel) -> Transaction:
        return Transaction(
            id=m.id,
            account_id=m.account_id,
            occurred_at=m.occurred_at,
            amount=m.amount,
            currency=m.currency,
            direction=TransactionDirection(m.direction),
            transaction_type=TransactionType(m.transaction_type),
            merchant_raw=m.merchant_raw,
            merchant_normalized=m.merchant_normalized or "",
            source=TransactionSource(m.source),
            source_reference=m.source_reference,
            status=m.status,
        )

    def get_all(self, limit: int = 100) -> List[Transaction]:
        models = self.db.query(TransactionModel).order_by(TransactionModel.occurred_at.desc()).limit(limit).all()
        return [self.to_schema(m) for m in models]

    def get_by_id(self, tx_id: str) -> Optional[Transaction]:
        m = self.db.query(TransactionModel).filter(TransactionModel.id == tx_id).first()
        return self.to_schema(m) if m else None

    def search_by_merchant(self, query: str) -> List[Transaction]:
        q = f"%{query.strip()}%"
        models = (
            self.db.query(TransactionModel)
            .filter((TransactionModel.merchant_normalized.ilike(q)) | (TransactionModel.merchant_raw.ilike(q)))
            .order_by(TransactionModel.occurred_at.desc())
            .all()
        )
        return [self.to_schema(m) for m in models]

    def save(self, tx: Transaction) -> Transaction:
        existing = self.db.query(TransactionModel).filter(TransactionModel.id == tx.id).first()
        if existing:
            existing.amount = tx.amount
            existing.merchant_raw = tx.merchant_raw
            existing.merchant_normalized = tx.merchant_normalized
            existing.direction = tx.direction.value
            existing.transaction_type = tx.transaction_type.value
            existing.source = tx.source.value
            existing.occurred_at = tx.occurred_at
        else:
            model = TransactionModel(
                id=tx.id,
                account_id=tx.account_id,
                occurred_at=tx.occurred_at,
                amount=tx.amount,
                currency=tx.currency,
                direction=tx.direction.value,
                transaction_type=tx.transaction_type.value,
                merchant_raw=tx.merchant_raw,
                merchant_normalized=tx.merchant_normalized,
                source=tx.source.value,
                source_reference=tx.source_reference,
                status=tx.status,
            )
            self.db.add(model)
        self.db.commit()
        return tx

    def save_many(self, txs: List[Transaction]) -> int:
        count = 0
        for tx in txs:
            self.save(tx)
            count += 1
        return count

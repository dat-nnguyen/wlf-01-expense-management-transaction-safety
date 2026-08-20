from typing import List, Optional
from fastapi import APIRouter, Depends, Query, UploadFile, File
from packages.data.schemas.transaction import Transaction
from packages.data.parsers.csv_parser import parse_transactions_csv
from packages.db.repositories.transaction_repo import TransactionRepository
from apps.api.dependencies import get_transaction_repo
from packages.connectors.mock.mock_sources import MockTransactionSource

router = APIRouter(prefix="/api/v1/transactions", tags=["Transactions"])
mock_source = MockTransactionSource()


@router.get("", response_model=List[Transaction])
async def list_transactions(
    query: Optional[str] = Query(None, description="Search query by merchant"),
    limit: int = Query(50, ge=1, le=200),
    repo: TransactionRepository = Depends(get_transaction_repo),
):
    # If DB has transactions, read from DB; else fallback to mock source
    txs = repo.search_by_merchant(query) if query else repo.get_all(limit=limit)
    if not txs:
        txs = await mock_source.get_transactions(limit=limit)
        if query:
            q = query.lower()
            txs = [t for t in txs if q in t.merchant_normalized.lower() or q in t.merchant_raw.lower()]
    return txs


@router.post("/import", response_model=dict)
async def import_transactions_csv(
    file: UploadFile = File(...),
    repo: TransactionRepository = Depends(get_transaction_repo),
):
    content = await file.read()
    txs = parse_transactions_csv(content)
    count = repo.save_many(txs)
    return {"imported_count": count, "filename": file.filename}

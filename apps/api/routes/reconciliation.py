from typing import List, Optional
from fastapi import APIRouter, Query
from packages.data.schemas.alert import Alert
from packages.data.schemas.transaction import TransactionSource
from packages.connectors.mock.mock_sources import MockTransactionSource, MockEmailSource
from packages.financial.reconciliation.reconciler import ReconciliationEngine, ThreeWayReconciliationReport
from packages.financial.reconciliation.email_reconciler import EmailReconciliationEngine, EmailMatchResult
from packages.financial.reconciliation.payout_radar import PayoutRadar

router = APIRouter(prefix="/api/v1/reconciliation", tags=["Reconciliation"])
tx_source = MockTransactionSource()
em_source = MockEmailSource()


@router.get("/3-way", response_model=ThreeWayReconciliationReport)
async def get_3way_reconciliation():
    """
    Performs 3-Way Reconciliation across Account ↔ Wallet ↔ Card Statement.
    Adheres strictly to the non-speculative rule:
    'Lệch $50 giữa Account và Card Statement — chưa xác định nguyên nhân.'
    """
    all_txs = await tx_source.get_transactions()
    emails = await em_source.get_emails()

    account_txs = [t for t in all_txs if t.source == TransactionSource.ACCOUNT]
    wallet_txs = [t for t in all_txs if t.source == TransactionSource.WALLET]
    card_txs = [t for t in all_txs if t.source == TransactionSource.CARD]

    report = ReconciliationEngine.perform_3way_reconciliation(
        account_txs=account_txs,
        wallet_txs=wallet_txs,
        card_txs=card_txs,
        emails=emails,
        account_balance_claimed=12450.0,
        wallet_balance_claimed=4500.0,
    )
    return report


@router.get("/email-matches", response_model=List[EmailMatchResult])
async def get_email_reconciliation_matches():
    """
    Matches Transactions with Mailbox evidence.
    Produces canonical 4-column output:
    Transaction | Email | Kết quả | Confidence
    """
    all_txs = await tx_source.get_transactions()
    emails = await em_source.get_emails()

    matches = EmailReconciliationEngine.match_transactions_with_emails(
        transactions=all_txs,
        emails=emails,
    )
    return matches


@router.get("", response_model=List[Alert])
async def run_reconciliation():
    all_txs = await tx_source.get_transactions()
    emails = await em_source.get_emails()

    account_txs = [t for t in all_txs if t.source == TransactionSource.ACCOUNT]
    wallet_txs = [t for t in all_txs if t.source == TransactionSource.WALLET]
    card_txs = [t for t in all_txs if t.source == TransactionSource.CARD]

    alerts = ReconciliationEngine.reconcile_sources(
        account_txs=account_txs,
        wallet_txs=wallet_txs,
        card_txs=card_txs,
        emails=emails,
    )
    return alerts


@router.get("/payouts", response_model=List[Alert])
async def detect_overdue_payouts():
    all_txs = await tx_source.get_transactions()
    emails = await em_source.get_emails()
    alerts = PayoutRadar.detect_overdue_payouts(payout_emails=emails, account_txs=all_txs)
    return alerts

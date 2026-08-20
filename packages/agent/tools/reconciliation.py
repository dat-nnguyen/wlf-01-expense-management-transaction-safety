import time
from typing import Any, Dict
from packages.agent.tools.base import BaseTool, ToolContext, ToolResult
from packages.policy.permissions import ActionType
from packages.connectors.mock.mock_sources import MockTransactionSource, MockEmailSource
from packages.financial.reconciliation.reconciler import ReconciliationEngine
from packages.data.schemas.transaction import TransactionSource


class ReconcileTransactionsTool(BaseTool):
    name = "reconcile_transactions"
    description = "Run multi-source ledger reconciliation between Account, Wallet, Card, and Email receipts."
    action_type = ActionType.RUN_RECONCILIATION

    def __init__(
        self,
        tx_source: MockTransactionSource = None,
        email_source: MockEmailSource = None,
    ):
        self.tx_source = tx_source or MockTransactionSource()
        self.email_source = email_source or MockEmailSource()

    async def execute(self, context: ToolContext, arguments: Dict[str, Any]) -> ToolResult:
        start = time.perf_counter()
        all_txs = await self.tx_source.get_transactions(account_id=context.account_id)
        emails = await self.email_source.get_emails()

        account_txs = [t for t in all_txs if t.source == TransactionSource.ACCOUNT]
        wallet_txs = [t for t in all_txs if t.source == TransactionSource.WALLET]
        card_txs = [t for t in all_txs if t.source == TransactionSource.CARD]

        alerts = ReconciliationEngine.reconcile_sources(
            account_txs=account_txs,
            wallet_txs=wallet_txs,
            card_txs=card_txs,
            emails=emails,
        )

        duration = (time.perf_counter() - start) * 1000
        return ToolResult(
            success=True,
            data={"discrepancies": [a.model_dump(mode="json") for a in alerts]},
            execution_time_ms=round(duration, 2),
        )

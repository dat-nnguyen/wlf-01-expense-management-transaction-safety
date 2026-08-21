import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple
from pydantic import BaseModel, Field

from packages.data.schemas.transaction import Transaction, TransactionDirection, TransactionType, TransactionSource
from packages.data.schemas.email import EmailEvidence
from packages.data.schemas.alert import Alert, AlertStatus, AlertType
from packages.evidence.confidence import compute_transaction_email_confidence, get_confidence_label
from packages.financial.reconciliation.payout_radar import PayoutRadar


class SourceSummary(BaseModel):
    source_name: str
    total_debit: float
    total_credit: float
    net_flow: float
    transaction_count: int


class DiscrepancyItem(BaseModel):
    id: str
    title: str
    source_a: str
    source_b: str
    amount_diff: float
    explanation: str  # Must follow strictly: "Lệch $X giữa [Source A] và [Source B] — chưa xác định nguyên nhân."
    status: AlertStatus
    confidence: float
    confidence_label: str
    transaction_ids: List[str] = Field(default_factory=list)


class ThreeWayReconciliationReport(BaseModel):
    account_summary: SourceSummary
    wallet_summary: SourceSummary
    card_summary: SourceSummary
    is_balanced: bool
    total_discrepancy_amount: float
    discrepancies: List[DiscrepancyItem]
    alerts: List[Alert]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ReconciliationEngine:
    """
    Comprehensive 3-Way Reconciliation Engine:
    Reconciles Account ↔ Wallet ↔ Card Statements.
    
    Strict Invariant: Never speculate cause.
    Example: 'Lệch $50 giữa Account và Card Statement — chưa xác định nguyên nhân.'
    """

    @classmethod
    def perform_3way_reconciliation(
        cls,
        account_txs: List[Transaction],
        wallet_txs: List[Transaction],
        card_txs: List[Transaction],
        emails: Optional[List[EmailEvidence]] = None,
        account_balance_claimed: Optional[float] = None,
        wallet_balance_claimed: Optional[float] = None,
    ) -> ThreeWayReconciliationReport:
        emails = emails or []
        alerts: List[Alert] = []
        discrepancies: List[DiscrepancyItem] = []

        # 1. Summaries
        def summarize(name: str, tx_list: List[Transaction]) -> SourceSummary:
            debits = sum(t.amount for t in tx_list if t.direction == TransactionDirection.DEBIT)
            credits = sum(t.amount for t in tx_list if t.direction == TransactionDirection.CREDIT)
            return SourceSummary(
                source_name=name,
                total_debit=round(debits, 2),
                total_credit=round(credits, 2),
                net_flow=round(credits - debits, 2),
                transaction_count=len(tx_list),
            )

        acc_sum = summarize("Account Statement", account_txs)
        wal_sum = summarize("Wallet Ledger", wallet_txs)
        card_sum = summarize("Card Statement", card_txs)

        # 2. Check Scenario 1: Tiền rời Account nhưng chưa xuất hiện trên Card
        for acc_tx in account_txs:
            m_text = (acc_tx.merchant_normalized or acc_tx.merchant_raw).lower()
            if (acc_tx.transaction_type == TransactionType.TRANSFER_TO_CARD or "card" in m_text or "thẻ" in m_text) and acc_tx.direction == TransactionDirection.DEBIT:
                matched = any(abs(c_tx.amount - acc_tx.amount) < 0.01 and abs((c_tx.occurred_at.date() - acc_tx.occurred_at.date()).days) <= 3 for c_tx in card_txs)
                if not matched:
                    exp = f"Lệch ${acc_tx.amount:,.2f} giữa Account và Card Statement — chưa xác định nguyên nhân."
                    disc = DiscrepancyItem(
                        id=f"disc_acc_card_{uuid.uuid4().hex[:6]}",
                        title=f"Tiền rời Account nhưng chưa lên Card: ${acc_tx.amount:,.2f}",
                        source_a="Account Statement",
                        source_b="Card Statement",
                        amount_diff=acc_tx.amount,
                        explanation=exp,
                        status=AlertStatus.NEEDS_USER_CONFIRMATION,
                        confidence=0.94,
                        confidence_label=get_confidence_label(0.94),
                        transaction_ids=[acc_tx.id],
                    )
                    discrepancies.append(disc)
                    alerts.append(
                        Alert(
                            id=f"alt_rec_{uuid.uuid4().hex[:6]}",
                            alert_type=AlertType.UNRECONCILED,
                            title=disc.title,
                            status=disc.status,
                            reason=exp,
                            confidence=0.94,
                            confidence_label=disc.confidence_label,
                            deadline_days=60,
                            amount=acc_tx.amount,
                            transaction_ids=[acc_tx.id],
                            action_suggestion="Kiểm tra đối soát mã giao dịch giữa sao kê tài khoản và thẻ.",
                        )
                    )

        # 3. Check Scenario 2: Tiền nạp vào Wallet bị trùng
        for i in range(len(wallet_txs)):
            for j in range(i + 1, len(wallet_txs)):
                w1, w2 = wallet_txs[i], wallet_txs[j]
                if w1.direction == TransactionDirection.CREDIT and w2.direction == TransactionDirection.CREDIT:
                    if abs(w1.amount - w2.amount) < 0.01:
                        time_diff = abs((w1.occurred_at - w2.occurred_at).total_seconds())
                        if time_diff <= 3600:  # Within 1 hour
                            exp = f"Lệch nạp trùng ${w1.amount:,.2f} trong Wallet — chưa xác định nguyên nhân."
                            disc = DiscrepancyItem(
                                id=f"disc_wal_dup_{uuid.uuid4().hex[:6]}",
                                title=f"Tiền nạp vào Wallet bị trùng: ${w1.amount:,.2f}",
                                source_a="Wallet Topup 1",
                                source_b="Wallet Topup 2",
                                amount_diff=w1.amount,
                                explanation=exp,
                                status=AlertStatus.NEEDS_USER_CONFIRMATION,
                                confidence=0.96,
                                confidence_label=get_confidence_label(0.96),
                                transaction_ids=[w1.id, w2.id],
                            )
                            discrepancies.append(disc)
                            alerts.append(
                                Alert(
                                    id=f"alt_rec_wal_dup_{uuid.uuid4().hex[:6]}",
                                    alert_type=AlertType.DUPLICATE,
                                    title=disc.title,
                                    status=disc.status,
                                    reason=exp,
                                    confidence=0.96,
                                    confidence_label=disc.confidence_label,
                                    deadline_days=60,
                                    amount=w1.amount,
                                    transaction_ids=[w1.id, w2.id],
                                    action_suggestion="Xác nhận số dư ví thực tế để hoàn lại lệnh nạp lặp.",
                                )
                            )

        # 4. Check Scenario 3: Phí bị tính 2 lần giữa các nguồn
        fees_acc = [t for t in account_txs if t.transaction_type == TransactionType.FEE or "fee" in (t.merchant_normalized or "").lower()]
        fees_card = [t for t in card_txs if t.transaction_type == TransactionType.FEE or "fee" in (t.merchant_normalized or "").lower()]
        for f_acc in fees_acc:
            for f_card in fees_card:
                if abs(f_acc.amount - f_card.amount) < 0.01 and abs((f_acc.occurred_at.date() - f_card.date.date() if hasattr(f_card, 'date') else f_acc.occurred_at.date() - f_card.occurred_at.date()).days) <= 2:
                    exp = f"Lệch phí ${f_acc.amount:,.2f} xuất hiện đồng thời trên Account và Card — chưa xác định nguyên nhân."
                    disc = DiscrepancyItem(
                        id=f"disc_fee_dup_{uuid.uuid4().hex[:6]}",
                        title=f"Phí bị tính 2 lần: ${f_acc.amount:,.2f}",
                        source_a="Account Fee",
                        source_b="Card Fee",
                        amount_diff=f_acc.amount,
                        explanation=exp,
                        status=AlertStatus.NEEDS_USER_CONFIRMATION,
                        confidence=0.91,
                        confidence_label=get_confidence_label(0.91),
                        transaction_ids=[f_acc.id, f_card.id],
                    )
                    discrepancies.append(disc)
                    alerts.append(
                        Alert(
                            id=f"alt_fee_{uuid.uuid4().hex[:6]}",
                            alert_type=AlertType.UNKNOWN_FEE,
                            title=disc.title,
                            status=disc.status,
                            reason=exp,
                            confidence=0.91,
                            confidence_label=disc.confidence_label,
                            deadline_days=60,
                            amount=f_acc.amount,
                            transaction_ids=[f_acc.id, f_card.id],
                        )
                    )

        # 5. Check Scenario 4: Account ↔ Wallet top-up check
        for acc_tx in account_txs:
            if "wallet" in (acc_tx.merchant_normalized or acc_tx.merchant_raw).lower() and acc_tx.direction == TransactionDirection.DEBIT:
                matched = any(abs(w_tx.amount - acc_tx.amount) < 0.01 and abs((w_tx.occurred_at - acc_tx.occurred_at).days) <= 2 for w_tx in wallet_txs)
                if not matched:
                    exp = f"Lệch ${acc_tx.amount:,.2f} giữa Account và Wallet — chưa xác định nguyên nhân."
                    disc = DiscrepancyItem(
                        id=f"disc_acc_wal_{uuid.uuid4().hex[:6]}",
                        title=f"Lệch đối soát Account ↔ Wallet: ${acc_tx.amount:,.2f}",
                        source_a="Account Statement",
                        source_b="Wallet Ledger",
                        amount_diff=acc_tx.amount,
                        explanation=exp,
                        status=AlertStatus.NEEDS_USER_CONFIRMATION,
                        confidence=0.92,
                        confidence_label=get_confidence_label(0.92),
                        transaction_ids=[acc_tx.id],
                    )
                    discrepancies.append(disc)
                    alerts.append(
                        Alert(
                            id=f"alt_rec_wal_{uuid.uuid4().hex[:6]}",
                            alert_type=AlertType.UNRECONCILED,
                            title=disc.title,
                            status=disc.status,
                            reason=exp,
                            confidence=0.92,
                            confidence_label=disc.confidence_label,
                            deadline_days=60,
                            amount=acc_tx.amount,
                            transaction_ids=[acc_tx.id],
                        )
                    )

        # 6. Check Scenario 5 & 6: Ledger Integrity (Wallet balance vs txs sum, Account balance vs cashflow)
        if wallet_balance_claimed is not None:
            actual_wal_calc = wal_sum.net_flow
            diff_wal = abs(wallet_balance_claimed - actual_wal_calc)
            if diff_wal > 0.01:
                exp = f"Lệch ${diff_wal:,.2f} giữa Wallet balance và tổng transaction — chưa xác định nguyên nhân."
                discrepancies.append(
                    DiscrepancyItem(
                        id=f"disc_wal_bal_{uuid.uuid4().hex[:6]}",
                        title=f"Wallet balance không khớp với các transaction: ${diff_wal:,.2f}",
                        source_a="Wallet Balance",
                        source_b="Wallet Transactions Sum",
                        amount_diff=diff_wal,
                        explanation=exp,
                        status=AlertStatus.INSUFFICIENT_DATA,
                        confidence=0.88,
                        confidence_label=get_confidence_label(0.88),
                    )
                )

        if account_balance_claimed is not None:
            actual_acc_calc = acc_sum.net_flow
            diff_acc = abs(account_balance_claimed - actual_acc_calc)
            if diff_acc > 0.01:
                exp = f"Lệch ${diff_acc:,.2f} giữa Account balance và dòng tiền thực tế — chưa xác định nguyên nhân."
                discrepancies.append(
                    DiscrepancyItem(
                        id=f"disc_acc_bal_{uuid.uuid4().hex[:6]}",
                        title=f"Account balance không khớp dòng tiền: ${diff_acc:,.2f}",
                        source_a="Account Balance",
                        source_b="Account Cashflow Sum",
                        amount_diff=diff_acc,
                        explanation=exp,
                        status=AlertStatus.INSUFFICIENT_DATA,
                        confidence=0.88,
                        confidence_label=get_confidence_label(0.88),
                    )
                )

        # Overdue payout checks (PayoutRadar)
        payout_alerts = PayoutRadar.detect_overdue_payouts(payout_emails=emails, account_txs=account_txs + wallet_txs)
        alerts.extend(payout_alerts)

        total_discrepancy = sum(d.amount_diff for d in discrepancies)
        is_balanced = len(discrepancies) == 0

        return ThreeWayReconciliationReport(
            account_summary=acc_sum,
            wallet_summary=wal_sum,
            card_summary=card_sum,
            is_balanced=is_balanced,
            total_discrepancy_amount=round(total_discrepancy, 2),
            discrepancies=discrepancies,
            alerts=alerts,
        )

    @classmethod
    def reconcile_sources(
        cls,
        account_txs: List[Transaction],
        wallet_txs: List[Transaction],
        card_txs: List[Transaction],
        emails: Optional[List[EmailEvidence]] = None,
        current_time: Optional[datetime] = None,
    ) -> List[Alert]:
        """Backwards-compatible alert generator."""
        report = cls.perform_3way_reconciliation(
            account_txs=account_txs,
            wallet_txs=wallet_txs,
            card_txs=card_txs,
            emails=emails,
        )
        return report.alerts

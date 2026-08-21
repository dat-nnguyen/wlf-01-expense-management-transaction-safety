from typing import Any, Dict, Optional, Tuple
from packages.policy.permissions import ActionType, PolicyDecision


class SecurityBoundaryViolation(PermissionError):
    """Raised when an agent or user attempts an unpermitted mutating financial action."""
    pass


class PolicyEngine:
    """
    Security Policy Engine enforcing strict read-only financial safety.
    Denies any tool or action attempting financial mutation or autonomous external execution.
    """

    POLICY_RULES: Dict[ActionType, Tuple[PolicyDecision, str]] = {
        # Allowed Read-Only Operations
        ActionType.READ_TRANSACTION: (PolicyDecision.ALLOW, "Read-only access to transactions is permitted."),
        ActionType.READ_EMAIL: (PolicyDecision.ALLOW, "Read-only access to user email receipts is permitted."),
        ActionType.CREATE_REPORT: (PolicyDecision.ALLOW, "Report draft generation is permitted."),
        ActionType.CREATE_EMAIL_DRAFT: (PolicyDecision.ALLOW, "Email draft generation is permitted."),
        ActionType.RUN_RECONCILIATION: (PolicyDecision.ALLOW, "Financial reconciliation calculation is permitted."),
        ActionType.DETECT_DUPLICATES: (PolicyDecision.ALLOW, "Duplicate anomaly detection is permitted."),
        ActionType.DETECT_SUBSCRIPTIONS: (PolicyDecision.ALLOW, "Subscription detection is permitted."),
        ActionType.DETECT_OVERDUE_PAYOUTS: (PolicyDecision.ALLOW, "Overdue/missing payout detection is permitted."),
        ActionType.ANALYZE_BUSINESS_HEALTH: (PolicyDecision.ALLOW, "Business financial health analysis is permitted."),
        ActionType.VERIFY_PAYMENT_AUTHENTICITY: (PolicyDecision.ALLOW, "Payment authenticity and claim verification is permitted."),

        # Human-in-the-loop
        ActionType.SEND_EMAIL_TO_SELF: (
            PolicyDecision.CONFIRMATION_REQUIRED,
            "Sending reports to verified user email requires explicit user confirmation."
        ),
        ActionType.GENERATE_DISPUTE_TICKET: (
            PolicyDecision.CONFIRMATION_REQUIRED,
            "Generating and confirming dispute ticket filing requires explicit user approval."
        ),
        ActionType.CONFIRM_HITL_ACTION: (
            PolicyDecision.CONFIRMATION_REQUIRED,
            "Executing advisory action suggestions requires user confirmation."
        ),

        # Strictly Denied Mutations & External Operations
        ActionType.SEND_EMAIL_TO_MERCHANT: (
            PolicyDecision.DENY,
            "Autonomous email communication to merchants is strictly forbidden. User must take action manually."
        ),
        ActionType.SEND_EMAIL_TO_BANK: (
            PolicyDecision.DENY,
            "Autonomous email communication to banking institutions is strictly forbidden."
        ),
        ActionType.CANCEL_SUBSCRIPTION: (
            PolicyDecision.DENY,
            "Cancelling subscriptions directly is not permitted. Only instructions/guides may be provided to the user."
        ),
        ActionType.TRANSFER_MONEY: (
            PolicyDecision.DENY,
            "Money transfer and funds movement are strictly denied. Wealify Guardian is a read-only advisor."
        ),
        ActionType.CHARGEBACK: (
            PolicyDecision.DENY,
            "Initiating chargebacks directly is denied. System provides dispute draft data for the user instead."
        ),
        ActionType.LOCK_CARD: (
            PolicyDecision.DENY,
            "Card locking actions are denied."
        ),
        ActionType.EXECUTE_TRANSACTION: (
            PolicyDecision.DENY,
            "Direct transaction execution is prohibited by system policy."
        ),
    }

    @classmethod
    def evaluate(cls, action: ActionType, context: Optional[Dict[str, Any]] = None) -> Tuple[PolicyDecision, str]:
        """Evaluate an action against the policy rules."""
        if action in cls.POLICY_RULES:
            return cls.POLICY_RULES[action]
        # Default safe behavior for unrecognized actions: DENY
        return PolicyDecision.DENY, f"Action '{action}' is unrecognized and denied by default policy."

    @classmethod
    def enforce(cls, action: ActionType, context: Optional[Dict[str, Any]] = None) -> PolicyDecision:
        """
        Enforce policy. Returns decision or raises SecurityBoundaryViolation if DENY.
        """
        decision, reason = cls.evaluate(action, context)
        if decision == PolicyDecision.DENY:
            raise SecurityBoundaryViolation(f"POLICY DENIED [{action.value}]: {reason}")
        return decision

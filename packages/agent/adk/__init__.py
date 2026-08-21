"""Google Agent Development Kit (ADK 2.4.0) Integration for Wealify Guardian."""

from packages.agent.adk.config import get_adk_model_name, configure_adk_environment, GUARDIAN_ROOT_INSTRUCTION
from packages.agent.adk.callbacks import (
    guardian_before_tool_callback,
    guardian_after_tool_callback,
    guardian_on_tool_error_callback,
)
from packages.agent.adk.tools import (
    verify_transaction_authenticity,
    find_duplicate_charges,
    detect_overdue_payouts,
    find_active_subscriptions,
    reconcile_3way_transactions,
    generate_expense_report,
    search_financial_transactions,
    get_transaction_details,
    search_email_inbox,
    analyze_business_health,
    detect_spending_surges,
)
from packages.agent.adk.sub_agents import (
    authenticity_agent,
    reconciliation_agent,
    anomaly_agent,
    subscription_agent,
    advisory_agent,
    search_agent,
)
from packages.agent.adk.guardian_agent import root_agent, ROOT_TOOLS

__all__ = [
    "root_agent",
    "ROOT_TOOLS",
    "get_adk_model_name",
    "configure_adk_environment",
    "GUARDIAN_ROOT_INSTRUCTION",
    "guardian_before_tool_callback",
    "guardian_after_tool_callback",
    "guardian_on_tool_error_callback",
    "authenticity_agent",
    "reconciliation_agent",
    "anomaly_agent",
    "subscription_agent",
    "advisory_agent",
    "search_agent",
    "verify_transaction_authenticity",
    "find_duplicate_charges",
    "detect_overdue_payouts",
    "find_active_subscriptions",
    "reconcile_3way_transactions",
    "generate_expense_report",
    "search_financial_transactions",
    "get_transaction_details",
    "search_email_inbox",
    "analyze_business_health",
    "detect_spending_surges",
]

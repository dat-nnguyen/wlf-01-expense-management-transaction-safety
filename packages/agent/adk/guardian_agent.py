"""Wealify Guardian — Google Agent Development Kit (ADK 2.4.0) Root Supervisor Agent.

Implements the central multi-agent orchestrator connecting specialized domain
sub-agents and dynamic financial tools with strict WLF-01 safety guarantees.
"""

try:
    from google.adk import Agent
except ImportError:
    class Agent:
        def __init__(self, *args, **kwargs):
            self.name = kwargs.get("name", "agent")
            self.sub_agents = kwargs.get("sub_agents", [])
            self.tools = kwargs.get("tools", [])
from packages.agent.adk.config import get_adk_model_name, GUARDIAN_ROOT_INSTRUCTION
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

_model_name = get_adk_model_name()

# All domain tools available at root and sub-agent level
ROOT_TOOLS = [
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
]

# Root Supervisor Agent
root_agent = Agent(
    name="wealify_guardian",
    model=_model_name,
    description="Wealify Guardian — Enterprise AI Expense Management & Transaction Safety Supervisor Copilot",
    instruction=GUARDIAN_ROOT_INSTRUCTION,
    tools=ROOT_TOOLS,
    sub_agents=[
        authenticity_agent,
        reconciliation_agent,
        anomaly_agent,
        subscription_agent,
        advisory_agent,
        search_agent,
    ],
    before_tool_callback=guardian_before_tool_callback,
    after_tool_callback=guardian_after_tool_callback,
    on_tool_error_callback=guardian_on_tool_error_callback,
)

__all__ = [
    "root_agent",
    "ROOT_TOOLS",
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

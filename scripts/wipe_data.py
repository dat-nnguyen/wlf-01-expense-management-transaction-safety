"""Post-Hackathon Data & Log Cleanup Script.

Wipes all in-memory database test states, session caches, and mock records.
"""

from packages.financial.dispute.reminder_tracker import ReminderTracker
from packages.financial.monitoring.proactive_monitor import ProactiveMonitorEngine
from packages.financial.security.authenticity_engine import authenticity_engine
from packages.agent.memory import session_memory
from packages.observability.logging import logger


def main():
    print("🔒 Running Post-Hackathon Privacy Data & Log Wipe...")
    ReminderTracker.clear_all()
    ProactiveMonitorEngine.reset_state()
    session_memory.clear_all()
    authenticity_engine.clear_cases()
    print("✅ All temporary test dataset sessions, reminders, and monitor caches have been wiped successfully.")


if __name__ == "__main__":
    main()

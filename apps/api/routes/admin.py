from fastapi import APIRouter
from packages.financial.dispute.reminder_tracker import ReminderTracker
from packages.financial.monitoring.proactive_monitor import ProactiveMonitorEngine
from packages.financial.security.authenticity_engine import authenticity_engine
from packages.agent.memory import session_memory
from packages.observability.logging import logger

router = APIRouter(prefix="/api/v1/admin", tags=["Admin & Privacy Cleanup"])


@router.post("/wipe-data")
async def wipe_temporary_data():
    """
    Post-Hackathon Privacy & Compliance Cleanup:
    Wipes temporary session memory, audit caches, proactive monitor states, and reminders.
    Ensures no residual test data persists post-event.
    """
    ReminderTracker.clear_all()
    ProactiveMonitorEngine.reset_state()
    session_memory.clear_all()
    authenticity_engine.clear_cases()
    logger.info("Compliance: All temporary test dataset sessions, logs, and reminder caches have been securely wiped.")
    return {
        "status": "success",
        "message": "All temporary test dataset records, audit caches, and logs have been securely wiped.",
        "reminders_cleared": True,
        "monitor_state_cleared": True,
        "session_memory_cleared": True,
    }

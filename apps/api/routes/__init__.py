from apps.api.routes.health import router as health_router
from apps.api.routes.chat import router as chat_router
from apps.api.routes.transactions import router as transactions_router
from apps.api.routes.reconciliation import router as reconciliation_router
from apps.api.routes.alerts import router as alerts_router
from apps.api.routes.reports import router as reports_router
from apps.api.routes.advisory import router as advisory_router
from apps.api.routes.hitl import router as hitl_router
from apps.api.routes.notifications import router as notifications_router
from apps.api.routes.security import router as security_router

__all__ = [
    "health_router",
    "chat_router",
    "transactions_router",
    "reconciliation_router",
    "alerts_router",
    "reports_router",
    "advisory_router",
    "hitl_router",
    "notifications_router",
    "security_router",
]


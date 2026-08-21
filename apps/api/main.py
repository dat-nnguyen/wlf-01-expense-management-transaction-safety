from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from packages.db.session import init_db
from packages.observability.logging import logger
from apps.api.routes import (
    health_router,
    chat_router,
    transactions_router,
    reconciliation_router,
    alerts_router,
    reports_router,
    reminders_router,
    monitor_router,
    admin_router,
    advisory_router,
    hitl_router,
    notifications_router,
    security_router,
    audit_router,
    disputes_router,
)



@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing database tables...")
    try:
        init_db()
        logger.info("Database initialized successfully.")
    except Exception as e:
        logger.error(f"Database initialization warning: {e}")
    yield
    logger.info("Shutting down API server...")


app = FastAPI(
    title="Wealify Guardian API",
    description="Agentic Financial Assistant & Transaction Safety Copilot",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(health_router)
app.include_router(chat_router)
app.include_router(transactions_router)
app.include_router(reconciliation_router)
app.include_router(alerts_router)
app.include_router(reports_router)
app.include_router(reminders_router)
app.include_router(monitor_router)
app.include_router(admin_router)
app.include_router(advisory_router)

app.include_router(hitl_router)
app.include_router(notifications_router)
app.include_router(security_router)
app.include_router(audit_router)
app.include_router(disputes_router)


@app.get("/")
def root():
    return {
        "service": "Wealify Guardian API",
        "status": "online",
        "docs": "/docs",
        "health": "/health",
        "capabilities": [
            "14-15_day_overdue_payout_radar",
            "virtual_card_double_swipe_radar",
            "subscription_price_hike_radar",
            "business_health_unit_economics_advisory",
            "self_reflection_grounding_verification",
            "human_in_the_loop_review_queue",
            "automated_email_alert_dispatcher",
        ],
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("apps.api.main:app", host="0.0.0.0", port=8000, reload=True)

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from packages.db.session import init_db
from packages.observability.logging import logger
from apps.api.routes import (
    health_router,
    chat_router,
    transactions_router,
    reconciliation_router,
    alerts_router,
    reports_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schemas on startup
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


@app.get("/")
def root():
    return {
        "message": "Welcome to Wealify Guardian API",
        "docs": "/docs",
        "health": "/health",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("apps.api.main:app", host="0.0.0.0", port=8000, reload=True)

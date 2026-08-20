from fastapi import APIRouter
from packages.observability.metrics import metrics_tracker

router = APIRouter()


@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Wealify Guardian API",
        "version": "0.1.0",
        "metrics": metrics_tracker.get_summary(),
    }

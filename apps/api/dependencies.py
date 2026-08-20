from functools import lru_cache
from fastapi import Depends
from sqlalchemy.orm import Session
from packages.db.session import get_db
from packages.db.repositories.transaction_repo import TransactionRepository
from packages.db.repositories.alert_repo import AlertRepository
from packages.agent.runtime.orchestrator import AgentOrchestrator
from packages.agent.tools import create_default_tool_registry
from packages.agent.providers import get_llm_provider


@lru_cache()
def get_orchestrator() -> AgentOrchestrator:
    registry = create_default_tool_registry()
    llm = get_llm_provider()
    return AgentOrchestrator(registry=registry, llm_provider=llm)


def get_transaction_repo(db: Session = Depends(get_db)) -> TransactionRepository:
    return TransactionRepository(db)


def get_alert_repo(db: Session = Depends(get_db)) -> AlertRepository:
    return AlertRepository(db)

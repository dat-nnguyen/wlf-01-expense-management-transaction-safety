from abc import ABC, abstractmethod
from typing import List, Optional
from packages.data.schemas.transaction import Transaction
from packages.data.schemas.email import EmailEvidence


class BaseTransactionSource(ABC):
    """Abstract interface for reading financial transactions."""

    @abstractmethod
    async def get_transactions(
        self,
        account_id: Optional[str] = None,
        limit: int = 100,
    ) -> List[Transaction]:
        pass


class BaseEmailSource(ABC):
    """Abstract interface for reading email evidence."""

    @abstractmethod
    async def get_emails(
        self,
        query: Optional[str] = None,
        limit: int = 50,
    ) -> List[EmailEvidence]:
        pass

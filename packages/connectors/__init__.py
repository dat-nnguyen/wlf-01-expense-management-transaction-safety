"""Connectors Package for Wealify Guardian."""

from packages.connectors.base import BaseTransactionSource, BaseEmailSource
from packages.connectors.mock import MockTransactionSource, MockEmailSource
from packages.connectors.excel_inbox_connector import ExcelInboxConnector

__all__ = [
    "BaseTransactionSource",
    "BaseEmailSource",
    "MockTransactionSource",
    "MockEmailSource",
    "ExcelInboxConnector",
]

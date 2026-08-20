import os
from packages.agent.providers.base import BaseLLMProvider, LLMResponse
from packages.agent.providers.mock import MockLLMProvider


def get_llm_provider() -> BaseLLMProvider:
    """Factory to get configured LLM Provider."""
    provider_name = os.getenv("LLM_PROVIDER", "mock").lower()
    if provider_name == "mock":
        return MockLLMProvider()
    # Default fallback to mock provider for safe offline runtime
    return MockLLMProvider()


__all__ = [
    "BaseLLMProvider",
    "LLMResponse",
    "MockLLMProvider",
    "get_llm_provider",
]

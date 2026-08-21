"""Google Agent Development Kit (ADK) Entrypoint for Wealify Guardian.

Allows running with standard Google ADK tools:
- adk run
- adk web
- adk deploy cloud_run
"""

from packages.agent.adk import root_agent

# Expose root_agent for Google ADK runner
__all__ = ["root_agent"]

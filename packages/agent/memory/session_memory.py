"""Multi-turn Conversation Memory for Wealify Guardian Agent."""

from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str  # 'user', 'assistant', 'system'
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    intent: Optional[str] = None
    tool_called: Optional[str] = None


class SessionMemoryManager:
    """
    Manages multi-turn conversation context per session_id.
    Ensures the Agent Copilot retains context across multiple questions (Memory).
    """

    def __init__(self, max_history_turns: int = 10):
        self.max_history_turns = max_history_turns
        self._sessions: Dict[str, List[ChatMessage]] = {}

    def add_message(
        self,
        session_id: str,
        role: str,
        content: str,
        intent: Optional[str] = None,
        tool_called: Optional[str] = None,
    ) -> None:
        if session_id not in self._sessions:
            self._sessions[session_id] = []
        
        msg = ChatMessage(
            role=role,
            content=content,
            intent=intent,
            tool_called=tool_called,
        )
        self._sessions[session_id].append(msg)
        
        # Keep within max turns (user + assistant pairs)
        if len(self._sessions[session_id]) > self.max_history_turns * 2:
            self._sessions[session_id] = self._sessions[session_id][-self.max_history_turns * 2:]

    def get_history(self, session_id: str) -> List[ChatMessage]:
        return self._sessions.get(session_id, [])

    def get_formatted_context(self, session_id: str) -> str:
        history = self.get_history(session_id)
        if not history:
            return ""
        
        lines = ["--- Lịch sử hội thoại trước đó (Conversation Context) ---"]
        for msg in history[-6:]:  # Last 3 turns
            role_label = "Người dùng" if msg.role == "user" else "Wealify Guardian"
            lines.append(f"{role_label}: {msg.content}")
        lines.append("---------------------------------------------------------")
        return "\n".join(lines)

    def clear(self, session_id: str) -> None:
        if session_id in self._sessions:
            self._sessions[session_id] = []


# Global Singleton Memory Manager
session_memory = SessionMemoryManager()

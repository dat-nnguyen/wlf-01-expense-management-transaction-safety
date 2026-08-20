import time
from typing import Dict


class MetricsTracker:
    """Collects runtime operational and token usage metrics."""

    def __init__(self):
        self._tool_calls: Dict[str, int] = {}
        self._latencies: Dict[str, list] = {}
        self._tokens_prompt: int = 0
        self._tokens_completion: int = 0

    def record_tool_call(self, tool_name: str, duration_ms: float):
        self._tool_calls[tool_name] = self._tool_calls.get(tool_name, 0) + 1
        if tool_name not in self._latencies:
            self._latencies[tool_name] = []
        self._latencies[tool_name].append(duration_ms)

    def record_tokens(self, prompt_tokens: int, completion_tokens: int):
        self._tokens_prompt += prompt_tokens
        self._tokens_completion += completion_tokens

    def get_summary(self) -> Dict:
        # Estimated cost (based on GPT-4o-mini rates: $0.15/1M in, $0.60/1M out)
        cost = (self._tokens_prompt * 0.00000015) + (self._tokens_completion * 0.0000006)
        return {
            "tool_calls_total": sum(self._tool_calls.values()),
            "tool_calls_by_name": self._tool_calls,
            "total_prompt_tokens": self._tokens_prompt,
            "total_completion_tokens": self._tokens_completion,
            "estimated_cost_usd": round(cost, 6),
        }


metrics_tracker = MetricsTracker()

import pytest
from packages.policy.permissions import ActionType, PolicyDecision
from packages.policy.action_policy import PolicyEngine, SecurityBoundaryViolation
from packages.agent.guardrails.input import InputGuardrail


def test_policy_engine_allowed_actions():
    assert PolicyEngine.evaluate(ActionType.READ_TRANSACTION)[0] == PolicyDecision.ALLOW
    assert PolicyEngine.evaluate(ActionType.DETECT_DUPLICATES)[0] == PolicyDecision.ALLOW
    assert PolicyEngine.evaluate(ActionType.CREATE_REPORT)[0] == PolicyDecision.ALLOW


def test_policy_engine_strictly_denied_actions():
    assert PolicyEngine.evaluate(ActionType.TRANSFER_MONEY)[0] == PolicyDecision.DENY
    assert PolicyEngine.evaluate(ActionType.CANCEL_SUBSCRIPTION)[0] == PolicyDecision.DENY
    assert PolicyEngine.evaluate(ActionType.CHARGEBACK)[0] == PolicyDecision.DENY
    assert PolicyEngine.evaluate(ActionType.SEND_EMAIL_TO_MERCHANT)[0] == PolicyDecision.DENY

    with pytest.raises(SecurityBoundaryViolation):
        PolicyEngine.enforce(ActionType.TRANSFER_MONEY)

    with pytest.raises(SecurityBoundaryViolation):
        PolicyEngine.enforce(ActionType.CANCEL_SUBSCRIPTION)


def test_input_guardrail_blocks_mutation_queries():
    safe1, action1, _ = InputGuardrail.validate_user_message("Chuyển tiền $50 cho Nam")
    assert safe1 is False
    assert action1 == ActionType.TRANSFER_MONEY

    safe2, action2, _ = InputGuardrail.validate_user_message("Huỷ subscription Netflix ngay")
    assert safe2 is False
    assert action2 == ActionType.CANCEL_SUBSCRIPTION

    safe3, _, _ = InputGuardrail.validate_user_message("Tháng này tôi đã chi bao nhiêu?")
    assert safe3 is True

import pytest
from datetime import datetime
from packages.data.parsers.csv_parser import parse_transactions_csv
from packages.data.normalization.normalizer import (
    normalize_merchant_name,
    explain_merchant_descriptor,
    classify_transaction_type,
)
from packages.data.schemas.transaction import TransactionType, TransactionSource


def test_merchant_normalizer_and_explainer():
    assert normalize_merchant_name("AMZN MKTP US*2K19A0") == "Amazon"
    assert normalize_merchant_name("PAYPAL *NETFLIX.COM") == "Netflix"
    assert normalize_merchant_name("ADOBE *CREATIVE CLOUD") == "Adobe Creative Cloud"
    assert normalize_merchant_name("FACEBK *ADS 4812") == "Facebook Ads (Meta)"
    assert normalize_merchant_name("UNKNOWN_TX_123891823") == "Chưa xác định được"

    # Explanation test
    exp_amzn = explain_merchant_descriptor("AMZN MKTP US*2K19A0")
    assert "Amazon" in exp_amzn

    exp_fb = explain_merchant_descriptor("FACEBK *ADS 4812")
    assert "Meta" in exp_fb or "Facebook" in exp_fb

    exp_unknown = explain_merchant_descriptor("UNKNOWN_RANDOM_CODE")
    assert exp_unknown == "Chưa xác định được"


def test_transaction_type_classification():
    assert classify_transaction_type("Lương từ sàn Amazon", 2500.0, "credit") == TransactionType.PAYIN
    assert classify_transaction_type("Payout Amazon Seller", -500.0, "debit") == TransactionType.PAYOUT
    assert classify_transaction_type("Transfer to card 4812", -100.0, "debit") == TransactionType.TRANSFER_TO_CARD
    assert classify_transaction_type("Monthly Account Maintenance Fee", -5.0, "debit") == TransactionType.FEE
    assert classify_transaction_type("Netflix subscription", -15.49, "debit") == TransactionType.SUBSCRIPTION


def test_csv_parser_classification():
    csv_content = """Date,Description,Amount,Type
2026-08-01,Amazon Payout Disbursement,4250.00,credit
2026-08-02,Transfer to Volcano Card 4812,-500.00,debit
2026-08-03,Monthly Banking Maintenance Fee,-10.00,debit
2026-08-04,Netflix Streaming Premium,-15.49,debit
2026-08-05,Facebook Ads Virtual Card,-150.00,debit
2026-08-06,Unidentifiable Merchant Code,-99.00,debit
"""
    txs = parse_transactions_csv(csv_content, source_type=TransactionSource.ACCOUNT, account_id="acc_main")
    assert len(txs) == 6
    assert txs[0].transaction_type in [TransactionType.PAYIN, TransactionType.PAYOUT]
    assert txs[1].transaction_type == TransactionType.TRANSFER_TO_CARD
    assert txs[2].transaction_type == TransactionType.FEE
    assert txs[3].transaction_type == TransactionType.SUBSCRIPTION
    assert txs[4].transaction_type in [TransactionType.CARD_PURCHASE, TransactionType.AD_SPEND]
    assert txs[5].merchant_normalized == "Chưa xác định được"

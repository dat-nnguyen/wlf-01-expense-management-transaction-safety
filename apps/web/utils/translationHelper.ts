import { Language } from '../types';

/**
 * Universal dynamic translation helper to ensure API data and backend responses
 * switch completely between Vietnamese and English when the user changes language.
 */

export function translateStatus(status: string | any, lang: Language): string {
  if (!status) return '';
  const val = typeof status === 'string' ? status : status?.value || String(status);
  if (lang === 'vi') return val;

  const map: Record<string, string> = {
    'Định kỳ đã xác định': 'Confirmed Recurring',
    '① Định kỳ đã xác định': '① Confirmed Recurring',
    'Cần bạn tự xác nhận': 'Needs confirmation',
    '② Cần bạn tự xác nhận': '② Needs Confirmation',
    'Chưa đủ dữ liệu': 'Insufficient data',
    '③ Chưa đủ dữ liệu': '③ Insufficient Data',
    'Hợp lệ': 'Normal',
    'Có email khớp': 'Matched Email',
    'Không tìm thấy': 'Not Found',
    'Không tìm thấy email': 'Not Found',
    'Email nghi giả': 'Suspicious Fake',
    'Đã giải quyết': 'Resolved',
    'Nghi trùng lặp': 'Suspicious Duplicate',
    'Đã hoàn tất': 'Settled',
    'Chậm trễ 16 ngày': '16 Days Overdue',
    'Tiền vào (Pay-in)': 'Pay-in',
    'Tiền ra (Payout)': 'Payout',
    'Chuyển sang thẻ': 'Transfer to Card',
    'Phí (Fee)': 'Fee',
    'Subscription': 'Subscription',
    'Quảng cáo (Ads)': 'Ad Spend',
    'Chi tiêu': 'Expense',
  };

  return map[val] || val;
}

export function translateConfidence(conf: string | any, lang: Language): string {
  if (!conf) return '';
  const val = typeof conf === 'string' ? conf : String(conf);
  if (lang === 'vi') return val;

  if (val.includes('cao') || val.includes('High') || val.includes('Mức độ tin cậy cao')) return 'High Confidence';
  if (val.includes('trung bình') || val.includes('Medium') || val.includes('Mức độ tin cậy trung bình')) return 'Medium Confidence';
  if (val.includes('thấp') || val.includes('Low') || val.includes('Mức độ tin cậy thấp')) return 'Low Confidence';
  return val;
}

export function translateFindingTitle(title: string, lang: Language): string {
  if (!title || lang === 'vi') return title;

  if (title.includes('Tiền rời Account nhưng chưa lên Card')) {
    return title.replace('Tiền rời Account nhưng chưa lên Card', 'Funds left Account but not on Card');
  }
  if (title.includes('Lệch đối soát Account ↔ Wallet')) {
    return title.replace('Lệch đối soát Account ↔ Wallet', 'Reconciliation Mismatch Account ↔ Wallet');
  }
  if (title.includes('Wallet balance không khớp với các transaction')) {
    return title.replace('Wallet balance không khớp với các transaction', 'Wallet balance mismatch against transactions');
  }
  if (title.includes('Account balance không khớp dòng tiền')) {
    return title.replace('Account balance không khớp dòng tiền', 'Account balance mismatch against cashflow');
  }
  if (title.includes('Tiền nạp vào Wallet bị trùng')) {
    return 'Duplicate Wallet Topup detected';
  }
  if (title.includes('Phí bị tính 2 lần')) {
    return 'Fee charged twice across sources';
  }

  return title;
}

export function translateFindingExplanation(exp: string, lang: Language): string {
  if (!exp || lang === 'vi') return exp;

  let res = exp;
  res = res.replace(/Lệch (\$[\d,.]+) giữa Account và Card Statement — chưa xác định nguyên nhân\./g, 'Diff of $1 between Account and Card Statement — root cause undetermined.');
  res = res.replace(/Lệch (\$[\d,.]+) giữa Account và Wallet — chưa xác định nguyên nhân\./g, 'Diff of $1 between Account and Wallet — root cause undetermined.');
  res = res.replace(/Lệch (\$[\d,.]+) giữa Wallet balance và tổng transaction — chưa xác định nguyên nhân\./g, 'Diff of $1 between Wallet balance and transaction sum — root cause undetermined.');
  res = res.replace(/Lệch (\$[\d,.]+) giữa Account balance và dòng tiền thực tế — chưa xác định nguyên nhân\./g, 'Diff of $1 between Account balance and actual cashflow — root cause undetermined.');
  res = res.replace(/Lệch nạp trùng (\$[\d,.]+) trong Wallet — chưa xác định nguyên nhân\./g, 'Duplicate top-up diff of $1 in Wallet — root cause undetermined.');
  res = res.replace(/Lệch phí (\$[\d,.]+) xuất hiện đồng thời trên Account và Card — chưa xác định nguyên nhân\./g, 'Fee diff of $1 appears simultaneously on Account and Card — root cause undetermined.');
  res = res.replace(/chưa xác định nguyên nhân/g, 'root cause undetermined');
  res = res.replace(/Lệch/g, 'Diff');
  res = res.replace(/giữa/g, 'between');
  res = res.replace(/và/g, 'and');
  return res;
}

export function translateEmailReason(reason: string, lang: Language): string {
  if (!reason || lang === 'vi') return reason;

  if (reason.includes('Không tìm thấy hoá đơn điện tử hoặc email biên lai giao dịch tương ứng trong hộp thư đối chiếu')) {
    return 'No electronic invoice or receipt email found in mailbox for this transaction.';
  }

  const matchRegex = /Khớp số tiền (\$[\d,.]+) và đơn vị thụ hưởng ['"]([^'"]+)['"] trong vòng (\d+) ngày/g;
  if (matchRegex.test(reason)) {
    return reason.replace(matchRegex, 'Matched amount $1 and merchant "$2" within $3 days.');
  }

  return reason;
}

export function translateEmailSource(source: string, lang: Language): string {
  if (!source || lang === 'vi') return source;
  if (source.includes('Không tìm thấy')) return 'Not found';
  return source;
}

export function translateAlertTitle(title: string, lang: Language): string {
  if (!title || lang === 'vi') return title;

  if (title.includes('Bất thường Payout chưa về:')) {
    return title.replace('Bất thường Payout chưa về:', 'Unreceived Payout Anomaly:');
  }
  if (title.includes('Cà thẻ 2 lần:')) {
    return title.replace('Cà thẻ 2 lần:', 'Double Charge:');
  }
  if (title.includes('Payout sàn Amazon chậm trễ')) {
    return title.replace('Payout sàn Amazon chậm trễ', 'Overdue Amazon Seller Payout');
  }
  return title;
}

export function translateAlertReason(reason: string, lang: Language): string {
  if (!reason || lang === 'vi') return reason;

  // Handles payout delay alerts: "Email xác nhận giải ngân $2,597.84 USD từ PayPal Payouts ngày 05/06/2026 nhưng sau 78 ngày vẫn chưa thấy tiền về tài khoản Wealify (Quy chuẩn xử lý: 3 ngày)."
  const payoutRegex = /Email xác nhận giải ngân ([\$\d,.]+(?:\s*USD)?) từ (.+?) ngày ([\d/]+) nhưng sau (\d+) ngày vẫn chưa thấy tiền về tài khoản Wealify \(Quy chuẩn xử lý: (\d+) ngày\)\.?/g;
  if (payoutRegex.test(reason)) {
    return reason.replace(
      payoutRegex,
      'Disbursement confirmation of $1 from $2 dated $3, but funds not credited after $4 days (SLA: $5 days).'
    );
  }

  if (reason.includes('Phát hiện 2 giao dịch cùng số tiền')) {
    return reason
      .replace(/Phát hiện 2 giao dịch cùng số tiền (\$[\d,.]+) tại ([^ ]+) chỉ cách nhau ([^ ]+) phút \(Thẻ ảo: ([^)]+)\)\./g, 'Detected 2 identical transactions of $1 at $2 spaced $3 mins apart (Virtual Card: $4).')
      .replace(/Phát hiện 2 giao dịch cùng số tiền/g, 'Detected 2 identical transactions of')
      .replace(/cách nhau/g, 'spaced')
      .replace(/giây trên thẻ ảo/g, 'seconds apart on virtual card')
      .replace(/phút/g, 'mins');
  }

  if (reason.includes('Email giải ngân ngày')) {
    return reason
      .replace(/Email giải ngân ngày ([\d/]+) nhưng tài khoản chưa ghi nhận số dư\./g, 'Disbursement email dated $1 but funds not yet credited to account.')
      .replace('Email giải ngân ngày', 'Disbursement email dated')
      .replace('nhưng tài khoản chưa ghi nhận số dư.', 'but funds not yet credited to account.');
  }

  return reason;
}

export function translateActionSuggestion(suggestion: string, lang: Language): string {
  if (!suggestion || lang === 'vi') return suggestion;

  if (suggestion.includes('Gửi ticket tra soát tới sàn và kiểm tra lại thông tin')) {
    return 'Open dispute ticket with payout platform and verify bank info.';
  }
  if (suggestion.includes('Kiểm tra lại sao kê ngân hàng')) {
    return 'Review bank statement records.';
  }
  if (suggestion.includes('Liên hệ ngân hàng')) {
    return 'Contact bank to initiate formal chargeback dispute.';
  }
  if (suggestion.includes('Kiểm tra lại')) {
    return 'Verify details with issuing bank or merchant.';
  }
  return suggestion;
}

export function translateReminderNotes(notes: string, lang: Language): string {
  if (!notes || lang === 'vi') return notes;

  if (notes.includes('Tra soát khoản quẹt đúp 2 lần cách nhau 105 giây trên thẻ ảo Volcano Ads •••• 4812.')) {
    return 'Dispute double charge 105 seconds apart on virtual card Volcano Ads •••• 4812.';
  }
  if (notes.includes('Email xác nhận giải ngân')) {
    return translateAlertReason(notes, lang);
  }
  if (notes.includes('Giao dịch bất thường')) {
    return notes.replace('Giao dịch bất thường', 'Anomalous charge flagged for dispute.');
  }
  return notes;
}

export function translateMerchantExplanation(exp: string, lang: Language): string {
  if (!exp || lang === 'vi') return exp;

  const map: Record<string, string> = {
    'Chi phí quảng cáo số Facebook Ads': 'Facebook Ads digital marketing spend',
    'Thuê bao phần mềm đồ họa Adobe Creative Cloud': 'Adobe Creative Cloud design subscription',
    'Dịch vụ máy chủ đám mây AWS': 'AWS cloud server infrastructure',
    'Dịch vụ xem phim trực tuyến Netflix': 'Netflix streaming subscription',
    'Dịch vụ thiết kế đồ họa trực tuyến Canva': 'Canva online design subscription',
    'Chuyến xe di chuyển Grab': 'Grab rides and mobility expense',
    'Ăn uống qua GrabFood': 'GrabFood food delivery spend',
    'Chi tiêu cà phê Highlands': 'Highlands Coffee expense',
    'Cà phê Starbucks': 'Starbucks Coffee expense',
    'Siêu thị Annam Gourmet': 'Annam Gourmet grocery spend',
    'Phần mềm ChatGPT Plus': 'OpenAI ChatGPT Plus AI subscription',
    'Cửa hàng tiện lợi Circle K': 'Circle K convenience store',
    'Nhà hàng Pizza 4Ps': 'Pizza 4P\'s dining expense',
    'Giao dịch thương mại trực tuyến.': 'Online commercial transaction.',
  };

  for (const [k, v] of Object.entries(map)) {
    if (exp.includes(k)) return exp.replace(k, v);
  }

  return exp.replace('Giao dịch thương mại trực tuyến.', 'Online commercial transaction.');
}

export function translateEvidenceDimensionName(name: string, lang: Language): string {
  if (!name || lang === 'vi') return name;

  if (name.includes('Mã tham chiếu')) return 'Transaction Reference Code';
  if (name.includes('Số tiền & Sổ cái')) return 'Amount & Ledger Balance';
  if (name.includes('Ví điện tử')) return 'E-Wallet Balance';
  if (name.includes('Hộp thư xác nhận')) return 'Mailbox Confirmation (Email)';
  return name;
}

export function translateEvidenceDimensionDetail(detail: string, lang: Language): string {
  if (!detail || lang === 'vi') return detail;

  let res = detail;
  res = res.replace(/Mã ['"]([^'"]+)['"] không tồn tại trong hệ thống sổ cái Wealify Core Banking\./g, "Reference code '$1' does not exist in Wealify Core Banking ledger.");
  res = res.replace(/Không có biến động số dư ([+\-\$0-9,.]+) USD vào ngày ([\d/]+)\./g, "No incoming balance movement of $1 USD on $2.");
  res = res.replace(/Không có giao dịch nạp tiền hoặc nhận chuyển khoản tương ứng\./g, "No matching wallet top-up or incoming payment transfer found.");
  res = res.replace(/Không có thông báo xác nhận chuyển khoản từ ngân hàng gửi về email\./g, "No bank transfer confirmation email received in verified inbox.");
  return res;
}

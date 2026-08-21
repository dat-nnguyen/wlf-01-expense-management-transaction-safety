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

  if (val.includes('cao') || val.includes('High')) return 'High Confidence';
  if (val.includes('trung bình') || val.includes('Medium')) return 'Medium Confidence';
  if (val.includes('thấp') || val.includes('Low')) return 'Low Confidence';
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

  const payoutRegex = /Email xác nhận giải ngân (\$[\d,.]+(?:\s*USD)?) từ ([^ ]+) ngày ([\d/]+) nhưng sau (\d+) ngày vẫn chưa thấy tiền về tài khoản Wealify \(Quy chuẩn xử lý: (\d+) ngày\)\./g;
  if (payoutRegex.test(reason)) {
    return reason.replace(
      payoutRegex,
      'Disbursement confirmation of $1 from $2 dated $3, but funds not credited after $4 days (SLA: $5 days).'
    );
  }

  if (reason.includes('Phát hiện 2 giao dịch cùng số tiền')) {
    return reason
      .replace('Phát hiện 2 giao dịch cùng số tiền', 'Detected 2 identical transactions of')
      .replace('cách nhau', 'spaced')
      .replace('giây trên thẻ ảo', 'seconds apart on virtual card');
  }

  if (reason.includes('Email giải ngân ngày')) {
    return reason
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
  return suggestion;
}

export function translateReminderNotes(notes: string, lang: Language): string {
  if (!notes || lang === 'vi') return notes;

  if (notes.includes('Tra soát khoản quẹt đúp 2 lần cách nhau 105 giây trên thẻ ảo Volcano Ads •••• 4812.')) {
    return 'Dispute double charge 105 seconds apart on virtual card Volcano Ads •••• 4812.';
  }
  return notes;
}

import { Message, SecurityCaseItem, BotPerformance, RecentBot, NewUser, RelatedTransaction } from '../types';

export const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg_welcome',
    sender: 'bot',
    text: `### 🛡️ Wealify Guardian — AI Expense & Payout Safety Copilot

Xin chào! Tôi là **Wealify Guardian**, trợ lý an toàn tài chính và đối soát dòng tiền cho doanh nghiệp của bạn.

#### 📊 Tình trạng giám sát dòng tiền thời gian thực:
- 🚨 **Amazon Seller Disbursement ($4,250.00 USD)**: Đã 16 ngày kể từ ngày thông báo giải ngân nhưng chưa ghi có vào tài khoản Wealify.
- ⚠️ **Quẹt thẻ ảo Facebook Ads ($150.00 USD x 2)**: Phát hiện 2 giao dịch trừ tiền liên tiếp cách nhau 105 giây trên thẻ *Volcano Ads •••• 4812*.
- 📈 **Adobe Creative Cloud**: Phí định kỳ tăng từ **$49.99** lên **$54.99/tháng** (+10.0%).

*Bạn có thể bấm vào các gợi ý nhanh bên dưới hoặc đặt câu hỏi trực tiếp!*`,
    timestamp: '11:00 AM',
    intent: 'INITIAL_SUMMARY',
    classification: 'Định kỳ đã xác định',
    confidence: 98,
    suggested_chips: [
      'Có khoản Payout nào từ Amazon hay Stripe bị trễ không?',
      'Thẻ ảo chạy ads của tôi có bị cà 2 lần không?',
      'Tình hình kinh doanh và lợi nhuận dòng tiền thế nào, có nên tiếp tục chạy ad không?',
      'Kiểm tra các khoản giao dịch gần đây',
    ],
  },
];

export const DEMO_SECURITY_CASES: SecurityCaseItem[] = [
  {
    id: 'SC-2026-5A432',
    title: 'Ảnh chuyển khoản $2,500 USD không khớp sổ cái',
    amount: '$2,500.00 USD',
    ref: 'WF-839291',
    score: 92,
    status: 'High Risk',
    badge: 'Cần bạn tự xác nhận',
  },
  {
    id: 'SC-2026-9B104',
    title: 'Amazon Payout $4,250 USD chậm trễ 16 ngày',
    amount: '$4,250.00 USD',
    ref: 'AMZ-DISB-9182',
    score: 85,
    status: 'Overdue SLA',
    badge: 'Cần bạn tự xác nhận',
  },
  {
    id: 'SC-2026-3C819',
    title: 'Facebook Ads quẹt đúp 2 lần $150 USD',
    amount: '$150.00 USD x 2',
    ref: 'FB-ADS-4812',
    score: 95,
    status: 'Duplicate',
    badge: 'Cần bạn tự xác nhận',
  },
  {
    id: 'SC-2026-1E550',
    title: 'Adobe CC tăng phí subscription +$5.00/tháng',
    amount: '+$5.00 USD',
    ref: 'SUB-ADOBE-CC',
    score: 90,
    status: 'Price Hike',
    badge: 'Định kỳ đã xác định',
  },
];

export const BOT_PERFORMANCES: BotPerformance[] = [
  { name: 'Financial Reconciliation Copilot', count: '54,210', rate: 99.4, color: 'bg-emerald-400' },
  { name: 'Virtual Card Double-Swipe Radar', count: '38,190', rate: 98.8, color: 'bg-purple-400' },
  { name: 'Cross-Border Payout SLA Tracker', count: '21,430', rate: 97.9, color: 'bg-cyan-400' },
  { name: 'Transaction Authenticity Engine', count: '14,710', rate: 99.1, color: 'bg-amber-400' },
];

export const RECENT_BOTS: RecentBot[] = [
  { name: 'Reconciliation Core', status: 'Online', total: '12,480', succ: '99.5%', latency: '210ms' },
  { name: 'Double-Swipe Radar', status: 'Online', total: '8,920', succ: '99.1%', latency: '195ms' },
  { name: 'Payout SLA Guard', status: 'Online', total: '6,410', succ: '98.7%', latency: '240ms' },
  { name: 'Authenticity OCR Hub', status: 'Online', total: '4,150', succ: '98.2%', latency: '320ms' },
];

export const NEW_USERS: NewUser[] = [
  { email: 'seller.alex@ecombrands.com', bot: 'Reconciliation Core', time: '2 phút trước', channel: 'Web App' },
  { email: 'ops.lead@wealify.io', bot: 'Authenticity OCR Hub', time: '8 phút trước', channel: 'API' },
  { email: 'finance@globalcross.net', bot: 'Payout SLA Guard', time: '14 phút trước', channel: 'Web App' },
  { email: 'growth@nordicventures.co', bot: 'Double-Swipe Radar', time: '21 phút trước', channel: 'SDK' },
];

export const RELATED_TRANSACTIONS: RelatedTransaction[] = [
  {
    merchant: 'FACEBOOK *ADS 84918239',
    time: '20/08/2026 18:21:45',
    amount: '-$150.00 USD',
    badge: 'Nghi trùng lặp',
    badgeStyle: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    isAlert: true,
  },
  {
    merchant: 'FACEBOOK *ADS 84918239',
    time: '20/08/2026 18:20:00',
    amount: '-$150.00 USD',
    badge: 'Đã hoàn tất',
    badgeStyle: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  {
    merchant: 'Amazon Seller Disbursement',
    time: '05/08/2026 09:30:00',
    amount: '+$4,250.00 USD',
    badge: 'Chậm trễ 16 ngày',
    badgeStyle: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    isAlert: true,
  },
];

export const BOT_METRIC_ITEMS = [
  {
    id: 'bot_rec_core',
    name: 'Multi-Source Financial Reconciler',
    engine: 'Gemini 3.7 Flash + Python Deterministic Math',
    category: 'Reconciliation',
    requests: 58420,
    successRate: 99.8,
    groundingRate: 100.0,
    avgLatency: 195,
    p95Latency: 310,
    tokensUsed: '2.1M',
    blockedMutations: 420,
    status: 'optimal' as const,
    description: 'Cross-checks Bank Accounts, Digital Wallets, Cards, and E-commerce Payouts with strict zero-hallucination verification.',
  },
  {
    id: 'bot_card_radar',
    name: 'Virtual Card Double-Swipe Radar',
    engine: 'Sliding 48h Time-Proximity Matcher',
    category: 'Anomaly Detection',
    requests: 41280,
    successRate: 99.4,
    groundingRate: 99.9,
    avgLatency: 172,
    p95Latency: 280,
    tokensUsed: '1.4M',
    blockedMutations: 310,
    status: 'optimal' as const,
    description: 'Realtime duplicate billing detection on virtual cards for FB Ads, Google Ads, and travel merchant terminals.',
  },
  {
    id: 'bot_payout_guard',
    name: 'Cross-Border Payout SLA Guard',
    engine: 'Email Parser & Ledger Reconciliation Engine',
    category: 'Seller Protection',
    requests: 26840,
    successRate: 99.1,
    groundingRate: 100.0,
    avgLatency: 245,
    p95Latency: 390,
    tokensUsed: '1.1M',
    blockedMutations: 195,
    status: 'optimal' as const,
    description: 'Detects Amazon, Stripe, and Etsy payout delays exceeding 14-15 day statutory thresholds and drafts recovery tickets.',
  },
  {
    id: 'bot_auth_forensic',
    name: 'Transaction Authenticity Forensic Hub',
    engine: '5-Dimension Inconsistency Scoring Model',
    category: 'Fraud Prevention',
    requests: 18450,
    successRate: 98.7,
    groundingRate: 99.6,
    avgLatency: 320,
    p95Latency: 520,
    tokensUsed: '850K',
    blockedMutations: 380,
    status: 'optimal' as const,
    description: 'Unmasks fake transfer screenshots and tampered receipt PDFs with evidence inconsistency scoring (0-100).',
  },
  {
    id: 'bot_ecom_advisor',
    name: 'Business Health & ROAS Unit Economics Advisor',
    engine: 'Cashflow Runway & Margin Forecast Engine',
    category: 'Advisory',
    requests: 12930,
    successRate: 99.2,
    groundingRate: 100.0,
    avgLatency: 210,
    p95Latency: 340,
    tokensUsed: '620K',
    blockedMutations: 85,
    status: 'good' as const,
    description: 'Computes real-time Ad Spend vs. Payout margins, ROAS health, and provides Human-in-the-Loop budget adjustments.',
  },
];

export const INTENT_ANALYTICS = [
  { intent: 'DUPLICATE_CHECK', label: 'Quét trừ tiền trùng (Double Swipe)', percentage: 34, count: 53680, color: 'bg-purple-500', tool: 'find_duplicates' },
  { intent: 'OVERDUE_PAYOUT_CHECK', label: 'Đối soát Payout trễ (SLA Breach)', percentage: 26, count: 41020, color: 'bg-cyan-400', tool: 'detect_overdue_payouts' },
  { intent: 'VERIFY_TRANSACTION_AUTHENTICITY', label: 'Xác thực ảnh chứng từ (Anti-Fraud)', percentage: 18, count: 28410, color: 'bg-rose-500', tool: 'verify_transaction_authenticity' },
  { intent: 'BUSINESS_HEALTH_ADVISORY', label: 'Cố vấn kinh doanh & ROAS Ads', percentage: 14, count: 22090, color: 'bg-emerald-400', tool: 'analyze_business_health' },
  { intent: 'DISALLOWED_MUTATION', label: 'Chặn lệnh chuyển tiền (Policy Guard)', percentage: 8, count: 12620, color: 'bg-amber-400', tool: 'None (Blocked)' },
];

export const EXECUTION_LOGS = [
  {
    id: 'run_9b841a2',
    timestamp: '15:48:12',
    userPrompt: 'Có khoản Payout nào từ Amazon hay Stripe bị trễ chưa về không?',
    intent: 'OVERDUE_PAYOUT_CHECK',
    toolCalled: 'detect_overdue_payouts',
    latencyMs: 198,
    groundingVerified: true,
    policyDecision: 'ALLOW' as const,
  },
  {
    id: 'run_4c192e8',
    timestamp: '15:47:45',
    userPrompt: 'Thẻ ảo chạy ads của tôi có bị cà 2 lần không?',
    intent: 'DUPLICATE_CHECK',
    toolCalled: 'find_duplicates',
    latencyMs: 165,
    groundingVerified: true,
    policyDecision: 'ALLOW' as const,
  },
  {
    id: 'run_7a310df',
    timestamp: '15:46:20',
    userPrompt: 'Chuyển $500 sang tài khoản ngân hàng khác giúp tôi',
    intent: 'DISALLOWED_MUTATION',
    toolCalled: 'None',
    latencyMs: 42,
    groundingVerified: true,
    policyDecision: 'DENY' as const,
  },
  {
    id: 'run_1e5920c',
    timestamp: '15:45:02',
    userPrompt: 'Người này gửi ảnh nói Wealify đã chuyển $2,500 cho tôi. Có thật không?',
    intent: 'VERIFY_TRANSACTION_AUTHENTICITY',
    toolCalled: 'verify_transaction_authenticity',
    latencyMs: 310,
    groundingVerified: true,
    policyDecision: 'ALLOW' as const,
  },
  {
    id: 'run_6d8829a',
    timestamp: '15:43:18',
    userPrompt: 'Tình hình kinh doanh và lợi nhuận dòng tiền thế nào, có nên tiếp tục chạy ad không?',
    intent: 'BUSINESS_HEALTH_ADVISORY',
    toolCalled: 'analyze_business_health',
    latencyMs: 218,
    groundingVerified: true,
    policyDecision: 'ALLOW' as const,
  },
];

export const EMAIL_NOTIFICATION_LOGS = [
  {
    id: 'notif_dup_4812',
    recipient_email: 'founder@wealify.io',
    recipient_role: 'user',
    subject: '[Wealify Guardian Alert] ⚠️ Cảnh báo quẹt thẻ ảo 2 lần: Facebook Ads ($150.00 x 2)',
    alert_type: 'duplicate',
    severity: 'CRITICAL',
    summary: 'Phát hiện 2 giao dịch -$150.00 USD cách nhau 105s trên thẻ Volcano Ads •••• 4812 cho cùng chiến dịch.',
    sent_at: '15:47:46 (Hôm nay)',
    status: 'sent',
    html_content: `<b>CẢNH BÁO QUẸT THẺ ĐÚP:</b> Đã phát hiện 2 giao dịch $150.00 USD tại Facebook Ads trên thẻ ảo VPBank •••• 4812 chỉ cách nhau 1 phút 45 giây. Đề xuất: Liên hệ VPBank tra soát hoàn lại $150.00 USD trong hạn 60 ngày.`,
  },
  {
    id: 'notif_sub_adobe',
    recipient_email: 'founder@wealify.io',
    recipient_role: 'user',
    subject: '[Wealify Guardian Alert] 📈 Thuê bao tăng giá: Adobe Creative Cloud tăng +10.0%',
    alert_type: 'price_hike',
    severity: 'WARNING',
    summary: 'Chi phí định kỳ tăng từ $49.99 lên $54.99/tháng (+10.0%, tăng thêm $60.00/năm).',
    sent_at: '14:20:10 (Hôm nay)',
    status: 'sent',
    html_content: `<b>CẢNH BÁO SUBSCRIPTION TĂNG GIÁ:</b> Adobe Creative Cloud vừa tăng giá định kỳ từ $49.99 lên $54.99/tháng (+10.0%). Đề xuất: Đàm phán lại gói doanh nghiệp hoặc hủy các seat không hoạt động.`,
  },
  {
    id: 'notif_payout_amz',
    recipient_email: 'founder@wealify.io',
    recipient_role: 'user',
    subject: '[Wealify Guardian Alert] 🚨 Payout sàn Amazon chậm trễ 16 ngày ($4,250.00 USD)',
    alert_type: 'overdue_payout',
    severity: 'CRITICAL',
    summary: 'Amazon Disbursement ID AMZ-DISB-9182 ($4,250.00 USD) đã quá hạn 16 ngày chưa ghi có vào tài khoản Wealify.',
    sent_at: '09:15:30 (Hôm nay)',
    status: 'sent',
    html_content: `<b>CẢNH BÁO PAYOUT TRỄ > 14 NGÀY:</b> Khoản giải ngân $4,250.00 USD từ Amazon Seller Central đã quá hạn 16 ngày. Đề xuất: Mở ticket tra soát đối chiếu MT103 với Amazon Seller Support.`,
  },
  {
    id: 'notif_fake_receipt',
    recipient_email: 'founder@wealify.io',
    recipient_role: 'user',
    subject: '[Wealify Guardian Alert] 🛑 Cảnh báo chứng từ không hợp lệ: Yêu cầu $2,500.00 USD Ref WF-839291',
    alert_type: 'unverified_screenshot',
    severity: 'CRITICAL',
    summary: 'Ảnh chụp màn hình có dấu hiệu chỉnh sửa, mã Ref không tồn tại trên hệ thống sổ cái ngân hàng.',
    sent_at: 'Hôm qua',
    status: 'sent',
    html_content: `<b>GIÁM ĐỊNH TÍNH XÁC THỰC:</b> Mã giao dịch WF-839291 ($2,500.00 USD) hoàn toàn không có trong sổ cái. Tuyệt đối không giao hàng hoặc chuyển tiền lại.`,
  },
];



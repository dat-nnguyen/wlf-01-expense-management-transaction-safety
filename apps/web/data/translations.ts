import { Language } from '../types';

export const TRANSLATIONS = {
  vi: {
    // Header & Fixed Banner
    appName: 'WEALIFY GUARDIAN',
    appTag: 'Transaction Safety',
    apiOnline: 'API Online',
    darkMode: 'Chế độ tối',
    lightMode: 'Chế độ sáng',
    fixedWarningBanner: 'Công cụ này chỉ hỗ trợ bạn rà soát tài chính. Kết quả để tham khảo, không phải kết luận chính thức của Wealify và không thay cho việc bạn tự kiểm tra. Nếu thấy giao dịch lạ, hãy liên hệ hỗ trợ ngay — ở Mỹ thời hạn khiếu nại là 60 ngày kể từ ngày ngân hàng gửi sao kê.',

    // Navigation Tabs (10 Standard Items)
    navCategoryMain: 'NGHIỆP VỤ ĐỐI SOÁT & AN TOÀN',
    navCategorySystem: 'HỆ THỐNG & KIỂM TOÁN',
    tabChat: 'AI Financial Copilot',
    tabDashboard: 'Dashboard Tổng Quan',
    tabTransactions: 'Sao Kê Giao Dịch (Statements)',
    tab3WayRecon: 'Đối Soát 3 Nguồn (Account ↔ Wallet ↔ Card)',
    tabEmailMatching: 'Đối Soát Email (Matching)',
    tabAlerts: 'Cảnh Báo 3 Mức (Alerts)',
    tabReminders: 'Hạn 60 Ngày & Nhắc Nhở',
    tabReports: 'Báo Cáo & Dự Báo (Reports)',
    tabAudit: 'Nhật Ký Kiểm Toán (Audit Trail)',
    tabMonitor: 'Quét Định Kỳ (Proactive Monitor)',

    // Chat / Welcome
    welcomeTitle: 'Wealify Guardian Copilot',
    welcomeDesc: 'Trợ lý tài chính và bảo vệ giao dịch doanh nghiệp. Bạn có thể hỏi bất kỳ câu hỏi nào về thu chi, phí, subscription, hoặc yêu cầu đối soát 3 nguồn.',
    quickCheckTx: 'Kiểm tra giao dịch',
    quickCheckPayout: 'Kiểm tra Payout trễ',
    quickCheckDup: 'Quét trừ tiền trùng',
    quickCheckAdvisory: 'Tư vấn ROAS & Dòng tiền',
    promptCheckRecent: 'Tháng này tôi chi bao nhiêu?',
    promptCheckFee: 'Tổng các khoản phí của tôi là bao nhiêu?',
    promptCheckTop3: '3 khoản chi lớn nhất của tôi là gì?',
    promptCheckSub: 'Tôi đang có những subscription nào?',
    promptCheck3Way: 'Có tiền nào rời tài khoản nhưng chưa lên thẻ không?',
    promptCheckDup: 'Có khoản nào bị tính hai lần không?',
    promptCheckSafety: 'Tài khoản của mình có an toàn không?',
    promptCheckPayout: 'Kiểm tra tiền payout bán hàng từ Amazon / Stripe',
    promptCheckAdvisory: 'Tư vấn tình hình tài chính và chi phí vận hành',


    // Chat Chips & Prompts
    chipCheckTx: 'Kiểm tra giao dịch',
    chipCheckImage: 'Kiểm tra ảnh thanh toán',
    chipCheckEmail: 'Kiểm tra email',
    chipCheckDup: 'Kiểm tra khoản trừ',
    chipReconciliation: 'Đối soát giao dịch',
    chipSendReport: 'Gửi báo cáo cho tôi',
    chipViewEvidence: 'Xem chi tiết bằng chứng',
    chipRecheckPartner: 'Kiểm tra lại với đối tác',
    chipViewDisputeTime: 'Xem hạn khiếu nại',

    // Input Box
    inputPlaceholder: 'Hỏi Guardian bất cứ điều gì về tài chính của bạn...',
    uploadTooltip: 'Tải lên sao kê PDF/CSV hoặc ảnh chứng từ để đối soát',
    disclaimer: 'Công cụ này chỉ hỗ trợ bạn rà soát tài chính. Kết quả để tham khảo, không phải kết luận chính thức của Wealify và không thay cho việc bạn tự kiểm tra. Nếu thấy giao dịch lạ, hãy liên hệ hỗ trợ ngay — ở Mỹ thời hạn khiếu nại là 60 ngày kể từ ngày ngân hàng gửi sao kê.',

    // Transaction Detail Panel (Right Sidebar)
    reconciliationInfo: 'Thông tin đối soát',
    ready: 'Sẵn sàng',
    noSelectedTx: 'Chưa có giao dịch đang chọn',
    sendImageOrChatHint: 'Hỏi Guardian trong khung chat hoặc chọn giao dịch để tra soát chi tiết.',
    disputeDeadlineTitle: 'Thời hạn khiếu nại quy định',
    disputeDays: '60 ngày',
    fromStatementDate: 'Tính từ ngày ngân hàng gửi sao kê',
    disputeDesc: 'Hệ thống Guardian sẽ tự động đếm ngược thời gian khi phát hiện giao dịch bất thường trên thẻ hoặc tài khoản.',
    relatedTxTitle: 'Giao dịch liên quan',
    noRelatedTx: 'Chưa có giao dịch liên quan',
    dataAutoAppears: 'Dữ liệu sẽ tự động xuất hiện khi tra soát',

    // Notification / Toast
    copiedSuccess: 'Đã sao chép:',
    reportSentSuccess: 'Đã gửi báo cáo qua email thành công.',

    // Email Modal
    emailModalTitle: 'Xác Nhận Gửi Báo Cáo Tài Chính',
    emailModalSubtitle: 'Hệ thống tuân thủ nghiêm ngặt nguyên tắc Human-In-The-Loop (HITL)',
    recipientLabel: 'Người nhận (Email tài khoản):',
    subjectLabel: 'Tiêu đề thư:',
    emailSafetyPolicy: 'Chính sách bảo mật: Hệ thống chỉ gửi email khi có sự đồng ý tường minh của bạn.',
    cancel: 'Huỷ bỏ',
    confirmAndSend: 'Xác nhận & Gửi Email',

    // Evidence Verification Modal
    evidenceModalTitle: 'Giám Định Bằng Chứng & Tính Xác Thực Giao Dịch',
    evidenceModalSubtitle: 'Công cụ đối chiếu chéo số cái (Ledger) và bằng chứng số',
    evidenceTimelineTitle: 'Tiến trình phân tích số cái',
    step1: 'Trích xuất thông tin giao dịch được khai báo',
    step2: 'Truy vấn số cái Wealify Core Banking Engine',
    step3: 'Đối chiếu biên lai hộp thư doanh nghiệp',
    step4: 'Phân tích chữ ký số và mã định danh giao dịch',
    step5: 'Phát hiện điểm sai lệch và mâu thuẫn bằng chứng',
    conflictScoreLabel: 'Điểm mâu thuẫn bằng chứng (Conflict Score):',
    highRiskTag: 'Mâu thuẫn cao',
    classificationLabel: 'Phân loại:',
    needsUserConfirmation: 'Cần bạn tự xác nhận',
    authenticitySummary: 'Hệ thống đã đối soát toàn bộ số cái kế toán và hộp thư. Không tìm thấy lệnh chuyển tiền tương ứng với mã số giao dịch được cung cấp. Khuyến nghị bạn không thực hiện bàn giao dịch vụ/hàng hoá trước khi tiền thực tế vào tài khoản.',
    recommendationTitle: 'Khuyến nghị an toàn cho chủ tài khoản:',
    rec1: 'Kiểm tra trực tiếp biến động số dư trên ứng dụng ngân hàng chính thức.',
    rec2: 'Yêu cầu đối tác cung cấp mã tra soát liên ngân hàng (ARN / MT103).',
    rec3: 'Không click vào đường link lạ hoặc quét mã QR ngoài luồng.',
    close: 'Đóng',
    sendReportToMyEmail: 'Gửi báo cáo qua Email của tôi',
  },

  en: {
    // Header & Fixed Banner
    appName: 'WEALIFY GUARDIAN',
    appTag: 'Transaction Safety',
    apiOnline: 'API Online',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    fixedWarningBanner: 'This tool is designed for financial review assistance only. Results are informational and do not constitute an official Wealify determination, nor do they replace your own verification. If you notice an unfamiliar transaction, contact support immediately — in the U.S., the statutory dispute window is 60 days from the statement date.',

    // Navigation Tabs (10 Standard Items)
    navCategoryMain: 'RECONCILIATION & SAFETY',
    navCategorySystem: 'SYSTEM & AUDIT',
    tabChat: 'AI Financial Copilot',
    tabDashboard: 'Financial Dashboard',
    tabTransactions: 'Account Statements (CSV/PDF)',
    tab3WayRecon: '3-Way Reconciliation',
    tabEmailMatching: 'Email Matching (4-Col)',
    tabAlerts: 'Tri-State Alerts',
    tabReminders: '60-Day Deadlines & Reminders',
    tabReports: 'Reports & Forecast',
    tabAudit: 'Audit Trail (Export)',
    tabMonitor: 'Proactive Monitor',

    // Chat / Welcome
    welcomeTitle: 'Wealify Guardian Copilot',
    welcomeDesc: 'Enterprise AI financial assistant & transaction safety copilot. Ask any question regarding spend, fees, subscriptions, or 3-way reconciliation.',
    quickCheckTx: 'Check Transactions',
    quickCheckPayout: 'Check Delayed Payouts',
    quickCheckDup: 'Scan Double Charges',
    quickCheckAdvisory: 'ROAS & Advisory',
    promptCheckRecent: 'How much did I spend this month?',
    promptCheckFee: 'What are my total fees?',
    promptCheckTop3: 'What are my top 3 largest expenses?',
    promptCheckSub: 'What active subscriptions do I have?',
    promptCheck3Way: 'Did any money leave my account but not appear on my card?',
    promptCheckDup: 'Are there any duplicate charges?',
    promptCheckSafety: 'Is my account safe?',
    promptCheckPayout: 'Check payout disbursements from Amazon / Stripe',
    promptCheckAdvisory: 'Financial health advisory and expense review',


    // Chat Chips & Prompts
    chipCheckTx: 'Audit transactions',
    chipCheckImage: 'Verify payment screenshot',
    chipCheckEmail: 'Check emails',
    chipCheckDup: 'Scan duplicates',
    chipReconciliation: 'Reconcile ledgers',
    chipSendReport: 'Email report to me',
    chipViewEvidence: 'View evidence details',
    chipRecheckPartner: 'Reverify with partner',
    chipViewDisputeTime: 'Check dispute deadline',

    // Input Box
    inputPlaceholder: 'Ask Guardian anything about your financial safety...',
    uploadTooltip: 'Upload statement PDF/CSV or proof document for review',
    disclaimer: 'This tool is designed for financial review assistance only. Results are informational and do not constitute an official Wealify determination, nor do they replace your own verification. If you notice an unfamiliar transaction, contact support immediately — in the U.S., the statutory dispute window is 60 days from the statement date.',

    // Transaction Detail Panel (Right Sidebar)
    reconciliationInfo: 'Reconciliation Status',
    ready: 'Ready',
    noSelectedTx: 'No transaction selected',
    sendImageOrChatHint: 'Query Guardian in chat or select a transaction to view detailed evidence.',
    disputeDeadlineTitle: 'Statutory Dispute Window',
    disputeDays: '60 Days',
    fromStatementDate: 'From bank statement date',
    disputeDesc: 'Guardian automatically counts down statutory windows when anomalies are detected on your cards or accounts.',
    relatedTxTitle: 'Related Transactions',
    noRelatedTx: 'No related transactions found',
    dataAutoAppears: 'Data will appear automatically during investigation',

    // Notification / Toast
    copiedSuccess: 'Copied:',
    reportSentSuccess: 'Report email sent successfully.',

    // Email Modal
    emailModalTitle: 'Confirm Financial Report Dispatch',
    emailModalSubtitle: 'Strict adherence to Human-In-The-Loop (HITL) safety principles',
    recipientLabel: 'Recipient Email:',
    subjectLabel: 'Subject:',
    emailSafetyPolicy: 'Safety Policy: Reports are only dispatched with your explicit confirmation.',
    cancel: 'Cancel',
    confirmAndSend: 'Confirm & Dispatch',

    // Evidence Verification Modal
    evidenceModalTitle: 'Evidence & Transaction Authenticity Audit',
    evidenceModalSubtitle: 'Cross-verification engine between core ledger and external proof',
    evidenceTimelineTitle: 'Ledger Audit Timeline',
    step1: 'Extract declared transaction metadata',
    step2: 'Query Wealify Core Banking Ledger',
    step3: 'Cross-check business mailbox evidence',
    step4: 'Analyze digital signature & transaction reference',
    step5: 'Flag discrepancies and evidence conflicts',
    conflictScoreLabel: 'Evidence Inconsistency Score:',
    highRiskTag: 'High Conflict',
    classificationLabel: 'Classification:',
    needsUserConfirmation: 'Needs user confirmation',
    authenticitySummary: 'Audit across all banking ledgers and inbox logs completed. No corresponding settlement was found for the referenced transaction ID. We advise holding fulfillment until funds are confirmed in your bank account.',
    recommendationTitle: 'Security Recommendations:',
    rec1: 'Verify official bank app balance directly.',
    rec2: 'Request interbank ARN / MT103 reference code from the counterparty.',
    rec3: 'Avoid clicking unknown external links or scanning unverified QR codes.',
    close: 'Close',
    sendReportToMyEmail: 'Send Report to My Email',
  },
};

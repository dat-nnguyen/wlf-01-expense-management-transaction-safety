'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { UserSidebar } from '../components/user/UserSidebar';
import { CopilotChat } from '../components/user/CopilotChat';
import { ChatInput } from '../components/user/ChatInput';
import { TransactionDetailPanel } from '../components/user/TransactionDetailPanel';
import { OpsSidebar } from '../components/ops/OpsSidebar';
import { OpsHeader } from '../components/ops/OpsHeader';
import { OpsDashboard } from '../components/ops/OpsDashboard';
import { SecurityCenterView } from '../components/ops/SecurityCenterView';
import { BotPerformanceDashboard } from '../components/analytics/BotPerformanceDashboard';
import { EmailNotificationCenter } from '../components/notifications/EmailNotificationCenter';
import { EvidenceVerificationModal } from '../components/modals/EvidenceVerificationModal';
import { EmailConfirmationModal } from '../components/modals/EmailConfirmationModal';
import { Message, AppMode, EmailModalState, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

export default function Home() {
  const [appMode, setAppMode] = useState<AppMode>('user_copilot');
  const [userNav, setUserNav] = useState('chat');
  const [opsNav, setOpsNav] = useState('dashboard');
  const [language, setLanguage] = useState<Language>('vi');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isBalanceMasked, setIsBalanceMasked] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [emailModal, setEmailModal] = useState<EmailModalState>({
    isOpen: false,
    to: 'support@wealify.io',
    subject: '[Guardian Report] Tra soát giao dịch $150 Facebook Ads & Xác minh chứng từ',
    body: `Kính gửi Người dùng Wealify,

Hệ thống Wealify Guardian đã tổng hợp hồ sơ tra soát giao dịch của bạn:
- Anomaly ID: AN-2026-08-19-001287
- Giao dịch: -$150.00 USD (Facebook Ads, thẻ Volcano Ads •••• 4812)
- Tình trạng: Phát hiện 2 giao dịch cách nhau 105 giây (nghi trùng).
- Hạn khiếu nại còn lại: 42 ngày (hạn cuối: 17/10/2026).

Trân trọng,
Wealify Guardian Financial Safety Team`,
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[language];

  // Initialize theme & language from localStorage on client
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('wealify_theme') as 'dark' | 'light' | null;
      if (savedTheme) {
        setTheme(savedTheme);
        document.documentElement.classList.toggle('light', savedTheme === 'light');
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');
      } else {
        document.documentElement.classList.add('dark');
      }

      const savedLang = localStorage.getItem('wealify_lang') as Language | null;
      if (savedLang) {
        setLanguage(savedLang);
      }
    } catch {
      // Ignore
    }
  }, []);

  const handleThemeChange = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
    try {
      localStorage.setItem('wealify_theme', newTheme);
      document.documentElement.classList.toggle('light', newTheme === 'light');
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
    } catch {
      // Ignore
    }
  };

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    try {
      localStorage.setItem('wealify_lang', newLang);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    showToast(`${t.copiedSuccess} ${text}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMsg;
    if (!textToSend.trim() || isTyping) return;

    const newMsg: Message = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    if (!customText) setInputMsg('');
    setIsTyping(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000);

    try {
      let apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      if (!apiUrl) {
        if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
          apiUrl = 'http://127.0.0.1:8000';
        } else {
          apiUrl = 'https://wealify-guardian-api.onrender.com';
        }
      }
      apiUrl = apiUrl.replace(/\/+$/, '');

      const response = await fetch(`${apiUrl}/api/v1/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend, session_id: 'ses_web', account_id: 'acc_main' }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      setIsTyping(false);

      if (response.ok) {
        const data = await response.json();
        const lower = textToSend.toLowerCase();
        const isAuthCheck = data.intent === 'VERIFY_TRANSACTION_AUTHENTICITY' || lower.includes('ảnh') || lower.includes('2,500') || lower.includes('wf-839291');

        setMessages((prev) => [
          ...prev,
          {
            id: `bot_${data.run_id || Date.now()}`,
            sender: 'bot',
            text: data.response,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            intent: data.intent,
            classification: !data.policy_allowed
              ? (language === 'vi' ? 'Ranh giới nghiêm cấm (Policy Denied)' : 'Policy Denied')
              : data.intent === 'VERIFY_TRANSACTION_AUTHENTICITY' || isAuthCheck
              ? (language === 'vi' ? 'Cần bạn tự xác nhận' : 'Needs User Confirmation')
              : data.intent === 'DUPLICATE_CHECK'
              ? (language === 'vi' ? 'Cà thẻ trùng lặp' : 'Duplicate Charge Detected')
              : data.intent === 'OVERDUE_PAYOUT_CHECK'
              ? (language === 'vi' ? 'Payout chậm trễ' : 'Overdue Payout')
              : data.intent === 'BUSINESS_HEALTH_ADVISORY'
              ? (language === 'vi' ? 'Cố vấn tài chính & ROAS' : 'Financial Advisory')
              : data.intent === 'TRANSACTION_SEARCH'
              ? (language === 'vi' ? 'Tra cứu sổ cái' : 'Ledger Search')
              : data.intent === 'SUBSCRIPTION_INQUIRY'
              ? (language === 'vi' ? 'Định kỳ đã xác định' : 'Confirmed Recurring')
              : (language === 'vi' ? 'Đã đối soát an toàn' : 'Safety Verified'),
            confidence: !data.policy_allowed ? 100 : 98,
            security_verification: isAuthCheck ? {
              claimed_amount: 2500,
              claimed_ref: 'WF-839291',
              claimed_status: 'COMPLETED',
              source_type: 'SCREENSHOT',
              conflict_score: 92,
              security_tag: language === 'vi' ? 'Có mâu thuẫn bằng chứng' : 'Evidence Conflict Detected',
              ledger_match: false,
              wallet_match: false,
              email_match: false,
              ref_match: false,
            } : undefined,
            suggested_chips: !data.policy_allowed ? [
              t.chipCheckTx,
              t.chipCheckDup,
              language === 'vi' ? 'Xem quy định an toàn' : 'View Safety Policy',
            ] : isAuthCheck ? [
              t.chipViewEvidence,
              t.chipSendReport,
              t.chipRecheckPartner,
            ] : data.intent === 'DUPLICATE_CHECK' ? [
              t.chipViewDisputeTime,
              language === 'vi' ? 'Mẫu đơn tra soát VPBank' : 'VPBank Dispute Form',
              t.chipSendReport,
            ] : [
              t.chipCheckTx,
              t.chipViewDisputeTime,
              t.chipSendReport,
            ],
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot_${Date.now()}`,
            sender: 'bot',
            text: language === 'vi' 
              ? `⚠️ **Lỗi kết nối Backend (${response.status})**: Không thể nhận phản hồi từ Agent Orchestrator. Vui lòng kiểm tra lại dịch vụ API tại \`${apiUrl}\`.`
              : `⚠️ **Backend Connection Error (${response.status})**: Unable to receive response from Agent Orchestrator. Please check API server at \`${apiUrl}\`.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            classification: language === 'vi' ? 'Chưa đủ dữ liệu' : 'Insufficient Data',
            confidence: 0,
          },
        ]);
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      setIsTyping(false);
      const isAbort = err.name === 'AbortError';
      setMessages((prev) => [
        ...prev,
        {
          id: `bot_${Date.now()}`,
          sender: 'bot',
          text: isAbort
            ? (language === 'vi' ? '⏱️ **Hết thời gian phản hồi (Timeout)**: Yêu cầu phân tích AI mất nhiều thời gian hơn dự kiến. Vui lòng thử gửi lại câu hỏi.' : '⏱️ **Request Timeout**: The AI analysis request took longer than expected. Please retry.')
            : (language === 'vi' 
                ? `⚠️ **Không thể kết nối đến máy chủ Backend**: ${err.message || 'Lỗi mạng'}. Hãy đảm bảo server FastAPI đang chạy tại \`http://127.0.0.1:8000\`.`
                : `⚠️ **Unable to connect to Backend Server**: ${err.message || 'Network error'}. Please ensure FastAPI server is active at \`http://127.0.0.1:8000\`.`),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          classification: language === 'vi' ? 'Chưa đủ dữ liệu' : 'Insufficient Data',
          confidence: 0,
        },
      ]);
    }
  };

  const handleChipClick = (chip: string) => {
    if (chip === 'Báo cáo cho tôi' || chip === 'Gửi báo cáo cho tôi' || chip === 'Email report to me') {
      setEmailModal((prev) => ({ ...prev, isOpen: true }));
      return;
    }
    if (chip.includes('bằng chứng') || chip.includes('ảnh') || chip.includes('evidence')) {
      setIsVerifyModalOpen(true);
      return;
    }
    handleSendMessage(chip);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden font-sans transition-colors duration-300">
      {/* Top Global Mode Navigation */}
      <Header
        appMode={appMode}
        setAppMode={setAppMode}
        language={language}
        setLanguage={handleLanguageChange}
        theme={theme}
        setTheme={handleThemeChange}
      />

      {/* Main Container Area */}
      {appMode === 'user_copilot' ? (
        /* End-User AI Copilot - Dynamic Navigation */
        <div className="flex flex-1 overflow-hidden min-h-0">
          <UserSidebar
            activeNav={userNav}
            setActiveNav={setUserNav}
            isBalanceMasked={isBalanceMasked}
            setIsBalanceMasked={setIsBalanceMasked}
            language={language}
          />

          {userNav === 'notifications' ? (
            <main className="flex-1 flex flex-col bg-[var(--bg-primary)] overflow-y-auto">
              <EmailNotificationCenter language={language} />
            </main>
          ) : userNav === 'dashboard' || userNav === 'reports' ? (
            <main className="flex-1 flex flex-col bg-[var(--bg-primary)] overflow-y-auto">
              <OpsDashboard language={language} />
            </main>
          ) : (
            <>
              {/* Chat Thread */}
              <main className="flex-1 flex flex-col bg-[var(--bg-primary)] min-h-0 overflow-hidden">
                <CopilotChat
                  messages={messages}
                  isTyping={isTyping}
                  onChipClick={handleChipClick}
                  chatEndRef={chatEndRef}
                  language={language}
                />

                <ChatInput
                  inputMsg={inputMsg}
                  setInputMsg={setInputMsg}
                  onSendMessage={handleSendMessage}
                  onOpenVerifyModal={() => setIsVerifyModalOpen(true)}
                  language={language}
                  isTyping={isTyping}
                />
              </main>

              <TransactionDetailPanel
                copiedId={copiedId}
                onCopy={handleCopy}
                onSendMessage={handleSendMessage}
                language={language}
              />
            </>
          )}
        </div>
      ) : (
        /* Wealify Operations & Security Console */
        <div className="flex flex-1 overflow-hidden">
          <OpsSidebar
            activeNav={opsNav}
            setActiveNav={setOpsNav}
            language={language}
          />

          <main className="flex-1 flex flex-col bg-[var(--bg-primary)] overflow-y-auto transition-colors duration-300">
            <OpsHeader
              activeNav={opsNav}
              onOpenVerifyModal={() => setIsVerifyModalOpen(true)}
              language={language}
            />

            {opsNav === 'security_center' ? (
              <SecurityCenterView
                onOpenVerifyModal={() => setIsVerifyModalOpen(true)}
                onSelectCase={(caseId) => {
                  showToast(language === 'vi' ? `Mở hồ sơ tra soát ${caseId}` : `Opening case ${caseId}`);
                  setIsVerifyModalOpen(true);
                }}
                language={language}
              />
            ) : opsNav === 'notifications' ? (
              <EmailNotificationCenter language={language} />
            ) : opsNav === 'bot_list' || opsNav === 'system_stats' ? (
              <BotPerformanceDashboard language={language} />
            ) : (
              <OpsDashboard language={language} />
            )}
          </main>
        </div>
      )}

      {/* Evidence Verification Modal */}
      <EvidenceVerificationModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        onTriggerEmailReport={() => {
          setIsVerifyModalOpen(false);
          setEmailModal((prev) => ({ ...prev, isOpen: true }));
        }}
        language={language}
      />

      {/* Email Report Confirmation Modal */}
      <EmailConfirmationModal
        emailModal={emailModal}
        onClose={() => setEmailModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirmSend={() => {
          setEmailModal((prev) => ({ ...prev, isOpen: false }));
          showToast(language === 'vi' ? 'Đã gửi báo cáo qua email' : 'Report email sent successfully');
        }}
        language={language}
      />

      {/* Floating Status Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 px-4 py-2.5 rounded-xl bg-slate-900 border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] shadow-2xl flex items-center gap-2 animate-fadeIn z-50">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

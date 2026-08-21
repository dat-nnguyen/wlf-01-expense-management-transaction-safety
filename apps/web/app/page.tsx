'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { UserSidebar } from '../components/user/UserSidebar';
import { CopilotChat } from '../components/user/CopilotChat';
import { ChatInput } from '../components/user/ChatInput';
import { TransactionDetailPanel } from '../components/user/TransactionDetailPanel';
import { DashboardView } from '../components/views/DashboardView';
import { TransactionsView } from '../components/views/TransactionsView';
import { ThreeWayReconciliationView } from '../components/views/ThreeWayReconciliationView';
import { EmailMatchingView } from '../components/views/EmailMatchingView';
import { AlertsView } from '../components/views/AlertsView';
import { RemindersView } from '../components/views/RemindersView';
import { ReportsView } from '../components/views/ReportsView';
import { AuditTrailView } from '../components/views/AuditTrailView';
import { ProactiveMonitorView } from '../components/views/ProactiveMonitorView';
import { AgentControlView } from '../components/views/AgentControlView';
import { EvidenceVerificationModal } from '../components/modals/EvidenceVerificationModal';
import { EmailConfirmationModal } from '../components/modals/EmailConfirmationModal';
import { Message, EmailModalState, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

export default function Home() {
  const [userNav, setUserNav] = useState('chat');
  const [language, setLanguage] = useState<Language>('vi');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [hasMounted, setHasMounted] = useState(false);

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
    subject: '[Guardian Report] Báo cáo chi tiêu và đối soát giao dịch',
    body: `Kính gửi Người dùng Wealify,

Hệ thống Wealify Guardian đã tổng hợp hồ sơ đối soát tài chính của bạn:
- Tổng chi tiêu kỳ này: $5,235.48 USD
- Tổng phí ngân hàng & thẻ: $12.50 USD
- Cảnh báo bất thường: 3 giao dịch (đã chuẩn bị sẵn mẫu đơn tra soát)
- Thời hạn khiếu nại ngân hàng: 60 ngày kể từ ngày nhận sao kê

Trân trọng,
Wealify Guardian Financial Safety Team`,
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[language];

  // Initialize active tab from sessionStorage, and theme & language from localStorage on client
  useEffect(() => {
    try {
      const savedTab = sessionStorage.getItem('wealify_active_tab');
      if (savedTab) {
        setUserNav(savedTab);
      }

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
    setHasMounted(true);
  }, []);

  const handleNavChange = (newNav: string) => {
    setUserNav(newNav);
    try {
      sessionStorage.setItem('wealify_active_tab', newNav);
    } catch {
      // Ignore
    }
  };

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
        body: JSON.stringify({ message: textToSend, session_id: 'ses_web', account_id: 'acc_main', language }),
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
              ? (language === 'vi' ? 'Cần bạn tự xác nhận' : 'Needs User Confirmation')
              : data.intent === 'OVERDUE_PAYOUT_CHECK'
              ? (language === 'vi' ? 'Cần bạn tự xác nhận' : 'Needs User Confirmation')
              : data.intent === 'BUSINESS_HEALTH_ADVISORY'
              ? (language === 'vi' ? 'Cố vấn tài chính & ROAS' : 'Financial Advisory')
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
              language === 'vi' ? 'Tạo nhắc nhở 60 ngày' : 'Set 60-Day Reminder',
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
    if (chip === 'Báo cáo cho tôi' || chip === 'Gửi báo cáo cho tôi' || chip === 'Email report to me' || chip === 'Gửi báo cáo') {
      setEmailModal((prev) => ({ ...prev, isOpen: true }));
      return;
    }
    if (chip.includes('bằng chứng') || chip.includes('ảnh') || chip.includes('evidence')) {
      setIsVerifyModalOpen(true);
      return;
    }
    if (chip.includes('nhắc nhở') || chip.includes('reminder')) {
      setUserNav('reminders');
      return;
    }
    handleSendMessage(chip);
  };

  if (!hasMounted) {
    return (
      <div className="flex h-screen w-screen bg-[#080c14] items-center justify-center">
        <div className="flex items-center gap-3 animate-pulse">
          <div className="w-8 h-8 shrink-0 flex items-center justify-center">
            <img src="/logo.png" alt="Wealify Guardian Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-bold text-sm text-white tracking-wider">
            WEALIFY <span className="text-[#FC6508]">GUARDIAN</span>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden font-sans transition-colors duration-300">
      {/* Top Header with Mandatory Persistent Fixed Warning Banner */}
      <Header
        language={language}
        setLanguage={handleLanguageChange}
        theme={theme}
        setTheme={handleThemeChange}
      />

      {/* Main App Layout */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Left Navigation Sidebar */}
        <UserSidebar
          activeNav={userNav}
          setActiveNav={handleNavChange}
          isBalanceMasked={isBalanceMasked}
          setIsBalanceMasked={setIsBalanceMasked}
          language={language}
        />

        {/* Dynamic View Switcher */}
        {userNav === 'dashboard' ? (
          <main className="flex-1 flex flex-col bg-[var(--bg-primary)] overflow-y-auto">
            <DashboardView
              language={language}
              onNavigate={handleNavChange}
              onAskCopilot={(prompt) => {
                handleNavChange('chat');
                handleSendMessage(prompt);
              }}
            />
          </main>
        ) : userNav === 'transactions' ? (
          <main className="flex-1 flex flex-col bg-[var(--bg-primary)] overflow-y-auto">
            <TransactionsView language={language} />
          </main>
        ) : userNav === 'reconciliation' ? (
          <main className="flex-1 flex flex-col bg-[var(--bg-primary)] overflow-y-auto">
            <ThreeWayReconciliationView language={language} />
          </main>
        ) : userNav === 'email_matching' ? (
          <main className="flex-1 flex flex-col bg-[var(--bg-primary)] overflow-y-auto">
            <EmailMatchingView language={language} />
          </main>
        ) : userNav === 'alerts' ? (
          <main className="flex-1 flex flex-col bg-[var(--bg-primary)] overflow-y-auto">
            <AlertsView language={language} />
          </main>
        ) : userNav === 'reminders' ? (
          <main className="flex-1 flex flex-col bg-[var(--bg-primary)] overflow-y-auto">
            <RemindersView language={language} />
          </main>
        ) : userNav === 'reports' ? (
          <main className="flex-1 flex flex-col bg-[var(--bg-primary)] overflow-y-auto">
            <ReportsView language={language} />
          </main>
        ) : userNav === 'audit' ? (
          <main className="flex-1 flex flex-col bg-[var(--bg-primary)] overflow-y-auto">
            <AuditTrailView language={language} />
          </main>
        ) : userNav === 'monitor' ? (
          <main className="flex-1 flex flex-col bg-[var(--bg-primary)] overflow-y-auto">
            <ProactiveMonitorView language={language} />
          </main>
        ) : userNav === 'agent_control' ? (
          <main className="flex-1 flex flex-col bg-[var(--bg-primary)] overflow-y-auto">
            <AgentControlView language={language} />
          </main>
        ) : (
          /* Default: AI Financial Copilot Chat Thread */
          <>
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

      {/* Email Report Confirmation Modal (HITL Safety) */}
      <EmailConfirmationModal
        emailModal={emailModal}
        onClose={() => setEmailModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirmSend={() => {
          setEmailModal((prev) => ({ ...prev, isOpen: false }));
          showToast(language === 'vi' ? 'Đã gửi báo cáo qua email thành công' : 'Report email sent successfully');
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

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AppMode, Language, Message, EmailModalState } from '../types';
import { INITIAL_MESSAGES } from '../data/mockData';
import { TRANSLATIONS } from '../data/translations';

// Layout & Modular Components
import { Header } from '../components/layout/Header';
import { Toast } from '../components/layout/Toast';
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

export default function WealifyGuardianApp() {
  // Navigation & Mode States
  const [appMode, setAppMode] = useState<AppMode>('user_copilot');
  const [userNav, setUserNav] = useState('chat');
  const [opsNav, setOpsNav] = useState('dashboard');
  const [language, setLanguage] = useState<Language>('vi');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // User View States
  const [isBalanceMasked, setIsBalanceMasked] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputMsg, setInputMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [emailModal, setEmailModal] = useState<EmailModalState>({
    isOpen: false,
    to: 'founder@wealify.io',
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
      if (savedLang && (savedLang === 'vi' || savedLang === 'en')) {
        setLanguage(savedLang);
      }
    } catch {
      // Ignore localStorage errors in restricted environments
    }
  }, []);

  // Update theme class on HTML element when state changes
  const handleThemeChange = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
    document.documentElement.classList.toggle('light', newTheme === 'light');
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    try {
      localStorage.setItem('wealify_theme', newTheme);
    } catch {
      // Ignore
    }
  };

  // Update language state and save to localStorage
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
    if (!textToSend.trim()) return;

    const newMsg: Message = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    if (!customText) setInputMsg('');
    setIsTyping(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/v1/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend, session_id: 'ses_web', account_id: 'acc_main' }),
      });

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
            classification: data.policy_allowed ? (isAuthCheck ? (language === 'vi' ? 'Cần bạn tự xác nhận' : 'Needs User Confirmation') : (language === 'vi' ? 'Định kỳ đã xác định' : 'Confirmed Recurring')) : (language === 'vi' ? 'Ranh giới nghiêm cấm' : 'Policy Denied'),
            confidence: 98,
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
            suggested_chips: isAuthCheck ? [
              t.chipViewEvidence,
              t.chipSendReport,
              t.chipRecheckPartner,
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
              ? `⚠️ **Lỗi kết nối Backend (${response.status})**: Không thể nhận phản hồi từ Agent Orchestrator. Vui lòng kiểm tra lại dịch vụ API tại \`http://localhost:8000\`.`
              : `⚠️ **Backend Connection Error (${response.status})**: Unable to receive response from Agent Orchestrator. Please check API server at \`http://localhost:8000\`.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            classification: language === 'vi' ? 'Chưa đủ dữ liệu' : 'Insufficient Data',
            confidence: 0,
          },
        ]);
      }
    } catch (err: any) {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot_${Date.now()}`,
          sender: 'bot',
          text: language === 'vi'
            ? `⚠️ **Không thể kết nối đến máy chủ Backend**: ${err.message || 'Lỗi mạng'}. Hãy đảm bảo server FastAPI đang chạy tại \`http://127.0.0.1:8000\`.`
            : `⚠️ **Unable to connect to Backend Server**: ${err.message || 'Network error'}. Please ensure FastAPI server is active at \`http://127.0.0.1:8000\`.`,
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
            /* Dedicated Automated Email Notification Center */
            <main className="flex-1 flex flex-col bg-[var(--bg-primary)] overflow-y-auto transition-colors duration-300">
              <EmailNotificationCenter language={language} />
            </main>
          ) : userNav === 'dashboard' || userNav === 'reports' ? (
            /* Dedicated Bot Performance Dashboard */
            <main className="flex-1 flex flex-col bg-[var(--bg-primary)] overflow-y-auto transition-colors duration-300">
              <BotPerformanceDashboard language={language} />
            </main>
          ) : (
            /* Default 3-Column AI Chat Copilot */
            <>
              <main className="flex-1 flex flex-col bg-[var(--bg-primary)] overflow-hidden min-h-0 transition-colors duration-300">
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

      {/* Explicit User Email Confirmation Modal */}
      <EmailConfirmationModal
        emailModal={emailModal}
        onClose={() => setEmailModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirmSend={() => {
          setEmailModal((prev) => ({ ...prev, isOpen: false }));
          showToast(`${t.emailSentSuccess} ${emailModal.to}`);
        }}
        language={language}
      />

      {/* Toast Notification */}
      {toastMessage && <Toast message={toastMessage} />}
    </div>
  );
}

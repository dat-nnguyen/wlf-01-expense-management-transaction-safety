'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AppMode, Language, Message, EmailModalState } from '../types';
import { INITIAL_MESSAGES } from '../data/mockData';

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
import { EvidenceVerificationModal } from '../components/modals/EvidenceVerificationModal';
import { EmailConfirmationModal } from '../components/modals/EmailConfirmationModal';

export default function WealifyGuardianApp() {
  // Navigation & Mode States
  const [appMode, setAppMode] = useState<AppMode>('user_copilot');
  const [userNav, setUserNav] = useState('chat');
  const [opsNav, setOpsNav] = useState('dashboard');
  const [language, setLanguage] = useState<Language>('vi');

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
    showToast(`Đã sao chép: ${text}`);
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
            classification: data.policy_allowed ? (isAuthCheck ? 'Cần bạn tự xác nhận' : 'Định kỳ đã xác định') : 'Ranh giới nghiêm cấm',
            confidence: 98,
            security_verification: isAuthCheck ? {
              claimed_amount: 2500,
              claimed_ref: 'WF-839291',
              claimed_status: 'COMPLETED',
              source_type: 'SCREENSHOT',
              conflict_score: 92,
              security_tag: 'Có mâu thuẫn bằng chứng',
              ledger_match: false,
              wallet_match: false,
              email_match: false,
              ref_match: false,
            } : undefined,
            suggested_chips: isAuthCheck ? [
              'Xem chi tiết bằng chứng',
              'Gửi báo cáo cho tôi',
              'Kiểm tra lại với đối tác',
            ] : [
              'Kiểm tra giao dịch',
              'Xem hạn khiếu nại',
              'Báo cáo cho tôi',
            ],
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot_${Date.now()}`,
            sender: 'bot',
            text: `⚠️ **Lỗi kết nối Backend (${response.status})**: Không thể nhận phản hồi từ Agent Orchestrator. Vui lòng kiểm tra lại dịch vụ API tại \`http://localhost:8000\`.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            classification: 'Chưa đủ dữ liệu',
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
          text: `⚠️ **Không thể kết nối đến máy chủ Backend**: ${err.message || 'Lỗi mạng'}. Hãy đảm bảo server FastAPI đang chạy tại \`http://127.0.0.1:8000\`.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          classification: 'Chưa đủ dữ liệu',
          confidence: 0,
        },
      ]);
    }
  };

  const handleChipClick = (chip: string) => {
    if (chip === 'Báo cáo cho tôi' || chip === 'Gửi báo cáo cho tôi') {
      setEmailModal((prev) => ({ ...prev, isOpen: true }));
      return;
    }
    if (chip.includes('bằng chứng') || chip.includes('ảnh')) {
      setIsVerifyModalOpen(true);
      return;
    }
    handleSendMessage(chip);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#060913] text-[#f8fafc] overflow-hidden font-sans">
      {/* Top Global Mode Navigation */}
      <Header
        appMode={appMode}
        setAppMode={setAppMode}
        language={language}
        setLanguage={setLanguage}
      />

      {/* Main Container Area */}
      {appMode === 'user_copilot' ? (
        /* End-User AI Copilot (Screenshot 1) - 3 Column Layout */
        <div className="flex flex-1 overflow-hidden min-h-0">
          <UserSidebar
            activeNav={userNav}
            setActiveNav={setUserNav}
            isBalanceMasked={isBalanceMasked}
            setIsBalanceMasked={setIsBalanceMasked}
          />

          <main className="flex-1 flex flex-col bg-[#060913] overflow-hidden min-h-0">
            <CopilotChat
              messages={messages}
              isTyping={isTyping}
              onChipClick={handleChipClick}
              chatEndRef={chatEndRef}
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
          />
        </div>
      ) : (
        /* Wealify Operations & Security Console (Screenshot 2) */
        <div className="flex flex-1 overflow-hidden">
          <OpsSidebar
            activeNav={opsNav}
            setActiveNav={setOpsNav}
          />

          <main className="flex-1 flex flex-col bg-[#060913] overflow-y-auto">
            <OpsHeader
              activeNav={opsNav}
              onOpenVerifyModal={() => setIsVerifyModalOpen(true)}
            />

            {opsNav === 'security_center' ? (
              <SecurityCenterView
                onOpenVerifyModal={() => setIsVerifyModalOpen(true)}
                onSelectCase={(caseId) => {
                  showToast(`Mở hồ sơ tra soát ${caseId}`);
                  setIsVerifyModalOpen(true);
                }}
              />
            ) : (
              <OpsDashboard />
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
      />

      {/* Explicit User Email Confirmation Modal */}
      <EmailConfirmationModal
        emailModal={emailModal}
        onClose={() => setEmailModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirmSend={() => {
          setEmailModal((prev) => ({ ...prev, isOpen: false }));
          showToast(`✓ Đã gửi báo cáo bảo mật tới email: ${emailModal.to}`);
        }}
      />

      {/* Toast Notification */}
      {toastMessage && <Toast message={toastMessage} />}
    </div>
  );
}

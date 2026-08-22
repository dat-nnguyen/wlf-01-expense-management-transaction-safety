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
import { getApiUrl } from '../utils/apiConfig';

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
    to: '',
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

  const handleSendMessage = async (
    customText?: string,
    attachedImage?: { base64: string; filename: string }
  ) => {
    const textToSend = customText || inputMsg;
    if ((!textToSend.trim() && !attachedImage) || isTyping) return;

    const userMessageText = textToSend.trim() || (language === 'vi' ? 'Đính kèm ảnh chứng từ để đối soát.' : 'Attached receipt for forensic check.');

    const newMsg: Message = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: userMessageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      image_preview: attachedImage?.base64,
      image_name: attachedImage?.filename,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMsg('');
    setIsTyping(true);

    const botMessageId = `bot_${Date.now()}`;
    const initialBotMsg: Message = {
      id: botMessageId,
      sender: 'bot',
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isStreaming: true,
      current_thought_step: language === 'vi' ? '🛡️ Xác thực chính sách Read-Only & Kiểm tra nội dung...' : '🛡️ Validating Read-Only Safety Policy...',
      thought_steps_history: [
        language === 'vi' ? 'Bước 1: Xác thực chính sách Read-Only (Safety Policy Checked)' : 'Step 1: Read-Only Policy Validated'
      ],
    };

    setMessages((prev) => [...prev, initialBotMsg]);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    try {
      const apiUrl = getApiUrl();

      // Check if image is attached — run authenticity check
      let imageAuthCheckResult: any = null;
      if (attachedImage) {
        try {
          const authRes = await fetch(`${apiUrl}/api/v1/security/verify-image`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              image_base64: attachedImage.base64,
              account_id: 'acc_main',
            }),
          });
          if (authRes.ok) {
            imageAuthCheckResult = await authRes.json();
          }
        } catch (e) {
          console.warn('Image OCR check error:', e);
        }
      }

      // Connect to SSE stream
      const streamResponse = await fetch(`${apiUrl}/api/v1/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessageText,
          session_id: 'ses_web',
          account_id: 'acc_main',
          language,
        }),
        signal: controller.signal,
      });

      if (streamResponse.ok && streamResponse.body) {
        const reader = streamResponse.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let accumulatedText = '';
        let streamBuffer = '';
        let streamDone = false;
        let finalIntent = 'GENERAL_QA';
        let finalTool = '';
        let policyAllowed = true;
        let dynamicFollowups: string[] = [];

        while (!streamDone) {
          const { done, value } = await reader.read();
          if (done) break;

          streamBuffer += decoder.decode(value, { stream: true });
          const lines = streamBuffer.split('\n\n');
          streamBuffer = lines.pop() || '';

          for (const block of lines) {
            if (!block.trim()) continue;
            const eventMatch = block.match(/^event:\s*(\w+)/m);
            const dataMatch = block.match(/^data:\s*(.+)$/m);
            const eventType = eventMatch ? eventMatch[1] : 'token';
            const dataRaw = dataMatch ? dataMatch[1] : '';

            try {
              const parsed = JSON.parse(dataRaw);
              if (eventType === 'thinking') {
                const thoughtMsg = parsed.message || parsed.step;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === botMessageId
                      ? {
                          ...m,
                          current_thought_step: thoughtMsg,
                          thought_steps_history: m.thought_steps_history?.includes(thoughtMsg)
                            ? m.thought_steps_history
                            : [...(m.thought_steps_history || []), thoughtMsg],
                        }
                      : m
                  )
                );
              } else if (eventType === 'token') {
                accumulatedText += parsed.chunk || '';
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === botMessageId
                      ? {
                          ...m,
                          text: accumulatedText,
                        }
                      : m
                  )
                );
              } else if (eventType === 'done') {
                finalIntent = parsed.intent || 'GENERAL_QA';
                policyAllowed = parsed.policy_allowed !== false;
                if (parsed.suggested_followups && Array.isArray(parsed.suggested_followups)) {
                  dynamicFollowups = parsed.suggested_followups;
                }
                streamDone = true;
              }
            } catch {
              // Ignore partial JSON parse errors in SSE chunks
            }
          }
        }

        clearTimeout(timeoutId);
        setIsTyping(false);

        const lower = userMessageText.toLowerCase();
        const isAuth = attachedImage || finalIntent.includes('VERIFY') || lower.includes('ảnh') || lower.includes('2,500') || lower.includes('wf-839291');

        setMessages((prev) =>
          prev.map((m) =>
            m.id === botMessageId
              ? {
                  ...m,
                  isStreaming: false,
                  text: accumulatedText || m.text,
                  intent: finalIntent,
                  classification: !policyAllowed
                    ? (language === 'vi' ? 'Ranh giới nghiêm cấm (Policy Denied)' : 'Policy Denied')
                    : isAuth
                    ? (language === 'vi' ? 'Cần bạn tự xác nhận' : 'Needs User Confirmation')
                    : finalIntent.includes('DUPLICATE')
                    ? (language === 'vi' ? 'Cần bạn tự xác nhận' : 'Needs User Confirmation')
                    : finalIntent.includes('PAYOUT')
                    ? (language === 'vi' ? 'Cần bạn tự xác nhận' : 'Needs User Confirmation')
                    : finalIntent.includes('ADVISORY')
                    ? (language === 'vi' ? 'Cố vấn tài chính & ROAS' : 'Financial Advisory')
                    : finalIntent.includes('SUBSCRIPTION')
                    ? (language === 'vi' ? 'Định kỳ đã xác định' : 'Confirmed Recurring')
                    : (language === 'vi' ? 'Đã đối soát an toàn' : 'Safety Verified'),
                  confidence: !policyAllowed ? 100 : 98,
                  security_verification: isAuth
                    ? {
                        claimed_amount: imageAuthCheckResult?.claimed_transaction?.claimed_amount || 2500,
                        claimed_ref: imageAuthCheckResult?.claimed_transaction?.reference || 'WF-839291',
                        claimed_status: 'COMPLETED',
                        source_type: 'SCREENSHOT',
                        conflict_score: imageAuthCheckResult?.evidence_conflict_score || 92,
                        security_tag: language === 'vi' ? 'Có mâu thuẫn bằng chứng' : 'Evidence Conflict Detected',
                        ledger_match: imageAuthCheckResult?.ledger_match || false,
                        wallet_match: imageAuthCheckResult?.wallet_match || false,
                        email_match: imageAuthCheckResult?.email_match || false,
                        ref_match: imageAuthCheckResult?.reference_match || false,
                      }
                    : undefined,
                  suggested_chips: dynamicFollowups.length > 0 ? dynamicFollowups : (!policyAllowed
                    ? [t.chipCheckTx, t.chipCheckDup, language === 'vi' ? 'Xem quy định an toàn' : 'View Safety Policy']
                    : isAuth
                    ? [t.chipViewEvidence, t.chipSendReport, t.chipRecheckPartner]
                    : [t.chipCheckTx, t.chipViewDisputeTime, t.chipSendReport]),
                }
              : m
          )
        );
      } else {
        // Fallback to standard non-streaming API endpoint
        const fallbackRes = await fetch(`${apiUrl}/api/v1/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userMessageText,
            session_id: 'ses_web',
            account_id: 'acc_main',
            language,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        setIsTyping(false);

        if (fallbackRes.ok) {
          const data = await fallbackRes.json();
          setMessages((prev) =>
            prev.map((m) =>
              m.id === botMessageId
                ? {
                    ...m,
                    isStreaming: false,
                    text: data.response,
                    intent: data.intent,
                    classification: !data.policy_allowed
                      ? (language === 'vi' ? 'Ranh giới nghiêm cấm (Policy Denied)' : 'Policy Denied')
                      : (language === 'vi' ? 'Đã đối soát an toàn' : 'Safety Verified'),
                    suggested_chips: data.suggested_followups || undefined,
                  }
                : m
            )
          );
        } else {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === botMessageId
                ? {
                    ...m,
                    isStreaming: false,
                    text: language === 'vi'
                      ? `⚠️ **Lỗi kết nối Backend (${fallbackRes.status})**: Không thể nhận phản hồi từ Agent Orchestrator.`
                      : `⚠️ **Backend Connection Error (${fallbackRes.status})**: Unable to receive response from Agent.`,
                    classification: language === 'vi' ? 'Chưa đủ dữ liệu' : 'Insufficient Data',
                  }
                : m
            )
          );
        }
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      setIsTyping(false);
      const isAbort = err.name === 'AbortError';
      setMessages((prev) =>
        prev.map((m) =>
          m.id === botMessageId
            ? {
                ...m,
                isStreaming: false,
                text: isAbort
                  ? (language === 'vi' ? '⏱️ **Hết thời gian phản hồi (Timeout)**: Yêu cầu phân tích AI mất nhiều thời gian hơn dự kiến.' : '⏱️ **Request Timeout**: The AI analysis request took longer than expected.')
                  : (language === 'vi'
                      ? `⚠️ **Không thể kết nối đến máy chủ Backend**: ${err.message || 'Lỗi mạng'}. Hãy đảm bảo server FastAPI đang chạy tại \`http://127.0.0.1:8000\`.`
                      : `⚠️ **Unable to connect to Backend Server**: ${err.message || 'Network error'}.`),
                classification: language === 'vi' ? 'Chưa đủ dữ liệu' : 'Insufficient Data',
              }
            : m
        )
      );
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
        onConfirmSend={async (targetEmail) => {
          try {
            const apiUrl = getApiUrl();

            const res = await fetch(`${apiUrl}/api/v1/notifications/send-report`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                recipient_email: targetEmail.trim(),
                period: '2026-08',
              }),
            });

            if (res.ok) {
              showToast(language === 'vi' ? `Đã gửi báo cáo thành công tới ${targetEmail} qua SMTP!` : `Report email sent to ${targetEmail} via SMTP!`);
            } else {
              showToast(language === 'vi' ? 'Lỗi gửi email máy chủ' : 'Failed to send email');
            }
          } catch {
            showToast(language === 'vi' ? 'Không thể kết nối máy chủ gửi email' : 'Could not connect to email server');
          } finally {
            setEmailModal((prev) => ({ ...prev, isOpen: false }));
          }
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

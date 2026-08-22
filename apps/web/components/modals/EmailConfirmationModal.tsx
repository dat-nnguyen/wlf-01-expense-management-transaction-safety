import React, { useState, useEffect } from 'react';
import { Mail, AlertTriangle, Check, Loader2 } from 'lucide-react';
import { EmailModalState, Language } from '../../types';
import { TRANSLATIONS } from '../../data/translations';

interface EmailConfirmationModalProps {
  emailModal: EmailModalState;
  onClose: () => void;
  onConfirmSend: (recipientEmail: string) => Promise<void> | void;
  language: Language;
}

export const EmailConfirmationModal: React.FC<EmailConfirmationModalProps> = ({
  emailModal,
  onClose,
  onConfirmSend,
  language,
}) => {
  if (!emailModal.isOpen) return null;
  const t = TRANSLATIONS[language];
  const [recipient, setRecipient] = useState<string>(emailModal.to || '');
  const [isSending, setIsSending] = useState<boolean>(false);

  useEffect(() => {
    if (emailModal.to) {
      setRecipient(emailModal.to);
    }
  }, [emailModal.to]);

  const handleSend = async () => {
    setIsSending(true);
    try {
      await onConfirmSend(recipient);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="w-full max-w-lg bg-[var(--bg-modal)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center gap-2.5 border-b border-[var(--border-subtle)] pb-3">
          <div className="w-8 h-8 rounded-lg bg-[#FC6508] text-white flex items-center justify-center">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[var(--text-primary)]">{t.emailModalTitle}</h3>
            <p className="text-[11px] text-[var(--text-muted)]">{t.emailModalSubtitle}</p>
          </div>
        </div>

        <div className="space-y-2.5 text-xs">
          <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-1.5">
            <label className="text-[var(--text-muted)] font-medium block">{t.recipientLabel} (Live SMTP):</label>
            <input
              type="email"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder={language === 'vi' ? 'Nhập email người nhận (VD: you@company.com)...' : 'Enter recipient email (e.g. you@company.com)...'}
              className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] px-3 py-1.5 rounded-lg text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[#FC6508]"
            />
          </div>

          <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-0.5">
            <div className="text-[var(--text-muted)] font-medium">{t.subjectLabel}</div>
            <div className="font-semibold text-[var(--text-primary)]">{emailModal.subject}</div>
          </div>

          <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-0.5 max-h-32 overflow-y-auto font-mono text-[11px] text-[var(--text-secondary)] whitespace-pre-line leading-relaxed">
            {emailModal.body}
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-400 flex items-center gap-2 font-medium">
          <AlertTriangle className="w-4 h-4 shrink-0 text-[#FC6508]" />
          <span>
            {t.emailSafetyPolicy}
          </span>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[var(--border-subtle)]">
          <button
            onClick={onClose}
            className="btn-secondary text-xs"
            disabled={isSending}
          >
            {t.cancel}
          </button>
          <button
            onClick={handleSend}
            disabled={isSending}
            className="btn-wealify text-xs flex items-center gap-1.5"
          >
            {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            <span>{isSending ? (language === 'vi' ? 'Đang gửi qua SMTP...' : 'Sending via SMTP...') : t.confirmAndSend}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

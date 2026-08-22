import React, { useRef, useState } from 'react';
import { Paperclip, Image as ImageIcon, Send, Search, ShieldAlert, CreditCard, Loader2, X, RefreshCw, Layers } from 'lucide-react';
import { Language } from '../../types';
import { TRANSLATIONS } from '../../data/translations';

interface AttachedFile {
  base64: string;
  filename: string;
  sizeFormatted: string;
  previewUrl: string;
}

interface ChatInputProps {
  inputMsg: string;
  setInputMsg: (msg: string) => void;
  onSendMessage: (customText?: string, attachedImage?: { base64: string; filename: string }) => void;
  onOpenVerifyModal: () => void;
  language: Language;
  isTyping?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  inputMsg,
  setInputMsg,
  onSendMessage,
  onOpenVerifyModal,
  language,
  isTyping = false,
}) => {
  const t = TRANSLATIONS[language];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      const sizeKB = (file.size / 1024).toFixed(1);
      setAttachedFile({
        base64,
        filename: file.name,
        sizeFormatted: `${sizeKB} KB`,
        previewUrl: base64,
      });
      if (!inputMsg.trim()) {
        setInputMsg(
          language === 'vi'
            ? `Tôi gửi ảnh chứng từ/biên lai ${file.name}. Nhờ Guardian kiểm tra xác thực đối soát với số cái và email giúp tôi.`
            : `I uploaded receipt/statement image ${file.name}. Please verify authenticity and cross-check against Wealify ledger.`
        );
      }
    };
    reader.readAsDataURL(file);
    // Reset file input value to allow re-uploading same file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = () => {
    setAttachedFile(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((inputMsg.trim() || attachedFile) && !isTyping) {
      const imgPayload = attachedFile ? { base64: attachedFile.base64, filename: attachedFile.filename } : undefined;
      const text = inputMsg.trim();
      setInputMsg('');
      setAttachedFile(null);
      onSendMessage(text || undefined, imgPayload);
    }
  };

  return (
    <div className="flex flex-col shrink-0 transition-colors">
      {/* Quick Action Chips Bar */}
      <div className="px-3 sm:px-6 py-2 border-t border-[var(--border-subtle)] bg-[var(--bg-header)] flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none whitespace-nowrap">
        <button
          type="button"
          onClick={() => onSendMessage(t.promptCheckRecent)}
          disabled={isTyping}
          className="action-chip text-[11px] sm:text-xs shrink-0 disabled:opacity-50"
        >
          <Search className="w-3.5 h-3.5" />
          <span>{t.chipCheckTx}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (fileInputRef.current) {
              fileInputRef.current.click();
            }
          }}
          disabled={isTyping}
          className="action-chip text-[11px] sm:text-xs shrink-0 disabled:opacity-50 text-[#FC6508] border-[#FC6508]/30 hover:border-[#FC6508]"
          title={language === 'vi' ? 'Chọn file ảnh chứng từ từ máy tính' : 'Upload receipt file from computer'}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>{language === 'vi' ? 'Đính kèm ảnh biên lai' : 'Upload Receipt Image'}</span>
        </button>

        <button
          type="button"
          onClick={onOpenVerifyModal}
          disabled={isTyping}
          className="action-chip text-[11px] sm:text-xs shrink-0 disabled:opacity-50"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
          <span>{language === 'vi' ? 'Giám định biên lai mẫu' : 'Sample Receipt Forensics'}</span>
        </button>

        <button
          type="button"
          onClick={() => onSendMessage(language === 'vi' ? 'Có khoản Payout nào từ Amazon hay Stripe bị trễ không?' : 'Are there any overdue payouts from Amazon or Stripe?')}
          disabled={isTyping}
          className="action-chip text-[11px] sm:text-xs shrink-0 disabled:opacity-50"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{language === 'vi' ? 'Quét Payout trễ hạn' : 'Overdue Payout Radar'}</span>
        </button>

        <button
          type="button"
          onClick={() => onSendMessage(t.promptCheckDup)}
          disabled={isTyping}
          className="action-chip text-[11px] sm:text-xs shrink-0 disabled:opacity-50"
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>{t.chipCheckDup}</span>
        </button>

        <button
          type="button"
          onClick={() => onSendMessage(language === 'vi' ? 'Có tiền nào rời tài khoản ngân hàng nhưng chưa lên thẻ ảo không?' : 'Is there any money transferred from bank account not appearing on cards?')}
          disabled={isTyping}
          className="action-chip text-[11px] sm:text-xs shrink-0 disabled:opacity-50"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{language === 'vi' ? 'Đối soát 3 nguồn (Bank ↔ Ví ↔ Thẻ)' : '3-Way Reconciliation'}</span>
        </button>
      </div>

      {/* Chat Input Box & Fixed Safety Disclaimer */}
      <div className="p-2.5 sm:p-4 bg-[var(--bg-sidebar)] border-t border-[var(--border-subtle)] space-y-2">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Attached Image Preview Badge */}
        {attachedFile && (
          <div className="flex items-center gap-2.5 p-2 px-3 rounded-xl bg-[var(--bg-card)] border border-[#FC6508]/40 shadow-sm animate-fadeIn">
            {attachedFile.previewUrl.startsWith('data:image') ? (
              <img
                src={attachedFile.previewUrl}
                alt="preview"
                className="w-10 h-10 object-cover rounded-lg border border-[var(--border-subtle)]"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)]">
                <Paperclip className="w-5 h-5" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-[var(--text-primary)] truncate flex items-center gap-1.5">
                <span>{attachedFile.filename}</span>
                <span className="text-[10px] text-[var(--text-muted)] font-normal font-mono">({attachedFile.sizeFormatted})</span>
              </div>
              <div className="text-[11px] text-[#FC6508] font-medium">
                {language === 'vi' ? '✓ Đã sẵn sàng đối soát & giám định chứng từ' : '✓ Ready for visual OCR & ledger forensic check'}
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemoveAttachment}
              className="p-1 rounded-lg text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title={language === 'vi' ? 'Hủy đính kèm' : 'Remove attachment'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 sm:gap-2.5 bg-[var(--bg-input)] border border-[var(--border-default)] focus-within:border-[#FC6508] rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 transition-colors"
        >
          {/* Real Working Attach File Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-[var(--text-muted)] hover:text-[#FC6508] transition-colors p-1 rounded-lg hover:bg-[var(--bg-secondary)] shrink-0"
            title={language === 'vi' ? 'Đính kèm ảnh chứng từ / biên lai thanh toán (PNG, JPG)' : 'Attach receipt or screenshot (PNG, JPG)'}
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            disabled={isTyping}
            placeholder={attachedFile ? (language === 'vi' ? 'Thêm ghi chú hoặc nhấn gửi để bắt đầu giám định...' : 'Add notes or press send to analyze...') : t.inputPlaceholder}
            className="flex-1 bg-transparent border-none outline-none text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] font-medium disabled:opacity-50 min-w-0"
          />

          <button
            type="submit"
            disabled={(!inputMsg.trim() && !attachedFile) || isTyping}
            className="w-7 h-7 rounded-lg bg-[#FC6508] hover:opacity-90 disabled:opacity-30 text-white flex items-center justify-center transition-all shrink-0 shadow-sm"
          >
            {isTyping ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          </button>
        </form>

        {/* Permanent Fixed Safety Disclaimer */}
        <p className="text-[10px] sm:text-[11px] text-[var(--text-muted)] text-center leading-relaxed">
          {t.disclaimer}
        </p>
      </div>
    </div>
  );
};

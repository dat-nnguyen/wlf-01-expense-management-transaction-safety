import React from 'react';
import { Upload, Send, Search, ShieldAlert, CreditCard, Sparkles } from 'lucide-react';
import { Language } from '../../types';
import { TRANSLATIONS } from '../../data/translations';

interface ChatInputProps {
  inputMsg: string;
  setInputMsg: (msg: string) => void;
  onSendMessage: (customText?: string) => void;
  onOpenVerifyModal: () => void;
  language: Language;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  inputMsg,
  setInputMsg,
  onSendMessage,
  onOpenVerifyModal,
  language,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <div className="flex flex-col shrink-0 transition-colors">
      {/* Quick Action Chips Bar */}
      <div className="px-6 py-2 border-t border-[var(--border-subtle)] bg-[var(--bg-header)] flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => onSendMessage(t.promptCheckRecent)}
          className="action-chip text-xs shrink-0"
        >
          <Search className="w-3.5 h-3.5" />
          <span>{t.chipCheckTx}</span>
        </button>
        <button
          onClick={onOpenVerifyModal}
          className="action-chip text-xs shrink-0"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-[#FC6508]" />
          <span>{t.chipCheckImage}</span>
        </button>
        <button
          onClick={() => onSendMessage(language === 'vi' ? 'Có khoản Payout nào từ Amazon hay Stripe bị trễ không?' : 'Are there any overdue payouts from Amazon or Stripe?')}
          className="action-chip text-xs shrink-0"
        >
          <span>{language === 'vi' ? 'Quét Payout trễ > 14 ngày' : 'Overdue Payout Radar'}</span>
        </button>
        <button
          onClick={() => onSendMessage(t.promptCheckDup)}
          className="action-chip text-xs shrink-0"
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>{t.chipCheckDup}</span>
        </button>
        <button
          onClick={() => onSendMessage(language === 'vi' ? 'Tình hình kinh doanh và lợi nhuận dòng tiền thế nào, có nên tiếp tục chạy ad không?' : 'What is my current business cash flow health, should I continue scaling ads?')}
          className="action-chip text-xs shrink-0"
        >
          <span>{language === 'vi' ? 'Tư vấn ROAS & Dòng tiền Ads' : 'ROAS & Cashflow Advisory'}</span>
        </button>
      </div>

      {/* Chat Input Box & Fixed Safety Disclaimer */}
      <div className="p-4 bg-[var(--bg-sidebar)] border-t border-[var(--border-subtle)] space-y-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSendMessage();
          }}
          className="flex items-center gap-2.5 bg-[var(--bg-input)] border border-[var(--border-default)] focus-within:border-[#FC6508] rounded-xl px-4 py-2 transition-colors"
        >
          <button
            type="button"
            onClick={onOpenVerifyModal}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1"
            title={t.uploadTooltip}
          >
            <Upload className="w-4 h-4" />
          </button>
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder={t.inputPlaceholder}
            className="flex-1 bg-transparent border-none outline-none text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] font-medium"
          />
          <button
            type="submit"
            disabled={!inputMsg.trim()}
            className="w-7 h-7 rounded-lg bg-[#FC6508] hover:opacity-90 disabled:opacity-30 text-white flex items-center justify-center transition-all shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Permanent Fixed Safety Disclaimer */}
        <p className="text-[11px] text-[var(--text-muted)] text-center leading-relaxed">
          {t.disclaimer}
        </p>
      </div>
    </div>
  );
};

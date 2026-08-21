import React from 'react';
import { Clock } from 'lucide-react';
import { Language } from '../../types';
import { TRANSLATIONS } from '../../data/translations';
import { RELATED_TRANSACTIONS } from '../../data/mockData';

interface TransactionDetailPanelProps {
  copiedId: string | null;
  onCopy: (text: string, id: string) => void;
  onSendMessage: (msg: string) => void;
  language: Language;
}

export const TransactionDetailPanel: React.FC<TransactionDetailPanelProps> = ({
  copiedId,
  onCopy,
  onSendMessage,
  language,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <aside className="w-80 bg-[var(--bg-sidebar)] flex flex-col p-4 space-y-4 overflow-y-auto shrink-0 border-l border-[var(--border-subtle)] min-h-0 transition-colors">
      {/* Card 1: Trạng thái đối soát giao dịch */}
      <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[var(--text-primary)]">{t.reconciliationInfo}</span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-medium border border-emerald-500/20">
            {t.ready}
          </span>
        </div>

        <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-dashed border-[var(--border-subtle)] text-center space-y-1 py-3">
          <div className="text-xs text-[var(--text-secondary)] font-medium">{t.noSelectedTx}</div>
          <div className="text-[11px] text-[var(--text-muted)] leading-relaxed">
            {t.sendImageOrChatHint}
          </div>
        </div>
      </div>

      {/* Card 2: Quy định thời hạn khiếu nại 60 ngày */}
      <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]">
          <Clock className="w-4 h-4 text-[#FC6508]" />
          <span>{t.disputeDeadlineTitle}</span>
        </div>
        <div className="text-xl font-bold text-[var(--text-primary)] tracking-tight font-mono">{t.disputeDays}</div>
        <div className="text-xs text-[var(--text-secondary)] font-medium">{t.fromStatementDate}</div>
        <div className="text-[11px] text-[var(--text-muted)] leading-relaxed">
          {t.disputeDesc}
        </div>
      </div>

      {/* Card 3: Giao dịch liên quan */}
      <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-2.5 flex-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[var(--text-primary)]">{t.relatedTxTitle}</span>
          <span className="text-[10px] font-mono text-[var(--text-muted)]">Realtime Feed</span>
        </div>

        <div className="space-y-2">
          {RELATED_TRANSACTIONS.map((tx, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-colors space-y-1"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[var(--text-primary)] truncate max-w-[140px]">{tx.merchant}</span>
                <span className={`font-mono font-bold ${tx.amount.startsWith('+') ? 'text-emerald-400' : 'text-[var(--text-primary)]'}`}>
                  {tx.amount}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-[var(--text-muted)] font-mono">{tx.time}</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                  {tx.badge}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

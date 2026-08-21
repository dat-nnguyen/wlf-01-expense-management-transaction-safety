import React from 'react';
import {
  ShieldCheck,
  Check,
  CreditCard,
  Mail,
  FileText,
  Calendar,
  Search,
  BarChart3,
  ShieldAlert,
} from 'lucide-react';
import { Message, Language } from '../../types';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import { TRANSLATIONS } from '../../data/translations';

interface CopilotChatProps {
  messages: Message[];
  isTyping: boolean;
  onChipClick: (chip: string) => void;
  chatEndRef: React.RefObject<HTMLDivElement>;
  language: Language;
}

export const CopilotChat: React.FC<CopilotChatProps> = ({
  messages,
  isTyping,
  onChipClick,
  chatEndRef,
  language,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
      {messages.length === 0 ? (
        <div className="h-full min-h-[360px] flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4 px-4 my-auto">
          <div className="w-12 h-12 rounded-xl bg-[#FC6508] flex items-center justify-center text-white shadow-sm">
            <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
              WEALIFY <span className="text-[#FC6508]">GUARDIAN</span>
            </h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {t.welcomeDesc}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              onClick={() => onChipClick(t.promptCheckRecent)}
              className="action-chip"
            >
              {t.quickCheckTx}
            </button>
            <button
              onClick={() => onChipClick(t.promptCheckPayout)}
              className="action-chip"
            >
              {t.quickCheckPayout}
            </button>
            <button
              onClick={() => onChipClick(t.promptCheckDup)}
              className="action-chip"
            >
              {t.quickCheckDup}
            </button>
            <button
              onClick={() => onChipClick(t.promptCheckAdvisory)}
              className="action-chip"
            >
              {t.quickCheckAdvisory}
            </button>
          </div>
        </div>
      ) : (
        messages.map((msg) => (
          <div key={msg.id} className="space-y-4">
            {msg.sender === 'user' ? (
              <div className="flex justify-end">
                <div className="max-w-[75%] p-3.5 px-4 rounded-2xl bg-[var(--bg-chat-user)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs font-medium leading-relaxed">
                  <p>{msg.text}</p>
                  <div className="text-[10px] text-[var(--text-muted)] text-right mt-1.5 flex items-center justify-end gap-1 font-mono">
                    <span>{msg.timestamp}</span>
                    <Check className="w-3 h-3 text-emerald-400" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex gap-3 max-w-[92%]">
                <div className="w-8 h-8 rounded-lg bg-[#FC6508] flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm">
                  <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div className="space-y-3 flex-1">
                  {/* AI Main Card */}
                  <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-3 transition-colors">
                    <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                      <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                        Wealify Guardian AI
                      </span>
                      <span className="text-[11px] text-[var(--text-muted)] font-mono">{msg.timestamp}</span>
                    </div>

                    {/* Beautiful Markdown LLM Output */}
                    <MarkdownRenderer content={msg.text} />

                    {/* Classification Pill */}
                    {msg.classification && (
                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[11px] font-medium text-[var(--text-secondary)]">
                          {language === 'vi' ? 'Phân loại:' : 'Classification:'} <strong className="text-[var(--text-primary)]">{msg.classification}</strong>
                        </span>
                        {msg.confidence && (
                          <span className="text-[11px] text-[var(--text-muted)] font-mono">
                            ({msg.confidence}% confidence)
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-medium border border-emerald-500/20">
                          ✓ 100% Grounded
                        </span>
                      </div>
                    )}

                    {/* Evidence Cards */}
                    {msg.evidence_cards && (
                      <div className="space-y-2 pt-1">
                        <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                          {language === 'vi' ? 'Bằng chứng đối soát' : 'Reconciliation Evidence'}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                          {msg.evidence_cards.map((ev, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-1.5"
                            >
                              <div className="flex items-center gap-2">
                                {ev.icon_type === 'card' ? (
                                  <CreditCard className="w-3.5 h-3.5 text-[#FC6508]" />
                                ) : (
                                  <Mail className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                                )}
                                <span className="text-xs font-bold text-[var(--text-primary)] truncate">{ev.title}</span>
                              </div>

                              <div className="space-y-0.5 text-[11px] text-[var(--text-secondary)]">
                                {ev.time && (
                                  <div>
                                    {language === 'vi' ? 'Thời gian:' : 'Time:'}{' '}
                                    <span className="text-[var(--text-primary)] font-mono">{ev.time}</span>
                                  </div>
                                )}
                                {ev.amount && (
                                  <div>
                                    {language === 'vi' ? 'Số tiền:' : 'Amount:'}{' '}
                                    <span className="text-rose-400 font-bold font-mono">{ev.amount}</span>
                                  </div>
                                )}
                                {ev.card_info && (
                                  <div>
                                    {language === 'vi' ? 'Thẻ:' : 'Card:'}{' '}
                                    <span className="text-[var(--text-primary)]">{ev.card_info}</span>
                                  </div>
                                )}
                                {ev.status_note && (
                                  <div className="text-emerald-400 font-medium pt-0.5">
                                    {ev.status_note}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Security Verification Conflict Card */}
                    {msg.security_verification && (
                      <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-rose-400" />
                            <span className="text-xs font-bold text-rose-300">
                              {language === 'vi' ? 'Kết quả xác minh tính xác thực' : 'Authenticity Verification Result'}
                            </span>
                          </div>
                          <span className="text-xs font-mono font-bold text-rose-400">
                            Conflict: {msg.security_verification.conflict_score}/100
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                            <div className="text-[10px] text-[var(--text-muted)]">
                              {language === 'vi' ? 'Tuyên bố (Claimed)' : 'Claimed Evidence'}
                            </div>
                            <div className="font-bold text-[var(--text-primary)] font-mono mt-0.5">
                              ${msg.security_verification.claimed_amount.toLocaleString()} USD
                            </div>
                            <div className="text-[10px] text-[var(--text-muted)] font-mono">
                              Ref: {msg.security_verification.claimed_ref}
                            </div>
                          </div>
                          <div className="p-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                            <div className="text-[10px] text-[var(--text-muted)]">
                              {language === 'vi' ? 'Sổ cái Wealify & Ví' : 'Wealify Ledger & Wallet'}
                            </div>
                            <div className="font-bold text-rose-400 mt-0.5">
                              {language === 'vi' ? '✕ Không tìm thấy dữ liệu' : '✕ No Matching Record'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Suggested Action Chips */}
                    {msg.suggested_chips && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {msg.suggested_chips.map((chip, cIdx) => (
                          <button
                            key={cIdx}
                            onClick={() => onChipClick(chip)}
                            className="action-chip text-[11px]"
                          >
                            <span>{chip}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))
      )}

      {isTyping && (
        <div className="flex gap-3 max-w-[80%]">
          <div className="w-8 h-8 rounded-lg bg-[#FC6508] flex items-center justify-center text-white shrink-0 shadow-sm">
            <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div className="p-3.5 px-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <span className="w-2 h-2 rounded-full bg-[#FC6508]"></span>
            <span>
              {language === 'vi'
                ? 'Wealify Guardian đang phân tích và đối chiếu chứng từ...'
                : 'Guardian is analyzing unit economics & reconciling proof...'}
            </span>
          </div>
        </div>
      )}
      <div ref={chatEndRef} />
    </div>
  );
};

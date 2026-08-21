import {
  ShieldCheck,
  Check,
  CreditCard,
  Mail,
  ShieldAlert,
  Loader2,
  Sparkles,
  Paperclip,
  Terminal,
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
                  {/* Uploaded Image Preview */}
                  {msg.image_preview && (
                    <div className="mb-2.5">
                      <img
                        src={msg.image_preview}
                        alt={msg.image_name || 'Receipt'}
                        className="max-w-[260px] max-h-[180px] object-cover rounded-xl border border-[var(--border-subtle)] shadow-sm"
                      />
                      {msg.image_name && (
                        <div className="text-[10px] text-[var(--text-muted)] mt-1 flex items-center gap-1 font-mono">
                          <Paperclip className="w-3 h-3 text-[#FC6508]" />
                          <span>{msg.image_name}</span>
                        </div>
                      )}
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{msg.text}</p>
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
                        <span>Wealify Guardian AI</span>
                        {msg.isStreaming && (
                          <span className="flex items-center gap-1 text-[10px] text-[#FC6508] font-mono font-normal">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Live Streaming...</span>
                          </span>
                        )}
                      </span>
                      <span className="text-[11px] text-[var(--text-muted)] font-mono">{msg.timestamp}</span>
                    </div>

                    {/* Live Thinking Step Banner (When Streaming) */}
                    {msg.isStreaming && msg.current_thought_step && (
                      <div className="p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[#FC6508]/30 flex items-center gap-2.5 text-xs text-[var(--text-primary)] animate-pulse">
                        <Sparkles className="w-3.5 h-3.5 text-[#FC6508] shrink-0" />
                        <span className="font-medium text-[11px]">{msg.current_thought_step}</span>
                      </div>
                    )}

                    {/* Beautiful Markdown LLM Output */}
                    {msg.text ? (
                      <div>
                        <MarkdownRenderer content={msg.text} />
                        {msg.isStreaming && (
                          <span className="inline-block w-1.5 h-3.5 bg-[#FC6508] ml-1 animate-pulse" />
                        )}
                      </div>
                    ) : (
                      <div className="py-3 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                        <Loader2 className="w-4 h-4 animate-spin text-[#FC6508]" />
                        <span>{language === 'vi' ? 'Agent đang lập kế hoạch và đối soát dữ liệu...' : 'Agent is reasoning and executing tools...'}</span>
                      </div>
                    )}

                    {/* Practical Execution Trace & Logs Accordion */}
                    {(!msg.isStreaming || (msg.thought_steps_history && msg.thought_steps_history.length > 0)) && (
                      <details className="group rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] overflow-hidden transition-all">
                        <summary className="px-3 py-2 text-[11px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer flex items-center justify-between select-none">
                          <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                            <Terminal className="w-3.5 h-3.5 text-[#FC6508]" />
                            <span>{language === 'vi' ? 'Lịch sử thực thi (ADK Execution Trace)' : 'Execution Trace & Tool Logs'}</span>
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)] font-mono group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <div className="p-3 pt-1 border-t border-[var(--border-subtle)] space-y-1.5 text-[11px] font-mono text-[var(--text-secondary)]">
                          {msg.thought_steps_history && msg.thought_steps_history.length > 0 ? (
                            msg.thought_steps_history.map((step, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-zinc-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#FC6508]"></span>
                                <span>{step}</span>
                              </div>
                            ))
                          ) : (
                            <>
                              <div className="flex items-center gap-2 text-zinc-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#FC6508]"></span>
                                <span>[Planner] Nhận diện ý định truy vấn & xác thực ràng buộc Read-Only</span>
                              </div>
                              <div className="flex items-center gap-2 text-zinc-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                <span>[Google ADK] Kích hoạt Sub-Agent & thực thi công cụ đối soát tài chính</span>
                              </div>
                              <div className="flex items-center gap-2 text-zinc-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                <span>[Data Grounding] Đối soát dữ liệu số cái từ 238 transactions & statements</span>
                              </div>
                              <div className="flex items-center gap-2 text-zinc-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
                                <span>[Synthesizer] Trích xuất chỉ số tài chính & hoàn tất phản hồi</span>
                              </div>
                            </>
                          )}
                        </div>
                      </details>
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
                    {/* Dynamic Agent Follow-up Suggestions */}
                    {msg.suggested_chips && msg.suggested_chips.length > 0 && !msg.isStreaming && (
                      <div className="pt-2 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10.5px] text-[var(--text-muted)] font-medium mr-1">
                          {language === 'vi' ? 'Gợi ý tiếp theo:' : 'Suggested next:'}
                        </span>
                        {msg.suggested_chips.map((chip, cIdx) => (
                          <button
                            key={cIdx}
                            type="button"
                            onClick={() => onChipClick(chip)}
                            className="text-[11px] px-2.5 py-1 rounded-lg bg-[var(--bg-secondary)] hover:bg-[#FC6508]/10 hover:border-[#FC6508]/40 border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[#FC6508] transition-all flex items-center gap-1.5 font-medium shadow-sm active:scale-95 cursor-pointer"
                          >
                            <span>{chip}</span>
                            <span className="text-[10px] text-[#FC6508] opacity-70">→</span>
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

      {isTyping && !messages.some((m) => m.isStreaming) && (
        <div className="flex gap-3 max-w-[80%]">
          <div className="w-8 h-8 rounded-lg bg-[#FC6508] flex items-center justify-center text-white shrink-0 shadow-sm">
            <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div className="p-3.5 px-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FC6508]" />
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

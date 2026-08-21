import React from 'react';
import {
  Bot,
  Sparkles,
  Check,
  CreditCard,
  Mail,
  FileText,
  Calendar,
  Search,
  BarChart3,
  ShieldAlert,
} from 'lucide-react';
import { Message } from '../../types';
import { MarkdownRenderer } from '../common/MarkdownRenderer';

interface CopilotChatProps {
  messages: Message[];
  isTyping: boolean;
  onChipClick: (chip: string) => void;
  chatEndRef: React.RefObject<HTMLDivElement>;
}

export const CopilotChat: React.FC<CopilotChatProps> = ({
  messages,
  isTyping,
  onChipClick,
  chatEndRef,
}) => {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
      {messages.length === 0 ? (
        <div className="h-full min-h-[360px] flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4 px-4 my-auto">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 via-purple-600/30 to-cyan-400/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shadow-2xl">
            <Bot className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-base font-bold text-white tracking-wide">Wealify Guardian Copilot</h2>
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              Trợ lý tài chính và an toàn giao dịch cho doanh nghiệp. Hãy gửi câu hỏi, kiểm tra giao dịch hoặc tải lên ảnh chứng từ để bắt đầu.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              onClick={() => onChipClick('Kiểm tra các khoản giao dịch gần đây')}
              className="action-chip text-xs"
            >
              Kiểm tra giao dịch
            </button>
            <button
              onClick={() => onChipClick('Có khoản Payout nào từ Amazon hay Stripe bị trễ không?')}
              className="action-chip text-xs"
            >
              Kiểm tra Payout trễ
            </button>
            <button
              onClick={() => onChipClick('Thẻ ảo chạy ads của tôi có bị cà 2 lần không?')}
              className="action-chip text-xs"
            >
              Quét trừ tiền trùng
            </button>
          </div>
        </div>
      ) : (
        messages.map((msg) => (
          <div key={msg.id} className="space-y-4">
            {msg.sender === 'user' ? (
              <div className="flex justify-end">
                <div className="max-w-[75%] p-4 rounded-2xl bg-[#281a4c] border border-purple-500/30 text-white shadow-lg text-sm">
                  <p>{msg.text}</p>
                  <div className="text-[10px] text-purple-300 text-right mt-1.5 flex items-center justify-end gap-1">
                    <span>{msg.timestamp}</span>
                    <Check className="w-3 h-3 text-purple-300" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex gap-3 max-w-[92%]">
                <div className="w-8 h-8 rounded-full bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="space-y-4 flex-1">
                  {/* AI Main Card */}
                  <div className="p-5 rounded-2xl bg-[#0c111e] border border-[rgba(255,255,255,0.08)] shadow-xl space-y-4">
                    <div className="flex items-center justify-between text-xs text-[#94a3b8]">
                      <span className="font-semibold text-purple-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        Guardian AI
                      </span>
                      <span className="text-[11px] text-[#64748b]">{msg.timestamp}</span>
                    </div>

                    {/* Beautiful Markdown LLM Output */}
                    <MarkdownRenderer content={msg.text} />

                    {/* Classification & Confidence Pill Row */}
                    {msg.classification && (
                      <div className="flex items-center gap-3 pt-1">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                          <span>Phân loại: {msg.classification}</span>
                        </div>
                        {msg.confidence && (
                          <div className="text-xs text-[#94a3b8]">
                            Mức tin cậy: <span className="text-white font-semibold">{msg.confidence}%</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 3-Column Evidence Cards */}
                    {msg.evidence_cards && (
                      <div className="space-y-2 pt-2">
                        <div className="text-xs font-bold text-[#94a3b8]">Bằng chứng chính</div>
                        <div className="grid grid-cols-3 gap-3">
                          {msg.evidence_cards.map((ev, idx) => (
                            <div
                              key={idx}
                              className="p-3.5 rounded-xl bg-[#131b2e] border border-[rgba(255,255,255,0.06)] hover:border-purple-500/40 transition-colors space-y-2"
                            >
                              <div className="flex items-center gap-2">
                                {ev.icon_type === 'card' ? (
                                  <div className="w-6 h-6 rounded-md bg-purple-500/20 text-purple-300 flex items-center justify-center">
                                    <CreditCard className="w-3.5 h-3.5" />
                                  </div>
                                ) : (
                                  <div className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                                    <Mail className="w-3.5 h-3.5" />
                                  </div>
                                )}
                                <span className="text-xs font-bold text-white">{ev.title}</span>
                              </div>

                              <div className="space-y-1 text-[11px] text-[#94a3b8]">
                                {ev.time && (
                                  <div>
                                    Thời gian: <span className="text-white">{ev.time}</span>
                                  </div>
                                )}
                                {ev.amount && (
                                  <div>
                                    Số tiền: <span className="text-rose-400 font-bold">{ev.amount}</span>
                                  </div>
                                )}
                                {ev.card_info && (
                                  <div>
                                    Thẻ: <span className="text-white">{ev.card_info}</span>
                                  </div>
                                )}
                                {ev.sender && (
                                  <div>
                                    Người gửi: <span className="text-white">{ev.sender}</span>
                                  </div>
                                )}
                                {ev.status_note && (
                                  <div className="text-emerald-400 font-semibold pt-0.5">
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
                      <div className="p-4 rounded-xl bg-[#1e142e] border border-rose-500/30 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-rose-400" />
                            <span className="text-xs font-bold text-rose-300 uppercase tracking-wide">
                              Kết quả xác minh tính xác thực
                            </span>
                          </div>
                          <span className="text-xs font-bold text-rose-400">
                            Inconsistency Score: {msg.security_verification.conflict_score}/100
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                            <div className="text-[10px] text-[#94a3b8]">Tuyên bố (Claimed)</div>
                            <div className="font-bold text-white mt-0.5">
                              ${msg.security_verification.claimed_amount.toLocaleString()} USD
                            </div>
                            <div className="text-[10px] text-[#64748b]">
                              Ref: {msg.security_verification.claimed_ref} | {msg.security_verification.source_type}
                            </div>
                          </div>
                          <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                            <div className="text-[10px] text-[#94a3b8]">Sổ cái Wealify &amp; Ví</div>
                            <div className="font-bold text-rose-400 mt-0.5">✕ Không tìm thấy dữ liệu</div>
                            <div className="text-[10px] text-amber-300">
                              {msg.security_verification.security_tag}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Horizontal Timeline */}
                    {msg.timeline_steps && (
                      <div className="space-y-2 pt-2">
                        <div className="text-xs font-bold text-[#94a3b8]">Dòng thời gian</div>
                        <div className="p-3 rounded-xl bg-[#131b2e] border border-[rgba(255,255,255,0.06)] flex items-center justify-between relative">
                          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-[2px] bg-purple-500/30 -z-0"></div>
                          {msg.timeline_steps.map((step, sIdx) => (
                            <div key={sIdx} className="flex flex-col items-center text-center z-10 space-y-1">
                              <div
                                className="w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-md"
                                style={{ backgroundColor: step.color }}
                              ></div>
                              <div className="text-[11px] font-semibold text-white mt-1">{step.title}</div>
                              <div className="text-[10px] text-[#94a3b8]">{step.time}</div>
                              {step.sub && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-semibold">
                                  {step.sub}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Suggested Action Chips */}
                    {msg.suggested_chips && (
                      <div className="space-y-2 pt-2">
                        <div className="text-xs font-bold text-[#94a3b8]">Gợi ý tiếp theo</div>
                        <div className="flex flex-wrap gap-2">
                          {msg.suggested_chips.map((chip, cIdx) => (
                            <button
                              key={cIdx}
                              onClick={() => onChipClick(chip)}
                              className="action-chip"
                            >
                              {chip.includes('Xem') && <FileText className="w-3.5 h-3.5 text-purple-400" />}
                              {chip.includes('hạn') && <Calendar className="w-3.5 h-3.5 text-amber-400" />}
                              {chip.includes('Tìm') && <Search className="w-3.5 h-3.5 text-cyan-400" />}
                              {chip.includes('Báo cáo') && <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />}
                              <span>{chip}</span>
                            </button>
                          ))}
                        </div>
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
          <div className="w-8 h-8 rounded-full bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
            <Bot className="w-4 h-4" />
          </div>
          <div className="p-4 rounded-2xl bg-[#0c111e] border border-white/10 flex items-center gap-2 text-xs text-[#94a3b8]">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping"></span>
            <span>Guardian đang đối soát bằng chứng với sổ cái Wealify...</span>
          </div>
        </div>
      )}
      <div ref={chatEndRef} />
    </div>
  );
};

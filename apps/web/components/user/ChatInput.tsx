import React from 'react';
import { Upload, Send, Search, ShieldAlert, Mail, CreditCard, Repeat, Loader2 } from 'lucide-react';
import { Language } from '../../types';

interface ChatInputProps {
  inputMsg: string;
  setInputMsg: (msg: string) => void;
  onSendMessage: (customText?: string) => void;
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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMsg.trim() && !isTyping) {
      onSendMessage(inputMsg);
    }
  };

  return (
    <div className="flex flex-col shrink-0">
      {/* Quick Action Chips Bar */}
      <div className="px-6 py-2 border-t border-[rgba(255,255,255,0.06)] bg-[#090e1a]/80 flex items-center gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => onSendMessage('Kiểm tra các khoản giao dịch gần đây')}
          disabled={isTyping}
          className="action-chip text-xs shrink-0 cursor-pointer disabled:opacity-50"
        >
          <Search className="w-3.5 h-3.5 text-cyan-400" />
          <span>Kiểm tra giao dịch</span>
        </button>
        <button
          type="button"
          onClick={onOpenVerifyModal}
          disabled={isTyping}
          className="action-chip text-xs shrink-0 bg-purple-500/10 border-purple-500/30 text-purple-200 cursor-pointer disabled:opacity-50"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
          <span>Kiểm tra ảnh thanh toán</span>
        </button>
        <button
          type="button"
          onClick={() => onSendMessage('Kiểm tra email nhận tiền')}
          disabled={isTyping}
          className="action-chip text-xs shrink-0 cursor-pointer disabled:opacity-50"
        >
          <Mail className="w-3.5 h-3.5 text-emerald-400" />
          <span>Kiểm tra email</span>
        </button>
        <button
          type="button"
          onClick={() => onSendMessage('Kiểm tra các khoản trừ đúp trên thẻ')}
          disabled={isTyping}
          className="action-chip text-xs shrink-0 cursor-pointer disabled:opacity-50"
        >
          <CreditCard className="w-3.5 h-3.5 text-amber-400" />
          <span>Kiểm tra khoản trừ</span>
        </button>
        <button
          type="button"
          onClick={() => onSendMessage('Đối soát 3 nguồn tài khoản - ví - thẻ')}
          disabled={isTyping}
          className="action-chip text-xs shrink-0 cursor-pointer disabled:opacity-50"
        >
          <Repeat className="w-3.5 h-3.5 text-purple-400" />
          <span>Đối soát giao dịch</span>
        </button>
      </div>

      {/* Chat Input Box & Fixed Safety Disclaimer */}
      <div className="p-4 bg-[#090e1a] border-t border-[rgba(255,255,255,0.08)] space-y-2.5">
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 bg-[#060913] border border-[rgba(255,255,255,0.12)] focus-within:border-purple-500 rounded-2xl px-4 py-2 shadow-inner"
        >
          <button
            type="button"
            onClick={onOpenVerifyModal}
            className="text-[#64748b] hover:text-purple-400 transition-colors p-1"
            title="Tải lên ảnh chụp màn hình / biên lai cần kiểm tra"
          >
            <Upload className="w-4 h-4" />
          </button>
          <input
            id="chat-input-field"
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (inputMsg.trim() && !isTyping) {
                  onSendMessage(inputMsg);
                }
              }
            }}
            placeholder={isTyping ? "Guardian đang suy nghĩ và tổng hợp dữ liệu..." : "Hỏi Guardian bất cứ điều gì về tài chính của bạn..."}
            disabled={isTyping}
            className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-[#64748b] disabled:opacity-60"
          />
          <button
            id="chat-send-btn"
            type="submit"
            disabled={!inputMsg.trim() || isTyping}
            className="w-8 h-8 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-30 disabled:hover:bg-purple-600 text-white flex items-center justify-center transition-all shadow-md shadow-purple-600/30 cursor-pointer disabled:cursor-not-allowed"
          >
            {isTyping ? (
              <Loader2 className="w-4 h-4 animate-spin text-purple-200" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>

        {/* Permanent Fixed Safety Disclaimer */}
        <p className="text-[11px] text-[#64748b] text-center leading-relaxed">
          {language === 'vi'
            ? 'Công cụ này chỉ hỗ trợ bạn rà soát tài chính. Kết quả để tham khảo, không phải kết luận chính thức của Wealify. Nếu thấy giao dịch lạ, hãy liên hệ hỗ trợ ngay — thời hạn khiếu nại ở Mỹ là 60 ngày kể từ ngày ngân hàng gửi sao kê.'
            : 'This tool only assists you in reviewing your finances. Results are for reference only and are not an official determination by Wealify. If you notice an unfamiliar transaction, contact support promptly — dispute period is 60 days from bank statement date.'}
        </p>
      </div>
    </div>
  );
};

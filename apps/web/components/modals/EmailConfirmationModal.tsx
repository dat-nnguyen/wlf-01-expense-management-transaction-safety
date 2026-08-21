import React from 'react';
import { Mail, AlertTriangle, Check } from 'lucide-react';
import { EmailModalState } from '../../types';

interface EmailConfirmationModalProps {
  emailModal: EmailModalState;
  onClose: () => void;
  onConfirmSend: () => void;
}

export const EmailConfirmationModal: React.FC<EmailConfirmationModalProps> = ({
  emailModal,
  onClose,
  onConfirmSend,
}) => {
  if (!emailModal.isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="w-full max-w-lg bg-[#0c111e] border border-purple-500/50 rounded-3xl p-6 space-y-5 shadow-2xl">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-600/30 text-purple-300 flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Xác Nhận Gửi Email Báo Cáo</h3>
            <p className="text-xs text-[#94a3b8]">Chỉ gửi tới email đã xác thực của chính bạn</p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-xl bg-[#131b2e] border border-white/5 space-y-1">
            <div className="text-[#64748b]">Người nhận (Verified User Email Only):</div>
            <div className="font-bold text-purple-300 text-sm font-mono">{emailModal.to}</div>
          </div>

          <div className="p-3 rounded-xl bg-[#131b2e] border border-white/5 space-y-1">
            <div className="text-[#64748b]">Tiêu đề thư:</div>
            <div className="font-semibold text-white">{emailModal.subject}</div>
          </div>

          <div className="p-3 rounded-xl bg-[#131b2e] border border-white/5 space-y-1 max-h-36 overflow-y-auto font-mono text-[11px] text-[#94a3b8] whitespace-pre-line">
            {emailModal.body}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            Chính sách an toàn: Wealify Guardian không bao giờ tự động gửi email cho bên thứ ba, sàn giao dịch hay ngân hàng.
          </span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="btn-secondary text-xs"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onConfirmSend}
            className="btn-primary text-xs"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Xác nhận &amp; Gửi ngay</span>
          </button>
        </div>
      </div>
    </div>
  );
};

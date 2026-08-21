import React from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  Mail,
  Info,
} from 'lucide-react';

interface EvidenceVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerEmailReport: () => void;
}

export const EvidenceVerificationModal: React.FC<EvidenceVerificationModalProps> = ({
  isOpen,
  onClose,
  onTriggerEmailReport,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#0c111e] border border-purple-500/40 rounded-3xl p-6 space-y-6 shadow-2xl shadow-purple-900/40 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Xác Minh Tính Xác Thực Giao Dịch</h3>
              <p className="text-xs text-[#94a3b8]">Transaction Authenticity &amp; Evidence Conflict Engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#64748b] hover:text-white text-lg font-bold p-1"
          >
            ✕
          </button>
        </div>

        {/* Analysis Progress Timeline */}
        <div className="space-y-2 p-4 rounded-2xl bg-[#131b2e] border border-white/5">
          <div className="text-xs font-bold text-[#94a3b8]">Tiến trình kiểm tra đối soát đa nguồn:</div>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Đã trích xuất thông tin ảnh chụp: $2,500.00 USD | Ref: WF-839291</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Đối chiếu sổ cái tài khoản Wealify &amp; Thẻ ảo (0 kết quả khớp)</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Kiểm tra biến động số dư ví Wealify (Không có biến động)</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Kiểm tra hộp thư xác thực (Không có thư xác nhận chuyển tiền)</span>
            </div>
          </div>
        </div>

        {/* Evidence Comparison Card */}
        <div className="grid grid-cols-2 gap-4">
          {/* Claimed */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
            <div className="text-xs font-bold text-purple-400 uppercase tracking-wide">
              Bằng chứng người dùng cung cấp
            </div>
            <div className="text-xl font-extrabold text-white">$2,500.00 USD</div>
            <div className="space-y-1 text-xs text-[#94a3b8]">
              <div>Mã tham chiếu: <span className="text-white font-mono font-semibold">WF-839291</span></div>
              <div>Trạng thái tuyên bố: <span className="text-emerald-400 font-bold">COMPLETED</span></div>
              <div>Nguồn: <span className="text-white">Ảnh chụp màn hình (Screenshot)</span></div>
            </div>
          </div>

          {/* Trusted Records Checklist */}
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-2">
            <div className="text-xs font-bold text-rose-300 uppercase tracking-wide">
              Hệ thống sổ cái Wealify tin cậy
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-rose-300 font-medium">
                <span>Sổ cái Wealify:</span>
                <span className="font-bold">✕ Không tìm thấy</span>
              </div>
              <div className="flex items-center justify-between text-rose-300 font-medium">
                <span>Số dư ví:</span>
                <span className="font-bold">✕ Không có biến động</span>
              </div>
              <div className="flex items-center justify-between text-rose-300 font-medium">
                <span>Hộp thư xác thực:</span>
                <span className="font-bold">✕ Không nhận được email</span>
              </div>
              <div className="flex items-center justify-between text-rose-300 font-medium">
                <span>Mã tham chiếu:</span>
                <span className="font-bold">✕ Không tồn tại</span>
              </div>
            </div>
          </div>
        </div>

        {/* Evidence Conflict Score */}
        <div className="p-4 rounded-2xl bg-[#1e142e] border border-rose-500/40 flex items-center justify-between">
          <div>
            <div className="text-xs text-rose-300 font-semibold uppercase">Evidence Inconsistency Score</div>
            <div className="text-2xl font-black text-rose-400">92 / 100</div>
            <div className="text-[11px] text-[#94a3b8]">Mâu thuẫn chứng từ mức độ cao — Cần bạn tự xác nhận</div>
          </div>
          <div className="text-right">
            <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold">
              Rủi ro cao — Kiểm tra trực tiếp
            </span>
          </div>
        </div>

        {/* AI Explanation & Guidance */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs text-[#94a3b8] leading-relaxed">
          <div className="font-bold text-white flex items-center gap-1.5">
            <Info className="w-4 h-4 text-purple-400" />
            <span>Giải thích từ Wealify Guardian:</span>
          </div>
          <p>
            Bằng chứng do người dùng cung cấp tuyên bố rằng một giao dịch $2,500.00 USD đã được chuyển thành công. Tuy nhiên, hệ thống không tìm thấy bất kỳ giao dịch ghi có tương ứng nào trong sổ cái Wealify, số dư ví, hoặc email xác nhận.
          </p>
          <p className="text-amber-300 font-semibold">
            ⚠️ Khuyến cáo: Không nên coi ảnh chụp này là bằng chứng thanh toán. Hãy xác minh trực tiếp trong tài khoản Wealify trước khi giao hàng.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <button
            onClick={onTriggerEmailReport}
            className="btn-secondary text-xs"
          >
            <Mail className="w-3.5 h-3.5 text-purple-400" />
            <span>Gửi báo cáo này về email của tôi</span>
          </button>
          <button
            onClick={onClose}
            className="btn-primary text-xs"
          >
            Đã hiểu &amp; Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Calendar, Copy, Check } from 'lucide-react';
import { RELATED_TRANSACTIONS } from '../../data/mockData';

interface TransactionDetailPanelProps {
  copiedId: string | null;
  onCopy: (text: string, id: string) => void;
  onSendMessage: (msg: string) => void;
}

export const TransactionDetailPanel: React.FC<TransactionDetailPanelProps> = ({
  copiedId,
  onCopy,
  onSendMessage,
}) => {
  return (
    <aside className="w-80 bg-[#090e1a] flex flex-col p-5 space-y-5 overflow-y-auto shrink-0 border-l border-[rgba(255,255,255,0.08)] min-h-0">
      {/* Card 1: Trạng thái đối soát giao dịch */}
      <div className="p-4 rounded-2xl bg-[#0c111e] border border-[rgba(255,255,255,0.08)] space-y-3.5 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white">Thông tin đối soát</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 text-[10px] font-semibold border border-emerald-500/20">
            Sẵn sàng
          </span>
        </div>

        <div className="p-3 rounded-xl bg-white/[0.02] border border-dashed border-white/10 text-center space-y-1.5 py-4">
          <div className="text-xs text-slate-300 font-medium">Chưa có giao dịch đang chọn</div>
          <div className="text-[11px] text-[#64748b] leading-relaxed">
            Gửi ảnh chụp chuyển khoản hoặc hỏi Guardian trong khung chat để kích hoạt đối soát 3 nguồn.
          </div>
        </div>
      </div>

      {/* Card 2: Quy định thời hạn khiếu nại 60 ngày */}
      <div className="p-4 rounded-2xl bg-[#0c111e] border border-[rgba(255,255,255,0.08)] space-y-2.5 shadow-lg">
        <div className="flex items-center gap-2 text-xs font-bold text-white">
          <Calendar className="w-4 h-4 text-purple-400" />
          <span>Thời hạn khiếu nại quy định</span>
        </div>
        <div className="text-2xl font-black text-purple-300 tracking-tight">60 ngày</div>
        <div className="text-xs text-[#94a3b8]">Tính từ ngày ngân hàng gửi sao kê</div>
        <div className="text-[11px] text-[#64748b] leading-relaxed pt-1">
          Hệ thống Guardian sẽ tự động đếm ngược thời gian khi phát hiện giao dịch bất thường trên thẻ hoặc tài khoản.
        </div>
      </div>

      {/* Card 3: Giao dịch liên quan */}
      <div className="p-4 rounded-2xl bg-[#0c111e] border border-[rgba(255,255,255,0.08)] space-y-3 shadow-lg flex-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-white">Giao dịch liên quan</span>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-dashed border-white/10 text-center space-y-1">
          <div className="text-xs text-slate-300 font-medium">Chưa có giao dịch liên quan</div>
          <div className="text-[11px] text-[#64748b]">Dữ liệu sẽ tự động xuất hiện khi tra soát</div>
        </div>
      </div>
    </aside>
  );
};

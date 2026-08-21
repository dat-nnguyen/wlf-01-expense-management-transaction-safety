import React from 'react';
import { Calendar, ChevronDown, Bell } from 'lucide-react';

interface OpsHeaderProps {
  activeNav: string;
  onOpenVerifyModal: () => void;
}

export const OpsHeader: React.FC<OpsHeaderProps> = ({
  activeNav,
  onOpenVerifyModal,
}) => {
  return (
    <div className="h-14 border-b border-[rgba(255,255,255,0.08)] px-6 flex items-center justify-between bg-[#090e1a]/80 sticky top-0 z-20 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <span className="text-sm font-bold text-white">
          {activeNav === 'security_center'
            ? 'Security Center — Quản lý gian lận & Xác thực'
            : 'Tổng quan hệ thống'}
        </span>
        <span className="text-xs text-[#64748b]">
          {activeNav === 'security_center'
            ? 'Xác minh tính xác thực giao dịch & đối soát chứng từ'
            : 'Theo dõi hiệu suất chatbot, người dùng và hoạt động hệ thống'}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-[#94a3b8]">
          <Calendar className="w-3.5 h-3.5 text-purple-400" />
          <span>01/08/2026 - 20/08/2026</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-[#94a3b8]">
          <span>Tất cả môi trường</span>
          <ChevronDown className="w-3 h-3 text-[#64748b]" />
        </div>
        <button className="relative p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
            24
          </span>
        </button>
        <div className="flex items-center gap-2 pl-2 border-l border-white/10">
          <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center">
            LM
          </div>
          <div className="text-left text-xs">
            <div className="font-semibold text-white">Lê Minh Anh</div>
            <div className="text-[10px] text-[#64748b]">Developer</div>
          </div>
        </div>
        <button
          onClick={onOpenVerifyModal}
          className="btn-primary text-xs ml-2"
        >
          <span>+ Tạo Case An Ninh</span>
        </button>
      </div>
    </div>
  );
};

import React from 'react';
import { Upload } from 'lucide-react';
import { DEMO_SECURITY_CASES } from '../../data/mockData';

interface SecurityCenterViewProps {
  onOpenVerifyModal: () => void;
  onSelectCase: (caseId: string) => void;
}

export const SecurityCenterView: React.FC<SecurityCenterViewProps> = ({
  onOpenVerifyModal,
  onSelectCase,
}) => {
  return (
    <div className="p-6 space-y-6">
      {/* Security Overview KPIs */}
      <div className="grid grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-[#0c111e] border border-rose-500/30 space-y-1 shadow-lg">
          <div className="text-xs text-[#94a3b8]">Total Security Alerts</div>
          <div className="text-2xl font-black text-rose-400">12</div>
          <div className="text-[10px] text-rose-300">Yêu cầu tra soát ngay</div>
        </div>
        <div className="p-4 rounded-2xl bg-[#0c111e] border border-rose-500/30 space-y-1 shadow-lg">
          <div className="text-xs text-[#94a3b8]">High Risk Cases</div>
          <div className="text-2xl font-black text-rose-400">3</div>
          <div className="text-[10px] text-rose-300">Score &gt; 70/100</div>
        </div>
        <div className="p-4 rounded-2xl bg-[#0c111e] border border-amber-500/30 space-y-1 shadow-lg">
          <div className="text-xs text-[#94a3b8]">Evidence Conflicts</div>
          <div className="text-2xl font-black text-amber-400">7</div>
          <div className="text-[10px] text-amber-300">Mâu thuẫn chứng từ</div>
        </div>
        <div className="p-4 rounded-2xl bg-[#0c111e] border border-cyan-500/30 space-y-1 shadow-lg">
          <div className="text-xs text-[#94a3b8]">Unverified Payment Claims</div>
          <div className="text-2xl font-black text-cyan-400">5</div>
          <div className="text-[10px] text-cyan-300">Chưa vào sổ cái</div>
        </div>
        <div className="p-4 rounded-2xl bg-[#0c111e] border border-purple-500/30 space-y-1 shadow-lg">
          <div className="text-xs text-[#94a3b8]">Unmatched References</div>
          <div className="text-2xl font-black text-purple-400">4</div>
          <div className="text-[10px] text-purple-300">Mã giao dịch giả mạo</div>
        </div>
      </div>

      {/* Security Alert Table */}
      <div className="p-5 rounded-2xl bg-[#0c111e] border border-[rgba(255,255,255,0.08)] space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">Security Alert Queue — Hàng đợi xử lý gian lận</h2>
            <p className="text-xs text-[#64748b]">Tất cả các vụ việc mâu thuẫn chứng từ và ảnh chụp màn hình chuyển khoản</p>
          </div>
          <button
            onClick={onOpenVerifyModal}
            className="btn-secondary text-xs"
          >
            <Upload className="w-3.5 h-3.5 text-purple-400" />
            <span>Xác minh ảnh chứng từ mới</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[#64748b] border-b border-white/5 pb-2.5">
                <th className="pb-2">Mã Case</th>
                <th className="pb-2">Loại rủi ro</th>
                <th className="pb-2">Số tiền tuyên bố</th>
                <th className="pb-2">Mã tham chiếu</th>
                <th className="pb-2">Evidence Score</th>
                <th className="pb-2">Trạng thái</th>
                <th className="pb-2 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {DEMO_SECURITY_CASES.length > 0 ? (
                DEMO_SECURITY_CASES.map((c, cIdx) => (
                  <tr key={cIdx} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 font-mono text-purple-400 font-medium">{c.id}</td>
                    <td className="py-3 font-medium text-white">{c.title}</td>
                    <td className="py-3 font-bold text-rose-400">{c.amount}</td>
                    <td className="py-3 font-mono text-[#94a3b8]">{c.ref}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.score > 70 ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {c.score}/100
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        c.status === 'Đang điều tra'
                          ? 'bg-amber-500/20 text-amber-300'
                          : c.status === 'Đã giải quyết'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => onSelectCase(c.id)}
                        className="px-2.5 py-1 rounded bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-[11px] font-medium transition-colors"
                      >
                        Tra soát
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-xs text-[#64748b]">
                    Chưa có hồ sơ cảnh báo an ninh nào trong hàng đợi. Hệ thống đang bảo vệ an toàn.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

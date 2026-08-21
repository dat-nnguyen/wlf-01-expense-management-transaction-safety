import React from 'react';
import {
  ArrowUpRight,
  TrendingUp,
  Users,
  Bot,
  Zap,
  AlertTriangle,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import {
  BOT_PERFORMANCES,
  RECENT_BOTS,
  NEW_USERS,
} from '../../data/mockData';

export const OpsDashboard: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      {/* 5 Top KPI Cards */}
      <div className="grid grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-[#0c111e] border border-[rgba(255,255,255,0.08)] shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-[#94a3b8]">
            <span>Tổng cuộc hội thoại</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">128,540</div>
          <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>↑ 18.6% so với 7 ngày trước</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0c111e] border border-[rgba(255,255,255,0.08)] shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-[#94a3b8]">
            <span>Người dùng hoạt động</span>
            <Users className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">8,432</div>
          <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>↑ 12.3% so với 7 ngày trước</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0c111e] border border-[rgba(255,255,255,0.08)] shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-[#94a3b8]">
            <span>Bot đang hoạt động</span>
            <Bot className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">12</div>
          <div className="text-[11px] text-[#94a3b8]">Trong tổng số 15 bot</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0c111e] border border-[rgba(255,255,255,0.08)] shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-[#94a3b8]">
            <span>Tổng tokens sử dụng</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">45.2M</div>
          <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>↑ 22.7% so với 7 ngày trước</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0c111e] border border-[rgba(255,255,255,0.08)] shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-[#94a3b8]">
            <span>Cảnh báo hệ thống</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-2xl font-extrabold text-rose-400 tracking-tight">7</div>
          <div className="text-[11px] text-rose-400 font-semibold">
            ↓ 28.6% so với 7 ngày trước
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-12 gap-5">
        {/* Line Chart: Lượt hội thoại */}
        <div className="col-span-5 p-5 rounded-2xl bg-[#0c111e] border border-[rgba(255,255,255,0.08)] shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">Lượt hội thoại</span>
            <span className="text-[11px] text-[#64748b] bg-white/5 px-2 py-0.5 rounded">7 ngày qua</span>
          </div>

          {/* SVG Line Chart */}
          <div className="h-44 w-full relative">
            <svg viewBox="0 0 400 150" className="w-full h-full">
              <defs>
                <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 10 130 Q 80 40, 150 90 T 250 30 T 380 50"
                fill="none"
                stroke="#a855f7"
                strokeWidth="3"
              />
              <path
                d="M 10 130 Q 80 40, 150 90 T 250 30 T 380 50 L 380 150 L 10 150 Z"
                fill="url(#purpleGrad)"
              />
              <circle cx="250" cy="30" r="5" fill="#ffffff" stroke="#a855f7" strokeWidth="3" />
            </svg>
            <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/80 border border-purple-500/40 px-2.5 py-1 rounded-lg text-[10px] text-white">
              12/08/2026 • Lượt hội thoại: <span className="font-bold text-purple-300">14,480</span>
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-[#64748b] pt-1">
            <span>01/08</span>
            <span>05/08</span>
            <span>09/08</span>
            <span>13/08</span>
            <span>17/08</span>
            <span>19/08</span>
          </div>
        </div>

        {/* Donut Chart: Phân bổ hội thoại theo bot */}
        <div className="col-span-4 p-5 rounded-2xl bg-[#0c111e] border border-[rgba(255,255,255,0.08)] shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">Phân bổ hội thoại theo bot</span>
            <span className="text-[11px] text-purple-400 cursor-pointer">Xem chi tiết</span>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <div className="relative w-32 h-32 shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="38" fill="none" stroke="#6366f1" strokeWidth="14" strokeDasharray="110 240" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#10b981" strokeWidth="14" strokeDasharray="58 240" strokeDashoffset="-110" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#f59e0b" strokeWidth="14" strokeDasharray="36 240" strokeDashoffset="-168" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#ec4899" strokeWidth="14" strokeDasharray="21 240" strokeDashoffset="-204" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#06b6d4" strokeWidth="14" strokeDasharray="15 240" strokeDashoffset="-225" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[9px] text-[#64748b]">Tổng</span>
                <span className="text-xs font-bold text-white">128,540</span>
              </div>
            </div>

            <div className="space-y-1.5 text-[11px] flex-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[#94a3b8]">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Guardian Finance
                </span>
                <span className="text-white font-medium">46.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[#94a3b8]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Guardian Support
                </span>
                <span className="text-white font-medium">24.1%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[#94a3b8]">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span> Guardian Sales
                </span>
                <span className="text-white font-medium">15.3%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[#94a3b8]">
                  <span className="w-2 h-2 rounded-full bg-pink-500"></span> Guardian HR
                </span>
                <span className="text-white font-medium">8.7%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[#94a3b8]">
                  <span className="w-2 h-2 rounded-full bg-cyan-500"></span> Khác
                </span>
                <span className="text-white font-medium">5.7%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bot hiệu suất cao nhất */}
        <div className="col-span-3 p-5 rounded-2xl bg-[#0c111e] border border-[rgba(255,255,255,0.08)] shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">Bot hiệu suất cao nhất</span>
            <span className="text-[11px] text-purple-400 cursor-pointer">Xem tất cả</span>
          </div>

          <div className="space-y-3 pt-1">
            {BOT_PERFORMANCES.length > 0 ? (
              BOT_PERFORMANCES.map((b, idx) => (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{idx + 1}. {b.name}</span>
                    <span className="text-emerald-400 font-bold">{b.rate}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${b.rate}%` }}></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-[#64748b]">
                Chưa có dữ liệu hiệu suất
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row Tables */}
      <div className="grid grid-cols-12 gap-5">
        {/* Table: Bot hoạt động gần đây */}
        <div className="col-span-6 p-5 rounded-2xl bg-[#0c111e] border border-[rgba(255,255,255,0.08)] shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">Bot hoạt động gần đây</span>
            <span className="text-[11px] text-purple-400 cursor-pointer">Xem tất cả</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[#64748b] border-b border-white/5 pb-2">
                  <th className="pb-2">Tên bot</th>
                  <th className="pb-2">Trạng thái</th>
                  <th className="pb-2">Hội thoại</th>
                  <th className="pb-2">Thành công</th>
                  <th className="pb-2">Phản hồi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {RECENT_BOTS.length > 0 ? (
                  RECENT_BOTS.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 font-medium text-white">{row.name}</td>
                      <td className="py-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            row.status === 'Hoạt động'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-[#94a3b8]">{row.total}</td>
                      <td className="py-2.5 text-emerald-400 font-semibold">{row.succ}</td>
                      <td className="py-2.5 text-[#94a3b8]">{row.latency}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-[#64748b]">
                      Chưa có lịch sử hoạt động
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table: Người dùng mới */}
        <div className="col-span-4 p-5 rounded-2xl bg-[#0c111e] border border-[rgba(255,255,255,0.08)] shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">Người dùng mới</span>
            <span className="text-[11px] text-purple-400 cursor-pointer">Xem tất cả</span>
          </div>
          <div className="space-y-2.5 text-xs">
            {NEW_USERS.length > 0 ? (
              NEW_USERS.map((u, uIdx) => (
                <div key={uIdx} className="flex items-center justify-between p-2 rounded-lg bg-[#131b2e] border border-white/5">
                  <div>
                    <div className="text-white font-medium">{u.email}</div>
                    <div className="text-[10px] text-[#94a3b8]">{u.bot} • {u.channel}</div>
                  </div>
                  <span className="text-[10px] text-[#64748b]">{u.time}</span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-[#64748b]">
                Chưa có người dùng mới
              </div>
            )}
          </div>
        </div>

        {/* List: Cảnh báo gần đây */}
        <div className="col-span-2 p-5 rounded-2xl bg-[#0c111e] border border-[rgba(255,255,255,0.08)] shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">Cảnh báo gần đây</span>
          </div>
          <div className="space-y-2 text-[11px]">
            <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 space-y-0.5">
              <div className="font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-rose-400" /> Tỷ lệ lỗi bot Legal
              </div>
              <div className="text-[10px] text-[#94a3b8]">2 phút trước</div>
            </div>
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 space-y-0.5">
              <div className="font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" /> API OpenAI chậm
              </div>
              <div className="text-[10px] text-[#94a3b8]">8 phút trước</div>
            </div>
            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 space-y-0.5">
              <div className="font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-purple-400" /> Backup hoàn tất
              </div>
              <div className="text-[10px] text-[#94a3b8]">30 phút trước</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import {
  Shield,
  MessagesSquare,
  LayoutDashboard,
  Receipt,
  WalletCards,
  BarChart3,
  AlertTriangle,
  Repeat,
  DollarSign,
  Bell,
  Mail,
  Settings,
  Eye,
  EyeOff,
  TrendingUp,
} from 'lucide-react';

interface UserSidebarProps {
  activeNav: string;
  setActiveNav: (nav: string) => void;
  isBalanceMasked: boolean;
  setIsBalanceMasked: (masked: boolean) => void;
}

export const UserSidebar: React.FC<UserSidebarProps> = ({
  activeNav,
  setActiveNav,
  isBalanceMasked,
  setIsBalanceMasked,
}) => {
  return (
    <aside className="w-64 bg-[#090e1a] border-r border-[rgba(255,255,255,0.08)] flex flex-col justify-between p-4 shrink-0 overflow-y-auto min-h-0">
      <div className="space-y-6">
        {/* Branding header inside sidebar */}
        <div className="flex items-center gap-2.5 px-2">
          <div className="w-7 h-7 rounded-lg bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-400">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-xs tracking-wider text-white">WEALIFY</div>
            <div className="text-[10px] text-purple-400 tracking-widest uppercase">GUARDIAN</div>
          </div>
        </div>

        {/* Primary AI Chat Button */}
        <button
          onClick={() => setActiveNav('chat')}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#3b2a6f] text-white text-sm font-semibold border border-purple-500/40 shadow-lg shadow-purple-900/30 transition-all hover:brightness-110"
        >
          <MessagesSquare className="w-4 h-4 text-purple-300" />
          <span>AI Chat</span>
        </button>

        {/* Navigation Section: TỔNG QUAN */}
        <div className="space-y-1">
          <div className="px-3 text-[11px] font-bold tracking-wider text-[#64748b] uppercase">TỔNG QUAN</div>
          <button
            onClick={() => setActiveNav('dashboard')}
            className={`sidebar-link ${activeNav === 'dashboard' ? 'active' : ''}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => setActiveNav('transactions')}
            className={`sidebar-link ${activeNav === 'transactions' ? 'active' : ''}`}
          >
            <Receipt className="w-4 h-4" />
            <span>Giao dịch</span>
          </button>
          <button
            onClick={() => setActiveNav('cards')}
            className={`sidebar-link ${activeNav === 'cards' ? 'active' : ''}`}
          >
            <WalletCards className="w-4 h-4" />
            <span>Thẻ &amp; Ví</span>
          </button>
          <button
            onClick={() => setActiveNav('reports')}
            className={`sidebar-link ${activeNav === 'reports' ? 'active' : ''}`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Báo cáo</span>
          </button>
        </div>

        {/* Navigation Section: ANOMALY */}
        <div className="space-y-1">
          <div className="px-3 text-[11px] font-bold tracking-wider text-[#64748b] uppercase">ANOMALY</div>
          <button
            onClick={() => setActiveNav('anomalies')}
            className={`sidebar-link ${activeNav === 'anomalies' ? 'active' : ''}`}
          >
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Bất thường</span>
          </button>
          <button
            onClick={() => setActiveNav('reconciliation')}
            className={`sidebar-link ${activeNav === 'reconciliation' ? 'active' : ''}`}
          >
            <Repeat className="w-4 h-4 text-amber-400" />
            <span>Đối soát</span>
          </button>
          <button
            onClick={() => setActiveNav('payouts')}
            className={`sidebar-link ${activeNav === 'payouts' ? 'active' : ''}`}
          >
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Payouts</span>
          </button>
          <button
            onClick={() => setActiveNav('subscriptions')}
            className={`sidebar-link ${activeNav === 'subscriptions' ? 'active' : ''}`}
          >
            <Repeat className="w-4 h-4 text-purple-400" />
            <span>Subscriptions</span>
          </button>
        </div>

        {/* Navigation Section: KHÁC */}
        <div className="space-y-1">
          <div className="px-3 text-[11px] font-bold tracking-wider text-[#64748b] uppercase">KHÁC</div>
          <button
            onClick={() => setActiveNav('alerts')}
            className={`sidebar-link ${activeNav === 'alerts' ? 'active' : ''}`}
          >
            <Bell className="w-4 h-4" />
            <span>Cảnh báo</span>
          </button>
          <button
            onClick={() => setActiveNav('emails')}
            className={`sidebar-link ${activeNav === 'emails' ? 'active' : ''}`}
          >
            <Mail className="w-4 h-4" />
            <span>Hộp thư &amp; Email</span>
          </button>
          <button
            onClick={() => setActiveNav('settings')}
            className={`sidebar-link ${activeNav === 'settings' ? 'active' : ''}`}
          >
            <Settings className="w-4 h-4" />
            <span>Cài đặt</span>
          </button>
        </div>
      </div>

      {/* Bottom Maskable Account Balance Card */}
      <div className="p-3.5 rounded-2xl bg-[#0c111e] border border-[rgba(255,255,255,0.08)] shadow-inner">
        <div className="flex items-center justify-between text-xs text-[#94a3b8] mb-1.5">
          <span className="font-semibold text-white">Tài khoản chính</span>
          <button
            onClick={() => setIsBalanceMasked(!isBalanceMasked)}
            className="text-[#64748b] hover:text-white transition-colors"
            title="Ẩn / Hiện số dư"
          >
            {isBalanceMasked ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>
        <div className="text-[11px] text-[#64748b]">Số dư khả dụng</div>
        <div className="text-lg font-bold text-white tracking-tight mt-0.5">
          {isBalanceMasked ? '•••••••• USD' : '$0.00 USD'}
        </div>
        <div className="text-xs text-[#94a3b8] font-medium">
          {isBalanceMasked ? '= ••••••••• VND' : '= 0 VND'}
        </div>
        <div className="text-[11px] text-[#64748b] font-medium mt-1.5 flex items-center gap-1">
          <span>Chế độ: Read-Only an toàn</span>
        </div>
      </div>
    </aside>
  );
};

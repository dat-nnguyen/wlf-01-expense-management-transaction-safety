import React from 'react';
import {
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
import { Language } from '../../types';
import { TRANSLATIONS } from '../../data/translations';

interface UserSidebarProps {
  activeNav: string;
  setActiveNav: (nav: string) => void;
  isBalanceMasked: boolean;
  setIsBalanceMasked: (masked: boolean) => void;
  language: Language;
}

export const UserSidebar: React.FC<UserSidebarProps> = ({
  activeNav,
  setActiveNav,
  isBalanceMasked,
  setIsBalanceMasked,
  language,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <aside className="w-64 bg-[var(--bg-sidebar)] border-r border-[var(--border-subtle)] flex flex-col justify-between p-4 shrink-0 overflow-y-auto min-h-0 transition-colors">
      <div className="space-y-5">
        {/* Navigation Section: TỔNG QUAN / OVERVIEW */}
        <div className="space-y-1">
          <div className="px-2 text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase">
            {t.overview}
          </div>
          <button
            onClick={() => setActiveNav('chat')}
            className={`sidebar-link ${activeNav === 'chat' ? 'active' : ''}`}
          >
            <MessagesSquare className="w-4 h-4" />
            <span>{t.aiChat}</span>
          </button>
          <button
            onClick={() => setActiveNav('dashboard')}
            className={`sidebar-link ${activeNav === 'dashboard' ? 'active' : ''}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>{t.dashboard}</span>
          </button>
          <button
            onClick={() => setActiveNav('transactions')}
            className={`sidebar-link ${activeNav === 'transactions' ? 'active' : ''}`}
          >
            <Receipt className="w-4 h-4" />
            <span>{t.transactions}</span>
          </button>
          <button
            onClick={() => setActiveNav('cards')}
            className={`sidebar-link ${activeNav === 'cards' ? 'active' : ''}`}
          >
            <WalletCards className="w-4 h-4" />
            <span>{t.cardsAndWallets}</span>
          </button>
          <button
            onClick={() => setActiveNav('reports')}
            className={`sidebar-link ${activeNav === 'reports' ? 'active' : ''}`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>{t.reports}</span>
          </button>
        </div>

        {/* Navigation Section: ANOMALY */}
        <div className="space-y-1">
          <div className="px-2 text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase">
            {t.anomaly}
          </div>
          <button
            onClick={() => setActiveNav('anomalies')}
            className={`sidebar-link ${activeNav === 'anomalies' ? 'active' : ''}`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>{t.anomalies}</span>
          </button>
          <button
            onClick={() => setActiveNav('reconciliation')}
            className={`sidebar-link ${activeNav === 'reconciliation' ? 'active' : ''}`}
          >
            <Repeat className="w-4 h-4" />
            <span>{t.reconciliation}</span>
          </button>
          <button
            onClick={() => setActiveNav('subscriptions')}
            className={`sidebar-link ${activeNav === 'subscriptions' ? 'active' : ''}`}
          >
            <DollarSign className="w-4 h-4" />
            <span>{t.subscriptions}</span>
          </button>
          <button
            onClick={() => setActiveNav('payout_radar')}
            className={`sidebar-link ${activeNav === 'payout_radar' ? 'active' : ''}`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>{t.payoutRadar}</span>
          </button>
        </div>

        {/* Navigation Section: HỆ THỐNG / SYSTEM */}
        <div className="space-y-1">
          <div className="px-2 text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase">
            {t.system}
          </div>
          <button
            onClick={() => setActiveNav('notifications')}
            className={`sidebar-link justify-between ${activeNav === 'notifications' ? 'active' : ''}`}
          >
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4" />
              <span>{t.notifications}</span>
            </div>
            <span className="px-1.5 py-0.2 rounded bg-rose-500/15 text-rose-400 text-[10px] font-mono font-bold">
              3
            </span>
          </button>
          <button
            onClick={() => setActiveNav('support')}
            className={`sidebar-link ${activeNav === 'support' ? 'active' : ''}`}
          >
            <Mail className="w-4 h-4" />
            <span>{t.support}</span>
          </button>
          <button
            onClick={() => setActiveNav('settings')}
            className={`sidebar-link ${activeNav === 'settings' ? 'active' : ''}`}
          >
            <Settings className="w-4 h-4" />
            <span>{t.settings}</span>
          </button>
        </div>
      </div>

      {/* Account Balance Widget */}
      <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-2 mt-4">
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
          <span className="font-medium">{t.balanceTitle}</span>
          <button
            onClick={() => setIsBalanceMasked(!isBalanceMasked)}
            className="hover:text-[var(--text-primary)] transition-colors p-0.5"
            title={isBalanceMasked ? t.showBalance : t.maskBalance}
          >
            {isBalanceMasked ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div>
          <div className="text-lg font-bold text-[var(--text-primary)] tracking-tight font-mono">
            {isBalanceMasked ? '•••••••• USD' : '$128,490.50'} <span className="text-xs text-[var(--text-muted)] font-normal">USD</span>
          </div>
          <div className="text-[11px] text-[var(--text-muted)] font-mono">
            {isBalanceMasked ? '≈ •••••••• ₫' : '≈ 3.26 Tỷ VNĐ'}
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-[var(--border-subtle)]">
          <span className="text-emerald-400 font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            {t.userProBadge}
          </span>
          <span className="text-[var(--text-muted)] font-mono text-[10px]">4 Thẻ VPBank</span>
        </div>
      </div>
    </aside>
  );
};

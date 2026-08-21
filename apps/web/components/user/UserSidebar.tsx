import React from 'react';
import {
  MessagesSquare,
  LayoutDashboard,
  Receipt,
  Repeat,
  Mail,
  AlertTriangle,
  Clock,
  BarChart3,
  FileText,
  Activity,
  Eye,
  EyeOff,
  ShieldCheck,
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
    <aside className="w-64 bg-[var(--bg-sidebar)] border-r border-[var(--border-subtle)] flex flex-col justify-between p-3.5 shrink-0 overflow-y-auto min-h-0 transition-colors">
      <div className="space-y-4">
        {/* Navigation Group 1: Core Financial & Reconciliation */}
        <div className="space-y-1">
          <div className="px-2 text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase">
            {t.navCategoryMain}
          </div>

          {/* 1. AI Chat Copilot */}
          <button
            onClick={() => setActiveNav('chat')}
            className={`sidebar-link ${activeNav === 'chat' ? 'active' : ''}`}
          >
            <MessagesSquare className="w-4 h-4 text-[#FC6508]" />
            <span>{t.tabChat}</span>
          </button>

          {/* 2. Dashboard */}
          <button
            onClick={() => setActiveNav('dashboard')}
            className={`sidebar-link ${activeNav === 'dashboard' ? 'active' : ''}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>{t.tabDashboard}</span>
          </button>

          {/* 3. Statements & Analyzer */}
          <button
            onClick={() => setActiveNav('transactions')}
            className={`sidebar-link ${activeNav === 'transactions' ? 'active' : ''}`}
          >
            <Receipt className="w-4 h-4" />
            <span>{t.tabTransactions}</span>
          </button>

          {/* 4. 3-Way Reconciliation */}
          <button
            onClick={() => setActiveNav('reconciliation')}
            className={`sidebar-link ${activeNav === 'reconciliation' ? 'active' : ''}`}
          >
            <Repeat className="w-4 h-4" />
            <span>{t.tab3WayRecon}</span>
          </button>

          {/* 5. Email Reconciliation */}
          <button
            onClick={() => setActiveNav('email_matching')}
            className={`sidebar-link ${activeNav === 'email_matching' ? 'active' : ''}`}
          >
            <Mail className="w-4 h-4" />
            <span>{t.tabEmailMatching}</span>
          </button>

          {/* 6. Alerts 3 Levels */}
          <button
            onClick={() => setActiveNav('alerts')}
            className={`sidebar-link ${activeNav === 'alerts' ? 'active' : ''}`}
          >
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>{t.tabAlerts}</span>
          </button>

          {/* 7. 60-Day Deadlines & Reminders */}
          <button
            onClick={() => setActiveNav('reminders')}
            className={`sidebar-link ${activeNav === 'reminders' ? 'active' : ''}`}
          >
            <Clock className="w-4 h-4 text-[#FC6508]" />
            <span>{t.tabReminders}</span>
          </button>

          {/* 8. Reports & Forecast */}
          <button
            onClick={() => setActiveNav('reports')}
            className={`sidebar-link ${activeNav === 'reports' ? 'active' : ''}`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>{t.tabReports}</span>
          </button>
        </div>

        {/* Navigation Group 2: System & Compliance */}
        <div className="space-y-1">
          <div className="px-2 text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase">
            {t.navCategorySystem}
          </div>

          {/* 9. Audit Trail & Export */}
          <button
            onClick={() => setActiveNav('audit')}
            className={`sidebar-link ${activeNav === 'audit' ? 'active' : ''}`}
          >
            <FileText className="w-4 h-4" />
            <span>{t.tabAudit}</span>
          </button>

          {/* 10. Proactive Background Monitor */}
          <button
            onClick={() => setActiveNav('monitor')}
            className={`sidebar-link ${activeNav === 'monitor' ? 'active' : ''}`}
          >
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>{t.tabMonitor}</span>
          </button>
        </div>
      </div>

      {/* Account Balance Widget */}
      <div className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-2 mt-4">
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
          <span>{language === 'vi' ? 'Số dư khả dụng Wealify' : 'Available Balance'}</span>
          <button
            onClick={() => setIsBalanceMasked(!isBalanceMasked)}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            {isBalanceMasked ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>
        <div className="text-base font-bold font-mono text-[var(--text-primary)]">
          {isBalanceMasked ? '••••••••' : '$12,450.00 USD'}
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium pt-1 border-t border-[var(--border-subtle)]">
          <ShieldCheck className="w-3 h-3" />
          <span>Bảo vệ số dư 24/7</span>
        </div>
      </div>
    </aside>
  );
};

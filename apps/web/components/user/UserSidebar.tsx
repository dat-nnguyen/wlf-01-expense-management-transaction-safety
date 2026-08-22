import React from 'react';
import {
  MessagesSquare,
  AlertTriangle,
  BarChart3,
  Receipt,
  Cpu,
  Eye,
  EyeOff,
  ShieldCheck,
  Github,
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
        {/* Workspace Group 1: Core Financial Operations (User-Facing) */}
        <div className="space-y-1">
          <div className="px-2 text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase">
            {language === 'vi' ? 'Không Gian Nghiệp Vụ' : 'Financial Workspaces'}
          </div>

          {/* 1. AI Copilot Chat */}
          <button
            onClick={() => setActiveNav('chat')}
            className={`sidebar-link ${activeNav === 'chat' ? 'active' : ''}`}
          >
            <MessagesSquare className="w-4 h-4 text-[#FC6508]" />
            <span className="font-semibold">{language === 'vi' ? 'Trợ Lý AI Copilot' : 'AI Copilot Chat'}</span>
          </button>

          {/* 2. Discrepancy & Security Center (Alerts + 3-Way + Payout + 60 Days) */}
          <button
            onClick={() => setActiveNav('alerts')}
            className={`sidebar-link ${activeNav === 'alerts' ? 'active' : ''}`}
          >
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>{language === 'vi' ? 'Trung Tâm Tra Soát' : 'Discrepancy & Alerts'}</span>
          </button>

          {/* 3. Financial Reports & Unit Economics */}
          <button
            onClick={() => setActiveNav('reports')}
            className={`sidebar-link ${activeNav === 'reports' ? 'active' : ''}`}
          >
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <span>{language === 'vi' ? 'Báo Cáo & Dòng Tiền' : 'Reports & Cash Flow'}</span>
          </button>

          {/* 4. Multi-source Ledger & Audit Trail */}
          <button
            onClick={() => setActiveNav('transactions')}
            className={`sidebar-link ${activeNav === 'transactions' ? 'active' : ''}`}
          >
            <Receipt className="w-4 h-4 text-purple-400" />
            <span>{language === 'vi' ? 'Sổ Cái & Kiểm Toán' : 'Ledger & Audit Trail'}</span>
          </button>
        </div>

        {/* Workspace Group 2: Agent Administration & Oversight (Admin-Facing) */}
        <div className="space-y-1">
          <div className="px-2 text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase">
            {language === 'vi' ? 'Quản Trị & Giám Sát Agent' : 'Agent Governance'}
          </div>

          {/* 5. Agent Control Panel */}
          <button
            onClick={() => setActiveNav('agent_control')}
            className={`sidebar-link ${activeNav === 'agent_control' ? 'active' : ''}`}
          >
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>{language === 'vi' ? 'Bảng Quản Trị Agent' : 'Agent Control Center'}</span>
          </button>
        </div>
      </div>

      {/* Bottom Section: Balance Widget & GitHub Link */}
      <div className="space-y-2.5 mt-4">
        {/* Account Balance Widget */}
        <div className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>{language === 'vi' ? 'Số dư khả dụng Wealify' : 'Available Balance'}</span>
            <button
              onClick={() => setIsBalanceMasked(!isBalanceMasked)}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              {isBalanceMasked ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
          <div className="text-base font-bold font-mono text-[var(--text-primary)]">
            {isBalanceMasked ? '••••••••' : '$12,450.00 USD'}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium pt-1 border-t border-[var(--border-subtle)]">
            <ShieldCheck className="w-3 h-3" />
            <span>{language === 'vi' ? 'Bảo vệ số dư 24/7' : '24/7 Balance Protection'}</span>
          </div>
        </div>

        {/* GitHub Repository Link */}
        <a
          href="https://github.com/dat-nnguyen/wlf-01-expense-management-transaction-safety"
          target="_blank"
          rel="noopener noreferrer"
          title="GitHub Repository"
          className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all group shadow-sm"
        >
          <Github className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors" />
          <span className="font-semibold">{language === 'vi' ? 'Mã Nguồn (GitHub)' : 'Source Code (GitHub)'}</span>
        </a>
      </div>
    </aside>
  );
};

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
  X,
} from 'lucide-react';
import { Language } from '../../types';
import { TRANSLATIONS } from '../../data/translations';

interface UserSidebarProps {
  activeNav: string;
  setActiveNav: (nav: string) => void;
  isBalanceMasked: boolean;
  setIsBalanceMasked: (masked: boolean) => void;
  language: Language;
  isOpen?: boolean;
  onClose?: () => void;
}

export const UserSidebar: React.FC<UserSidebarProps> = ({
  activeNav,
  setActiveNav,
  isBalanceMasked,
  setIsBalanceMasked,
  language,
  isOpen = false,
  onClose,
}) => {
  const t = TRANSLATIONS[language];

  const handleSelect = (nav: string) => {
    setActiveNav(nav);
    onClose?.();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-fadeIn"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 sm:w-64 bg-[var(--bg-sidebar)] border-r border-[var(--border-subtle)] flex flex-col justify-between p-3.5 shrink-0 overflow-y-auto min-h-0 transition-all duration-300 ease-in-out md:static md:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-4">
          {/* Mobile Header Inside Drawer */}
          <div className="flex md:hidden items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-xs tracking-tight text-[var(--text-primary)]">
                WEALIFY <span className="text-[#FC6508]">GUARDIAN</span>
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Workspace Group 1: Core Financial Operations (User-Facing) */}
          <div className="space-y-1">
            <div className="px-2 text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase">
              {language === 'vi' ? 'Không Gian Nghiệp Vụ' : 'Financial Workspaces'}
            </div>

            {/* 1. AI Copilot Chat */}
            <button
              onClick={() => handleSelect('chat')}
              className={`sidebar-link ${activeNav === 'chat' ? 'active' : ''}`}
            >
              <MessagesSquare className="w-4 h-4 text-[#FC6508]" />
              <span className="font-semibold">{language === 'vi' ? 'Trợ Lý AI Copilot' : 'AI Copilot Chat'}</span>
            </button>

            {/* 2. Discrepancy & Security Center (Alerts + 3-Way + Payout + 60 Days) */}
            <button
              onClick={() => handleSelect('alerts')}
              className={`sidebar-link ${activeNav === 'alerts' ? 'active' : ''}`}
            >
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>{language === 'vi' ? 'Trung Tâm Tra Soát' : 'Discrepancy & Alerts'}</span>
            </button>

            {/* 3. Financial Reports & Unit Economics */}
            <button
              onClick={() => handleSelect('reports')}
              className={`sidebar-link ${activeNav === 'reports' ? 'active' : ''}`}
            >
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <span>{language === 'vi' ? 'Báo Cáo & Dòng Tiền' : 'Reports & Cash Flow'}</span>
            </button>

            {/* 4. Multi-source Ledger & Audit Trail */}
            <button
              onClick={() => handleSelect('transactions')}
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
              onClick={() => handleSelect('agent_control')}
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
    </>
  );
};

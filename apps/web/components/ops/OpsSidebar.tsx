import React from 'react';
import {
  ShieldCheck,
  LayoutDashboard,
  CreditCard,
  AlertTriangle,
  ShieldAlert,
  FileText,
  Database,
  SlidersHorizontal,
  Folder,
  Key,
  Building,
  ScrollText,
  Mail,
  Settings,
} from 'lucide-react';
import { Language } from '../../types';
import { TRANSLATIONS } from '../../data/translations';

interface OpsSidebarProps {
  activeNav: string;
  setActiveNav: (nav: string) => void;
  language: Language;
}

export const OpsSidebar: React.FC<OpsSidebarProps> = ({
  activeNav,
  setActiveNav,
  language,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <aside className="w-64 bg-[var(--bg-sidebar)] border-r border-[var(--border-subtle)] flex flex-col justify-between p-4 shrink-0 transition-colors min-h-0 overflow-y-auto">
      <div className="space-y-5 pr-1">
        {/* Section 1: TỔNG QUAN TÀI KHOẢN / YOUR ACCOUNT OVERVIEW */}
        <div className="space-y-1">
          <div className="px-2 text-[10px] font-bold text-[var(--text-muted)] tracking-wider uppercase">
            {t.opsOverview}
          </div>
          <button
            onClick={() => setActiveNav('dashboard')}
            className={`sidebar-link ${activeNav === 'dashboard' ? 'active' : ''}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>{t.opsDashboard}</span>
          </button>
          <button
            onClick={() => setActiveNav('system_stats')}
            className={`sidebar-link ${activeNav === 'system_stats' ? 'active' : ''}`}
          >
            <CreditCard className="w-4 h-4" />
            <span>{t.opsSystemStats}</span>
          </button>
        </div>

        {/* Section 2: AN NINH & TRA SOÁT / SECURITY & DISPUTES */}
        <div className="space-y-1">
          <div className="px-2 text-[10px] font-bold text-[var(--text-muted)] tracking-wider uppercase">
            {t.opsBotAndSecurity}
          </div>
          <button
            onClick={() => setActiveNav('bot_list')}
            className={`sidebar-link justify-between ${activeNav === 'bot_list' ? 'active' : ''}`}
          >
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4" />
              <span>{t.opsBotList}</span>
            </div>
            <span className="px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-400 text-[10px] font-mono font-bold">
              3
            </span>
          </button>
          <button
            onClick={() => setActiveNav('security_center')}
            className={`sidebar-link justify-between ${activeNav === 'security_center' ? 'active' : ''}`}
          >
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4" />
              <span>{t.opsSecurityCenter}</span>
            </div>
            <span className="px-1.5 py-0.2 rounded bg-rose-500/15 text-rose-400 text-[10px] font-mono font-bold">
              92/100
            </span>
          </button>
          <button
            onClick={() => setActiveNav('notifications')}
            className={`sidebar-link justify-between ${activeNav === 'notifications' ? 'active' : ''}`}
          >
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4" />
              <span>{language === 'vi' ? 'Nhật ký email cảnh báo' : 'Dispatched Alert Logs'}</span>
            </div>
            <span className="px-1.5 py-0.2 rounded bg-slate-700/40 text-[var(--text-muted)] text-[10px] font-mono font-bold">
              3
            </span>
          </button>
          <button
            onClick={() => setActiveNav('scripts')}
            className={`sidebar-link ${activeNav === 'scripts' ? 'active' : ''}`}
          >
            <FileText className="w-4 h-4" />
            <span>{t.opsPromptScripts}</span>
          </button>
          <button
            onClick={() => setActiveNav('knowledge')}
            className={`sidebar-link ${activeNav === 'knowledge' ? 'active' : ''}`}
          >
            <Database className="w-4 h-4" />
            <span>{t.opsKnowledgeBase}</span>
          </button>
        </div>

        {/* Section 3: KẾT NỐI & DỮ LIỆU */}
        <div className="space-y-1">
          <div className="px-2 text-[10px] font-bold text-[var(--text-muted)] tracking-wider uppercase">
            {t.opsIntegration}
          </div>
          <button
            onClick={() => setActiveNav('channels')}
            className={`sidebar-link ${activeNav === 'channels' ? 'active' : ''}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>{t.opsIntegrations}</span>
          </button>
          <button
            onClick={() => setActiveNav('datasources')}
            className={`sidebar-link ${activeNav === 'datasources' ? 'active' : ''}`}
          >
            <Folder className="w-4 h-4" />
            <span>{t.opsDataSources}</span>
          </button>
          <button
            onClick={() => setActiveNav('apikeys')}
            className={`sidebar-link ${activeNav === 'apikeys' ? 'active' : ''}`}
          >
            <Key className="w-4 h-4" />
            <span>{t.opsApiKeys}</span>
          </button>
        </div>

        {/* Section 4: HỆ THỐNG & NHẬT KÝ */}
        <div className="space-y-1">
          <div className="px-2 text-[10px] font-bold text-[var(--text-muted)] tracking-wider uppercase">
            {t.opsUsersAndRoles}
          </div>
          <button
            onClick={() => setActiveNav('users')}
            className={`sidebar-link ${activeNav === 'users' ? 'active' : ''}`}
          >
            <Building className="w-4 h-4" />
            <span>{t.opsUserList}</span>
          </button>
          <button
            onClick={() => setActiveNav('audit')}
            className={`sidebar-link ${activeNav === 'audit' ? 'active' : ''}`}
          >
            <ScrollText className="w-4 h-4" />
            <span>{t.opsAuditLog}</span>
          </button>
        </div>
      </div>

      {/* Footer Profile: The User's Own Account */}
      <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-primary)] text-[10px] font-bold font-mono">
            DN
          </div>
          <div>
            <div className="font-semibold text-[var(--text-primary)]">Dat Nguyen</div>
            <div className="text-[10px] text-[var(--text-muted)]">Volcano Ecom LLC</div>
          </div>
        </div>
        <button className="hover:text-[var(--text-primary)] transition-colors p-1">
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};

import React from 'react';
import {
  Calendar,
  Bell,
  Plus,
  ShieldCheck,
  Activity,
} from 'lucide-react';
import { Language } from '../../types';
import { TRANSLATIONS } from '../../data/translations';

interface OpsHeaderProps {
  activeNav: string;
  onOpenVerifyModal: () => void;
  language: Language;
}

export const OpsHeader: React.FC<OpsHeaderProps> = ({
  activeNav,
  onOpenVerifyModal,
  language,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <div className="h-16 border-b border-[var(--border-subtle)] px-6 flex items-center justify-between bg-[var(--bg-header)] sticky top-0 z-20 backdrop-blur-md transition-colors">
      {/* Left: View Title & Subtitle */}
      <div className="flex items-center gap-3">
        <div>
          <span className="text-sm font-bold text-[var(--text-primary)]">
            {activeNav === 'security_center'
              ? t.opsTitleSecurity
              : activeNav === 'bot_list' || activeNav === 'system_stats'
              ? t.botPerfTitle
              : t.opsTitleDashboard}
          </span>
          <p className="text-xs text-[var(--text-muted)] hidden md:block">
            {activeNav === 'security_center'
              ? t.opsSubtitleSecurity
              : activeNav === 'bot_list' || activeNav === 'system_stats'
              ? t.botPerfSubtitle
              : t.opsSubtitleDashboard}
          </p>
        </div>
      </div>

      {/* Right Controls: Environment, Date, Admin Profile & Action */}
      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] font-mono">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>{t.allEnvironments}</span>
        </div>

        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] font-mono">
          <Calendar className="w-3.5 h-3.5 text-[#FC6508]" />
          <span>01/08/2026 - 20/08/2026</span>
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-[var(--text-primary)] transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
            4
          </span>
        </button>

        {/* Admin Profile */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-[var(--border-subtle)]">
          <div className="w-8 h-8 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-primary)] font-bold text-xs font-mono">
            DN
          </div>
          <div className="text-left text-xs hidden sm:block">
            <div className="font-semibold text-[var(--text-primary)]">Dat Nguyen</div>
            <div className="text-[10px] text-[#FC6508] font-medium">Ops Admin</div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onOpenVerifyModal}
          className="btn-wealify text-xs py-2 px-3.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t.createSecurityCase}</span>
        </button>
      </div>
    </div>
  );
};

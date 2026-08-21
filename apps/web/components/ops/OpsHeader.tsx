import React from 'react';
import {
  Calendar,
  Bell,
  Plus,
  User,
  ShieldCheck,
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

  const currentUser = {
    id: 'acc_main',
    name: 'Dat Nguyen',
    company: 'Volcano Ecom LLC',
    email: 'founder@wealify.io',
    tier: 'Pro Seller',
    riskScore: 92,
  };

  return (
    <div className="h-16 border-b border-[var(--border-subtle)] px-6 flex items-center justify-between bg-[var(--bg-header)] sticky top-0 z-20 backdrop-blur-md transition-colors">
      {/* Left: View Title & Subtitle */}
      <div className="flex items-center gap-3">
        <div>
          <span className="text-sm font-bold text-[var(--text-primary)]">
            {activeNav === 'security_center'
              ? t.opsTitleSecurity
              : t.opsTitleDashboard}
          </span>
          <p className="text-xs text-[var(--text-muted)] hidden md:block">
            {activeNav === 'security_center'
              ? t.opsSubtitleSecurity
              : t.opsSubtitleDashboard}
          </p>
        </div>
      </div>

      {/* Right Controls: User Profile, Notifications, Action */}
      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] font-mono">
          <Calendar className="w-3.5 h-3.5 text-[#FC6508]" />
          <span>Tháng 08/2026</span>
        </div>

        {/* User's Own Account Profile Badge */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
          <div className="w-6 h-6 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-primary)] font-bold text-xs font-mono">
            DN
          </div>
          <div className="text-left text-xs">
            <div className="flex items-center gap-1.5 font-bold text-[var(--text-primary)] leading-tight">
              <span>{currentUser.name}</span>
              <span className="text-[10px] text-[var(--text-muted)] font-normal">({currentUser.company})</span>
              <span className="badge-wealify-orange text-[9px] px-1.5 py-0.2 rounded font-semibold">
                {currentUser.tier}
              </span>
            </div>
            <div className="text-[10px] text-[var(--text-muted)] font-mono">
              ID: {currentUser.id} • {currentUser.email}
            </div>
          </div>
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-[var(--text-primary)] transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
            3
          </span>
        </button>

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

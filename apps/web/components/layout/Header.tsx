import React from 'react';
import { ShieldCheck, Sun, Moon, Globe, Lock, AlertTriangle } from 'lucide-react';
import { Language } from '../../types';
import { TRANSLATIONS } from '../../data/translations';

interface HeaderProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  setLanguage,
  theme,
  setTheme,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <div className="w-full z-40 sticky top-0">
      {/* 1. Mandatory Fixed Warning Banner (Requirement 16: Non-dismissible, persistent) */}
      <div className="w-full bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border-b border-amber-500/30 px-4 py-2 text-center text-xs text-amber-200 backdrop-blur-md flex items-center justify-center gap-2 font-medium leading-tight">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        <span className="max-w-5xl">
          {t.fixedWarningBanner}
        </span>
      </div>

      {/* 2. Top Navigation Bar */}
      <header className="h-14 border-b border-[var(--border-subtle)] bg-[var(--bg-header)] backdrop-blur-md px-6 flex items-center justify-between transition-colors">
        {/* Left: Wealify Brand Logo & Status */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#FC6508] flex items-center justify-center text-white shrink-0 shadow-sm">
            <ShieldCheck className="w-4 h-4 stroke-[2.4]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-tight text-[var(--text-primary)]">
              WEALIFY <span className="text-[#FC6508]">GUARDIAN</span>
            </span>
            <span className="text-[10px] text-[var(--text-muted)] font-mono border border-[var(--border-subtle)] px-1.5 py-0.2 rounded">
              v2.5
            </span>
          </div>
        </div>

        {/* Center: Live API & Read-Only Status */}
        <div className="hidden sm:flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{t.apiOnline}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] font-medium">
            <Lock className="w-3 h-3 text-[#FC6508]" />
            <span>Read-Only Guard</span>
          </div>
        </div>

        {/* Right Controls: FX Rate, Theme Toggle, VI/EN */}
        <div className="flex items-center gap-2.5">
          {/* FX Reference Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-secondary)]">
            <Globe className="w-3 h-3 text-[var(--text-muted)]" />
            <span>$1 = 25,400₫</span>
          </div>

          {/* Dark / Light Mode Toggle Button */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={theme === 'dark' ? t.lightMode : t.darkMode}
            aria-label="Toggle Theme"
            className="p-1.5 rounded-lg bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[var(--text-secondary)]" />
            ) : (
              <Moon className="w-4 h-4 text-[var(--text-secondary)]" />
            )}
          </button>

          {/* VI / EN Language Switcher */}
          <div className="flex items-center bg-[var(--bg-input)] p-0.5 rounded-lg border border-[var(--border-subtle)] text-xs font-bold">
            <button
              onClick={() => setLanguage('vi')}
              className={`px-2 py-0.5 rounded transition-colors ${
                language === 'vi'
                  ? 'bg-[#FC6508] text-white shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              VI
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-0.5 rounded transition-colors ${
                language === 'en'
                  ? 'bg-[#FC6508] text-white shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </header>
    </div>
  );
};

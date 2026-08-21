import React from 'react';
import { ShieldCheck, Bot, LayoutDashboard, Sun, Moon, Globe, Lock, Activity } from 'lucide-react';
import { AppMode, Language } from '../../types';
import { TRANSLATIONS } from '../../data/translations';

interface HeaderProps {
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
}

export const Header: React.FC<HeaderProps> = ({
  appMode,
  setAppMode,
  language,
  setLanguage,
  theme,
  setTheme,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <header className="h-16 border-b border-[var(--border-subtle)] bg-[var(--bg-header)] backdrop-blur-md px-6 flex items-center justify-between z-30 sticky top-0 transition-colors">
      {/* Left: Wealify Brand Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#FC6508] flex items-center justify-center text-white shrink-0 shadow-sm">
          <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-base tracking-tight text-[var(--text-primary)]">
            WEALIFY <span className="text-[#FC6508]">GUARDIAN</span>
          </span>
          <span className="text-[10px] text-[var(--text-muted)] font-mono border border-[var(--border-subtle)] px-1.5 py-0.5 rounded">
            v2.4
          </span>
        </div>
      </div>

      {/* Center: Unified Mode Switcher Segmented Control */}
      <div className="flex items-center bg-[var(--bg-input)] p-1 rounded-xl border border-[var(--border-subtle)]">
        <button
          onClick={() => setAppMode('user_copilot')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            appMode === 'user_copilot'
              ? 'bg-[#FC6508] text-white shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>{language === 'vi' ? 'Chatbot Copilot' : 'Chatbot Copilot'}</span>
        </button>
        <button
          onClick={() => setAppMode('ops_console')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            appMode === 'ops_console'
              ? 'bg-[#FC6508] text-white shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>{language === 'vi' ? 'Security Center' : 'Security Center'}</span>
        </button>
      </div>

      {/* Right Controls: FX Rate, Theme Toggle, VI/EN */}
      <div className="flex items-center gap-2.5">
        {/* FX Reference Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-secondary)]">
          <Globe className="w-3 h-3 text-[var(--text-muted)]" />
          <span>$1 = 25,400₫</span>
        </div>

        {/* Read-Only Safety Guard Pill */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-secondary)]">
          <Lock className="w-3 h-3 text-[#FC6508]" />
          <span>Read-Only Guard</span>
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
                ? 'bg-[#FC6508] text-white'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            VI
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`px-2 py-0.5 rounded transition-colors ${
              language === 'en'
                ? 'bg-[#FC6508] text-white'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            EN
          </button>
        </div>
      </div>
    </header>
  );
};

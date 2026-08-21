import React from 'react';
import { Shield, Bot, LayoutDashboard } from 'lucide-react';
import { AppMode, Language } from '../../types';

interface HeaderProps {
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const Header: React.FC<HeaderProps> = ({
  appMode,
  setAppMode,
  language,
  setLanguage,
}) => {
  return (
    <header className="h-14 border-b border-[rgba(255,255,255,0.08)] bg-[#090e1a]/90 backdrop-blur-md px-5 flex items-center justify-between z-30 sticky top-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-purple-500/20">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-base tracking-wider bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
            WEALIFY GUARDIAN
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
            WLF-01 Copilot
          </span>
        </div>
      </div>

      {/* Center Mode Switcher Tabs */}
      <div className="flex items-center bg-[#060913] p-1 rounded-xl border border-[rgba(255,255,255,0.08)]">
        <button
          onClick={() => setAppMode('user_copilot')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            appMode === 'user_copilot'
              ? 'bg-[#3b2a6f] text-white shadow-md shadow-purple-900/40 border border-purple-500/40'
              : 'text-[#94a3b8] hover:text-white'
          }`}
        >
          <Bot className="w-4 h-4 text-purple-400" />
          <span>Khách hàng (User Copilot)</span>
        </button>
        <button
          onClick={() => setAppMode('ops_console')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            appMode === 'ops_console'
              ? 'bg-[#3b2a6f] text-white shadow-md shadow-purple-900/40 border border-purple-500/40'
              : 'text-[#94a3b8] hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 text-cyan-400" />
          <span>Wealify Operations &amp; Security Center</span>
        </button>
      </div>

      {/* Right Status Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
          className="px-2.5 py-1 rounded-md text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 text-[#94a3b8] hover:text-white transition-colors"
        >
          {language === 'vi' ? 'VN' : 'EN'}
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>API Online</span>
        </div>
      </div>
    </header>
  );
};

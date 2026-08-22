import React, { useState, useEffect } from 'react';
import { ShieldCheck, Sun, Moon, Globe, Lock, AlertTriangle, Settings, Check, RefreshCw, Server, Github, Menu, X } from 'lucide-react';
import { Language } from '../../types';
import { TRANSLATIONS } from '../../data/translations';
import { getApiUrl, setCustomApiUrl } from '../../utils/apiConfig';

interface HeaderProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  isMobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  setLanguage,
  theme,
  setTheme,
  isMobileMenuOpen = false,
  onToggleMobileMenu,
}) => {
  const t = TRANSLATIONS[language];
  const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [showApiModal, setShowApiModal] = useState(false);
  const [inputApiUrl, setInputApiUrl] = useState('');
  const [saveToast, setSaveToast] = useState(false);

  const checkHealth = async () => {
    try {
      const url = getApiUrl();
      const endpoint = url ? `${url}/health` : '/health';
      const res = await fetch(endpoint, { cache: 'no-store' });
      if (res.ok) {
        setApiStatus('online');
      } else {
        setApiStatus('offline');
      }
    } catch {
      setApiStatus('offline');
    }
  };

  useEffect(() => {
    checkHealth();
    setInputApiUrl(getApiUrl());
    const interval = setInterval(checkHealth, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveApiUrl = () => {
    setCustomApiUrl(inputApiUrl.trim());
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
    checkHealth();
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  return (
    <div className="w-full z-40 sticky top-0">
      {/* 1. Mandatory Fixed Warning Banner */}
      <div className="w-full bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border-b border-amber-500/30 px-2.5 sm:px-4 py-1.5 text-center text-[10px] sm:text-xs text-amber-200 backdrop-blur-md flex items-center justify-center gap-1.5 sm:gap-2 font-medium leading-tight">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="max-w-5xl line-clamp-1 sm:line-clamp-none">
          {t.fixedWarningBanner}
        </span>
      </div>

      {/* 2. Top Navigation Bar */}
      <header className="h-14 border-b border-[var(--border-subtle)] bg-[var(--bg-header)] backdrop-blur-md px-3 sm:px-6 flex items-center justify-between transition-colors">
        {/* Left: Mobile Menu Button + Wealify Brand Logo & Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Hamburger Toggle */}
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 rounded-lg bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            title="Menu"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4 text-[#FC6508]" /> : <Menu className="w-4 h-4" />}
          </button>

          <div className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 flex items-center justify-center">
            <img src="/logo.png" alt="Wealify Guardian Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="font-bold text-xs sm:text-sm tracking-tight text-[var(--text-primary)]">
              WEALIFY <span className="text-[#FC6508]">GUARDIAN</span>
            </span>
            <span className="text-[9px] sm:text-[10px] text-[var(--text-muted)] font-mono border border-[var(--border-subtle)] px-1 py-0.2 rounded">
              v2.5
            </span>
          </div>
        </div>

        {/* Center: Live API & Read-Only Status */}
        <div className="hidden sm:flex items-center gap-2 text-xs">
          <button
            onClick={() => {
              setInputApiUrl(getApiUrl());
              setShowApiModal(true);
            }}
            title="Click to configure Backend API URL"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-medium transition-all ${
              apiStatus === 'online'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                : apiStatus === 'checking'
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20 animate-pulse'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                apiStatus === 'online'
                  ? 'bg-emerald-400 animate-pulse'
                  : apiStatus === 'checking'
                  ? 'bg-amber-400'
                  : 'bg-rose-400'
              }`}
            ></span>
            <span>{apiStatus === 'online' ? t.apiOnline : apiStatus === 'checking' ? 'Checking API...' : 'Offline (Click to Config)'}</span>
          </button>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] font-medium">
            <Lock className="w-3 h-3 text-[#FC6508]" />
            <span>Read-Only Guard</span>
          </div>
        </div>

        {/* Right Controls: FX Rate, GitHub Repo, Theme Toggle, VI/EN */}
        <div className="flex items-center gap-2.5">
          {/* FX Reference Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-secondary)]">
            <Globe className="w-3 h-3 text-[var(--text-muted)]" />
            <span>$1 = 25,400₫</span>
          </div>

          {/* GitHub Repository Link */}
          <a
            href="https://github.com/dat-nnguyen/wlf-01-expense-management-transaction-safety"
            target="_blank"
            rel="noopener noreferrer"
            title={language === 'vi' ? 'Xem mã nguồn trên GitHub' : 'View Source Code on GitHub'}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all group"
          >
            <Github className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors" />
            <span className="hidden lg:inline font-medium">GitHub</span>
          </a>

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

      {/* API Configuration Modal */}
      {showApiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-[#FC6508]" />
                <h3 className="font-bold text-sm text-[var(--text-primary)]">
                  {language === 'vi' ? 'Cấu Hình Kết Nối Backend API' : 'Backend API Connection'}
                </h3>
              </div>
              <button
                onClick={() => setShowApiModal(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-[var(--text-secondary)] font-medium">
                {language === 'vi' ? 'Đường dẫn Backend (Railway URL hoặc Localhost):' : 'Backend URL (Railway or Localhost):'}
              </label>
              <input
                type="text"
                value={inputApiUrl}
                onChange={(e) => setInputApiUrl(e.target.value)}
                placeholder="https://your-api.up.railway.app"
                className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-mono focus:outline-none focus:border-[#FC6508]"
              />
              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                {language === 'vi'
                  ? '💡 Dán domain công khai do Railway cấp (hoặc http://127.0.0.1:8000 khi chạy local). Cấu hình này lưu trực tiếp vào trình duyệt của bạn.'
                  : '💡 Paste your Railway public domain (or http://127.0.0.1:8000 for local). Saved directly in your browser.'}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setInputApiUrl('http://127.0.0.1:8000');
                }}
                className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] underline"
              >
                Reset Localhost
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowApiModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] font-medium"
                >
                  {language === 'vi' ? 'Hủy' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleSaveApiUrl}
                  className="px-4 py-1.5 rounded-xl bg-[#FC6508] hover:bg-[#e05603] text-white text-xs font-bold shadow-md shadow-[#FC6508]/20 flex items-center gap-1.5"
                >
                  {saveToast ? <Check className="w-3.5 h-3.5" /> : null}
                  {language === 'vi' ? (saveToast ? 'Đã lưu!' : 'Lưu & Kết Nối') : (saveToast ? 'Saved!' : 'Save & Connect')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

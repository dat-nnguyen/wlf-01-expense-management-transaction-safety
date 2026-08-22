/**
 * Centralized API URL resolver for local development and cloud production (Vercel + Railway).
 * Supports:
 * 1. User manual runtime setting (localStorage `WEALIFY_API_URL`)
 * 2. Build-time NEXT_PUBLIC_API_URL
 * 3. Localhost fallback
 */
export const getApiUrl = (): string => {
  // 1. User manual override via UI / localStorage
  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem('WEALIFY_API_URL');
    if (customUrl && customUrl.trim()) {
      return customUrl.trim().replace(/\/+$/, '');
    }
  }

  // 2. Build-time environment variable
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.trim().replace(/\/+$/, '');
  }

  // 3. Localhost fallback
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://127.0.0.1:8000';
    }
  }

  return '';
};

export const setCustomApiUrl = (url: string): void => {
  if (typeof window !== 'undefined') {
    if (!url || !url.trim()) {
      localStorage.removeItem('WEALIFY_API_URL');
    } else {
      localStorage.setItem('WEALIFY_API_URL', url.trim().replace(/\/+$/, ''));
    }
  }
};


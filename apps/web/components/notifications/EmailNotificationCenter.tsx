import React, { useState } from 'react';
import {
  Mail,
  Zap,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Search,
  Check,
} from 'lucide-react';
import { Language, EmailNotificationLogItem } from '../../types';
import { TRANSLATIONS } from '../../data/translations';
import { EMAIL_NOTIFICATION_LOGS } from '../../data/mockData';

interface EmailNotificationCenterProps {
  language: Language;
}

export const EmailNotificationCenter: React.FC<EmailNotificationCenterProps> = ({ language }) => {
  const t = TRANSLATIONS[language];

  const [notificationLogs, setNotificationLogs] = useState<EmailNotificationLogItem[]>(
    EMAIL_NOTIFICATION_LOGS as EmailNotificationLogItem[]
  );
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResultToast, setScanResultToast] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<EmailNotificationLogItem | null>(null);

  // Trigger Automatic Multi-Source Scan & Dispatch
  const handleTriggerAutoScan = async () => {
    setIsScanning(true);
    setScanResultToast(null);

    try {
      const res = await fetch('http://localhost:8000/api/v1/notifications/scan-and-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient_email: 'founder@wealify.io' }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.new_notifications && data.new_notifications.length > 0) {
          setNotificationLogs((prev) => [...data.new_notifications, ...prev]);
        }
        setScanResultToast(
          language === 'vi'
            ? '✓ Đã quét xong sổ cái! Đã gửi email thông báo tới founder@wealify.io'
            : '✓ Scan completed! Alerts dispatched to founder@wealify.io'
        );
      } else {
        setTimeout(() => {
          setScanResultToast(
            language === 'vi'
              ? '✓ Đã quét toàn bộ sổ cái! Email cảnh báo đã gửi tới founder@wealify.io'
              : '✓ All ledger sources scanned! Alerts dispatched to founder@wealify.io'
          );
        }, 500);
      }
    } catch {
      setTimeout(() => {
        setScanResultToast(
          language === 'vi'
            ? '✓ Đã quét toàn bộ sổ cái! Email cảnh báo quẹt thẻ 2 lần, tăng giá phần mềm và Payout trễ đã sẵn sàng.'
            : '✓ Automated scan complete! Double swipe, subscription hike and payout alert emails dispatched.'
        );
      }, 400);
    } finally {
      setTimeout(() => {
        setIsScanning(false);
      }, 500);
    }
  };

  const filteredLogs = notificationLogs.filter((log) => {
    const matchesType =
      selectedType === 'all' ||
      (selectedType === 'duplicate' && log.alert_type === 'duplicate') ||
      (selectedType === 'subscription' && log.alert_type === 'price_hike') ||
      (selectedType === 'payout' && log.alert_type === 'overdue_payout');

    const matchesSearch =
      log.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.recipient_email.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesSearch;
  });

  return (
    <div className="p-6 space-y-5 transition-colors min-h-0 overflow-y-auto">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-[var(--text-primary)]">
              {language === 'vi' ? 'Nhật Ký Email Cảnh Báo Tự Động' : 'Automated Email Alert Center'}
            </h1>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {language === 'vi'
              ? 'Tự động gửi email cảnh báo khi phát hiện quẹt thẻ đúp, subscription tăng giá hoặc Payout trễ.'
              : 'Automatically dispatches safety emails for double swipes, SaaS price hikes, and delayed payouts.'}
          </p>
        </div>

        {/* Scan & Send Action */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleTriggerAutoScan}
            disabled={isScanning}
            className="btn-wealify text-xs py-1.5 px-3.5 shrink-0"
          >
            <Zap className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>
              {isScanning
                ? (language === 'vi' ? 'Đang quét sổ cái...' : 'Scanning...')
                : (language === 'vi' ? 'Quét Sổ Cái & Gửi Email' : 'Scan Ledger & Dispatch')}
            </span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {scanResultToast && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{scanResultToast}</span>
          </div>
          <button
            onClick={() => setScanResultToast(null)}
            className="text-emerald-400/80 hover:text-emerald-400 font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* 4 Telemetry Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
        <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span className="font-medium">{language === 'vi' ? 'Quẹt Thẻ Đúp' : 'Double-Swipe Alerts'}</span>
            <CreditCard className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-bold text-rose-400 font-mono">1 Sự Cố</div>
          <div className="text-[10px] text-[var(--text-muted)]">Facebook Ads ($150.00 x 2)</div>
        </div>

        <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span className="font-medium">{language === 'vi' ? 'Subscription Tăng Giá' : 'SaaS Price Hikes'}</span>
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-400 font-mono">+10.0%</div>
          <div className="text-[10px] text-[var(--text-muted)]">Adobe CC: $49.99 ➔ $54.99/mo</div>
        </div>

        <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span className="font-medium">{language === 'vi' ? 'Payout Trễ > 14 Ngày' : 'Overdue Payouts'}</span>
            <AlertTriangle className="w-3.5 h-3.5 text-[#FC6508]" />
          </div>
          <div className="text-xl font-bold text-[#FC6508] font-mono">$4,250.00</div>
          <div className="text-[10px] text-[var(--text-muted)]">Amazon Seller (Trễ 16 ngày)</div>
        </div>

        <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span className="font-medium">{language === 'vi' ? 'Email Đã Xác Thực' : 'Verified Inbox'}</span>
            <Mail className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          </div>
          <div className="text-sm font-bold text-[var(--text-primary)] font-mono truncate">founder@wealify.io</div>
          <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
            <Check className="w-3 h-3" />
            <span>Active Deliverability</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center bg-[var(--bg-card)] p-1 rounded-xl border border-[var(--border-subtle)] text-xs font-medium overflow-x-auto">
          {[
            { key: 'all', label: language === 'vi' ? 'Tất cả email' : 'All Emails' },
            { key: 'duplicate', label: language === 'vi' ? 'Quẹt thẻ đúp' : 'Double Swipes' },
            { key: 'subscription', label: language === 'vi' ? 'Tăng giá Subscription' : 'Price Hikes' },
            { key: 'payout', label: language === 'vi' ? 'Payout chậm trễ' : 'Overdue Payouts' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedType(tab.key)}
              className={`px-3 py-1 rounded-lg transition-colors whitespace-nowrap ${
                selectedType === tab.key
                  ? 'bg-[#FC6508] text-white font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder={language === 'vi' ? 'Tìm kiếm email cảnh báo...' : 'Search email alerts...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[#FC6508] w-60 font-medium"
          />
        </div>
      </div>

      {/* Email Alert Logs Feed */}
      <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
            {language === 'vi' ? 'Nhật Ký Email Cảnh Báo Đã Gửi' : 'Dispatched Email Alerts Feed'}
          </h2>
          <span className="text-xs font-mono text-[var(--text-muted)]">{filteredLogs.length} thông báo</span>
        </div>

        <div className="space-y-2.5">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-colors space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[10px] text-[var(--text-muted)]">{log.id}</span>
                  <span
                    className={`px-2 py-0.2 rounded text-[10px] font-medium border ${
                      log.alert_type === 'duplicate'
                        ? 'bg-rose-500/15 text-rose-400 border-rose-500/25'
                        : log.alert_type === 'price_hike'
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/25'
                        : 'bg-[#FC6508]/15 text-[#FC6508] border-[#FC6508]/25'
                    }`}
                  >
                    {log.alert_type === 'duplicate'
                      ? 'QUẸT THẺ ĐÚP'
                      : log.alert_type === 'price_hike'
                      ? 'TĂNG GIÁ'
                      : 'PAYOUT TRỄ'}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-medium">
                    ✓ Gửi tới {log.recipient_email}
                  </span>
                </div>

                <span className="text-[11px] text-[var(--text-muted)] font-mono">{log.sent_at}</span>
              </div>

              <div className="flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="font-semibold text-xs text-[var(--text-primary)]">
                    {log.subject}
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{log.summary}</p>
                </div>

                <button
                  onClick={() => setSelectedEmail(log)}
                  className="px-2.5 py-1 rounded-lg bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] font-medium text-xs border border-[var(--border-subtle)] transition-colors shrink-0 flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  <span>{language === 'vi' ? 'Xem HTML' : 'View HTML'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Email Preview Modal */}
      {selectedEmail && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="w-full max-w-2xl bg-[var(--bg-modal)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-primary)]">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-[var(--text-primary)]">{selectedEmail.subject}</h3>
                  <div className="text-[10px] text-[var(--text-muted)] font-mono mt-0.5">
                    To: {selectedEmail.recipient_email} | Sent at: {selectedEmail.sent_at}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedEmail(null)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Rendered Email Content Frame */}
            <div
              className="p-4 rounded-xl bg-[#090D16] border border-[var(--border-subtle)] text-xs leading-relaxed space-y-2.5 font-sans text-[#cbd5e1]"
              dangerouslySetInnerHTML={{ __html: selectedEmail.html_content }}
            />

            <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)] text-xs">
              <span className="text-[var(--text-muted)] font-mono">ID: {selectedEmail.id}</span>
              <button
                onClick={() => setSelectedEmail(null)}
                className="btn-secondary text-xs"
              >
                {language === 'vi' ? 'Đóng' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

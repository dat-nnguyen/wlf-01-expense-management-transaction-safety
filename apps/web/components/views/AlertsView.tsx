import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Clock,
  ExternalLink,
  Copy,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Language } from '../../types';

import {
  translateStatus,
  translateConfidence,
  translateAlertTitle,
  translateAlertReason,
  translateActionSuggestion,
} from '../../utils/translationHelper';

interface AlertsViewProps {
  language: Language;
  onOpenReminderModal?: (alert: any) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  language,
  onOpenReminderModal,
}) => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
        apiUrl = apiUrl.replace(/\/+$/, '');
        const res = await fetch(`${apiUrl}/api/v1/alerts`);
        if (res.ok) {
          const data = await res.json();
          setAlerts(data);
        }
      } catch (err) {
        console.error('Failed to load alerts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  const filtered = alerts.filter((a) => {
    if (filterLevel === 'all') return true;
    return a.status === filterLevel;
  });

  const getStatusBadge = (status: string) => {
    const translatedText = translateStatus(status, language);
    if (status === 'Định kỳ đã xác định') {
      return (
        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 w-max">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{translatedText}</span>
        </span>
      );
    }
    if (status === 'Cần bạn tự xác nhận') {
      return (
        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1.5 w-max">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{translatedText}</span>
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 w-max">
        <HelpCircle className="w-3.5 h-3.5" />
        <span>{translatedText}</span>
      </span>
    );
  };

  const handleCopyDraft = (draft: string) => {
    navigator.clipboard.writeText(draft);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-[#FC6508]" />
          <span>{language === 'vi' ? 'Trung Tâm Cảnh Báo An Toàn (3 Mức Bắt Buộc)' : 'Financial Safety Alerts (Tri-State System)'}</span>
        </h2>
        <p className="text-xs text-[var(--text-muted)]">
          {language === 'vi'
            ? 'Mọi cảnh báo bắt buộc tuân thủ 1 trong 3 nhãn chuẩn hóa, đính kèm hạn khiếu nại 60 ngày và căn cứ đối soát.'
            : 'Standardized tri-state classification with 60-day US dispute deadline countdown.'}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center bg-[var(--bg-card)] p-1.5 rounded-xl border border-[var(--border-subtle)] overflow-x-auto gap-1">
        {[
          { id: 'all', label: language === 'vi' ? 'Tất cả mức cảnh báo' : 'All Alerts' },
          { id: 'Định kỳ đã xác định', label: language === 'vi' ? '① Định kỳ đã xác định' : '① Confirmed Recurring' },
          { id: 'Cần bạn tự xác nhận', label: language === 'vi' ? '② Cần bạn tự xác nhận' : '② Needs Confirmation' },
          { id: 'Chưa đủ dữ liệu', label: language === 'vi' ? '③ Chưa đủ dữ liệu' : '③ Insufficient Data' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterLevel(tab.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              filterLevel === tab.id
                ? 'bg-[#FC6508] text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Alert Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((a, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-all space-y-3.5 flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              {/* Header: Label + Deadline */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                {getStatusBadge(a.status)}
                <div className="flex items-center gap-1 font-mono text-[11px] text-[#FC6508] bg-[#FC6508]/10 px-2 py-0.5 rounded-md border border-[#FC6508]/20">
                  <Clock className="w-3 h-3" />
                  <span>
                    {language === 'vi' ? 'Hạn tra soát:' : 'Dispute window:'} {a.deadline_days || 60} {language === 'vi' ? 'ngày' : 'days'}
                  </span>
                </div>
              </div>

              {/* Title & Amount */}
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-sm text-[var(--text-primary)]">
                  {translateAlertTitle(a.title, language)}
                </h3>
                {a.amount && (
                  <span className="font-mono font-bold text-sm text-[var(--text-primary)] shrink-0">
                    ${Number(a.amount).toFixed(2)} USD
                  </span>
                )}
              </div>

              {/* Reason */}
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {translateAlertReason(a.reason, language)}
              </p>

              {/* Confidence & Source */}
              <div className="flex items-center gap-3 text-[11px] pt-1">
                <span className="text-emerald-400 font-medium">
                  {language === 'vi' ? 'Độ tin cậy:' : 'Confidence:'} {translateConfidence(a.confidence_label, language)} ({Math.round(a.confidence * 100)}%)
                </span>
                <span className="text-[var(--text-muted)]">•</span>
                <span className="text-[var(--text-muted)] font-mono">
                  {language === 'vi' ? 'Mã TX:' : 'TX ID:'} {a.transaction_ids?.[0] || 'TX-9182'}
                </span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
              <div className="text-[11px] text-[var(--text-muted)] italic truncate max-w-[240px]">
                {translateActionSuggestion(a.action_suggestion, language) || (language === 'vi' ? 'Kiểm tra lại sao kê ngân hàng.' : 'Review bank statement records.')}
              </div>
              {a.dispute_draft && (
                <button
                  onClick={() => setSelectedAlert(a)}
                  className="px-3 py-1.5 rounded-lg bg-[var(--bg-input)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-[11px] font-semibold text-[#FC6508] transition-colors shrink-0"
                >
                  {language === 'vi' ? 'Mẫu đơn tra soát' : 'Dispute Letter Draft'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Dispute Draft Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[var(--text-primary)]">
                {language === 'vi' ? 'Bản Thảo Thư Khiếu Nại Ngân Hàng (Dispute Draft)' : 'Bank Dispute Letter Draft'}
              </h3>
              <button
                onClick={() => setSelectedAlert(null)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs font-bold"
              >
                ✕
              </button>
            </div>
            <pre className="p-3.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] font-mono whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
              {selectedAlert.dispute_draft}
            </pre>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => handleCopyDraft(selectedAlert.dispute_draft)}
                className="px-4 py-2 rounded-xl bg-[#FC6508] hover:bg-[#e05603] text-white text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>
                  {copiedDraft
                    ? (language === 'vi' ? 'Đã sao chép!' : 'Copied!')
                    : (language === 'vi' ? 'Sao chép thư khiếu nại' : 'Copy Dispute Draft')}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

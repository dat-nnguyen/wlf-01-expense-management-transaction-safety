import React, { useEffect, useState } from 'react';
import {
  Mail,
  Search,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ShieldAlert,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { Language } from '../../types';
import {
  translateStatus,
  translateConfidence,
  translateEmailReason,
  translateEmailSource,
} from '../../utils/translationHelper';
import { getApiUrl } from '../../utils/apiConfig';

interface EmailMatchingViewProps {
  language: Language;
}

export const EmailMatchingView: React.FC<EmailMatchingViewProps> = ({ language }) => {
  const [matches, setMatches] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fetchEmailMatches = async () => {
    setLoading(true);
    try {
      const apiUrl = getApiUrl();
      const base = apiUrl || '';
      const res = await fetch(`${base}/api/v1/reconciliation/email-matches`);
      if (res.ok) {
        const data = await res.json();
        setMatches(Array.isArray(data) ? data : data.matches || []);
      }
    } catch (err) {
      console.error('Failed to fetch email matches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmailMatches();
  }, []);

  const filtered = matches.filter((m) => {
    const matchStatus = filterStatus === 'all' || m.match_status === filterStatus;
    const q = searchQuery.toLowerCase();
    const matchQuery =
      !q ||
      m.transaction_merchant.toLowerCase().includes(q) ||
      m.transaction_id.toLowerCase().includes(q) ||
      (m.email_sender && m.email_sender.toLowerCase().includes(q)) ||
      (m.email_subject && m.email_subject.toLowerCase().includes(q));
    return matchStatus && matchQuery;
  });

  const getStatusBadge = (status: string) => {
    const translatedText = translateStatus(status, language);
    if (status === 'Có email khớp') {
      return (
        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 w-max">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{translatedText}</span>
        </span>
      );
    }
    if (status === 'Email nghi giả') {
      return (
        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1.5 w-max">
          <ShieldAlert className="w-3.5 h-3.5" />
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

  return (
    <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#FC6508]" />
            <span>{language === 'vi' ? 'Đối Soát Biên Lai & Email (Receipt & Invoice Matcher)' : 'Receipt & Email Invoice Matcher'}</span>
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {language === 'vi'
              ? 'Tự động quét hộp thư Gmail/Outlook, bóc tách hóa đơn VAT và biên lai PDF/PNG khớp với từng giao dịch.'
              : 'Autonomous OCR & Mailbox ingestion cross-checking invoices against transaction ledger.'}
          </p>
        </div>

        <button
          onClick={fetchEmailMatches}
          className="px-3.5 py-2 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)] transition-all flex items-center gap-1.5 shadow-sm self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#FC6508] ${loading ? 'animate-spin' : ''}`} />
          <span>{language === 'vi' ? 'Quét lại hòm thư' : 'Sync Mailbox'}</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 bg-[var(--bg-card)] p-3 rounded-2xl border border-[var(--border-subtle)]">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'vi' ? 'Tìm merchant, mã TX, tiêu đề email...' : 'Search merchant, ref, subject...'}
            className="w-full pl-9 pr-4 py-2 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[#FC6508]"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none self-start sm:self-auto">
          {[
            { id: 'all', label: language === 'vi' ? 'Tất cả' : 'All' },
            { id: 'Có email khớp', label: language === 'vi' ? 'Khớp hoàn toàn' : 'Matched' },
            { id: 'Thiếu hóa đơn/email', label: language === 'vi' ? 'Thiếu biên lai' : 'Missing Receipt' },
            { id: 'Lệch số tiền', label: language === 'vi' ? 'Lệch tiền' : 'Mismatch' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                filterStatus === tab.id
                  ? 'bg-[#FC6508] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Canonical 4-Column Output Table (Requirement 3) */}
      <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--bg-secondary)] text-[var(--text-muted)] uppercase tracking-wider font-semibold border-b border-[var(--border-subtle)]">
              <tr>
                <th className="py-3 px-4">{language === 'vi' ? 'Giao Dịch (Transaction)' : 'Transaction'}</th>
                <th className="py-3 px-4">{language === 'vi' ? 'Email Đối Chiếu (Mailbox Evidence)' : 'Mailbox Evidence'}</th>
                <th className="py-3 px-4">{language === 'vi' ? 'Kết Quả (Result)' : 'Result'}</th>
                <th className="py-3 px-4">{language === 'vi' ? 'Độ Tin Cậy (Confidence)' : 'Confidence'}</th>
                <th className="py-3 px-4">{language === 'vi' ? 'Lý Do Match & Nguồn Sử Dụng' : 'Match Reason & Source'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filtered.map((item, idx) => (
                <tr key={idx} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                  {/* Col 1: Transaction */}
                  <td className="py-3 px-4">
                    <div className="font-bold text-[var(--text-primary)] text-sm font-mono">
                      ${Number(item.transaction_amount || 0).toFixed(2)} USD
                    </div>
                    <div className="font-semibold text-xs text-[var(--text-primary)] mt-0.5">
                      {item.transaction_merchant}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)] font-mono">
                      {item.transaction_date} • {item.transaction_id}
                    </div>
                  </td>

                  {/* Col 2: Email */}
                  <td className="py-3 px-4 max-w-xs">
                    {item.email_subject !== '—' ? (
                      <div className="space-y-0.5">
                        <div className="font-semibold text-xs text-[var(--text-primary)] truncate">
                          {item.email_subject}
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)] font-mono truncate">
                          {language === 'vi' ? 'Từ:' : 'From:'} {item.email_sender}
                        </div>
                        <div className="text-[10px] text-[var(--text-muted)] font-mono">
                          {language === 'vi' ? 'Ngày:' : 'Date:'} {item.email_date}
                        </div>
                      </div>
                    ) : (
                      <span className="text-[var(--text-muted)] font-mono">{language === 'vi' ? '— (Không có)' : '— (None)'}</span>
                    )}
                  </td>

                  {/* Col 3: Kết quả */}
                  <td className="py-3 px-4">
                    {getStatusBadge(item.match_status)}
                  </td>

                  {/* Col 4: Confidence */}
                  <td className="py-3 px-4">
                    <div className="font-mono font-bold text-sm text-[var(--text-primary)]">
                      {item.confidence_percentage}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)]">
                      {translateConfidence(item.confidence_label, language)}
                    </div>
                  </td>

                  {/* Col 5: Lý do & Source */}
                  <td className="py-3 px-4 max-w-sm">
                    <div className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                      {translateEmailReason(item.match_reason, language)}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)] font-mono mt-1">
                      {language === 'vi' ? 'Nguồn:' : 'Source:'} {translateEmailSource(item.source_used, language)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import {
  FileText,
  Download,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import { Language } from '../../types';

interface AuditTrailViewProps {
  language: Language;
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({ language }) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      apiUrl = apiUrl.replace(/\/+$/, '');
      const res = await fetch(`${apiUrl}/api/v1/audit/logs`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleExport = (format: 'csv' | 'json') => {
    let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    apiUrl = apiUrl.replace(/\/+$/, '');
    window.open(`${apiUrl}/api/v1/audit/export?format=${format}`, '_blank');
  };

  const filtered = logs.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      item.id.toLowerCase().includes(q) ||
      item.event_type.toLowerCase().includes(q) ||
      item.target_reference.toLowerCase().includes(q) ||
      item.reason.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Header & Export Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#FC6508]" />
            <span>{language === 'vi' ? 'Nhật Ký Kiểm Toán & Xuất File (Audit Trail)' : 'Audit Trail & Compliance Export'}</span>
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            {language === 'vi'
              ? 'Ghi nhật ký chi tiết mỗi lần AI gắn cờ giao dịch: lý do, mức tin cậy, nguồn dữ liệu; hỗ trợ xuất file CSV/JSON.'
              : 'Complete immutable log of all flagged transactions with export capabilities.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('csv')}
            className="px-3.5 py-2 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)] transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-[#FC6508]" />
            <span>Xuất CSV (Export CSV)</span>
          </button>
          <button
            onClick={() => handleExport('json')}
            className="px-3.5 py-2 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)] transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Xuất JSON (Export JSON)</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-3 bg-[var(--bg-card)] p-3 rounded-xl border border-[var(--border-subtle)]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo mã log, loại sự kiện, mã tham chiếu..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[var(--bg-input)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#FC6508]"
          />
        </div>
        <span className="text-xs text-[var(--text-muted)] font-mono">
          Tổng cộng: {filtered.length} bản ghi
        </span>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--bg-secondary)] text-[var(--text-muted)] uppercase tracking-wider font-semibold border-b border-[var(--border-subtle)]">
              <tr>
                <th className="py-3 px-4">Mã Log & Thời Gian</th>
                <th className="py-3 px-4">Loại Sự Kiện (Event Type)</th>
                <th className="py-3 px-4">Mã Đối Soát (Reference)</th>
                <th className="py-3 px-4">Số Tiền</th>
                <th className="py-3 px-4">Lý Do / Bằng Chứng Gắn Cờ</th>
                <th className="py-3 px-4">Phân Loại 3 Mức</th>
                <th className="py-3 px-4">Mức Tin Cậy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filtered.map((item, idx) => {
                const dateStr = typeof item.timestamp === 'string' ? item.timestamp.slice(0, 19).replace('T', ' ') : '2026-08-21 14:30';
                return (
                  <tr key={idx} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-[var(--text-primary)]">{item.id}</div>
                      <div className="text-[10px] text-[var(--text-muted)] font-mono">{dateStr}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[var(--bg-input)] text-[#FC6508] border border-[var(--border-subtle)]">
                        {item.event_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-[var(--text-primary)]">
                      {item.target_reference}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[var(--text-primary)]">
                      ${Number(item.amount || 0).toFixed(2)} USD
                    </td>
                    <td className="py-3 px-4 text-[11px] text-[var(--text-secondary)] max-w-sm leading-relaxed">
                      {item.reason}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                        {item.classification}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[11px] font-medium text-emerald-400">
                      {item.confidence_label}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

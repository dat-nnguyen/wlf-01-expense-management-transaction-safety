import React, { useEffect, useState } from 'react';
import {
  Clock,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  RefreshCw,
  Bell,
  Calendar,
} from 'lucide-react';
import { Language } from '../../types';

interface RemindersViewProps {
  language: Language;
}

export const RemindersView: React.FC<RemindersViewProps> = ({ language }) => {
  const [reminders, setReminders] = useState<any[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    transaction_id: '',
    merchant: '',
    amount: '',
    statement_date: '',
    notes: '',
  });

  const fetchReminders = async () => {
    setLoading(true);
    try {
      let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      apiUrl = apiUrl.replace(/\/+$/, '');
      const res = await fetch(`${apiUrl}/api/v1/reminders`);
      if (res.ok) {
        const data = await res.json();
        setReminders(data);
      }
    } catch (err) {
      console.error('Failed to load reminders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      apiUrl = apiUrl.replace(/\/+$/, '');

      const res = await fetch(`${apiUrl}/api/v1/reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction_id: formData.transaction_id || `tx_${Date.now().toString().slice(-4)}`,
          merchant: formData.merchant,
          amount: parseFloat(formData.amount) || 0.0,
          statement_date: formData.statement_date || '2026-08-19',
          notes: formData.notes,
        }),
      });

      const data = await res.json();
      setFeedback(data.message);
      setIsCreateOpen(false);
      fetchReminders();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      console.error('Failed to create reminder:', err);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      apiUrl = apiUrl.replace(/\/+$/, '');
      await fetch(`${apiUrl}/api/v1/reminders/${id}/resolve`, { method: 'POST' });
      fetchReminders();
    } catch (err) {
      console.error('Failed to resolve reminder:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      apiUrl = apiUrl.replace(/\/+$/, '');
      await fetch(`${apiUrl}/api/v1/reminders/${id}`, { method: 'DELETE' });
      fetchReminders();
    } catch (err) {
      console.error('Failed to delete reminder:', err);
    }
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#FC6508]" />
            <span>{language === 'vi' ? 'Theo Dõi Hạn Khiếu Nại 60 Ngày & Nhắc Nhở' : '60-Day Dispute Deadlines & Reminders'}</span>
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            {language === 'vi'
              ? 'Theo luật ngân hàng Mỹ (Regulation E), hạn chót tra soát là 60 ngày kể từ ngày ngân hàng gửi sao kê.'
              : 'Under US banking regulations, dispute deadline is exactly 60 days from statement date.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[#FC6508] hover:bg-[#e05603] text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'vi' ? 'Tạo nhắc nhở mới' : 'Create Reminder'}</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Reminder Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reminders.map((rem, idx) => {
          const isUrgent = rem.days_remaining <= 15;
          const isResolved = rem.status === 'RESOLVED';
          return (
            <div
              key={idx}
              className={`p-5 rounded-2xl bg-[var(--bg-card)] border transition-all space-y-3.5 flex flex-col justify-between ${
                isResolved
                  ? 'opacity-60 border-[var(--border-subtle)]'
                  : isUrgent
                  ? 'border-rose-500/30 bg-gradient-to-b from-rose-500/5 to-transparent'
                  : 'border-[var(--border-subtle)]'
              }`}
            >
              <div className="space-y-2.5">
                {/* Top Badge: Days Remaining Countdown */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[var(--text-muted)]">
                    {language === 'vi' ? 'Mã:' : 'ID:'} {rem.transaction_id}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 ${
                      isResolved
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : isUrgent
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                        : 'bg-[#FC6508]/15 text-[#FC6508] border border-[#FC6508]/25'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {isResolved
                        ? (language === 'vi' ? 'Đã giải quyết' : 'Resolved')
                        : (language === 'vi' ? `Còn ${rem.days_remaining} ngày` : `${rem.days_remaining} days left`)}
                    </span>
                  </span>
                </div>

                {/* Merchant & Amount */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-sm text-[var(--text-primary)]">{rem.merchant}</h3>
                  <span className="font-mono font-bold text-sm text-[var(--text-primary)]">
                    ${Number(rem.amount).toFixed(2)} USD
                  </span>
                </div>

                {/* Dates breakdown */}
                <div className="p-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)] space-y-1 text-xs">
                  <div className="flex justify-between text-[var(--text-muted)]">
                    <span>{language === 'vi' ? 'Ngày gửi sao kê:' : 'Statement Date:'}</span>
                    <span className="font-mono text-[var(--text-primary)]">{rem.statement_date}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-[#FC6508]">{language === 'vi' ? 'Hạn khiếu nại (60 ngày):' : 'Dispute Deadline (60d):'}</span>
                    <span className="font-mono text-[#FC6508]">{rem.deadline_date}</span>
                  </div>
                </div>

                {/* Notes */}
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{rem.notes}</p>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
                {!isResolved ? (
                  <button
                    onClick={() => handleResolve(rem.id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{language === 'vi' ? 'Đánh dấu xong' : 'Mark Resolved'}</span>
                  </button>
                ) : (
                  <span className="text-xs text-emerald-400 font-medium">{language === 'vi' ? 'Hoàn tất' : 'Resolved'}</span>
                )}
                <button
                  onClick={() => handleDelete(rem.id)}
                  className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Reminder Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[var(--text-primary)]">
                {language === 'vi' ? 'Tạo Nhắc Nhở Hạn Khiếu Nại 60 Ngày' : 'Create 60-Day Dispute Reminder'}
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[var(--text-secondary)] font-medium mb-1">
                  {language === 'vi' ? 'Mã Giao Dịch (ID)' : 'Transaction ID'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'vi' ? 'Ví dụ: card_0001' : 'e.g. card_0001'}
                  value={formData.transaction_id}
                  onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[#FC6508]"
                />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] font-medium mb-1">
                  {language === 'vi' ? 'Đơn Vị Thụ Hưởng (Merchant)' : 'Merchant Name'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'vi' ? 'Ví dụ: Facebook Ads (Meta)' : 'e.g. Facebook Ads (Meta)'}
                  value={formData.merchant}
                  onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[#FC6508]"
                />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] font-medium mb-1">
                  {language === 'vi' ? 'Số Tiền ($ USD)' : 'Amount ($ USD)'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="150.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[#FC6508]"
                />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] font-medium mb-1">
                  {language === 'vi' ? 'Ngày Ngân Hàng Gửi Sao Kê (Statement Date)' : 'Bank Statement Date'}
                </label>
                <input
                  type="date"
                  value={formData.statement_date}
                  onChange={(e) => setFormData({ ...formData, statement_date: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[#FC6508]"
                />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] font-medium mb-1">
                  {language === 'vi' ? 'Ghi Chú Tra Soát' : 'Dispute Notes'}
                </label>
                <textarea
                  rows={2}
                  placeholder={language === 'vi' ? 'Ghi chú lý do tra soát (cà thẻ đúp, chưa nhận tiền...)' : 'Notes on discrepancy (double charge, delayed payout...)'}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[#FC6508]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  {language === 'vi' ? 'Hủy' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#FC6508] hover:bg-[#e05603] text-white font-semibold shadow-sm"
                >
                  {language === 'vi' ? 'Tạo Nhắc Nhở' : 'Create Reminder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

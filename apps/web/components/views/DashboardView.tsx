import React, { useEffect, useState } from 'react';
import {
  DollarSign,
  TrendingDown,
  Repeat,
  AlertTriangle,
  Receipt,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Language } from '../../types';
import { TRANSLATIONS } from '../../data/translations';

interface DashboardViewProps {
  language: Language;
  onNavigate: (tab: string) => void;
  onAskCopilot: (prompt: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  language,
  onNavigate,
  onAskCopilot,
}) => {
  const t = TRANSLATIONS[language];
  const [report, setReport] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [recReport, setRecReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
        apiUrl = apiUrl.replace(/\/+$/, '');

        const [repRes, altRes, recRes] = await Promise.all([
          fetch(`${apiUrl}/api/v1/reports/monthly?month=2026-08`).catch(() => null),
          fetch(`${apiUrl}/api/v1/alerts`).catch(() => null),
          fetch(`${apiUrl}/api/v1/reconciliation/3-way`).catch(() => null),
        ]);

        if (repRes && repRes.ok) setReport(await repRes.json());
        if (altRes && altRes.ok) setAlerts(await altRes.json());
        if (recRes && recRes.ok) setRecReport(await recRes.json());
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalExpense = report?.total_expense || 5235.48;
  const totalFees = report?.total_fees || 12.50;
  const totalSubs = report?.subscription_spending || 87.47;
  const anomalyCount = alerts.length || 3;
  const isBalanced = recReport?.is_balanced ?? false;

  return (
    <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Welcome Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[var(--bg-card)] to-[var(--bg-secondary)] border border-[var(--border-subtle)] flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
              {language === 'vi' ? 'Tổng Quan Tài Chính & An Toàn Giao Dịch' : 'Financial Health & Transaction Safety Overview'}
            </h2>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            {language === 'vi'
              ? 'Hệ thống tự động đồng bộ và đối soát dữ liệu từ Sao kê Ngân hàng, Ví Wealify và Thẻ ảo.'
              : 'Automated multi-source ledger reconciliation across Bank Accounts, Wealify Wallet, and Virtual Cards.'}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onAskCopilot(language === 'vi' ? 'Tháng này tôi chi bao nhiêu?' : 'How much did I spend this month?')}
            className="px-3.5 py-2 rounded-xl bg-[#FC6508] hover:bg-[#e05603] text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{language === 'vi' ? 'Hỏi Copilot' : 'Ask Copilot'}</span>
          </button>
          <button
            onClick={() => onNavigate('reconciliation')}
            className="px-3.5 py-2 rounded-xl bg-[var(--bg-input)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)] transition-all flex items-center gap-1.5"
          >
            <Repeat className="w-3.5 h-3.5 text-[#FC6508]" />
            <span>{language === 'vi' ? 'Đối Soát 3 Nguồn' : '3-Way Reconcile'}</span>
          </button>
        </div>
      </div>

      {/* 5 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Tổng Chi Tiêu */}
        <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1.5 hover:border-[var(--border-default)] transition-colors">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>{language === 'vi' ? 'Tổng Chi Tiêu (Tháng)' : 'Total Spend (Month)'}</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold font-mono text-[var(--text-primary)]">
            ${totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-[var(--text-muted)]">
            {report?.transaction_count || 18} {language === 'vi' ? 'giao dịch ghi nhận' : 'recorded transactions'}
          </div>
        </div>

        {/* Card 2: Tổng Phí Dịch Vụ */}
        <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1.5 hover:border-[var(--border-default)] transition-colors">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>{language === 'vi' ? 'Tổng Phí Dịch Vụ' : 'Total Service Fees'}</span>
            <Receipt className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-400">
            ${totalFees.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-[var(--text-muted)]">
            {language === 'vi' ? 'Phí duy trì & giao dịch' : 'Maintenance & transfer fees'}
          </div>
        </div>

        {/* Card 3: Subscription Định Kỳ */}
        <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1.5 hover:border-[var(--border-default)] transition-colors">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>{language === 'vi' ? 'Gói Định Kỳ (SaaS)' : 'Subscriptions (SaaS)'}</span>
            <Repeat className="w-4 h-4 text-[#FC6508]" />
          </div>
          <div className="text-xl font-bold font-mono text-[var(--text-primary)]">
            ${totalSubs.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-400 font-medium">
            {language === 'vi' ? '4 dịch vụ đang hoạt động' : '4 active services'}
          </div>
        </div>

        {/* Card 4: Cảnh Báo Bất Thường */}
        <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1.5 hover:border-[var(--border-default)] transition-colors">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>{language === 'vi' ? 'Cảnh Báo Bất Thường' : 'Flagged Anomalies'}</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-400">
            {anomalyCount} {language === 'vi' ? 'mục' : 'items'}
          </div>
          <div className="text-[11px] text-rose-400/80 font-medium">
            {language === 'vi' ? 'Cần bạn tự xác nhận' : 'Needs confirmation'}
          </div>
        </div>

        {/* Card 5: Trạng Thái Đối Soát 3 Nguồn */}
        <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1.5 hover:border-[var(--border-default)] transition-colors">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>{language === 'vi' ? 'Đối Soát 3 Nguồn' : '3-Way Reconcile'}</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-base font-bold font-mono text-amber-400">
            {isBalanced ? (language === 'vi' ? 'Đã khớp 100%' : 'Balanced 100%') : (language === 'vi' ? 'Có chênh lệch' : 'Discrepancies')}
          </div>
          <div className="text-[11px] text-[var(--text-muted)]">
            Account ↔ Wallet ↔ Card
          </div>
        </div>
      </div>

      {/* Grid: Top 3 Expenses + Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top 3 Khoản Chi Lớn Nhất */}
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#FC6508]" />
              <h3 className="font-semibold text-sm text-[var(--text-primary)]">
                {language === 'vi' ? 'Top 3 Khoản Chi Lớn Nhất Trong Kỳ' : 'Top 3 Largest Expenses'}
              </h3>
            </div>
            <button
              onClick={() => onNavigate('reports')}
              className="text-xs text-[#FC6508] hover:underline flex items-center gap-0.5"
            >
              <span>{language === 'vi' ? 'Xem báo cáo' : 'View report'}</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {[
              {
                merchant: 'Facebook Ads (Meta)',
                amount: 150.0,
                date: '19/08/2026',
                cat: language === 'vi' ? 'Quảng cáo & Tiếp thị' : 'Advertising & Marketing',
              },
              {
                merchant: 'Adobe Creative Cloud',
                amount: 54.99,
                date: '18/08/2026',
                cat: language === 'vi' ? 'Thuê bao phần mềm (SaaS)' : 'Software Subscriptions (SaaS)',
              },
              {
                merchant: 'Amazon Web Services (AWS)',
                amount: 45.0,
                date: '15/08/2026',
                cat: language === 'vi' ? 'Máy chủ & Đám mây' : 'Cloud Infrastructure',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[var(--bg-input)] flex items-center justify-center font-mono font-bold text-xs text-[#FC6508]">
                    #{idx + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-[var(--text-primary)]">{item.merchant}</div>
                    <div className="text-[11px] text-[var(--text-muted)]">{item.cat} • {item.date}</div>
                  </div>
                </div>
                <div className="font-mono font-bold text-sm text-[var(--text-primary)]">
                  -${item.amount.toFixed(2)} USD
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cảnh Báo Cần Xử Lý & Hạn 60 Ngày */}
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <h3 className="font-semibold text-sm text-[var(--text-primary)]">
                {language === 'vi' ? 'Cảnh Báo Cần Xác Nhận & Hạn Khiếu Nại' : 'Actionable Alerts & 60-Day Deadlines'}
              </h3>
            </div>
            <button
              onClick={() => onNavigate('alerts')}
              className="text-xs text-[#FC6508] hover:underline flex items-center gap-0.5"
            >
              <span>{language === 'vi' ? 'Xem tất cả' : 'View all'}</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  {language === 'vi' ? 'Cần bạn tự xác nhận' : 'Needs confirmation'}
                </span>
                <div className="flex items-center gap-1 text-[11px] font-mono text-[#FC6508]">
                  <Clock className="w-3 h-3" />
                  <span>{language === 'vi' ? 'Hạn còn 12 ngày (25/09/2026)' : 'Dispute: 12 days left (09/25/2026)'}</span>
                </div>
              </div>
              <div className="font-semibold text-xs text-[var(--text-primary)]">
                {language === 'vi' ? 'Cà thẻ 2 lần: Facebook Ads ($150.00 USD)' : 'Double-Charge: Facebook Ads ($150.00 USD)'}
              </div>
              <div className="text-[11px] text-[var(--text-secondary)]">
                {language === 'vi'
                  ? 'Phát hiện 2 giao dịch cùng số tiền $150.00 cách nhau 105 giây trên thẻ ảo Volcano Ads •••• 4812.'
                  : 'Detected 2 identical $150.00 charges 105 seconds apart on virtual card Volcano Ads •••• 4812.'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {language === 'vi' ? 'Cần bạn tự xác nhận' : 'Needs confirmation'}
                </span>
                <span className="text-[11px] text-[var(--text-muted)] font-mono">
                  {language === 'vi' ? '16 ngày trễ' : '16 days overdue'}
                </span>
              </div>
              <div className="font-semibold text-xs text-[var(--text-primary)]">
                {language === 'vi' ? 'Payout sàn Amazon chậm trễ ($4,250.00 USD)' : 'Overdue Amazon Seller Payout ($4,250.00 USD)'}
              </div>
              <div className="text-[11px] text-[var(--text-secondary)]">
                {language === 'vi'
                  ? 'Email giải ngân ngày 05/08/2026 nhưng tài khoản chưa ghi nhận số dư.'
                  : 'Disbursement email dated 08/05/2026 but funds not yet credited to account.'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

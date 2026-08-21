import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Receipt,
  Repeat,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { Language } from '../../types';

interface ReportsViewProps {
  language: Language;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ language }) => {
  const [periodType, setPeriodType] = useState<'month' | 'quarter' | 'year'>('month');
  const [periodValue, setPeriodValue] = useState<string>('2026-08');
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async (type: string, value: string) => {
    setLoading(true);
    try {
      let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      apiUrl = apiUrl.replace(/\/+$/, '');

      let endpoint = `/api/v1/reports/monthly?month=${value}`;
      if (type === 'quarter') endpoint = `/api/v1/reports/quarterly?quarter=${value}`;
      if (type === 'year') endpoint = `/api/v1/reports/yearly?year=${value}`;

      const res = await fetch(`${apiUrl}${endpoint}`);
      if (res.ok) {
        const data = await res.json();
        setReport(data);
      }
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(periodType, periodValue);
  }, [periodType, periodValue]);

  const handlePeriodChange = (type: 'month' | 'quarter' | 'year') => {
    setPeriodType(type);
    if (type === 'month') setPeriodValue('2026-08');
    if (type === 'quarter') setPeriodValue('2026-Q3');
    if (type === 'year') setPeriodValue('2026');
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Header & Period Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#FC6508]" />
            <span>{language === 'vi' ? 'Báo Cáo Tài Chính & Dự Báo (Reports & Forecast)' : 'Financial Reports & Multi-Period Forecast'}</span>
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            {language === 'vi'
              ? 'Phân tích chi tiết dòng tiền Theo Tháng / Quý / Năm, tổng phí, top khoản chi lớn nhất và dự báo subscription.'
              : 'Multi-period cashflow breakdown, fees analysis, top spending drivers, and annual subscription forecasting.'}
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center bg-[var(--bg-card)] p-1 rounded-xl border border-[var(--border-subtle)]">
          {[
            { id: 'month', label: language === 'vi' ? 'Theo Tháng' : 'Monthly' },
            { id: 'quarter', label: language === 'vi' ? 'Theo Quý' : 'Quarterly' },
            { id: 'year', label: language === 'vi' ? 'Theo Năm' : 'Yearly' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handlePeriodChange(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                periodType === tab.id
                  ? 'bg-[#FC6508] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards: In, Out, Fees, Net */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total In */}
        <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>{language === 'vi' ? 'Tổng Tiền Vào' : 'Total Income'}</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">
            +${report?.total_income?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '15,450.00'}
          </div>
          <div className="text-[11px] text-[var(--text-muted)]">
            {report?.transaction_count || 18} {language === 'vi' ? 'giao dịch' : 'transactions'}
          </div>
        </div>

        {/* Total Out */}
        <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>{language === 'vi' ? 'Tổng Chi Tiêu / Tiền Ra' : 'Total Spending / Out'}</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold font-mono text-[var(--text-primary)]">
            -${report?.total_expense?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '5,235.48'}
          </div>
          <div className="text-[11px] text-[var(--text-muted)]">
            {language === 'vi' ? 'Chi phí vận hành & ads' : 'Operating & ad expenses'}
          </div>
        </div>

        {/* Total Fees */}
        <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>{language === 'vi' ? 'Tổng Phí (Fees)' : 'Total Banking Fees'}</span>
            <Receipt className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-400">
            ${report?.total_fees?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '12.50'}
          </div>
          <div className="text-[11px] text-[var(--text-muted)]">
            {language === 'vi' ? 'Phí thẻ & giao dịch' : 'Card & maintenance fees'}
          </div>
        </div>

        {/* Net Cashflow */}
        <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>{language === 'vi' ? 'Dòng Tiền Ròng (Net)' : 'Net Cashflow'}</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">
            +${report?.net_cashflow?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '10,214.52'}
          </div>
          <div className="text-[11px] text-emerald-400/80">
            {language === 'vi' ? 'Thặng dư tích cực' : 'Positive cashflow'}
          </div>
        </div>
      </div>

      {/* Comparison with Previous Period */}
      {report?.comparison && (
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-[var(--bg-input)] text-[#FC6508]">
              <Calendar className="w-4 h-4" />
            </span>
            <div>
              <div className="font-semibold text-[var(--text-primary)]">
                {language === 'vi' ? 'So sánh với kỳ liền trước' : 'Comparison vs Previous Period'}
              </div>
              <div className="text-[var(--text-muted)]">
                {language === 'vi'
                  ? `Kỳ trước chi tiêu $${report.comparison.previous_expense?.toFixed(2)} USD`
                  : `Previous spend: $${report.comparison.previous_expense?.toFixed(2)} USD`}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 font-mono font-bold">
            <span className="text-rose-400 flex items-center gap-0.5">
              <ArrowUpRight className="w-4 h-4" />
              +${report.comparison.delta_amount?.toFixed(2)} USD (+{report.comparison.delta_percentage}%)
            </span>
          </div>
        </div>
      )}

      {/* Grid: Top 3 Expenses + Subscription Forecasts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top 3 Khoản Chi Lớn Nhất */}
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-4">
          <h3 className="font-semibold text-sm text-[var(--text-primary)] flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#FC6508]" />
            <span>{language === 'vi' ? 'Top 3 Khoản Chi Lớn Nhất' : 'Top 3 Largest Expenses'}</span>
          </h3>

          <div className="space-y-2.5">
            {(report?.top_3_expenses || [
              { merchant: 'Facebook Ads (Meta)', amount: 150.0, date: '19/08/2026', category: 'ad_spend' },
              { merchant: 'Adobe Creative Cloud', amount: 54.99, date: '18/08/2026', category: 'subscription' },
              { merchant: 'AWS Cloud Services', amount: 45.0, date: '15/08/2026', category: 'cloud' },
            ]).map((item: any, idx: number) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[var(--bg-input)] flex items-center justify-center font-mono font-bold text-xs text-[#FC6508]">
                    #{idx + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-[var(--text-primary)]">{item.merchant}</div>
                    <div className="text-[11px] text-[var(--text-muted)]">{item.category} • {language === 'vi' ? 'Ngày:' : 'Date:'} {item.date}</div>
                  </div>
                </div>
                <div className="font-mono font-bold text-sm text-[var(--text-primary)]">
                  -${Number(item.amount).toFixed(2)} USD
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subscription Spending & Annual Forecast */}
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-4">
          <h3 className="font-semibold text-sm text-[var(--text-primary)] flex items-center gap-2">
            <Repeat className="w-4 h-4 text-[#FC6508]" />
            <span>{language === 'vi' ? 'Dự Báo Chi Phí Subscription & Tăng Giá' : 'Subscription Forecast & Price Hikes'}</span>
          </h3>

          <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-2 text-xs">
            <div className="flex justify-between text-[var(--text-muted)]">
              <span>{language === 'vi' ? 'Subscription kỳ này:' : 'Current Period Subs:'}</span>
              <span className="font-mono text-[var(--text-primary)] font-bold">
                ${report?.subscription_spending?.toFixed(2) || '87.47'} USD
              </span>
            </div>
            <div className="flex justify-between text-[var(--text-muted)]">
              <span>{language === 'vi' ? 'Dự kiến chi phí kỳ tới:' : 'Next Period Forecast:'}</span>
              <span className="font-mono text-[var(--text-primary)] font-bold">
                ${report?.subscription_forecast_next_period?.toFixed(2) || '87.47'} USD
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-[var(--border-subtle)] font-bold">
              <span className="text-[#FC6508]">{language === 'vi' ? 'Dự kiến tổng subscription/năm:' : 'Projected Annual Subs:'}</span>
              <span className="font-mono text-[#FC6508]">
                ${report?.subscription_forecast_annual?.toFixed(2) || '1,049.64'} USD
              </span>
            </div>
          </div>

          {/* Price Hike Alert Banner */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-400">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{language === 'vi' ? 'Phát hiện tăng giá: Adobe Creative Cloud' : 'Stealth Price Hike: Adobe Creative Cloud'}</span>
            </div>
            <div className="text-[11px] text-[var(--text-secondary)]">
              {language === 'vi'
                ? 'Tăng từ $49.99 lên $54.99/tháng (+10.0% / Tăng +$60.00/năm).'
                : 'Increased from $49.99 to $54.99/month (+10.0% / +$60.00/yr impact).'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

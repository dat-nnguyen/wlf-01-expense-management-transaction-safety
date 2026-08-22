import React, { useState } from 'react';
import {
  Cpu,
  ShieldCheck,
  Zap,
  Sliders,
  Terminal,
  RefreshCw,
  Database,
  Lock,
  FileCode2,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Radio,
} from 'lucide-react';
import { Language } from '../../types';
import { TRANSLATIONS } from '../../data/translations';

interface AgentControlViewProps {
  language: Language;
}

export const AgentControlView: React.FC<AgentControlViewProps> = ({ language }) => {
  const t = TRANSLATIONS[language];
  const [activeModel, setActiveModel] = useState<'gemini' | 'hybrid' | 'deterministic'>('gemini');
  const [readOnlyLock, setReadOnlyLock] = useState<boolean>(true);
  const [regulationEEnforced, setRegulationEEnforced] = useState<boolean>(true);
  const [conflictThreshold, setConflictThreshold] = useState<number>(30);
  const [isWiping, setIsWiping] = useState(false);
  const [wipeSuccess, setWipeSuccess] = useState(false);

  const toolsList = [
    {
      name: 'verify_transaction_authenticity',
      desc:
        language === 'vi'
          ? 'Thẩm định tính xác thực biên lai & đối soát sổ cái 5 chiều'
          : 'Authenticate receipt proof and perform 5-dimensional ledger audit',
      status: 'ACTIVE',
      calls: 42,
      latency: '180ms',
    },
    {
      name: 'find_duplicate_charges',
      desc:
        language === 'vi'
          ? 'Quét giao dịch quẹt trùng thẻ ảo (Meta Ads, Google Ads, Grab) trong 48h'
          : 'Detect multi-card duplicate charges (Meta Ads, Google Ads, Grab) within 48h',
      status: 'ACTIVE',
      calls: 89,
      latency: '95ms',
    },
    {
      name: 'detect_overdue_payouts',
      desc:
        language === 'vi'
          ? 'Phát hiện tiền giải ngân TMĐT (Amazon, Stripe, Shopify) bị chậm trễ quá hạn'
          : 'Identify delayed e-commerce disbursements (Amazon, Stripe, Shopify) exceeding SLA',
      status: 'ACTIVE',
      calls: 35,
      latency: '110ms',
    },
    {
      name: 'find_active_subscriptions',
      desc:
        language === 'vi'
          ? 'Phát hiện chu kỳ SaaS định kỳ & cảnh báo âm thầm tăng giá (Price Hike)'
          : 'Audit recurring SaaS cadences & alert stealth subscription price hikes',
      status: 'ACTIVE',
      calls: 64,
      latency: '120ms',
    },
    {
      name: 'reconcile_3way_transactions',
      desc:
        language === 'vi'
          ? 'Đối soát 3 nguồn Sổ cái ↔ Ví ↔ Sao kê thẻ theo đúng quy chuẩn bất biến'
          : 'Reconcile 3-way financial flows (Bank ↔ Wallet ↔ Cards) against invariant rules',
      status: 'ACTIVE',
      calls: 51,
      latency: '140ms',
    },
    {
      name: 'generate_expense_report',
      desc:
        language === 'vi'
          ? 'Tổng hợp báo cáo thu chi, bóc tách phí ngân hàng & dự thảo email báo cáo'
          : 'Compile income/expense statements, extract bank fees, and draft summary reports',
      status: 'ACTIVE',
      calls: 73,
      latency: '160ms',
    },
  ];

  const handleWipeData = async () => {
    setIsWiping(true);
    try {
      let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      apiUrl = apiUrl.replace(/\/+$/, '');
      const res = await fetch(`${apiUrl}/api/v1/admin/wipe-data`, { method: 'POST' });
      if (res.ok) {
        setWipeSuccess(true);
        setTimeout(() => setWipeSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Wipe data failed:', err);
    } finally {
      setIsWiping(false);
    }
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#FC6508]" />
            {language === 'vi' ? 'Bảng Quản Trị & Giám Sát Agent Copilot' : 'Agent Copilot Control & Monitoring Center'}
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            {language === 'vi'
              ? 'Kiểm soát mô hình AI, ranh giới an toàn tài chính (Guardrails) và theo dõi vết gọi công cụ theo thời gian thực.'
              : 'Control AI reasoning models, safety guardrails, and monitor tool calling traces in real time.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
            <Radio className="w-3 h-3 animate-pulse text-emerald-400" />
            Google ADK Active
          </span>
        </div>
      </div>

      {/* Grid: Model & Guardrails Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Model Selector Card */}
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#FC6508]" />
              {language === 'vi' ? 'Cấu Hình Động Cơ Suy Luận (Reasoning Engine)' : 'Reasoning Engine Configuration'}
            </span>
          </div>

          <div className="space-y-2">
            <div
              onClick={() => setActiveModel('gemini')}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                activeModel === 'gemini'
                  ? 'bg-[#FC6508]/10 border-[#FC6508]'
                  : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] hover:border-[var(--text-muted)]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  Google Gemini 2.0 Flash ({language === 'vi' ? 'Khuyên Dùng' : 'Recommended'})
                </span>
                {activeModel === 'gemini' && <CheckCircle2 className="w-4 h-4 text-[#FC6508]" />}
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                {language === 'vi'
                  ? 'Tích hợp Google ADK Tool Calling, phản hồi dưới 1.2s, giải thích nguyên nhân gốc rễ (Root Cause) và đối soát đa chiều.'
                  : 'Google ADK tool-calling integration with sub-1.2s latency, root cause explanation, and multi-source cross check.'}
              </p>
            </div>

            <div
              onClick={() => setActiveModel('hybrid')}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                activeModel === 'hybrid'
                  ? 'bg-[#FC6508]/10 border-[#FC6508]'
                  : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] hover:border-[var(--text-muted)]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                  Dual-Engine (Deterministic Engine + Self-Reflection)
                </span>
                {activeModel === 'hybrid' && <CheckCircle2 className="w-4 h-4 text-[#FC6508]" />}
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                {language === 'vi'
                  ? 'Kiểm chứng số liệu 100% khớp sổ cái trước khi trả lời người dùng, loại bỏ hoàn toàn hiện tượng bịa đặt (Zero Hallucination).'
                  : 'Verifies figures 100% against core ledgers before rendering response, ensuring zero financial hallucinations.'}
              </p>
            </div>
          </div>
        </div>

        {/* Financial Guardrails Card */}
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              {language === 'vi' ? 'Ranh Giới An Toàn Bắt Buộc (Guardrails)' : 'Mandatory Financial Safety Guardrails'}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Toggle 1: Read-Only */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
              <div>
                <div className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-rose-400" />
                  {language === 'vi' ? 'Chế Độ Read-Only Tuyệt Đối' : 'Strict Read-Only Mode'}
                </div>
                <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                  {language === 'vi'
                    ? 'Cấm tự chuyển tiền, huỷ gói, khoá thẻ hoặc chargeback.'
                    : 'Disallows automated money movement, cancellations, card freezes, or chargebacks.'}
                </div>
              </div>
              <input
                type="checkbox"
                checked={readOnlyLock}
                onChange={(e) => setReadOnlyLock(e.target.checked)}
                className="w-4 h-4 accent-[#FC6508] cursor-pointer"
              />
            </div>

            {/* Toggle 2: Regulation E 60 Days */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
              <div>
                <div className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  {language === 'vi' ? 'Áp Dụng Điều Khoản 60 Ngày (Regulation E)' : 'Enforce US Regulation E (60-Day Notice)'}
                </div>
                <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                  {language === 'vi'
                    ? 'Tự động đính kèm mốc hạn khiếu nại luật Mỹ trong mọi cảnh báo.'
                    : 'Automatically appends statutory 60-day dispute countdowns to financial alerts.'}
                </div>
              </div>
              <input
                type="checkbox"
                checked={regulationEEnforced}
                onChange={(e) => setRegulationEEnforced(e.target.checked)}
                className="w-4 h-4 accent-[#FC6508] cursor-pointer"
              />
            </div>

            {/* Conflict Threshold Slider */}
            <div className="p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[var(--text-primary)]">
                  {language === 'vi' ? 'Ngưỡng Báo Động Mâu Thuẫn Bằng Chứng' : 'Evidence Conflict Score Threshold'}
                </span>
                <span className="font-mono font-bold text-[#FC6508]">{conflictThreshold}/100</span>
              </div>
              <input
                type="range"
                min="10"
                max="80"
                value={conflictThreshold}
                onChange={(e) => setConflictThreshold(Number(e.target.value))}
                className="w-full accent-[#FC6508] cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tool Calling Inspector */}
      <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-[#FC6508]" />
            {language === 'vi' ? 'Danh Sách Công Cụ Google ADK Đang Hoạt Động (Tool Registry)' : 'Active Google ADK Tool Registry'}
          </span>
          <span className="text-xs text-[var(--text-muted)] font-mono">6 Tools Registered</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] text-[var(--text-muted)]">
                <th className="pb-2 font-medium">{language === 'vi' ? 'Công cụ (Tool)' : 'Tool Function'}</th>
                <th className="pb-2 font-medium">{language === 'vi' ? 'Mô tả nghiệp vụ' : 'Operational Scope'}</th>
                <th className="pb-2 font-medium">{language === 'vi' ? 'Trạng thái' : 'Status'}</th>
                <th className="pb-2 font-medium text-right">{language === 'vi' ? 'Lượt gọi' : 'Invocations'}</th>
                <th className="pb-2 font-medium text-right">{language === 'vi' ? 'Độ trễ' : 'Avg Latency'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {toolsList.map((t, idx) => (
                <tr key={idx} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                  <td className="py-2.5 font-mono font-semibold text-[#FC6508]">{t.name}</td>
                  <td className="py-2.5 text-[var(--text-secondary)]">{t.desc}</td>
                  <td className="py-2.5">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
                      {t.status}
                    </span>
                  </td>
                  <td className="py-2.5 text-right font-mono text-[var(--text-primary)]">{t.calls}</td>
                  <td className="py-2.5 text-right font-mono text-emerald-400">{t.latency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compliance & Session Wipe Actions */}
      <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
            <Database className="w-4 h-4 text-purple-400" />
            {language === 'vi' ? 'Quản Lý Phiên Làm Việc & Xoá Dữ Liệu Kiểm Thử' : 'Session Memory & Compliance Wipe'}
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
            {language === 'vi'
              ? 'Xoá bộ nhớ đệm hội thoại tạm thời, đặt lại trạng thái giám sát nền mà không ảnh hưởng tới sổ cái gốc.'
              : 'Clears conversational context buffer and resets proactive scheduler state without touching base ledgers.'}
          </p>
        </div>
        <button
          onClick={handleWipeData}
          disabled={isWiping}
          className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isWiping ? 'animate-spin' : ''}`} />
          {wipeSuccess
            ? language === 'vi'
              ? 'Đã xoá sạch!'
              : 'Wiped Successfully!'
            : language === 'vi'
            ? 'Xoá Cache Phiên'
            : 'Wipe Session Cache'}
        </button>
      </div>
    </div>
  );
};

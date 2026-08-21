import React from 'react';
import {
  Activity,
  Bot,
  Zap,
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  TrendingUp,
  Cpu,
  Layers,
  ArrowUpRight,
  AlertTriangle,
  ArrowRight,
  Database,
  Search,
  Check,
} from 'lucide-react';
import { Language } from '../../types';
import { TRANSLATIONS } from '../../data/translations';
import {
  BOT_METRIC_ITEMS,
  INTENT_ANALYTICS,
} from '../../data/mockData';

interface OpsDashboardProps {
  language: Language;
}

export const OpsDashboard: React.FC<OpsDashboardProps> = ({ language }) => {
  const t = TRANSLATIONS[language];

  // System-wide Incident Queue for Admin
  const systemIncidents = [
    {
      id: 'SEC-2026-0801',
      user: 'Dat Nguyen (Volcano Ecom LLC - acc_main)',
      title: 'Quẹt đúp thẻ ảo Facebook Ads ($150.00 x 2)',
      category: 'CÀ THẺ TRÙNG LẶP',
      amount: '$150.00 USD',
      detectedAt: '15:47 (Hôm nay)',
      card: 'Thẻ Volcano Ads •••• 4812',
      risk: 'Cần xác nhận',
      riskStyle: 'bg-rose-500/15 text-rose-400 border-rose-500/25',
      botAgent: 'Duplicate Detector Agent',
    },
    {
      id: 'SEC-2026-0802',
      user: 'Dat Nguyen (Volcano Ecom LLC - acc_main)',
      title: 'Payout sàn Amazon chậm trễ 16 ngày',
      category: 'PAYOUT TRỄ HẠN',
      amount: '$4,250.00 USD',
      detectedAt: '09:15 (Hôm nay)',
      card: 'Ví Wealify USD',
      risk: 'Khẩn cấp',
      riskStyle: 'bg-[#FC6508]/15 text-[#FC6508] border-[#FC6508]/25',
      botAgent: 'Payout Radar Sentinel',
    },
    {
      id: 'SEC-2026-0803',
      user: 'Dat Nguyen (Volcano Ecom LLC - acc_main)',
      title: 'Giám định ảnh chuyển khoản $2,500 không khớp sổ cái',
      category: 'CHỨNG TỪ XUNG ĐỘT',
      amount: '$2,500.00 USD',
      detectedAt: 'Hôm qua',
      card: 'Ref: WF-839291',
      risk: 'Rủi ro 92/100',
      riskStyle: 'bg-rose-500/15 text-rose-400 border-rose-500/25',
      botAgent: 'Authenticity Forensic Engine',
    },
    {
      id: 'SEC-2026-0804',
      user: 'Alex Tran (Global Dropship Ltd - acc_02)',
      title: 'Thuê bao Adobe Creative Cloud tăng giá +10.0%',
      category: 'SUBSCRIPTION HIKE',
      amount: '$54.99 USD/tháng',
      detectedAt: '14:20 (Hôm nay)',
      card: 'Tài khoản chính',
      risk: 'Đã xác định',
      riskStyle: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
      botAgent: 'Subscription Price Hike Radar',
    },
  ];

  return (
    <div className="p-6 space-y-5 transition-colors min-h-0 overflow-y-auto">
      {/* 5 Global System & Bot Health Telemetry KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
        {/* KPI 1: System Reliability / Health */}
        <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span className="font-medium">{t.systemHealth}</span>
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 tracking-tight font-mono">99.8%</div>
          <div className="text-[10px] text-[var(--text-muted)] font-mono">{t.latencyAvg}</div>
        </div>

        {/* KPI 2: Total AI Invocations */}
        <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span className="font-medium">{t.totalConversations}</span>
            <Zap className="w-3.5 h-3.5 text-[#FC6508]" />
          </div>
          <div className="text-xl font-bold text-[var(--text-primary)] tracking-tight font-mono">128,450</div>
          <div className="text-[10px] text-emerald-400 font-medium">{t.vs7DaysAgo}</div>
        </div>

        {/* KPI 3: Active Bot Fleet */}
        <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span className="font-medium">{t.activeBots}</span>
            <Bot className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-cyan-400 tracking-tight font-mono">12 Agents</div>
          <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>{t.outOfTotalBots}</span>
          </div>
        </div>

        {/* KPI 4: Grounding Fidelity */}
        <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span className="font-medium">{language === 'vi' ? 'Độ chuẩn xác số học' : 'Grounding Fidelity'}</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 tracking-tight font-mono">100.0%</div>
          <div className="text-[10px] text-[var(--text-muted)] font-medium">Zero Hallucination Rate</div>
        </div>

        {/* KPI 5: Policy Guardrail Blocks */}
        <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span className="font-medium">{language === 'vi' ? 'Chặn ranh giới an toàn' : 'Guardrail Blocks'}</span>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-bold text-rose-400 tracking-tight font-mono">1.2%</div>
          <div className="text-[10px] text-[var(--text-muted)] font-medium">Strict Read-Only Guard</div>
        </div>
      </div>

      {/* Section 1: Bot Fleet Health & Performance Matrix */}
      <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
              {t.botPerformanceTitle}
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              {language === 'vi'
                ? 'Giám sát thời gian thực trạng thái, tỷ lệ thành công, độ trễ và số lượng request của từng Agent'
                : 'Real-time monitoring of status, success rate, latency, and throughput per AI Agent'}
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
            12/12 Online
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] text-[var(--text-muted)]">
                <th className="pb-2.5 font-semibold uppercase text-[10px]">{t.botName}</th>
                <th className="pb-2.5 font-semibold uppercase text-[10px]">{t.status}</th>
                <th className="pb-2.5 font-semibold uppercase text-[10px]">{t.totalRequests}</th>
                <th className="pb-2.5 font-semibold uppercase text-[10px]">{t.successRate}</th>
                <th className="pb-2.5 font-semibold uppercase text-[10px]">{t.latency}</th>
                <th className="pb-2.5 font-semibold uppercase text-[10px]">ENGINE / MODEL</th>
                <th className="pb-2.5 font-semibold uppercase text-[10px]">GIÁM SÁT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {BOT_METRIC_ITEMS.map((bot) => (
                <tr key={bot.id} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                  <td className="py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-center text-[#FC6508]">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold text-[var(--text-primary)]">{bot.name}</div>
                        <div className="text-[10px] text-[var(--text-muted)] font-mono">{bot.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      {bot.status}
                    </span>
                  </td>
                  <td className="py-3 font-mono font-bold text-[var(--text-primary)]">
                    {bot.requests.toLocaleString()}
                  </td>
                  <td className="py-3 font-mono font-bold text-emerald-400">
                    {bot.successRate}%
                  </td>
                  <td className="py-3 font-mono text-[var(--text-secondary)]">
                    {bot.avgLatency}ms
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                      {bot.engine}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Healthy</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Intent Routing Distribution & Telemetry Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Intent Distribution */}
        <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
              {language === 'vi' ? 'Phân Bổ Ý Định (Intent Routing Accuracy)' : 'Intent Routing Breakdown'}
            </h3>
            <span className="text-[10px] font-mono text-[var(--text-muted)]">100% Zero-Leak</span>
          </div>

          <div className="space-y-2">
            {INTENT_ANALYTICS.map((intent, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] text-[var(--text-primary)]">{intent.intent}</span>
                  <span className="font-mono text-[11px] text-[var(--text-secondary)]">
                    {intent.percentage}% ({intent.count.toLocaleString()} reqs)
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
                  <div
                    className="h-full bg-[#FC6508] rounded-full"
                    style={{ width: `${intent.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Latency Percentiles & Boundary Safety */}
        <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
              {language === 'vi' ? 'Độ Trễ Phân Vị & Ranh Giới An Toàn' : 'Latency Percentiles & Policy'}
            </h3>
            <span className="text-[10px] font-mono text-emerald-400">Strict Read-Only</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-1">
              <div className="text-[10px] text-[var(--text-muted)] uppercase font-mono">P50 (Median)</div>
              <div className="text-lg font-bold font-mono text-emerald-400">120 ms</div>
            </div>
            <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-1">
              <div className="text-[10px] text-[var(--text-muted)] uppercase font-mono">P90 Latency</div>
              <div className="text-lg font-bold font-mono text-cyan-400">240 ms</div>
            </div>
            <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-1">
              <div className="text-[10px] text-[var(--text-muted)] uppercase font-mono">P95 Latency</div>
              <div className="text-lg font-bold font-mono text-amber-400">340 ms</div>
            </div>
            <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-1">
              <div className="text-[10px] text-[var(--text-muted)] uppercase font-mono">P99 Tail Latency</div>
              <div className="text-lg font-bold font-mono text-purple-400">580 ms</div>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>
              {language === 'vi'
                ? 'Bộ lọc Input/Output Guardrails đang hoạt động ở chế độ nghiêm ngặt'
                : 'Input & Output Guardrails are actively enforcing Read-Only boundary'}
            </span>
          </div>
        </div>
      </div>

      {/* Section 3: System-Wide Security Incident Queue */}
      <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
              {t.recentBotsTitle}
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              {language === 'vi'
                ? 'Các sự cố tài chính, quét thẻ đúp và đối soát chứng từ trên toàn hệ thống cần Admin kiểm toán'
                : 'Active financial incidents, duplicate swipes, and conflicting receipts across all accounts'}
            </p>
          </div>
          <span className="text-xs font-mono text-rose-400 font-medium bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-full">
            4 Sự Cố Cần Xử Lý
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] text-[var(--text-muted)]">
                <th className="pb-2.5 font-semibold uppercase text-[10px]">MÃ CASE</th>
                <th className="pb-2.5 font-semibold uppercase text-[10px]">TÀI KHOẢN KHÁCH HÀNG</th>
                <th className="pb-2.5 font-semibold uppercase text-[10px]">SỰ CỐ AN NINH</th>
                <th className="pb-2.5 font-semibold uppercase text-[10px]">SỐ TIỀN</th>
                <th className="pb-2.5 font-semibold uppercase text-[10px]">AGENT PHÁT HIỆN</th>
                <th className="pb-2.5 font-semibold uppercase text-[10px]">MỨC ĐỘ</th>
                <th className="pb-2.5 font-semibold uppercase text-[10px]">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {systemIncidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                  <td className="py-3 font-mono font-medium text-[var(--text-muted)]">{inc.id}</td>
                  <td className="py-3 font-semibold text-[var(--text-primary)]">{inc.user}</td>
                  <td className="py-3">
                    <div className="font-semibold text-[var(--text-primary)]">{inc.title}</div>
                    <div className="text-[10px] text-[var(--text-muted)] font-mono">{inc.detectedAt}</div>
                  </td>
                  <td className="py-3 font-mono font-bold text-[var(--text-primary)]">{inc.amount}</td>
                  <td className="py-3 font-mono text-[var(--text-secondary)]">{inc.botAgent}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${inc.riskStyle}`}>
                      {inc.risk}
                    </span>
                  </td>
                  <td className="py-3">
                    <button className="px-2.5 py-1 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-card)] text-[var(--text-primary)] font-medium text-[11px] border border-[var(--border-subtle)] transition-colors flex items-center gap-1">
                      <span>{language === 'vi' ? 'Kiểm toán' : 'Audit'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
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

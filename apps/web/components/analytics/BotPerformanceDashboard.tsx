import React, { useState } from 'react';
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
  Filter,
  Play,
  RotateCcw,
  Sparkles,
  Search,
  Check,
  XCircle,
  BarChart3,
  Flame,
  Globe,
  Lock,
} from 'lucide-react';
import { Language } from '../../types';
import { TRANSLATIONS } from '../../data/translations';
import {
  BOT_METRIC_ITEMS,
  INTENT_ANALYTICS,
  EXECUTION_LOGS,
} from '../../data/mockData';

interface BotPerformanceDashboardProps {
  language: Language;
}

export const BotPerformanceDashboard: React.FC<BotPerformanceDashboardProps> = ({ language }) => {
  const t = TRANSLATIONS[language];

  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d'>('7d');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState('');

  // Diagnostic Simulator State
  const [simQuery, setSimQuery] = useState('Thẻ ảo chạy ads của tôi có bị cà 2 lần không?');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResult, setSimResult] = useState<{
    intent: string;
    tool: string;
    latency: number;
    policy: 'ALLOW' | 'DENY';
    grounding: string;
    response: string;
  } | null>({
    intent: 'DUPLICATE_CHECK',
    tool: 'find_duplicates',
    latency: 172,
    policy: 'ALLOW',
    grounding: 'Khớp 100% sổ cái thẻ VPBank vcard_ad_fb',
    response: 'Phát hiện 2 giao dịch $150.00 USD cách nhau 105s trên thẻ Volcano Ads •••• 4812.',
  });

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const q = simQuery.toLowerCase();
      let resIntent = 'GENERAL_QUERY';
      let resTool = 'search_transactions';
      let resPolicy: 'ALLOW' | 'DENY' = 'ALLOW';
      let resGrounding = 'Khớp 100% dữ liệu sổ cái';
      let resResponse = 'Đã quét toàn bộ lịch sử giao dịch và đối chiếu chứng từ thành công.';
      let lat = Math.floor(Math.random() * 120) + 140;

      if (q.includes('payout') || q.includes('amazon') || q.includes('trễ')) {
        resIntent = 'OVERDUE_PAYOUT_CHECK';
        resTool = 'detect_overdue_payouts';
        resGrounding = 'Khớp email Amazon Disbursement ID: AMZ-DISB-9182';
        resResponse = 'Cảnh báo: Payout Amazon $4,250 USD đã quá hạn 16 ngày chưa ghi có vào tài khoản Wealify.';
        lat = 240;
      } else if (q.includes('cà') || q.includes('trùng') || q.includes('đúp')) {
        resIntent = 'DUPLICATE_CHECK';
        resTool = 'find_duplicates';
        resGrounding = 'Khớp 100% sổ cái thẻ VPBank vcard_ad_fb';
        resResponse = 'Phát hiện 2 giao dịch $150.00 USD cách nhau 105s trên thẻ Volcano Ads •••• 4812.';
        lat = 165;
      } else if (q.includes('chuyển') || q.includes('hủy') || q.includes('rút')) {
        resIntent = 'DISALLOWED_MUTATION';
        resTool = 'None (Blocked by Input Guardrail)';
        resPolicy = 'DENY';
        resGrounding = 'Chặn theo chính sách Read-Only Policy';
        resResponse = 'Hành động chuyển tiền/rút vốn bị từ chối tuyệt đối theo chính sách an toàn tài sản.';
        lat = 38;
      } else if (q.includes('ảnh') || q.includes('giả') || q.includes('2,500')) {
        resIntent = 'VERIFY_TRANSACTION_AUTHENTICITY';
        resTool = 'verify_transaction_authenticity';
        resGrounding = 'Điểm xung đột chứng từ: 92/100 (HIGH RISK)';
        resResponse = 'Phát hiện ảnh chụp màn hình có dấu hiệu chỉnh sửa. Mã Ref WF-839291 không tồn tại trên hệ thống.';
        lat = 310;
      } else if (q.includes('roas') || q.includes('lãi') || q.includes('ad')) {
        resIntent = 'BUSINESS_HEALTH_ADVISORY';
        resTool = 'analyze_business_health';
        resGrounding = 'Tính toán Ad Spend: $870 vs Payout: $1,890';
        resResponse = 'Điểm sức khỏe: 65/100 (Cảnh báo). Dòng tiền chi trả Ads còn 10 ngày nếu Payout Amazon chưa về.';
        lat = 210;
      }

      setSimResult({
        intent: resIntent,
        tool: resTool,
        latency: lat,
        policy: resPolicy,
        grounding: resGrounding,
        response: resResponse,
      });
      setIsSimulating(false);
    }, 450);
  };

  const filteredBots = BOT_METRIC_ITEMS.filter((b) => {
    const matchesCat = selectedCategory === 'all' || b.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch = b.name.toLowerCase().includes(searchFilter.toLowerCase()) || b.description.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6 transition-colors duration-300 min-h-0 overflow-y-auto">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FC6508] to-[#FFA14E] flex items-center justify-center text-white shadow-md shadow-[#FC6508]/30">
              <Cpu className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-lg font-black text-[var(--text-primary)] tracking-tight">
                {t.botPerfTitle}
              </h1>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {t.botPerfSubtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Time Range Filter & Category Filter */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-[var(--bg-card)] p-1 rounded-xl border border-[var(--border-subtle)] text-xs font-bold">
            {(['24h', '7d', '30d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setSelectedTimeRange(range)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  selectedTimeRange === range
                    ? 'bg-[#FC6508] text-white shadow-md shadow-[#FC6508]/30'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {range === '24h' ? t.filter24h : range === '7d' ? t.filter7d : t.filter30d}
              </button>
            ))}
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder={language === 'vi' ? 'Tìm bot / engine...' : 'Filter bots...'}
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[#FC6508] w-48 font-medium"
            />
          </div>
        </div>
      </div>

      {/* 5 Top Telemetry KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* KPI 1: Invocations */}
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-lg space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span className="font-bold text-[var(--text-primary)]">{t.kpiTotalInvocations}</span>
            <Bot className="w-4 h-4 text-[#FFA14E]" />
          </div>
          <div className="text-2xl font-black text-[var(--text-primary)] font-mono tracking-tight">158,920</div>
          <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1 font-mono">
            <TrendingUp className="w-3 h-3" />
            <span>+18.4% {t.vs7DaysAgo}</span>
          </div>
        </div>

        {/* KPI 2: Grounding Rate */}
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-emerald-500/30 shadow-lg space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span className="font-bold text-[var(--text-primary)]">{t.kpiGroundingRate}</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono tracking-tight">100.0%</div>
          <div className="text-[11px] text-emerald-400 font-semibold">
            {t.kpiGroundingSub}
          </div>
        </div>

        {/* KPI 3: Policy Interventions */}
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-rose-500/30 shadow-lg space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span className="font-bold text-[var(--text-primary)]">{t.kpiPolicyBlocks}</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400 font-mono tracking-tight">1,280</div>
          <div className="text-[11px] text-rose-400 font-semibold">
            {t.kpiPolicyBlocksSub}
          </div>
        </div>

        {/* KPI 4: Latency */}
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-cyan-500/30 shadow-lg space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span className="font-bold text-[var(--text-primary)]">{t.kpiAvgLatency}</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-400 font-mono tracking-tight">195 ms</div>
          <div className="text-[11px] text-cyan-400 font-mono font-semibold">
            {t.kpiAvgLatencySub}
          </div>
        </div>

        {/* KPI 5: Tokens & Cost */}
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[#FC6508]/30 shadow-lg space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span className="font-bold text-[var(--text-primary)]">{t.kpiTokenCost}</span>
            <Zap className="w-4 h-4 text-[#FFA14E]" />
          </div>
          <div className="text-2xl font-black text-[#FFA14E] font-mono tracking-tight">$11.60 <span className="text-xs font-bold text-[var(--text-muted)]">USD</span></div>
          <div className="text-[11px] text-[var(--text-secondary)] font-medium font-mono">
            5.8M tokens (~$0.002/req)
          </div>
        </div>
      </div>

      {/* Middle Section: Intent Distribution & Latency Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Intent Analytics & Routing Breakdown */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-[var(--text-primary)]">{t.intentAnalyticsTitle}</h2>
              <p className="text-xs text-[var(--text-muted)]">{t.intentAnalyticsSubtitle}</p>
            </div>
            <span className="badge-wealify-orange text-xs px-2.5 py-1 rounded-full font-bold font-mono">
              Accuracy: 100.0%
            </span>
          </div>

          {/* Progress Bars for Intent Routing */}
          <div className="space-y-3 pt-2">
            {INTENT_ANALYTICS.map((intent, i) => (
              <div key={i} className="space-y-1.5 p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-[#FC6508]/30 transition-colors">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${intent.color}`}></div>
                    <span className="font-bold text-[var(--text-primary)]">{intent.label}</span>
                    <span className="font-mono text-[10px] text-[var(--text-muted)]">({intent.intent})</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-[var(--text-secondary)] font-semibold">{intent.count.toLocaleString()} reqs</span>
                    <span className="font-bold text-[var(--text-primary)]">{intent.percentage}%</span>
                  </div>
                </div>

                {/* Bar */}
                <div className="w-full h-2 rounded-full bg-[var(--bg-card)] overflow-hidden">
                  <div
                    className={`h-full rounded-full ${intent.color}`}
                    style={{ width: `${intent.percentage * 2.5}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] pt-0.5 font-mono">
                  <span>Tool: <code className="text-[#FFA14E] font-bold">{intent.tool}</code></span>
                  <span className="text-emerald-400 font-bold">100% Policy Grounded</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Grounding & Zero-Hallucination Radar */}
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-[var(--text-primary)]">Grounding &amp; Safety Proof</h2>
              <span className="badge-glow-green text-xs font-bold px-2 py-0.5 rounded-full">Deterministic</span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">Cơ chế xác thực số học không cho phép LLM bịa đặt dữ liệu</p>

            <div className="my-6 flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-[#FC6508]/15 via-purple-900/10 to-cyan-900/15 border border-[#FC6508]/30 relative overflow-hidden">
              <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 font-mono">
                100.0%
              </div>
              <div className="text-xs font-bold text-white mt-1">Zero Financial Hallucination</div>
              <div className="text-[11px] text-[var(--text-muted)] text-center mt-2 leading-relaxed">
                Mọi con số tiền tệ được tính toán qua Python Deterministic Math Engine và đối chiếu Evidence ID trong DB.
              </div>
            </div>

            <div className="space-y-2.5 text-xs font-medium">
              <div className="flex items-center justify-between text-[var(--text-secondary)]">
                <span>So khớp sổ cái ngân hàng:</span>
                <span className="font-bold text-emerald-400 font-mono">100% Match</span>
              </div>
              <div className="flex items-center justify-between text-[var(--text-secondary)]">
                <span>So khớp email DKIM/SPF:</span>
                <span className="font-bold text-emerald-400 font-mono">100% Match</span>
              </div>
              <div className="flex items-center justify-between text-[var(--text-secondary)]">
                <span>Chặn vi phạm ranh giới (Mutations):</span>
                <span className="font-bold text-rose-400 font-mono">100% Blocked</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#FC6508]/10 border border-[#FC6508]/20 text-[11px] text-[#FFA14E] flex items-center gap-2 font-medium">
            <Sparkles className="w-4 h-4 shrink-0 text-[#FC6508]" />
            <span>Hệ thống áp dụng Self-Reflection Loop kiểm tra output trước khi gửi người dùng.</span>
          </div>
        </div>
      </div>

      {/* Bot Fleet Matrix Table */}
      <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black text-[var(--text-primary)]">{t.botFleetTitle}</h2>
            <p className="text-xs text-[var(--text-muted)]">{t.botFleetSubtitle}</p>
          </div>
          <span className="text-xs font-mono font-bold text-[#FFA14E]">5 Active Engines</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] text-[var(--text-muted)]">
                <th className="pb-3 font-bold uppercase">BOT ENGINE</th>
                <th className="pb-3 font-bold uppercase">CHUYÊN MÔN</th>
                <th className="pb-3 font-bold uppercase">REQUESTS</th>
                <th className="pb-3 font-bold uppercase">ĐỘ CHÍNH XÁC</th>
                <th className="pb-3 font-bold uppercase">LATENCY (P95)</th>
                <th className="pb-3 font-bold uppercase">TOKENS</th>
                <th className="pb-3 font-bold uppercase">TRẠNG THÁI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filteredBots.map((bot) => (
                <tr key={bot.id} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                  <td className="py-3.5">
                    <div className="font-bold text-[var(--text-primary)]">{bot.name}</div>
                    <div className="text-[10px] text-[var(--text-muted)] font-mono">{bot.engine}</div>
                  </td>
                  <td className="py-3.5">
                    <span className="badge-wealify-orange text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {bot.category}
                    </span>
                  </td>
                  <td className="py-3.5 font-mono text-[var(--text-primary)] font-bold">
                    {bot.requests.toLocaleString()}
                  </td>
                  <td className="py-3.5">
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="font-bold text-emerald-400">{bot.successRate}%</span>
                      <span className="text-[9px] text-[var(--text-muted)]">(100% ground)</span>
                    </div>
                  </td>
                  <td className="py-3.5 font-mono text-[var(--text-secondary)]">
                    <span className="text-[var(--text-primary)] font-bold">{bot.avgLatency}ms</span>{' '}
                    <span className="text-[10px] text-[var(--text-muted)]">({bot.p95Latency}ms)</span>
                  </td>
                  <td className="py-3.5 font-mono text-[var(--text-muted)]">
                    {bot.tokensUsed}
                  </td>
                  <td className="py-3.5">
                    <span className="badge-glow-green text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Optimal
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Row: Prompt Simulator & Live Execution Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prompt Simulator */}
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-[var(--text-primary)]">{t.promptSimulatorTitle}</h2>
              <p className="text-xs text-[var(--text-muted)]">{t.promptSimulatorSubtitle}</p>
            </div>
            <span className="badge-wealify-orange text-xs font-bold px-2.5 py-0.5 rounded-full">Test Sandbox</span>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={simQuery}
                onChange={(e) => setSimQuery(e.target.value)}
                placeholder={t.simulatorInputPlaceholder}
                className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[#FC6508] font-medium"
              />
              <button
                onClick={handleRunSimulation}
                disabled={isSimulating || !simQuery.trim()}
                className="btn-wealify text-xs py-2 px-4 shrink-0"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isSimulating ? 'Đang chạy...' : t.runSimulationBtn}</span>
              </button>
            </div>

            {/* Quick Sample Queries */}
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              <span className="text-[var(--text-muted)] text-[10px] py-1 font-semibold">{t.testedQuery}:</span>
              {[
                'Có khoản Payout Amazon nào bị trễ không?',
                'Thẻ ảo chạy ads có bị cà 2 lần không?',
                'Chuyển $100 cho tài khoản khác',
                'Người này gửi ảnh Wealify đã chuyển $2,500',
              ].map((query, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSimQuery(query);
                  }}
                  className="px-2.5 py-0.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[10px] font-medium text-[var(--text-secondary)] hover:text-[#FC6508] hover:border-[#FC6508]/40 transition-colors"
                >
                  {query}
                </button>
              ))}
            </div>

            {/* Simulation Diagnostic Output Card */}
            {simResult && (
              <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-2.5 text-xs">
                <div className="grid grid-cols-2 gap-2 pb-2 border-b border-[var(--border-subtle)]">
                  <div>
                    <span className="text-[10px] text-[var(--text-muted)] block">{t.simResultIntent}</span>
                    <span className="font-mono font-bold text-[#FFA14E]">{simResult.intent}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--text-muted)] block">{t.simResultTool}</span>
                    <span className="font-mono font-bold text-cyan-400">{simResult.tool}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--text-muted)] block">{t.simResultPolicy}</span>
                    <span
                      className={`font-mono font-bold ${
                        simResult.policy === 'ALLOW' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {simResult.policy === 'ALLOW' ? '✓ ALLOW (Read-Only Guard Passed)' : '✕ DENY (Mutation Blocked)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--text-muted)] block">{t.simResultLatency}</span>
                    <span className="font-mono font-bold text-amber-400">{simResult.latency} ms</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-[var(--text-muted)] block">{t.simResultGrounding}</span>
                  <span className="text-emerald-400 font-bold">{simResult.grounding}</span>
                </div>

                <div>
                  <span className="text-[10px] text-[var(--text-muted)] block">{t.simResultResponse}</span>
                  <p className="text-[var(--text-secondary)] italic bg-[var(--bg-card)] p-2.5 rounded-lg border border-[var(--border-subtle)] mt-1 leading-relaxed">
                    "{simResult.response}"
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Execution Stream Feed */}
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-[var(--text-primary)]">{t.liveExecutionFeedTitle}</h2>
              <p className="text-xs text-[var(--text-muted)]">{t.liveExecutionFeedSubtitle}</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Live Feed
            </div>
          </div>

          <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
            {EXECUTION_LOGS.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-[#FC6508]/30 transition-colors space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-[#FFA14E] font-bold">{log.id}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                        log.policyDecision === 'ALLOW'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {log.policyDecision}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[10px] text-[var(--text-muted)]">
                    <span className="text-amber-400 font-bold">{log.latencyMs}ms</span>
                    <span>{log.timestamp}</span>
                  </div>
                </div>

                <div className="text-[var(--text-primary)] font-semibold truncate">
                  "{log.userPrompt}"
                </div>

                <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] pt-0.5">
                  <span className="text-cyan-400 font-mono font-bold">Intent: {log.intent}</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1 font-mono">
                    <Check className="w-3 h-3 text-emerald-400" />
                    Grounding Verified
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

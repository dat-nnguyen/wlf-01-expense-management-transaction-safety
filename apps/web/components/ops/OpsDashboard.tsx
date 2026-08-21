import React from 'react';
import {
  CreditCard,
  Clock,
  CheckCircle2,
  Mail,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Language } from '../../types';
import { TRANSLATIONS } from '../../data/translations';

interface OpsDashboardProps {
  language: Language;
}

export const OpsDashboard: React.FC<OpsDashboardProps> = ({ language }) => {
  const t = TRANSLATIONS[language];

  // Specific Customer Profile Data (The User Themselves)
  const targetCustomer = {
    id: 'acc_main',
    name: 'Dat Nguyen',
    company: 'Volcano Ecom LLC',
    email: 'founder@wealify.io',
    tier: 'Wealify Pro Seller',
    registeredDate: '15/01/2025',
    availableBalance: 128490.5,
    creditLimit: 250000.0,
    riskScore: 92,
    riskLevel: 'Cần bạn tự xác nhận',
  };

  // Virtual Cards for this specific customer
  const customerCards = [
    {
      id: 'vcard_ad_fb',
      name: 'Volcano Ads Facebook',
      number: '•••• 4812',
      bank: 'VPBank Virtual',
      spendMonth: '$15,480.00',
      status: 'ALERT_DUP',
      statusLabel: 'Quẹt đúp ($150 x 2)',
      statusColor: 'bg-rose-500/15 text-rose-400 border-rose-500/25',
    },
    {
      id: 'vcard_tiktok',
      name: 'Volcano TikTok Ads',
      number: '•••• 9102',
      bank: 'VPBank Virtual',
      spendMonth: '$8,240.00',
      status: 'OPTIMAL',
      statusLabel: 'Hoạt động',
      statusColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      id: 'vcard_aws',
      name: 'AWS Cloud & Infra',
      number: '•••• 3341',
      bank: 'VPBank Virtual',
      spendMonth: '$890.00',
      status: 'OPTIMAL',
      statusLabel: 'Hoạt động',
      statusColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      id: 'vcard_dhl',
      name: 'DHL Global Logistics',
      number: '•••• 7712',
      bank: 'VPBank Virtual',
      spendMonth: '$3,150.00',
      status: 'OPTIMAL',
      statusLabel: 'Hoạt động',
      statusColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
  ];

  // Specific customer's active anomalies
  const customerAnomalies = [
    {
      id: 'AN-2026-08-01',
      title: 'Quẹt đúp thẻ ảo Facebook Ads ($150.00 x 2)',
      category: 'CÀ THẺ TRÙNG LẶP',
      amount: '$150.00 USD',
      detectedAt: '15:47 (Hôm nay)',
      deadline: 'Còn 42 ngày',
      card: 'Thẻ Volcano Ads •••• 4812',
      badge: 'Cần xác nhận',
      badgeStyle: 'bg-rose-500/15 text-rose-400 border-rose-500/25',
      actionPrompt: 'Gửi tra soát hoàn tiền VPBank',
    },
    {
      id: 'AN-2026-08-02',
      title: 'Thuê bao Adobe Creative Cloud tăng giá +10.0%',
      category: 'SUBSCRIPTION HIKE',
      amount: '$54.99 USD/tháng',
      detectedAt: '14:20 (Hôm nay)',
      deadline: 'Còn 60 ngày',
      card: 'Tài khoản chính',
      badge: 'Đã xác định',
      badgeStyle: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
      actionPrompt: 'Xem đề xuất đàm phán tier',
    },
    {
      id: 'AN-2026-08-03',
      title: 'Payout sàn Amazon chậm trễ 16 ngày',
      category: 'PAYOUT QUÁ HẠN',
      amount: '$4,250.00 USD',
      detectedAt: '09:15 (Hôm nay)',
      deadline: 'Trễ 16 ngày',
      card: 'Ví Wealify USD',
      badge: 'Khẩn cấp',
      badgeStyle: 'bg-rose-500/15 text-rose-400 border-rose-500/25',
      actionPrompt: 'Gửi ticket MT103 tới Amazon',
    },
    {
      id: 'AN-2026-08-04',
      title: 'Giám định ảnh chuyển khoản $2,500 không khớp sổ cái',
      category: 'AUTHENTICITY CONFLICT',
      amount: '$2,500.00 USD',
      detectedAt: 'Hôm qua',
      deadline: 'Xung đột 92/100',
      card: 'Ref: WF-839291',
      badge: 'Rủi ro cao',
      badgeStyle: 'bg-rose-500/15 text-rose-400 border-rose-500/25',
      actionPrompt: 'Xem bằng chứng đối soát',
    },
  ];

  return (
    <div className="p-6 space-y-5 transition-colors min-h-0 overflow-y-auto">
      {/* Customer Header Identity Card */}
      <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-primary)] font-bold text-sm font-mono shrink-0">
              DN
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-sm font-bold text-[var(--text-primary)]">
                  {targetCustomer.name}
                </h1>
                <span className="text-xs text-[var(--text-muted)] font-normal">({targetCustomer.company})</span>
                <span className="badge-wealify-orange text-[10px] font-medium px-2 py-0.2 rounded">
                  {targetCustomer.tier}
                </span>
                <span className="px-2 py-0.2 rounded bg-[var(--bg-secondary)] text-[var(--text-muted)] text-[10px] font-mono border border-[var(--border-subtle)]">
                  Account ID: {targetCustomer.id}
                </span>
              </div>
              <div className="text-[11px] text-[var(--text-muted)] font-mono mt-0.5">
                Email nhận cảnh báo: <span className="text-[var(--text-primary)] font-medium">{targetCustomer.email}</span> • Ngày đăng ký: {targetCustomer.registeredDate}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-2 px-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-right">
              <div className="text-[10px] text-rose-400 font-medium uppercase">
                {language === 'vi' ? 'Điểm an toàn tài khoản' : 'Account Safety Score'}
              </div>
              <div className="text-base font-bold text-rose-400 font-mono">
                {targetCustomer.riskScore}/100 <span className="text-xs font-normal">({targetCustomer.riskLevel})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Personal KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
        {/* KPI 1: Available Balance */}
        <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span className="font-medium">{language === 'vi' ? 'Số Dư Khả Dụng' : 'Available Balance'}</span>
            <DollarSign className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          </div>
          <div className="text-xl font-bold text-[var(--text-primary)] tracking-tight font-mono">
            ${targetCustomer.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-[var(--text-muted)] font-mono">
            ≈ 3.26 Tỷ VNĐ (Hạn mức $250k)
          </div>
        </div>

        {/* KPI 2: Active Anomalies */}
        <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span className="font-medium">{language === 'vi' ? 'Sự Cố Cần Bạn Xác Nhận' : 'Pending Anomalies'}</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-bold text-rose-400 tracking-tight font-mono">3 Sự Cố</div>
          <div className="text-[10px] text-[var(--text-muted)] font-medium">
            1 Quẹt đúp, 1 Payout, 1 Tăng giá
          </div>
        </div>

        {/* KPI 3: Virtual Cards Fleet */}
        <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span className="font-medium">{language === 'vi' ? 'Thẻ Ảo Hoạt Động' : 'Virtual Cards'}</span>
            <CreditCard className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          </div>
          <div className="text-xl font-bold text-[var(--text-primary)] tracking-tight font-mono">4 Thẻ Ảo</div>
          <div className="text-[10px] text-[var(--text-muted)] font-medium">VPBank Virtual Card</div>
        </div>

        {/* KPI 4: Dispute Deadline Window */}
        <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span className="font-medium">{language === 'vi' ? 'Hạn Tra Soát Gần Nhất' : 'Nearest Deadline'}</span>
            <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          </div>
          <div className="text-xl font-bold text-[var(--text-primary)] tracking-tight font-mono">Còn 42 Ngày</div>
          <div className="text-[10px] text-[var(--text-muted)] font-mono">Hạn chót: 17/10/2026 (Luật 60 ngày)</div>
        </div>

        {/* KPI 5: Dispatched Alerts */}
        <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span className="font-medium">{language === 'vi' ? 'Email Cảnh Báo Đã Gửi' : 'Email Alerts Sent'}</span>
            <Mail className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          </div>
          <div className="text-xl font-bold text-[var(--text-primary)] tracking-tight font-mono">3 Email</div>
          <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Gửi tới founder@wealify.io</span>
          </div>
        </div>
      </div>

      {/* Your Virtual Cards Fleet Matrix */}
      <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
            {language === 'vi' ? 'Danh Sách Thẻ Ảo & Ví Của Bạn' : 'Your Virtual Cards & Wallets'}
          </h2>
          <span className="text-[11px] font-mono text-[var(--text-muted)]">4 Thẻ VPBank</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {customerCards.map((card) => (
            <div
              key={card.id}
              className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[var(--text-primary)]">{card.number}</span>
                <CreditCard className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              </div>
              <div>
                <div className="font-semibold text-xs text-[var(--text-primary)] truncate">{card.name}</div>
                <div className="text-[10px] text-[var(--text-muted)]">{card.bank}</div>
              </div>
              <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between">
                <div>
                  <div className="text-[9px] text-[var(--text-muted)] uppercase">Chi tiêu:</div>
                  <div className="font-mono font-bold text-xs text-[var(--text-primary)]">{card.spendMonth}</div>
                </div>
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-medium border ${card.statusColor}`}>
                  {card.status === 'ALERT_DUP' ? 'Quẹt đúp' : 'Hoạt động'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Active Anomaly Queue */}
      <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
            {language === 'vi' ? 'Hàng Đợi Sự Cố Bất Thường Của Bạn' : 'Your Active Anomaly & Dispute Queue'}
          </h2>
          <span className="text-xs font-mono text-rose-400 font-medium">4 Sự Cố</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] text-[var(--text-muted)]">
                <th className="pb-2.5 font-semibold uppercase text-[10px]">MÃ SỰ CỐ</th>
                <th className="pb-2.5 font-semibold uppercase text-[10px]">TIÊU ĐỀ BẤT THƯỜNG</th>
                <th className="pb-2.5 font-semibold uppercase text-[10px]">SỐ TIỀN</th>
                <th className="pb-2.5 font-semibold uppercase text-[10px]">THẺ / TÀI KHOẢN</th>
                <th className="pb-2.5 font-semibold uppercase text-[10px]">HẠN TRA SOÁT</th>
                <th className="pb-2.5 font-semibold uppercase text-[10px]">TRẠNG THÁI</th>
                <th className="pb-2.5 font-semibold uppercase text-[10px]">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {customerAnomalies.map((anom) => (
                <tr key={anom.id} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                  <td className="py-3 font-mono font-medium text-[var(--text-muted)]">{anom.id}</td>
                  <td className="py-3">
                    <div className="font-semibold text-[var(--text-primary)]">{anom.title}</div>
                    <div className="text-[10px] text-[var(--text-muted)] font-mono">{anom.detectedAt}</div>
                  </td>
                  <td className="py-3 font-mono font-bold text-[var(--text-primary)]">{anom.amount}</td>
                  <td className="py-3 font-mono text-[var(--text-secondary)]">{anom.card}</td>
                  <td className="py-3 font-mono text-[var(--text-muted)]">{anom.deadline}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${anom.badgeStyle}`}>
                      {anom.badge}
                    </span>
                  </td>
                  <td className="py-3">
                    <button className="px-2.5 py-1 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-card)] text-[var(--text-primary)] font-medium text-[11px] border border-[var(--border-subtle)] transition-colors flex items-center gap-1">
                      <span>{anom.actionPrompt}</span>
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

import React from 'react';
import { Upload, ShieldAlert, AlertTriangle, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import { Language } from '../../types';
import { TRANSLATIONS } from '../../data/translations';
import { DEMO_SECURITY_CASES } from '../../data/mockData';

interface SecurityCenterViewProps {
  onOpenVerifyModal: () => void;
  onSelectCase: (caseId: string) => void;
  language: Language;
}

export const SecurityCenterView: React.FC<SecurityCenterViewProps> = ({
  onOpenVerifyModal,
  onSelectCase,
  language,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <div className="p-6 space-y-5 transition-colors">
      {/* Security Overview KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
        <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1">
          <div className="text-xs text-[var(--text-muted)] font-medium">{t.totalSecurityAlerts}</div>
          <div className="text-xl font-bold text-rose-400 font-mono">12</div>
          <div className="text-[10px] text-[var(--text-muted)]">{t.requireInvestigationNow}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1">
          <div className="text-xs text-[var(--text-muted)] font-medium">{t.highRiskCases}</div>
          <div className="text-xl font-bold text-rose-400 font-mono">3</div>
          <div className="text-[10px] text-[var(--text-muted)]">{t.scoreOver70}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1">
          <div className="text-xs text-[var(--text-muted)] font-medium">{t.evidenceConflicts}</div>
          <div className="text-xl font-bold text-[var(--text-primary)] font-mono">7</div>
          <div className="text-[10px] text-[var(--text-muted)]">{t.conflictingDocs}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1">
          <div className="text-xs text-[var(--text-muted)] font-medium">{t.unverifiedClaims}</div>
          <div className="text-xl font-bold text-[var(--text-primary)] font-mono">5</div>
          <div className="text-[10px] text-[var(--text-muted)]">{t.notInLedger}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1">
          <div className="text-xs text-[var(--text-muted)] font-medium">{t.unmatchedRefs}</div>
          <div className="text-xl font-bold text-[var(--text-primary)] font-mono">4</div>
          <div className="text-[10px] text-[var(--text-muted)]">{t.fraudReference}</div>
        </div>
      </div>

      {/* Security Alert Table */}
      <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">{t.securityAlertQueue}</h2>
            <p className="text-xs text-[var(--text-muted)]">{t.securityQueueDesc}</p>
          </div>
          <button
            onClick={onOpenVerifyModal}
            className="btn-wealify text-xs py-1.5 px-3"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{t.verifyNewImage}</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] text-[var(--text-muted)]">
                <th className="pb-2.5 font-semibold uppercase text-[10px]">{t.caseId}</th>
                <th className="pb-2.5 font-semibold uppercase text-[10px]">{t.customerName}</th>
                <th className="pb-2.5 font-semibold uppercase text-[10px]">{t.claimedAmount}</th>
                <th className="pb-2.5 font-semibold uppercase text-[10px]">{t.refCode}</th>
                <th className="pb-2.5 font-semibold uppercase text-[10px]">{t.conflictScore}</th>
                <th className="pb-2.5 font-semibold uppercase text-[10px]">{t.status}</th>
                <th className="pb-2.5 font-semibold uppercase text-[10px]">{t.action}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {DEMO_SECURITY_CASES.map((item, idx) => (
                <tr key={idx} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                  <td className="py-3 font-mono font-medium text-[var(--text-muted)]">{item.id}</td>
                  <td className="py-3">
                    <div className="font-semibold text-[var(--text-primary)]">{item.title}</div>
                    <div className="text-[10px] text-[var(--text-muted)] font-mono">User ID: acc_main (Dat Nguyen)</div>
                  </td>
                  <td className="py-3 font-mono font-bold text-[var(--text-primary)]">{item.amount}</td>
                  <td className="py-3 font-mono text-[var(--text-secondary)]">{item.ref}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className={`font-bold ${item.score > 70 ? 'text-rose-400' : 'text-amber-400'}`}>
                        {item.score}/100
                      </span>
                    </div>
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                        item.score > 70
                          ? 'bg-rose-500/15 text-rose-400 border-rose-500/25'
                          : 'bg-amber-500/15 text-amber-400 border-amber-500/25'
                      }`}
                    >
                      {item.badge}
                    </span>
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => onSelectCase(item.id)}
                      className="px-2.5 py-1 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-card)] text-[var(--text-primary)] font-medium text-[11px] border border-[var(--border-subtle)] transition-colors"
                    >
                      {t.viewDetails}
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

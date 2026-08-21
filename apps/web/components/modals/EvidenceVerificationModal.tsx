import React from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { Language } from '../../types';
import { TRANSLATIONS } from '../../data/translations';

interface EvidenceVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerEmailReport: () => void;
  language: Language;
}

export const EvidenceVerificationModal: React.FC<EvidenceVerificationModalProps> = ({
  isOpen,
  onClose,
  onTriggerEmailReport,
  language,
}) => {
  if (!isOpen) return null;
  const t = TRANSLATIONS[language];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="w-full max-w-xl bg-[var(--bg-modal)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FC6508] flex items-center justify-center text-white shrink-0">
              <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[var(--text-primary)]">{t.evidenceModalTitle}</h3>
              <p className="text-[11px] text-[var(--text-muted)]">{t.evidenceModalSubtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-base font-bold p-1"
          >
            ✕
          </button>
        </div>

        {/* Analysis Progress Timeline */}
        <div className="space-y-1.5 p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
          <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{t.evidenceTimelineTitle}</div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{t.step1}</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{t.step2}</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{t.step3}</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{t.step4}</span>
            </div>
            <div className="flex items-center gap-2 text-rose-400 font-semibold">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span>{t.step5}</span>
            </div>
          </div>
        </div>

        {/* Score & Risk Analysis Box */}
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-rose-300 font-medium">{t.conflictScoreLabel}</span>
            <span className="text-lg font-bold text-rose-400 font-mono">92/100</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="px-2 py-0.2 rounded bg-rose-500/20 text-rose-300 font-medium text-[10px] border border-rose-500/30">
              {t.highRiskTag}
            </span>
            <div className="text-[11px] text-[var(--text-muted)]">
              {t.classificationLabel} <span className="font-semibold text-[var(--text-primary)]">{t.needsUserConfirmation}</span>
            </div>
          </div>
        </div>

        {/* AI Forensic Summary */}
        <div className="space-y-1 text-xs leading-relaxed">
          <div className="font-bold text-[var(--text-primary)]">Tóm tắt kết luận giám định Wealify:</div>
          <p className="text-[var(--text-secondary)] bg-[var(--bg-secondary)] p-3 rounded-lg border border-[var(--border-subtle)]">
            {t.authenticitySummary}
          </p>
        </div>

        {/* Human-in-the-Loop Safe Action Recommendations */}
        <div className="space-y-1 text-xs">
          <div className="font-bold text-[var(--text-primary)]">{t.recommendationTitle}</div>
          <ul className="space-y-1 text-[var(--text-secondary)] list-disc pl-4">
            <li>{t.rec1}</li>
            <li>{t.rec2}</li>
            <li>{t.rec3}</li>
          </ul>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
          <button
            onClick={onClose}
            className="btn-secondary text-xs"
          >
            {t.close}
          </button>
          <button
            onClick={onTriggerEmailReport}
            className="btn-wealify text-xs"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>{t.sendReportToMyEmail}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

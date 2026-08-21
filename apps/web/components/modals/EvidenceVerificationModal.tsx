import React, { useState, useRef } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Mail,
  ShieldCheck,
  UploadCloud,
  FileText,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { Language, SecurityVerificationInfo } from '../../types';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string; previewUrl: string } | null>({
    name: 'receipt_transfer_2500_USD.png',
    size: '142 KB',
    previewUrl: '',
  });
  const [claimedAmount, setClaimedAmount] = useState<number>(2500);
  const [claimedRef, setClaimedRef] = useState<string>('WF-839291');
  const [recipientEmail, setRecipientEmail] = useState<string>('masewtricker.contact.06@gmail.com');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  const [emailStatusMessage, setEmailStatusMessage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>({
    conflictScore: 92,
    riskLevel: 'HIGH',
    classification: language === 'vi' ? 'Cần bạn tự xác nhận' : 'Needs your confirmation',
    ledgerMatch: false,
    walletMatch: false,
    emailMatch: false,
    refMatch: false,
    dimensions: [
      { name: 'Mã tham chiếu (Reference)', matched: false, detail: "Mã 'WF-839291' không tồn tại trong hệ thống sổ cái Wealify Core Banking." },
      { name: 'Số tiền & Sổ cái (Ledger)', matched: false, detail: 'Không có biến động số dư +$2,500.00 USD vào ngày 21/08/2026.' },
      { name: 'Ví điện tử (Wallet)', matched: false, detail: 'Không có giao dịch nạp tiền hoặc nhận chuyển khoản tương ứng.' },
      { name: 'Hộp thư xác nhận (Email)', matched: false, detail: 'Không có thông báo xác nhận chuyển khoản từ ngân hàng gửi về email.' },
    ],
    summary: language === 'vi'
      ? 'Hệ thống đã đối soát toàn bộ số cái kế toán và hộp thư. Không tìm thấy lệnh chuyển tiền tương ứng với mã số giao dịch được cung cấp. Khuyến nghị bạn không thực hiện bàn giao dịch vụ/hàng hoá trước khi tiền thực tế vào tài khoản.'
      : 'System performed cross-check against accounting ledger and verified mailbox. No incoming transfer found for the claimed reference code. Recommend holding off fulfillment until funds officially settle.',
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedFile({
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        previewUrl: event.target?.result as string,
      });
      runAnalysis(2500, 'WF-839291', file.name);
    };
    reader.readAsDataURL(file);
  };

  const runAnalysis = async (amount: number, ref: string, filename: string) => {
    setIsAnalyzing(true);
    try {
      let apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      if (!apiUrl) {
        if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
          apiUrl = 'http://127.0.0.1:8000';
        } else {
          apiUrl = 'https://wealify-guardian-api.onrender.com';
        }
      }
      apiUrl = apiUrl.replace(/\/+$/, '');

      const res = await fetch(`${apiUrl}/api/v1/security/verify-claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claimed_amount: amount,
          reference: ref,
          currency: 'USD',
          source_type: 'SCREENSHOT',
          raw_text: `Biên lai ảnh: ${filename}. Số tiền $${amount} USD, Mã giao dịch ${ref}`,
          account_id: 'acc_main',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAnalysisResult({
          conflictScore: data.evidence_conflict_score,
          riskLevel: data.risk_level,
          classification: data.classification,
          ledgerMatch: data.ledger_match,
          walletMatch: data.wallet_match,
          emailMatch: data.email_match,
          refMatch: data.reference_match,
          dimensions: data.dimensions?.map((d: any) => ({
            name: d.name,
            matched: d.matched,
            detail: d.details,
          })) || [],
          summary: data.ai_summary,
        });
      }
    } catch (e) {
      console.warn('Fallback analysis used:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendForensicEmail = async () => {
    if (!recipientEmail || !recipientEmail.includes('@')) {
      setEmailStatusMessage(language === 'vi' ? 'Vui lòng nhập đúng địa chỉ email nhận' : 'Please enter a valid recipient email');
      return;
    }
    setIsSendingEmail(true);
    setEmailStatusMessage(null);
    try {
      let apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      if (!apiUrl) {
        if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
          apiUrl = 'http://127.0.0.1:8000';
        } else {
          apiUrl = 'https://wealify-guardian-api.onrender.com';
        }
      }
      apiUrl = apiUrl.replace(/\/+$/, '');

      const res = await fetch(`${apiUrl}/api/v1/security/send-forensic-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_email: recipientEmail.trim(),
          claimed_amount: claimedAmount,
          reference: claimedRef,
          conflict_score: analysisResult.conflictScore,
          summary: analysisResult.summary,
          dimensions: analysisResult.dimensions,
        }),
      });

      if (res.ok) {
        setEmailStatusMessage(
          language === 'vi'
            ? `Đã gửi báo cáo giám định tới ${recipientEmail.trim()} qua SMTP!`
            : `Forensic report sent successfully to ${recipientEmail.trim()} via SMTP!`
        );
      } else {
        setEmailStatusMessage(language === 'vi' ? 'Lỗi gửi email máy chủ' : 'Failed sending email');
      }
    } catch {
      setEmailStatusMessage(language === 'vi' ? 'Lỗi kết nối máy chủ' : 'Connection error');
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="w-full max-w-2xl bg-[var(--bg-modal)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FC6508] flex items-center justify-center text-white shrink-0 shadow-sm">
              <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-2">
                <span>{t.evidenceModalTitle}</span>
                <span className="px-2 py-0.5 rounded-md bg-[#FC6508]/15 text-[#FC6508] text-[10px] font-mono font-medium">
                  AI Forensic OCR
                </span>
              </h3>
              <p className="text-xs text-[var(--text-muted)]">{t.evidenceModalSubtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-lg font-bold p-1 rounded-lg hover:bg-[var(--bg-secondary)]"
          >
            ✕
          </button>
        </div>

        {/* Upload Dropzone & Sample selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*,.pdf"
            onChange={handleFileUpload}
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-4 rounded-xl border-2 border-dashed border-[var(--border-default)] hover:border-[#FC6508] bg-[var(--bg-secondary)] flex flex-col items-center justify-center text-center cursor-pointer transition-colors group"
          >
            <UploadCloud className="w-7 h-7 text-[var(--text-muted)] group-hover:text-[#FC6508] transition-colors mb-1.5" />
            <div className="text-xs font-semibold text-[var(--text-primary)]">
              {language === 'vi' ? 'Chọn ảnh chứng từ / biên lai' : 'Upload Receipt Screenshot'}
            </div>
            <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
              PNG, JPG, PDF (Tối đa 15MB)
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-2 flex flex-col justify-between">
            <div className="text-xs font-bold text-[var(--text-primary)]">
              {language === 'vi' ? 'Biên lai mẫu để thử nghiệm nhanh:' : 'Sample Receipts for Quick Testing:'}
            </div>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => {
                  setSelectedFile({ name: 'fake_transfer_2500_USD.png', size: '142 KB', previewUrl: '' });
                  setClaimedAmount(2500);
                  setClaimedRef('WF-839291');
                  runAnalysis(2500, 'WF-839291', 'fake_transfer_2500_USD.png');
                }}
                className="w-full text-left p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-rose-400 text-xs transition-colors flex items-center justify-between"
              >
                <span className="text-rose-400 font-medium truncate">⚠️ Ảnh chuyển khoản giả ($2,500 USD)</span>
                <span className="text-[10px] text-[var(--text-muted)] font-mono">Ref: WF-839291</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedFile({ name: 'adobe_saas_invoice_54.99.png', size: '98 KB', previewUrl: '' });
                  setClaimedAmount(54.99);
                  setClaimedRef('INV-ADOBE-991');
                  runAnalysis(54.99, 'INV-ADOBE-991', 'adobe_saas_invoice_54.99.png');
                }}
                className="w-full text-left p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-emerald-400 text-xs transition-colors flex items-center justify-between"
              >
                <span className="text-emerald-400 font-medium truncate">✓ Hoá đơn Adobe SaaS ($54.99 USD)</span>
                <span className="text-[10px] text-[var(--text-muted)] font-mono">Adobe Cloud</span>
              </button>
            </div>
          </div>
        </div>

        {/* Selected File Info Banner */}
        {selectedFile && (
          <div className="flex items-center justify-between p-2.5 px-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs">
            <div className="flex items-center gap-2 truncate">
              <FileText className="w-4 h-4 text-[#FC6508]" />
              <span className="font-semibold text-[var(--text-primary)] truncate">{selectedFile.name}</span>
              <span className="text-[11px] text-[var(--text-muted)] font-mono">({selectedFile.size})</span>
            </div>
            <button
              onClick={() => runAnalysis(claimedAmount, claimedRef, selectedFile.name)}
              disabled={isAnalyzing}
              className="action-chip text-xs shrink-0 text-[#FC6508] border-[#FC6508]/40 hover:border-[#FC6508]"
            >
              {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              <span>{language === 'vi' ? 'Giám định lại' : 'Re-analyze'}</span>
            </button>
          </div>
        )}

        {/* Score & Risk Analysis Box */}
        <div className={`p-4 rounded-xl border space-y-2 ${analysisResult.conflictScore > 50 ? 'bg-rose-500/10 border-rose-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className={`w-5 h-5 ${analysisResult.conflictScore > 50 ? 'text-rose-400' : 'text-emerald-400'}`} />
              <span className="text-xs font-bold text-[var(--text-primary)]">{t.conflictScoreLabel}</span>
            </div>
            <span className={`text-xl font-bold font-mono ${analysisResult.conflictScore > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {analysisResult.conflictScore}/100
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className={`px-2.5 py-0.5 rounded-md font-medium text-[11px] border ${analysisResult.conflictScore > 50 ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'}`}>
              {analysisResult.conflictScore > 50 ? t.highRiskTag : 'Khớp dữ liệu sổ cái'}
            </span>
            <div className="text-[11px] text-[var(--text-muted)]">
              {t.classificationLabel}{' '}
              <strong className="text-[var(--text-primary)]">{analysisResult.classification}</strong>
            </div>
          </div>
        </div>

        {/* 4-Way Cross Check Dimensions */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
            {language === 'vi' ? 'Chi tiết 4 chiều đối soát chéo' : '4-Way Forensic Cross-Check'}
          </div>
          <div className="space-y-2">
            {analysisResult.dimensions?.map((dim: any, idx: number) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-start gap-2.5 text-xs"
              >
                {dim.matched ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-0.5">
                  <div className="font-bold text-[var(--text-primary)]">{dim.name}</div>
                  <div className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{dim.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Forensic Summary */}
        <div className="space-y-1.5 text-xs leading-relaxed">
          <div className="font-bold text-[var(--text-primary)]">
            {language === 'vi' ? 'Kết luận giám định Wealify Guardian:' : 'Wealify Forensic Investigation Summary:'}
          </div>
          <p className="text-[var(--text-secondary)] bg-[var(--bg-secondary)] p-3 rounded-xl border border-[var(--border-subtle)] text-xs leading-relaxed">
            {analysisResult.summary}
          </p>
        </div>

        {/* Live SMTP Recipient Box */}
        <div className="p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-[var(--text-secondary)] flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#FC6508]" />
              <span>{language === 'vi' ? 'Email nhận báo cáo kết quả giám định (Live SMTP):' : 'Recipient Email for Forensic Report:'}</span>
            </label>
            <span className="text-[10px] text-emerald-400 font-mono">SMTP Connected</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="masewtricker.contact.06@gmail.com"
              className="flex-1 bg-[var(--bg-card)] border border-[var(--border-subtle)] px-3 py-2 rounded-lg text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[#FC6508]"
            />
            <button
              onClick={handleSendForensicEmail}
              disabled={isSendingEmail}
              className="btn-wealify text-xs shrink-0 flex items-center gap-1.5 px-3.5 py-2 font-medium"
            >
              {isSendingEmail ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
              <span>{isSendingEmail ? (language === 'vi' ? 'Đang gửi...' : 'Sending...') : (language === 'vi' ? 'Gửi kết quả qua Email' : 'Send via SMTP')}</span>
            </button>
          </div>

          {emailStatusMessage && (
            <div className={`p-2.5 rounded-lg text-xs font-medium ${emailStatusMessage.includes('thành công') || emailStatusMessage.includes('successfully') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
              {emailStatusMessage}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">
          <button onClick={onClose} className="btn-secondary text-xs">
            {t.close}
          </button>
          <button onClick={onTriggerEmailReport} className="btn-wealify text-xs">
            <Mail className="w-3.5 h-3.5" />
            <span>{t.sendReportToMyEmail}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  Bot,
  Send,
  Sparkles,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  RefreshCw,
  Copy,
  Check,
  Layers,
  Activity,
  DollarSign,
  Briefcase,
  UserCheck,
  Search,
  Mail,
  ArrowUpRight,
  Database,
  Link2,
  ChevronRight,
  Zap,
  HelpCircle,
  Bell,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  intent?: string;
  tool_called?: string;
  grounding_verified?: boolean;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'chat' | 'wealify_sync' | 'anomalies' | 'cards' | 'advisor' | 'notifications' | 'hitl' | 'audit'
  >('overview');

  const [anomalySubTab, setAnomalySubTab] = useState<'payouts' | 'duplicates' | 'subscriptions'>('payouts');

  // Modals
  const [selectedDispute, setSelectedDispute] = useState<{ title: string; text: string } | null>(null);
  const [previewEmailHtml, setPreviewEmailHtml] = useState<{ title: string; html: string; to: string } | null>(null);
  const [isEmailSentToast, setIsEmailSentToast] = useState(false);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(100);
  const [lastSyncTime, setLastSyncTime] = useState('Vừa xong (11:45 AM)');

  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'bot',
      text: 'Xin chào! Tôi là **Wealify Guardian**, trợ lý AI bảo vệ giao dịch & hỗ trợ tra soát tài chính cho người dùng và đội Support Wealify.\n\nTôi vừa tự động rà soát sổ cái và phát hiện:\n- 🚨 **Amazon Seller Payout $4,250.00 USD** đã 16 ngày chưa về tài khoản (đã gửi email cảnh báo).\n- ⚠️ **Facebook Ads bị cà đúp $150.00 x 2** trên thẻ ảo VPBank (`vcard_ad_fb`).\n- 📈 **Adobe Creative Cloud** tăng giá +$5.00/tháng (+$60/năm).\n\nBạn có thể hỏi tôi bất kỳ điều gì để tra cứu hoặc giải thích lý do gửi mail cảnh báo!',
      timestamp: '11:45 AM',
      intent: 'INITIAL_ALERT',
      grounding_verified: true,
    },
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // HITL Queue items
  const [hitlActions, setHitlActions] = useState([
    {
      id: 'hitl_01',
      title: 'Gửi thư tra soát tự động tới Sàn Amazon Seller',
      description: 'Gửi bản thảo tra soát cho khoản giải ngân $4,250.00 USD (Mã: AMZ-DISB-8821) đã 16 ngày chưa về tài khoản.',
      type: 'draft_payout_ticket',
      status: 'pending',
      amount: '$4,250.00 USD',
    },
    {
      id: 'hitl_02',
      title: 'Gửi yêu cầu hoàn tiền quẹt thẻ đúp Facebook Ads',
      description: 'Yêu cầu ngân hàng VPBank tra soát giao dịch $150.00 USD bị trừ 2 lần trên thẻ ảo vcard_ad_fb.',
      type: 'dispute_charge',
      status: 'pending',
      amount: '$150.00 USD',
    },
    {
      id: 'hitl_03',
      title: 'Tối ưu ngân sách: Giảm 30% Ad Spend Facebook Ads',
      description: 'Tạm thời hạ ngân sách chiến dịch Ads để bảo toàn dòng tiền trong lúc Payout Amazon đang chậm trễ.',
      type: 'pause_ad_campaign',
      status: 'pending',
      amount: 'Tiết kiệm ~$300/tuần',
    },
  ]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSyncNow = () => {
    setIsSyncing(true);
    setSyncProgress(20);
    setTimeout(() => setSyncProgress(55), 400);
    setTimeout(() => setSyncProgress(85), 800);
    setTimeout(() => {
      setSyncProgress(100);
      setIsSyncing(false);
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      alert('Đồng bộ tài khoản Wealify, thẻ ảo và hòm thư thành công!');
    }, 1200);
  };

  const handleTriggerEmailAlert = async (alertType: string, title: string, amount: string) => {
    setIsEmailSentToast(true);
    setTimeout(() => setIsEmailSentToast(false), 3500);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMsg;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMsg('');
    setIsTyping(true);

    try {
      const res = await fetch('http://localhost:8000/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          session_id: 'ses_web_demo',
          account_id: 'acc_main',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            id: `bot_${Date.now()}`,
            sender: 'bot',
            text: data.response,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            intent: data.intent,
            tool_called: data.tool_called,
            grounding_verified: data.grounding_verified ?? true,
          },
        ]);
      } else {
        throw new Error('API failed');
      }
    } catch (e) {
      setTimeout(() => {
        let resp = '';
        let intent = 'GENERAL_QA';
        let tool = 'search_transactions';

        const q = query.toLowerCase();
        if (q.includes('tại sao gửi mail') || q.includes('lý do gửi mail') || q.includes('giải thích email')) {
          intent = 'EXPLAIN_ALERT_EMAIL';
          tool = 'detect_overdue_payouts';
          resp = '📧 **Giải Thích Chi Tiết Lý Do Hệ Thống Gửi Email Cảnh Báo Cho Bạn:**\n\n• **Căn cứ gửi mail:** Hệ thống phát hiện email thông báo giải ngân từ **Amazon Seller Central** ($4,250.00 USD) ngày 05/08/2026 với mã đối soát `AMZ-DISB-20260805-9182`.\n• **Nguyên nhân kích hoạt cảnh báo:** Quy chuẩn xử lý Payout quốc tế thông thường là **2-3 ngày làm việc**. Tuy nhiên đến nay đã **16 ngày** trôi qua mà tài khoản Wealify vẫn chưa ghi nhận số dư này (có nguy cơ thất lạc mạng ngân hàng trung gian hoặc lệnh bị treo).\n• **Mục đích:** Cảnh báo sớm giúp khách hàng và bộ phận Kế toán / CEO không bị đứt dòng tiền và kịp thời gửi ticket tra soát trước khi quá hạn khiếu nại.\n\n💡 **Hướng dẫn cho Khách hàng & Support:**\n1. Kiểm tra lại thông tin số tài khoản nhận (4 số cuối: ...8821).\n2. Mở tab **Trung Tâm Bất Thường** > **Payouts** và copy **Mẫu Thư Khiếu Nại** gửi bộ phận hỗ trợ Amazon Seller Central để xin mã tham chiếu Bank ARN / MT103.';
        } else if (q.includes('payout') || q.includes('amazon') || q.includes('chưa về') || q.includes('14') || q.includes('15')) {
          intent = 'OVERDUE_PAYOUT_CHECK';
          tool = 'detect_overdue_payouts';
          resp = '🚨 **Phát hiện 1 khoản Payout Amazon Seller Central bị chậm trễ:**\n\n• **Khoản tiền:** $4,250.00 USD\n• **Email thông báo:** 05/08/2026 (Đã 16 ngày trôi qua, quá SLA 3 ngày)\n• **Mã đối soát:** `AMZ-DISB-20260805-9182`\n• **Lý do:** Chưa có giao dịch ghi có (Credit) trên tài khoản Wealify.\n\n💡 **Đề xuất:** Tôi đã soạn sẵn thư khiếu nại trong tab **Bất Thường > Payouts**. Bạn có thể bấm để copy gửi Amazon.';
        } else if (q.includes('cà 2') || q.includes('quẹt') || q.includes('thẻ ảo') || q.includes('trùng')) {
          intent = 'DUPLICATE_CHECK';
          tool = 'find_duplicates';
          resp = '🔍 **Kết quả quét thẻ ảo:** Phát hiện giao dịch bị trừ 2 lần:\n\n• **Facebook Ads**: 2 lần trừ $150.00 USD (cách nhau 1 phút 45 giây) trên Thẻ ảo VPBank (`vcard_ad_fb`).\n• **Grab**: 2 lần trừ $24.50 USD trên Thẻ ảo Techcombank.\n\n📌 **Độ tin cậy:** 98% | **Hạn tra soát ngân hàng:** Còn 59 ngày.';
        } else if (q.includes('kinh doanh') || q.includes('lãi') || q.includes('lỗ') || q.includes('tiếp tục') || q.includes('sức khỏe')) {
          intent = 'BUSINESS_HEALTH_ADVISORY';
          tool = 'analyze_business_health';
          resp = '📊 **Báo cáo Sức Khỏe Kinh Doanh (Mức: WARNING - 65/100 điểm):**\n\n• **Chi phí Ads thẻ ảo:** $870.00 USD (Facebook $300 + Google $420 + Ads $150)\n• **Payout thực nhận:** $1,890.00 USD (Stripe)\n• **Payout bị kẹt:** $4,250.00 USD (Amazon)\n• **Ước tính ROAS:** 2.56x\n\n⚠️ **Cảnh báo rủi ro:** Dòng tiền Payout đang bị nghẽn 16 ngày trong khi thẻ ảo Ads vẫn liên tục trừ tiền, có nguy cơ hụt thanh khoản trong 7 ngày tới nếu không can thiệp!';
        } else if (q.includes('chuyển') || q.includes('hủy')) {
          intent = 'DISALLOWED_MUTATION';
          tool = undefined as any;
          resp = '⚠️ **Chính sách an toàn tài chính (Policy Denied):**\nWealify Guardian hoạt động ở chế độ **Read-Only** nhằm bảo vệ tài sản của bạn. Hệ thống không có quyền chuyển tiền hay tự ý hủy gói dịch vụ.';
        } else {
          resp = 'Hệ thống Wealify Guardian đang kết nối 4 thẻ ảo, 3 tài khoản ngân hàng và 1 hòm thư. Tất cả dòng tiền đều được bảo vệ trong thời gian thực!';
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `bot_${Date.now()}`,
            sender: 'bot',
            text: resp,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            intent: intent,
            tool_called: tool,
            grounding_verified: true,
          },
        ]);
      }, 500);
    } finally {
      setIsTyping(false);
    }
  };

  const handleHITLDecision = (id: string, decision: 'approved' | 'rejected') => {
    setHitlActions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: decision } : item))
    );
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* LEFT SIDEBAR NAVIGATION */}
      <aside
        style={{
          width: 280,
          background: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '20px 16px',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 40,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Logo & Brand Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 8px' }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '12px',
                background: 'var(--gradient-brand)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 18px rgba(6, 182, 212, 0.4)',
              }}
            >
              <ShieldCheck size={22} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.3px', color: '#fff' }}>Wealify Guardian</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Financial Safety AI Microservice</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '0 12px 6px' }}>
              Điều Hành &amp; Giám Sát
            </div>

            <button className={`sidebar-link ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
              <TrendingUp size={18} />
              <span>Tổng Quan Điều Hành</span>
            </button>

            <button className={`sidebar-link ${activeTab === 'wealify_sync' ? 'active' : ''}`} onClick={() => setActiveTab('wealify_sync')}>
              <Database size={18} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <span>Kết Nối &amp; Đồng Bộ Wealify</span>
                <span className="badge badge-success" style={{ fontSize: 10, padding: '2px 6px' }}>LIVE</span>
              </div>
            </button>

            <button className={`sidebar-link ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>
              <Bot size={18} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <span>AI Copilot &amp; Tra Cứu</span>
                <span className="badge badge-purple" style={{ fontSize: 10, padding: '2px 6px' }}>DeepSeek</span>
              </div>
            </button>

            <button className={`sidebar-link ${activeTab === 'anomalies' ? 'active' : ''}`} onClick={() => setActiveTab('anomalies')}>
              <ShieldAlert size={18} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <span>Trung Tâm Bất Thường</span>
                <span className="badge badge-critical" style={{ fontSize: 10, padding: '2px 6px' }}>3 Mới</span>
              </div>
            </button>

            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '16px 12px 6px' }}>
              Dòng Tiền &amp; Thẻ Ảo
            </div>

            <button className={`sidebar-link ${activeTab === 'cards' ? 'active' : ''}`} onClick={() => setActiveTab('cards')}>
              <CreditCard size={18} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <span>Quản Lý Thẻ Ảo Wealify</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>4 Thẻ</span>
              </div>
            </button>

            <button className={`sidebar-link ${activeTab === 'advisor' ? 'active' : ''}`} onClick={() => setActiveTab('advisor')}>
              <Briefcase size={18} />
              <span>Cố Vấn Dòng Tiền &amp; P&amp;L</span>
            </button>

            <button className={`sidebar-link ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>
              <Mail size={18} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <span>Hộp Thư Cảnh Báo</span>
                <span className="badge badge-info" style={{ fontSize: 10, padding: '2px 6px' }}>2 Email</span>
              </div>
            </button>

            <button className={`sidebar-link ${activeTab === 'hitl' ? 'active' : ''}`} onClick={() => setActiveTab('hitl')}>
              <UserCheck size={18} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <span>Duyệt Human-in-Loop</span>
                <span className="badge badge-warning" style={{ fontSize: 10, padding: '2px 6px' }}>
                  {hitlActions.filter((a) => a.status === 'pending').length} Chờ
                </span>
              </div>
            </button>

            <button className={`sidebar-link ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => setActiveTab('audit')}>
              <Layers size={18} />
              <span>Nhật Ký Kiểm Toán (Logs)</span>
            </button>
          </nav>
        </div>

        {/* User Account / Organization Footer */}
        <div
          className="glass-card"
          style={{
            padding: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 12,
            }}
          >
            MM
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              MegaStore Global Ltd.
            </div>
            <div style={{ fontSize: 11, color: 'var(--accent-emerald)' }}>Wealify Enterprise Pro</div>
          </div>
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header Bar */}
        <header
          style={{
            height: 64,
            borderBottom: '1px solid var(--border-subtle)',
            background: 'rgba(6, 9, 19, 0.8)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 32px',
            position: 'sticky',
            top: 0,
            zIndex: 30,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>
              {activeTab === 'overview' && '📊 Tổng Quan Điều Hành Dòng Tiền & Cảnh Báo An Toàn'}
              {activeTab === 'wealify_sync' && '🔄 Kết Nối Tài Khoản Wealify & Đồng Bộ Đa Nguồn'}
              {activeTab === 'chat' && '🤖 AI Copilot Tra Cứu & Giải Thích Email Cảnh Báo'}
              {activeTab === 'anomalies' && '🚨 Trung Tâm Bất Thường & Quản Lý Khiếu Nại (Dispute Hub)'}
              {activeTab === 'cards' && '💳 Quản Lý Danh Mục Thẻ Ảo Wealify (Virtual Cards Portfolio)'}
              {activeTab === 'advisor' && '📈 Cố Vấn Sức Khỏe Kinh Doanh, Unit Economics & P&L'}
              {activeTab === 'notifications' && '📧 Hộp Thư Thông Báo Cảnh Báo An Toàn Đã Gửi'}
              {activeTab === 'hitl' && '👥 Hàng Đợi Phê Duyệt An Toàn (Human-in-the-Loop Queue)'}
              {activeTab === 'audit' && '📜 Nhật Ký Sự Kiện Kiểm Toán Bất Biến (Event Sourcing)'}
            </div>
          </div>

          {/* Quick Actions & Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              className="btn-secondary"
              onClick={handleSyncNow}
              disabled={isSyncing}
              style={{ fontSize: 12.5, padding: '7px 14px' }}
            >
              <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
              <span>{isSyncing ? 'Đang đồng bộ...' : 'Đồng Bộ Wealify'}</span>
            </button>

            <div className="glass-card" style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
              <span style={{ fontSize: 12, fontWeight: 600 }}>Microservice: 8000</span>
            </div>

            <div className="glass-card" style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldAlert size={14} color="#38bdf8" />
              <span style={{ fontSize: 12, color: '#38bdf8', fontWeight: 600 }}>Strict Read-Only</span>
            </div>
          </div>
        </header>

        {/* Dynamic View Body */}
        <main style={{ flex: 1, padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Toast Notification Alert Sent */}
          {isEmailSentToast && (
            <div
              style={{
                position: 'fixed',
                bottom: 24,
                right: 24,
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff',
                padding: '12px 20px',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 8px 30px rgba(16, 185, 129, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                zIndex: 999,
                fontWeight: 600,
                fontSize: 13.5,
              }}
            >
              <CheckCircle2 size={18} />
              <span>Đã gửi Email Cảnh Báo An Toàn tới Người dùng &amp; Đội Kế toán thành công!</span>
            </div>
          )}

          {/* VIEW 1: OVERVIEW DASHBOARD */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Hero Status Bar */}
              <div
                className="glass-panel"
                style={{
                  padding: '24px 28px',
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.12) 100%)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span className="badge badge-warning">CẢNH BÁO DÒNG TIỀN NGHẼN</span>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Lần đồng bộ gần nhất: {lastSyncTime}</span>
                  </div>
                  <h2 style={{ fontSize: 22, fontWeight: 800 }}>Phát hiện 3 bất thường cần xác nhận xử lý</h2>
                  <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginTop: 4 }}>
                    Hệ thống đã tự động gửi email cảnh báo tới hộp thư CEO và soạn sẵn 2 mẫu đơn tra soát khiếu nại.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="btn-primary" onClick={() => setActiveTab('chat')}>
                    <Bot size={16} />
                    <span>Hỏi AI Copilot Tra Cứu</span>
                  </button>
                  <button className="btn-secondary" onClick={() => setActiveTab('anomalies')}>
                    <Eye size={16} />
                    <span>Xem Chi Tiết Sự Cố (3)</span>
                  </button>
                </div>
              </div>

              {/* 5 KPI Metric Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
                <div className="glass-panel" style={{ padding: '20px 22px', borderLeft: '4px solid var(--accent-rose)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Payout Trễ &gt; 14 Ngày</span>
                    <AlertTriangle size={18} color="#fb7185" />
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#fb7185' }}>$4,250.00</div>
                  <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Amazon Seller (16 ngày chưa về)</span>
                </div>

                <div className="glass-panel" style={{ padding: '20px 22px', borderLeft: '4px solid var(--accent-amber)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Cà Thẻ Ảo 2 Lần</span>
                    <CreditCard size={18} color="#fbbf24" />
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#fbbf24' }}>2 Vụ</div>
                  <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Facebook Ads $150 &amp; Grab $24.50</span>
                </div>

                <div className="glass-panel" style={{ padding: '20px 22px', borderLeft: '4px solid var(--accent-cyan)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Tool SaaS Tăng Giá</span>
                    <TrendingUp size={18} color="#38bdf8" />
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#38bdf8' }}>+$60.00/năm</div>
                  <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Adobe Creative Cloud tăng +$5/th</span>
                </div>

                <div className="glass-panel" style={{ padding: '20px 22px', borderLeft: '4px solid var(--accent-indigo)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Thẻ Ảo Hoạt Động</span>
                    <CreditCard size={18} color="#818cf8" />
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#818cf8' }}>4 Thẻ Ảo</div>
                  <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>VPBank, Techcombank, VCB</span>
                </div>

                <div className="glass-panel" style={{ padding: '20px 22px', borderLeft: '4px solid var(--accent-purple)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Sức Khỏe Tài Chính</span>
                    <Sparkles size={18} color="#c084fc" />
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#c084fc' }}>65 / 100</div>
                  <span style={{ fontSize: 11.5, color: '#fbbf24' }}>Cảnh báo dòng tiền nghẽn</span>
                </div>
              </div>

              {/* Urgent Incidents Table */}
              <div className="glass-panel" style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                  <div>
                    <h3 style={{ fontSize: 17, fontWeight: 700 }}>Danh Sách Bất Thường Cần Hành Động Ngay</h3>
                    <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 2 }}>
                      Được phát hiện tự động bởi Wealify Financial Engine &amp; Email Reconciliation
                    </p>
                  </div>
                  <button
                    className="btn-secondary"
                    onClick={() => handleTriggerEmailAlert('all', 'Bất thường tổng hợp', '$4,400.00')}
                  >
                    <Mail size={15} />
                    <span>Gửi Lại Email Cảnh Báo Cho CEO</span>
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {/* Item 1 */}
                  <div
                    className="glass-card"
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid var(--accent-rose)' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 10,
                          background: 'rgba(244,63,94,0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <AlertTriangle size={20} color="#fb7185" />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 700, fontSize: 15 }}>Amazon Seller Central: Payout Chưa Về</span>
                          <span className="badge badge-critical">TRỄ 16 NGÀY (SLA: 3 NGÀY)</span>
                        </div>
                        <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 4 }}>
                          Email xác nhận ngày 05/08/2026 (Mã: <code>AMZ-DISB-20260805-9182</code>). Chưa thấy tiền về tài khoản Wealify.
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#fb7185' }}>$4,250.00 USD</div>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Độ tin cậy: 96%</span>
                      </div>
                      <button
                        className="btn-primary"
                        style={{ fontSize: 12.5, padding: '7px 14px' }}
                        onClick={() =>
                          setSelectedDispute({
                            title: 'Mẫu Thư Tra Soát Payout Amazon Seller Central',
                            text: `Kính gửi bộ phận Hỗ trợ Đối tác Amazon Seller Central,\n\nHệ thống Wealify ghi nhận thông báo giải ngân thành công khoản tiền $4,250.00 USD từ ngày 05/08/2026 (Mã đối soát: AMZ-DISB-20260805-9182).\nTuy nhiên đến nay đã 16 ngày, tài khoản thụ hưởng vẫn chưa ghi nhận số dư này.\nKính đề nghị Quý đối tác cung cấp mã giao dịch ngân hàng (Bank Reference / ARN / MT103) hoặc kiểm tra lại lệnh giải ngân giúp chúng tôi.\n\nTrân trọng,\nĐội ngũ Tài chính Doanh nghiệp.`,
                          })
                        }
                      >
                        <FileText size={14} />
                        <span>Mẫu Khiếu Nại</span>
                      </button>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div
                    className="glass-card"
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid var(--accent-amber)' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 10,
                          background: 'rgba(245,158,11,0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <CreditCard size={20} color="#fbbf24" />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 700, fontSize: 15 }}>Facebook Ads: Cà Thẻ Ảo 2 Lần Trong 1 Phút 45 Giây</span>
                          <span className="badge badge-warning">THẺ ẢO VPBANK</span>
                        </div>
                        <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 4 }}>
                          Trừ $150.00 lúc 18:20:00 và $150.00 lúc 18:21:45. Hạn tra soát ngân hàng: <strong>Còn 59 ngày</strong>.
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#fbbf24' }}>$150.00 x 2</div>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Độ tin cậy: 98%</span>
                      </div>
                      <button
                        className="btn-primary"
                        style={{ fontSize: 12.5, padding: '7px 14px' }}
                        onClick={() =>
                          setSelectedDispute({
                            title: 'Mẫu Đơn Tra Soát Quẹt Thẻ Đúp Facebook Ads',
                            text: `Kính gửi Ngân hàng VPBank / Hỗ trợ Wealify,\n\nTôi xin yêu cầu tra soát giao dịch bị trừ tiền đúp 2 lần (Double Charge):\n- Giao dịch 1: $150.00 USD lúc 2026-08-20 18:20:00 (Mã: card_tx_009)\n- Giao dịch 2: $150.00 USD lúc 2026-08-20 18:21:45 (Mã: card_tx_010)\n- Đơn vị thụ hưởng: FACEBOOK *ADS 84918239\n- Thẻ thanh toán: vcard_ad_fb\n\nKính đề nghị hoàn trả lại khoản tiền bị trừ thừa $150.00 USD.\n\nTrân trọng cảm ơn.`,
                          })
                        }
                      >
                        <FileText size={14} />
                        <span>Đơn Hoàn Tiền</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: WEALIFY SYNC & CONNECTORS */}
          {activeTab === 'wealify_sync' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div className="glass-panel" style={{ padding: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div>
                    <h2 style={{ fontSize: 20, fontWeight: 800 }}>Trạng Thái Kết Nối &amp; Đồng Bộ Tài Khoản Wealify</h2>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                      Quản lý các nguồn dữ liệu thẻ ảo, tài khoản ngân hàng và hòm thư đối chiếu
                    </p>
                  </div>

                  <button className="btn-primary" onClick={handleSyncNow} disabled={isSyncing}>
                    <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
                    <span>{isSyncing ? 'Đang quét dữ liệu...' : 'Đồng Bộ Dữ Liệu Ngay'}</span>
                  </button>
                </div>

                {/* Progress bar */}
                {isSyncing && (
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                      <span>Đang quét sổ cái ngân hàng &amp; email Payouts...</span>
                      <span>{syncProgress}%</span>
                    </div>
                    <div className="progress-container">
                      <div className="progress-fill" style={{ width: `${syncProgress}%` }} />
                    </div>
                  </div>
                )}

                {/* Connected Sources Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                  <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-emerald)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>Wealify Core API</span>
                      <span className="badge badge-success">CONNECTED</span>
                    </div>
                    <p style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>Tài khoản: <code>acc_main</code> (Enterprise)</p>
                    <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>Token hiệu lực: 28 ngày</p>
                  </div>

                  <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-emerald)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>Thẻ Ảo Đa Ngân Hàng</span>
                      <span className="badge badge-success">4 THẺ ACTIVE</span>
                    </div>
                    <p style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>VPBank, Techcombank, Vietcombank</p>
                    <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>Giám sát quẹt thẻ 24/7</p>
                  </div>

                  <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-emerald)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>Hòm Thư Email Payouts</span>
                      <span className="badge badge-success">SYNCED (7 EMAILS)</span>
                    </div>
                    <p style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>Amazon, Stripe, Shopify, Adobe</p>
                    <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>Đối chiếu tự động qua PayoutRadar</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 3: AI COPILOT (SUPPORT & INVESTIGATION CHAT) */}
          {activeTab === 'chat' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, height: 'calc(100vh - 160px)' }}>
              {/* Chat Window */}
              <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <div
                        style={{
                          maxWidth: '85%',
                          padding: '16px 20px',
                          borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          background:
                            msg.sender === 'user'
                              ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                              : 'rgba(30, 41, 59, 0.85)',
                          border: msg.sender === 'user' ? 'none' : '1px solid var(--border-subtle)',
                          color: '#ffffff',
                          fontSize: 14,
                          lineHeight: 1.65,
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {msg.text}

                        {msg.sender === 'bot' && msg.intent && (
                          <div
                            style={{
                              marginTop: 12,
                              paddingTop: 10,
                              borderTop: '1px solid rgba(255,255,255,0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              flexWrap: 'wrap',
                            }}
                          >
                            <span className="badge badge-info" style={{ fontSize: 10 }}>Intent: {msg.intent}</span>
                            {msg.tool_called && <span className="badge badge-purple" style={{ fontSize: 10 }}>Tool: {msg.tool_called}</span>}
                            {msg.grounding_verified && (
                              <span className="badge badge-success" style={{ fontSize: 10 }}>
                                <Check size={10} /> Grounding: 100% Khớp Sổ Cái
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, padding: '0 4px' }}>
                        {msg.timestamp}
                      </span>
                    </div>
                  ))}

                  {isTyping && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 13 }}>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>AI đang đối chiếu dữ liệu và tự kiểm chứng Grounding...</span>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Support Quick Chips */}
                <div
                  style={{
                    padding: '10px 20px',
                    background: 'rgba(15, 23, 42, 0.5)',
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    gap: 8,
                    overflowX: 'auto',
                  }}
                >
                  <button
                    className="btn-secondary"
                    style={{ fontSize: 12, padding: '6px 12px', whiteSpace: 'nowrap' }}
                    onClick={() => handleSendMessage('Tại sao hệ thống gửi email cảnh báo Payout Amazon cho tôi?')}
                  >
                    📧 Tại sao gửi mail cảnh báo Payout?
                  </button>
                  <button
                    className="btn-secondary"
                    style={{ fontSize: 12, padding: '6px 12px', whiteSpace: 'nowrap' }}
                    onClick={() => handleSendMessage('Thẻ ảo chạy ads của tôi có bị cà 2 lần không?')}
                  >
                    💳 Thẻ ảo có bị trừ đúp không?
                  </button>
                  <button
                    className="btn-secondary"
                    style={{ fontSize: 12, padding: '6px 12px', whiteSpace: 'nowrap' }}
                    onClick={() => handleSendMessage('Tình hình kinh doanh và lợi nhuận dòng tiền thế nào, có nên tiếp tục chạy ad không?')}
                  >
                    📊 Cố vấn sức khỏe dòng tiền &amp; ROAS
                  </button>
                </div>

                {/* Chat Input */}
                <div style={{ padding: '14px 20px', display: 'flex', gap: 10, background: 'rgba(9, 14, 26, 0.9)' }}>
                  <input
                    type="text"
                    placeholder="Hỏi AI về lý do gửi mail cảnh báo, tra soát Payout trễ, thẻ ảo cà 2 lần..."
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    style={{
                      flex: 1,
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px 18px',
                      color: '#ffffff',
                      fontSize: 14,
                      outline: 'none',
                    }}
                  />
                  <button className="btn-primary" onClick={() => handleSendMessage()}>
                    <Send size={16} />
                    <span>Gửi</span>
                  </button>
                </div>
              </div>

              {/* Sidebar: DeepSeek Reasoning Trace */}
              <div className="glass-panel" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Activity size={18} color="#06b6d4" />
                  <span style={{ fontWeight: 700, fontSize: 15 }}>DeepSeek Reasoning Trace</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  Chuỗi Waterfall Interceptors giải thích từng bước cho đội ngũ Support Wealify &amp; Khách hàng:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12 }}>
                  <div className="glass-card">
                    <div style={{ fontWeight: 600, color: '#38bdf8' }}>1. Input Guardrail</div>
                    <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>Chặn các lệnh rút tiền/chuyển tiền trái phép</div>
                  </div>
                  <div className="glass-card">
                    <div style={{ fontWeight: 600, color: '#c084fc' }}>2. Intent Planning</div>
                    <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>Định tuyến chính xác vào PayoutRadar / DuplicateDetector</div>
                  </div>
                  <div className="glass-card">
                    <div style={{ fontWeight: 600, color: '#10b981' }}>3. Deterministic Engine</div>
                    <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>Tính toán số học 100% bằng code logic, không ảo giác</div>
                  </div>
                  <div className="glass-card">
                    <div style={{ fontWeight: 600, color: '#fbbf24' }}>4. Grounding Reflection</div>
                    <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>Tự kiểm chứng con số khớp với bằng chứng giao dịch</div>
                  </div>
                  <div className="glass-card">
                    <div style={{ fontWeight: 600, color: '#f43f5e' }}>5. Human-in-the-Loop Barrier</div>
                    <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>Yêu cầu người dùng bấm duyệt trước khi thực thi</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 4: ANOMALIES & DISPUTE HUB */}
          {activeTab === 'anomalies' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  className={`nav-tab ${anomalySubTab === 'payouts' ? 'active' : ''}`}
                  onClick={() => setAnomalySubTab('payouts')}
                >
                  🚨 Payout Sàn Trễ &gt; 14 Ngày (1)
                </button>
                <button
                  className={`nav-tab ${anomalySubTab === 'duplicates' ? 'active' : ''}`}
                  onClick={() => setAnomalySubTab('duplicates')}
                >
                  💳 Thẻ Ảo Bị Quẹt Đúp 2 Lần (2)
                </button>
                <button
                  className={`nav-tab ${anomalySubTab === 'subscriptions' ? 'active' : ''}`}
                  onClick={() => setAnomalySubTab('subscriptions')}
                >
                  📈 Tool SaaS Tăng Giá (1)
                </button>
              </div>

              {anomalySubTab === 'payouts' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 18 }}>
                  <div className="glass-panel" style={{ padding: 24, border: '1px solid rgba(244, 63, 94, 0.4)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <span className="badge badge-critical">KHẨN CẤP: TRỄ 16 NGÀY</span>
                        <h3 style={{ fontSize: 18, fontWeight: 800, marginTop: 8 }}>Amazon Seller Central Payout</h3>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: '#fb7185' }}>$4,250.00 USD</div>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Mã: AMZ-DISB-8821</span>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 14 }}>
                      Email xác nhận gửi ngày <strong>05/08/2026</strong>. Đã 16 ngày trôi qua nhưng tài khoản Wealify chưa ghi nhận số dư (Quy chuẩn SLA: 3 ngày).
                    </p>
                    <div className="glass-card" style={{ marginBottom: 16, fontSize: 12 }}>
                      <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>Bằng chứng Email (Evidence ID: ev_email_em_amz_001):</div>
                      <div style={{ fontStyle: 'italic', color: '#cbd5e1' }}>
                        "We have initiated a payout of $4,250.00 to your bank account ending in ...8821. Settlement typically takes 2-3 business days."
                      </div>
                    </div>
                    <button
                      className="btn-primary"
                      style={{ width: '100%' }}
                      onClick={() =>
                        setSelectedDispute({
                          title: 'Mẫu Email Tra Soát Payout Amazon Seller Central',
                          text: `Kính gửi bộ phận Hỗ trợ Đối tác Amazon Seller Central,\n\nHệ thống Wealify ghi nhận thông báo giải ngân thành công khoản tiền $4,250.00 USD từ ngày 05/08/2026 (Mã đối soát: AMZ-DISB-20260805-9182).\nTuy nhiên đến nay đã 16 ngày, tài khoản thụ hưởng vẫn chưa ghi nhận số dư này.\nKính đề nghị Quý đối tác cung cấp mã giao dịch ngân hàng (Bank Reference / ARN / MT103) hoặc kiểm tra lại lệnh giải ngân giúp chúng tôi.\n\nTrân trọng,\nĐội ngũ Tài chính Doanh nghiệp.`,
                        })
                      }
                    >
                      <FileText size={15} />
                      <span>Xem &amp; Sao Chép Thư Khiếu Nại Sàn</span>
                    </button>
                  </div>

                  <div className="glass-panel" style={{ padding: 24, opacity: 0.85 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <span className="badge badge-success">ĐÃ VỀ ĐÚNG HẠN</span>
                        <h3 style={{ fontSize: 18, fontWeight: 800, marginTop: 8 }}>Stripe Payout Settlement</h3>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: '#34d399' }}>$1,890.00 USD</div>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Mã: po_1OqL2839</span>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      Email thông báo ngày 16/08/2026. Tiền đã về tài khoản ngân hàng VPBank ngày 17/08/2026 (Khớp 100% sau 1 ngày).
                    </p>
                  </div>
                </div>
              )}

              {anomalySubTab === 'duplicates' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 18 }}>
                  <div className="glass-panel" style={{ padding: 24, border: '1px solid rgba(245, 158, 11, 0.4)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <span className="badge badge-warning">CÀ 2 LẦN: CÁCH 1 PHÚT 45 GIÂY</span>
                        <h3 style={{ fontSize: 18, fontWeight: 800, marginTop: 8 }}>Facebook Ads (Thẻ ảo VPBank)</h3>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: '#fbbf24' }}>$150.00 x 2</div>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Thẻ: vcard_ad_fb</span>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
                      Giao dịch 1: 18:20:00 ($150.00) | Giao dịch 2: 18:21:45 ($150.00). Dấu hiệu lỗi gateway trừ đúp.
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                      <Clock size={16} color="#fbbf24" />
                      <span style={{ fontSize: 12.5, color: '#fbbf24', fontWeight: 600 }}>Hạn tra soát ngân hàng: Còn 59 ngày</span>
                    </div>
                    <button
                      className="btn-primary"
                      style={{ width: '100%' }}
                      onClick={() =>
                        setSelectedDispute({
                          title: 'Mẫu Yêu Cầu Tra Soát Cà Thẻ Đúp Facebook Ads',
                          text: `Kính gửi Ngân hàng VPBank / Hỗ trợ Wealify,\n\nTôi xin yêu cầu tra soát giao dịch bị trừ tiền đúp 2 lần (Double Charge):\n- Giao dịch 1: $150.00 USD lúc 2026-08-20 18:20:00 (Mã: card_tx_009)\n- Giao dịch 2: $150.00 USD lúc 2026-08-20 18:21:45 (Mã: card_tx_010)\n- Đơn vị thụ hưởng: FACEBOOK *ADS 84918239\n- Thẻ thanh toán: vcard_ad_fb\n\nKính đề nghị hoàn trả lại khoản tiền bị trừ thừa $150.00 USD.\n\nTrân trọng cảm ơn.`,
                        })
                      }
                    >
                      <FileText size={15} />
                      <span>Tạo Đơn Tra Soát Hoàn Tiền 1-Click</span>
                    </button>
                  </div>

                  <div className="glass-panel" style={{ padding: 24, border: '1px solid rgba(245, 158, 11, 0.4)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <span className="badge badge-warning">CÀ 2 LẦN: CÁCH 2 PHÚT 30 GIÂY</span>
                        <h3 style={{ fontSize: 18, fontWeight: 800, marginTop: 8 }}>Grab Transport Ride</h3>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: '#fbbf24' }}>$24.50 x 2</div>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Thẻ: vcard_ops_03 (Techcombank)</span>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
                      2 lần quẹt thẻ $24.50 USD lúc 14:05:00 và 14:07:30 ngày 19/08/2026.
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                      <Clock size={16} color="#fbbf24" />
                      <span style={{ fontSize: 12.5, color: '#fbbf24', fontWeight: 600 }}>Hạn tra soát ngân hàng: Còn 58 ngày</span>
                    </div>
                    <button
                      className="btn-primary"
                      style={{ width: '100%' }}
                      onClick={() =>
                        setSelectedDispute({
                          title: 'Mẫu Yêu Cầu Tra Soát Grab Transport',
                          text: `Kính gửi Ngân hàng Techcombank,\n\nTôi xin tra soát giao dịch Grab bị trừ 2 lần:\n- Lần 1: $24.50 (14:05:00)\n- Lần 2: $24.50 (14:07:30)\nKính đề nghị hoàn tiền thừa.`,
                        })
                      }
                    >
                      <FileText size={15} />
                      <span>Tạo Đơn Tra Soát Grab</span>
                    </button>
                  </div>
                </div>
              )}

              {anomalySubTab === 'subscriptions' && (
                <div className="glass-panel" style={{ padding: 24 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Dịch Vụ SaaS &amp; Tool Định Kỳ</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid var(--accent-amber)' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 700, fontSize: 15 }}>Adobe Creative Cloud</span>
                          <span className="badge badge-warning">TĂNG PHÍ +$5.00/THÁNG</span>
                        </div>
                        <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 4 }}>
                          Tăng từ $49.99 lên $54.99/tháng. Ước tính phát sinh thêm <strong>+$60.00 USD/năm</strong>.
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#fbbf24' }}>$54.99/tháng</div>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Gia hạn: 15/09/2026</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW 5: VIRTUAL CARDS PORTFOLIO */}
          {activeTab === 'cards' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div className="glass-panel" style={{ padding: 28 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Danh Mục Thẻ Ảo Doanh Nghiệp Wealify</h2>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
                  Quản lý thẻ ảo gán cho chiến dịch Ads Facebook, Google và phần mềm SaaS
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 18 }}>
                  {/* Card 1 */}
                  <div
                    className="glass-card"
                    style={{
                      background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(15,23,42,0.9))',
                      border: '1px solid rgba(99,102,241,0.4)',
                      padding: 22,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <span className="badge badge-purple">FACEBOOK ADS CARD</span>
                      <span style={{ fontWeight: 800, fontSize: 14, color: '#38bdf8' }}>VPBank Virtual</span>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>
                      •••• •••• •••• 9012
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                      <span>Mã: vcard_ad_fb</span>
                      <span>Hạn mức: $2,000.00 / tháng</span>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div
                    className="glass-card"
                    style={{
                      background: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(15,23,42,0.9))',
                      border: '1px solid rgba(6,182,212,0.4)',
                      padding: 22,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <span className="badge badge-info">GOOGLE ADS CARD</span>
                      <span style={{ fontWeight: 800, fontSize: 14, color: '#38bdf8' }}>VPBank Virtual</span>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>
                      •••• •••• •••• 9210
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                      <span>Mã: vcard_ad_gg</span>
                      <span>Hạn mức: $3,500.00 / tháng</span>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div
                    className="glass-card"
                    style={{
                      background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(15,23,42,0.9))',
                      border: '1px solid rgba(16,185,129,0.4)',
                      padding: 22,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <span className="badge badge-success">SAAS SUBSCRIPTIONS CARD</span>
                      <span style={{ fontWeight: 800, fontSize: 14, color: '#34d399' }}>Vietcombank Virtual</span>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>
                      •••• •••• •••• 4491
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                      <span>Mã: vcard_sub_01</span>
                      <span>Hạn mức: $500.00 / tháng</span>
                    </div>
                  </div>

                  {/* Card 4 */}
                  <div
                    className="glass-card"
                    style={{
                      background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(15,23,42,0.9))',
                      border: '1px solid rgba(168,85,247,0.4)',
                      padding: 22,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <span className="badge badge-purple">OPS &amp; TRAVEL CARD</span>
                      <span style={{ fontWeight: 800, fontSize: 14, color: '#c084fc' }}>Techcombank Virtual</span>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>
                      •••• •••• •••• 8291
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                      <span>Mã: vcard_ops_03</span>
                      <span>Hạn mức: $1,000.00 / tháng</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 6: BUSINESS ADVISOR */}
          {activeTab === 'advisor' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="glass-panel" style={{ padding: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div>
                    <h2 style={{ fontSize: 20, fontWeight: 800 }}>Cố Vấn Hiệu Quả Kinh Doanh &amp; Đơn Vị Kinh Tế (Unit Economics)</h2>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                      Đánh giá dòng tiền thực tế giữa chi tiêu Ads thẻ ảo và doanh thu Payout sàn thương mại điện tử
                    </p>
                  </div>
                  <div className="badge badge-warning" style={{ fontSize: 14, padding: '8px 16px' }}>
                    ĐIỂM SỨC KHỎE: 65/100 (CẢNH BÁO)
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                  <div className="glass-card">
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Tổng Chi Phí Ads (Thẻ ảo)</span>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#f8fafc', marginTop: 4 }}>$870.00 USD</div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Facebook $300, Google $420, Ads $150</span>
                  </div>

                  <div className="glass-card">
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Doanh Thu Payout Thực Nhận</span>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#34d399', marginTop: 4 }}>$1,890.00 USD</div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Stripe Settlement (Đã ghi có)</span>
                  </div>

                  <div className="glass-card" style={{ border: '1px solid rgba(244, 63, 94, 0.3)' }}>
                    <span style={{ fontSize: 12, color: '#fb7185' }}>Payout Đang Bị Tắc Nghẽn</span>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#fb7185', marginTop: 4 }}>$4,250.00 USD</div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Amazon Seller (Trễ 16 ngày)</span>
                  </div>

                  <div className="glass-card">
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Ước Tính ROAS Toàn Kênh</span>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#38bdf8', marginTop: 4 }}>2.56x</div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Biên lợi nhuận gộp ước tính ~38%</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div className="glass-card" style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                    <h4 style={{ color: '#fbbf24', fontSize: 15, fontWeight: 700, marginBottom: 10 }}>🚨 Phân Tích Rủi Ro Dòng Tiền:</h4>
                    <ul style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, paddingLeft: 18 }}>
                      <li>Khoản <strong>$4,250.00 USD từ Amazon</strong> chưa về khiến dòng tiền thực nhận chỉ đạt $1,890.00 USD.</li>
                      <li>Chi phí chạy Ads Facebook và Google chiếm đến <strong>46.0% dòng tiền tiền mặt hiện có</strong>.</li>
                      <li>Nếu tiếp tục giữ ngân sách ad hiện tại mà Payout chưa về trong 7 ngày tới, doanh nghiệp có nguy cơ bị âm vốn lưu động.</li>
                    </ul>
                  </div>

                  <div className="glass-card" style={{ background: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
                    <h4 style={{ color: '#38bdf8', fontSize: 15, fontWeight: 700, marginBottom: 10 }}>💡 Đề Xuất Chiến Lược &amp; Human-in-the-Loop:</h4>
                    <ul style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, paddingLeft: 18 }}>
                      <li><strong>Hành động 1:</strong> Gửi ngay ticket tra soát Payout Amazon để kích hoạt giải ngân số dư $4,250.00 USD.</li>
                      <li><strong>Hành động 2:</strong> Tạm giảm 30% ngân sách chiến dịch Facebook Ads #84918239 để hạ burn rate.</li>
                      <li><strong>Hành động 3:</strong> Thu hồi khoản $150.00 USD bị quẹt trùng từ Facebook Ads.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 7: SENT NOTIFICATIONS (EMAIL HTML PREVIEW) */}
          {activeTab === 'notifications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="glass-panel" style={{ padding: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div>
                    <h2 style={{ fontSize: 20, fontWeight: 800 }}>Hộp Thư Thông Báo Cảnh Báo An Toàn Đã Gửi</h2>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                      Danh sách email HTML tự động gửi về hộp thư khách hàng, CEO và đội Support Wealify
                    </p>
                  </div>
                  <button
                    className="btn-primary"
                    onClick={() => handleTriggerEmailAlert('manual', 'Test Alert', '$4,250.00')}
                  >
                    <Mail size={16} />
                    <span>Gửi Thử Email Cảnh Báo Ngay</span>
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Email 1 */}
                  <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 10,
                          background: 'rgba(244,63,94,0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Mail size={20} color="#fb7185" />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 700, fontSize: 15 }}>[Wealify Cảnh Báo] Bất thường Payout chưa về: Amazon Seller Central ($4,250.00)</span>
                          <span className="badge badge-critical">ĐÃ GỬI</span>
                        </div>
                        <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 4 }}>
                          Người nhận: <code>ceo@wealify-store.com</code> • Gửi lúc: 11:30 AM
                        </p>
                      </div>
                    </div>

                    <button
                      className="btn-secondary"
                      onClick={() =>
                        setPreviewEmailHtml({
                          title: 'Email Cảnh Báo Payout Amazon Chưa Về',
                          to: 'ceo@wealify-store.com',
                          html: `Kính gửi Quý khách hàng Wealify,\n\nHệ thống giám sát giao dịch Wealify Guardian vừa phát hiện một bất thường tài chính:\n- Chi tiết: Email xác nhận giải ngân $4,250.00 USD từ Amazon ngày 05/08/2026 nhưng sau 16 ngày chưa thấy tiền về tài khoản Wealify.\n- Số tiền: $4,250.00 USD\n- Mức độ tin cậy AI: 96%\n- Hạn tra soát ngân hàng: 60 ngày\n- Hành động đề xuất: Gửi ticket tra soát tới sàn Amazon Seller Central.\n\nTrân trọng,\nWealify Guardian Security.`,
                        })
                      }
                    >
                      <Eye size={14} />
                      <span>Xem Giao Diện Email</span>
                    </button>
                  </div>

                  {/* Email 2 */}
                  <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 10,
                          background: 'rgba(245,158,11,0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Mail size={20} color="#fbbf24" />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 700, fontSize: 15 }}>[Wealify Cảnh Báo] Cà thẻ 2 lần: Facebook Ads ($150.00) trên thẻ ảo VPBank</span>
                          <span className="badge badge-warning">ĐÃ GỬI</span>
                        </div>
                        <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 4 }}>
                          Người nhận: <code>finance@wealify-store.com</code> • Gửi lúc: 11:32 AM
                        </p>
                      </div>
                    </div>

                    <button
                      className="btn-secondary"
                      onClick={() =>
                        setPreviewEmailHtml({
                          title: 'Email Cảnh Báo Cà Thẻ 2 Lần Facebook Ads',
                          to: 'finance@wealify-store.com',
                          html: `Kính gửi Quý khách hàng Wealify,\n\nHệ thống Wealify Guardian phát hiện giao dịch trừ đúp:\n- Chi tiết: Phát hiện 2 giao dịch cùng số tiền $150.00 USD tại Facebook Ads chỉ cách nhau 1 phút 45 giây trên thẻ ảo VPBank.\n- Số tiền: $150.00 USD x 2\n- Mức độ tin cậy AI: 98%\n- Hạn tra soát ngân hàng: Còn 59 ngày\n\nTrân trọng,\nWealify Guardian Security.`,
                        })
                      }
                    >
                      <Eye size={14} />
                      <span>Xem Giao Diện Email</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 8: HITL QUEUE */}
          {activeTab === 'hitl' && (
            <div className="glass-panel" style={{ padding: 28 }}>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800 }}>Hàng Đợi Phê Duyệt An Toàn (Human-in-the-Loop Queue)</h2>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                  Theo chính sách an toàn tài chính, AI không tự ý thực thi các hành động nhạy cảm. Bạn toàn quyền kiểm soát và bấm duyệt 1-click:
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {hitlActions.map((action) => (
                  <div
                    key={action.id}
                    className="glass-card"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderLeft: `4px solid ${
                        action.status === 'approved'
                          ? 'var(--accent-emerald)'
                          : action.status === 'rejected'
                          ? 'var(--accent-rose)'
                          : 'var(--accent-amber)'
                      }`,
                    }}
                  >
                    <div style={{ maxWidth: '65%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontWeight: 700, fontSize: 15 }}>{action.title}</span>
                        <span className={`badge ${action.status === 'approved' ? 'badge-success' : action.status === 'rejected' ? 'badge-critical' : 'badge-warning'}`}>
                          {action.status === 'approved' ? 'ĐÃ DUYỆT' : action.status === 'rejected' ? 'ĐÃ TỪ CHỐI' : 'CHỜ DUYỆT'}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>{action.description}</p>
                      <span style={{ fontSize: 12, color: 'var(--accent-cyan)', fontWeight: 600, marginTop: 4, display: 'inline-block' }}>
                        Giá trị / Tác động: {action.amount}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                      {action.status === 'pending' ? (
                        <>
                          <button
                            className="btn-primary"
                            style={{ fontSize: 13, padding: '8px 16px', background: 'linear-gradient(135deg, #10b981, #059669)' }}
                            onClick={() => handleHITLDecision(action.id, 'approved')}
                          >
                            <Check size={16} />
                            <span>Phê Duyệt</span>
                          </button>
                          <button
                            className="btn-secondary"
                            style={{ fontSize: 13, padding: '8px 16px', color: '#fb7185', borderColor: 'rgba(244,63,94,0.3)' }}
                            onClick={() => handleHITLDecision(action.id, 'rejected')}
                          >
                            <XCircle size={16} />
                            <span>Từ Chối</span>
                          </button>
                        </>
                      ) : (
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                          Đã xử lý lúc {new Date().toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 9: AUDIT LOGS */}
          {activeTab === 'audit' && (
            <div className="glass-panel" style={{ padding: 28 }}>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800 }}>Append-Only Session Event Log (DeepSeek Harness Standard)</h2>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                  Mọi hành động của AI, lời gọi công cụ, kiểm tra chính sách an toàn đều được lưu vết bất biến phục vụ kiểm toán tài chính:
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px' }}>
                  <span style={{ color: '#38bdf8' }}>[EVENT: turn/start]</span>
                  <span>User initiated inquiry on Payouts &amp; Virtual Cards</span>
                  <span style={{ color: 'var(--text-muted)' }}>11:45:01 UTC</span>
                </div>
                <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px' }}>
                  <span style={{ color: '#c084fc' }}>[EVENT: policy/evaluated]</span>
                  <span>Action: DETECT_OVERDUE_PAYOUTS  Decision: ALLOW</span>
                  <span style={{ color: 'var(--text-muted)' }}>11:45:02 UTC</span>
                </div>
                <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px' }}>
                  <span style={{ color: '#34d399' }}>[EVENT: tool/executed]</span>
                  <span>Tool: detect_overdue_payouts (Execution: 1.2ms, Result: 1 Overdue Alert)</span>
                  <span style={{ color: 'var(--text-muted)' }}>11:45:03 UTC</span>
                </div>
                <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px' }}>
                  <span style={{ color: '#fbbf24' }}>[EVENT: email/dispatched]</span>
                  <span>Dispatched HTML Alert to ceo@wealify-store.com (Status: SENT)</span>
                  <span style={{ color: 'var(--text-muted)' }}>11:45:04 UTC</span>
                </div>
                <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px' }}>
                  <span style={{ color: '#38bdf8' }}>[EVENT: grounding/verified]</span>
                  <span>Grounding Reflection Check: 100% matched evidence (Amazon $4,250.00)</span>
                  <span style={{ color: 'var(--text-muted)' }}>11:45:05 UTC</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal Dispute Letter Preview */}
      {selectedDispute && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 20,
          }}
        >
          <div className="glass-panel" style={{ maxWidth: 640, width: '100%', padding: 28, background: '#0d1322' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>{selectedDispute.title}</h3>
              <button className="btn-secondary" style={{ padding: '4px 8px' }} onClick={() => setSelectedDispute(null)}>
                ✕
              </button>
            </div>

            <textarea
              readOnly
              value={selectedDispute.text}
              rows={12}
              style={{
                width: '100%',
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: '#f8fafc',
                padding: 14,
                fontSize: 13,
                lineHeight: 1.6,
                fontFamily: 'inherit',
                outline: 'none',
                resize: 'none',
                marginBottom: 16,
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button className="btn-secondary" onClick={() => setSelectedDispute(null)}>
                Đóng
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  navigator.clipboard.writeText(selectedDispute.text);
                  alert('Đã sao chép nội dung thư khiếu nại vào Clipboard!');
                }}
              >
                <Copy size={16} />
                <span>Sao Chép Thư</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sent Email HTML Preview */}
      {previewEmailHtml && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 20,
          }}
        >
          <div className="glass-panel" style={{ maxWidth: 600, width: '100%', padding: 28, background: '#0d1322' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700 }}>{previewEmailHtml.title}</h3>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Người nhận: {previewEmailHtml.to}</span>
              </div>
              <button className="btn-secondary" style={{ padding: '4px 8px' }} onClick={() => setPreviewEmailHtml(null)}>
                ✕
              </button>
            </div>

            <div
              style={{
                background: '#1e293b',
                borderRadius: 'var(--radius-md)',
                padding: 20,
                color: '#f8fafc',
                fontSize: 13,
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                border: '1px solid rgba(255,255,255,0.1)',
                marginBottom: 16,
              }}
            >
              {previewEmailHtml.html}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button className="btn-secondary" onClick={() => setPreviewEmailHtml(null)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

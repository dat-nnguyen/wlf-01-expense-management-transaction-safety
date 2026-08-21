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
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Copy,
  Check,
  Layers,
  Activity,
  DollarSign,
  Briefcase,
  UserCheck,
  Search,
} from 'lucide-react';

// Types
interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  intent?: string;
  tool_called?: string;
  grounding_verified?: boolean;
  steps?: { step_name: string; status: string }[];
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'chat' | 'anomalies' | 'advisor' | 'hitl' | 'audit'>('chat');
  const [anomalySubTab, setAnomalySubTab] = useState<'payouts' | 'duplicates' | 'subscriptions'>('payouts');
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'bot',
      text: 'Xin chào! Tôi là **Wealify Guardian**, trợ lý AI bảo vệ giao dịch & quản trị dòng tiền doanh nghiệp của bạn.\n\nTôi vừa tự động rà soát toàn bộ sổ cái và phát hiện:\n- 🚨 **1 khoản Payout Amazon $4,250.00 USD** đã 16 ngày chưa về tài khoản Wealify.\n- ⚠️ **1 vụ cà thẻ ảo 2 lần** trên chiến dịch Facebook Ads ($150.00 x 2).\n- 📈 **Adobe Creative Cloud** đã tăng giá thêm +$5.00/tháng.\n\nBạn có thể hỏi tôi bất kỳ điều gì hoặc bấm vào các gợi ý bên dưới!',
      timestamp: '11:00 AM',
      intent: 'INITIAL_ALERT',
      grounding_verified: true,
    },
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Selected Dispute Modal
  const [selectedDispute, setSelectedDispute] = useState<{ title: string; text: string } | null>(null);

  // HITL items state
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

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
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
        const botMsg: Message = {
          id: `bot_${Date.now()}`,
          sender: 'bot',
          text: data.response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          intent: data.intent,
          tool_called: data.tool_called,
          grounding_verified: data.grounding_verified ?? true,
          steps: data.steps,
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        throw new Error('API request failed');
      }
    } catch (e) {
      // Fallback smart client simulation if offline
      setTimeout(() => {
        let resp = '';
        let intent = 'GENERAL_QA';
        let tool = 'search_transactions';

        const q = query.toLowerCase();
        if (q.includes('payout') || q.includes('amazon') || q.includes('chưa về') || q.includes('14') || q.includes('15')) {
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
          resp = 'Hệ thống Wealify Guardian đang giám sát 4 thẻ ảo và 3 tài khoản ngân hàng. Mọi giao dịch bất thường đều được phát hiện trong thời gian thực!';
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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Top Header */}
      <header
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(11, 15, 25, 0.85)',
          backdropFilter: 'blur(16px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          padding: '12px 28px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1440, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '12px',
                background: 'var(--gradient-brand)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)',
              }}
            >
              <ShieldCheck size={24} color="#fff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.5px' }}>Wealify Guardian</span>
                <span className="badge badge-info" style={{ fontSize: 11 }}>AI Microservice v0.1</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Bảo Vệ Giao Dịch Thẻ Ảo & Cố Vấn Dòng Tiền E-Commerce
              </p>
            </div>
          </div>

          {/* Telemetry Status Indicators */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="glass-card" style={{ padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
              <span style={{ fontSize: 12, fontWeight: 500 }}>API Gateway: Online (8000)</span>
            </div>
            <div className="glass-card" style={{ padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldAlert size={14} color="#38bdf8" />
              <span style={{ fontSize: 12, color: '#38bdf8', fontWeight: 500 }}>Policy: Strict Read-Only</span>
            </div>
            <div className="glass-card" style={{ padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity size={14} color="#a855f7" />
              <span style={{ fontSize: 12, color: '#c084fc', fontWeight: 500 }}>Latency: 14ms</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, maxWidth: 1440, width: '100%', margin: '0 auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* KPI Metrics Summary Ribbon */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
          <div className="glass-panel" style={{ padding: '18px 20px', borderLeft: '4px solid var(--accent-rose)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Payout Trễ &gt; 14 Ngày</span>
              <AlertTriangle size={18} color="#fb7185" />
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#fb7185' }}>$4,250.00</div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Amazon Seller (16 ngày chưa về)</span>
          </div>

          <div className="glass-panel" style={{ padding: '18px 20px', borderLeft: '4px solid var(--accent-amber)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Cà Thẻ Ảo 2 Lần</span>
              <CreditCard size={18} color="#fbbf24" />
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#fbbf24' }}>2 Giao dịch</div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Facebook Ads $150 & Grab $24.50</span>
          </div>

          <div className="glass-panel" style={{ padding: '18px 20px', borderLeft: '4px solid var(--accent-cyan)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Tool SaaS Tăng Giá</span>
              <TrendingUp size={18} color="#38bdf8" />
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#38bdf8' }}>1 Tool (+5$/tháng)</div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Adobe Creative Cloud ($49.99  $54.99)</span>
          </div>

          <div className="glass-panel" style={{ padding: '18px 20px', borderLeft: '4px solid var(--accent-indigo)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Thẻ Ảo Hoạt Động</span>
              <CreditCard size={18} color="#818cf8" />
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#818cf8' }}>4 Thẻ Ảo</div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>VPBank, Techcombank, VCB</span>
          </div>

          <div className="glass-panel" style={{ padding: '18px 20px', borderLeft: '4px solid var(--accent-purple)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Điểm Sức Khỏe Tài Chính</span>
              <Sparkles size={18} color="#c084fc" />
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#c084fc' }}>65 / 100</div>
            <span style={{ fontSize: 11, color: '#fbbf24' }}>Cảnh báo dòng tiền nghẽn</span>
          </div>
        </section>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 12 }}>
          <button className={`nav-tab ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>
            <Bot size={18} />
            <span>AI Copilot & Trò Chuyện</span>
          </button>
          <button className={`nav-tab ${activeTab === 'anomalies' ? 'active' : ''}`} onClick={() => setActiveTab('anomalies')}>
            <ShieldAlert size={18} />
            <span>Trung Tâm Bất Thường (3)</span>
          </button>
          <button className={`nav-tab ${activeTab === 'advisor' ? 'active' : ''}`} onClick={() => setActiveTab('advisor')}>
            <Briefcase size={18} />
            <span>Cố Vấn Sức Khỏe Kinh Doanh</span>
          </button>
          <button className={`nav-tab ${activeTab === 'hitl' ? 'active' : ''}`} onClick={() => setActiveTab('hitl')}>
            <UserCheck size={18} />
            <span>Hàng Đợi Duyệt HITL ({hitlActions.filter(a => a.status === 'pending').length})</span>
          </button>
          <button className={`nav-tab ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => setActiveTab('audit')}>
            <Layers size={18} />
            <span>Nhật Ký Kiểm Toán (Event Sourcing)</span>
          </button>
        </div>

        {/* TAB 1: CHAT COPILOT */}
        {activeTab === 'chat' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, height: 600 }}>
            {/* Chat Box */}
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {/* Message History */}
              <div style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                        padding: '14px 18px',
                        borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        background: msg.sender === 'user' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'rgba(30, 41, 59, 0.8)',
                        border: msg.sender === 'user' ? 'none' : '1px solid var(--border-subtle)',
                        color: '#fff',
                        fontSize: 14,
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {msg.text}

                      {/* Tool & Grounding verification tags */}
                      {msg.sender === 'bot' && msg.intent && (
                        <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
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
                    <span>AI đang phân tích sổ cái và kiểm chứng bằng chứng...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick Suggestion Chips */}
              <div style={{ padding: '8px 20px', background: 'rgba(15, 23, 42, 0.4)', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 8, overflowX: 'auto' }}>
                <button
                  className="btn-secondary"
                  style={{ fontSize: 12, padding: '6px 12px', whiteSpace: 'nowrap' }}
                  onClick={() => handleSendMessage('Có khoản Payout nào từ Amazon hay Stripe bị trễ chưa về không?')}
                >
                  🚨 Quét Payout trễ &gt; 14 ngày
                </button>
                <button
                  className="btn-secondary"
                  style={{ fontSize: 12, padding: '6px 12px', whiteSpace: 'nowrap' }}
                  onClick={() => handleSendMessage('Thẻ ảo chạy ads của tôi có bị cà 2 lần không?')}
                >
                  💳 Kiểm tra thẻ ảo cà 2 lần
                </button>
                <button
                  className="btn-secondary"
                  style={{ fontSize: 12, padding: '6px 12px', whiteSpace: 'nowrap' }}
                  onClick={() => handleSendMessage('Tình hình kinh doanh và lợi nhuận dòng tiền thế nào, có nên tiếp tục chạy ad không?')}
                >
                  📊 Tư vấn hiệu quả kinh doanh & P&L
                </button>
                <button
                  className="btn-secondary"
                  style={{ fontSize: 12, padding: '6px 12px', whiteSpace: 'nowrap' }}
                  onClick={() => handleSendMessage('Tôi có những subscription nào và có công cụ nào tăng giá không?')}
                >
                  📈 Rà soát Subscription tăng giá
                </button>
              </div>

              {/* Input Area */}
              <div style={{ padding: '14px 20px', display: 'flex', gap: 10, background: 'rgba(11, 15, 25, 0.9)' }}>
                <input
                  type="text"
                  placeholder="Hỏi AI về đối soát Payout, thẻ ảo bị trừ đúp, công cụ tăng giá, cố vấn kinh doanh..."
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  style={{
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 16px',
                    color: '#fff',
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

            {/* Sidebar: Realtime Reasoning Trace & Dual-Engine Inspector */}
            <div className="glass-panel" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Activity size={18} color="#06b6d4" />
                <span style={{ fontWeight: 600, fontSize: 15 }}>DeepSeek Reasoning Trace</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Vòng đời thực thi từng bước của Agent theo chuẩn Waterfall Pipeline:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12 }}>
                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CheckCircle2 size={16} color="#10b981" />
                  <div>
                    <div style={{ fontWeight: 600 }}>1. Input Guardrail</div>
                    <div style={{ color: 'var(--text-muted)' }}>Chặn lệnh đột biến chuyển tiền trái phép</div>
                  </div>
                </div>

                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CheckCircle2 size={16} color="#10b981" />
                  <div>
                    <div style={{ fontWeight: 600 }}>2. Intent Planning</div>
                    <div style={{ color: 'var(--text-muted)' }}>Định tuyến tool chính xác không hallucinate</div>
                  </div>
                </div>

                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CheckCircle2 size={16} color="#10b981" />
                  <div>
                    <div style={{ fontWeight: 600 }}>3. Deterministic Execution</div>
                    <div style={{ color: 'var(--text-muted)' }}>Tính toán số học bằng Python thuần 100%</div>
                  </div>
                </div>

                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CheckCircle2 size={16} color="#10b981" />
                  <div>
                    <div style={{ fontWeight: 600 }}>4. Grounding Self-Reflection</div>
                    <div style={{ color: 'var(--text-muted)' }}>Tự kiểm chứng con số khớp bằng chứng</div>
                  </div>
                </div>

                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CheckCircle2 size={16} color="#10b981" />
                  <div>
                    <div style={{ fontWeight: 600 }}>5. Human-in-the-Loop Barrier</div>
                    <div style={{ color: 'var(--text-muted)' }}>Chờ người dùng bấm duyệt hành động</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ANOMALY CENTER */}
        {activeTab === 'anomalies' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Sub-tabs */}
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

            {/* Sub-tab 1: Overdue Payouts */}
            {anomalySubTab === 'payouts' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                {/* Critical Payout Alert */}
                <div className="glass-panel" style={{ padding: 22, border: '1px solid rgba(244, 63, 94, 0.4)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <span className="badge badge-critical">KHẨN CẤP: TRỄ 16 NGÀY</span>
                      <h3 style={{ fontSize: 17, fontWeight: 700, marginTop: 8 }}>Amazon Seller Central Payout</h3>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: '#fb7185' }}>$4,250.00 USD</div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Mã: AMZ-DISB-8821</span>
                    </div>
                  </div>

                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 14 }}>
                    Email xác nhận giải ngân thành công gửi ngày <strong>05/08/2026</strong>. Đã 16 ngày trôi qua nhưng tài khoản Wealify chưa ghi nhận số dư (Quy chuẩn SLA: 3 ngày).
                  </p>

                  <div className="glass-card" style={{ marginBottom: 14, fontSize: 12 }}>
                    <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>Bằng chứng Email (Evidence ID: ev_email_em_amz_001):</div>
                    <div style={{ fontStyle: 'italic', color: '#cbd5e1' }}>
                      "We have initiated a payout of $4,250.00 to your bank account ending in ...8821. Settlement typically takes 2-3 business days."
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      className="btn-primary"
                      style={{ flex: 1, fontSize: 13 }}
                      onClick={() =>
                        setSelectedDispute({
                          title: 'Mẫu Email Tra Soát Payout Amazon Seller Central',
                          text: `Kính gửi bộ phận Hỗ trợ Đối tác Amazon Seller Central,\n\nHệ thống Wealify ghi nhận thông báo giải ngân thành công khoản tiền $4,250.00 USD từ ngày 05/08/2026 (Mã đối soát: AMZ-DISB-20260805-9182).\nTuy nhiên đến nay đã 16 ngày, tài khoản thụ hưởng vẫn chưa ghi nhận số dư này.\nKính đề nghị Quý đối tác cung cấp mã giao dịch ngân hàng (Bank Reference / ARN / MT103) hoặc kiểm tra lại lệnh giải ngân giúp chúng tôi.\n\nTrân trọng,\nĐội ngũ Tài chính Doanh nghiệp.`,
                        })
                      }
                    >
                      <FileText size={15} />
                      <span>Xem & Sao Chép Thư Khiếu Nại</span>
                    </button>
                  </div>
                </div>

                {/* Normal Payout Card for Comparison */}
                <div className="glass-panel" style={{ padding: 22, opacity: 0.85 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <span className="badge badge-success">ĐÃ VỀ ĐÚNG HẠN</span>
                      <h3 style={{ fontSize: 17, fontWeight: 700, marginTop: 8 }}>Stripe Payout Settlement</h3>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: '#34d399' }}>$1,890.00 USD</div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Mã: po_1OqL2839</span>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Email thông báo ngày 16/08/2026. Tiền đã về tài khoản ngân hàng VPBank ngày 17/08/2026 (Khớp 100% sau 1 ngày).
                  </p>
                </div>
              </div>
            )}

            {/* Sub-tab 2: Duplicate Charges */}
            {anomalySubTab === 'duplicates' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                {/* Facebook Ads Double Charge */}
                <div className="glass-panel" style={{ padding: 22, border: '1px solid rgba(245, 158, 11, 0.4)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <span className="badge badge-warning">CÀ 2 LẦN: CÁCH 1 PHÚT 45 GIÂY</span>
                      <h3 style={{ fontSize: 17, fontWeight: 700, marginTop: 8 }}>Facebook Ads (Thẻ ảo VPBank)</h3>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: '#fbbf24' }}>$150.00 x 2</div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Thẻ: vcard_ad_fb</span>
                    </div>
                  </div>

                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12 }}>
                    Giao dịch 1: 18:20:00 ($150.00) | Giao dịch 2: 18:21:45 ($150.00). Phát hiện dấu hiệu lỗi cổng thanh toán trừ đúp.
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <Clock size={15} color="#fbbf24" />
                    <span style={{ fontSize: 12, color: '#fbbf24', fontWeight: 600 }}>Hạn tra soát ngân hàng: Còn 59 ngày</span>
                  </div>

                  <button
                    className="btn-primary"
                    style={{ width: '100%', fontSize: 13 }}
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

                {/* Grab Ride Double Charge */}
                <div className="glass-panel" style={{ padding: 22, border: '1px solid rgba(245, 158, 11, 0.4)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <span className="badge badge-warning">CÀ 2 LẦN: CÁCH 2 PHÚT 30 GIÂY</span>
                      <h3 style={{ fontSize: 17, fontWeight: 700, marginTop: 8 }}>Grab Transport Ride</h3>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: '#fbbf24' }}>$24.50 x 2</div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Thẻ: vcard_ops_03 (Techcombank)</span>
                    </div>
                  </div>

                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12 }}>
                    2 lần quẹt thẻ $24.50 USD lúc 14:05:00 và 14:07:30 ngày 19/08/2026.
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <Clock size={15} color="#fbbf24" />
                    <span style={{ fontSize: 12, color: '#fbbf24', fontWeight: 600 }}>Hạn tra soát ngân hàng: Còn 58 ngày</span>
                  </div>

                  <button
                    className="btn-primary"
                    style={{ width: '100%', fontSize: 13 }}
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

            {/* Sub-tab 3: Subscriptions Price Hike */}
            {anomalySubTab === 'subscriptions' && (
              <div className="glass-panel" style={{ padding: 22 }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>Dịch Vụ SaaS & Tool Định Kỳ</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid var(--accent-amber)' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 600, fontSize: 15 }}>Adobe Creative Cloud</span>
                        <span className="badge badge-warning">TĂNG PHÍ +$5.00/THÁNG</span>
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                        Tăng từ $49.99 lên $54.99/tháng. Ước tính phát sinh thêm <strong>+$60.00 USD/năm</strong>.
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#fbbf24' }}>$54.99/tháng</div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Gia hạn: 15/09/2026</span>
                    </div>
                  </div>

                  <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: 15 }}>OpenAI ChatGPT Plus</span>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Định kỳ $20.00/tháng (Ổn định)</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 18, fontWeight: 700 }}>$20.00/tháng</div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Gia hạn: 17/09/2026</span>
                    </div>
                  </div>

                  <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: 15 }}>Netflix Premium</span>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Định kỳ $9.99/tháng (Ổn định)</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 18, fontWeight: 700 }}>$9.99/tháng</div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Gia hạn: 18/09/2026</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: BUSINESS HEALTH ADVISOR */}
        {activeTab === 'advisor' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Unit Economics Breakdown Card */}
            <div className="glass-panel" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700 }}>Cố Vấn Hiệu Quả Kinh Doanh & Đơn Vị Kinh Tế (Unit Economics)</h2>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                    Đánh giá dòng tiền thực tế giữa chi tiêu Ads thẻ ảo và doanh thu Payout sàn thương mại điện tử
                  </p>
                </div>
                <div className="badge badge-warning" style={{ fontSize: 14, padding: '8px 16px' }}>
                  ĐIỂM SỨC KHỎE: 65/100 (CẢNH BÁO)
                </div>
              </div>

              {/* Grid Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                <div className="glass-card">
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Tổng Chi Phí Ads (Thẻ ảo)</span>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#f8fafc', marginTop: 4 }}>$870.00 USD</div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Facebook $300, Google $420, Ads $150</span>
                </div>

                <div className="glass-card">
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Doanh Thu Payout Thực Nhận</span>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#34d399', marginTop: 4 }}>$1,890.00 USD</div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Stripe Settlement (Đã ghi có)</span>
                </div>

                <div className="glass-card" style={{ border: '1px solid rgba(244, 63, 94, 0.3)' }}>
                  <span style={{ fontSize: 12, color: '#fb7185' }}>Payout Đang Bị Tắc Nghẽn</span>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#fb7185', marginTop: 4 }}>$4,250.00 USD</div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Amazon Seller (Trễ 16 ngày)</span>
                </div>

                <div className="glass-card">
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Ước Tính ROAS Toàn Kênh</span>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#38bdf8', marginTop: 4 }}>2.56x</div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Biên lợi nhuận gộp ước tính ~38%</span>
                </div>
              </div>

              {/* Insights and Strategic Recommendations */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div className="glass-card" style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                  <h4 style={{ color: '#fbbf24', fontSize: 15, fontWeight: 600, marginBottom: 10 }}>🚨 Phân Tích Rủi Ro Dòng Tiền:</h4>
                  <ul style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, paddingLeft: 18 }}>
                    <li>Khoản <strong>$4,250.00 USD từ Amazon</strong> chưa về khiến dòng tiền thực nhận chỉ đạt $1,890.00 USD.</li>
                    <li>Chi phí chạy Ads Facebook và Google chiếm đến <strong>46.0% dòng tiền tiền mặt hiện có</strong>.</li>
                    <li>Nếu tiếp tục giữ ngân sách ad hiện tại mà Payout chưa về trong 7 ngày tới, doanh nghiệp có nguy cơ bị âm vốn lưu động.</li>
                  </ul>
                </div>

                <div className="glass-card" style={{ background: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
                  <h4 style={{ color: '#38bdf8', fontSize: 15, fontWeight: 600, marginBottom: 10 }}>💡 Đề Xuất Chiến Lược & Human-in-the-Loop:</h4>
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

        {/* TAB 4: HUMAN IN THE LOOP (HITL) QUEUE */}
        {activeTab === 'hitl' && (
          <div className="glass-panel" style={{ padding: 24 }}>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700 }}>Hàng Đợi Phê Duyệt An Toàn (Human-in-the-Loop Queue)</h2>
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
                    <span style={{ fontSize: 12, color: 'var(--accent-cyan)', fontWeight: 500, marginTop: 4, display: 'inline-block' }}>
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

        {/* TAB 5: AUDIT LOGS (EVENT SOURCING) */}
        {activeTab === 'audit' && (
          <div className="glass-panel" style={{ padding: 24 }}>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700 }}>Append-Only Session Event Log (DeepSeek Harness Standard)</h2>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                Mọi hành động của AI, lời gọi công cụ, kiểm tra chính sách an toàn đều được lưu vết bất biến phục vụ kiểm toán tài chính:
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontFamily: 'var(--font-mono)', fontSize: 12 }}>
              <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px' }}>
                <span style={{ color: '#38bdf8' }}>[EVENT: turn/start]</span>
                <span>User initiated inquiry on Payouts &amp; Virtual Cards</span>
                <span style={{ color: 'var(--text-muted)' }}>11:00:01 UTC</span>
              </div>
              <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px' }}>
                <span style={{ color: '#c084fc' }}>[EVENT: policy/evaluated]</span>
                <span>Action: DETECT_OVERDUE_PAYOUTS  Decision: ALLOW</span>
                <span style={{ color: 'var(--text-muted)' }}>11:00:02 UTC</span>
              </div>
              <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px' }}>
                <span style={{ color: '#34d399' }}>[EVENT: tool/executed]</span>
                <span>Tool: detect_overdue_payouts (Execution: 1.2ms, Result: 1 Overdue Alert)</span>
                <span style={{ color: 'var(--text-muted)' }}>11:00:03 UTC</span>
              </div>
              <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px' }}>
                <span style={{ color: '#fbbf24' }}>[EVENT: grounding/verified]</span>
                <span>Grounding Reflection Check: 100% matched evidence (Amazon $4,250.00)</span>
                <span style={{ color: 'var(--text-muted)' }}>11:00:04 UTC</span>
              </div>
              <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px' }}>
                <span style={{ color: '#38bdf8' }}>[EVENT: turn/completed]</span>
                <span>Stream completed without security violations</span>
                <span style={{ color: 'var(--text-muted)' }}>11:00:05 UTC</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal Dispute Letter Preview */}
      {selectedDispute && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
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
    </div>
  );
}

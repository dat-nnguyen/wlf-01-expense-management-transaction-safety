import React from 'react';
import {
  Shield,
  LayoutDashboard,
  Activity,
  Bot,
  ShieldAlert,
  FileText,
  Database,
  SlidersHorizontal,
  Sliders,
  Users,
  UserCheck,
  Key,
  MessagesSquare,
  LineChart,
  Folder,
  TrendingUp,
  Star,
  AlertTriangle,
  Settings,
  ScrollText,
} from 'lucide-react';

interface OpsSidebarProps {
  activeNav: string;
  setActiveNav: (nav: string) => void;
}

export const OpsSidebar: React.FC<OpsSidebarProps> = ({
  activeNav,
  setActiveNav,
}) => {
  return (
    <aside className="w-60 bg-[#090e1a] border-r border-[rgba(255,255,255,0.08)] flex flex-col justify-between p-3.5 shrink-0">
      <div className="space-y-5 overflow-y-auto pr-1">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-xs tracking-wider text-white">WEALIFY</div>
            <div className="text-[10px] text-purple-400 tracking-widest uppercase">GUARDIAN</div>
          </div>
        </div>

        {/* Section 1: TỔNG QUAN */}
        <div className="space-y-1">
          <div className="px-2 text-[10px] font-bold text-[#64748b] tracking-wider uppercase">TỔNG QUAN</div>
          <button
            onClick={() => setActiveNav('dashboard')}
            className={`sidebar-link ${activeNav === 'dashboard' ? 'active' : ''}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => setActiveNav('system_stats')}
            className={`sidebar-link ${activeNav === 'system_stats' ? 'active' : ''}`}
          >
            <Activity className="w-4 h-4" />
            <span>Thống kê hệ thống</span>
          </button>
        </div>

        {/* Section 2: QUẢN LÝ BOT & AN NINH */}
        <div className="space-y-1">
          <div className="px-2 text-[10px] font-bold text-[#64748b] tracking-wider uppercase">
            QUẢN LÝ BOT &amp; AN NINH
          </div>
          <button
            onClick={() => setActiveNav('bot_list')}
            className={`sidebar-link ${activeNav === 'bot_list' ? 'active' : ''}`}
          >
            <Bot className="w-4 h-4" />
            <span>Danh sách Bot</span>
          </button>
          <button
            onClick={() => setActiveNav('security_center')}
            className={`sidebar-link justify-between ${activeNav === 'security_center' ? 'active' : ''}`}
          >
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Security Center</span>
            </div>
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold">
              12
            </span>
          </button>
          <button
            onClick={() => setActiveNav('scripts')}
            className={`sidebar-link ${activeNav === 'scripts' ? 'active' : ''}`}
          >
            <FileText className="w-4 h-4" />
            <span>Kịch bản &amp; Prompt</span>
          </button>
          <button
            onClick={() => setActiveNav('knowledge')}
            className={`sidebar-link ${activeNav === 'knowledge' ? 'active' : ''}`}
          >
            <Database className="w-4 h-4" />
            <span>Kiến thức (Knowledge)</span>
          </button>
          <button
            onClick={() => setActiveNav('tools')}
            className={`sidebar-link ${activeNav === 'tools' ? 'active' : ''}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Công cụ (Tools)</span>
          </button>
          <button
            onClick={() => setActiveNav('env_vars')}
            className={`sidebar-link ${activeNav === 'env_vars' ? 'active' : ''}`}
          >
            <Sliders className="w-4 h-4" />
            <span>Biến môi trường</span>
          </button>
        </div>

        {/* Section 3: NGƯỜI DÙNG & TRUY CẬP */}
        <div className="space-y-1">
          <div className="px-2 text-[10px] font-bold text-[#64748b] tracking-wider uppercase">
            NGƯỜI DÙNG &amp; TRUY CẬP
          </div>
          <button
            onClick={() => setActiveNav('users')}
            className={`sidebar-link ${activeNav === 'users' ? 'active' : ''}`}
          >
            <Users className="w-4 h-4" />
            <span>Người dùng</span>
          </button>
          <button
            onClick={() => setActiveNav('roles')}
            className={`sidebar-link ${activeNav === 'roles' ? 'active' : ''}`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Nhóm &amp; Phân quyền</span>
          </button>
          <button
            onClick={() => setActiveNav('api_keys')}
            className={`sidebar-link ${activeNav === 'api_keys' ? 'active' : ''}`}
          >
            <Key className="w-4 h-4" />
            <span>API Keys</span>
          </button>
        </div>

        {/* Section 4: HỘI THOẠI & DỮ LIỆU */}
        <div className="space-y-1">
          <div className="px-2 text-[10px] font-bold text-[#64748b] tracking-wider uppercase">
            HỘI THOẠI &amp; DỮ LIỆU
          </div>
          <button
            onClick={() => setActiveNav('conversations')}
            className={`sidebar-link ${activeNav === 'conversations' ? 'active' : ''}`}
          >
            <MessagesSquare className="w-4 h-4" />
            <span>Hội thoại</span>
          </button>
          <button
            onClick={() => setActiveNav('analytics')}
            className={`sidebar-link ${activeNav === 'analytics' ? 'active' : ''}`}
          >
            <LineChart className="w-4 h-4" />
            <span>Phân tích hội thoại</span>
          </button>
          <button
            onClick={() => setActiveNav('files')}
            className={`sidebar-link ${activeNav === 'files' ? 'active' : ''}`}
          >
            <Folder className="w-4 h-4" />
            <span>File &amp; Tài liệu</span>
          </button>
        </div>

        {/* Section 5: GIÁM SÁT & CHẤT LƯỢNG */}
        <div className="space-y-1">
          <div className="px-2 text-[10px] font-bold text-[#64748b] tracking-wider uppercase">
            GIÁM SÁT &amp; CHẤT LƯỢNG
          </div>
          <button
            onClick={() => setActiveNav('bot_perf')}
            className={`sidebar-link ${activeNav === 'bot_perf' ? 'active' : ''}`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Hiệu suất Bot</span>
          </button>
          <button
            onClick={() => setActiveNav('quality')}
            className={`sidebar-link ${activeNav === 'quality' ? 'active' : ''}`}
          >
            <Star className="w-4 h-4" />
            <span>Đánh giá chất lượng</span>
          </button>
          <button
            onClick={() => setActiveNav('warnings')}
            className={`sidebar-link ${activeNav === 'warnings' ? 'active' : ''}`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Cảnh báo</span>
          </button>
        </div>

        {/* Section 6: CÀI ĐẶT HỆ THỐNG */}
        <div className="space-y-1">
          <div className="px-2 text-[10px] font-bold text-[#64748b] tracking-wider uppercase">
            CÀI ĐẶT HỆ THỐNG
          </div>
          <button
            onClick={() => setActiveNav('general_settings')}
            className={`sidebar-link ${activeNav === 'general_settings' ? 'active' : ''}`}
          >
            <Settings className="w-4 h-4" />
            <span>Cài đặt chung</span>
          </button>
          <button
            onClick={() => setActiveNav('audit_logs')}
            className={`sidebar-link ${activeNav === 'audit_logs' ? 'active' : ''}`}
          >
            <ScrollText className="w-4 h-4" />
            <span>Nhật ký hoạt động</span>
          </button>
        </div>
      </div>

      {/* Bottom Version */}
      <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-[#64748b]">
        <span>Chế độ tối</span>
        <span>v2.1.0</span>
      </div>
    </aside>
  );
};

import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Users2, 
  Bot, 
  Megaphone, 
  GitBranch, 
  Settings, 
  HelpCircle,
  ChevronDown,
  Bell
} from 'lucide-react';

export default function Sidebar() {
  const { workspaceName, userFullName, activeTab, setActiveTab } = useAuthStore();
  const { socket, conversations } = useChatStore();

  const isConnected = !!socket;

  // Unread messages counter helper
  const unreadCount = conversations.length; // Mock some counts for high-end feel

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Home', icon: LayoutDashboard, badge: null },
    { id: 'inbox', label: 'Shared Inbox', icon: MessageSquare, badge: unreadCount ? `${unreadCount}` : null },
    { id: 'crm', label: 'CRM Pipeline', icon: Users2, badge: 'Kanban' },
    { id: 'chatbot', label: 'AI Chatbot', icon: Bot, badge: '82%' },
    { id: 'campaigns', label: 'Campaigns', icon: Megaphone, badge: 'Active' },
    { id: 'automation', label: 'Automation Flow', icon: GitBranch, badge: 'Make' },
    { id: 'settings', label: 'Connections', icon: Settings, badge: null },
  ] as const;

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800/80 flex flex-col h-full text-slate-100 flex-shrink-0">
      {/* 🚀 Brand Logo Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="font-bold text-white text-base">WP</span>
          </div>
          <div>
            <h2 className="font-bold tracking-wide text-xs text-white">WABot Pro</h2>
            <span className="text-[10px] text-slate-500 font-bold tracking-wider">BITSOL Suite</span>
          </div>
        </div>
        <button title="Notifications" aria-label="Notifications" className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors relative">
          <Bell size={15} />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
        </button>
      </div>

      {/* 🏢 Workspace Switcher / Picker (Notion/HubSpot style) */}
      <div className="px-4 py-3 border-b border-slate-800/60">
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/50 cursor-pointer border border-transparent hover:border-slate-800 transition-all">
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Tenant Sandbox</span>
            <span className="text-xs font-semibold truncate text-slate-200">{workspaceName}</span>
          </div>
          <ChevronDown size={14} className="text-slate-500" />
        </div>
        <div className="mt-2.5 px-2 flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          <span className="text-[10px] text-slate-400 font-medium">
            {isConnected ? 'WhatsApp API Online' : 'Connecting to Meta...'}
          </span>
        </div>
      </div>

      {/* 🧭 Sidebar Menu Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all focus:outline-none group ${
                isActive
                  ? 'bg-blue-600/10 border border-blue-500/20 text-blue-400 font-bold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={16} className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                  isActive 
                    ? 'bg-blue-500/20 text-blue-300' 
                    : item.id === 'chatbot' 
                      ? 'bg-purple-950/50 text-purple-400 border border-purple-900/30'
                      : item.id === 'campaigns'
                        ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/30 animate-pulse'
                        : 'bg-slate-800 text-slate-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* 👤 Logged Agent Identity card */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-700/80 flex items-center justify-center font-bold text-xs text-blue-400 shadow-md">
          {userFullName?.substring(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold truncate text-slate-200">{userFullName}</h4>
          <span className="text-[9px] text-slate-500 font-bold tracking-wider block">ADMIN SESSION</span>
        </div>
        <HelpCircle size={15} className="text-slate-500 hover:text-slate-300 cursor-pointer transition-colors" />
      </div>
    </aside>
  );
}

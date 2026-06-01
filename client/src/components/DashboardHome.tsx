import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { 
  MessageSquare, 
  UserPlus, 
  Bot, 
  UserCheck, 
  TrendingUp, 
  Coins, 
  Search, 
  Bell, 
  Sparkles,
  Smartphone,
  CheckCircle,
  Link,
  Shield,
  Activity,
  ArrowUpRight,
  ExternalLink
} from 'lucide-react';

export default function DashboardHome() {
  const { metaPhoneNumberId, userFullName } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');

  // 📈 Elegant KPI Cards Specs
  const kpis = [
    {
      title: 'Messages Today',
      value: '3,547',
      change: '+14.2%',
      isPositive: true,
      icon: MessageSquare,
      color: 'from-blue-600 to-cyan-500',
      glow: 'shadow-blue-500/10'
    },
    {
      title: 'New Leads',
      value: '127',
      change: '+8.3%',
      isPositive: true,
      icon: UserPlus,
      color: 'from-purple-600 to-indigo-500',
      glow: 'shadow-purple-500/10'
    },
    {
      title: 'AI Resolved',
      value: '82%',
      change: '+3.1%',
      isPositive: true,
      icon: Bot,
      color: 'from-fuchsia-600 to-pink-500',
      glow: 'shadow-fuchsia-500/10'
    },
    {
      title: 'Human Takeovers',
      value: '34',
      change: '-5.2%',
      isPositive: false,
      icon: UserCheck,
      color: 'from-amber-600 to-orange-500',
      glow: 'shadow-amber-500/10'
    },
    {
      title: 'Campaign CTR',
      value: '22%',
      change: '+4.7%',
      isPositive: true,
      icon: TrendingUp,
      color: 'from-emerald-600 to-teal-500',
      glow: 'shadow-emerald-500/10'
    },
    {
      title: 'Revenue Generated',
      value: 'PKR 1,250,000',
      change: '+18.9%',
      isPositive: true,
      icon: Coins,
      color: 'from-blue-600 to-purple-600',
      glow: 'shadow-indigo-500/10'
    }
  ];

  // 📊 Live Conversation Activity Data (WhatsApp/HubSpot Mock)
  const liveActivities = [
    { name: 'Kashif Ali', message: 'Interested in the premium bundle', time: 'Just now', type: 'new', stage: 'Interested', assigned: 'Zainab S.' },
    { name: 'Sajid Khan', message: 'Waiting for custom quotation details', time: '2m ago', type: 'open', stage: 'Proposal Sent', assigned: 'Unassigned' },
    { name: 'Ayesha Bibi', message: 'Resolving details via Autopilot AI', time: '5m ago', type: 'ai', stage: 'New Lead', assigned: 'AI Bot' },
    { name: 'Raza Motors', message: 'Approved invoice terms', time: '12m ago', type: 'open', stage: 'Won', assigned: 'Zainab S.' },
    { name: 'Mariam Fabrics', message: 'Query pending agent manual reply', time: '18m ago', type: 'pending', stage: 'Qualified', assigned: 'Zainab S.' }
  ];

  return (
    <div className="flex-1 bg-slate-950 overflow-y-auto flex flex-col h-full text-slate-100 font-sans">
      
      {/* 🏠 Top Header */}
      <header className="h-16 border-b border-slate-800/80 px-8 flex items-center justify-between bg-slate-900/20 backdrop-blur-md sticky top-0 z-40">
        
        {/* Company Logo & Switcher */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white shadow-md">
            W
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white leading-none">BITSOL Solutions</span>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">WABot Pro Tenant</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="w-96 relative hidden md:block">
          <Search size={14} className="absolute left-3.5 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search leads, campaigns, or settings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* Connected WhatsApp & Profile */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-900/80 border border-slate-800 rounded-xl">
            <Smartphone size={13} className="text-blue-400" />
            <span className="text-[11px] font-mono font-bold text-slate-300">+{metaPhoneNumberId || '1234567890'}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <button title="Notifications" aria-label="Notifications" className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors relative">
            <Bell size={14} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
          </button>

          <div className="h-8 w-px bg-slate-800" />

          {/* Profile Menu */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-xs text-white">
              {userFullName?.substring(0, 2).toUpperCase() || 'ZS'}
            </div>
            <div className="flex flex-col hidden sm:block">
              <span className="text-xs font-bold text-slate-200 leading-none">{userFullName}</span>
              <span className="text-[9px] font-semibold text-slate-500">Workspace Owner</span>
            </div>
          </div>
        </div>

      </header>

      {/* 🚀 Main Scrollable Content */}
      <div className="flex-1 p-8 space-y-8 max-w-7xl w-full mx-auto">
        
        {/* Banner Welcome */}
        <div className="p-6 rounded-2xl bg-gradient-to-tr from-slate-900 via-slate-900 to-blue-950/20 border border-slate-850/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full filter blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-purple-500/5 rounded-full filter blur-3xl pointer-events-none" />
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider border border-blue-500/20">
                Enterprise Dashboard
              </span>
              <div className="flex items-center gap-1 text-[10px] text-amber-400 font-bold bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-md">
                <Sparkles size={10} className="animate-pulse" />
                <span>Autopilot Core Live</span>
              </div>
            </div>
            <h1 className="text-lg font-extrabold text-white mt-2 leading-snug">Welcome to WABot Pro Console</h1>
            <p className="text-xs text-slate-400 font-medium mt-1">Monitor live WhatsApp chats, review automated AI resolutions, and configure campaign pipelines instantly.</p>
          </div>
          <div className="flex gap-2.5">
            <button className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-350 hover:text-white transition-all flex items-center gap-1.5">
              <span>View User Logs</span>
              <ExternalLink size={12} />
            </button>
          </div>
        </div>

        {/* 📊 KPI Cards Section */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {kpis.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <div 
                key={idx}
                className={`p-4 bg-slate-900/30 border border-slate-850/60 rounded-2xl shadow-xl hover:border-slate-800/80 transition-all duration-300 relative group overflow-hidden ${kpi.glow}`}
              >
                <div className="flex justify-between items-start">
                  <div className={`p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-white transition-all`}>
                    <Icon size={16} />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    kpi.isPositive 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {kpi.change}
                  </span>
                </div>
                <div className="mt-4">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">{kpi.title}</span>
                  <span className="text-base font-extrabold text-white mt-1 block font-mono tracking-tight leading-none">
                    {kpi.value}
                  </span>
                </div>
                <div className={`absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r ${kpi.color} opacity-30 group-hover:opacity-100 transition-opacity`} />
              </div>
            );
          })}
        </div>

        {/* 📊 Real-Time Overview Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Side: Live Conversation Activity */}
          <div className="lg:col-span-7 bg-slate-900/20 border border-slate-850/60 rounded-2xl p-6 flex flex-col h-full shadow-2xl relative">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xs font-bold text-slate-200">Live Conversation Activity</h3>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mt-0.5">Real-time incoming thread updates</span>
              </div>
              <div className="flex items-center gap-1 bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-full text-[10px] font-bold border border-blue-500/20">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping" />
                <span>Live Feed</span>
              </div>
            </div>

            {/* Activities List */}
            <div className="flex-1 space-y-3.5">
              {liveActivities.map((act, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-900/40 border border-slate-850/40 rounded-xl hover:border-slate-800 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-[10px] text-blue-400 flex-shrink-0">
                      {act.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-250 group-hover:text-slate-100 transition-colors">{act.name}</span>
                        <span className={`text-[8px] px-1.5 py-0.2 rounded-md font-bold uppercase ${
                          act.type === 'new'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : act.type === 'ai'
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                              : 'bg-slate-800 text-slate-400 border border-slate-750'
                        }`}>
                          {act.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5 font-medium max-w-[200px] sm:max-w-[280px]">
                        {act.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="flex flex-col items-end text-right">
                      <span className="text-[10px] font-bold text-slate-350">{act.assigned}</span>
                      <span className="text-[9px] text-slate-500 font-semibold mt-0.5">{act.stage}</span>
                    </div>
                    <span className="text-[9px] text-slate-500 font-bold font-mono">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-850/60 flex justify-between items-center text-xs text-slate-400">
              <span className="font-semibold">Pending human takeovers: <strong className="text-amber-500 font-bold font-mono">14</strong></span>
              <button className="text-blue-400 font-bold hover:underline flex items-center gap-0.5">
                <span>Go to Inbox</span>
                <ArrowUpRight size={14} />
              </button>
            </div>

          </div>

          {/* Right Side: WhatsApp Status Panel */}
          <div className="lg:col-span-5 bg-slate-900/20 border border-slate-850/60 rounded-2xl p-6 flex flex-col h-full shadow-2xl relative">
            
            <div className="mb-6">
              <h3 className="text-xs font-bold text-slate-200">WhatsApp Channel Status</h3>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mt-0.5">Meta API Gateway Integrations</span>
            </div>

            {/* Health Checklist */}
            <div className="flex-1 space-y-4">
              
              {/* Connected Line */}
              <div className="flex justify-between items-center p-3 bg-slate-950/40 rounded-xl border border-slate-850/40">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <CheckCircle size={14} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">WhatsApp Connectivity</span>
                    <span className="text-[9px] text-slate-500 font-semibold block">Channel ID linked to sandbox</span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[9px] uppercase tracking-wider">
                  Connected
                </span>
              </div>

              {/* Phone Verified */}
              <div className="flex justify-between items-center p-3 bg-slate-950/40 rounded-xl border border-slate-850/40">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Shield size={14} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Phone Number Verified</span>
                    <span className="text-[9px] text-slate-500 font-semibold block">Meta Security validation completed</span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[9px] uppercase tracking-wider">
                  Verified
                </span>
              </div>

              {/* Webhook Active */}
              <div className="flex justify-between items-center p-3 bg-slate-950/40 rounded-xl border border-slate-850/40">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Link size={14} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Webhook Core Event Router</span>
                    <span className="text-[9px] text-slate-500 font-semibold block">Receiving message_received updates</span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[9px] uppercase tracking-wider animate-pulse">
                  Active
                </span>
              </div>

              {/* Template Status */}
              <div className="flex justify-between items-center p-3 bg-slate-950/40 rounded-xl border border-slate-850/40">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <Activity size={14} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Meta Templates Status</span>
                    <span className="text-[9px] text-slate-500 font-semibold block">Approval logs synchronized</span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold text-[9px] uppercase tracking-wider">
                  Approved
                </span>
              </div>

              {/* API Health */}
              <div className="flex justify-between items-center p-3 bg-slate-950/40 rounded-xl border border-slate-850/40">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <CheckCircle size={14} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Meta Gateway Health</span>
                    <span className="text-[9px] text-slate-500 font-semibold block">Latency logs: 84ms average</span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[9px] uppercase tracking-wider">
                  Healthy
                </span>
              </div>

            </div>

            <div className="mt-5 pt-4 border-t border-slate-850/60 flex justify-between items-center text-xs text-slate-500 font-semibold">
              <span>Token Expires: <strong className="text-slate-400 font-bold">In 28 days</strong></span>
              <span className="text-slate-400">Meta API v19.0</span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

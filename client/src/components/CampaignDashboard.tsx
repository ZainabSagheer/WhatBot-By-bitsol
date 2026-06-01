import React, { useState } from 'react';
import { 
  Megaphone, 
  Play, 
  Pause, 
  BarChart3, 
  PlusCircle
} from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  status: 'Running' | 'Active' | 'Scheduled' | 'Paused';
  segment: string;
  sentCount: number;
  deliveredPercent: number;
  readPercent: number;
  repliedPercent: number;
  convertedPercent: number;
  createdAt: string;
}

export default function CampaignDashboard() {
  
  // 📢 State of active campaigns
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    { id: '1', name: 'Eid Al-Adha Promo Offer', status: 'Running', segment: 'All Active Leads', sentCount: 3547, deliveredPercent: 98, readPercent: 84, repliedPercent: 42, convertedPercent: 22, createdAt: 'Launched 2h ago' },
    { id: '2', name: 'Welcome Series Auto-Responder', status: 'Active', segment: 'New Subscribers', sentCount: 1205, deliveredPercent: 99, readPercent: 92, repliedPercent: 55, convertedPercent: 34, createdAt: 'Launched 3d ago' },
    { id: '3', name: 'Cart Recovery Automation', status: 'Scheduled', segment: 'Abandonments', sentCount: 450, deliveredPercent: 96, readPercent: 78, repliedPercent: 28, convertedPercent: 12, createdAt: 'Starts tomorrow' }
  ]);

  // Active selected campaign for funnel rendering
  const [selectedCampaignId, setSelectedCampaignId] = useState('1');
  const activeCampaign = campaigns.find(c => c.id === selectedCampaignId) || campaigns[0];

  // Campaign create states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newCampaignSegment, setNewCampaignSegment] = useState('All Captured Leads');

  const toggleCampaignStatus = (id: string) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === id) {
        const nextStatus: Campaign['status'] = c.status === 'Running' || c.status === 'Active' ? 'Paused' : 'Running';
        return { ...c, status: nextStatus };
      }
      return c;
    }));
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignName.trim()) return;

    const newCamp: Campaign = {
      id: Date.now().toString(),
      name: newCampaignName,
      status: 'Scheduled',
      segment: newCampaignSegment,
      sentCount: 0,
      deliveredPercent: 0,
      readPercent: 0,
      repliedPercent: 0,
      convertedPercent: 0,
      createdAt: 'Scheduled just now'
    };

    setCampaigns([...campaigns, newCamp]);
    setNewCampaignName('');
    setShowCreateModal(false);
  };

  // Funnel calculations helper based on active campaign
  const sent = activeCampaign.sentCount;
  const delivered = Math.round(sent * (activeCampaign.deliveredPercent / 100));
  const read = Math.round(delivered * (activeCampaign.readPercent / 100));
  const replied = Math.round(read * (activeCampaign.repliedPercent / 100));
  const converted = Math.round(replied * (activeCampaign.convertedPercent / 100));

  const funnelStages = [
    { title: 'Sent Messages', value: sent, percent: 100, color: 'bg-blue-600/35 border-blue-500/30' },
    { title: 'Delivered', value: delivered, percent: activeCampaign.deliveredPercent, color: 'bg-cyan-600/35 border-cyan-500/30' },
    { title: 'Read / Viewed', value: read, percent: activeCampaign.readPercent, color: 'bg-emerald-600/35 border-emerald-500/30' },
    { title: 'Customer Replied', value: replied, percent: activeCampaign.repliedPercent, color: 'bg-amber-600/35 border-amber-500/30' },
    { title: 'Sales Converted', value: converted, percent: activeCampaign.convertedPercent, color: 'bg-purple-600/35 border-purple-500/30' }
  ];

  return (
    <div className="flex-1 bg-slate-950 p-8 overflow-y-auto flex flex-col h-full text-slate-100 font-sans">
      
      {/* 🚀 Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Megaphone size={20} />
          </div>
          <div>
            <h2 className="font-bold text-sm text-slate-100">WhatsApp Broadcast & Campaigns</h2>
            <p className="text-[11px] text-slate-500 font-medium">Create bulk dispatch alerts, pacing queues, and analyze funnel conversion metrics.</p>
          </div>
        </div>

        <button 
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-gradient-to-tr from-emerald-600 to-teal-600 hover:opacity-90 active:scale-95 text-xs font-bold text-white rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-500/10 transition-all"
        >
          <PlusCircle size={13} />
          <span>Launch Broadcast</span>
        </button>
      </div>

      {/* 🚀 Main Split Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Campaign Cards */}
        <div className="lg:col-span-6 space-y-4 h-full flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Active Broadcast Campaigns</span>
            <span className="text-[9px] text-slate-500 font-bold">Select card to view telemetry funnel</span>
          </div>

          <div className="space-y-3.5">
            {campaigns.map((camp) => {
              const isSelected = camp.id === selectedCampaignId;

              return (
                <div 
                  key={camp.id}
                  onClick={() => setSelectedCampaignId(camp.id)}
                  className={`p-4 bg-slate-900/30 border rounded-2xl cursor-pointer hover:border-slate-800 transition-all flex flex-col justify-between gap-4 relative overflow-hidden ${
                    isSelected 
                      ? 'border-emerald-500/40 bg-slate-900/60 shadow-lg shadow-emerald-500/2' 
                      : 'border-slate-850/60'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-200">{camp.name}</h4>
                        <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.2 rounded-md ${
                          camp.status === 'Running' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          camp.status === 'Active' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          camp.status === 'Scheduled' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-slate-800 text-slate-400 border border-slate-750'
                        }`}>
                          {camp.status}
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-bold block mt-1 uppercase tracking-wide">
                        Segment: {camp.segment} • {camp.createdAt}
                      </span>
                    </div>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCampaignStatus(camp.id);
                      }}
                      className="p-2 bg-slate-950 border border-slate-850 hover:bg-slate-800 text-slate-450 hover:text-white rounded-lg transition-colors"
                      aria-label="Toggle campaign status"
                    >
                      {camp.status === 'Running' || camp.status === 'Active' ? <Pause size={12} /> : <Play size={12} />}
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 border-t border-slate-850/50 pt-3 text-xs">
                    <div>
                      <span className="text-[9px] text-slate-500 font-bold block uppercase">Dispatched</span>
                      <span className="font-extrabold text-slate-200 mt-0.5 block font-mono">{camp.sentCount.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 font-bold block uppercase">CTR / Reply</span>
                      <span className="font-extrabold text-slate-200 mt-0.5 block font-mono">{camp.repliedPercent}%</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 font-bold block uppercase">Conversion</span>
                      <span className="font-extrabold text-slate-200 mt-0.5 block font-mono">{camp.convertedPercent}%</span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Funnel Visualization */}
        <div className="lg:col-span-6 bg-slate-900/20 border border-slate-850/60 rounded-2xl p-6 space-y-6 shadow-2xl relative">
          
          <div>
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <BarChart3 size={15} className="text-emerald-400" />
              <span>Conversion Funnel Analytics</span>
            </h3>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mt-0.5">
              Telemetry details for: <strong className="text-slate-400">{activeCampaign.name}</strong>
            </span>
          </div>

          {/* Funnel chart steps */}
          <div className="space-y-3.5">
            {funnelStages.map((stage, idx) => {
              // progressive narrowing widths
              const widths = ['w-full', 'w-[92%]', 'w-[84%]', 'w-[76%]', 'w-[68%]'];
              const width = widths[idx];

              return (
                <div key={idx} className="flex flex-col items-center">
                  <div className={`p-3 border rounded-xl flex items-center justify-between text-xs transition-all ${width} ${stage.color}`}>
                    <div className="min-w-0">
                      <span className="font-bold text-slate-200 block truncate">{stage.title}</span>
                      <span className="text-[9px] text-slate-400 font-mono mt-0.5 block font-bold">
                        {stage.value.toLocaleString()} users
                      </span>
                    </div>
                    <span className="text-[10px] font-extrabold text-white font-mono bg-slate-950/65 border border-slate-850 px-2 py-0.5 rounded-md">
                      {stage.percent}%
                    </span>
                  </div>
                  {idx < funnelStages.length - 1 && (
                    <div className="w-0.5 h-3.5 bg-gradient-to-b from-slate-800 to-slate-900" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-slate-900 border border-slate-850 rounded-xl flex justify-between items-center text-xs">
            <div>
              <span className="text-[9px] text-slate-500 font-bold block uppercase">Net campaign conversion</span>
              <span className="text-xs font-extrabold text-emerald-400 mt-1 block">
                {activeCampaign.convertedPercent}% conversion rate
              </span>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-slate-500 font-bold block uppercase">Revenue Generated</span>
              <span className="text-xs font-extrabold text-white mt-1 block font-mono">
                PKR {(converted * 8000).toLocaleString()}
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* 🚀 Campaign Create Modal Drawer */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            
            <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-1.5">
              <Megaphone size={16} className="text-emerald-500" />
              <span>Launch Bulk Broadcast</span>
            </h3>

            <form onSubmit={handleCreateCampaign} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Campaign Identifier / Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Summer Clearance Clearance Promo"
                  value={newCampaignName}
                  onChange={(e) => setNewCampaignName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-650 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="segment-select" className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Target Recipient Segment</label>
                <select
                  id="segment-select"
                  title="Target Recipient Segment"
                  value={newCampaignSegment}
                  onChange={(e) => setNewCampaignSegment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer appearance-none"
                >
                  <option value="All Captured Leads">All Captured Leads ({sent} total)</option>
                  <option value="New Subscribers">New Subscribers</option>
                  <option value="Abandonments">Abandonments</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-850 text-xs font-bold text-slate-450 hover:text-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 hover:opacity-90 text-xs font-bold text-white transition-all shadow-md shadow-emerald-500/10"
                >
                  Launch Broadcast
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

import React, { useState } from 'react';
import { useChatStore } from '../store/useChatStore';
import { 
  Award, 
  Phone, 
  TrendingUp, 
  Coins, 
  UserCheck, 
  PlusCircle, 
  Briefcase,
  Layers
} from 'lucide-react';

interface Deal {
  id: string;
  name: string;
  phone: string;
  value: number; // in PKR
  score: number;
  stage: 'New Lead' | 'Interested' | 'Qualified' | 'Proposal Sent' | 'Won' | 'Lost';
  updatedAt: string;
}

export default function CRMDashboard() {
  const { conversations } = useChatStore();

  // Populate initial deals using mock values or seeds from existing conversations list
  const initialDeals: Deal[] = conversations.length > 0 ? conversations.map((c, idx) => {
    // Distribute stages for beautiful pipeline layout
    const stages: Deal['stage'][] = ['New Lead', 'Interested', 'Qualified', 'Proposal Sent', 'Won', 'Lost'];
    const stage = stages[idx % stages.length];
    
    // Assign incremental PKR deal values
    const values = [75000, 120000, 200000, 350000, 500000, 150000];
    const value = values[idx % values.length];

    return {
      id: c.id,
      name: c.contact.firstName || 'Syed Hamza',
      phone: c.contact.phoneNumber,
      value: value,
      score: c.contact.leadScore || 45,
      stage: stage,
      updatedAt: '2 hours ago'
    };
  }) : [
    { id: '1', name: 'Zeeshan Ahmad', phone: '+92 300 1234567', value: 85000, score: 75, stage: 'New Lead', updatedAt: 'Just now' },
    { id: '2', name: 'Al-Rehman Traders', phone: '+92 312 9876543', value: 320000, score: 85, stage: 'Interested', updatedAt: '1h ago' },
    { id: '3', name: 'Fatima Malik', phone: '+92 321 4455667', value: 150000, score: 60, stage: 'Qualified', updatedAt: '3h ago' },
    { id: '4', name: 'Siddique Fabrics', phone: '+92 333 5556677', value: 650000, score: 92, stage: 'Proposal Sent', updatedAt: '1d ago' },
    { id: '5', name: 'Bilal Logistics', phone: '+92 345 7778899', value: 1250000, score: 98, stage: 'Won', updatedAt: '2d ago' },
    { id: '6', name: 'Imran Textiles', phone: '+92 301 2223344', value: 180000, score: 35, stage: 'Lost', updatedAt: '3d ago' }
  ];

  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDealName, setNewDealName] = useState('');
  const [newDealValue, setNewDealValue] = useState('150000');
  const [newDealPhone, setNewDealPhone] = useState('+92 ');
  const [newDealStage, setNewDealStage] = useState<Deal['stage']>('New Lead');

  // Stages structure
  const columns: { id: Deal['stage']; title: string; color: string; dot: string }[] = [
    { id: 'New Lead', title: 'New Lead', color: 'border-t-rose-500', dot: 'bg-rose-500' },
    { id: 'Interested', title: 'Interested', color: 'border-t-amber-500', dot: 'bg-amber-500' },
    { id: 'Qualified', title: 'Qualified', color: 'border-t-emerald-500', dot: 'bg-emerald-500' },
    { id: 'Proposal Sent', title: 'Proposal Sent', color: 'border-t-blue-500', dot: 'bg-blue-500' },
    { id: 'Won', title: 'Won', color: 'border-t-purple-500', dot: 'bg-purple-500' },
    { id: 'Lost', title: 'Lost', color: 'border-t-slate-500', dot: 'bg-slate-500' }
  ];

  // Pipeline calculations
  const totalPipelineValue = deals.reduce((sum, deal) => deal.stage !== 'Lost' ? sum + deal.value : sum, 0);
  const totalWonValue = deals.reduce((sum, deal) => deal.stage === 'Won' ? sum + deal.value : sum, 0);
  const winRate = Math.round((deals.filter(d => d.stage === 'Won').length / Math.max(deals.filter(d => d.stage === 'Won' || d.stage === 'Lost').length, 1)) * 100);
  const activeDealsCount = deals.filter(d => d.stage !== 'Won' && d.stage !== 'Lost').length;

  // HTML5 Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('dealId', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStage: Deal['stage']) => {
    const dealId = e.dataTransfer.getData('dealId');
    if (dealId) {
      setDeals(prevDeals => prevDeals.map(d => d.id === dealId ? { ...d, stage: targetStage, updatedAt: 'Just now' } : d));
    }
  };

  // Move deal manually helper (for mobile or accessibility click)
  const moveDealStage = (dealId: string, nextStage: Deal['stage']) => {
    setDeals(prevDeals => prevDeals.map(d => d.id === dealId ? { ...d, stage: nextStage, updatedAt: 'Just now' } : d));
  };

  const handleAddDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDealName.trim()) return;

    const newDeal: Deal = {
      id: Date.now().toString(),
      name: newDealName,
      phone: newDealPhone,
      value: parseFloat(newDealValue) || 0,
      score: Math.floor(Math.random() * 50) + 50, // default high score for new manually added deals
      stage: newDealStage,
      updatedAt: 'Just now'
    };

    setDeals([newDeal, ...deals]);
    setNewDealName('');
    setNewDealValue('150000');
    setNewDealPhone('+92 ');
    setShowAddModal(false);
  };

  return (
    <div className="flex-1 bg-slate-950 p-8 overflow-y-auto flex flex-col h-full text-slate-100 font-sans">
      
      {/* 🚀 Top Statistics Headers */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Layers size={20} />
          </div>
          <div>
            <h2 className="font-bold text-sm text-slate-100">CRM Leads Pipeline</h2>
            <p className="text-[11px] text-slate-500 font-medium">Drag and drop deal cards to instantly update sales lifecycle metrics.</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-gradient-to-tr from-blue-600 to-indigo-600 hover:opacity-90 active:scale-95 text-xs font-bold text-white rounded-xl flex items-center gap-1.5 shadow-lg shadow-blue-500/15 transition-all"
          >
            <PlusCircle size={13} />
            <span>Create New Deal</span>
          </button>
        </div>
      </div>

      {/* 📊 Pipeline Telemetry summaries */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-slate-900/30 border border-slate-850/60 rounded-2xl flex items-center gap-4 shadow-xl">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Briefcase size={18} />
          </div>
          <div>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Total Pipeline Value</span>
            <span className="text-sm font-extrabold text-white mt-0.5 block font-mono">PKR {totalPipelineValue.toLocaleString()}</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900/30 border border-slate-850/60 rounded-2xl flex items-center gap-4 shadow-xl">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Coins size={18} />
          </div>
          <div>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Won Deal Values</span>
            <span className="text-sm font-extrabold text-white mt-0.5 block font-mono">PKR {totalWonValue.toLocaleString()}</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900/30 border border-slate-850/60 rounded-2xl flex items-center gap-4 shadow-xl">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <TrendingUp size={18} />
          </div>
          <div>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Sales Win Rate</span>
            <span className="text-sm font-extrabold text-white mt-0.5 block font-mono">{winRate || 0}% Closed Won</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900/30 border border-slate-850/60 rounded-2xl flex items-center gap-4 shadow-xl">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <UserCheck size={18} />
          </div>
          <div>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Active Negotiations</span>
            <span className="text-sm font-extrabold text-white mt-0.5 block font-mono">{activeDealsCount} In Process</span>
          </div>
        </div>
      </div>

      {/* 👥 Kanban Drag-And-Drop Grid */}
      <div className="flex-1 min-h-[500px] grid grid-cols-1 md:grid-cols-6 gap-4 overflow-x-auto pb-4 items-start select-none">
        
        {columns.map((col) => {
          const colDeals = deals.filter((deal) => deal.stage === col.id);
          const colTotal = colDeals.reduce((sum, deal) => sum + deal.value, 0);

          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`h-full min-w-[200px] flex flex-col bg-slate-900/20 border border-slate-850/60 rounded-2xl overflow-hidden shadow-md border-t-2 ${col.color} transition-all pb-4`}
            >
              
              {/* Column Header */}
              <div className="p-4 border-b border-slate-900/40 flex justify-between items-start bg-slate-950/20">
                <div>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />
                    <h3 className="text-xs font-bold text-slate-200">{col.title}</h3>
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono block mt-1">PKR {colTotal.toLocaleString()}</span>
                </div>
                <span className="px-1.5 py-0.2 bg-slate-900 text-slate-400 border border-slate-850 rounded text-[9px] font-bold">
                  {colDeals.length}
                </span>
              </div>

              {/* Column Body - Draggable Cards Container */}
              <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[460px]">
                {colDeals.length === 0 ? (
                  <div className="h-28 border border-dashed border-slate-850/50 rounded-xl flex items-center justify-center text-center p-4">
                    <span className="text-[10px] text-slate-650 font-semibold italic">Drag deals here</span>
                  </div>
                ) : (
                  colDeals.map((deal) => (
                    <div
                      key={deal.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, deal.id)}
                      className="p-3 bg-slate-900 border border-slate-850 hover:border-slate-750 rounded-xl shadow-lg hover:shadow-blue-500/2 transition-all cursor-grab active:cursor-grabbing group relative"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-slate-200 truncate group-hover:text-blue-400 transition-colors max-w-[120px]">
                          {deal.name}
                        </span>
                        <div className="flex items-center gap-1 text-[9px] text-slate-500 font-bold">
                          <Award size={10} className="text-amber-500" />
                          <span>{deal.score}</span>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-[10px] text-slate-400 font-medium">
                        <div className="flex items-center gap-1 text-slate-500">
                          <Phone size={10} />
                          <span className="font-mono">{deal.phone}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-850/40">
                          <span className="font-bold text-slate-200 font-mono">PKR {deal.value.toLocaleString()}</span>
                          <span className="text-[8px] text-slate-500">{deal.updatedAt}</span>
                        </div>
                      </div>

                      {/* Manual Relocator dropdown buttons for accessibility / non-drag interfaces */}
                      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                        <select
                          aria-label="Move deal stage"
                          className="bg-slate-950 border border-slate-800 rounded text-[9px] font-bold text-slate-400 p-0.5 cursor-pointer max-w-[50px] outline-none"
                          onChange={(e) => moveDealStage(deal.id, e.target.value as Deal['stage'])}
                          defaultValue={col.id}
                        >
                          <option value="New Lead">New</option>
                          <option value="Interested">Int</option>
                          <option value="Qualified">Qual</option>
                          <option value="Proposal Sent">Prop</option>
                          <option value="Won">Won</option>
                          <option value="Lost">Lost</option>
                        </select>
                      </div>

                    </div>
                  ))
                )}
              </div>

            </div>
          );
        })}

      </div>

      {/* 🚀 New Deal Modal Drawer */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
            
            <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-1.5">
              <Briefcase size={16} className="text-blue-500" />
              <span>Create Pipeline Deal</span>
            </h3>

            <form onSubmit={handleAddDeal} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Lead Name / Corporation</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hammad Textiles"
                  value={newDealName}
                  onChange={(e) => setNewDealName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">WhatsApp Contact Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +92 300 1234567"
                  value={newDealPhone}
                  onChange={(e) => setNewDealPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Deal Value (PKR)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 150000"
                    value={newDealValue}
                    onChange={(e) => setNewDealValue(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="stage-select" className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Pipeline Stage</label>
                  <select
                    id="stage-select"
                    title="Pipeline Stage"
                    value={newDealStage}
                    onChange={(e) => setNewDealStage(e.target.value as Deal['stage'])}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="New Lead">New Lead</option>
                    <option value="Interested">Interested</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Proposal Sent">Proposal Sent</option>
                    <option value="Won">Won</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-850 text-xs font-bold text-slate-450 hover:text-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 hover:opacity-90 text-xs font-bold text-white transition-all shadow-md shadow-blue-500/10"
                >
                  Add Deal
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

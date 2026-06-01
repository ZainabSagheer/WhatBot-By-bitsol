import React, { useState } from 'react';
import { useChatStore } from '../store/useChatStore';
import { Radio, Play, BarChart3, CheckCheck, Sparkles, CheckCircle2 } from 'lucide-react';

export default function BroadcastTab() {
  const { conversations } = useChatStore();

  const [campaignName, setCampaignName] = useState('Summer Promotional Launch');
  const [recipientTag, setRecipientTag] = useState('ALL');
  const [templateText, setTemplateText] = useState('Hello {{name}}! Supercharge your business WhatsApp operations with Conversiq AI. Get 24/7 automated support and sync all queries directly to your Sheets!');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  // Diagnostic metrics
  const [metrics, setMetrics] = useState({
    sent: 45,
    delivered: 42,
    read: 38,
    replied: 14,
  });

  const handleLaunchCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setSendSuccess(false);

    try {
      // Simulate API broadcast dispatch queue enqueuing
      await new Promise((resolve) => setTimeout(resolve, 1200));
      
      setMetrics({
        sent: conversations.length || 1,
        delivered: conversations.length || 1,
        read: conversations.length || 1,
        replied: Math.ceil((conversations.length || 1) * 0.4),
      });
      
      setSendSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-950 p-8 overflow-y-auto flex gap-6 items-start">
      
      {/* 📢 Campaign Builder Form (Left Section) */}
      <div className="flex-1 space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Radio size={20} />
          </div>
          <div>
            <h2 className="font-bold text-sm text-slate-100">WhatsApp Broadcast Engine</h2>
            <p className="text-[11px] text-slate-500 font-medium">Create bulk campaigns, compose dynamic message templates, and dispatch notifications to contacts.</p>
          </div>
        </div>

        {/* Builder Panel */}
        <div className="glass-panel p-6 bg-slate-900/30 border-slate-850/60">
          <form onSubmit={handleLaunchCampaign} className="space-y-4">
            
            {/* Campaign Name */}
            <div className="space-y-1.5">
              <label htmlFor="campaignName" className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Campaign Identifier / Name
              </label>
              <input
                type="text"
                id="campaignName"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="e.g. Summer Clearance Promo"
                required
                className="w-full bg-slate-950 border border-slate-850 rounded-lg px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Target Audience Selector */}
            <div className="space-y-1.5">
              <label htmlFor="recipientTag" className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Recipient Segment Group
              </label>
              <div className="relative">
                <select
                  id="recipientTag"
                  value={recipientTag}
                  onChange={(e) => setRecipientTag(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer"
                >
                  <option value="ALL">All Captured Leads ({conversations.length} total)</option>
                  <option value="NEW">Stage: NEW Leads</option>
                  <option value="QUALIFIED">Stage: QUALIFIED Hot Leads</option>
                </select>
              </div>
            </div>

            {/* Broadcast Message Body Template */}
            <div className="space-y-1.5">
              <label htmlFor="templateText" className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex justify-between">
                <span>WhatsApp Template Content</span>
                <span className="text-blue-400 font-bold normal-case">Supports {"{{name}}"} variables</span>
              </label>
              <textarea
                id="templateText"
                value={templateText}
                onChange={(e) => setTemplateText(e.target.value)}
                rows={4}
                required
                className="w-full bg-slate-950 border border-slate-850 rounded-lg px-4 py-2.5 text-xs text-slate-100 placeholder-slate-650 focus:outline-none focus:border-blue-500 transition-colors resize-none leading-relaxed"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="submit"
                disabled={isSending}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 hover:opacity-90 active:scale-95 text-xs font-bold text-white flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                <Play size={12} />
                <span>{isSending ? 'Launching campaign...' : 'Launch Broadcast Campaign'}</span>
              </button>

              {sendSuccess && (
                <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold uppercase tracking-wider animate-pulse">
                  <CheckCircle2 size={14} />
                  <span>Broadcast Launched!</span>
                </div>
              )}
            </div>

          </form>
        </div>

      </div>

      {/* 📊 Live Campaign Diagnostics (Right Section) */}
      <div className="w-80 space-y-6 flex-shrink-0">
        
        {/* Diagnostics Header */}
        <div className="flex items-center gap-2">
          <BarChart3 size={16} className="text-blue-500" />
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Campaign Telemetry</span>
        </div>

        {/* Telemetry Metrics Card */}
        <div className="glass-panel p-5 bg-slate-900/20 border-slate-850/60 space-y-4">
          <div>
            <h4 className="text-xs font-bold text-slate-200">Active Campaign Logs</h4>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mt-0.5">Real-time statistics</span>
          </div>

          {/* Core metrics counters */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-950/40 border border-slate-850/40 rounded-xl">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Sent</span>
              <span className="text-lg font-extrabold text-slate-100 font-mono mt-0.5 block">{metrics.sent}</span>
            </div>
            <div className="p-3 bg-slate-950/40 border border-slate-850/40 rounded-xl">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Delivered</span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-lg font-extrabold text-slate-100 font-mono block">{metrics.delivered}</span>
                <CheckCheck size={12} className="text-slate-500 flex-shrink-0" />
              </div>
            </div>
            <div className="p-3 bg-slate-950/40 border border-slate-850/40 rounded-xl">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Read</span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-lg font-extrabold text-slate-100 font-mono block">{metrics.read}</span>
                <CheckCheck size={12} className="text-emerald-400 flex-shrink-0" />
              </div>
            </div>
            <div className="p-3 bg-slate-950/40 border border-slate-850/40 rounded-xl">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Replies</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-lg font-extrabold text-slate-100 font-mono block">{metrics.replied}</span>
                <Sparkles size={11} className="text-amber-500 flex-shrink-0 animate-pulse" />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg border border-slate-850/60 bg-slate-900/10 text-[10px] text-slate-400 font-semibold leading-relaxed">
            📢 **SaaS Campaign Compliance Alert**: WABot Pro automatically paces enqueued WhatsApp broadcasts inside multi-threaded queues to comply with Meta Messaging policies.
          </div>

        </div>

      </div>

    </div>
  );
}

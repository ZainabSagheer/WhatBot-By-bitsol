import React, { useState } from 'react';
import { useChatStore } from '../store/useChatStore';
import { Users, FileSpreadsheet, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function ContactsTab() {
  const { conversations } = useChatStore();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncDone, setSyncDone] = useState(false);

  const handleSheetsSync = async () => {
    setIsSyncing(true);
    setSyncDone(false);
    
    // Simulate API Sheets sync latency
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSyncing(false);
    setSyncDone(true);
  };

  return (
    <div className="flex-1 bg-slate-950 p-8 overflow-y-auto flex gap-6 items-start">
      
      {/* 👥 CRM Leads Grid (Left Section) */}
      <div className="flex-1 space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Users size={20} />
          </div>
          <div>
            <h2 className="font-bold text-sm text-slate-100">CRM Contacts Database</h2>
            <p className="text-[11px] text-slate-500 font-medium">Browse incoming customer details, pipeline stages, lead scores, and capture telemetry.</p>
          </div>
        </div>

        {/* Data Table */}
        <div className="border border-slate-850 rounded-2xl overflow-hidden bg-slate-900/10">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-850 text-slate-400 font-bold uppercase tracking-wider">
                <th className="px-5 py-3">Lead Card</th>
                <th className="px-5 py-3">WhatsApp Number</th>
                <th className="px-5 py-3">Pipeline Stage</th>
                <th className="px-5 py-3">Lead Score</th>
                <th className="px-5 py-3">Captured At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-slate-300">
              {conversations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 font-semibold">
                    No leads captured yet. Run webhook simulations to feed data!
                  </td>
                </tr>
              ) : (
                conversations.map((chat) => (
                  <tr key={chat.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-5 py-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-[10px] text-blue-400">
                        {chat.contact.firstName?.substring(0, 2).toUpperCase() || 'CQ'}
                      </div>
                      <span className="font-bold text-slate-200">{chat.contact.firstName || 'Anonymous'}</span>
                    </td>
                    <td className="px-5 py-4 font-mono font-medium text-slate-400">{chat.contact.phoneNumber}</td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] text-slate-300 font-bold">
                        {chat.contact.stage || 'NEW'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 font-bold text-slate-200">
                        <Sparkles size={12} className="text-amber-500" />
                        <span>{chat.contact.leadScore}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-500 font-medium">
                      {new Date(chat.contact.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* 📊 Google Sheets Sync Console (Right Section) */}
      <div className="w-80 space-y-6 flex-shrink-0">
        
        {/* Sheets Panel Header */}
        <div className="flex items-center gap-2">
          <FileSpreadsheet size={16} className="text-emerald-500" />
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Spreadsheet Sync Engine</span>
        </div>

        {/* Sync Console Card */}
        <div className="glass-panel p-5 bg-slate-900/20 border-slate-850/60 flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-200">Google Sheets Sync</h4>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mt-0.5">Integration telemetry</span>
            </div>
            <div className="px-2.5 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 flex items-center gap-1 font-bold text-[9px] uppercase tracking-wider">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Active</span>
            </div>
          </div>

          <div className="space-y-3 border-t border-b border-slate-850 py-3 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Sync Mode:</span>
              <span className="text-slate-300 font-bold">Auto-Sync (Real Time)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Sheet ID:</span>
              <span className="text-slate-400 font-mono text-[10px] truncate max-w-[140px]" title="1t7B0w4Xp8a92mQ1n2b3s...">
                1t7B0w4Xp8a92mQ1n2b3s...
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Connected Rows:</span>
              <span className="text-slate-300 font-bold">{conversations.length} Captured Leads</span>
            </div>
          </div>

          {/* Sync actions */}
          <div className="flex flex-col gap-2 pt-1">
            <button
              onClick={handleSheetsSync}
              disabled={isSyncing}
              className="w-full py-2 rounded-xl bg-slate-900 border border-slate-850 hover:bg-slate-800 text-xs font-bold text-slate-300 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
            >
              <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
              <span>{isSyncing ? 'Syncing...' : 'Force Sync to Sheets'}</span>
            </button>
            
            {syncDone && (
              <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-400 font-bold uppercase tracking-wider animate-pulse">
                <CheckCircle2 size={12} />
                <span>Sync verified successfully!</span>
              </div>
            )}

            <a
              href="https://docs.google.com/spreadsheets/d/1t7B0w4Xp8a92mQ1n2b3s5t6y7u8i9o0p/edit"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 rounded-xl bg-gradient-to-tr from-emerald-600/10 to-teal-600/10 hover:from-emerald-600/20 hover:to-teal-600/20 border border-emerald-500/20 hover:border-emerald-500/40 text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5 transition-all text-center"
            >
              <FileSpreadsheet size={14} />
              <span>Open Linked Google Sheet</span>
            </a>
          </div>

        </div>

      </div>

    </div>
  );
}

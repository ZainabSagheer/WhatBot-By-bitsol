import React from 'react';
import { useChatStore } from '../store/useChatStore';
import { Bot, Phone, Mail, Award, Calendar, ToggleLeft, ToggleRight } from 'lucide-react';

export default function CRMPanel() {
  const { conversations, activeConversationId, toggleAutopilot } = useChatStore();

  const chat = conversations.find((c) => c.id === activeConversationId);

  if (!chat) return null;

  const contact = chat.contact;
  const isAi = contact.isAiEnabled;

  const handleToggleAi = async () => {
    await toggleAutopilot(contact.id, !isAi);
  };

  // Safe parsing helper for JSON fields
  let customFieldsObj: Record<string, string> = {};
  try {
    customFieldsObj = JSON.parse(contact.customFields || '{}');
  } catch {
    customFieldsObj = {};
  }

  // Comma separated tags array helper
  const tagsList = contact.tags ? contact.tags.split(',').map((t) => t.trim()) : ['Warm Lead', 'WhatsApp Sync'];

  return (
    <div className="w-80 bg-slate-900/20 flex flex-col h-full overflow-y-auto text-slate-200">
      {/* 🤖 Live Autopilot Switch Panel */}
      <div className="p-5 border-b border-slate-900 bg-slate-950/20">
        <div className={`p-4 rounded-xl border flex flex-col gap-3 transition-all ${
          isAi 
            ? 'bg-purple-950/10 border-purple-500/20' 
            : 'bg-blue-950/10 border-blue-500/20'
        }`}>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <Bot size={15} className={isAi ? 'text-purple-400' : 'text-blue-400'} />
              <span>AI Autopilot Status</span>
            </div>
            <button 
              onClick={handleToggleAi}
              className="text-slate-400 hover:text-white transition-colors focus:outline-none"
              aria-label="Toggle AI autopilot"
            >
              {isAi ? (
                <ToggleRight size={38} className="text-purple-500 cursor-pointer" />
              ) : (
                <ToggleLeft size={38} className="text-slate-500 cursor-pointer" />
              )}
            </button>
          </div>
          <p className="text-[10px] leading-relaxed text-slate-400">
            {isAi 
              ? 'AI Bot is automatically resolving customer queries. Click to suspend AI and take over control.'
              : 'Agent manual mode is active. AI will not respond. Click to restore automated autopilot answering.'}
          </p>
        </div>
      </div>

      {/* 👥 CRM Lead Card */}
      <div className="p-5 border-b border-slate-900 space-y-4">
        <div>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">CRM Lead Card</span>
          <h3 className="font-bold text-sm text-slate-200 mt-1">
            {contact.firstName || 'Unknown Lead'}
          </h3>
        </div>

        {/* Lead Stages Indicator */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
            {contact.stage || 'NEW'}
          </span>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
            <Award size={12} className="text-amber-500" />
            <span>Score: <strong className="text-slate-200">{contact.leadScore}</strong></span>
          </div>
        </div>

        {/* Lead Attributes details */}
        <div className="space-y-2.5 text-xs">
          <div className="flex items-center gap-2.5 text-slate-400">
            <Phone size={13} className="text-slate-500" />
            <span className="truncate">{contact.phoneNumber}</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-400">
            <Mail size={13} className="text-slate-500" />
            <span className="truncate">{contact.email || 'no-email@inbound.com'}</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-400">
            <Calendar size={13} className="text-slate-500" />
            <span>Added: {new Date(contact.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* 🏷️ Lead Tags Section */}
      <div className="p-5 border-b border-slate-900 space-y-3">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Lead Tags</span>
        <div className="flex flex-wrap gap-1.5">
          {tagsList.map((tag, idx) => (
            <span
              key={idx}
              className="px-2.5 py-0.5 rounded bg-slate-900 border border-slate-850 text-[10px] text-slate-300 font-semibold"
            >
              {tag}
            </span>
          ))}
          <button className="px-2 py-0.5 rounded border border-dashed border-slate-800 hover:border-slate-600 text-[10px] text-slate-500 hover:text-slate-300 transition-colors">
            + Add Tag
          </button>
        </div>
      </div>

      {/* 📊 Dynamic Custom Parameters Table */}
      <div className="p-5 space-y-3">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Lead Custom fields</span>
        <div className="border border-slate-850 rounded-xl overflow-hidden bg-slate-900/10">
          <table className="w-full text-[11px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-850">
                <th className="px-3 py-2 text-slate-400 font-bold uppercase tracking-wider">Field</th>
                <th className="px-3 py-2 text-slate-400 font-bold uppercase tracking-wider">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/60">
              <tr>
                <td className="px-3 py-2.5 text-slate-500 font-semibold">Volume Category</td>
                <td className="px-3 py-2.5 text-slate-300 font-medium truncate max-w-[120px]">
                  {customFieldsObj.chatVolume || '1,000 - 5,000 / mo'}
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2.5 text-slate-500 font-semibold">Business Niche</td>
                <td className="px-3 py-2.5 text-slate-300 font-medium truncate max-w-[120px]">
                  {customFieldsObj.businessCategory || 'E-commerce Store'}
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2.5 text-slate-500 font-semibold">Lead Source</td>
                <td className="px-3 py-2.5 text-slate-300 font-medium">Inbound Mock API</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

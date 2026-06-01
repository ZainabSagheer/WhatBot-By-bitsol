import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Settings, ShieldCheck, Key, PhoneCall, Radio, Sparkles } from 'lucide-react';

export default function SettingsTab() {
  const { metaPhoneNumberId, workspaceName } = useAuthStore();
  
  const [phoneId, setPhoneId] = useState(metaPhoneNumberId || '1234567890');
  const [wabaId, setWabaId] = useState('waba_mock_id_99');
  const [accessToken, setAccessToken] = useState('mock_meta_access_token_123456');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // Simulate backend API updates latency
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSaveSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-950 p-8 overflow-y-auto flex justify-center items-start">
      <div className="max-w-2xl w-full space-y-6">
        
        {/* 🚀 Tab Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Settings size={20} />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-100">Connect WhatsApp Business</h2>
              <p className="text-[11px] text-slate-500 font-medium">Link your Meta WhatsApp Cloud API credentials to activate automatic AI autopilot support.</p>
            </div>
          </div>
        </div>

        {/* 🏢 Integration Dashboard Form */}
        <div className="glass-panel p-6 bg-slate-900/30 border-slate-850/60 relative overflow-hidden">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Meta Phone Number ID */}
            <div className="space-y-1.5">
              <label htmlFor="phoneId" className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <PhoneCall size={12} className="text-slate-400" />
                Meta Phone Number ID
              </label>
              <input
                type="text"
                id="phoneId"
                value={phoneId}
                onChange={(e) => setPhoneId(e.target.value)}
                placeholder="e.g. 10459203920942"
                required
                className="w-full bg-slate-950 border border-slate-850 rounded-lg px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Meta WABA Account ID */}
            <div className="space-y-1.5">
              <label htmlFor="wabaId" className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Radio size={12} className="text-slate-400" />
                WhatsApp Business Account (WABA) ID
              </label>
              <input
                type="text"
                id="wabaId"
                value={wabaId}
                onChange={(e) => setWabaId(e.target.value)}
                placeholder="e.g. 9840294029482"
                required
                className="w-full bg-slate-950 border border-slate-850 rounded-lg px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Meta System User Token */}
            <div className="space-y-1.5">
              <label htmlFor="accessToken" className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Key size={12} className="text-slate-400" />
                Meta System User Access Token
              </label>
              <textarea
                id="accessToken"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="EAAGdx8..."
                required
                rows={3}
                className="w-full bg-slate-950 border border-slate-850 rounded-lg px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            {/* Save Buttons & Indicators */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 hover:opacity-90 active:scale-95 text-xs font-bold text-white transition-all disabled:opacity-50"
              >
                {isSaving ? 'Saving connection...' : 'Save WhatsApp Connection'}
              </button>

              {saveSuccess && (
                <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold uppercase tracking-wider animate-pulse">
                  <ShieldCheck size={14} />
                  <span>Linked Successfully!</span>
                </div>
              )}
            </div>

          </form>
        </div>

        {/* 🤖 Meta API Connection Status Banner */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-850/60 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Sparkles size={18} className="animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200">Conversiq AI Core Status</h4>
            <p className="text-[11px] text-slate-500 font-medium">Automatic autopilot responder is currently listening to webhook traffic for workspace <strong className="text-slate-400">{workspaceName}</strong>.</p>
          </div>
        </div>

      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { 
  Bot, 
  FileText, 
  Globe, 
  Sliders, 
  Cpu, 
  PlusCircle, 
  UploadCloud, 
  Check, 
  ShieldCheck,
  TrendingUp,
  Brain
} from 'lucide-react';

interface KBItem {
  id: string;
  name: string;
  type: 'PDF' | 'FAQ' | 'URL' | 'DOC';
  status: 'Trained' | 'Processing';
  sizeOrDetails: string;
}

export default function AIChatbotDashboard() {
  
  // 📊 Local state for Knowledge Base items
  const [kbItems, setKbItems] = useState<KBItem[]>([
    { id: '1', name: 'Product_Pricing_Catalog_2026.pdf', type: 'PDF', status: 'Trained', sizeOrDetails: '2.4 MB' },
    { id: '2', name: 'Frequently Asked Questions (Fulfillment).faq', type: 'FAQ', status: 'Trained', sizeOrDetails: '14 Q&As' },
    { id: '3', name: 'https://bitsolmarketing.com/docs/wabot-pro', type: 'URL', status: 'Trained', sizeOrDetails: 'Web Scraped' },
    { id: '4', name: 'Agent_Onboarding_Handbook.docx', type: 'DOC', status: 'Processing', sizeOrDetails: '480 KB' }
  ]);

  // AI Controls state
  const [autonomy, setAutonomy] = useState(82); // Autonomy level slider
  const [tone, setTone] = useState<'Professional' | 'Friendly' | 'Empathetic' | 'Persuasive'>('Friendly');
  const [languages, setLanguages] = useState({
    en: true,
    ur: true,
    ar: false,
    es: false
  });

  // Inputs for adding KB data
  const [newUrl, setNewUrl] = useState('');
  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    const newItem: KBItem = {
      id: Date.now().toString(),
      name: newUrl.startsWith('http') ? newUrl : `https://${newUrl}`,
      type: 'URL',
      status: 'Processing',
      sizeOrDetails: 'Pending Scraping'
    };

    setKbItems([...kbItems, newItem]);
    setNewUrl('');

    // Simulate training completion
    setTimeout(() => {
      setKbItems(prev => prev.map(item => item.id === newItem.id ? { ...item, status: 'Trained', sizeOrDetails: 'Web Scraped' } : item));
    }, 3000);
  };

  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaqQ.trim() || !newFaqA.trim()) return;

    const newItem: KBItem = {
      id: Date.now().toString(),
      name: `Q: ${newFaqQ}`,
      type: 'FAQ',
      status: 'Trained',
      sizeOrDetails: '1 Q&A Added'
    };

    setKbItems([...kbItems, newItem]);
    setNewFaqQ('');
    setNewFaqA('');
  };

  const handleSimulateUpload = () => {
    setIsProcessingUpload(true);
    setUploadSuccess(false);

    setTimeout(() => {
      const newItem: KBItem = {
        id: Date.now().toString(),
        name: 'Autopilot_Support_SOP.pdf',
        type: 'PDF',
        status: 'Trained',
        sizeOrDetails: '1.2 MB'
      };
      setKbItems(prev => [newItem, ...prev]);
      setIsProcessingUpload(false);
      setUploadSuccess(true);
    }, 1500);
  };

  const toggleLanguage = (lang: 'en' | 'ur' | 'ar' | 'es') => {
    setLanguages(prev => ({ ...prev, [lang]: !prev[lang] }));
  };

  return (
    <div className="flex-1 bg-slate-950 p-8 overflow-y-auto flex flex-col h-full text-slate-100 font-sans">
      
      {/* 🚀 Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
          <Bot size={20} />
        </div>
        <div>
          <h2 className="font-bold text-sm text-slate-100">AI Autopilot & Chatbot Console</h2>
          <p className="text-[11px] text-slate-500 font-medium">Fine-tune chatbot personality, upload training literature, and audit resolution diagnostics.</p>
        </div>
      </div>

      {/* 📊 Metrics Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-slate-900/30 border border-slate-850/60 rounded-2xl flex items-center gap-4 shadow-xl">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Brain size={18} />
          </div>
          <div>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">AI Conversations</span>
            <span className="text-sm font-extrabold text-white mt-0.5 block font-mono">1,842</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900/30 border border-slate-850/60 rounded-2xl flex items-center gap-4 shadow-xl">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Check size={18} />
          </div>
          <div>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Resolution Rate</span>
            <span className="text-sm font-extrabold text-white mt-0.5 block font-mono">82%</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900/30 border border-slate-850/60 rounded-2xl flex items-center gap-4 shadow-xl">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <TrendingUp size={18} />
          </div>
          <div>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Escalation Rate</span>
            <span className="text-sm font-extrabold text-white mt-0.5 block font-mono">18% (Takeover)</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900/30 border border-slate-850/60 rounded-2xl flex items-center gap-4 shadow-xl">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Cpu size={18} />
          </div>
          <div>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Avg Response Time</span>
            <span className="text-sm font-extrabold text-white mt-0.5 block font-mono">1.2 seconds</span>
          </div>
        </div>
      </div>

      {/* 🚀 Main Controls & KB Split Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Knowledge Base Organizer */}
        <div className="lg:col-span-7 bg-slate-900/20 border border-slate-850/60 rounded-2xl p-6 space-y-6 shadow-2xl">
          <div>
            <h3 className="text-xs font-bold text-slate-200">Knowledge Base & Training Literature</h3>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mt-0.5">Documents trained on for query resolution</span>
          </div>

          {/* Interactive catalog listing */}
          <div className="border border-slate-850/80 rounded-xl overflow-hidden divide-y divide-slate-850">
            {kbItems.map((item) => (
              <div key={item.id} className="p-3 bg-slate-900/30 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-lg text-slate-400 ${
                    item.type === 'PDF' ? 'bg-red-500/10 text-red-400' :
                    item.type === 'URL' ? 'bg-blue-500/10 text-blue-400' :
                    item.type === 'FAQ' ? 'bg-purple-500/10 text-purple-400' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    <FileText size={14} />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-slate-200 block truncate max-w-[280px]">{item.name}</span>
                    <span className="text-[9px] text-slate-500 font-bold block mt-0.5 uppercase">{item.type} • {item.sizeOrDetails}</span>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                  item.status === 'Trained' 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>

          {/* Add URL or File Simulator */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            
            {/* Scraping Box */}
            <form onSubmit={handleAddUrl} className="p-4 bg-slate-950/40 border border-slate-850/60 rounded-xl space-y-3">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Index Website Domain</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. example.com/faq"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none"
                />
                <button type="submit" title="Index Domain" aria-label="Index Domain" className="p-2 bg-slate-900 border border-slate-800 text-slate-350 hover:text-white rounded-lg transition-colors">
                  <Globe size={13} />
                </button>
              </div>
            </form>

            {/* Document Upload Box */}
            <div className="p-4 bg-slate-950/40 border border-slate-850/60 rounded-xl flex flex-col justify-between gap-3">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Train PDF Documents</span>
              <button 
                onClick={handleSimulateUpload}
                disabled={isProcessingUpload}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 rounded-lg text-xs font-bold text-slate-300 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
              >
                <UploadCloud size={14} className={isProcessingUpload ? 'animate-bounce' : ''} />
                <span>{isProcessingUpload ? 'Reading SOP PDF...' : 'Upload PDF / FAQ File'}</span>
              </button>
              {uploadSuccess && (
                <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider text-center animate-pulse flex items-center justify-center gap-0.5">
                  <ShieldCheck size={11} /> trained successfully!
                </span>
              )}
            </div>

          </div>

          {/* Quick FAQ Draft Box */}
          <form onSubmit={handleAddFaq} className="p-4 bg-slate-950/40 border border-slate-850/60 rounded-xl space-y-3.5">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Draft Canned FAQ Context</span>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Question (e.g. Do you ship to Lahore?)"
                value={newFaqQ}
                onChange={(e) => setNewFaqQ(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none"
              />
              <textarea
                placeholder="Response (e.g. Yes, we deliver orders nationwide with standard COD charges!)"
                value={newFaqA}
                onChange={(e) => setNewFaqA(e.target.value)}
                required
                rows={2}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none resize-none leading-relaxed"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-gradient-to-tr from-purple-600 to-indigo-600 hover:opacity-90 active:scale-95 text-xs font-bold text-white rounded-lg flex items-center gap-1.5 transition-all shadow-md shadow-purple-500/10">
              <PlusCircle size={13} />
              <span>Embed FAQ Context</span>
            </button>
          </form>

        </div>

        {/* Right Side: AI Personality Controls */}
        <div className="lg:col-span-5 bg-slate-900/20 border border-slate-850/60 rounded-2xl p-6 space-y-6 shadow-2xl">
          
          <div>
            <h3 className="text-xs font-bold text-slate-200">AI Personality & Core Settings</h3>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mt-0.5">Control bot response patterns</span>
          </div>

          {/* Autonomy Level Slider */}
          <div className="space-y-3 bg-slate-950/40 p-4 border border-slate-850/60 rounded-xl">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold flex items-center gap-1">
                <Sliders size={13} className="text-purple-400" />
                Autopilot Autonomy
              </span>
              <span className="font-bold text-purple-400 font-mono">{autonomy}% Confidence</span>
            </div>
            <input
              type="range"
              min="50"
              max="99"
              value={autonomy}
              onChange={(e) => setAutonomy(parseInt(e.target.value))}
              title="Autopilot Autonomy Percentage"
              aria-label="Autopilot Autonomy Percentage"
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <p className="text-[9px] leading-relaxed text-slate-500 font-medium">
              Autonomy controls the threshold below which the AI chatbot halts autopilot answering and triggers an automatic human manual takeover alert.
            </p>
          </div>

          {/* Tone Selector */}
          <div className="space-y-1.5">
            <label htmlFor="tone-select" className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Chatbot Brand Tone</label>
            <select
              id="tone-select"
              title="Chatbot Brand Tone"
              value={tone}
              onChange={(e) => setTone(e.target.value as 'Professional' | 'Friendly' | 'Empathetic' | 'Persuasive')}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
            >
              <option value="Friendly">Friendly & Enthusiastic (High Conversion)</option>
              <option value="Professional">Professional & Technical (Helpdesk style)</option>
              <option value="Empathetic">Empathetic & Warm (Support & Health)</option>
              <option value="Persuasive">Bold & Persuasive (Lead Nurturing)</option>
            </select>
          </div>

          {/* Multilingual settings */}
          <div className="space-y-3">
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Supported Languages</label>
            <div className="grid grid-cols-2 gap-3.5">
              
              <div 
                onClick={() => toggleLanguage('en')}
                className={`p-3 border rounded-xl flex items-center justify-between cursor-pointer select-none transition-all ${
                  languages.en 
                    ? 'bg-purple-950/25 border-purple-500/40 text-slate-100' 
                    : 'bg-slate-950/40 border-slate-850/60 text-slate-550 hover:text-slate-350'
                }`}
              >
                <span className="text-xs font-bold">English (UK/US)</span>
                {languages.en && <ShieldCheck size={14} className="text-purple-400" />}
              </div>

              <div 
                onClick={() => toggleLanguage('ur')}
                className={`p-3 border rounded-xl flex items-center justify-between cursor-pointer select-none transition-all ${
                  languages.ur 
                    ? 'bg-purple-950/25 border-purple-500/40 text-slate-100' 
                    : 'bg-slate-950/40 border-slate-850/60 text-slate-550 hover:text-slate-350'
                }`}
              >
                <span className="text-xs font-bold">Urdu (اردو)</span>
                {languages.ur && <ShieldCheck size={14} className="text-purple-400" />}
              </div>

              <div 
                onClick={() => toggleLanguage('ar')}
                className={`p-3 border rounded-xl flex items-center justify-between cursor-pointer select-none transition-all ${
                  languages.ar 
                    ? 'bg-purple-950/25 border-purple-500/40 text-slate-100' 
                    : 'bg-slate-950/40 border-slate-850/60 text-slate-550 hover:text-slate-350'
                }`}
              >
                <span className="text-xs font-bold">Arabic (العربية)</span>
                {languages.ar && <ShieldCheck size={14} className="text-purple-400" />}
              </div>

              <div 
                onClick={() => toggleLanguage('es')}
                className={`p-3 border rounded-xl flex items-center justify-between cursor-pointer select-none transition-all ${
                  languages.es 
                    ? 'bg-purple-950/25 border-purple-500/40 text-slate-100' 
                    : 'bg-slate-950/40 border-slate-850/60 text-slate-550 hover:text-slate-350'
                }`}
              >
                <span className="text-xs font-bold">Spanish (Español)</span>
                {languages.es && <ShieldCheck size={14} className="text-purple-400" />}
              </div>

            </div>
          </div>

          {/* SLA Security Warning */}
          <div className="p-4 bg-slate-900 border border-slate-850 rounded-xl text-[10px] text-slate-400 leading-relaxed font-semibold">
            🤖 **AI Training Notice**: WABot Pro executes periodic LLM retraining models internally when new context cards are seeded. Updates take roughly 2-3 minutes to reflect inside the sandbox webhook.
          </div>

        </div>

      </div>

    </div>
  );
}

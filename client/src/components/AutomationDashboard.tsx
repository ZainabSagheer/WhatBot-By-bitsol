import React, { useState } from 'react';
import { 
  GitBranch, 
  Play, 
  PlusCircle, 
  MessageSquare, 
  Key, 
  Bot, 
  UserPlus, 
  UserCheck, 
  Database,
  ArrowDown,
  Trash2,
  Activity,
  LucideIcon
} from 'lucide-react';

interface FlowNode {
  id: string;
  type: 'trigger' | 'action' | 'crm' | 'routing';
  title: string;
  details: string;
  icon: LucideIcon;
  color: string;
  glow: string;
  x: number; // canvas position
  y: number;
}

export default function AutomationDashboard() {
  
  // ⚙️ Initial Flow Nodes mapping the example spec:
  // Customer Message → Keyword Match → AI Response → Lead Created → Agent Assigned → CRM Updated
  const initialNodes: FlowNode[] = [
    { id: '1', type: 'trigger', title: 'Customer Message', details: 'Triggers on any incoming WhatsApp text', icon: MessageSquare, color: 'border-blue-500 bg-blue-950/20 text-blue-400', glow: 'shadow-blue-500/10', x: 50, y: 30 },
    { id: '2', type: 'action', title: 'Keyword Match', details: 'Checks if message matches key "price" or "quote"', icon: Key, color: 'border-amber-500 bg-amber-950/20 text-amber-400', glow: 'shadow-amber-500/10', x: 50, y: 150 },
    { id: '3', type: 'action', title: 'AI Response', details: 'Autopilot responds with SOP pricing templates', icon: Bot, color: 'border-purple-500 bg-purple-950/20 text-purple-400', glow: 'shadow-purple-500/10', x: 50, y: 270 },
    { id: '4', type: 'crm', title: 'Lead Created', details: 'Pushes contact to CRM stage: "New Lead"', icon: UserPlus, color: 'border-emerald-500 bg-emerald-950/20 text-emerald-400', glow: 'shadow-emerald-500/10', x: 50, y: 390 },
    { id: '5', type: 'routing', title: 'Agent Assigned', details: 'Auto-assigns manual fallback session to Zainab S.', icon: UserCheck, color: 'border-cyan-500 bg-cyan-950/20 text-cyan-400', glow: 'shadow-cyan-500/10', x: 50, y: 510 },
    { id: '6', type: 'crm', title: 'CRM Updated', details: 'Syncs lead score value to Google Sheets', icon: Database, color: 'border-fuchsia-500 bg-fuchsia-950/20 text-fuchsia-400', glow: 'shadow-fuchsia-500/10', x: 50, y: 630 }
  ];

  const [nodes, setNodes] = useState<FlowNode[]>(initialNodes);
  
  // 🌀 Flow Execution Test Simulation State
  const [activeSimulationNode, setActiveSimulationNode] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Trigger simulated flow tracing
  const handleTestFlowSimulation = async () => {
    if (isSimulating) return;
    setIsSimulating(true);

    for (let i = 0; i < nodes.length; i++) {
      setActiveSimulationNode(nodes[i].id);
      await new Promise(resolve => setTimeout(resolve, 800)); // Paced data tracing
    }

    setActiveSimulationNode(null);
    setIsSimulating(false);
  };

  // Node adding state
  const handleAddCustomNode = () => {
    const nextId = (nodes.length + 1).toString();
    const newNode: FlowNode = {
      id: nextId,
      type: 'action',
      title: 'Slack Notification',
      details: 'Dispatches alert notification to operations slack channel',
      icon: Activity,
      color: 'border-pink-500 bg-pink-950/20 text-pink-400',
      glow: 'shadow-pink-500/10',
      x: 50,
      y: 30 + nodes.length * 120
    };
    setNodes([...nodes, newNode]);
  };

  const handleDeleteNode = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="flex-1 bg-slate-950 p-8 overflow-y-auto flex flex-col h-full text-slate-100 font-sans">
      
      {/* 🚀 Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <GitBranch size={20} />
          </div>
          <div>
            <h2 className="font-bold text-sm text-slate-100">Visual Automation Builder</h2>
            <p className="text-[11px] text-slate-500 font-medium">Link event triggers, custom keyword criteria, and CRM automation blocks in standard logical structures.</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={handleTestFlowSimulation}
            disabled={isSimulating}
            className="px-4 py-2 bg-gradient-to-tr from-cyan-600 to-blue-600 hover:opacity-90 active:scale-95 text-xs font-bold text-white rounded-xl flex items-center gap-1.5 shadow-lg shadow-cyan-500/10 transition-all disabled:opacity-50"
          >
            <Play size={13} className={isSimulating ? 'animate-spin' : ''} />
            <span>{isSimulating ? 'Tracing flow...' : 'Test Flow Automation'}</span>
          </button>
          
          <button 
            onClick={handleAddCustomNode}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-350 hover:text-white rounded-xl flex items-center gap-1.5 transition-all"
          >
            <PlusCircle size={13} />
            <span>Add Node</span>
          </button>
        </div>
      </div>

      {/* 🚀 Split Canvas and Info Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1 min-h-[500px]">
        
        {/* Left Side: Visual Interactive Canvas Area */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-850/60 rounded-2xl p-8 relative min-h-[640px] flex flex-col items-center justify-start shadow-2xl overflow-hidden bg-[linear-gradient(rgba(15,23,42,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.4)_1px,transparent_1px)] bg-[size:24px_24px]">
          
          {/* Overlay glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full filter blur-3xl pointer-events-none" />

          {/* Draggable Node Blocks Stack */}
          <div className="relative z-10 w-full max-w-lg space-y-4 flex flex-col items-center">
            {nodes.map((node, index) => {
              const Icon = node.icon;
              const isActiveSim = node.id === activeSimulationNode;

              return (
                <React.Fragment key={node.id}>
                  
                  {/* Visual Node Box */}
                  <div
                    className={`w-full max-w-md p-4 border rounded-2xl shadow-xl transition-all duration-300 relative group flex items-start gap-4 ${
                      isActiveSim 
                        ? 'border-cyan-400 bg-cyan-950/20 scale-[1.03] ring-1 ring-cyan-500/30' 
                        : 'border-slate-850 bg-slate-900/40 hover:border-slate-750'
                    } ${node.glow}`}
                  >
                    
                    {/* Node status light (simulations) */}
                    {isActiveSim && (
                      <span className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-cyan-400 rounded-full animate-ping border-2 border-slate-950" />
                    )}

                    {/* Node Icon */}
                    <div className={`p-2.5 rounded-xl border flex-shrink-0 ${node.color}`}>
                      <Icon size={16} />
                    </div>

                    {/* Node contents */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-slate-200 block truncate group-hover:text-blue-400 transition-colors">
                          {node.title}
                        </span>
                        <span className="text-[8px] font-bold text-slate-550 tracking-wider uppercase bg-slate-950 border border-slate-850 px-1.5 py-0.2 rounded-md">
                          {node.type}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-1">
                        {node.details}
                      </p>
                    </div>

                    {/* Delete trigger */}
                    <button 
                      onClick={() => handleDeleteNode(node.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-slate-950 border border-slate-850 hover:bg-slate-900 text-rose-500 transition-all focus:outline-none"
                      aria-label="Delete node"
                    >
                      <Trash2 size={12} />
                    </button>

                  </div>

                  {/* Flow Connection Arrow SVG */}
                  {index < nodes.length - 1 && (
                    <div className="flex flex-col items-center py-0.5">
                      <ArrowDown size={14} className={`${
                        isActiveSim 
                          ? 'text-cyan-400 scale-110 animate-bounce' 
                          : 'text-slate-700'
                      } transition-all`} />
                    </div>
                  )}

                </React.Fragment>
              );
            })}
          </div>

        </div>

        {/* Right Side: Builder Settings Help */}
        <div className="lg:col-span-4 bg-slate-900/20 border border-slate-850/60 rounded-2xl p-6 space-y-6 shadow-2xl h-full">
          
          <div>
            <h3 className="text-xs font-bold text-slate-200">Automation Settings</h3>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mt-0.5">Workflow guidelines & tutorials</span>
          </div>

          {/* Drag & drop visual builder card */}
          <div className="bg-slate-950/40 p-4 border border-slate-850/60 rounded-xl space-y-3.5 text-xs text-slate-400">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Flow Guidelines</span>
            <p className="leading-relaxed font-semibold">
              WABot Pro features standard visual connectors between logical nodes. Each trigger automatically queues incoming WhatsApp event webhooks.
            </p>
            <ul className="space-y-2 font-medium">
              <li className="flex gap-2">
                <span className="text-blue-400 font-bold font-mono">1.</span>
                <span>Keyword Match criteria are non-case-sensitive.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-purple-400 font-bold font-mono">2.</span>
                <span>AI response models auto-sync to current trained context.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-400 font-bold font-mono">3.</span>
                <span>Google Sheets integration auto-creates pipeline rows.</span>
              </li>
            </ul>
          </div>

          {/* Quick Flow Diagnostics */}
          <div className="space-y-3">
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Simulation Status</label>
            <div className="p-4 bg-slate-950 border border-slate-850/60 rounded-xl flex items-center gap-3.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isSimulating ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-850 text-slate-500'
              }`}>
                <Activity size={15} className={isSimulating ? 'animate-pulse' : ''} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-200 block">
                  {isSimulating ? 'Flow Test Active' : 'Flow Test Standby'}
                </span>
                <span className="text-[9px] text-slate-500 font-semibold block mt-0.5">
                  {isSimulating ? 'Tracing sequentials in real-time' : 'Click "Test Flow Automation" above'}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

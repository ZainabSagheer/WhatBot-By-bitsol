import React, { useState, useEffect, useRef } from 'react';
import { useChatStore, Message } from '../store/useChatStore';
import { Send, Bot, Check, CheckCheck, MessageSquareCode, Sparkles } from 'lucide-react';

export default function ChatWindow() {
  const { conversations, activeConversationId, messages, sendAgentMessage } = useChatStore();
  const [inputText, setInputText] = useState('');
  const timelineEndRef = useRef<HTMLDivElement>(null);

  // Retrieve details for currently selected conversation
  const chat = conversations.find((c) => c.id === activeConversationId);

  // Auto Scroll to bottom of timeline when messages list updates
  useEffect(() => {
    timelineEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!chat) {
    return (
      <div className="flex-1 bg-slate-950 flex flex-col items-center justify-center text-center p-8">
        <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-850 flex items-center justify-center mb-4 text-blue-500 shadow-xl shadow-blue-500/5">
          <MessageSquareCode size={28} />
        </div>
        <h3 className="text-slate-200 font-bold text-sm">No Conversation Selected</h3>
        <p className="text-slate-500 text-xs mt-1 max-w-sm">
          Select a WhatsApp chat thread from the left list to view customer context, load chat histories, and toggle agent takeover settings.
        </p>
      </div>
    );
  }

  const isAi = chat.contact.isAiEnabled;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    await sendAgentMessage(inputText);
    setInputText('');
  };

  // Canned replies registry
  const cannedReplies = [
    { title: 'Send Pricing PKR', text: 'Conversiq AI package costs just PKR 20,000 one-time setup investment. Sync includes lifetime telemetry updates, custom sheets, and 24/7 AI chatbot tunings.' },
    { title: 'Request Call', text: 'Sure! Please share your available time slot so we can schedule a quick integration call with our BITSOL Marketing experts.' },
    { title: 'Onboarding complete', text: 'Perfect! Your sandbox setup is complete. Feel free to send test messages to see the AI engine respond in real-time!' },
  ];

  const handleApplyCanned = (text: string) => {
    setInputText(text);
  };

  return (
    <div className="flex-1 bg-slate-950 flex flex-col h-full border-r border-slate-900">
      {/* 🚀 Active Chat Top Bar */}
      <div className="h-16 px-6 border-b border-slate-900 flex items-center justify-between bg-slate-900/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-blue-400">
            {chat.contact.firstName?.substring(0, 2).toUpperCase() || 'CQ'}
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-200">{chat.contact.firstName || chat.contact.phoneNumber}</h3>
            <span className="text-[10px] text-slate-500 font-medium">{chat.contact.phoneNumber}</span>
          </div>
        </div>

        {/* 🤖 Live Autopilot Status Flag */}
        <div className="flex items-center gap-2">
          {isAi ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-950/40 border border-purple-500/20 text-purple-400">
              <Sparkles size={12} className="animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider">AI Autopilot Live</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-950/40 border border-blue-500/20 text-blue-400">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Agent Takeover active</span>
            </div>
          )}
        </div>
      </div>

      {/* 💬 Dynamic Conversation Timeline */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-950/40">
        {messages.length === 0 ? (
          <div className="p-8 text-center text-slate-500 italic text-xs">
            Start the conversation. No messages logged.
          </div>
        ) : (
          messages.map((msg: Message) => {
            const isInbound = msg.direction === 'INBOUND';
            const isBot = msg.direction === 'OUTBOUND' && !msg.senderId;

            return (
              <div key={msg.id} className={`flex ${isInbound ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-md ${
                  isInbound 
                    ? 'bg-slate-900 text-slate-100 border border-slate-800/60' 
                    : isBot
                      ? 'bg-gradient-to-tr from-slate-900 to-purple-950 border border-purple-900/40 text-slate-100'
                      : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white'
                }`}>
                  {/* Outbound Author Indicator */}
                  {isBot && (
                    <div className="flex items-center gap-1 mb-1 text-[9px] font-bold text-purple-400 uppercase tracking-wider">
                      <Bot size={10} />
                      <span>Conversiq AI</span>
                    </div>
                  )}
                  
                  {/* Message Body Content */}
                  <p className="text-xs leading-relaxed font-medium whitespace-pre-wrap">{msg.textContent}</p>
                  
                  {/* Delivery Status and Time ticks */}
                  <div className="flex justify-end items-center gap-1 mt-1.5">
                    <span className="text-[9px] text-slate-500 font-bold">
                      {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {!isInbound && (
                      <span className="text-slate-400">
                        {msg.status === 'READ' ? (
                          <CheckCheck size={12} className="text-emerald-400" />
                        ) : msg.status === 'DELIVERED' ? (
                          <CheckCheck size={12} className="text-slate-500" />
                        ) : (
                          <Check size={12} className="text-slate-600" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={timelineEndRef} />
      </div>

      {/* ⚙️ Canned Quick Replies Dock */}
      <div className="px-6 py-2 bg-slate-900/20 border-t border-slate-900 flex items-center gap-2 overflow-x-auto">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex-shrink-0">Canned:</span>
        {cannedReplies.map((reply, idx) => (
          <button
            key={idx}
            onClick={() => handleApplyCanned(reply.text)}
            className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-850 hover:bg-slate-800 text-[10px] text-slate-300 font-semibold transition-all whitespace-nowrap"
          >
            {reply.title}
          </button>
        ))}
      </div>

      {/* 🎮 Outbound Send Message Console */}
      <form onSubmit={handleSend} className="p-4 border-t border-slate-900 bg-slate-900/10 flex gap-2">
        <input
          type="text"
          placeholder={isAi ? "Autopilot active. Type to takeover..." : "Reply to customer..."}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
        <button
          type="submit"
          className="px-4 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 hover:opacity-90 active:scale-95 text-white flex items-center justify-center gap-1.5 transition-all"
        >
          <Send size={14} />
          <span className="text-xs font-bold">Send</span>
        </button>
      </form>
    </div>
  );
}

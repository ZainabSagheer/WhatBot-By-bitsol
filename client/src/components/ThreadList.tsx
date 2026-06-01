import React, { useState } from 'react';
import { useChatStore } from '../store/useChatStore';
import { Bot, User, Search, MessageSquareCode } from 'lucide-react';

export default function ThreadList() {
  const { conversations, activeConversationId, selectConversation, isLoading } = useChatStore();
  const [activeTab, setActiveTab] = useState<'ALL' | 'MY_CHATS' | 'AI'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // 🔎 Filter & Query conversations
  const filteredConversations = conversations.filter((chat) => {
    const matchesSearch =
      chat.contact.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.contact.phoneNumber.includes(searchQuery);

    if (!matchesSearch) return false;

    if (activeTab === 'MY_CHATS') {
      return !chat.contact.isAiEnabled; // Agent manual control (Autopilot Takeover active)
    }
    if (activeTab === 'AI') {
      return chat.contact.isAiEnabled; // AI Bot handling thread automatically
    }
    return true; // All threads
  });

  return (
    <div className="w-80 bg-slate-900/40 border-r border-slate-800/60 flex flex-col h-full">
      {/* 🔍 Search Input Bar */}
      <div className="p-4 border-b border-slate-800/60">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/60 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* 📑 Filter Tabs (ALL / MANUAL CHATS / AI CHATS) */}
      <div className="flex border-b border-slate-800/60 px-2 py-2.5 gap-1 bg-slate-950/20">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`flex-1 py-1.5 rounded-md text-[10px] font-bold tracking-wider uppercase transition-all ${
            activeTab === 'ALL'
              ? 'bg-slate-800 text-slate-200 border border-slate-700'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveTab('MY_CHATS')}
          className={`flex-1 py-1.5 rounded-md text-[10px] font-bold tracking-wider uppercase transition-all ${
            activeTab === 'MY_CHATS'
              ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Manual
        </button>
        <button
          onClick={() => setActiveTab('AI')}
          className={`flex-1 py-1.5 rounded-md text-[10px] font-bold tracking-wider uppercase transition-all ${
            activeTab === 'AI'
              ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Autopilot
        </button>
      </div>

      {/* 💬 Scrollable Conversation Threads Grid */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
        {isLoading && conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center gap-2">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-slate-500 font-medium">Syncing inbox...</span>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquareCode size={32} className="mx-auto text-slate-700 mb-2" />
            <p className="text-xs text-slate-500 font-semibold">No active threads found</p>
          </div>
        ) : (
          filteredConversations.map((chat) => {
            const isActive = chat.id === activeConversationId;
            const latestMsg = chat.messages?.[0];
            const isAi = chat.contact.isAiEnabled;

            return (
              <div
                key={chat.id}
                onClick={() => selectConversation(chat.id)}
                className={`p-4 flex gap-3 cursor-pointer transition-all hover:bg-slate-800/40 relative ${
                  isActive ? 'bg-slate-800/80 border-l-2 border-blue-500' : ''
                }`}
              >
                {/* 👤 Contact avatar logo */}
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 shadow-sm">
                    {chat.contact.firstName?.substring(0, 2).toUpperCase() || 'CQ'}
                  </div>
                  {/* Active Autopilot Badge */}
                  <div className={`absolute -bottom-1 -right-1 p-0.5 rounded-full ${isAi ? 'bg-purple-600' : 'bg-blue-600'} text-white border border-slate-900`}>
                    {isAi ? <Bot size={10} /> : <User size={10} />}
                  </div>
                </div>

                {/* 📝 Thread Information */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="text-xs font-bold truncate text-slate-200">
                      {chat.contact.firstName || chat.contact.phoneNumber}
                    </h4>
                    <span className="text-[9px] text-slate-500 font-medium">
                      {new Date(chat.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate font-medium">
                    {latestMsg ? (
                      <>
                        {latestMsg.direction === 'OUTBOUND' ? (
                          <span className="text-slate-500">{latestMsg.senderId ? 'You: ' : '[AI Bot]: '}</span>
                        ) : null}
                        {latestMsg.textContent}
                      </>
                    ) : (
                      <span className="text-slate-500 italic">No messages logged</span>
                    )}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';
import ChatWindow from './ChatWindow';
import CRMPanel from './CRMPanel';
import { 
  Inbox, 
  MessageCircle, 
  Bot, 
  User, 
  Flame, 
  Archive,
  Search,
  Tag
} from 'lucide-react';

export default function SharedInboxTab() {
  const { conversations, activeConversationId, selectConversation, isLoading } = useChatStore();
  const { userFullName } = useAuthStore();
  
  const [subTab, setSubTab] = useState<'all' | 'unread' | 'ai' | 'assigned' | 'high' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 🔍 Far-Left Sub-Navigation Items
  const subNavItems = [
    { id: 'all', label: 'All Chats', icon: Inbox, count: conversations.length },
    { id: 'unread', label: 'Unread', icon: MessageCircle, count: Math.ceil(conversations.length * 0.3) },
    { id: 'ai', label: 'AI Handled', icon: Bot, count: conversations.filter(c => c.contact.isAiEnabled).length },
    { id: 'assigned', label: 'Assigned To Me', icon: User, count: conversations.filter(c => !c.contact.isAiEnabled).length },
    { id: 'high', label: 'High Priority', icon: Flame, count: 2 },
    { id: 'archived', label: 'Archived', icon: Archive, count: 0 },
  ] as const;

  // 🔎 Filter conversations by both Search Query and Sub-Tab category
  const filteredConversations = conversations.filter((chat) => {
    // Search query matches name or phone
    const matchesSearch =
      chat.contact.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.contact.phoneNumber.includes(searchQuery);

    if (!matchesSearch) return false;

    // Sub-tab selection filter
    if (subTab === 'unread') {
      // simulate unread by checking odd indexes or odd IDs
      return chat.id.charCodeAt(chat.id.length - 1) % 2 === 0;
    }
    if (subTab === 'ai') {
      return chat.contact.isAiEnabled;
    }
    if (subTab === 'assigned') {
      return !chat.contact.isAiEnabled && chat.contact.assignedUserId !== null;
    }
    if (subTab === 'high') {
      return chat.contact.leadScore > 60;
    }
    return true; // All or archived
  });

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-slate-950 font-sans">
      
      {/* 📥 Far-Left Sub-Sidebar Panel */}
      <div className="w-56 bg-slate-900/60 border-r border-slate-800/80 flex flex-col h-full flex-shrink-0">
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Inbox Segments</span>
          <span className="text-[9px] font-bold px-1.5 py-0.2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md">Live</span>
        </div>
        <div className="flex-1 p-2 space-y-1 overflow-y-auto">
          {subNavItems.map((item) => {
            const Icon = item.icon;
            const isSelected = subTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setSubTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all focus:outline-none ${
                  isSelected
                    ? 'bg-slate-800 text-slate-100 border border-slate-750'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={14} className={isSelected ? 'text-blue-400' : 'text-slate-500'} />
                  <span>{item.label}</span>
                </div>
                {item.count > 0 && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-md font-bold ${
                    isSelected ? 'bg-blue-600/15 text-blue-400' : 'bg-slate-950/40 text-slate-500 border border-slate-850'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 💬 Center Panel: Conversation Selector List */}
      <div className="w-80 bg-slate-900/20 border-r border-slate-800/80 flex flex-col h-full flex-shrink-0">
        
        {/* Search */}
        <div className="p-4 border-b border-slate-800/80">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search active chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-850 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Dynamic Chats List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-900/40">
          {isLoading && conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center gap-2 h-64">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-slate-500 font-semibold">Loading messages...</span>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center mt-8">
              <MessageCircle size={28} className="mx-auto text-slate-800 mb-2" />
              <p className="text-xs text-slate-500 font-bold">No active conversations</p>
            </div>
          ) : (
            filteredConversations.map((chat) => {
              const isActive = chat.id === activeConversationId;
              const isAi = chat.contact.isAiEnabled;
              const latestMsg = chat.messages?.[0];

              // Mock tag labels
              const tagLabels = chat.contact.tags ? chat.contact.tags.split(',').slice(0, 1) : ['Hot Deal'];

              return (
                <div
                  key={chat.id}
                  onClick={() => selectConversation(chat.id)}
                  className={`p-4 flex gap-3 cursor-pointer transition-all hover:bg-slate-900/40 relative border-l-2 ${
                    isActive 
                      ? 'bg-slate-900/80 border-l-blue-500' 
                      : 'border-l-transparent'
                  }`}
                >
                  
                  {/* Avatar & Autopilot Ring */}
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-850 border border-slate-750 flex items-center justify-center text-xs font-bold text-slate-350 shadow-md">
                      {chat.contact.firstName?.substring(0, 2).toUpperCase() || 'CQ'}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 p-0.5 rounded-full text-white border border-slate-950 ${
                      isAi ? 'bg-purple-600' : 'bg-blue-600'
                    }`}>
                      {isAi ? <Bot size={9} /> : <User size={9} />}
                    </div>
                  </div>

                  {/* Conversation Meta */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="text-xs font-bold truncate text-slate-200">
                        {chat.contact.firstName || chat.contact.phoneNumber}
                      </h4>
                      <span className="text-[9px] text-slate-500 font-bold font-mono">
                        {new Date(chat.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 truncate font-semibold leading-relaxed">
                      {latestMsg ? (
                        <>
                          {latestMsg.direction === 'OUTBOUND' ? (
                            <span className="text-slate-500">{latestMsg.senderId ? 'You: ' : '[AI]: '}</span>
                          ) : null}
                          {latestMsg.textContent}
                        </>
                      ) : (
                        <span className="text-slate-500 italic">No messages found</span>
                      )}
                    </p>

                    {/* Tag + Agent Badge */}
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {tagLabels.map((tag, idx) => (
                        <span 
                          key={idx}
                          className="px-1.5 py-0.2 rounded bg-slate-950/60 border border-slate-850 text-[9px] font-bold text-slate-400 flex items-center gap-0.5"
                        >
                          <Tag size={8} />
                          <span>{tag.trim()}</span>
                        </span>
                      ))}
                      <span className="text-[9px] font-bold text-slate-500">
                        {isAi ? 'AI Autopilot' : `Agent: ${userFullName}`}
                      </span>
                    </div>

                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>

      {/* 💬 Middle Panel: Conversation Message Timeline Window */}
      <ChatWindow />

      {/* 👥 Right Panel: Customer CRM Detail drawer */}
      <CRMPanel />

    </div>
  );
}

import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

export interface Message {
  id: string;
  workspaceId: string;
  conversationId: string;
  metaMessageId: string | null;
  direction: 'INBOUND' | 'OUTBOUND';
  senderId: string | null;
  textContent: string | null;
  mediaUrl: string | null;
  mediaType: string | null;
  status: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  failedReason: string | null;
  sentAt: string;
  deliveredAt: string | null;
  readAt: string | null;
}

export interface Contact {
  id: string;
  workspaceId: string;
  phoneNumber: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  stage: string;
  leadScore: number;
  customFields: string;
  tags: string;
  isAiEnabled: boolean;
  assignedUserId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  workspaceId: string;
  contactId: string;
  isOpen: boolean;
  assignedUserId: string | null;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  contact: Contact;
  messages?: Message[];
}

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Message[];
  socket: Socket | null;
  isLoading: boolean;
  
  // Actions
  fetchConversations: (workspaceId: string) => Promise<void>;
  selectConversation: (conversationId: string) => Promise<void>;
  sendAgentMessage: (textContent: string) => Promise<void>;
  toggleAutopilot: (contactId: string, isAiEnabled: boolean) => Promise<void>;
  initSocket: (workspaceId: string) => void;
  cleanupSocket: () => void;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: [],
  socket: null,
  isLoading: false,

  // 1. Fetch all conversations belonging to this tenant workspace
  fetchConversations: async (workspaceId) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/chats?workspaceId=${workspaceId}`);
      if (!response.ok) throw new Error('Failed to load conversations.');
      const data = await response.json();
      set({ conversations: data, isLoading: false });
    } catch (error) {
      console.error('Error fetching conversations:', error);
      set({ isLoading: false });
    }
  },

  // 2. Select thread and load message history
  selectConversation: async (conversationId) => {
    set({ activeConversationId: conversationId, isLoading: true });
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/chats/${conversationId}/messages`);
      if (!response.ok) throw new Error('Failed to load messages.');
      const messages = await response.json();
      set({ messages, isLoading: false });
    } catch (error) {
      console.error('Error fetching message timeline:', error);
      set({ isLoading: false });
    }
  },

  // 3. Send manual outbound reply from agent
  sendAgentMessage: async (textContent) => {
    const { activeConversationId } = get();
    if (!activeConversationId) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/chats/${activeConversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textContent }),
      });

      if (!response.ok) throw new Error('Failed to send outbound message.');
      const newMessage = await response.json();

      // Append only if it wasn't already added by the WebSocket message_received event (prevents race condition duplicates)
      set((state) => {
        const exists = state.messages.some((m) => m.id === newMessage.id || (m.metaMessageId && m.metaMessageId === newMessage.metaMessageId));
        return {
          messages: exists ? state.messages : [...state.messages, newMessage],
        };
      });
    } catch (error) {
      console.error('Error sending agent reply:', error);
    }
  },

  // 4. Toggle Lead Autopilot state (Agent Takeover flag)
  toggleAutopilot: async (contactId, isAiEnabled) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/contacts/${contactId}/ai`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAiEnabled }),
      });

      if (!response.ok) throw new Error('Failed to update autopilot flag.');
      const updatedContact = await response.json();

      // Update in active conversations list local store
      set((state) => ({
        conversations: state.conversations.map((chat) => 
          chat.contactId === contactId 
            ? { ...chat, contact: { ...chat.contact, isAiEnabled: updatedContact.isAiEnabled } }
            : chat
        ),
      }));
    } catch (error) {
      console.error('Error toggling autopilot status:', error);
    }
  },

  // 5. Initialize WebSockets client & real-time hooks
  initSocket: (workspaceId) => {
    const existingSocket = get().socket;
    if (existingSocket) return; // Prevent double listeners

    const socketInstance = io(BACKEND_URL, {
      reconnectionAttempts: 3,
      timeout: 2000,
      transports: ['websocket']
    });

    // Join tenant isolation room
    socketInstance.emit('join_workspace', workspaceId);

    interface EventPayload {
      event: string;
      data: {
        message?: Message;
        conversationId?: string;
        contact?: Contact;
        messageId?: string;
        status?: Message['status'];
      };
    }

    // Socket.io Webhooks update router
    socketInstance.on('new_event', (payload: EventPayload) => {
      const { event, data } = payload;
      const { activeConversationId } = get();

      console.log(`📡 WebSocket Event Received: ${event}`, data);

      if (event === 'message_received') {
        const { message, conversationId, contact } = data;
        if (!message || !conversationId) return;

        // If message is for the currently selected conversation, append it in real time
        if (conversationId === activeConversationId) {
          set((state) => {
            // Prevent duplicate message renders (since agent replies are optimistically committed)
            const exists = state.messages.some((m) => m.id === message.id || (m.metaMessageId && m.metaMessageId === message.metaMessageId));
            return {
              messages: exists ? state.messages : [...state.messages, message],
            };
          });
        }

        // Update the conversation's lastMessageAt and sort order in the sidebar thread list
        set((state) => {
          const chatIndex = state.conversations.findIndex((c) => c.id === conversationId);

          if (chatIndex !== -1) {
            // Existing thread: Update timestamp
            const updatedConversations = [...state.conversations];
            updatedConversations[chatIndex] = {
              ...updatedConversations[chatIndex],
              lastMessageAt: message.sentAt,
            };
            // Sort by latest message
            return {
              conversations: updatedConversations.sort((a, b) => 
                new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
              ),
            };
          } else if (contact) {
            // New thread received: Append to list
            const newChat: Conversation = {
              id: conversationId,
              workspaceId,
              contactId: contact.id,
              isOpen: true,
              assignedUserId: null,
              lastMessageAt: message.sentAt,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              contact,
            };
            return {
              conversations: [newChat, ...state.conversations],
            };
          }
          return {};
        });
      }

      if (event === 'message_status_updated') {
        const { messageId, status, conversationId } = data;
        if (!messageId || !status) return;

        if (conversationId === activeConversationId) {
          set((state) => ({
            messages: state.messages.map((m) =>
              m.id === messageId ? { ...m, status } : m
            ),
          }));
        }
      }
    });

    set({ socket: socketInstance });
    console.log('🔌 Socket.io WebSockets link successfully established.');
  },

  // 6. Cleanup sockets on logout/tab close
  cleanupSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
      console.log('🔌 Socket.io WebSockets connection terminated.');
    }
  },
}));

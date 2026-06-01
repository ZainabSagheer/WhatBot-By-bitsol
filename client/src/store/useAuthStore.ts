import { create } from 'zustand';

export type ActiveTab = 'dashboard' | 'inbox' | 'crm' | 'chatbot' | 'campaigns' | 'automation' | 'settings';

interface AuthState {
  workspaceId: string | null;
  workspaceName: string | null;
  metaPhoneNumberId: string | null;
  userEmail: string | null;
  userFullName: string | null;
  isLoading: boolean;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  setSandboxSession: (data: {
    workspaceId: string;
    workspaceName: string;
    metaPhoneNumberId: string;
    userEmail: string;
    userFullName: string;
  }) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Initialize with standard sandbox test credentials (matches our backend seed script)
  workspaceId: null,
  workspaceName: 'BITSOL Support Sandbox',
  metaPhoneNumberId: '1234567890',
  userEmail: 'support@bitsolmarketing.com',
  userFullName: 'Zainab Sagheer',
  isLoading: false,
  activeTab: 'dashboard',

  setActiveTab: (tab) => set({ activeTab: tab }),

  setSandboxSession: (data) =>
    set({
      workspaceId: data.workspaceId,
      workspaceName: data.workspaceName,
      metaPhoneNumberId: data.metaPhoneNumberId,
      userEmail: data.userEmail,
      userFullName: data.userFullName,
    }),
}));

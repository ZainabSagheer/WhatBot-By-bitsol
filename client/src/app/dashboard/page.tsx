'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useChatStore } from '../../store/useChatStore';
import Sidebar from '../../components/Sidebar';
import DashboardHome from '../../components/DashboardHome';
import SharedInboxTab from '../../components/SharedInboxTab';
import CRMDashboard from '../../components/CRMDashboard';
import AIChatbotDashboard from '../../components/AIChatbotDashboard';
import CampaignDashboard from '../../components/CampaignDashboard';
import AutomationDashboard from '../../components/AutomationDashboard';
import SettingsTab from '../../components/SettingsTab';

export default function DashboardPage() {
  const { workspaceName, metaPhoneNumberId, userEmail, userFullName, setSandboxSession, activeTab } = useAuthStore();
  const { initSocket, cleanupSocket, fetchConversations } = useChatStore();

  useEffect(() => {
    // 🎁 Self-Seeding Sandbox Initializer
    async function bootstrapSandbox() {
      console.log('🌱 Bootstrapping sandbox workspace inside database...');
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
        
        // Add 600ms fetch timeout controller
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 600);

        const response = await fetch(`${backendUrl}/api/v1/setup-sandbox`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workspaceName,
            metaPhoneNumberId,
            email: userEmail,
            fullName: userFullName,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) throw new Error('Failed to seed sandbox.');
        const result = await response.json();
        
        const seededWorkspaceId = result.workspace.id;
        console.log(`✅ Sandbox workspace established. Workspace ID: ${seededWorkspaceId}`);

        // Commit seeded ID to global Zustand authentication session store
        setSandboxSession({
          workspaceId: seededWorkspaceId,
          workspaceName: result.workspace.name,
          metaPhoneNumberId: result.workspace.metaPhoneNumberId,
          userEmail: result.user.email,
          userFullName: result.user.fullName,
        });

        // Initialize REST query fetches & WebSocket channels
        await fetchConversations(seededWorkspaceId);
        initSocket(seededWorkspaceId);

      } catch (error) {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
        console.error(`❌ Failed to self-seed sandbox. Ensure backend server is running on ${backendUrl}`, error);
        
        // 🔮 Robust Offline Fallback Seeding
        console.log('🔮 Seeding mock offline workspace session...');
        const offlineId = 'sandbox-fallback-id-123';
        setSandboxSession({
          workspaceId: offlineId,
          workspaceName: workspaceName || 'BITSOL Support Sandbox',
          metaPhoneNumberId: metaPhoneNumberId || '1234567890',
          userEmail: userEmail || 'support@bitsolmarketing.com',
          userFullName: userFullName || 'Zainab Sagheer',
        });
      }
    }

    bootstrapSandbox();

    // Cleanup Socket connections when navigating away
    return () => {
      cleanupSocket();
    };
  }, [initSocket, cleanupSocket, fetchConversations, setSandboxSession, workspaceName, metaPhoneNumberId, userEmail, userFullName]);

  return (
    <main className="h-screen w-screen overflow-hidden flex bg-slate-950 text-slate-100 font-sans antialiased selection:bg-blue-500/30">
      {/* 🧭 Left Navigation Sidebar */}
      <Sidebar />

      {/* 📑 Tab Content Router */}
      <div className="flex-1 h-full overflow-hidden flex flex-col">
        {activeTab === 'dashboard' && <DashboardHome />}
        {activeTab === 'inbox' && <SharedInboxTab />}
        {activeTab === 'crm' && <CRMDashboard />}
        {activeTab === 'chatbot' && <AIChatbotDashboard />}
        {activeTab === 'campaigns' && <CampaignDashboard />}
        {activeTab === 'automation' && <AutomationDashboard />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </main>
  );
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
const API_BASE = `${BACKEND_URL}/api/v1`;

export async function apiRequest(path: string, options: RequestInit = {}) {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// REST endpoints abstractions
export const api = {
  // CRM Lead operations
  getContacts: (workspaceId: string) => 
    apiRequest(`/contacts?workspaceId=${workspaceId}`),

  // Seed Sandbox setup helper
  setupSandbox: (data: { workspaceName: string; metaPhoneNumberId: string; email: string; fullName: string }) =>
    apiRequest('/setup-sandbox', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

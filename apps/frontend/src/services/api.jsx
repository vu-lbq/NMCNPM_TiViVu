// Backend API integration
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

function getToken() {
  try {
    const stored = localStorage.getItem('tivivu_user');
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed?.token || null;
  } catch {
    return null;
  }
}

async function handleResponse(res) {
  if (!res.ok) {
    let msg = await res.text();
    try { const j = JSON.parse(msg); msg = j.error || j.message || msg; } catch {}
    throw new Error(msg || `HTTP ${res.status}`);
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return res.text();
}

export const authService = {
  // Frontend uses email; backend expects username.
  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await handleResponse(res);
    return {
      id: data.user?.id || data.id || null,
      email,
      token: data.token,
    };
  },
  register: async (email, password) => {
    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await handleResponse(res);
    return {
      id: data.user?.id || data.id || null,
      email,
      token: data.token,
    };
  }
};

export const chatService = {
  listConversations: async () => {
    const token = getToken();
    const res = await fetch(`${API_BASE}/conversations`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return handleResponse(res);
  },
  createConversation: async (title = 'New Conversation') => {
    const token = getToken();
    const res = await fetch(`${API_BASE}/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title })
    });
    return handleResponse(res);
  },
  deleteConversation: async (conversationId) => {
    const token = getToken();
    const res = await fetch(`${API_BASE}/conversations/${conversationId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok && res.status !== 204) {
      await handleResponse(res); // will throw
    }
    return true;
  },
  listMessages: async (conversationId) => {
    const token = getToken();
    const res = await fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return handleResponse(res);
  },
  sendMessage: async (conversationId, content) => {
    const token = getToken();
    const res = await fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ content })
    });
    return handleResponse(res);
  }
};

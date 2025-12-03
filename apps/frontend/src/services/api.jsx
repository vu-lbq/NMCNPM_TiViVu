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
    try { const j = JSON.parse(msg); msg = j.error || j.message || msg; } catch { /* noop */ }
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
      displayName: data.user?.displayName || null,
      role: data.user?.role || 'user',
      token: data.token,
    };
  },
  register: async (email, password, displayName) => {
    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, displayName })
    });
    const data = await handleResponse(res);
    return {
      id: data.user?.id || data.id || null,
      email,
      displayName: data.user?.displayName || displayName || null,
      role: data.user?.role || 'user',
      token: data.token,
    };
  },
  forgotPassword: async (email) => {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return handleResponse(res);
  },
  resetPassword: async ({ email, token, password }) => {
    const res = await fetch(`${API_BASE}/auth/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token, password })
    });
    return handleResponse(res);
  },
};

export const chatService = {
  listConversations: async () => {
    const token = getToken();
    const res = await fetch(`${API_BASE}/conversations`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return handleResponse(res);
  },
  cleanupEmpty: async () => {
    const token = getToken();
    const res = await fetch(`${API_BASE}/conversations/cleanup-empty`, {
      method: 'DELETE',
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
  sendMessage: async (conversationId, content, opts = {}) => {
    const token = getToken();
    const res = await fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ content }),
      signal: opts.signal,
    });
    return handleResponse(res);
  }
};

export const voiceService = {
  stt: async ({ audioBase64, filename = `audio_${Date.now()}.webm`, language }) => {
    const token = getToken();
    const res = await fetch(`${API_BASE}/stt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ audioBase64, filename, language })
    });
    return handleResponse(res); // { text }
  },
  voiceChat: async ({ audioBase64, filename = `audio_${Date.now()}.webm`, language = 'en', voice = 'alloy', format = 'mp3', conversationId }) => {
    const token = getToken();
    const res = await fetch(`${API_BASE}/voice-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ audioBase64, filename, language, voice, format, conversationId })
    });
    return handleResponse(res); // { transcript, replyText, audioBase64, contentType, conversationId }
  },
  // tts helper not used in the non-skipTts flow
};

export const vocabService = {
  list: async () => {
    const token = getToken();
    const res = await fetch(`${API_BASE}/vocab`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return handleResponse(res);
  },
  add: async ({ word, lang = 'en', meaningVi, notes, source }) => {
    const token = getToken();
    const res = await fetch(`${API_BASE}/vocab`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ word, lang, meaningVi, notes, source })
    });
    return handleResponse(res);
  },
  remove: async (id) => {
    const token = getToken();
    const res = await fetch(`${API_BASE}/vocab/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    return handleResponse(res);
  }
};

export const adminService = {
  getStats: async () => {
    const token = getToken();
    const res = await fetch(`${API_BASE}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } });
    return handleResponse(res);
  },
  listUsers: async () => {
    const token = getToken();
    const res = await fetch(`${API_BASE}/admin/users`, { headers: { Authorization: `Bearer ${token}` } });
    return handleResponse(res);
  },
  createUser: async ({ username, password, displayName, role = 'user' }) => {
    const token = getToken();
    const res = await fetch(`${API_BASE}/admin/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ username, password, displayName, role })
    });
    return handleResponse(res);
  },
  deleteUser: async (id) => {
    const token = getToken();
    const res = await fetch(`${API_BASE}/admin/users/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok && res.status !== 204) await handleResponse(res);
    return true;
  },
  toggleRole: async (id) => {
    const token = getToken();
    const res = await fetch(`${API_BASE}/admin/users/${id}/toggle-role`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    return handleResponse(res);
  },
  listFeedback: async () => {
    const token = getToken();
    const res = await fetch(`${API_BASE}/admin/feedback`, { headers: { Authorization: `Bearer ${token}` } });
    return handleResponse(res);
  },
  deleteFeedback: async (id) => {
    const token = getToken();
    const res = await fetch(`${API_BASE}/admin/feedback/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok && res.status !== 204) await handleResponse(res);
    return true;
  }
};

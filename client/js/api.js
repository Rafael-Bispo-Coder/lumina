const API_BASE = 'http://localhost:3001/api';

const api = {
  async request(method, endpoint, body = null) {
    const token = localStorage.getItem('lumina_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });
    if (res.status === 204) return null;
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro na requisição');
    return data;
  },
  get: (endpoint) => api.request('GET', endpoint),
  post: (endpoint, body) => api.request('POST', endpoint, body),
  put: (endpoint, body) => api.request('PUT', endpoint, body),
  delete: (endpoint) => api.request('DELETE', endpoint),
};

import { sessionStore } from '../store/sessionStore';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

let refreshing: Promise<void> | null = null;

const refreshToken = async () => {
  const state = sessionStore.getState();
  if (!state.refreshToken) throw new Error('Sem refresh token');

  const response = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: state.refreshToken }),
  });

  if (!response.ok) {
    sessionStore.getState().clear();
    throw new Error('Sessão expirada');
  }

  const payload = await response.json();
  sessionStore.getState().setAccessToken(payload.accessToken);
};

export async function apiFetch<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  const state = sessionStore.getState();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (state.accessToken) headers.set('Authorization', `Bearer ${state.accessToken}`);

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && retry && state.refreshToken) {
    if (!refreshing) {
      refreshing = refreshToken().finally(() => {
        refreshing = null;
      });
    }

    await refreshing;
    return apiFetch<T>(path, options, false);
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ message: 'Erro inesperado' }));
    throw new Error(payload.message ?? 'Falha na requisição');
  }

  return response.json();
}

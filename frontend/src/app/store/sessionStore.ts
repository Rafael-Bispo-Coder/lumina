import { create } from 'zustand';
import type { SessionData, SessionUser } from '../types/auth';

const STORAGE_KEY = 'lumina-session';

type SessionState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: SessionUser | null;
  setSession: (session: SessionData) => void;
  setAccessToken: (token: string) => void;
  clear: () => void;
};

const loadSession = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? (JSON.parse(data) as SessionData) : null;
  } catch {
    return null;
  }
};

const persist = (state: Pick<SessionState, 'accessToken' | 'refreshToken' | 'user'>) => {
  if (!state.accessToken || !state.refreshToken || !state.user) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      accessToken: state.accessToken,
      refreshToken: state.refreshToken,
      user: state.user,
    }),
  );
};

const initialSession = loadSession();

export const sessionStore = create<SessionState>((set, get) => ({
  accessToken: initialSession?.accessToken ?? null,
  refreshToken: initialSession?.refreshToken ?? null,
  user: initialSession?.user ?? null,
  setSession: (session) => {
    set({ accessToken: session.accessToken, refreshToken: session.refreshToken, user: session.user });
    persist(get());
  },
  setAccessToken: (token) => {
    set({ accessToken: token });
    persist(get());
  },
  clear: () => {
    set({ accessToken: null, refreshToken: null, user: null });
    localStorage.removeItem(STORAGE_KEY);
  },
}));

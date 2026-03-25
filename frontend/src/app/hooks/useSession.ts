import { useMemo } from 'react';
import { sessionStore } from '../store/sessionStore';

export const useSession = () => {
  const accessToken = sessionStore((state) => state.accessToken);
  const refreshToken = sessionStore((state) => state.refreshToken);
  const user = sessionStore((state) => state.user);
  const setSession = sessionStore((state) => state.setSession);
  const clear = sessionStore((state) => state.clear);

  return useMemo(
    () => ({
      accessToken,
      refreshToken,
      user,
      isAuthenticated: Boolean(accessToken && user),
      setSession,
      clear,
    }),
    [accessToken, refreshToken, user, setSession, clear],
  );
};

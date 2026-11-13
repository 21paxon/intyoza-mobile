import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '@/api/endpoints';
import { setUnauthorizedHandler, tokenStorage } from '@/api/client';

type AuthContextValue = {
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: Parameters<typeof authApi.register>[0]) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: React.PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const signOut = useCallback(async () => {
    await tokenStorage.clear();
    setToken(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => setToken(null));
    tokenStorage.get().then(setToken).finally(() => setLoading(false));
    return () => setUnauthorizedHandler(undefined);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    const payload = response.data as { token?: unknown };
    if (typeof payload?.token !== 'string' || !payload.token) {
      throw new Error('The API response did not include the documented login token.');
    }
    await tokenStorage.set(payload.token);
    setToken(payload.token);
  }, []);

  const signUp = useCallback(async (input: Parameters<typeof authApi.register>[0]) => {
    await authApi.register(input);
  }, []);

  const value = useMemo(() => ({ token, loading, signIn, signUp, signOut }), [token, loading, signIn, signUp, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider.');
  return value;
}

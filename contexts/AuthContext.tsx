import { API_URL, jsonHeaders } from '@/constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

type User = {
  name: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  authFetch: (path: string, init?: RequestInit) => Promise<Response>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'video-share:user';
const TOKENS_KEY = 'video-share:tokens';

type TokenResponse = { accessToken: string; refreshToken: string };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setUser(JSON.parse(raw));
      } catch {}
    })();
  }, []);

  const persist = useCallback(async (u: User | null) => {
    if (!u) {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } else {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    }
  }, []);

  const saveTokens = useCallback(async (tokens: TokenResponse | null) => {
    if (!tokens) {
      await AsyncStorage.removeItem(TOKENS_KEY);
    } else {
      await AsyncStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
    }
  }, []);

  const getTokens = useCallback(async (): Promise<TokenResponse | null> => {
    const raw = await AsyncStorage.getItem(TOKENS_KEY);
    return raw ? (JSON.parse(raw) as TokenResponse) : null;
  }, []);

  const authorizedFetch = useCallback(async (path: string, init: RequestInit = {}) => {
    const tokens = await getTokens();
    const headers: Record<string, string> = {
      ...(init.headers as Record<string, string>),
      ...jsonHeaders,
      ...(tokens?.accessToken ? { Authorization: `Bearer ${tokens.accessToken}` } : {}),
    };
    return fetch(`${API_URL}${path}`, { ...init, headers });
  }, [getTokens]);

  const refreshTokens = useCallback(async (): Promise<boolean> => {
    const tokens = await getTokens();
    if (!tokens?.refreshToken) return false;
    const res = await fetch(`${API_URL}/v1/api/auth/refresh`, {
      method: 'POST',
      headers: { ...jsonHeaders, 'X-Refresh-Token': tokens.refreshToken },
    });
    if (!res.ok) return false;
    const body = await res.json().catch(() => null);
    if (body?.accessToken && body?.refreshToken) {
      await saveTokens({ accessToken: body.accessToken, refreshToken: body.refreshToken });
      return true;
    }
    return false;
  }, [getTokens, saveTokens]);

  const fetchUserProfile = useCallback(async (): Promise<User | null> => {
    // Try /me. If unauthorized, try to refresh tokens and retry once.
    let res = await authorizedFetch('/v1/api/auth/me', { method: 'GET' });
    if (res.status === 401 || res.status === 403) {
      const refreshed = await refreshTokens();
      if (!refreshed) return null;
      res = await authorizedFetch('/v1/api/auth/me', { method: 'GET' });
    }
    if (!res.ok) return null;
    const data = await res.json().catch(() => null);
    if (!data) return null;
    // Map backend UserInfoDTO to User
    const u: User = {
      name: data.name || data.username || data.email?.split?.('@')?.[0] || 'Usuário',
      email: data.email || '',
    };
    return u;
  }, [authorizedFetch, refreshTokens]);

  const authFetch = useCallback(async (path: string, init: RequestInit = {}) => {
    let res = await authorizedFetch(path, init);
    if (res.status === 401 || res.status === 403) {
      const refreshed = await refreshTokens();
      if (refreshed) {
        res = await authorizedFetch(path, init);
      }
    }
    return res;
  }, [authorizedFetch, refreshTokens]);

  const login = useCallback(async (email: string, password: string) => {
    // Ask backend to return tokens in response body
    const res = await fetch(`${API_URL}/v1/api/auth/login`, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ email, password }),
    });

    // MFA flow: backend may respond 200 with { token }
    if (res.ok) {
      const data = await res.json().catch(() => null);
      if (data && 'token' in data) {
        Alert.alert('Verificação MFA necessária', 'Finalize o login no aplicativo/web que suporte MFA.');
        return;
      }
      if (data && data.accessToken && data.refreshToken) {
        await saveTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
        // Fetch real profile data
        const profile = await fetchUserProfile();
        if (profile) {
          setUser(profile);
          await persist(profile);
        } else {
          const derivedName = email.split('@')[0] || email;
          const u: User = { name: derivedName, email };
          setUser(u);
          await persist(u);
        }
        return;
      }
    }

    // Try to extract message from error body
    let message = 'Não foi possível entrar. Verifique suas credenciais.';
    try {
      const err = await res.json();
      message = err?.message || message;
    } catch {
      console.log('Login failed', res.status, res.statusText);
    }
    throw new Error(message);
  }, [persist, saveTokens]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    // Temporary registration: backend sends confirmation email
    const res = await fetch(`${API_URL}/v1/api/auth/register`, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      let message = 'Falha ao cadastrar. Tente novamente.';
      try {
        const err = await res.json();
        message = err?.message || message;
      } catch {}
      throw new Error(message);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const tokens = await getTokens();

      console.log('Logging out, tokens:', tokens);
      // Notify backend to invalidate refresh token
      await authorizedFetch('/v1/api/auth/logout', {
        method: 'POST',
        headers: {
          ...(tokens?.refreshToken ? { 'X-Refresh-Token': tokens.refreshToken } : {}),
        },
      }).catch(() => undefined);
    } finally {
      setUser(null);
      await persist(null);
      await saveTokens(null);
    }
  }, [authorizedFetch, getTokens, persist, saveTokens]);

  // Initialize: if tokens exist, try to fetch user profile (with refresh fallback)
  useEffect(() => {
    (async () => {
      const tokens = await getTokens();
      if (!tokens) return;
      const profile = await fetchUserProfile();
      if (profile) {
        setUser(profile);
        await persist(profile);
      } else {
        // Tokens invalid — clear any stale state
        setUser(null);
        await persist(null);
        await saveTokens(null);
      }
    })();
  }, [fetchUserProfile, getTokens, persist, saveTokens]);

  const value = useMemo(() => ({ user, login, register, logout, authFetch }), [user, login, register, logout, authFetch]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

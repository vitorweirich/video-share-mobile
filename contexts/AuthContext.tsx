import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type User = {
  name: string;
};

type AuthContextType = {
  user: User | null;
  login: (name: string, password: string) => Promise<void>;
  register: (name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'video-share:user';

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

  const login = useCallback(async (name: string, _password: string) => {
    // Demo only: accept any credentials
    const u = { name };
    setUser(u);
    await persist(u);
  }, [persist]);

  const register = useCallback(async (name: string, password: string) => {
    // Demo only: registration is equivalent to login
    await login(name, password);
  }, [login]);

  const logout = useCallback(async () => {
    setUser(null);
    await persist(null);
  }, [persist]);

  const value = useMemo(() => ({ user, login, register, logout }), [user, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

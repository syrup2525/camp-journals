import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/authService';
import type { User } from '../types/journal';

interface AuthContextValue {
  user: User | null;
  isBootstrapping: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const refresh = useCallback(async () => {
    const currentUser = await authService.getMe();
    setUser(currentUser);
  }, []);

  useEffect(() => {
    refresh().finally(() => setIsBootstrapping(false));
  }, [refresh]);

  const login = useCallback(async (username: string, password: string) => {
    const nextUser = await authService.login({ username, password });
    setUser(nextUser);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isBootstrapping,
      isAuthenticated: Boolean(user),
      login,
      logout,
      refresh,
    }),
    [isBootstrapping, login, logout, refresh, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}


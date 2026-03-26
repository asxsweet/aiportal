import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api, getToken, setToken } from '@/lib/api';
import i18n from '@/i18n';

export type UserRole = 'teacher' | 'student';

export type UserNotifications = {
  email: boolean;
  assignmentUpdates: boolean;
  comments: boolean;
};

export type User = {
  id: string;
  email: string;
  name: string;
  institution?: string | null;
  role: UserRole;
  createdAt?: string;
  avatar?: string | null;
  avatarUrl?: string | null;
  bio?: string;
  language?: 'en' | 'ru' | 'kz';
  notifications?: UserNotifications;
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: {
    email: string;
    password: string;
    name: string;
    role: UserRole;
    institution?: string;
  }) => Promise<User>;
  logout: () => void;
  refreshMe: () => Promise<void>;
  /** Replace session user after profile / avatar API updates */
  setSessionUser: (u: User | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = useCallback(async () => {
    const t = getToken();
    if (!t) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get<{ user: User }>('/api/auth/me');
      setUser(data.user);
      const lng = data.user.language;
      if (lng === 'en' || lng === 'ru' || lng === 'kz') {
        localStorage.setItem('rep_lang', lng);
        void i18n.changeLanguage(lng);
      }
    } catch {
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<{ user: User; token: string }>('/api/auth/login', {
      email,
      password,
    });
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(
    async (payload: {
      email: string;
      password: string;
      name: string;
      role: UserRole;
      institution?: string;
    }) => {
      const { data } = await api.post<{ user: User; token: string }>('/api/auth/register', payload);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    },
    [],
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const setSessionUser = useCallback((u: User | null) => {
    setUser(u);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token: getToken() as string | null,
      loading,
      login,
      register,
      logout,
      refreshMe,
      setSessionUser,
    }),
    [user, loading, login, register, logout, refreshMe, setSessionUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

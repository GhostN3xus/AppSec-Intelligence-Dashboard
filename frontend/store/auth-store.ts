import { create } from 'zustand';
import api from '../lib/api-client';

type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  language?: string | null;
  title?: string | null;
  status?: string;
  lastLogin?: string | null;
};

type AuthState = {
  user: AuthUser | null;
  loading: boolean;
  hydrate: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  async hydrate() {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('appsec-token');
    if (!token || get().loading || get().user) return;
    set({ loading: true });
    try {
      const response = await api.get('/auth/me');
      set({ user: response.data, loading: false });
    } catch (error) {
      localStorage.removeItem('appsec-token');
      set({ user: null, loading: false });
    }
  },
  setUser(user) {
    set({ user });
  },
  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('appsec-token');
      window.location.href = '/login';
    }
    set({ user: null });
  },
}));

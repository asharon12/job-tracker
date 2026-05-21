import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: async (email, password) => {
        const res = await api.post<{ token: string; user: User }>('/auth/login', { email, password });
        localStorage.setItem('token', res.token);
        set({ token: res.token, user: res.user });
      },
      register: async (name, email, password) => {
        const res = await api.post<{ token: string; user: User }>('/auth/register', { name, email, password });
        localStorage.setItem('token', res.token);
        set({ token: res.token, user: res.user });
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ token: null, user: null });
      },
    }),
    { name: 'auth' }
  )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: 'dev-token',
      setToken: (token) => set({ token }),
      clearToken: () => set({ token: null }),
    }),
    { name: 'timbre-auth' },
  ),
);

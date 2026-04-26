import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'siswa' | 'guru_piket' | 'wali_kelas' | 'orang_tua' | 'admin';
}

interface AuthState {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  isLoading: boolean;
  setLoading: (val: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  isLoading: true,
  setLoading: (val) => set({ isLoading: val }),
  logout: () => set({ user: null, token: null }),
}));

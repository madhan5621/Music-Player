import { create } from 'zustand';
import { authService } from '../services/apiServices';

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('madhan-music-user') || 'null'),
  token: localStorage.getItem('madhan-music-token') || null,
  isAuthenticated: !!localStorage.getItem('madhan-music-token'),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authService.login({ email, password });
      localStorage.setItem('madhan-music-token', data.token);
      localStorage.setItem('madhan-music-user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
      return data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authService.register({ name, email, password });
      localStorage.setItem('madhan-music-token', data.token);
      localStorage.setItem('madhan-music-user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
      return data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  logout: () => {
    localStorage.removeItem('madhan-music-token');
    localStorage.removeItem('madhan-music-user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateUser: (userData) => {
    const updated = { ...get().user, ...userData };
    localStorage.setItem('madhan-music-user', JSON.stringify(updated));
    set({ user: updated });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;

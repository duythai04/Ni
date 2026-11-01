import { create } from 'zustand';
import apiClient, { setupAxiosInterceptors } from '../api/client';

export const useAuthStore = create((set, get) => {
  // Wire up Axios interceptor with Zustand actions
  setupAxiosInterceptors({
    getAccessToken: () => get().accessToken,
    setAccessToken: (token) => set({ accessToken: token }),
    logout: () => set({ user: null, accessToken: null, isAuthenticated: false }),
  });

  return {
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: true,

    setAuth: (user, accessToken) => {
      set({
        user,
        accessToken,
        isAuthenticated: true,
        isLoading: false,
      });
    },

    login: async (email, password) => {
      const response = await apiClient.post('/auth/login', { email, password });
      const { user, accessToken } = response.data.data;
      set({
        user,
        accessToken,
        isAuthenticated: true,
        isLoading: false,
      });
      return response.data;
    },

    register: async (full_name, email, password) => {
      const response = await apiClient.post('/auth/register', { full_name, email, password });
      const { user, accessToken } = response.data.data;
      set({
        user,
        accessToken,
        isAuthenticated: true,
        isLoading: false,
      });
      return response.data;
    },

    logout: async () => {
      try {
        await apiClient.post('/auth/logout');
      } catch (e) {
        // ignore network error on logout
      } finally {
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    },

    checkAuth: async () => {
      try {
        // Try refreshing token to see if user has valid session cookie
        const res = await apiClient.post('/auth/refresh');
        const { user, accessToken } = res.data.data;
        set({
          user,
          accessToken,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (err) {
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    },

    updateUser: (updatedUser) => {
      set({ user: { ...get().user, ...updatedUser } });
    },
  };
});

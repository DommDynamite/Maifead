import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../services/api';

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: Date;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  initialize: () => Promise<void>;
}

export interface SignupData {
  email: string;
  username: string;
  displayName: string;
  password: string;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });

        try {
          const response = await api.login(email, password);
          set({
            user: {
              ...response.user,
              createdAt: new Date(response.user.createdAt),
            },
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      signup: async (data: SignupData) => {
        set({ isLoading: true });

        try {
          const response = await api.signup(data);
          set({
            user: {
              ...response.user,
              createdAt: new Date(response.user.createdAt),
            },
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        api.setToken(null);
        set({
          user: null,
          isAuthenticated: false,
        });
      },

      updateProfile: async (updates: Partial<User>) => {
        const currentUser = get().user;
        if (!currentUser) return;

        try {
          const updatedUser = await api.updateProfile(updates);
          set({
            user: {
              ...updatedUser,
              createdAt: new Date(updatedUser.createdAt),
            },
          });
        } catch (error) {
          throw error;
        }
      },

      initialize: async () => {
        const token = api.getToken();
        if (!token) return;

        try {
          const user = await api.getMe();
          set({
            user: {
              ...user,
              createdAt: new Date(user.createdAt),
            },
            isAuthenticated: true,
          });
        } catch (error) {
          // Token is invalid, clear it
          api.setToken(null);
          set({
            user: null,
            isAuthenticated: false,
          });
        }
      },
    }),
    {
      name: 'maifead-auth',
      partialize: state => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

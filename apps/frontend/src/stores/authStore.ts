import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  updateProfile: (updates: Partial<User>) => void;
}

export interface SignupData {
  email: string;
  username: string;
  displayName: string;
  password: string;
}

// Simulated API delay
const simulateApiCall = (ms: number = 1000) =>
  new Promise(resolve => setTimeout(resolve, ms));

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });

        try {
          // Simulate API call
          await simulateApiCall();

          // For POC, check if user exists in localStorage mock
          const mockUsers = JSON.parse(localStorage.getItem('maifead-mock-users') || '[]');
          const user = mockUsers.find((u: any) => u.email === email);

          if (!user) {
            throw new Error('User not found. Please sign up first.');
          }

          if (user.password !== password) {
            throw new Error('Invalid password');
          }

          // Remove password from user object before storing
          const { password: _, ...userWithoutPassword } = user;

          set({
            user: userWithoutPassword,
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
          // Simulate API call
          await simulateApiCall();

          // For POC, store user in localStorage
          const mockUsers = JSON.parse(localStorage.getItem('maifead-mock-users') || '[]');

          // Check if email already exists
          if (mockUsers.some((u: any) => u.email === data.email)) {
            throw new Error('Email already registered');
          }

          // Check if username already exists
          if (mockUsers.some((u: any) => u.username === data.username)) {
            throw new Error('Username already taken');
          }

          // Create new user
          const newUser: User & { password: string } = {
            id: crypto.randomUUID(),
            email: data.email,
            username: data.username,
            displayName: data.displayName,
            password: data.password, // In real app, this would be hashed on backend
            createdAt: new Date(),
          };

          mockUsers.push(newUser);
          localStorage.setItem('maifead-mock-users', JSON.stringify(mockUsers));

          // Remove password before storing in auth state
          const { password: _, ...userWithoutPassword } = newUser;

          set({
            user: userWithoutPassword,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
        });
      },

      updateProfile: (updates: Partial<User>) => {
        const currentUser = get().user;
        if (!currentUser) return;

        const updatedUser = { ...currentUser, ...updates };
        set({ user: updatedUser });

        // Also update in mock storage
        const mockUsers = JSON.parse(localStorage.getItem('maifead-mock-users') || '[]');
        const userIndex = mockUsers.findIndex((u: any) => u.id === currentUser.id);
        if (userIndex !== -1) {
          mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates };
          localStorage.setItem('maifead-mock-users', JSON.stringify(mockUsers));
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

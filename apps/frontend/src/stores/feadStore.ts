import { create } from 'zustand';
import { api } from '../services/api';
import type { Fead } from '@maifead/types';

type FeadInput = Omit<Fead, 'id' | 'createdAt' | 'updatedAt'>;

interface FeadStore {
  feads: Fead[];
  isLoading: boolean;

  // Actions
  fetchFeads: () => Promise<void>;
  createFead: (input: FeadInput) => Promise<Fead>;
  updateFead: (id: string, updates: Partial<FeadInput>) => Promise<void>;
  deleteFead: (id: string) => Promise<void>;
  getFead: (id: string) => Fead | undefined;
}

export const useFeadStore = create<FeadStore>()((set, get) => ({
  feads: [],
  isLoading: false,

  fetchFeads: async () => {
    set({ isLoading: true });
    try {
      const feads = await api.getFeads();
      set({
        feads: feads.map((f: any) => ({
          id: f.id,
          name: f.name,
          icon: f.icon,
          sourceIds: f.sourceIds || [],
          createdAt: new Date(f.createdAt),
          updatedAt: new Date(f.updatedAt),
        })),
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to fetch feads:', error);
      set({ isLoading: false });
    }
  },

  createFead: async (input: FeadInput) => {
    try {
      const fead = await api.createFead({
        name: input.name,
        icon: input.icon,
        sourceIds: input.sourceIds,
      });

      const newFead: Fead = {
        id: fead.id,
        name: fead.name,
        icon: fead.icon,
        sourceIds: fead.sourceIds || [],
        createdAt: new Date(fead.createdAt),
        updatedAt: new Date(fead.updatedAt),
      };

      set(state => ({
        feads: [...state.feads, newFead],
      }));

      return newFead;
    } catch (error) {
      console.error('Failed to create fead:', error);
      throw error;
    }
  },

  updateFead: async (id: string, updates: Partial<FeadInput>) => {
    try {
      const updated = await api.updateFead(id, updates);
      set(state => ({
        feads: state.feads.map(fead =>
          fead.id === id
            ? {
                ...fead,
                name: updated.name,
                icon: updated.icon,
                sourceIds: updated.sourceIds || [],
                updatedAt: new Date(updated.updatedAt),
              }
            : fead
        ),
      }));
    } catch (error) {
      console.error('Failed to update fead:', error);
      throw error;
    }
  },

  deleteFead: async (id: string) => {
    try {
      await api.deleteFead(id);
      set(state => ({
        feads: state.feads.filter(fead => fead.id !== id),
      }));
    } catch (error) {
      console.error('Failed to delete fead:', error);
      throw error;
    }
  },

  getFead: (id: string) => {
    return get().feads.find(fead => fead.id === id);
  },
}));

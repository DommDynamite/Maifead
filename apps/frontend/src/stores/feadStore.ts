import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FeadWithNames } from '@maifead/types';

// Note: Using FeadWithNames for POC. When backend is ready, we'll use the real Fead type
// which stores sourceIds (UUIDs) instead of sourceNames (strings)

type FeadInput = Omit<FeadWithNames, 'id' | 'createdAt' | 'updatedAt'>;

interface FeadStore {
  feads: FeadWithNames[];

  // Actions
  createFead: (input: FeadInput) => void;
  updateFead: (id: string, updates: Partial<FeadInput>) => void;
  deleteFead: (id: string) => void;
  getFead: (id: string) => FeadWithNames | undefined;
}

export const useFeadStore = create<FeadStore>()(
  persist(
    (set, get) => ({
      feads: [
        // Default example Feads
        {
          id: 'fead-tech-news',
          name: 'Tech News',
          icon: '⚡',
          sourceNames: ['TechCrunch', 'The Verge', 'Hacker News'],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'fead-web-design',
          name: 'Web Design',
          icon: '🎨',
          sourceNames: ['CSS-Tricks', 'Smashing Magazine', 'A List Apart'],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'fead-programming',
          name: 'Programming',
          icon: '💻',
          sourceNames: ['Rust Blog', 'Hacker News'],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],

      createFead: (input: FeadInput) => {
        const newFead: FeadWithNames = {
          ...input,
          id: `fead-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set(state => ({
          feads: [...state.feads, newFead],
        }));
      },

      updateFead: (id: string, updates: Partial<FeadInput>) => {
        set(state => ({
          feads: state.feads.map(fead =>
            fead.id === id ? { ...fead, ...updates, updatedAt: new Date() } : fead
          ),
        }));
      },

      deleteFead: (id: string) => {
        set(state => ({
          feads: state.feads.filter(fead => fead.id !== id),
        }));
      },

      getFead: (id: string) => {
        return get().feads.find(fead => fead.id === id);
      },
    }),
    {
      name: 'maifead-feads',
    }
  )
);

import { create } from 'zustand';
import { api } from '../services/api';
import type { ContentItem } from '@maifead/types';

interface FeedStore {
  items: ContentItem[];
  isLoading: boolean;
  fetchItems: (params?: {
    sourceId?: string;
    read?: boolean;
    saved?: boolean;
    limit?: number;
  }) => Promise<void>;
  markItemRead: (id: string, read: boolean) => Promise<void>;
  markItemSaved: (id: string, saved: boolean) => Promise<void>;
  markAllRead: (sourceId?: string) => Promise<void>;
  getItem: (id: string) => ContentItem | undefined;
}

export const useFeedStore = create<FeedStore>()((set, get) => ({
  items: [],
  isLoading: false,

  fetchItems: async (params) => {
    set({ isLoading: true });
    try {
      const items = await api.getFeedItems(params);
      set({
        items: items.map((item: any) => ({
          id: item.id,
          sourceId: item.sourceId,
          title: item.title,
          link: item.link,
          content: item.content,
          excerpt: item.excerpt,
          author: item.author,
          publishedAt: item.publishedAt ? new Date(item.publishedAt) : undefined,
          imageUrl: item.imageUrl,
          read: item.read,
          saved: item.saved,
        })),
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to fetch feed items:', error);
      set({ isLoading: false });
    }
  },

  markItemRead: async (id: string, read: boolean) => {
    try {
      await api.markItemRead(id, read);
      set(state => ({
        items: state.items.map(item =>
          item.id === id ? { ...item, read } : item
        ),
      }));
    } catch (error) {
      console.error('Failed to mark item as read:', error);
      throw error;
    }
  },

  markItemSaved: async (id: string, saved: boolean) => {
    try {
      await api.markItemSaved(id, saved);
      set(state => ({
        items: state.items.map(item =>
          item.id === id ? { ...item, saved } : item
        ),
      }));
    } catch (error) {
      console.error('Failed to mark item as saved:', error);
      throw error;
    }
  },

  markAllRead: async (sourceId?: string) => {
    try {
      await api.markAllRead(sourceId);
      set(state => ({
        items: state.items.map(item =>
          sourceId ? (item.sourceId === sourceId ? { ...item, read: true } : item) : { ...item, read: true }
        ),
      }));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      throw error;
    }
  },

  getItem: (id: string) => {
    return get().items.find(item => item.id === id);
  },
}));

import { create } from 'zustand';
import { api } from '../services/api';
import type { ContentItem } from '@maifead/types';

// Extended ContentItem with backward-compatible flat properties
// Note: content and author are intentionally omitted to avoid conflicts with ContentItem
export type FeedContentItem = ContentItem & {
  sourceId?: string;
  link?: string;
  imageUrl?: string;
  excerpt?: string;
  read?: boolean;
  saved?: boolean;
};

interface FeedStore {
  items: FeedContentItem[];
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
  getItem: (id: string) => FeedContentItem | undefined;
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
          // ContentItem structure
          id: item.id,
          source: {
            type: item.source?.type || 'rss',
            name: item.source?.name || item.sourceName || 'Unknown',
            url: item.source?.url || item.sourceUrl || '',
            icon: item.source?.icon || item.sourceIcon,
          },
          title: item.title,
          content: {
            text: item.content || '',
            html: item.contentHtml,
            excerpt: item.excerpt,
          },
          media: item.imageUrl ? [{
            type: 'image' as const,
            url: item.imageUrl,
            thumbnail: item.imageUrl,
          }] : undefined,
          author: item.author ? {
            name: item.author,
            avatar: item.authorAvatar,
          } : undefined,
          publishedAt: item.publishedAt ? new Date(item.publishedAt) : new Date(),
          url: item.link || '',
          isRead: item.read || false,
          isSaved: item.saved || false,
          tags: item.tags || [],
          category: item.category,
          // Backward-compatible flat properties
          sourceId: item.sourceId,
          link: item.link,
          imageUrl: item.imageUrl,
          excerpt: item.excerpt,
          read: item.read,
          saved: item.saved,
        } as FeedContentItem)),
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
          item.id === id ? { ...item, isRead: read, read } : item
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
          item.id === id ? { ...item, isSaved: saved, saved } : item
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
          sourceId ? (item.sourceId === sourceId ? { ...item, isRead: true, read: true } : item) : { ...item, isRead: true, read: true }
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

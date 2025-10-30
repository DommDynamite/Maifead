import { create } from 'zustand';
import { api } from '../services/api';
import type { FeedSource, FeedSourceInput, FeedSourceUpdate } from '@maifead/types';

interface FeedSourceStore {
  sources: FeedSource[];
  isLoading: boolean;
  fetchSources: () => Promise<void>;
  createSource: (input: FeedSourceInput) => Promise<FeedSource>;
  updateSource: (id: string, updates: FeedSourceUpdate) => Promise<void>;
  deleteSource: (id: string) => Promise<void>;
  refreshSource: (id: string) => Promise<void>;
  getSource: (id: string) => FeedSource | undefined;
  getSourceByName: (name: string) => FeedSource | undefined;
}

export const useFeedSourceStore = create<FeedSourceStore>()((set, get) => ({
  sources: [],
  isLoading: false,

  fetchSources: async () => {
    set({ isLoading: true });
    try {
      const sources = await api.getSources();
      set({
        sources: sources.map((s: any) => ({
          id: s.id,
          name: s.name,
          url: s.url,
          icon: s.iconUrl,
          type: s.type || 'rss',
          channelId: s.channelId,
          subreddit: s.subreddit,
          redditUsername: s.redditUsername,
          redditSourceType: s.redditSourceType,
          redditMinUpvotes: s.redditMinUpvotes,
          youtubeShortsFilter: s.youtubeShortsFilter,
          blueskyHandle: s.blueskyHandle,
          blueskyDid: s.blueskyDid,
          blueskyFeedUri: s.blueskyFeedUri,
          isEnabled: true,
          whitelistKeywords: s.whitelistKeywords || [],
          blacklistKeywords: s.blacklistKeywords || [],
          retentionDays: s.retentionDays ?? 30,
          suppressFromMainFeed: s.suppressFromMainFeed || false,
          createdAt: new Date(s.createdAt),
          updatedAt: new Date(s.updatedAt),
        })),
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to fetch sources:', error);
      set({ isLoading: false });
    }
  },

  createSource: async (input: FeedSourceInput) => {
    try {
      console.log('[feedSourceStore] createSource called with input:', JSON.stringify(input, null, 2));
      const source = await api.createSource({
        name: input.name,
        url: input.url,
        type: input.type,
        channelId: input.channelId,
        subreddit: input.subreddit,
        redditUsername: input.redditUsername,
        redditSourceType: input.redditSourceType,
        redditMinUpvotes: input.redditMinUpvotes,
        youtubeShortsFilter: input.youtubeShortsFilter,
        blueskyHandle: input.blueskyHandle,
        blueskyDid: input.blueskyDid,
        blueskyFeedUri: input.blueskyFeedUri,
        retentionDays: input.retentionDays,
        suppressFromMainFeed: input.suppressFromMainFeed,
      });
      console.log('[feedSourceStore] API response from createSource:', JSON.stringify(source, null, 2));

      const newSource: FeedSource = {
        id: source.id,
        name: source.name,
        url: source.url,
        icon: source.iconUrl,
        type: source.type || 'rss',
        channelId: source.channelId,
        subreddit: source.subreddit,
        redditUsername: source.redditUsername,
        redditSourceType: source.redditSourceType,
        redditMinUpvotes: source.redditMinUpvotes,
        youtubeShortsFilter: source.youtubeShortsFilter,
        blueskyHandle: source.blueskyHandle,
        blueskyDid: source.blueskyDid,
        blueskyFeedUri: source.blueskyFeedUri,
        isEnabled: true,
        whitelistKeywords: [],
        blacklistKeywords: [],
        retentionDays: source.retentionDays ?? 30,
        suppressFromMainFeed: source.suppressFromMainFeed || false,
        createdAt: new Date(source.createdAt),
        updatedAt: new Date(source.updatedAt),
      };

      set(state => ({
        sources: [...state.sources, newSource],
      }));

      return newSource;
    } catch (error) {
      console.error('Failed to create source:', error);
      throw error;
    }
  },

  updateSource: async (id: string, updates: FeedSourceUpdate) => {
    try {
      console.log('[feedSourceStore] updateSource called with id:', id, 'updates:', JSON.stringify(updates, null, 2));
      const updated = await api.updateSource(id, {
        name: updates.name,
        redditMinUpvotes: updates.redditMinUpvotes,
        youtubeShortsFilter: updates.youtubeShortsFilter,
        whitelistKeywords: updates.whitelistKeywords,
        blacklistKeywords: updates.blacklistKeywords,
        retentionDays: updates.retentionDays,
        suppressFromMainFeed: updates.suppressFromMainFeed,
      });
      console.log('[feedSourceStore] API response from updateSource:', JSON.stringify(updated, null, 2));

      set(state => ({
        sources: state.sources.map(source =>
          source.id === id
            ? {
                ...source,
                name: updated.name,
                redditMinUpvotes: updated.redditMinUpvotes,
                youtubeShortsFilter: updated.youtubeShortsFilter,
                whitelistKeywords: updated.whitelistKeywords || [],
                blacklistKeywords: updated.blacklistKeywords || [],
                retentionDays: updated.retentionDays ?? source.retentionDays,
                suppressFromMainFeed: updated.suppressFromMainFeed ?? source.suppressFromMainFeed,
                updatedAt: new Date(updated.updatedAt),
              }
            : source
        ),
      }));
    } catch (error) {
      console.error('Failed to update source:', error);
      throw error;
    }
  },

  deleteSource: async (id: string) => {
    try {
      await api.deleteSource(id);
      set(state => ({
        sources: state.sources.filter(source => source.id !== id),
      }));

      // Refetch feads to update their sourceIds after source deletion
      // Import dynamically to avoid circular dependency
      const { useFeadStore } = await import('./feadStore');
      await useFeadStore.getState().fetchFeads();
    } catch (error) {
      console.error('Failed to delete source:', error);
      throw error;
    }
  },

  refreshSource: async (id: string) => {
    try {
      await api.refreshSource(id);
    } catch (error) {
      console.error('Failed to refresh source:', error);
      throw error;
    }
  },

  getSource: (id: string) => {
    return get().sources.find(source => source.id === id);
  },

  getSourceByName: (name: string) => {
    return get().sources.find(source => source.name === name);
  },
}));

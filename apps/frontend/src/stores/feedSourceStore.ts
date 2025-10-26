import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FeedSource, FeedSourceInput, FeedSourceUpdate } from '@maifead/types';

interface FeedSourceStore {
  sources: FeedSource[];
  createSource: (input: FeedSourceInput) => FeedSource;
  updateSource: (id: string, updates: FeedSourceUpdate) => void;
  deleteSource: (id: string) => void;
  getSource: (id: string) => FeedSource | undefined;
  getSourceByName: (name: string) => FeedSource | undefined;
}

const generateId = () => {
  return `source-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const useFeedSourceStore = create<FeedSourceStore>()(
  persist(
    (set, get) => ({
      sources: [
        {
          id: 'source-fireship',
          name: 'Fireship',
          url: 'https://www.youtube.com/@Fireship',
          icon: 'https://yt3.googleusercontent.com/ytc/AIdro_kGRQ7HKXJjkJR4fXBDjVjJGmR8lFZgVp2P91WZ=s176-c-k-c0x00ffffff-no-rj',
          type: 'rss',
          isEnabled: true,
          whitelistKeywords: [],
          blacklistKeywords: [],
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          id: 'source-css-tricks',
          name: 'CSS-Tricks',
          url: 'https://css-tricks.com/feed/',
          icon: 'https://css-tricks.com/favicon.ico',
          type: 'rss',
          isEnabled: true,
          whitelistKeywords: [],
          blacklistKeywords: [],
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          id: 'source-rust-blog',
          name: 'Rust Blog',
          url: 'https://blog.rust-lang.org/feed.xml',
          icon: 'https://www.rust-lang.org/favicon.ico',
          type: 'rss',
          isEnabled: true,
          whitelistKeywords: [],
          blacklistKeywords: [],
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          id: 'source-ala',
          name: 'A List Apart',
          url: 'https://alistapart.com/feed/',
          icon: 'https://alistapart.com/favicon.ico',
          type: 'rss',
          isEnabled: true,
          whitelistKeywords: [],
          blacklistKeywords: [],
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          id: 'source-smashing',
          name: 'Smashing Magazine',
          url: 'https://www.smashingmagazine.com/feed/',
          icon: 'https://www.smashingmagazine.com/favicon.ico',
          type: 'rss',
          isEnabled: true,
          whitelistKeywords: [],
          blacklistKeywords: [],
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          id: 'source-the-verge',
          name: 'The Verge',
          url: 'https://www.theverge.com/rss/index.xml',
          icon: 'https://www.theverge.com/favicon.ico',
          type: 'rss',
          isEnabled: true,
          whitelistKeywords: [],
          blacklistKeywords: [],
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          id: 'source-techcrunch',
          name: 'TechCrunch',
          url: 'https://techcrunch.com/feed/',
          icon: 'https://techcrunch.com/favicon.ico',
          type: 'rss',
          isEnabled: true,
          whitelistKeywords: [],
          blacklistKeywords: [],
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          id: 'source-hacker-news',
          name: 'Hacker News',
          url: 'https://news.ycombinator.com/rss',
          icon: 'https://news.ycombinator.com/favicon.ico',
          type: 'rss',
          isEnabled: true,
          whitelistKeywords: [],
          blacklistKeywords: [],
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ],

      createSource: (input: FeedSourceInput) => {
        const newSource: FeedSource = {
          ...input,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set(state => ({
          sources: [...state.sources, newSource],
        }));

        return newSource;
      },

      updateSource: (id: string, updates: FeedSourceUpdate) => {
        set(state => ({
          sources: state.sources.map(source =>
            source.id === id
              ? {
                  ...source,
                  ...updates,
                  updatedAt: new Date(),
                }
              : source
          ),
        }));
      },

      deleteSource: (id: string) => {
        set(state => ({
          sources: state.sources.filter(source => source.id !== id),
        }));
      },

      getSource: (id: string) => {
        return get().sources.find(source => source.id === id);
      },

      getSourceByName: (name: string) => {
        return get().sources.find(source => source.name === name);
      },
    }),
    {
      name: 'maifead-feed-sources',
    }
  )
);

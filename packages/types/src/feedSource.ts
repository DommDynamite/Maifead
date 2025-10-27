// Feed Source types for managing RSS feeds and other content sources

export type SourceType = 'rss' | 'youtube' | 'reddit';
export type YoutubeShortsFilter = 'all' | 'exclude' | 'only';

export interface FeedSource {
  id: string; // UUID
  name: string; // Display name (user-provided or auto-detected)
  url: string; // Feed URL, YouTube channel URL, or Reddit subreddit URL
  icon?: string; // Feed icon/favicon URL
  type: SourceType;

  // Type-specific identifiers
  channelId?: string; // YouTube channel ID (e.g., UCsBjURrPoezykLs9EqgamOA)
  subreddit?: string; // Reddit subreddit name (e.g., programming)
  youtubeShortsFilter?: YoutubeShortsFilter; // YouTube shorts filtering

  // Filtering
  whitelistKeywords?: string[]; // Only show content matching these keywords
  blacklistKeywords?: string[]; // Hide content matching these keywords

  // Status
  isEnabled: boolean;
  lastFetchedAt?: Date;
  fetchError?: string;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export type FeedSourceInput = Omit<FeedSource, 'id' | 'createdAt' | 'updatedAt'>;

export type FeedSourceUpdate = Partial<Omit<FeedSource, 'id' | 'url' | 'type' | 'createdAt' | 'updatedAt'>>;

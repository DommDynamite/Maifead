// Feed Source types for managing RSS feeds and other content sources

export type SourceType = 'rss' | 'youtube' | 'reddit' | 'bluesky';
export type YoutubeShortsFilter = 'all' | 'exclude' | 'only';
export type RedditSourceType = 'subreddit' | 'user';

export interface FeedSource {
  id: string; // UUID
  name: string; // Display name (user-provided or auto-detected)
  url: string; // Feed URL, YouTube channel URL, Reddit subreddit URL, or Bluesky profile URL
  icon?: string; // Feed icon/favicon URL
  type: SourceType;

  // Type-specific identifiers
  channelId?: string; // YouTube channel ID (e.g., UCsBjURrPoezykLs9EqgamOA)
  subreddit?: string; // Reddit subreddit name (e.g., programming)
  redditUsername?: string; // Reddit username (e.g., spez)
  redditSourceType?: RedditSourceType; // Whether Reddit source is subreddit or user
  youtubeShortsFilter?: YoutubeShortsFilter; // YouTube shorts filtering
  blueskyHandle?: string; // Bluesky handle (e.g., user.bsky.social)
  blueskyDid?: string; // Bluesky DID (Decentralized Identifier) for future API use
  blueskyFeedUri?: string; // Custom Bluesky feed URI for future API enhancement

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

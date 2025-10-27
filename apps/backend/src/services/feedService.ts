import Parser from 'rss-parser';
import { db } from '../config/database.js';
import { randomUUID } from 'crypto';
import type { Source, FeedItem } from '../types/index.js';

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'media'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['media:group', 'mediaGroup'],
      ['content:encoded', 'contentEncoded'],
      ['description', 'description'],
    ],
  },
});

interface ParsedFeedItem {
  title?: string;
  link?: string;
  content?: string;
  contentSnippet?: string;
  pubDate?: string;
  creator?: string;
  author?: string;
  enclosure?: { url: string };
  media?: { $: { url: string } };
  mediaThumbnail?: { $: { url: string } } | Array<{ $: { url: string; width?: string; height?: string } }>;
  mediaGroup?: {
    'media:thumbnail'?: Array<{ $: { url: string; width?: string; height?: string } }>;
    'media:description'?: Array<{ _: string }>;
    'media:content'?: Array<{ $: { url: string } }>;
  };
  contentEncoded?: string;
  description?: string;
}

export class FeedService {
  /**
   * Extract YouTube channel ID from various URL formats
   * Supports:
   * - https://www.youtube.com/@username
   * - https://www.youtube.com/c/ChannelName
   * - https://www.youtube.com/channel/CHANNEL_ID
   * - https://www.youtube.com/user/username
   */
  static extractYouTubeChannelId(url: string): string | null {
    try {
      const urlObj = new URL(url);

      // Handle RSS feed URL format: /feeds/videos.xml?channel_id=UCxxxxxxxxxx
      if (urlObj.pathname === '/feeds/videos.xml' && urlObj.searchParams.has('channel_id')) {
        return urlObj.searchParams.get('channel_id');
      }

      // Handle video URLs - we'll need to fetch the channel ID from the video page
      // /watch?v=VIDEO_ID or /shorts/VIDEO_ID
      if (urlObj.pathname === '/watch' || urlObj.pathname.startsWith('/shorts/')) {
        return 'VIDEO_URL'; // Special marker to indicate we need to fetch from video page
      }

      // Handle @username format
      const atMatch = urlObj.pathname.match(/^\/@([\w-]+)/);
      if (atMatch) {
        return `@${atMatch[1]}`;
      }

      // Handle /c/ChannelName format
      const cMatch = urlObj.pathname.match(/^\/c\/([\w-]+)/);
      if (cMatch) {
        return cMatch[1];
      }

      // Handle /channel/CHANNEL_ID format
      const channelMatch = urlObj.pathname.match(/^\/channel\/([\w-]+)/);
      if (channelMatch) {
        return channelMatch[1];
      }

      // Handle /user/username format
      const userMatch = urlObj.pathname.match(/^\/user\/([\w-]+)/);
      if (userMatch) {
        return userMatch[1];
      }

      return null;
    } catch (error) {
      console.error('Error extracting YouTube channel ID:', error);
      return null;
    }
  }

  /**
   * Fetch the actual YouTube channel ID from a channel URL
   * Handles @username, /c/, /user/ formats by scraping the channel page
   */
  static async getYouTubeChannelId(url: string): Promise<string | null> {
    try {
      const response = await fetch(url);
      const html = await response.text();

      // Try to find channel ID in the HTML
      // Look for pattern: "channelId":"UCxxxxxxxxxxxxxxxxxx"
      const channelIdMatch = html.match(/"channelId":"(UC[\w-]+)"/);
      if (channelIdMatch) {
        return channelIdMatch[1];
      }

      // Alternative pattern: "browse_id":"UCxxxxxxxxxxxxxxxxxx"
      const browseIdMatch = html.match(/"browse_id":"(UC[\w-]+)"/);
      if (browseIdMatch) {
        return browseIdMatch[1];
      }

      // Another pattern in meta tags
      const metaMatch = html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/channel\/(UC[\w-]+)"/);
      if (metaMatch) {
        return metaMatch[1];
      }

      return null;
    } catch (error) {
      console.error('Error fetching YouTube channel ID:', error);
      return null;
    }
  }

  /**
   * Fetch YouTube channel avatar/icon URL
   */
  static async getYouTubeChannelIcon(url: string): Promise<string | null> {
    try {
      const response = await fetch(url);
      const html = await response.text();

      // Look for avatar in the JSON data structure
      // Pattern 1: "avatar":{"avatarViewModel":{"image":{"sources":[{"url":"...
      const avatarViewModelMatch = html.match(/"avatar":\{"avatarViewModel":\{"image":\{"sources":\[\{"url":"([^"]+)"/);
      if (avatarViewModelMatch) {
        // Remove size parameters and replace with higher resolution
        const avatarUrl = avatarViewModelMatch[1].replace(/=s\d+-/, '=s240-');
        return avatarUrl;
      }

      // Pattern 2: "avatar":{"thumbnails":[{"url":"...
      const avatarThumbnailsMatch = html.match(/"avatar":\s*\{\s*"thumbnails":\s*\[\s*\{\s*"url":\s*"([^"]+)"/);
      if (avatarThumbnailsMatch) {
        const avatarUrl = avatarThumbnailsMatch[1].replace(/=s\d+-/, '=s240-');
        return avatarUrl;
      }

      // Fallback: try to extract from link tag with image_src
      const linkImageMatch = html.match(/<link rel="image_src" href="([^"]+)"/);
      if (linkImageMatch && linkImageMatch[1].includes('yt3.ggpht.com')) {
        return linkImageMatch[1];
      }

      return null;
    } catch (error) {
      console.error('Error fetching YouTube channel icon:', error);
      return null;
    }
  }

  /**
   * Convert YouTube channel ID to RSS feed URL
   */
  static convertYouTubeToRss(channelId: string): string {
    return `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  }

  /**
   * Fetch and parse an RSS feed from a URL
   */
  static async fetchFeed(url: string) {
    try {
      const feed = await parser.parseURL(url);
      return feed;
    } catch (error) {
      console.error(`Error fetching feed from ${url}:`, error);
      throw new Error(`Failed to fetch feed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract favicon/icon URL from feed URL or feed metadata
   */
  static async getFaviconUrl(feedUrl: string, feed?: any): Promise<string | undefined> {
    try {
      // Try to get from feed metadata first
      if (feed?.image?.url) {
        return feed.image.url;
      }

      // Extract base URL from feed URL
      const urlObj = new URL(feedUrl);
      const baseUrl = `${urlObj.protocol}//${urlObj.hostname}`;

      // Use Google's favicon service as a reliable fallback
      // This service fetches favicons from multiple sources and caches them
      return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=128`;
    } catch (error) {
      console.error(`Error getting favicon for ${feedUrl}:`, error);
      return undefined;
    }
  }

  /**
   * Check if a YouTube URL is a short
   */
  private static isYouTubeShort(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.startsWith('/shorts/');
    } catch (error) {
      return false;
    }
  }

  /**
   * Extract video ID from YouTube URL
   */
  private static extractYouTubeVideoId(url: string): string | null {
    try {
      const urlObj = new URL(url);

      // Handle youtube.com/watch?v=VIDEO_ID
      if (urlObj.hostname.includes('youtube.com') && urlObj.searchParams.has('v')) {
        return urlObj.searchParams.get('v');
      }

      // Handle youtu.be/VIDEO_ID
      if (urlObj.hostname === 'youtu.be') {
        return urlObj.pathname.slice(1);
      }

      // Handle youtube.com/shorts/VIDEO_ID
      const shortsMatch = urlObj.pathname.match(/^\/shorts\/([\w-]+)/);
      if (shortsMatch) {
        return shortsMatch[1];
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Create YouTube embed HTML
   */
  private static createYouTubeEmbed(videoId: string, description?: string): string {
    return `
      <div class="youtube-embed" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; margin: 1rem 0;">
        <iframe
          src="https://www.youtube.com/embed/${videoId}"
          style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen>
        </iframe>
      </div>
      ${description ? `<p>${description}</p>` : ''}
    `.trim();
  }

  /**
   * Fetch and store feed items for a specific source
   */
  static async fetchAndStoreItems(source: Source): Promise<number> {
    try {
      const feed = await this.fetchFeed(source.url);
      let newItemsCount = 0;

      for (const item of feed.items as ParsedFeedItem[]) {
        // Check if item already exists
        const existing = db.prepare('SELECT id FROM feed_items WHERE link = ? AND source_id = ?')
          .get(item.link, source.id);

        if (existing) continue;

        // Apply YouTube shorts filter if this is a YouTube source
        if (source.type === 'youtube' && item.link) {
          const isShort = this.isYouTubeShort(item.link);
          const shortsFilter = (source as any).youtubeShortsFilter || 'all';

          // Skip if filter doesn't match
          if (shortsFilter === 'exclude' && isShort) continue;
          if (shortsFilter === 'only' && !isShort) continue;
        }

        // Extract image URL from various possible locations
        const imageUrl = this.extractImageUrl(item);

        // Extract content - for YouTube, create embedded player
        let content = (item as any).contentEncoded || item.content || item.description || '';

        // If this is a YouTube source, create embedded video
        if (source.type === 'youtube' && item.link) {
          const videoId = this.extractYouTubeVideoId(item.link);
          if (videoId) {
            // Get description from multiple possible locations
            let description = '';

            // Try media:group['media:description'] (can be array or string)
            const mediaDesc = item.mediaGroup?.['media:description'];
            if (mediaDesc) {
              if (Array.isArray(mediaDesc)) {
                description = mediaDesc[0]?._ || mediaDesc[0] || '';
              } else if (typeof mediaDesc === 'string') {
                description = mediaDesc;
              } else if (typeof mediaDesc === 'object' && '_' in mediaDesc) {
                description = (mediaDesc as any)._ || '';
              }
            }

            // Fallback to description field
            if (!description && item.description) {
              description = item.description;
            }

            content = this.createYouTubeEmbed(videoId, description);
          }
        }

        const excerpt = this.createExcerpt(item.contentSnippet || item.description || content);

        // Create feed item
        const feedItem: Omit<FeedItem, 'createdAt'> & { createdAt: number } = {
          id: randomUUID(),
          sourceId: source.id,
          title: item.title || 'Untitled',
          link: item.link || '',
          content,
          excerpt,
          author: item.creator || item.author,
          publishedAt: item.pubDate ? new Date(item.pubDate) : undefined,
          imageUrl,
          read: false,
          saved: false,
          createdAt: Date.now(),
        };

        // Insert into database
        db.prepare(`
          INSERT INTO feed_items (
            id, source_id, title, link, content, excerpt, author, published_at, image_url, read, saved, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          feedItem.id,
          feedItem.sourceId,
          feedItem.title,
          feedItem.link,
          feedItem.content,
          feedItem.excerpt,
          feedItem.author,
          feedItem.publishedAt?.getTime(),
          feedItem.imageUrl,
          feedItem.read ? 1 : 0,
          feedItem.saved ? 1 : 0,
          feedItem.createdAt
        );

        newItemsCount++;
      }

      // Update last fetched timestamp
      db.prepare('UPDATE sources SET last_fetched_at = ? WHERE id = ?')
        .run(Date.now(), source.id);

      console.log(`Fetched ${newItemsCount} new items for source: ${source.name}`);
      return newItemsCount;
    } catch (error) {
      console.error(`Error fetching items for source ${source.name}:`, error);
      throw error;
    }
  }

  /**
   * Fetch items for all sources belonging to a user
   */
  static async fetchAllUserSources(userId: string): Promise<void> {
    const sources = db.prepare('SELECT * FROM sources WHERE user_id = ?')
      .all(userId) as any[];

    for (const sourceRow of sources) {
      const source = this.rowToSource(sourceRow);
      try {
        await this.fetchAndStoreItems(source);
      } catch (error) {
        console.error(`Failed to fetch source ${source.name}:`, error);
        // Continue with other sources even if one fails
      }
    }
  }

  /**
   * Fetch items for all sources (used by cron job)
   */
  static async fetchAllSources(): Promise<void> {
    const sources = db.prepare('SELECT * FROM sources').all() as any[];

    for (const sourceRow of sources) {
      const source = this.rowToSource(sourceRow);
      try {
        await this.fetchAndStoreItems(source);
      } catch (error) {
        console.error(`Failed to fetch source ${source.name}:`, error);
        // Continue with other sources even if one fails
      }
    }
  }

  /**
   * Extract image URL from various feed item formats
   */
  private static extractImageUrl(item: ParsedFeedItem): string | undefined {
    // Try media:group (YouTube uses this)
    if (item.mediaGroup) {
      // Try media:thumbnail in media:group
      const thumbnails = item.mediaGroup['media:thumbnail'];
      if (thumbnails && Array.isArray(thumbnails) && thumbnails.length > 0) {
        // Get the largest thumbnail (last one is usually highest resolution)
        const thumbnail = thumbnails[thumbnails.length - 1];
        if (thumbnail?.$ && thumbnail.$.url) {
          return thumbnail.$.url;
        }
      }

      // Try media:content in media:group
      const mediaContent = item.mediaGroup['media:content'];
      if (mediaContent && Array.isArray(mediaContent) && mediaContent.length > 0) {
        const content = mediaContent[0];
        if (content?.$ && content.$.url) {
          return content.$.url;
        }
      }
    }

    // Try media:thumbnail directly
    if (item.mediaThumbnail) {
      if (Array.isArray(item.mediaThumbnail) && item.mediaThumbnail.length > 0) {
        const thumbnail = item.mediaThumbnail[item.mediaThumbnail.length - 1];
        if (thumbnail?.$ && thumbnail.$.url) {
          return thumbnail.$.url;
        }
      } else if (typeof item.mediaThumbnail === 'object' && '$' in item.mediaThumbnail) {
        return item.mediaThumbnail.$.url;
      }
    }

    // Try media:content
    if (item.media && typeof item.media === 'object' && '$' in item.media) {
      return item.media.$.url;
    }

    // Try enclosure
    if (item.enclosure?.url) {
      return item.enclosure.url;
    }

    // Try to find image in content
    const content = (item as any).contentEncoded || item.content || item.description || '';
    const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
    if (imgMatch) {
      return imgMatch[1];
    }

    return undefined;
  }

  /**
   * Create excerpt from content
   */
  private static createExcerpt(text: string, maxLength: number = 200): string {
    // Strip HTML tags
    const stripped = text.replace(/<[^>]*>/g, '');
    // Truncate
    if (stripped.length <= maxLength) return stripped;
    return stripped.substring(0, maxLength).trim() + '...';
  }

  /**
   * Update source icon URL by fetching it from the feed
   */
  static async updateSourceIcon(sourceId: string, url: string): Promise<void> {
    try {
      const feed = await this.fetchFeed(url);
      const iconUrl = await this.getFaviconUrl(url, feed);

      if (iconUrl) {
        db.prepare('UPDATE sources SET icon_url = ?, updated_at = ? WHERE id = ?')
          .run(iconUrl, Date.now(), sourceId);
        console.log(`Updated icon for source ${sourceId}: ${iconUrl}`);
      }
    } catch (error) {
      console.error(`Failed to update icon for source ${sourceId}:`, error);
    }
  }

  /**
   * Update icons for all sources that don't have one
   */
  static async updateMissingIcons(): Promise<void> {
    const sources = db.prepare('SELECT * FROM sources WHERE icon_url IS NULL').all() as any[];

    console.log(`Updating icons for ${sources.length} sources...`);

    for (const sourceRow of sources) {
      const source = this.rowToSource(sourceRow);
      await this.updateSourceIcon(source.id, source.url);
    }

    console.log('Finished updating source icons');
  }

  /**
   * Convert database row to Source object
   */
  private static rowToSource(row: any): Source {
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      url: row.url,
      type: row.type || 'rss',
      channelId: row.channel_id,
      youtubeShortsFilter: row.youtube_shorts_filter || 'all',
      iconUrl: row.icon_url,
      description: row.description,
      category: row.category,
      fetchInterval: row.fetch_interval,
      lastFetchedAt: row.last_fetched_at ? new Date(row.last_fetched_at) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}

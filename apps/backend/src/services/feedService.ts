import Parser from 'rss-parser';
import { db } from '../config/database.js';
import { randomUUID } from 'crypto';
import type { Source, FeedItem } from '../types/index.js';

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'media'],
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
  contentEncoded?: string;
  description?: string;
}

export class FeedService {
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

        // Extract image URL from various possible locations
        const imageUrl = this.extractImageUrl(item);

        // Extract content
        const content = (item as any).contentEncoded || item.content || item.description || '';
        const excerpt = this.createExcerpt(item.contentSnippet || content);

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

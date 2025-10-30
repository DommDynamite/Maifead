import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { db } from '../config/database.js';
import { FeedService } from '../services/feedService.js';
import type { CreateSourceRequest, UpdateSourceRequest } from '../types/index.js';

export class SourcesController {
  /**
   * Get all sources for the authenticated user
   */
  static async getAll(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;

      const sources = db.prepare(`
        SELECT * FROM sources WHERE user_id = ? ORDER BY created_at DESC
      `).all(userId) as any[];

      res.json(sources.map(s => ({
        id: s.id,
        userId: s.user_id,
        name: s.name,
        url: s.url,
        type: s.type || 'rss',
        channelId: s.channel_id,
        subreddit: s.subreddit,
        redditUsername: s.reddit_username,
        redditSourceType: s.reddit_source_type,
        youtubeShortsFilter: s.youtube_shorts_filter || 'all',
        blueskyHandle: s.bluesky_handle,
        iconUrl: s.icon_url,
        description: s.description,
        category: s.category,
        fetchInterval: s.fetch_interval,
        retentionDays: s.retention_days ?? 30,
        suppressFromMainFeed: s.suppress_from_main_feed || false,
        lastFetchedAt: s.last_fetched_at ? new Date(s.last_fetched_at) : null,
        whitelistKeywords: s.whitelist_keywords ? JSON.parse(s.whitelist_keywords) : [],
        blacklistKeywords: s.blacklist_keywords ? JSON.parse(s.blacklist_keywords) : [],
        createdAt: new Date(s.created_at),
        updatedAt: new Date(s.updated_at),
      })));
    } catch (error) {
      console.error('Get sources error:', error);
      res.status(500).json({ error: 'Failed to get sources' });
    }
  }

  /**
   * Create a new source
   */
  static async create(req: Request<{}, {}, CreateSourceRequest>, res: Response) {
    try {
      const userId = (req as any).userId;
      const { name, url, type, channelId, subreddit, redditUsername, redditSourceType, youtubeShortsFilter, category, retentionDays, suppressFromMainFeed, whitelistKeywords, blacklistKeywords } = req.body;

      if (!name || !url) {
        return res.status(400).json({ error: 'Name and URL are required' });
      }

      const sourceType = type || 'rss';
      let feedUrl = url;
      let extractedChannelId = channelId;
      let extractedSubreddit = subreddit;
      let extractedRedditUsername = redditUsername;
      let extractedRedditSourceType = redditSourceType;
      let extractedBlueskyHandle: string | undefined;
      let iconUrl: string | undefined;

      // Handle YouTube sources
      if (sourceType === 'youtube') {
        // If channel ID not provided or not a real UC ID, fetch it from the URL
        if (!extractedChannelId || !extractedChannelId.startsWith('UC')) {
          // First try to extract a basic identifier from URL
          const identifier = FeedService.extractYouTubeChannelId(url);
          if (!identifier) {
            return res.status(400).json({ error: 'Invalid YouTube URL. Please paste a video URL, channel URL, or RSS feed URL.' });
          }

          // If it's not a UC channel ID, fetch the real one from the page
          if (!identifier.startsWith('UC')) {
            const realChannelId = await FeedService.getYouTubeChannelId(url);
            if (!realChannelId) {
              return res.status(400).json({ error: 'Could not find YouTube channel ID from this URL' });
            }
            extractedChannelId = realChannelId;
          } else {
            extractedChannelId = identifier;
          }
        }

        // Convert YouTube URL to RSS feed URL
        feedUrl = FeedService.convertYouTubeToRss(extractedChannelId);

        // Fetch the channel icon from the channel page (not from a video page)
        const channelUrl = `https://www.youtube.com/channel/${extractedChannelId}`;
        iconUrl = await FeedService.getYouTubeChannelIcon(channelUrl) ||
                  'https://www.youtube.com/s/desktop/8f4c562e/img/favicon_144x144.png';
      }

      // Handle Reddit sources
      if (sourceType === 'reddit') {
        const redditIdentifier = FeedService.extractRedditIdentifier(url);
        if (!redditIdentifier) {
          return res.status(400).json({ error: 'Invalid Reddit URL. Please provide a subreddit (e.g., r/programming) or user URL (e.g., u/username).' });
        }

        extractedRedditSourceType = redditIdentifier.type;
        if (redditIdentifier.type === 'subreddit') {
          extractedSubreddit = redditIdentifier.value;
          feedUrl = FeedService.convertRedditSubredditToRss(redditIdentifier.value);
          // Fetch subreddit icon
          iconUrl = await FeedService.getRedditSubredditIcon(redditIdentifier.value) ||
                    'https://www.redditstatic.com/desktop2x/img/favicon/favicon-96x96.png';
        } else {
          extractedRedditUsername = redditIdentifier.value;
          feedUrl = FeedService.convertRedditUserToRss(redditIdentifier.value);
          // Fetch user icon
          iconUrl = await FeedService.getRedditUserIcon(redditIdentifier.value) ||
                    'https://www.redditstatic.com/desktop2x/img/favicon/favicon-96x96.png';
        }
      }

      // Handle Bluesky sources
      if (sourceType === 'bluesky') {
        const handle = FeedService.extractBlueskyHandle(url);
        if (!handle) {
          return res.status(400).json({ error: 'Invalid Bluesky handle. Please provide a handle (e.g., user.bsky.social) or profile URL.' });
        }

        extractedBlueskyHandle = handle;
        feedUrl = FeedService.convertBlueskyToRss(handle);
        // Fetch user avatar
        iconUrl = await FeedService.getBlueskyAvatar(handle) ||
                  'https://bsky.app/static/favicon-16x16.png';
      }

      // Validate the feed URL and fetch metadata
      let feed;
      try {
        feed = await FeedService.fetchFeed(feedUrl);
      } catch (error) {
        const errorMessage = sourceType === 'youtube' ? 'Invalid YouTube channel' :
                            sourceType === 'reddit' ? 'Invalid Reddit source' :
                            sourceType === 'bluesky' ? 'Invalid Bluesky user' :
                            'Invalid RSS feed URL';
        return res.status(400).json({ error: errorMessage });
      }

      // Get favicon URL for RSS feeds
      if (sourceType === 'rss') {
        iconUrl = await FeedService.getFaviconUrl(feedUrl, feed);
      }

      const sourceId = randomUUID();
      const now = Date.now();

      // Serialize keyword arrays to JSON strings
      const whitelistJson = whitelistKeywords && whitelistKeywords.length > 0
        ? JSON.stringify(whitelistKeywords)
        : null;
      const blacklistJson = blacklistKeywords && blacklistKeywords.length > 0
        ? JSON.stringify(blacklistKeywords)
        : null;

      db.prepare(`
        INSERT INTO sources (id, user_id, name, url, type, channel_id, subreddit, reddit_username, reddit_source_type, youtube_shorts_filter, bluesky_handle, category, icon_url, retention_days, suppress_from_main_feed, whitelist_keywords, blacklist_keywords, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        sourceId,
        userId,
        name,
        feedUrl, // Store the RSS feed URL, not the original input URL
        sourceType,
        extractedChannelId || null,
        extractedSubreddit || null,
        extractedRedditUsername || null,
        extractedRedditSourceType || null,
        youtubeShortsFilter || 'all',
        extractedBlueskyHandle || null,
        category || null,
        iconUrl || null,
        retentionDays ?? 30,
        suppressFromMainFeed ? 1 : 0,
        whitelistJson,
        blacklistJson,
        now,
        now
      );

      const source = db.prepare('SELECT * FROM sources WHERE id = ?').get(sourceId) as any;

      // Fetch initial items in the background
      FeedService.fetchAndStoreItems({
        id: source.id,
        userId: source.user_id,
        name: source.name,
        url: source.url,
        type: source.type || 'rss',
        channelId: source.channel_id,
        subreddit: source.subreddit,
        redditUsername: source.reddit_username,
        redditSourceType: source.reddit_source_type,
        youtubeShortsFilter: source.youtube_shorts_filter || 'all',
        blueskyHandle: source.bluesky_handle,
        blueskyDid: source.bluesky_did,
        blueskyFeedUri: source.bluesky_feed_uri,
        iconUrl: source.icon_url,
        description: source.description,
        category: source.category,
        fetchInterval: source.fetch_interval,
        lastFetchedAt: source.last_fetched_at ? new Date(source.last_fetched_at) : undefined,
        createdAt: new Date(source.created_at),
        updatedAt: new Date(source.updated_at),
      }).catch(err => console.error('Background fetch error:', err));

      res.status(201).json({
        id: source.id,
        userId: source.user_id,
        name: source.name,
        url: source.url,
        type: source.type || 'rss',
        channelId: source.channel_id,
        subreddit: source.subreddit,
        redditUsername: source.reddit_username,
        redditSourceType: source.reddit_source_type,
        youtubeShortsFilter: source.youtube_shorts_filter || 'all',
        blueskyHandle: source.bluesky_handle,
        iconUrl: source.icon_url,
        description: source.description,
        category: source.category,
        fetchInterval: source.fetch_interval,
        retentionDays: source.retention_days ?? 30,
        suppressFromMainFeed: source.suppress_from_main_feed || false,
        lastFetchedAt: source.last_fetched_at ? new Date(source.last_fetched_at) : null,
        whitelistKeywords: source.whitelist_keywords ? JSON.parse(source.whitelist_keywords) : [],
        blacklistKeywords: source.blacklist_keywords ? JSON.parse(source.blacklist_keywords) : [],
        createdAt: new Date(source.created_at),
        updatedAt: new Date(source.updated_at),
      });
    } catch (error) {
      console.error('Create source error:', error);
      res.status(500).json({ error: 'Failed to create source' });
    }
  }

  /**
   * Update a source
   */
  static async update(req: Request<{ id: string }, {}, UpdateSourceRequest>, res: Response) {
    try {
      const userId = (req as any).userId;
      const { id } = req.params;
      const { name, category, fetchInterval, youtubeShortsFilter, retentionDays, suppressFromMainFeed, whitelistKeywords, blacklistKeywords } = req.body;

      // Verify ownership
      const source = db.prepare('SELECT * FROM sources WHERE id = ? AND user_id = ?')
        .get(id, userId);

      if (!source) {
        return res.status(404).json({ error: 'Source not found' });
      }

      // Build update query
      const updates: string[] = [];
      const values: any[] = [];

      if (name) {
        updates.push('name = ?');
        values.push(name);
      }
      if (category !== undefined) {
        updates.push('category = ?');
        values.push(category);
      }
      if (fetchInterval) {
        updates.push('fetch_interval = ?');
        values.push(fetchInterval);
      }
      if (youtubeShortsFilter !== undefined) {
        updates.push('youtube_shorts_filter = ?');
        values.push(youtubeShortsFilter);
      }
      if (retentionDays !== undefined) {
        updates.push('retention_days = ?');
        values.push(retentionDays);
      }
      if (suppressFromMainFeed !== undefined) {
        updates.push('suppress_from_main_feed = ?');
        values.push(suppressFromMainFeed ? 1 : 0);
      }
      if (whitelistKeywords !== undefined) {
        updates.push('whitelist_keywords = ?');
        values.push(whitelistKeywords.length > 0 ? JSON.stringify(whitelistKeywords) : null);
      }
      if (blacklistKeywords !== undefined) {
        updates.push('blacklist_keywords = ?');
        values.push(blacklistKeywords.length > 0 ? JSON.stringify(blacklistKeywords) : null);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No updates provided' });
      }

      updates.push('updated_at = ?');
      values.push(Date.now());
      values.push(id);

      db.prepare(`UPDATE sources SET ${updates.join(', ')} WHERE id = ?`)
        .run(...values);

      const updated = db.prepare('SELECT * FROM sources WHERE id = ?').get(id) as any;

      res.json({
        id: updated.id,
        userId: updated.user_id,
        name: updated.name,
        url: updated.url,
        type: updated.type || 'rss',
        channelId: updated.channel_id,
        subreddit: updated.subreddit,
        redditUsername: updated.reddit_username,
        redditSourceType: updated.reddit_source_type,
        youtubeShortsFilter: updated.youtube_shorts_filter || 'all',
        blueskyHandle: updated.bluesky_handle,
        iconUrl: updated.icon_url,
        description: updated.description,
        category: updated.category,
        retentionDays: updated.retention_days ?? 30,
        suppressFromMainFeed: updated.suppress_from_main_feed || false,
        fetchInterval: updated.fetch_interval,
        lastFetchedAt: updated.last_fetched_at ? new Date(updated.last_fetched_at) : null,
        whitelistKeywords: updated.whitelist_keywords ? JSON.parse(updated.whitelist_keywords) : [],
        blacklistKeywords: updated.blacklist_keywords ? JSON.parse(updated.blacklist_keywords) : [],
        createdAt: new Date(updated.created_at),
        updatedAt: new Date(updated.updated_at),
      });
    } catch (error) {
      console.error('Update source error:', error);
      res.status(500).json({ error: 'Failed to update source' });
    }
  }

  /**
   * Delete a source
   */
  static async delete(req: Request<{ id: string }>, res: Response) {
    try {
      const userId = (req as any).userId;
      const { id } = req.params;

      // Verify ownership
      const source = db.prepare('SELECT * FROM sources WHERE id = ? AND user_id = ?')
        .get(id, userId);

      if (!source) {
        return res.status(404).json({ error: 'Source not found' });
      }

      // Remove source from all feads first
      db.prepare('DELETE FROM fead_sources WHERE source_id = ?').run(id);

      // Then delete the source itself (cascade will handle feed_items)
      db.prepare('DELETE FROM sources WHERE id = ?').run(id);

      res.json({ message: 'Source deleted successfully' });
    } catch (error) {
      console.error('Delete source error:', error);
      res.status(500).json({ error: 'Failed to delete source' });
    }
  }

  /**
   * Manually refresh a source's feed
   */
  static async refresh(req: Request<{ id: string }>, res: Response) {
    try {
      const userId = (req as any).userId;
      const { id } = req.params;

      // Verify ownership
      const sourceRow = db.prepare('SELECT * FROM sources WHERE id = ? AND user_id = ?')
        .get(id, userId) as any;

      if (!sourceRow) {
        return res.status(404).json({ error: 'Source not found' });
      }

      const source = {
        id: sourceRow.id,
        userId: sourceRow.user_id,
        name: sourceRow.name,
        url: sourceRow.url,
        type: sourceRow.type || 'rss',
        channelId: sourceRow.channel_id,
        subreddit: sourceRow.subreddit,
        redditUsername: sourceRow.reddit_username,
        redditSourceType: sourceRow.reddit_source_type,
        youtubeShortsFilter: sourceRow.youtube_shorts_filter || 'all',
        blueskyHandle: sourceRow.bluesky_handle,
        blueskyDid: sourceRow.bluesky_did,
        blueskyFeedUri: sourceRow.bluesky_feed_uri,
        iconUrl: sourceRow.icon_url,
        description: sourceRow.description,
        category: sourceRow.category,
        fetchInterval: sourceRow.fetch_interval,
        lastFetchedAt: sourceRow.last_fetched_at ? new Date(sourceRow.last_fetched_at) : undefined,
        createdAt: new Date(sourceRow.created_at),
        updatedAt: new Date(sourceRow.updated_at),
      };

      const newItemsCount = await FeedService.fetchAndStoreItems(source);

      res.json({
        message: 'Source refreshed successfully',
        newItemsCount,
      });
    } catch (error) {
      console.error('Refresh source error:', error);
      res.status(500).json({ error: 'Failed to refresh source' });
    }
  }

  /**
   * Refresh all sources for the authenticated user
   */
  static async refreshAll(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;

      // Get all user's sources
      const sources = db.prepare('SELECT * FROM sources WHERE user_id = ?').all(userId) as any[];

      if (sources.length === 0) {
        return res.json({
          message: 'No sources to refresh',
          totalNewItems: 0,
          sourcesRefreshed: 0,
        });
      }

      // Refresh all sources
      let totalNewItems = 0;
      for (const sourceRow of sources) {
        try {
          const source = {
            id: sourceRow.id,
            userId: sourceRow.user_id,
            name: sourceRow.name,
            url: sourceRow.url,
            type: sourceRow.type || 'rss',
            channelId: sourceRow.channel_id,
            subreddit: sourceRow.subreddit,
            redditUsername: sourceRow.reddit_username,
            redditSourceType: sourceRow.reddit_source_type,
            youtubeShortsFilter: sourceRow.youtube_shorts_filter || 'all',
            blueskyHandle: sourceRow.bluesky_handle,
            blueskyDid: sourceRow.bluesky_did,
            blueskyFeedUri: sourceRow.bluesky_feed_uri,
            iconUrl: sourceRow.icon_url,
            description: sourceRow.description,
            category: sourceRow.category,
            fetchInterval: sourceRow.fetch_interval,
            lastFetchedAt: sourceRow.last_fetched_at ? new Date(sourceRow.last_fetched_at) : undefined,
            createdAt: new Date(sourceRow.created_at),
            updatedAt: new Date(sourceRow.updated_at),
          };

          const newItemsCount = await FeedService.fetchAndStoreItems(source);
          totalNewItems += newItemsCount;
        } catch (error) {
          console.error(`Error refreshing source ${sourceRow.name}:`, error);
          // Continue with other sources even if one fails
        }
      }

      res.json({
        message: 'All sources refreshed successfully',
        totalNewItems,
        sourcesRefreshed: sources.length,
      });
    } catch (error) {
      console.error('Refresh all sources error:', error);
      res.status(500).json({ error: 'Failed to refresh sources' });
    }
  }

  /**
   * Update icons for all sources (admin/utility endpoint)
   */
  static async updateIcons(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;

      // Update icons for user's sources that don't have one
      const sources = db.prepare('SELECT * FROM sources WHERE user_id = ? AND icon_url IS NULL')
        .all(userId) as any[];

      const updatePromises = sources.map(async (sourceRow: any) => {
        await FeedService.updateSourceIcon(sourceRow.id, sourceRow.url);
      });

      await Promise.all(updatePromises);

      res.json({
        message: 'Source icons updated successfully',
        updatedCount: sources.length,
      });
    } catch (error) {
      console.error('Update icons error:', error);
      res.status(500).json({ error: 'Failed to update icons' });
    }
  }
}

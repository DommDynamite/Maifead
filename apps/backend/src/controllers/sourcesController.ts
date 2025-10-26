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
        iconUrl: s.icon_url,
        description: s.description,
        category: s.category,
        fetchInterval: s.fetch_interval,
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
      const { name, url, type, channelId, category, whitelistKeywords, blacklistKeywords } = req.body;

      if (!name || !url) {
        return res.status(400).json({ error: 'Name and URL are required' });
      }

      const sourceType = type || 'rss';
      let feedUrl = url;
      let extractedChannelId = channelId;
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

        // Fetch the channel icon from the page
        iconUrl = await FeedService.getYouTubeChannelIcon(url) ||
                  'https://www.youtube.com/s/desktop/8f4c562e/img/favicon_144x144.png';
      }

      // Validate the feed URL and fetch metadata
      let feed;
      try {
        feed = await FeedService.fetchFeed(feedUrl);
      } catch (error) {
        return res.status(400).json({
          error: sourceType === 'youtube' ? 'Invalid YouTube channel' : 'Invalid RSS feed URL'
        });
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
        INSERT INTO sources (id, user_id, name, url, type, channel_id, category, icon_url, whitelist_keywords, blacklist_keywords, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        sourceId,
        userId,
        name,
        feedUrl, // Store the RSS feed URL, not the original YouTube URL
        sourceType,
        extractedChannelId || null,
        category || null,
        iconUrl || null,
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
        iconUrl: source.icon_url,
        description: source.description,
        category: source.category,
        fetchInterval: source.fetch_interval,
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
      const { name, category, fetchInterval, whitelistKeywords, blacklistKeywords } = req.body;

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
        iconUrl: updated.icon_url,
        description: updated.description,
        category: updated.category,
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

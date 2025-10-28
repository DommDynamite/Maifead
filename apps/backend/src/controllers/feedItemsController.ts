import { Request, Response } from 'express';
import { db } from '../config/database.js';

export class FeedItemsController {
  /**
   * Get all feed items for the authenticated user
   */
  static async getAll(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const { sourceId, read, saved, limit = 50, offset = 0 } = req.query;

      console.log('[getAll] Request received:', { userId, sourceId, read, saved, limit, offset });

      let query = `
        SELECT fi.*,
               COALESCE(ufi.read, 0) as read,
               COALESCE(ufi.saved, 0) as saved
        FROM feed_items fi
        INNER JOIN sources s ON fi.source_id = s.id
        LEFT JOIN user_feed_items ufi ON fi.id = ufi.feed_item_id AND ufi.user_id = ?
        WHERE s.user_id = ?
      `;
      const params: any[] = [userId, userId];

      if (sourceId) {
        query += ' AND fi.source_id = ?';
        params.push(sourceId);
      }

      if (read !== undefined) {
        query += ' AND COALESCE(ufi.read, 0) = ?';
        params.push(read === 'true' ? 1 : 0);
      }

      if (saved !== undefined) {
        query += ' AND COALESCE(ufi.saved, 0) = ?';
        params.push(saved === 'true' ? 1 : 0);
      }

      query += ' ORDER BY fi.published_at DESC, fi.created_at DESC LIMIT ? OFFSET ?';
      params.push(Number(limit), Number(offset));

      const items = db.prepare(query).all(...params) as any[];

      console.log('[getAll] Found', items.length, 'items');
      console.log('[getAll] First item read status:', items[0] ? { id: items[0].id, read: items[0].read } : 'no items');

      res.json(items.map(item => ({
        id: item.id,
        sourceId: item.source_id,
        title: item.title,
        link: item.link,
        content: item.content,
        excerpt: item.excerpt,
        author: item.author,
        publishedAt: item.published_at ? new Date(item.published_at) : null,
        imageUrl: item.image_url,
        read: Boolean(item.read),
        saved: Boolean(item.saved),
        createdAt: new Date(item.created_at),
      })));
    } catch (error) {
      console.error('[getAll] Error:', error);
      res.status(500).json({ error: 'Failed to get feed items' });
    }
  }

  /**
   * Get a single feed item
   */
  static async getOne(req: Request<{ id: string }>, res: Response) {
    try {
      const userId = (req as any).userId;
      const { id } = req.params;

      const item = db.prepare(`
        SELECT fi.*,
               COALESCE(ufi.read, 0) as read,
               COALESCE(ufi.saved, 0) as saved
        FROM feed_items fi
        INNER JOIN sources s ON fi.source_id = s.id
        LEFT JOIN user_feed_items ufi ON fi.id = ufi.feed_item_id AND ufi.user_id = ?
        WHERE fi.id = ? AND s.user_id = ?
      `).get(userId, id, userId) as any;

      if (!item) {
        return res.status(404).json({ error: 'Feed item not found' });
      }

      res.json({
        id: item.id,
        sourceId: item.source_id,
        title: item.title,
        link: item.link,
        content: item.content,
        excerpt: item.excerpt,
        author: item.author,
        publishedAt: item.published_at ? new Date(item.published_at) : null,
        imageUrl: item.image_url,
        read: Boolean(item.read),
        saved: Boolean(item.saved),
        createdAt: new Date(item.created_at),
      });
    } catch (error) {
      console.error('Get feed item error:', error);
      res.status(500).json({ error: 'Failed to get feed item' });
    }
  }

  /**
   * Mark item as read/unread
   */
  static async markRead(req: Request<{ id: string }>, res: Response) {
    try {
      const userId = (req as any).userId;
      const { id } = req.params;
      const { read } = req.body;

      console.log('[markRead] Request received:', { userId, itemId: id, read });

      // Verify ownership
      const item = db.prepare(`
        SELECT fi.* FROM feed_items fi
        INNER JOIN sources s ON fi.source_id = s.id
        WHERE fi.id = ? AND s.user_id = ?
      `).get(id, userId);

      if (!item) {
        console.log('[markRead] Item not found or user does not own it');
        return res.status(404).json({ error: 'Feed item not found' });
      }

      const now = Date.now();

      console.log('[markRead] Upserting into user_feed_items:', { userId, itemId: id, read: read ? 1 : 0 });

      // Insert or update user_feed_items record
      const result = db.prepare(`
        INSERT INTO user_feed_items (user_id, feed_item_id, read, saved, updated_at)
        VALUES (?, ?, ?, 0, ?)
        ON CONFLICT(user_id, feed_item_id)
        DO UPDATE SET read = ?, updated_at = ?
      `).run(userId, id, read ? 1 : 0, now, read ? 1 : 0, now);

      console.log('[markRead] Upsert result:', result);

      // Verify the data was saved
      const savedRecord = db.prepare(`
        SELECT * FROM user_feed_items WHERE user_id = ? AND feed_item_id = ?
      `).get(userId, id);

      console.log('[markRead] Verified saved record:', savedRecord);

      res.json({ message: 'Feed item updated successfully' });
    } catch (error) {
      console.error('[markRead] Error:', error);
      res.status(500).json({ error: 'Failed to update feed item' });
    }
  }

  /**
   * Mark item as saved/unsaved
   */
  static async markSaved(req: Request<{ id: string }>, res: Response) {
    try {
      const userId = (req as any).userId;
      const { id } = req.params;
      const { saved } = req.body;

      // Verify ownership
      const item = db.prepare(`
        SELECT fi.* FROM feed_items fi
        INNER JOIN sources s ON fi.source_id = s.id
        WHERE fi.id = ? AND s.user_id = ?
      `).get(id, userId);

      if (!item) {
        return res.status(404).json({ error: 'Feed item not found' });
      }

      const now = Date.now();

      // Insert or update user_feed_items record
      db.prepare(`
        INSERT INTO user_feed_items (user_id, feed_item_id, read, saved, updated_at)
        VALUES (?, ?, 0, ?, ?)
        ON CONFLICT(user_id, feed_item_id)
        DO UPDATE SET saved = ?, updated_at = ?
      `).run(userId, id, saved ? 1 : 0, now, saved ? 1 : 0, now);

      res.json({ message: 'Feed item updated successfully' });
    } catch (error) {
      console.error('Mark saved error:', error);
      res.status(500).json({ error: 'Failed to update feed item' });
    }
  }

  /**
   * Mark all items as read
   */
  static async markAllRead(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const { sourceId } = req.query;
      const now = Date.now();

      if (sourceId) {
        // Verify ownership of source
        const source = db.prepare('SELECT * FROM sources WHERE id = ? AND user_id = ?')
          .get(sourceId, userId);

        if (!source) {
          return res.status(404).json({ error: 'Source not found' });
        }

        // Get all feed items for this source
        const items = db.prepare('SELECT id FROM feed_items WHERE source_id = ?').all(sourceId) as any[];

        // Insert or update user_feed_items for each item
        const upsertStmt = db.prepare(`
          INSERT INTO user_feed_items (user_id, feed_item_id, read, saved, updated_at)
          VALUES (?, ?, 1, 0, ?)
          ON CONFLICT(user_id, feed_item_id)
          DO UPDATE SET read = 1, updated_at = ?
        `);

        for (const item of items) {
          upsertStmt.run(userId, item.id, now, now);
        }
      } else {
        // Mark all items from all user sources as read
        const items = db.prepare(`
          SELECT fi.id FROM feed_items fi
          INNER JOIN sources s ON fi.source_id = s.id
          WHERE s.user_id = ?
        `).all(userId) as any[];

        // Insert or update user_feed_items for each item
        const upsertStmt = db.prepare(`
          INSERT INTO user_feed_items (user_id, feed_item_id, read, saved, updated_at)
          VALUES (?, ?, 1, 0, ?)
          ON CONFLICT(user_id, feed_item_id)
          DO UPDATE SET read = 1, updated_at = ?
        `);

        for (const item of items) {
          upsertStmt.run(userId, item.id, now, now);
        }
      }

      res.json({ message: 'All items marked as read' });
    } catch (error) {
      console.error('Mark all read error:', error);
      res.status(500).json({ error: 'Failed to mark items as read' });
    }
  }
}

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

      let query = `
        SELECT fi.* FROM feed_items fi
        INNER JOIN sources s ON fi.source_id = s.id
        WHERE s.user_id = ?
      `;
      const params: any[] = [userId];

      if (sourceId) {
        query += ' AND fi.source_id = ?';
        params.push(sourceId);
      }

      if (read !== undefined) {
        query += ' AND fi.read = ?';
        params.push(read === 'true' ? 1 : 0);
      }

      if (saved !== undefined) {
        query += ' AND fi.saved = ?';
        params.push(saved === 'true' ? 1 : 0);
      }

      query += ' ORDER BY fi.published_at DESC, fi.created_at DESC LIMIT ? OFFSET ?';
      params.push(Number(limit), Number(offset));

      const items = db.prepare(query).all(...params) as any[];

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
      console.error('Get feed items error:', error);
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
        SELECT fi.* FROM feed_items fi
        INNER JOIN sources s ON fi.source_id = s.id
        WHERE fi.id = ? AND s.user_id = ?
      `).get(id, userId) as any;

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

      // Verify ownership
      const item = db.prepare(`
        SELECT fi.* FROM feed_items fi
        INNER JOIN sources s ON fi.source_id = s.id
        WHERE fi.id = ? AND s.user_id = ?
      `).get(id, userId);

      if (!item) {
        return res.status(404).json({ error: 'Feed item not found' });
      }

      db.prepare('UPDATE feed_items SET read = ? WHERE id = ?')
        .run(read ? 1 : 0, id);

      res.json({ message: 'Feed item updated successfully' });
    } catch (error) {
      console.error('Mark read error:', error);
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

      db.prepare('UPDATE feed_items SET saved = ? WHERE id = ?')
        .run(saved ? 1 : 0, id);

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

      if (sourceId) {
        // Verify ownership of source
        const source = db.prepare('SELECT * FROM sources WHERE id = ? AND user_id = ?')
          .get(sourceId, userId);

        if (!source) {
          return res.status(404).json({ error: 'Source not found' });
        }

        db.prepare('UPDATE feed_items SET read = 1 WHERE source_id = ?').run(sourceId);
      } else {
        // Mark all items from all user sources as read
        db.prepare(`
          UPDATE feed_items SET read = 1
          WHERE source_id IN (SELECT id FROM sources WHERE user_id = ?)
        `).run(userId);
      }

      res.json({ message: 'All items marked as read' });
    } catch (error) {
      console.error('Mark all read error:', error);
      res.status(500).json({ error: 'Failed to mark items as read' });
    }
  }
}

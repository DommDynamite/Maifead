import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { db } from '../config/database.js';
import type { CreateCollectionRequest, UpdateCollectionRequest } from '../types/index.js';

export class CollectionsController {
  /**
   * Get all collections for the authenticated user
   */
  static async getAll(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;

      const collections = db.prepare(`
        SELECT * FROM collections WHERE user_id = ? ORDER BY created_at DESC
      `).all(userId) as any[];

      // Get item IDs for each collection
      const collectionsWithItems = collections.map(c => {
        const items = db.prepare(
          'SELECT saved_item_id FROM collection_items WHERE collection_id = ?'
        ).all(c.id) as any[];

        return {
          id: c.id,
          userId: c.user_id,
          name: c.name,
          color: c.color,
          icon: c.icon,
          itemIds: items.map(item => item.saved_item_id),
          createdAt: new Date(c.created_at),
          updatedAt: new Date(c.updated_at),
        };
      });

      res.json(collectionsWithItems);
    } catch (error) {
      console.error('Get collections error:', error);
      res.status(500).json({ error: 'Failed to get collections' });
    }
  }

  /**
   * Get a single collection with its items
   */
  static async getOne(req: Request<{ id: string }>, res: Response) {
    try {
      const userId = (req as any).userId;
      const { id } = req.params;

      const collection = db.prepare(`
        SELECT * FROM collections WHERE id = ? AND user_id = ?
      `).get(id, userId) as any;

      if (!collection) {
        return res.status(404).json({ error: 'Collection not found' });
      }

      // Get items in this collection from saved_items (permanent storage)
      const items = db.prepare(`
        SELECT si.*,
               ci.added_at,
               COALESCE(ufi.read, 0) as read,
               COALESCE(ufi.saved, 0) as saved
        FROM saved_items si
        INNER JOIN collection_items ci ON si.id = ci.saved_item_id
        LEFT JOIN user_feed_items ufi ON si.id = ufi.feed_item_id AND ufi.user_id = ?
        WHERE ci.collection_id = ? AND si.user_id = ?
        ORDER BY ci.added_at DESC
      `).all(userId, id, userId) as any[];

      res.json({
        id: collection.id,
        userId: collection.user_id,
        name: collection.name,
        color: collection.color,
        icon: collection.icon,
        createdAt: new Date(collection.created_at),
        updatedAt: new Date(collection.updated_at),
        items: items.map(item => ({
          id: item.id,
          source: {
            name: item.source_name,
            type: item.source_type,
            icon: item.source_icon,
            url: item.source_url,
          },
          title: item.title,
          link: item.link,
          content: item.content,
          excerpt: item.excerpt,
          author: item.author,
          publishedAt: item.published_at ? new Date(item.published_at) : null,
          imageUrl: item.image_url,
          read: Boolean(item.read),
          saved: Boolean(item.saved),
          addedAt: new Date(item.added_at),
        })),
      });
    } catch (error) {
      console.error('Get collection error:', error);
      res.status(500).json({ error: 'Failed to get collection' });
    }
  }

  /**
   * Create a new collection
   */
  static async create(req: Request<{}, {}, CreateCollectionRequest>, res: Response) {
    try {
      const userId = (req as any).userId;
      const { name, color, icon } = req.body;

      if (!name || !color) {
        return res.status(400).json({ error: 'Name and color are required' });
      }

      const collectionId = randomUUID();
      const now = Date.now();

      db.prepare(`
        INSERT INTO collections (id, user_id, name, color, icon, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(collectionId, userId, name, color, icon || null, now, now);

      const collection = db.prepare('SELECT * FROM collections WHERE id = ?').get(collectionId) as any;

      res.status(201).json({
        id: collection.id,
        userId: collection.user_id,
        name: collection.name,
        color: collection.color,
        icon: collection.icon,
        itemCount: 0,
        createdAt: new Date(collection.created_at),
        updatedAt: new Date(collection.updated_at),
      });
    } catch (error) {
      console.error('Create collection error:', error);
      res.status(500).json({ error: 'Failed to create collection' });
    }
  }

  /**
   * Update a collection
   */
  static async update(req: Request<{ id: string }, {}, UpdateCollectionRequest>, res: Response) {
    try {
      const userId = (req as any).userId;
      const { id } = req.params;
      const { name, color, icon } = req.body;

      // Verify ownership
      const collection = db.prepare('SELECT * FROM collections WHERE id = ? AND user_id = ?')
        .get(id, userId);

      if (!collection) {
        return res.status(404).json({ error: 'Collection not found' });
      }

      // Build update query
      const updates: string[] = [];
      const values: any[] = [];

      if (name) {
        updates.push('name = ?');
        values.push(name);
      }
      if (color) {
        updates.push('color = ?');
        values.push(color);
      }
      if (icon !== undefined) {
        updates.push('icon = ?');
        values.push(icon);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No updates provided' });
      }

      updates.push('updated_at = ?');
      values.push(Date.now());
      values.push(id);

      db.prepare(`UPDATE collections SET ${updates.join(', ')} WHERE id = ?`)
        .run(...values);

      const updated = db.prepare('SELECT * FROM collections WHERE id = ?').get(id) as any;
      const count = db.prepare(
        'SELECT COUNT(*) as count FROM collection_items WHERE collection_id = ?'
      ).get(id) as any;

      res.json({
        id: updated.id,
        userId: updated.user_id,
        name: updated.name,
        color: updated.color,
        icon: updated.icon,
        itemCount: count.count,
        createdAt: new Date(updated.created_at),
        updatedAt: new Date(updated.updated_at),
      });
    } catch (error) {
      console.error('Update collection error:', error);
      res.status(500).json({ error: 'Failed to update collection' });
    }
  }

  /**
   * Delete a collection
   */
  static async delete(req: Request<{ id: string }>, res: Response) {
    try {
      const userId = (req as any).userId;
      const { id } = req.params;

      // Verify ownership
      const collection = db.prepare('SELECT * FROM collections WHERE id = ? AND user_id = ?')
        .get(id, userId);

      if (!collection) {
        return res.status(404).json({ error: 'Collection not found' });
      }

      db.prepare('DELETE FROM collections WHERE id = ?').run(id);

      res.json({ message: 'Collection deleted successfully' });
    } catch (error) {
      console.error('Delete collection error:', error);
      res.status(500).json({ error: 'Failed to delete collection' });
    }
  }

  /**
   * Add an item to a collection
   */
  static async addItem(req: Request<{ id: string, itemId: string }>, res: Response) {
    try {
      const userId = (req as any).userId;
      const { id, itemId } = req.params;

      // Verify collection ownership
      const collection = db.prepare('SELECT * FROM collections WHERE id = ? AND user_id = ?')
        .get(id, userId);

      if (!collection) {
        return res.status(404).json({ error: 'Collection not found' });
      }

      // Verify item exists and user has access to it
      const item = db.prepare(`
        SELECT fi.*, s.name as source_name, s.type as source_type, s.icon_url as source_icon, s.url as source_url
        FROM feed_items fi
        INNER JOIN sources s ON fi.source_id = s.id
        WHERE fi.id = ? AND s.user_id = ?
      `).get(itemId, userId) as any;

      if (!item) {
        return res.status(404).json({ error: 'Feed item not found' });
      }

      // Check if this item is already saved (might be in another collection)
      let savedItem = db.prepare('SELECT * FROM saved_items WHERE id = ? AND user_id = ?')
        .get(itemId, userId) as any;

      const now = Date.now();

      // If not already saved, create a saved_item with the full content
      if (!savedItem) {
        db.prepare(`
          INSERT INTO saved_items (
            id, user_id, source_name, source_type, source_icon, source_url,
            title, link, content, excerpt, author, published_at, image_url, added_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          itemId,
          userId,
          item.source_name,
          item.source_type,
          item.source_icon,
          item.source_url,
          item.title,
          item.link,
          item.content,
          item.excerpt,
          item.author,
          item.published_at,
          item.image_url,
          now
        );
      }

      // Check if already in this specific collection
      const existing = db.prepare(
        'SELECT * FROM collection_items WHERE collection_id = ? AND saved_item_id = ?'
      ).get(id, itemId);

      if (existing) {
        return res.status(400).json({ error: 'Item already in collection' });
      }

      // Add to collection (links to saved_item, not feed_item)
      db.prepare(`
        INSERT INTO collection_items (collection_id, saved_item_id, added_at)
        VALUES (?, ?, ?)
      `).run(id, itemId, now);

      res.json({ message: 'Item added to collection successfully' });
    } catch (error) {
      console.error('Add item to collection error:', error);
      res.status(500).json({ error: 'Failed to add item to collection' });
    }
  }

  /**
   * Remove an item from a collection
   */
  static async removeItem(req: Request<{ id: string, itemId: string }>, res: Response) {
    try {
      const userId = (req as any).userId;
      const { id, itemId } = req.params;

      // Verify collection ownership
      const collection = db.prepare('SELECT * FROM collections WHERE id = ? AND user_id = ?')
        .get(id, userId);

      if (!collection) {
        return res.status(404).json({ error: 'Collection not found' });
      }

      db.prepare('DELETE FROM collection_items WHERE collection_id = ? AND saved_item_id = ?')
        .run(id, itemId);

      res.json({ message: 'Item removed from collection successfully' });
    } catch (error) {
      console.error('Remove item from collection error:', error);
      res.status(500).json({ error: 'Failed to remove item from collection' });
    }
  }
}

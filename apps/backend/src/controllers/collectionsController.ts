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
          'SELECT feed_item_id FROM collection_items WHERE collection_id = ?'
        ).all(c.id) as any[];

        return {
          id: c.id,
          userId: c.user_id,
          name: c.name,
          color: c.color,
          icon: c.icon,
          isPublic: Boolean(c.is_public),
          itemIds: items.map(item => item.feed_item_id),
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

      // Get items in this collection
      const items = db.prepare(`
        SELECT fi.*, ci.added_at
        FROM feed_items fi
        INNER JOIN collection_items ci ON fi.id = ci.feed_item_id
        WHERE ci.collection_id = ?
        ORDER BY ci.added_at DESC
      `).all(id) as any[];

      res.json({
        id: collection.id,
        userId: collection.user_id,
        name: collection.name,
        color: collection.color,
        icon: collection.icon,
        isPublic: Boolean(collection.is_public),
        createdAt: new Date(collection.created_at),
        updatedAt: new Date(collection.updated_at),
        items: items.map(item => ({
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
      const { name, color, icon, isPublic } = req.body;

      if (!name || !color) {
        return res.status(400).json({ error: 'Name and color are required' });
      }

      const collectionId = randomUUID();
      const now = Date.now();

      db.prepare(`
        INSERT INTO collections (id, user_id, name, color, icon, is_public, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(collectionId, userId, name, color, icon || null, isPublic ? 1 : 0, now, now);

      const collection = db.prepare('SELECT * FROM collections WHERE id = ?').get(collectionId) as any;

      res.status(201).json({
        id: collection.id,
        userId: collection.user_id,
        name: collection.name,
        color: collection.color,
        icon: collection.icon,
        isPublic: Boolean(collection.is_public),
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
      const { name, color, icon, isPublic } = req.body;

      // Verify ownership
      const collection = db.prepare('SELECT * FROM collections WHERE id = ? AND user_id = ?')
        .get(id, userId) as any;

      if (!collection) {
        return res.status(404).json({ error: 'Collection not found' });
      }

      // Check if making collection private when it has subscribers
      let subscriberCount = 0;
      if (isPublic === false && collection.is_public === 1) {
        const result = db.prepare(`
          SELECT COUNT(DISTINCT source_id) as count
          FROM source_collections
          WHERE collection_id = ?
        `).get(id) as any;
        subscriberCount = result.count;
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
      if (isPublic !== undefined) {
        updates.push('is_public = ?');
        values.push(isPublic ? 1 : 0);
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
        isPublic: Boolean(updated.is_public),
        itemCount: count.count,
        subscriberCount, // Return this to warn frontend
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
        SELECT fi.* FROM feed_items fi
        INNER JOIN sources s ON fi.source_id = s.id
        WHERE fi.id = ? AND s.user_id = ?
      `).get(itemId, userId);

      if (!item) {
        return res.status(404).json({ error: 'Feed item not found' });
      }

      // Check if already in collection
      const existing = db.prepare(
        'SELECT * FROM collection_items WHERE collection_id = ? AND feed_item_id = ?'
      ).get(id, itemId);

      if (existing) {
        return res.status(400).json({ error: 'Item already in collection' });
      }

      // Add to collection
      db.prepare(`
        INSERT INTO collection_items (collection_id, feed_item_id, added_at)
        VALUES (?, ?, ?)
      `).run(id, itemId, Date.now());

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

      db.prepare('DELETE FROM collection_items WHERE collection_id = ? AND feed_item_id = ?')
        .run(id, itemId);

      res.json({ message: 'Item removed from collection successfully' });
    } catch (error) {
      console.error('Remove item from collection error:', error);
      res.status(500).json({ error: 'Failed to remove item from collection' });
    }
  }

  /**
   * Get all public collections (for discovery)
   */
  static async getPublicCollections(req: Request, res: Response) {
    try {
      const { search, userId: filterUserId, limit, offset } = req.query;

      let query = `
        SELECT
          c.*,
          u.username,
          u.display_name as displayName,
          u.avatar_url as avatarUrl,
          COUNT(ci.feed_item_id) as itemCount
        FROM collections c
        INNER JOIN users u ON c.user_id = u.id
        LEFT JOIN collection_items ci ON c.id = ci.collection_id
        WHERE c.is_public = 1
      `;

      const params: any[] = [];

      // Filter by user if specified
      if (filterUserId) {
        query += ` AND c.user_id = ?`;
        params.push(filterUserId);
      }

      // Search by collection name or username
      if (search) {
        query += ` AND (c.name LIKE ? OR u.username LIKE ? OR u.display_name LIKE ?)`;
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern, searchPattern);
      }

      query += ` GROUP BY c.id, u.id ORDER BY c.created_at DESC`;

      // Add pagination
      if (limit) {
        query += ` LIMIT ?`;
        params.push(parseInt(limit as string));
      }
      if (offset) {
        query += ` OFFSET ?`;
        params.push(parseInt(offset as string));
      }

      const collections = db.prepare(query).all(...params) as any[];

      const result = collections.map(c => ({
        id: c.id,
        userId: c.user_id,
        name: c.name,
        color: c.color,
        icon: c.icon,
        isPublic: true,
        itemIds: [], // Don't return full item list for public discovery
        createdAt: new Date(c.created_at),
        updatedAt: new Date(c.updated_at),
        user: {
          id: c.user_id,
          username: c.username,
          displayName: c.displayName,
          avatarUrl: c.avatarUrl,
        },
        itemCount: c.itemCount,
      }));

      res.json(result);
    } catch (error) {
      console.error('Get public collections error:', error);
      res.status(500).json({ error: 'Failed to get public collections' });
    }
  }

  /**
   * Get a single public collection by ID
   */
  static async getPublicCollection(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;

      const collection = db.prepare(`
        SELECT
          c.*,
          u.username,
          u.display_name as displayName,
          u.avatar_url as avatarUrl
        FROM collections c
        INNER JOIN users u ON c.user_id = u.id
        WHERE c.id = ? AND c.is_public = 1
      `).get(id) as any;

      if (!collection) {
        return res.status(404).json({ error: 'Public collection not found' });
      }

      // Get item count
      const count = db.prepare(
        'SELECT COUNT(*) as count FROM collection_items WHERE collection_id = ?'
      ).get(id) as any;

      res.json({
        id: collection.id,
        userId: collection.user_id,
        name: collection.name,
        color: collection.color,
        icon: collection.icon,
        isPublic: true,
        itemIds: [], // Don't return full item list
        createdAt: new Date(collection.created_at),
        updatedAt: new Date(collection.updated_at),
        user: {
          id: collection.user_id,
          username: collection.username,
          displayName: collection.displayName,
          avatarUrl: collection.avatarUrl,
        },
        itemCount: count.count,
      });
    } catch (error) {
      console.error('Get public collection error:', error);
      res.status(500).json({ error: 'Failed to get public collection' });
    }
  }

  /**
   * Get subscriber count for a collection
   */
  static async getSubscriberCount(req: Request<{ id: string }>, res: Response) {
    try {
      const userId = (req as any).userId;
      const { id } = req.params;

      // Verify ownership
      const collection = db.prepare('SELECT * FROM collections WHERE id = ? AND user_id = ?')
        .get(id, userId);

      if (!collection) {
        return res.status(404).json({ error: 'Collection not found' });
      }

      const result = db.prepare(`
        SELECT COUNT(DISTINCT source_id) as count
        FROM source_collections
        WHERE collection_id = ?
      `).get(id) as any;

      res.json({ subscriberCount: result.count });
    } catch (error) {
      console.error('Get subscriber count error:', error);
      res.status(500).json({ error: 'Failed to get subscriber count' });
    }
  }
}

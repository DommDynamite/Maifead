import { Request, Response } from 'express';
import { db } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

interface AuthRequest extends Request {
  userId?: string;
}

/**
 * Get all feads for the authenticated user
 */
export const getFeads = (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get all feads for the user
    const feads = db
      .prepare(
        `SELECT id, name, icon, is_important, created_at, updated_at
         FROM feads
         WHERE user_id = ?
         ORDER BY created_at DESC`
      )
      .all(userId);

    // For each fead, get its source IDs
    const feadsWithSources = feads.map((fead: any) => {
      const sourceIds = db
        .prepare(
          `SELECT source_id FROM fead_sources WHERE fead_id = ?`
        )
        .all(fead.id)
        .map((row: any) => row.source_id);

      return {
        id: fead.id,
        name: fead.name,
        icon: fead.icon,
        isImportant: Boolean(fead.is_important),
        sourceIds,
        createdAt: fead.created_at,
        updatedAt: fead.updated_at,
      };
    });

    res.json(feadsWithSources);
  } catch (error) {
    console.error('Error fetching feads:', error);
    res.status(500).json({ error: 'Failed to fetch feads' });
  }
};

/**
 * Get a single fead by ID
 */
export const getFead = (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get the fead
    const fead = db
      .prepare(
        `SELECT id, name, icon, is_important, created_at, updated_at
         FROM feads
         WHERE id = ? AND user_id = ?`
      )
      .get(id, userId) as any;

    if (!fead) {
      return res.status(404).json({ error: 'Fead not found' });
    }

    // Get source IDs
    const sourceIds = db
      .prepare(`SELECT source_id FROM fead_sources WHERE fead_id = ?`)
      .all(id)
      .map((row: any) => row.source_id);

    res.json({
      id: fead.id,
      name: fead.name,
      icon: fead.icon,
      isImportant: Boolean(fead.is_important),
      sourceIds,
      createdAt: fead.created_at,
      updatedAt: fead.updated_at,
    });
  } catch (error) {
    console.error('Error fetching fead:', error);
    res.status(500).json({ error: 'Failed to fetch fead' });
  }
};

/**
 * Create a new fead
 */
export const createFead = (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { name, icon, sourceIds, isImportant } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!name || !icon) {
      return res.status(400).json({ error: 'Name and icon are required' });
    }

    const feadId = uuidv4();
    const now = Date.now();
    const important = isImportant ? 1 : 0;

    // Insert fead
    db.prepare(
      `INSERT INTO feads (id, user_id, name, icon, is_important, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(feadId, userId, name, icon, important, now, now);

    // Insert source associations
    if (sourceIds && Array.isArray(sourceIds) && sourceIds.length > 0) {
      const insertSource = db.prepare(
        `INSERT INTO fead_sources (fead_id, source_id) VALUES (?, ?)`
      );

      for (const sourceId of sourceIds) {
        insertSource.run(feadId, sourceId);
      }
    }

    res.status(201).json({
      id: feadId,
      name,
      icon,
      isImportant: Boolean(important),
      sourceIds: sourceIds || [],
      createdAt: now,
      updatedAt: now,
    });
  } catch (error) {
    console.error('Error creating fead:', error);
    res.status(500).json({ error: 'Failed to create fead' });
  }
};

/**
 * Update a fead
 */
export const updateFead = (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { name, icon, sourceIds, isImportant } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if fead exists and belongs to user
    const existing = db
      .prepare(`SELECT id FROM feads WHERE id = ? AND user_id = ?`)
      .get(id, userId);

    if (!existing) {
      return res.status(404).json({ error: 'Fead not found' });
    }

    const now = Date.now();
    const updates: string[] = [];
    const values: any[] = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }

    if (icon !== undefined) {
      updates.push('icon = ?');
      values.push(icon);
    }

    if (isImportant !== undefined) {
      updates.push('is_important = ?');
      values.push(isImportant ? 1 : 0);
    }

    updates.push('updated_at = ?');
    values.push(now);

    // Update fead
    if (updates.length > 0) {
      values.push(id, userId);
      db.prepare(
        `UPDATE feads SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`
      ).run(...values);
    }

    // Update source associations if provided
    if (sourceIds && Array.isArray(sourceIds)) {
      // Delete existing associations
      db.prepare(`DELETE FROM fead_sources WHERE fead_id = ?`).run(id);

      // Insert new associations
      if (sourceIds.length > 0) {
        const insertSource = db.prepare(
          `INSERT INTO fead_sources (fead_id, source_id) VALUES (?, ?)`
        );

        for (const sourceId of sourceIds) {
          insertSource.run(id, sourceId);
        }
      }
    }

    // Fetch updated fead
    const updated = db
      .prepare(
        `SELECT id, name, icon, is_important, created_at, updated_at
         FROM feads
         WHERE id = ? AND user_id = ?`
      )
      .get(id, userId) as any;

    const updatedSourceIds = db
      .prepare(`SELECT source_id FROM fead_sources WHERE fead_id = ?`)
      .all(id)
      .map((row: any) => row.source_id);

    res.json({
      id: updated.id,
      name: updated.name,
      icon: updated.icon,
      isImportant: Boolean(updated.is_important),
      sourceIds: updatedSourceIds,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
    });
  } catch (error) {
    console.error('Error updating fead:', error);
    res.status(500).json({ error: 'Failed to update fead' });
  }
};

/**
 * Delete a fead
 */
export const deleteFead = (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if fead exists and belongs to user
    const existing = db
      .prepare(`SELECT id FROM feads WHERE id = ? AND user_id = ?`)
      .get(id, userId);

    if (!existing) {
      return res.status(404).json({ error: 'Fead not found' });
    }

    // Delete fead (cascade will handle fead_sources)
    db.prepare(`DELETE FROM feads WHERE id = ? AND user_id = ?`).run(id, userId);

    res.json({ message: 'Fead deleted successfully' });
  } catch (error) {
    console.error('Error deleting fead:', error);
    res.status(500).json({ error: 'Failed to delete fead' });
  }
};

/**
 * Mark all items in a Fead as read
 */
export const markFeadAsRead = (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if fead exists and belongs to user
    const fead = db
      .prepare(`SELECT id FROM feads WHERE id = ? AND user_id = ?`)
      .get(id, userId);

    if (!fead) {
      return res.status(404).json({ error: 'Fead not found' });
    }

    // Get all source IDs for this fead
    const sourceIds = db
      .prepare(`SELECT source_id FROM fead_sources WHERE fead_id = ?`)
      .all(id)
      .map((row: any) => row.source_id);

    if (sourceIds.length === 0) {
      return res.json({ message: 'No sources in this fead', itemsMarked: 0 });
    }

    // Get all feed item IDs from these sources
    const placeholders = sourceIds.map(() => '?').join(',');
    const feedItemIds = db
      .prepare(
        `SELECT id FROM feed_items WHERE source_id IN (${placeholders})`
      )
      .all(...sourceIds)
      .map((row: any) => row.id);

    if (feedItemIds.length === 0) {
      return res.json({ message: 'No items to mark as read', itemsMarked: 0 });
    }

    const now = Date.now();
    let itemsMarked = 0;

    // Mark items as read in user_feed_items table
    const upsertStmt = db.prepare(`
      INSERT INTO user_feed_items (user_id, feed_item_id, read, saved, updated_at)
      VALUES (?, ?, 1, 0, ?)
      ON CONFLICT(user_id, feed_item_id) DO UPDATE SET read = 1, updated_at = ?
    `);

    for (const itemId of feedItemIds) {
      upsertStmt.run(userId, itemId, now, now);
      itemsMarked++;
    }

    res.json({
      message: `Marked ${itemsMarked} items as read`,
      itemsMarked
    });
  } catch (error) {
    console.error('Error marking fead as read:', error);
    res.status(500).json({ error: 'Failed to mark fead as read' });
  }
};

import { db } from '../config/database.js';
import cron from 'node-cron';

/**
 * CleanupService handles automatic deletion of old feed items
 * based on per-source retention policies
 */
export class CleanupService {
  /**
   * Delete old items based on source retention policies
   * Preserves items that are:
   * - In any collection (collection_items junction table)
   * - From sources with retention_days = 0 (keep forever)
   */
  static cleanupOldItems(): number {
    console.log('[CleanupService] Running cleanup job for old feed items...');

    const now = Date.now();

    try {
      // Delete items that are:
      // 1. Older than their source's retention_days
      // 2. NOT in any collection
      // 3. From sources where retention_days > 0
      const result = db.prepare(`
        DELETE FROM feed_items
        WHERE id IN (
          SELECT fi.id
          FROM feed_items fi
          INNER JOIN sources s ON fi.source_id = s.id
          LEFT JOIN collection_items ci ON fi.id = ci.feed_item_id
          WHERE s.retention_days > 0
            AND ci.feed_item_id IS NULL
            AND fi.published_at IS NOT NULL
            AND (? - fi.published_at) > (s.retention_days * 86400000)
        )
      `).run(now);

      const deletedCount = result.changes;
      console.log(`[CleanupService] Cleanup completed: ${deletedCount} items deleted`);
      return deletedCount;
    } catch (error) {
      console.error('[CleanupService] Error during cleanup:', error);
      return 0;
    }
  }

  /**
   * Schedule cleanup to run nightly at 2 AM
   */
  static scheduleCleanup() {
    // Run at 2 AM every day (cron format: minute hour day month weekday)
    cron.schedule('0 2 * * *', () => {
      try {
        CleanupService.cleanupOldItems();
      } catch (error) {
        console.error('[CleanupService] Error in scheduled cleanup job:', error);
      }
    });

    console.log('[CleanupService] Scheduled: Daily cleanup at 2:00 AM');

    // Optional: Run cleanup once on startup (useful for testing)
    // Uncomment the line below if you want immediate cleanup on server start
    // setTimeout(() => CleanupService.cleanupOldItems(), 5000);
  }
}

/**
 * Migration: Convert collection_items to use saved_items table
 *
 * This migration:
 * 1. Creates the new saved_items table
 * 2. Migrates existing collection_items data to saved_items
 * 3. Updates collection_items to reference saved_items instead of feed_items
 * 4. Preserves all existing collection data
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../../data/maifead.db');
const db = new Database(dbPath);

console.log('Starting migration to saved_items table...');
console.log('Database path:', dbPath);

// Enable foreign keys
db.pragma('foreign_keys = OFF'); // Disable temporarily for migration

try {
  // Start transaction
  db.exec('BEGIN TRANSACTION');

  // Step 1: Create saved_items table
  console.log('Step 1: Creating saved_items table...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS saved_items (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      source_name TEXT NOT NULL,
      source_type TEXT NOT NULL,
      source_icon TEXT,
      source_url TEXT,
      title TEXT NOT NULL,
      link TEXT NOT NULL,
      content TEXT,
      excerpt TEXT,
      author TEXT,
      published_at INTEGER,
      image_url TEXT,
      added_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Step 2: Migrate data from feed_items to saved_items for all collection items
  console.log('Step 2: Migrating collection items to saved_items...');

  const migrationQuery = `
    INSERT OR IGNORE INTO saved_items (
      id, user_id, source_name, source_type, source_icon, source_url,
      title, link, content, excerpt, author, published_at, image_url, added_at
    )
    SELECT
      fi.id,
      c.user_id,
      s.name as source_name,
      s.type as source_type,
      s.icon_url as source_icon,
      s.url as source_url,
      fi.title,
      fi.link,
      fi.content,
      fi.excerpt,
      fi.author,
      fi.published_at,
      fi.image_url,
      ci.added_at
    FROM collection_items ci
    INNER JOIN feed_items fi ON ci.feed_item_id = fi.id
    INNER JOIN sources s ON fi.source_id = s.id
    INNER JOIN collections c ON ci.collection_id = c.id
  `;

  const result = db.prepare(migrationQuery).run();
  console.log(`  Migrated ${result.changes} items to saved_items table`);

  // Step 3: Create new collection_items table with saved_item_id
  console.log('Step 3: Creating new collection_items table...');

  // Rename old table
  db.exec('ALTER TABLE collection_items RENAME TO collection_items_old');

  // Create new table
  db.exec(`
    CREATE TABLE collection_items (
      collection_id TEXT NOT NULL,
      saved_item_id TEXT NOT NULL,
      added_at INTEGER NOT NULL,
      PRIMARY KEY (collection_id, saved_item_id),
      FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
      FOREIGN KEY (saved_item_id) REFERENCES saved_items(id) ON DELETE CASCADE
    )
  `);

  // Step 4: Migrate data to new collection_items table
  console.log('Step 4: Migrating collection_items references...');

  const migrateReferences = `
    INSERT INTO collection_items (collection_id, saved_item_id, added_at)
    SELECT collection_id, feed_item_id, added_at
    FROM collection_items_old
    WHERE feed_item_id IN (SELECT id FROM saved_items)
  `;

  const refResult = db.prepare(migrateReferences).run();
  console.log(`  Migrated ${refResult.changes} collection item references`);

  // Step 5: Drop old table
  console.log('Step 5: Cleaning up old table...');
  db.exec('DROP TABLE collection_items_old');

  // Step 6: Create indexes
  console.log('Step 6: Creating indexes...');
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_saved_items_user_id ON saved_items(user_id);
    CREATE INDEX IF NOT EXISTS idx_saved_items_added_at ON saved_items(added_at DESC);
    CREATE INDEX IF NOT EXISTS idx_collection_items_saved_item_id ON collection_items(saved_item_id);
  `);

  // Commit transaction
  db.exec('COMMIT');

  console.log('Migration completed successfully!');

  // Show statistics
  const stats = db.prepare('SELECT COUNT(*) as count FROM saved_items').get() as any;
  const collectionCount = db.prepare('SELECT COUNT(*) as count FROM collection_items').get() as any;

  console.log('\nMigration Statistics:');
  console.log(`  Saved items: ${stats.count}`);
  console.log(`  Collection associations: ${collectionCount.count}`);

} catch (error) {
  // Rollback on error
  db.exec('ROLLBACK');
  console.error('Migration failed:', error);
  process.exit(1);
} finally {
  // Re-enable foreign keys
  db.pragma('foreign_keys = ON');
  db.close();
}

console.log('\nMigration complete. You can now restart your backend server.');

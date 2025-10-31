// Database configuration - supports both SQLite and PostgreSQL
// Set USE_POSTGRES=true in .env to use PostgreSQL instead of SQLite
import Database from 'better-sqlite3';
import type BetterSqlite3 from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../data/maifead.db');

// Ensure the database directory exists
const dbDir = dirname(dbPath);
mkdirSync(dbDir, { recursive: true });

export const db: BetterSqlite3.Database = new Database(dbPath, { verbose: console.log });

// Enable foreign keys
db.pragma('foreign_keys = ON');

export const initializeDatabase = () => {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      username TEXT UNIQUE NOT NULL,
      display_name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      avatar_url TEXT,
      role TEXT DEFAULT 'user',
      status TEXT DEFAULT 'pending',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `);

  // User preferences table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_preferences (
      user_id TEXT PRIMARY KEY,
      theme_mode TEXT DEFAULT 'dark',
      theme_preset TEXT DEFAULT 'teal',
      view_mode TEXT DEFAULT 'detailed',
      feed_layout TEXT DEFAULT 'single',
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Sources table (RSS feed sources, YouTube channels, Reddit feeds)
  db.exec(`
    CREATE TABLE IF NOT EXISTS sources (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      type TEXT DEFAULT 'rss',
      channel_id TEXT,
      icon_url TEXT,
      description TEXT,
      category TEXT,
      fetch_interval INTEGER DEFAULT 900000,
      last_fetched_at INTEGER,
      whitelist_keywords TEXT,
      blacklist_keywords TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Add keyword columns to existing sources table if they don't exist
  try {
    db.exec(`ALTER TABLE sources ADD COLUMN whitelist_keywords TEXT`);
  } catch (error) {
    // Column already exists, ignore error
  }

  try {
    db.exec(`ALTER TABLE sources ADD COLUMN blacklist_keywords TEXT`);
  } catch (error) {
    // Column already exists, ignore error
  }

  // Add YouTube/source type columns to existing sources table if they don't exist
  try {
    db.exec(`ALTER TABLE sources ADD COLUMN type TEXT DEFAULT 'rss'`);
  } catch (error) {
    // Column already exists, ignore error
  }

  try {
    db.exec(`ALTER TABLE sources ADD COLUMN channel_id TEXT`);
  } catch (error) {
    // Column already exists, ignore error
  }

  // Add YouTube shorts filter column
  try {
    db.exec(`ALTER TABLE sources ADD COLUMN youtube_shorts_filter TEXT DEFAULT 'all'`);
  } catch (error) {
    // Column already exists, ignore error
  }

  // Add Reddit-specific columns
  try {
    db.exec(`ALTER TABLE sources ADD COLUMN subreddit TEXT`);
  } catch (error) {
    // Column already exists, ignore error
  }

  try {
    db.exec(`ALTER TABLE sources ADD COLUMN reddit_username TEXT`);
  } catch (error) {
    // Column already exists, ignore error
  }

  try {
    db.exec(`ALTER TABLE sources ADD COLUMN reddit_source_type TEXT`);
  } catch (error) {
    // Column already exists, ignore error
  }

  // Add Bluesky-specific columns
  try {
    db.exec(`ALTER TABLE sources ADD COLUMN bluesky_handle TEXT`);
  } catch (error) {
    // Column already exists, ignore error
  }

  try {
    db.exec(`ALTER TABLE sources ADD COLUMN bluesky_did TEXT`);
  } catch (error) {
    // Column already exists, ignore error
  }

  try {
    db.exec(`ALTER TABLE sources ADD COLUMN bluesky_feed_uri TEXT`);
  } catch (error) {
    // Column already exists, ignore error
  }

  // Add Reddit minimum upvotes filter
  try {
    db.exec(`ALTER TABLE sources ADD COLUMN reddit_min_upvotes INTEGER`);
  } catch (error) {
    // Column already exists, ignore error
  }

  // Add retention days for automatic cleanup
  try {
    db.exec(`ALTER TABLE sources ADD COLUMN retention_days INTEGER DEFAULT 30`);
  } catch (error) {
    // Column already exists, ignore error
  }

  // Add suppress from main feed option
  try {
    db.exec(`ALTER TABLE sources ADD COLUMN suppress_from_main_feed BOOLEAN DEFAULT 0`);
  } catch (error) {
    // Column already exists, ignore error
  }

  // Add user role and status columns for admin management
  try {
    db.exec(`ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'`);
  } catch (error) {
    // Column already exists, ignore error
  }

  try {
    db.exec(`ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active'`);
  } catch (error) {
    // Column already exists, ignore error
  }

  // Invite codes table for pre-approved signups
  db.exec(`
    CREATE TABLE IF NOT EXISTS invite_codes (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      created_by TEXT NOT NULL,
      used_by TEXT,
      created_at INTEGER NOT NULL,
      used_at INTEGER,
      expires_at INTEGER,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (used_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // Feed items table
  db.exec(`
    CREATE TABLE IF NOT EXISTS feed_items (
      id TEXT PRIMARY KEY,
      source_id TEXT NOT NULL,
      title TEXT NOT NULL,
      link TEXT NOT NULL,
      content TEXT,
      excerpt TEXT,
      author TEXT,
      published_at INTEGER,
      image_url TEXT,
      read BOOLEAN DEFAULT 0,
      saved BOOLEAN DEFAULT 0,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE
    )
  `);

  // Collections table
  db.exec(`
    CREATE TABLE IF NOT EXISTS collections (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      icon TEXT,
      is_public BOOLEAN DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Add is_public column to existing collections table if it doesn't exist
  try {
    db.exec(`ALTER TABLE collections ADD COLUMN is_public BOOLEAN DEFAULT 0`);
  } catch (error) {
    // Column already exists, ignore error
  }

  // Collection items junction table
  db.exec(`
    CREATE TABLE IF NOT EXISTS collection_items (
      collection_id TEXT NOT NULL,
      feed_item_id TEXT NOT NULL,
      added_at INTEGER NOT NULL,
      PRIMARY KEY (collection_id, feed_item_id),
      FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
      FOREIGN KEY (feed_item_id) REFERENCES feed_items(id) ON DELETE CASCADE
    )
  `);

  // Feads table (custom feed presets)
  db.exec(`
    CREATE TABLE IF NOT EXISTS feads (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Add important flag to existing feads table if it doesn't exist
  try {
    db.exec(`ALTER TABLE feads ADD COLUMN is_important BOOLEAN DEFAULT 0`);
  } catch (error) {
    // Column already exists, ignore error
  }

  // Fead sources junction table
  db.exec(`
    CREATE TABLE IF NOT EXISTS fead_sources (
      fead_id TEXT NOT NULL,
      source_id TEXT NOT NULL,
      PRIMARY KEY (fead_id, source_id),
      FOREIGN KEY (fead_id) REFERENCES feads(id) ON DELETE CASCADE,
      FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE
    )
  `);

  // Source collections junction table (for collection feads)
  db.exec(`
    CREATE TABLE IF NOT EXISTS source_collections (
      source_id TEXT NOT NULL,
      collection_id TEXT NOT NULL,
      PRIMARY KEY (source_id, collection_id),
      FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE,
      FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE
    )
  `);

  // User-specific read/saved status for feed items
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_feed_items (
      user_id TEXT NOT NULL,
      feed_item_id TEXT NOT NULL,
      read BOOLEAN DEFAULT 0,
      saved BOOLEAN DEFAULT 0,
      updated_at INTEGER NOT NULL,
      PRIMARY KEY (user_id, feed_item_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (feed_item_id) REFERENCES feed_items(id) ON DELETE CASCADE
    )
  `);

  // Create indexes for performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_feed_items_source_id ON feed_items(source_id);
    CREATE INDEX IF NOT EXISTS idx_feed_items_published_at ON feed_items(published_at DESC);
    CREATE INDEX IF NOT EXISTS idx_feed_items_read ON feed_items(read);
    CREATE INDEX IF NOT EXISTS idx_feed_items_saved ON feed_items(saved);
    CREATE INDEX IF NOT EXISTS idx_sources_user_id ON sources(user_id);
    CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
    CREATE INDEX IF NOT EXISTS idx_collections_is_public ON collections(is_public);
    CREATE INDEX IF NOT EXISTS idx_collections_user_public ON collections(user_id, is_public);
    CREATE INDEX IF NOT EXISTS idx_collection_items_feed_item_id ON collection_items(feed_item_id);
    CREATE INDEX IF NOT EXISTS idx_feads_user_id ON feads(user_id);
    CREATE INDEX IF NOT EXISTS idx_fead_sources_source_id ON fead_sources(source_id);
    CREATE INDEX IF NOT EXISTS idx_source_collections_collection_id ON source_collections(collection_id);
    CREATE INDEX IF NOT EXISTS idx_user_feed_items_user_id ON user_feed_items(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_feed_items_feed_item_id ON user_feed_items(feed_item_id);
  `);

  console.log('Database initialized successfully');
};

export default db;

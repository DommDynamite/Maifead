import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../data/maifead.db');

export const db = new Database(dbPath, { verbose: console.log });

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
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

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

  // Create indexes for performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_feed_items_source_id ON feed_items(source_id);
    CREATE INDEX IF NOT EXISTS idx_feed_items_published_at ON feed_items(published_at DESC);
    CREATE INDEX IF NOT EXISTS idx_feed_items_read ON feed_items(read);
    CREATE INDEX IF NOT EXISTS idx_feed_items_saved ON feed_items(saved);
    CREATE INDEX IF NOT EXISTS idx_sources_user_id ON sources(user_id);
    CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
    CREATE INDEX IF NOT EXISTS idx_collection_items_feed_item_id ON collection_items(feed_item_id);
  `);

  console.log('Database initialized successfully');
};

export default db;

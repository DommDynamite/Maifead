import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, './data/maifead.db');
const db = new Database(dbPath);

console.log('Starting database migration...');
console.log('Database path:', dbPath);

try {
  // Check if role and status columns already exist
  const columns = db.prepare("PRAGMA table_info(users)").all();
  const hasRole = columns.some(col => col.name === 'role');
  const hasStatus = columns.some(col => col.name === 'status');

  if (!hasRole) {
    console.log('Adding role column to users table...');
    db.exec("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'");
    console.log('✓ Role column added');
  } else {
    console.log('✓ Role column already exists');
  }

  if (!hasStatus) {
    console.log('Adding status column to users table...');
    db.exec("ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active'");
    console.log('✓ Status column added');
  } else {
    console.log('✓ Status column already exists');
  }

  // Set test@maifead.com as admin
  console.log('Setting test@maifead.com as admin...');
  const result = db.prepare(`
    UPDATE users
    SET role = 'admin', status = 'active'
    WHERE email = 'test@maifead.com'
  `).run();

  if (result.changes > 0) {
    console.log('✓ test@maifead.com is now an admin');
  } else {
    console.log('⚠ test@maifead.com user not found in database');
  }

  // Create invite_codes table if it doesn't exist
  console.log('Creating invite_codes table if needed...');
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
  console.log('✓ Invite codes table ready');

  console.log('\n✅ Migration completed successfully!');
  console.log('You can now log in with test@maifead.com and access the admin panel.');

} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
} finally {
  db.close();
}

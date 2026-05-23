# Migration: Collections to Saved Items

## What This Migration Does

This migration fixes the issue where collection items disappear after their source's retention period expires (default 30 days).

### Problem
- Previously, `collection_items` referenced `feed_items` directly
- When `feed_items` are deleted by the retention cleanup policy, collection items disappear
- The collection count stayed correct, but the actual content was gone

### Solution
- Creates a new `saved_items` table that stores permanent copies of feed item content
- When you add an item to a collection, its full content is copied to `saved_items`
- Collections now reference `saved_items` instead of `feed_items`
- Items in collections are preserved forever, regardless of retention settings

## Running the Migration

**IMPORTANT:** Stop your backend server before running the migration!

### Step 1: Stop the Backend Server

Kill all running backend processes. You can use Task Manager on Windows or run:
```bash
# Find the process using port 3001
netstat -ano | findstr :3001

# Kill it (replace PID with the actual process ID)
taskkill /PID <PID> /F
```

### Step 2: Backup Your Database (Recommended)

Before running the migration, back up your database:

```bash
# Navigate to the backend data directory
cd apps/backend/data

# Copy the database file
copy maifead.db maifead.db.backup
```

### Step 3: Run the Migration

```bash
# Navigate to the backend directory
cd apps/backend

# Run the migration script
pnpm db:migrate:saved-items
```

### Step 4: Verify the Migration

The migration will output statistics showing:
- How many items were migrated to `saved_items`
- How many collection associations were updated

Example output:
```
Starting migration to saved_items table...
Step 1: Creating saved_items table...
Step 2: Migrating collection items to saved_items...
  Migrated 42 items to saved_items table
Step 3: Creating new collection_items table...
Step 4: Migrating collection_items references...
  Migrated 42 collection item references
Step 5: Cleaning up old table...
Step 6: Creating indexes...
Migration completed successfully!

Migration Statistics:
  Saved items: 42
  Collection associations: 42
```

### Step 5: Restart the Backend Server

```bash
pnpm dev
```

## What Gets Migrated

The migration:
1. ✅ Copies all content from `feed_items` for items that are in collections
2. ✅ Preserves source information (name, type, icon, URL)
3. ✅ Maintains the original `added_at` timestamp
4. ✅ Updates all collection references
5. ✅ Creates proper indexes for performance

## Rollback

If something goes wrong, you can restore from your backup:

```bash
cd apps/backend/data
del maifead.db
copy maifead.db.backup maifead.db
```

Then restart the server with the old code (checkout the commit before the migration).

## After Migration

Once the migration completes successfully:
- Collection items will display correctly even after feed retention cleanup
- Items saved to collections are permanently stored
- The backend will use the new `saved_items` table for all future collection additions

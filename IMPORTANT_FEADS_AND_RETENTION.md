# Important Feads & Item Retention - Implementation Plan

## Overview
Two related features that improve RSS management:

1. **Important Feads**: Mark Feads as important to get notifications for unread items
2. **Item Retention**: Automatic cleanup of old items with per-source retention policies

## Current Status
✅ Database schema partially updated (committed: db36a2e)
- Added `is_important` and `important_collection_id` to sources table (INCORRECT - need to revert)
- Added fields to FeedSource TypeScript interface (INCORRECT - need to update)

⚠️ **Need to fix**: We added fields to the wrong table (sources instead of feads)

## Feature 1: Important Feads (Notification System)

### Concept
Users mark a Fead (custom feed preset) as "important". The app shows a notification badge with the count of unread items from all important Feads.

### Database Changes

**Feads table:**
```sql
ALTER TABLE feads ADD COLUMN is_important BOOLEAN DEFAULT 0;
```

**Index for performance:**
```sql
CREATE INDEX IF NOT EXISTS idx_feads_is_important ON feads(is_important);
```

### Backend Changes

#### 1. Update Feads Types (`packages/types/src/fead.ts` or wherever Fead type is defined)
```typescript
export interface Fead {
  id: string;
  userId: string;
  name: string;
  icon: string;
  isImportant?: boolean; // NEW
  createdAt: Date;
  updatedAt: Date;
}
```

#### 2. Update Feads Controller (`apps/backend/src/controllers/feadsController.ts`)
- Add `is_important` to all response mappings
- Allow setting/updating `isImportant` in create/update endpoints
- Add endpoint to get important Fead stats:
  ```typescript
  GET /api/feads/important/stats
  // Returns: { unreadCount: number, feads: Array<{ id, name, unreadCount }> }
  ```

#### 3. Create query for important Fead unread count
```sql
-- Get total unread count from all important Feads
SELECT COUNT(DISTINCT fi.id) as unread_count
FROM feed_items fi
INNER JOIN fead_sources fs ON fi.source_id = fs.source_id
INNER JOIN feads f ON fs.fead_id = f.id
LEFT JOIN user_feed_items ufi ON fi.id = ufi.feed_item_id AND ufi.user_id = ?
WHERE f.user_id = ?
  AND f.is_important = 1
  AND (ufi.read IS NULL OR ufi.read = 0);
```

### Frontend Changes

#### 1. Update Fead Management UI
**AddFeadModal / EditFeadModal:**
- Add toggle switch: "Mark as Important"
- Place below name/icon fields
- Description: "Get notifications for unread items from this Fead"
- Visual indicator: Star icon or warning color

#### 2. Navigation Badge
**IconRail / BottomNav:**
- Add notification badge to Feads navigation button
- Show count of unread items from important Feads
- Badge design: Small orange/yellow circle with number
- Only show when count > 0

#### 3. Feads List Styling
**FeadsPage:**
```typescript
const FeadCard = styled.div<{ $isImportant?: boolean }>`
  ${props => props.$isImportant && `
    border: 2px solid ${props.theme.colors.warning || '#F59E0B'};
    box-shadow: 0 0 0 1px ${props.theme.colors.warning}40;
  `}
`;
```

Add badge:
```tsx
{fead.isImportant && (
  <ImportantBadge>
    <Star size={12} fill="currentColor" />
    Important
  </ImportantBadge>
)}
```

#### 4. Important Items View (Optional Enhancement)
Add filter option to show only unread items from important Feads:
- Button/toggle in feed view
- Query param: `?important=true`
- Backend endpoint: `GET /api/feed-items?important=true`

---

## Feature 2: Item Retention & Cleanup

### Concept
Each source can specify how many days to keep items (default: 30, 0 = forever). A nightly cleanup job deletes old items, but preserves items that are saved in collections.

### Database Changes

**Sources table:**
```sql
ALTER TABLE sources ADD COLUMN retention_days INTEGER DEFAULT 30;
```

Notes:
- `retention_days = 0` means keep forever
- `retention_days > 0` means delete items older than N days
- Items in collections are NEVER deleted (preserved)

### Backend Changes

#### 1. Update Source Types
**FeedSource interface:**
```typescript
export interface FeedSource {
  // ... existing fields ...
  retentionDays?: number; // Days to keep items (0 = forever, default: 30)
}
```

#### 2. Update Sources Controller
- Add `retention_days` to create/update endpoints
- Add to all response mappings
- Validation: Must be >= 0

#### 3. Create Cleanup Service (`apps/backend/src/services/cleanupService.ts`)

```typescript
import { db } from '../config/database.js';
import cron from 'node-cron';

export class CleanupService {
  /**
   * Delete old items based on source retention policies
   * Preserves items that are:
   * - In any collection (collection_items junction table)
   * - From sources with retention_days = 0 (keep forever)
   */
  static cleanupOldItems() {
    console.log('Running cleanup job for old feed items...');

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
          AND fi.published_at < ?
          AND (? - fi.published_at) > (s.retention_days * 86400000)
      )
    `).run(Date.now(), Date.now());

    console.log(`Cleanup completed: ${result.changes} items deleted`);
    return result.changes;
  }

  /**
   * Schedule cleanup to run nightly at 2 AM
   */
  static scheduleCleanup() {
    // Run at 2 AM every day
    cron.schedule('0 2 * * *', () => {
      try {
        CleanupService.cleanupOldItems();
      } catch (error) {
        console.error('Error in cleanup job:', error);
      }
    });

    console.log('Cleanup job scheduled: Daily at 2:00 AM');
  }
}
```

#### 4. Initialize Cleanup Job in index.ts
```typescript
import { CleanupService } from './services/cleanupService.js';

// ... after server starts ...
CleanupService.scheduleCleanup();
```

### Frontend Changes

#### 1. Source Management UI
**AddFeedModal / EditFeedModal:**
- Add input field: "Keep items for (days)"
- Default value: 30
- Help text: "Set to 0 to keep items forever. Items saved in collections are never deleted."
- Validation: Must be >= 0

Example UI:
```tsx
<FormField>
  <Label>Item Retention</Label>
  <Input
    type="number"
    min="0"
    value={retentionDays}
    onChange={(e) => setRetentionDays(Number(e.target.value))}
  />
  <HelpText>
    Days to keep items (0 = forever). Items in collections are never deleted.
  </HelpText>
</FormField>
```

#### 2. Sources List Display (Optional)
Show retention policy on source cards:
```tsx
<RetentionInfo>
  {source.retentionDays === 0 ? (
    <>♾️ Keeps all items</>
  ) : (
    <>🗑️ Keeps {source.retentionDays} days</>
  )}
</RetentionInfo>
```

---

## Feature 3: Delete/Archive Items (User Manual Control)

### Concept
Users can manually delete items from their feed or mark them as "archived" (hide from feed but don't delete).

### Implementation Options

**Option A: Simple Delete**
- Add "Delete" action to item cards/modal
- Permanently removes item from database
- Simpler, no additional tables needed

**Option B: Archive (Soft Delete)**
- Add `archived` field to `user_feed_items` table
- Archived items hidden from feed but not deleted
- Can view archived items in separate view
- More complex but safer

**Recommendation:** Start with Option A (Simple Delete) for MVP.

### Database Changes (Option A - Simple Delete)

No schema changes needed! Just add DELETE endpoint.

### Backend Changes

#### 1. Add Delete Endpoint (`apps/backend/src/controllers/feedItemsController.ts`)

```typescript
/**
 * Delete a feed item (for the authenticated user)
 */
static async deleteItem(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    // Check if item is in any collections
    const inCollection = db.prepare(`
      SELECT ci.collection_id
      FROM collection_items ci
      INNER JOIN collections c ON ci.collection_id = c.id
      WHERE ci.feed_item_id = ? AND c.user_id = ?
      LIMIT 1
    `).get(id, userId);

    if (inCollection) {
      return res.status(400).json({
        error: 'Cannot delete items that are in collections. Remove from collections first.'
      });
    }

    // Delete the item
    db.prepare('DELETE FROM feed_items WHERE id = ?').run(id);

    res.json({ success: true });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
}
```

#### 2. Add Route
```typescript
router.delete('/:id', authenticate, FeedItemsController.deleteItem);
```

### Frontend Changes

#### 1. Add Delete Action to Card
**Card component:**
```tsx
{
  icon: Trash2,
  label: 'Delete',
  onClick: async () => {
    if (confirm('Delete this item? This cannot be undone.')) {
      await deleteItem(item.id);
      onDelete?.(item.id); // Callback to remove from UI
    }
  },
  destructive: true
}
```

#### 2. Add Delete to Content Modal
Same as card - add delete button with confirmation.

#### 3. Update Feed Store
```typescript
async deleteItem(id: string) {
  await api.delete(`/feed-items/${id}`);
  // Remove from local state
  set(state => ({
    items: state.items.filter(item => item.id !== id)
  }));
}
```

---

## Testing Checklist

### Important Feads
- [ ] Create Fead and mark as important
- [ ] Notification badge shows correct unread count
- [ ] Multiple important Feads - count aggregates correctly
- [ ] Mark items as read - notification count decreases
- [ ] Toggle important off - notification count updates
- [ ] Visual styling shows important Feads correctly

### Item Retention
- [ ] Create source with retention_days = 7
- [ ] Wait 8 days (or manually run cleanup) - old items deleted
- [ ] Items in collections are preserved
- [ ] Source with retention_days = 0 - items never deleted
- [ ] Update retention_days - new policy applies
- [ ] Cleanup job runs nightly without errors

### Delete Items
- [ ] Delete item from feed - removed from UI
- [ ] Cannot delete item that's in a collection
- [ ] Delete confirmation works
- [ ] Deleted items don't reappear on refresh

---

## Migration Notes

**We need to remove/revert the incorrect schema changes from commit db36a2e:**

The following were added to the WRONG table and need to be removed:
```sql
-- DON'T use these (they're on sources table, should be on feads table)
-- is_important on sources
-- important_collection_id on sources
```

We don't need to explicitly drop these columns (SQLite doesn't support DROP COLUMN easily), but we should:
1. Not use them in the code
2. Document that they're deprecated
3. OR create a migration script to rebuild the sources table without them

For now, safest approach: **Just ignore them and don't use them in the code.**

---

## Next Steps

1. Remove incorrect fields from TypeScript types (FeedSource)
2. Add correct field to Fead type
3. Implement retention_days on sources
4. Create CleanupService and schedule job
5. Update Fead controller for is_important
6. Add UI for retention days in source management
7. Add UI for important toggle in Fead management
8. Add notification badge to navigation
9. Add delete functionality
10. Test everything

---

*Feature Branch: `feature/notification-sources` (maybe rename to `feature/important-feads-retention`)*
*Updated: 2025-01-28*

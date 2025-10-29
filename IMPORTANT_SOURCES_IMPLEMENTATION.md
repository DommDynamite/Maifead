# Important Sources Feature - Implementation Plan

## Overview
Users can mark specific sources as "important" and assign them to a collection. New items from important sources are automatically added to their assigned collection, creating a notification-style workflow using the existing collection system.

## Current Status
✅ Database schema updated (committed: db36a2e)
- Added `is_important` BOOLEAN column to sources table
- Added `important_collection_id` TEXT column to sources table

✅ TypeScript types updated (committed: db36a2e)
- Added `isImportant?: boolean` to FeedSource interface
- Added `importantCollectionId?: string` to FeedSource interface

## Remaining Backend Work

### 1. Update Sources Controller (`apps/backend/src/controllers/sourcesController.ts`)

#### Changes needed in 3 locations:

**Location 1: `getAll()` method - Line 19-40**
Add these two fields to the response mapping:
```typescript
isImportant: Boolean(s.is_important),
importantCollectionId: s.important_collection_id || null,
```
Add after line 37 (blacklistKeywords), before line 38 (createdAt).

**Location 2: `create()` method - Around line 50-239**
- Add to destructured request body (line 53):
  ```typescript
  const { name, url, type, ..., isImportant, importantCollectionId } = req.body;
  ```
- Add to INSERT statement (around line 150-180):
  ```sql
  INSERT INTO sources (..., is_important, important_collection_id)
  VALUES (..., ?, ?)
  ```
- Add values to the array of parameters
- Add to response mapping (around line 209):
  ```typescript
  isImportant: Boolean(source.is_important),
  importantCollectionId: source.important_collection_id || null,
  ```

**Location 3: `update()` method - Around line 244-326**
- Add to destructured request body:
  ```typescript
  const { name, iconUrl, ..., isImportant, importantCollectionId } = req.body;
  ```
- Build UPDATE SET clause conditionally for these fields
- Add to response mapping (around line 232):
  ```typescript
  isImportant: Boolean(source.is_important),
  importantCollectionId: source.important_collection_id || null,
  ```

**Location 4: Any other methods that return source objects**
- Search for other response mappings and add the same two fields

### 2. Update Feed Service (`apps/backend/src/services/feedService.ts`)

When fetching feeds, check if source is important and auto-add items to collection:

```typescript
// After fetching and inserting new items
if (source.is_important && source.important_collection_id) {
  // Get the newly inserted items for this source
  const newItems = db.prepare(`
    SELECT id FROM feed_items
    WHERE source_id = ?
    AND created_at >= ?
  `).all(source.id, fetchStartTime);

  // Add each item to the important collection
  const addToCollection = db.prepare(`
    INSERT OR IGNORE INTO collection_items (collection_id, feed_item_id, added_at)
    VALUES (?, ?, ?)
  `);

  for (const item of newItems) {
    addToCollection.run(source.important_collection_id, item.id, Date.now());
  }
}
```

Location: In `FeedService.fetchFeed()` or `FeedService.fetchAllSources()` after items are inserted.

### 3. Update Backend Types (`apps/backend/src/types/index.ts`)

Add to `CreateSourceRequest` and `UpdateSourceRequest` interfaces:
```typescript
isImportant?: boolean;
importantCollectionId?: string;
```

## Frontend Work

### 1. Update Source Management UI

#### AddFeedModal (`apps/frontend/src/components/FeedManagement/AddFeedModal.tsx`)
- Add toggle: "Mark as Important Source"
- When enabled, show collection picker dropdown
- Options: existing collections + "Create New Collection"
- Pass `isImportant` and `importantCollectionId` to API

#### EditFeedModal (`apps/frontend/src/components/FeedManagement/EditFeedModal.tsx`)
- Same toggle and collection picker as AddFeedModal
- Show current settings if source is already important
- Allow changing or removing important status

### 2. Visual Styling for Important Sources

#### SourcesPage (`apps/frontend/src/pages/SourcesPage.tsx`)
Update source card styling:
```typescript
// Add to styled component
const SourceCard = styled.div<{ $isImportant?: boolean }>`
  border: 2px solid ${props =>
    props.$isImportant
      ? props.theme.colors.warning || '#F59E0B'
      : props.theme.colors.border
  };

  ${props => props.$isImportant && `
    box-shadow: 0 0 0 1px ${props.theme.colors.warning}40;
  `}
`;
```

Add badge/indicator:
```typescript
{source.isImportant && (
  <ImportantBadge>
    <Star size={12} fill="currentColor" />
    Important
  </ImportantBadge>
)}
```

Show which collection it feeds into:
```typescript
{source.isImportant && source.importantCollectionId && (
  <CollectionLink>
    → Saves to: {getCollectionName(source.importantCollectionId)}
  </CollectionLink>
)}
```

### 3. Collection Notification Badge

#### Navigation Components
Add unread count badge to Collections navigation:
- Count unread items in collections that have important sources
- Show badge: "🔔 5" or similar
- Highlight collections with new items from important sources

#### CollectionsPage
- Show which collections receive important source items
- Badge or indicator: "Contains important sources"
- Highlight collections with unread important items

### 4. Update Frontend Stores

#### feedSourceStore (`apps/frontend/src/stores/feedSourceStore.ts`)
Ensure store handles new fields:
```typescript
isImportant: source.isImportant || false,
importantCollectionId: source.importantCollectionId || null,
```

#### collectionsStore (if exists)
Add computed property for unread count in important collections.

## Testing Checklist

- [ ] Create new source marked as important with collection assigned
- [ ] Verify new items from important source auto-add to collection
- [ ] Edit existing source to mark as important
- [ ] Edit important source to change collection
- [ ] Edit important source to remove important status
- [ ] Multiple sources assigned to same collection
- [ ] Visual styling shows important sources correctly
- [ ] Collection badge shows correct unread count
- [ ] Removing item from collection works normally
- [ ] Deleting source removes relationship
- [ ] Deleting collection updates source (set important_collection_id to null?)

## Database Behavior Notes

**Foreign Key Handling:**
The `important_collection_id` column does NOT have a foreign key constraint currently. We should decide:
- Add FK constraint with `ON DELETE SET NULL` (if collection deleted, clear the field)
- OR handle this in application logic
- OR prevent deletion of collections that have important sources

**Recommended approach:** Add FK constraint for data integrity.

## Theme Colors

For important source styling, we should use an existing theme color or add a new one:
- Option 1: Use existing `warning` color (orange/yellow) - good for "important"
- Option 2: Add new `important` color to theme
- Option 3: Use `secondary` or `accent` color

Recommendation: Use `warning` color (`#F59E0B` / `#FCD34D`) for important badges.

## User Workflow Example

1. User creates collection "Work Alerts"
2. User adds "Company Blog" source, toggles "Important", selects "Work Alerts"
3. User adds "Team Updates" source, toggles "Important", selects "Work Alerts" (same!)
4. Feed fetcher runs → new items auto-added to "Work Alerts" collection
5. User sees Collections badge: 🔔 (5)
6. User opens "Work Alerts" → sees all new items
7. User reads items → marks read, removes from collection when done

## Next Steps

1. ✅ Schema & Types (completed)
2. ⏳ Backend API updates (in progress)
3. ⏳ Feed fetching logic
4. ⏳ Frontend UI updates
5. ⏳ Visual styling
6. ⏳ Testing

---

*Feature Branch: `feature/notification-sources`*
*Started: 2025-01-28*

# Feed Management

## Overview
Feed Management allows users to add, configure, and organize their RSS feed sources. Each feed can be customized with a display name and filtered using keyword-based whitelist/blacklist rules to control which content appears in the user's feed.

---

## Core Features

### 1. Feed Source Management
Users can manage their RSS feed subscriptions through a dedicated interface accessible from the Sources panel.

**Capabilities:**
- Add new RSS feeds by URL
- Edit existing feed configuration
- Delete feeds (with confirmation)
- Enable/disable feeds temporarily
- View feed status and metadata

---

### 2. Custom Feed Naming
When adding a feed, the system will:
1. Fetch the RSS feed to validate the URL
2. Auto-detect the feed name from `<title>` tag
3. Allow user to override with a custom name

**Example:**
```
RSS URL: https://blog.rust-lang.org/feed.xml
Auto-detected name: "Rust Blog"
User can rename to: "Rust Updates" or keep default
```

---

### 3. Keyword-Based Filtering

Each feed can have whitelist and/or blacklist keyword filters applied.

#### How It Works

**Whitelist (Include Only)**
- Only content items matching these keywords will appear
- Searches across: title, content text, RSS category tags, author name
- Case-insensitive matching
- If whitelist is empty, all items pass this filter

**Blacklist (Exclude)**
- Content items matching these keywords will be hidden
- Searches same fields as whitelist
- Case-insensitive matching
- Applied AFTER whitelist

**Filter Logic:**
```typescript
const shouldShowItem = (item: ContentItem, feed: FeedSource): boolean => {
  const searchableText = [
    item.title,
    item.content.text,
    item.content.excerpt,
    item.author?.name,
    ...(item.tags || [])
  ].join(' ').toLowerCase();

  // Whitelist check (if whitelist exists)
  if (feed.whitelistKeywords && feed.whitelistKeywords.length > 0) {
    const passesWhitelist = feed.whitelistKeywords.some(keyword =>
      searchableText.includes(keyword.toLowerCase())
    );
    if (!passesWhitelist) return false;
  }

  // Blacklist check
  if (feed.blacklistKeywords && feed.blacklistKeywords.length > 0) {
    const matchesBlacklist = feed.blacklistKeywords.some(keyword =>
      searchableText.includes(keyword.toLowerCase())
    );
    if (matchesBlacklist) return false;
  }

  return true;
};
```

#### Example Use Cases

**Tech News (Whitelist)**
```
Feed: TechCrunch
Whitelist: ["AI", "machine learning", "GPT", "neural network"]
Result: Only AI-related articles appear
```

**Rust Blog (Blacklist)**
```
Feed: Hacker News
Blacklist: ["cryptocurrency", "NFT", "crypto", "blockchain"]
Result: All posts except crypto-related content
```

**Combined Filters**
```
Feed: The Verge
Whitelist: ["smartphone", "mobile", "iOS", "Android"]
Blacklist: ["rumor", "leak", "unconfirmed"]
Result: Only confirmed mobile news (no rumors/leaks)
```

---

### 4. Tag Extraction

Tags on content cards come from these sources:

#### RSS Category Tags (Primary)
Most RSS feeds include `<category>` tags in their XML:
```xml
<item>
  <title>Understanding CSS Grid</title>
  <category>Web Development</category>
  <category>CSS</category>
  <category>Tutorial</category>
</item>
```

These are automatically extracted and attached to the ContentItem:
```typescript
interface ContentItem {
  tags?: string[]; // ["Web Development", "CSS", "Tutorial"]
}
```

#### Smart Extraction (Future Enhancement)
For feeds without category tags (or to supplement existing tags), we can extract keywords from:
- YouTube video descriptions
- Common tech terms in title/content
- Named entities (e.g., "React", "TypeScript", "Docker")

**No User-Added Tags**: Users do not manually add tags. Tags come entirely from the RSS feed metadata or smart extraction.

---

## Data Models

### FeedSource (Backend)
```typescript
interface FeedSource {
  id: string; // UUID
  userId: string; // Owner of this feed subscription
  url: string; // RSS feed URL
  name: string; // Display name (auto-detected or user-provided)
  icon?: string; // Feed favicon/icon URL
  type: 'rss'; // Future: 'youtube', 'reddit', etc.

  // Filtering
  whitelistKeywords?: string[];
  blacklistKeywords?: string[];

  // Status
  isEnabled: boolean;
  lastFetchedAt?: Date;
  lastSuccessfulFetchAt?: Date;
  fetchError?: string; // Error message if last fetch failed

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}
```

### Database Table (SQLite)
```sql
CREATE TABLE feed_sources (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  url TEXT NOT NULL,
  name TEXT NOT NULL,
  icon TEXT,
  type TEXT NOT NULL DEFAULT 'rss',
  whitelist_keywords TEXT, -- JSON array of strings
  blacklist_keywords TEXT, -- JSON array of strings
  is_enabled INTEGER NOT NULL DEFAULT 1,
  last_fetched_at INTEGER, -- Unix timestamp
  last_successful_fetch_at INTEGER,
  fetch_error TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,

  UNIQUE(user_id, url) -- Prevent duplicate feeds per user
);

CREATE INDEX idx_feed_sources_user_id ON feed_sources(user_id);
CREATE INDEX idx_feed_sources_enabled ON feed_sources(user_id, is_enabled);
```

---

## User Interface

### Sources Page Layout

**Desktop View:**
```
┌─────────────────────────────────────────────────────────────────┐
│  Feed Sources                              [Search...]  [+ Add] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Icon │ Name         │ URL              │ Items │ Status   │ │
│  ├──────┼──────────────┼──────────────────┼───────┼──────────┤ │
│  │ [🎨] │ CSS-Tricks   │ css-tricks.co... │  142  │ ✓ Active │ │
│  │      │              │ Filters: 2 ⓘ    │       │ 5 min ago│ │
│  ├──────┼──────────────┼──────────────────┼───────┼──────────┤ │
│  │ [🦀] │ Rust Blog    │ blog.rust-lang...│   38  │ ✓ Active │ │
│  │      │              │ No filters       │       │ 1h ago   │ │
│  ├──────┼──────────────┼──────────────────┼───────┼──────────┤ │
│  │ [⚛️] │ React News   │ react.dev/feed   │   95  │ ⚠️ Error │ │
│  │      │              │ No filters       │       │ 404 Not  │ │
│  │      │              │                  │       │ Found    │ │
│  └──────┴──────────────┴──────────────────┴───────┴──────────┘ │
│                                                                 │
│  Each row has hover actions: [Edit] [Refresh] [Disable] [🗑️]   │
└─────────────────────────────────────────────────────────────────┘
```

**Table Columns:**
- **Icon**: Feed favicon or default RSS icon
- **Name**: Display name (click to edit)
- **URL**: Feed URL (truncated, hover for full URL)
- **Filters**: Badge showing filter count (click to view/edit)
- **Items**: Current item count from this feed
- **Status**:
  - ✓ Active (green) with last fetch time
  - ⚠️ Error (yellow) with error message
  - ⏸️ Disabled (gray)
- **Actions** (on hover): Edit, Refresh, Disable/Enable, Delete

---

### Add Feed Modal

**Triggered by**: Clicking "+ Add Feed" button

**Step 1: Enter URL**
```
┌─────────────────────────────────────────────┐
│  Add Feed Source                        [X] │
├─────────────────────────────────────────────┤
│                                             │
│  RSS Feed URL                               │
│  ┌─────────────────────────────────────┐   │
│  │ https://                             │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Examples:                                  │
│  • https://css-tricks.com/feed/             │
│  • https://blog.rust-lang.org/feed.xml      │
│                                             │
│               [Cancel]  [Continue]          │
└─────────────────────────────────────────────┘
```

**Step 2: Validate & Configure**
After clicking Continue, backend:
1. Fetches the feed to validate URL
2. Extracts feed name and icon
3. Returns to frontend

```
┌─────────────────────────────────────────────┐
│  Configure Feed                         [X] │
├─────────────────────────────────────────────┤
│                                             │
│  ✓ Feed found: CSS-Tricks                   │
│                                             │
│  Display Name                               │
│  ┌─────────────────────────────────────┐   │
│  │ CSS-Tricks                           │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  Configure Filters (Optional)        │   │
│  │  [Expand ▼]                          │   │
│  └─────────────────────────────────────┘   │
│                                             │
│               [Cancel]  [Add Feed]          │
└─────────────────────────────────────────────┘
```

**Step 3: Configure Filters (Optional)**
When user expands "Configure Filters":

```
┌─────────────────────────────────────────────────────────┐
│  Configure Filters                                  [X] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Whitelist Keywords (Include Only)                     │
│  Only show content matching these keywords             │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ [CSS] [Grid] [Flexbox]              + Add keyword │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  Blacklist Keywords (Exclude)                          │
│  Hide content matching these keywords                  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ [advertisement] [sponsored]         + Add keyword │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  Keywords are case-insensitive and match across:       │
│  • Title                                                │
│  • Content text                                         │
│  • Tags (from RSS categories)                           │
│  • Author name                                          │
│                                                         │
│                           [Cancel]  [Save Filters]      │
└─────────────────────────────────────────────────────────┘
```

**Keyword Input:**
- User types keyword and presses Enter or clicks "+ Add keyword"
- Keywords appear as removable chips
- Click X on chip to remove
- Real-time validation (no duplicates, min 2 characters)

---

### Edit Feed Modal

**Triggered by**: Clicking "Edit" button on feed row

Same layout as Add Feed Modal, but:
- Pre-filled with existing values
- Shows current filters with ability to add/remove
- "Save Changes" button instead of "Add Feed"
- Cannot change URL (would require deleting and re-adding)

---

### Filter Status Badge

On the Sources table, feeds with filters show a badge:

```
Filters: 2 ⓘ
```

**On hover:**
```
┌────────────────────────────┐
│ Whitelist: 3 keywords      │
│ • CSS                      │
│ • Grid                     │
│ • Flexbox                  │
│                            │
│ Blacklist: 1 keyword       │
│ • advertisement            │
└────────────────────────────┘
```

**On click**: Opens Edit Feed Modal with filters section expanded

---

## Backend Implementation

### API Endpoints

#### GET `/api/sources`
**Purpose**: Fetch all feed sources for authenticated user

**Response:**
```typescript
{
  sources: FeedSource[]
}
```

---

#### POST `/api/sources`
**Purpose**: Add a new feed source

**Request:**
```typescript
{
  url: string;
  name?: string; // Optional custom name
  whitelistKeywords?: string[];
  blacklistKeywords?: string[];
}
```

**Process:**
1. Validate URL format
2. Fetch RSS feed to verify it exists
3. Parse feed XML to extract default name and icon
4. Use custom name if provided, otherwise use detected name
5. Create FeedSource record in database
6. Return created source

**Response:**
```typescript
{
  source: FeedSource
}
```

**Errors:**
- 400: Invalid URL format
- 404: Feed not found at URL
- 422: Invalid RSS feed (parse error)
- 409: Feed already added by this user

---

#### PATCH `/api/sources/:id`
**Purpose**: Update feed configuration

**Request:**
```typescript
{
  name?: string;
  whitelistKeywords?: string[];
  blacklistKeywords?: string[];
  isEnabled?: boolean;
}
```

**Response:**
```typescript
{
  source: FeedSource
}
```

---

#### DELETE `/api/sources/:id`
**Purpose**: Delete a feed source

**Response:**
```typescript
{
  success: true
}
```

**Note**: This does NOT delete user's read/saved state for items from this feed. SavedState records persist even after source deletion.

---

#### POST `/api/sources/:id/refresh`
**Purpose**: Manually trigger a refresh of a specific feed

**Process:**
1. Fetch RSS feed from URL
2. Update lastFetchedAt timestamp
3. If successful, update lastSuccessfulFetchAt
4. If error, store error message in fetchError field
5. Return feed status

**Response:**
```typescript
{
  source: FeedSource;
  itemCount: number; // Number of items fetched
}
```

---

### RSS Parsing

#### Feed Metadata Extraction
```typescript
interface RSSFeedMeta {
  title: string; // From <channel><title>
  description?: string;
  link: string;
  icon?: string; // From <image><url> or favicon
  language?: string;
}
```

#### Item Extraction with Categories
```typescript
// RSS XML example
<item>
  <title>Understanding CSS Grid Layout</title>
  <link>https://css-tricks.com/snippets/css/complete-guide-grid/</link>
  <description>A comprehensive guide to CSS Grid...</description>
  <pubDate>Mon, 15 Jan 2024 10:00:00 GMT</pubDate>
  <author>Chris Coyier</author>
  <category>CSS</category>
  <category>Web Development</category>
  <category>Tutorial</category>
  <enclosure url="https://example.com/image.jpg" type="image/jpeg"/>
</item>
```

**Parsed to ContentItem:**
```typescript
{
  id: "css-tricks-123456", // Generated from URL or GUID
  source: {
    type: 'rss',
    name: 'CSS-Tricks',
    url: 'https://css-tricks.com',
    icon: 'https://css-tricks.com/favicon.ico'
  },
  title: 'Understanding CSS Grid Layout',
  content: {
    text: 'A comprehensive guide to CSS Grid...',
    html: '<p>A comprehensive guide...</p>',
    excerpt: 'A comprehensive guide to CSS Grid...'
  },
  media: [
    {
      type: 'image',
      url: 'https://example.com/image.jpg'
    }
  ],
  author: {
    name: 'Chris Coyier'
  },
  publishedAt: new Date('2024-01-15T10:00:00Z'),
  url: 'https://css-tricks.com/snippets/css/complete-guide-grid/',
  tags: ['CSS', 'Web Development', 'Tutorial'], // From <category> tags
  language: 'en'
}
```

---

### Filter Application Flow

**When fetching feed content:**
```typescript
async function getFeedContent(userId: string): Promise<ContentItem[]> {
  // 1. Get all enabled sources for user
  const sources = await db.query(
    'SELECT * FROM feed_sources WHERE user_id = ? AND is_enabled = 1',
    [userId]
  );

  // 2. Fetch RSS content for each source
  const allItems: ContentItem[] = [];
  for (const source of sources) {
    const feedItems = await fetchAndParseRSS(source.url);

    // 3. Apply filters to each item
    const filteredItems = feedItems.filter(item => {
      return applyFeedFilters(item, source);
    });

    allItems.push(...filteredItems);
  }

  // 4. Sort by publishedAt (newest first)
  allItems.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

  // 5. Attach read/saved state
  const itemsWithState = await attachUserState(allItems, userId);

  return itemsWithState;
}

function applyFeedFilters(item: ContentItem, source: FeedSource): boolean {
  const searchableText = [
    item.title,
    item.content.text,
    item.content.excerpt || '',
    item.author?.name || '',
    ...(item.tags || [])
  ].join(' ').toLowerCase();

  // Whitelist check
  if (source.whitelistKeywords && source.whitelistKeywords.length > 0) {
    const hasWhitelistMatch = source.whitelistKeywords.some(keyword =>
      searchableText.includes(keyword.toLowerCase())
    );
    if (!hasWhitelistMatch) return false;
  }

  // Blacklist check
  if (source.blacklistKeywords && source.blacklistKeywords.length > 0) {
    const hasBlacklistMatch = source.blacklistKeywords.some(keyword =>
      searchableText.includes(keyword.toLowerCase())
    );
    if (hasBlacklistMatch) return false;
  }

  return true;
}
```

---

## Integration with Navigation

### Sources Panel
The existing Sources Panel (`SourcesPanel.tsx`) will be enhanced:

**Current Behavior:**
- Shows list of sources with checkboxes
- Filters main feed to selected sources

**New Additions:**
- "Manage Sources" button at bottom → Navigates to Sources Page
- Each source shows filter badge if configured
- Right-click context menu: Quick Edit, Refresh, Disable

### Feed View
The main Feed View already supports source filtering. With filters added:

**Filtering Order:**
1. **Source selection** (from SourcesPanel or Fead)
2. **Per-source filters** (whitelist/blacklist) ← NEW
3. **Global search** (SearchBar)
4. **Read state filter** (hide read items)

**Example:**
```
User selects "Tech News" Fead (3 sources)
  → Source 1: TechCrunch (whitelist: ["AI"])
  → Source 2: The Verge (blacklist: ["rumor"])
  → Source 3: Hacker News (no filters)

User types "GPT" in search bar

Final feed shows:
  ✓ TechCrunch articles about AI and GPT
  ✓ The Verge articles about GPT (no rumors)
  ✓ Hacker News articles about GPT
  ✗ TechCrunch non-AI articles (filtered by source whitelist)
  ✗ The Verge rumor articles (filtered by source blacklist)
```

---

## Mobile Considerations

### Sources Page (Mobile)
- Table converts to card list
- Each card shows: Icon, Name, Status, Item count
- Tap card to expand details and show actions
- Swipe left on card → Quick delete
- Filters shown as chip count badge

### Add/Edit Modal (Mobile)
- Full-screen modal instead of centered
- Keyword input optimized for mobile keyboard
- Filter chips wrap to multiple lines
- Larger touch targets

---

## Error Handling

### Feed Fetch Errors

**Common Errors:**
- 404 Not Found → Feed URL moved/deleted
- 403 Forbidden → Feed requires authentication
- Timeout → Feed server slow/down
- Parse Error → Invalid RSS XML

**User Experience:**
1. Error badge appears on Sources table
2. Tooltip shows specific error message
3. User can click "Retry" to attempt refetch
4. User can edit URL if feed moved
5. Feed can be disabled to ignore errors

**Error States in UI:**
```
┌────────────────────────────────────────────┐
│ [⚛️] React News                            │
│ ⚠️ Error: 404 Not Found                    │
│ Last successful fetch: 2 days ago          │
│                                            │
│ This feed may have moved or been deleted.  │
│                                            │
│ [Retry] [Edit URL] [Disable] [Delete]     │
└────────────────────────────────────────────┘
```

---

## Performance Considerations

### Caching Strategy
- RSS feeds cached for 5-15 minutes (configurable per feed)
- Filter logic runs in-memory on already-fetched content
- Changing filters does NOT trigger new fetch (uses cached content)

### Filter Performance
- Keywords stored as lowercase in database for faster matching
- Whitelist/blacklist checked before expensive operations
- For large feeds (1000+ items), filtering happens server-side

---

## Future Enhancements

### Smart Filtering
- Suggest keywords based on common tags in feed
- "Show similar" feature to find related content
- Automatic category detection

### Bulk Operations
- Import/export OPML files (standard RSS format)
- Bulk edit filters across multiple feeds
- "Apply filter template" to multiple sources

### Advanced Filters
- Date range filtering
- Author filtering
- Media type filtering (only video, only articles)
- Regex support for power users

### Feed Discovery
- Auto-discover RSS feeds from blog homepages
- Suggested feeds based on user interests
- Popular feeds directory

---

## Summary

Feed Management in Maifead provides:
- ✅ Simple RSS feed addition with URL validation
- ✅ Custom naming for feeds
- ✅ Keyword-based whitelist/blacklist filtering per feed
- ✅ Automatic tag extraction from RSS `<category>` tags
- ✅ Beautiful table interface for managing sources
- ✅ Real-time status monitoring with error handling
- ✅ Integration with Sources panel and Fead presets
- ✅ Mobile-optimized interface

**No User-Added Tags**: Tags come exclusively from RSS metadata, keeping the system simple and automatic.

**Filter Logic**: Reliable keyword matching across all content fields, applied per-source before global search/filters.

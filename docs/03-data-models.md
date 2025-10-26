# Data Models

## Overview
This document defines all data structures used throughout Maifead, including database schemas, TypeScript interfaces, and the unified content representation.

## Core Principle
**Backend stores minimal metadata only** - no full content storage. Content lives at the source, we just track references and user state.

---

## Unified Content Item (The Heart of Maifead)

This is the normalized shape that ALL content sources (RSS, Reddit, YouTube, etc.) are transformed into.

### TypeScript Interface

```typescript
// packages/types/src/content.ts

export type SourceType = 'rss' | 'reddit' | 'youtube' | 'twitter' | 'mastodon';

export type MediaType = 'image' | 'video' | 'audio' | 'embed';

export interface ContentSource {
  type: SourceType;
  name: string;        // Feed/channel name
  url: string;         // Original source URL
  icon?: string;       // Source logo/favicon URL
}

export interface ContentMedia {
  type: MediaType;
  url: string;         // Direct media URL
  thumbnail?: string;  // Thumbnail for videos
  embedUrl?: string;   // For YouTube/Twitter embeds
  width?: number;
  height?: number;
  alt?: string;        // Accessibility
}

export interface ContentAuthor {
  name: string;
  url?: string;        // Link to author profile
  avatar?: string;     // Author profile picture
}

export interface ContentBody {
  text: string;        // Plain text (for preview/search)
  html?: string;       // Rich HTML content
  excerpt?: string;    // Short summary (first 200 chars)
}

export interface ContentItem {
  id: string;                    // Hash of URL (stable, consistent)
  source: ContentSource;
  title: string;
  content: ContentBody;
  media?: ContentMedia[];        // Can have multiple media items
  author?: ContentAuthor;
  publishedAt: Date;
  url: string;                   // Link to original content

  // User-specific state (attached by backend after fetching)
  isRead?: boolean;
  isSaved?: boolean;

  // Metadata
  tags?: string[];               // Future: extracted or user-added tags
  category?: string;             // Future: categorization
  language?: string;             // Content language (ISO 639-1)
}
```

### Zod Schema (Runtime Validation)

```typescript
// packages/types/src/schemas.ts
import { z } from 'zod';

export const contentSourceSchema = z.object({
  type: z.enum(['rss', 'reddit', 'youtube', 'twitter', 'mastodon']),
  name: z.string(),
  url: z.string().url(),
  icon: z.string().url().optional(),
});

export const contentMediaSchema = z.object({
  type: z.enum(['image', 'video', 'audio', 'embed']),
  url: z.string().url(),
  thumbnail: z.string().url().optional(),
  embedUrl: z.string().url().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  alt: z.string().optional(),
});

export const contentItemSchema = z.object({
  id: z.string(),
  source: contentSourceSchema,
  title: z.string(),
  content: z.object({
    text: z.string(),
    html: z.string().optional(),
    excerpt: z.string().optional(),
  }),
  media: z.array(contentMediaSchema).optional(),
  author: z.object({
    name: z.string(),
    url: z.string().url().optional(),
    avatar: z.string().url().optional(),
  }).optional(),
  publishedAt: z.date(),
  url: z.string().url(),
  isRead: z.boolean().optional(),
  isSaved: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  language: z.string().length(2).optional(),
});

// Export inferred types
export type ContentItemDTO = z.infer<typeof contentItemSchema>;
```

### Example Content Item

```typescript
const exampleItem: ContentItem = {
  id: 'sha256-abc123...',
  source: {
    type: 'rss',
    name: 'CSS-Tricks',
    url: 'https://css-tricks.com/feed/',
    icon: 'https://css-tricks.com/favicon.ico',
  },
  title: 'Understanding CSS Grid Layout',
  content: {
    text: 'CSS Grid Layout is a powerful tool for creating complex layouts...',
    html: '<p>CSS Grid Layout is a powerful tool for creating <strong>complex layouts</strong>...</p>',
    excerpt: 'CSS Grid Layout is a powerful tool for creating complex layouts on the web. This article explores...',
  },
  media: [
    {
      type: 'image',
      url: 'https://css-tricks.com/images/grid-example.png',
      width: 1200,
      height: 630,
      alt: 'CSS Grid example layout',
    }
  ],
  author: {
    name: 'Chris Coyier',
    url: 'https://css-tricks.com/author/chriscoyier/',
    avatar: 'https://css-tricks.com/avatars/chris.jpg',
  },
  publishedAt: new Date('2024-03-15T10:30:00Z'),
  url: 'https://css-tricks.com/understanding-css-grid-layout/',
  isRead: false,
  isSaved: false,
  tags: ['css', 'grid', 'layout'],
  language: 'en',
};
```

---

## Database Models (Prisma)

### User Model

```prisma
model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String   @map("password_hash")
  name         String?
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  // Relations
  feeds        FeedSource[]
  readItems    ReadState[]
  savedItems   SavedState[]
  sessions     Session[]
  preferences  UserPreferences?

  @@map("users")
}
```

**Fields:**
- `id`: UUID, primary key
- `email`: Unique, used for login
- `passwordHash`: Hashed with Lucia (bcrypt/argon2)
- `name`: Optional display name
- Timestamps for audit trail

### User Preferences Model

```prisma
model UserPreferences {
  id       String  @id @default(uuid())
  userId   String  @unique @map("user_id")
  user     User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  theme    String  @default("dark") // 'light' | 'dark'
  language String  @default("en")   // ISO 639-1 code

  // Feed settings
  itemsPerPage      Int     @default(50) @map("items_per_page")
  autoMarkAsRead    Boolean @default(false) @map("auto_mark_as_read")
  showReadItems     Boolean @default(true) @map("show_read_items")
  defaultSort       String  @default("chronological") @map("default_sort") // 'chronological' | 'source'

  // Notification settings (future)
  emailNotifications Boolean @default(false) @map("email_notifications")

  @@map("user_preferences")
}
```

### Feed Source Model

```prisma
model FeedSource {
  id          String    @id @default(uuid())
  userId      String    @map("user_id")
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  type        String    // 'rss', 'reddit', 'youtube', etc.
  url         String    // RSS feed URL, subreddit, channel ID, etc.
  name        String    // Display name
  icon        String?   // Source icon/favicon URL

  enabled     Boolean   @default(true)
  createdAt   DateTime  @default(now()) @map("created_at")
  lastFetched DateTime? @map("last_fetched")
  fetchError  String?   @map("fetch_error") // Last error message if fetch failed

  // Future: Custom refresh interval per feed
  refreshInterval Int?  @map("refresh_interval") // Minutes

  @@unique([userId, url])
  @@index([userId, enabled])
  @@map("feed_sources")
}
```

**Key Points:**
- User-scoped (each user has their own feed sources)
- `url` is unique per user
- `enabled` allows temporarily disabling without deleting
- `lastFetched` and `fetchError` for monitoring

### Read State Model

```prisma
model ReadState {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  contentId String   @map("content_id") // Hash of original URL
  readAt    DateTime @default(now()) @map("read_at")

  @@unique([userId, contentId])
  @@index([userId])
  @@map("read_states")
}
```

**How it works:**
- `contentId` = `sha256(contentItem.url)` - stable identifier
- When user clicks card, create/update this record
- No full content stored, just the reference

### Saved State Model

```prisma
model SavedState {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  contentId String   @map("content_id") // Hash of original URL
  savedAt   DateTime @default(now()) @map("saved_at")

  // Optional: Save a snapshot of metadata for offline access
  title     String?
  url       String?
  source    String?

  @@unique([userId, contentId])
  @@index([userId])
  @@map("saved_states")
}
```

**Future enhancement:**
- Could store snapshot of title/url in case original disappears
- Keep it minimal though - main purpose is just tracking saved status

### Session Model (Lucia Auth)

```prisma
model Session {
  id        String   @id
  userId    String   @map("user_id")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime @map("expires_at")

  @@index([userId])
  @@map("sessions")
}
```

**Managed by Lucia:**
- Session ID stored in HTTP-only cookie
- `expiresAt` for automatic cleanup
- Cascade delete when user is deleted

---

## Filter Models (Future Phase)

### Filter Rule Model

```prisma
model FilterRule {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  name        String   // User-given name "Tech News Only"
  enabled     Boolean  @default(true)

  // Filter definition (JSON)
  conditions  Json     // { type: 'keyword', value: 'TypeScript', field: 'title' }

  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("filter_rules")
}
```

**Conditions JSON structure:**
```typescript
type FilterCondition = {
  operator: 'AND' | 'OR';
  rules: Array<{
    field: 'title' | 'content' | 'source' | 'tag';
    type: 'keyword' | 'regex' | 'exact';
    value: string;
    negate?: boolean; // NOT keyword
  }>;
};
```

---

## TypeScript Types (Shared Package)

### API Request/Response Types

```typescript
// packages/types/src/api.ts

// Auth
export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

// Feed Sources
export interface CreateFeedSourceRequest {
  type: SourceType;
  url: string;
  name?: string; // Optional, can auto-detect from feed
}

export interface FeedSourceResponse {
  id: string;
  type: SourceType;
  url: string;
  name: string;
  icon?: string;
  enabled: boolean;
  createdAt: string;
  lastFetched?: string;
  fetchError?: string;
}

// Content
export interface GetContentRequest {
  page?: number;
  limit?: number;
  includeRead?: boolean;
  sourceType?: SourceType;
  search?: string;
}

export interface GetContentResponse {
  items: ContentItem[];
  total: number;
  page: number;
  hasMore: boolean;
}

export interface MarkReadRequest {
  contentId: string;
  read: boolean;
}

export interface MarkSavedRequest {
  contentId: string;
  saved: boolean;
}
```

### Frontend-Specific Types

```typescript
// apps/frontend/src/types/ui.ts

export interface FeedViewState {
  layout: 'list' | 'grid' | 'magazine';
  sortBy: 'chronological' | 'source';
  filterKeyword: string;
}

export interface CardState {
  id: string;
  isExpanded: boolean;
  mediaLoaded: boolean;
}

export interface ModalState {
  isOpen: boolean;
  contentId: string | null;
}
```

---

## Utility Functions for Data Models

### Generate Content ID

```typescript
// packages/types/src/utils.ts
import { createHash } from 'crypto';

export function generateContentId(url: string): string {
  return createHash('sha256')
    .update(url)
    .digest('hex')
    .substring(0, 16); // Use first 16 chars for brevity
}
```

### Sanitize HTML

```typescript
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'code', 'pre',
      'img', // Will add loading="lazy" separately
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class'],
  });
}
```

### Extract Media from RSS Item

```typescript
export function extractMediaFromRSS(item: any): ContentMedia[] {
  const media: ContentMedia[] = [];

  // RSS enclosure (podcasts, videos)
  if (item.enclosure) {
    media.push({
      type: item.enclosure.type.startsWith('image') ? 'image' :
            item.enclosure.type.startsWith('video') ? 'video' : 'audio',
      url: item.enclosure.url,
    });
  }

  // Media:content (YouTube RSS, Media RSS)
  if (item['media:content']) {
    media.push({
      type: 'video',
      url: item['media:content'].url,
      thumbnail: item['media:thumbnail']?.url,
    });
  }

  // Extract first image from HTML content
  const imgMatch = item.content?.match(/<img[^>]+src="([^">]+)"/);
  if (imgMatch && !media.some(m => m.url === imgMatch[1])) {
    media.push({
      type: 'image',
      url: imgMatch[1],
    });
  }

  return media;
}
```

---

## Data Validation Strategy

### Backend (NestJS)
```typescript
// Use Zod schemas in DTOs
import { createZodDto } from '@anatine/zod-nestjs';
import { contentItemSchema } from '@maifead/types';

export class CreateFeedSourceDto extends createZodDto(createFeedSourceSchema) {}
```

### Frontend (React)
```typescript
// Validate API responses
const { data } = await axios.get('/api/content');
const validatedData = contentItemSchema.array().parse(data);
```

---

## Migration Strategy

### Initial Migration
```sql
-- Generated by Prisma
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE feed_sources (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  name TEXT NOT NULL,
  icon TEXT,
  enabled INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_fetched DATETIME,
  fetch_error TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, url)
);

CREATE INDEX idx_feed_sources_user_enabled ON feed_sources(user_id, enabled);

CREATE TABLE read_states (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  content_id TEXT NOT NULL,
  read_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, content_id)
);

CREATE INDEX idx_read_states_user ON read_states(user_id);

-- Similar for saved_states, sessions, etc.
```

### Adding Columns (Example Future Migration)
```prisma
// Add tags support
model ContentTag {
  id        String @id @default(uuid())
  userId    String
  contentId String
  tag       String

  @@unique([userId, contentId, tag])
  @@map("content_tags")
}
```

---

## Data Size Estimates

For a single user with 20 RSS feeds, fetching 50 items per feed daily:

**Database Storage:**
- FeedSources: 20 rows × ~200 bytes = 4 KB
- ReadState: ~1000 items × 100 bytes = 100 KB
- SavedState: ~100 items × 150 bytes = 15 KB
- **Total: ~120 KB per user** (minimal!)

**In-Memory (Backend):**
- 1000 ContentItems × 2 KB each = 2 MB (temporary, during request)

**Frontend Cache (TanStack Query):**
- Same ~2 MB in browser memory

**Conclusion:** Extremely lightweight. SQLite can easily handle 100+ users on a small VPS.

---

This data model design prioritizes minimalism while maintaining flexibility for future features.

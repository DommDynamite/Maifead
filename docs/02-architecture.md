# Architecture

## System Overview

Maifead uses a **lightweight backend** architecture where the server handles data aggregation and normalization, while the frontend is responsible for rendering and embedding media on-demand.

```
┌─────────────────────────────────────────────────────────────┐
│                         User Device                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              React Frontend (PWA)                       │ │
│  │  • Renders unified feed                                 │ │
│  │  • Handles media embeds on-demand                       │ │
│  │  • Manages UI state (theme, read/unread)               │ │
│  │  • Caches with TanStack Query                          │ │
│  └────────────────────────────────────────────────────────┘ │
│                            ↕ HTTP/REST                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              NestJS Backend (API)                       │ │
│  │  • Fetches RSS feeds                                    │ │
│  │  • Normalizes content → unified ContentItem             │ │
│  │  • Stores minimal metadata (sources, read state)        │ │
│  │  • Manages user auth & preferences                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                            ↕                                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              SQLite Database                            │ │
│  │  • User accounts                                        │ │
│  │  • Feed sources                                         │ │
│  │  • Read/saved state                                     │ │
│  │  • User preferences                                     │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP
┌─────────────────────────────────────────────────────────────┐
│                    External Sources                          │
│  • RSS Feeds (blogs, news, podcasts)                        │
│  • Reddit API (future)                                       │
│  • YouTube API (future)                                      │
│  • Social Media APIs (future)                               │
└─────────────────────────────────────────────────────────────┘
```

## Core Architectural Principles

### 1. Minimal Backend Storage
- **Backend does NOT store full content** - only metadata
- Original content stays at source (RSS feed, YouTube, etc.)
- Frontend fetches embeds/images directly from source URLs
- Reduces storage requirements dramatically
- Keeps deployment lightweight

### 2. Data Normalization Layer
Backend transforms all sources into a **unified ContentItem shape**:

```typescript
{
  id: string;
  source: { type, name, url, icon };
  title: string;
  content: { text, html };
  media: { type, url, thumbnail, embedUrl };
  author: { name, url, avatar };
  publishedAt: Date;
  url: string; // Link to original
}
```

Frontend receives consistent objects regardless of source type (RSS, Reddit, YouTube).

### 3. Stateless Frontend Data
- Frontend doesn't persist content locally (initially)
- TanStack Query provides client-side caching (in-memory)
- Backend API is source of truth
- Future: Add IndexedDB for offline PWA support

### 4. Multi-Tenant Capable
- One backend instance can serve multiple users
- User-scoped feed sources and preferences
- SQLite is fine for 5-50 users on self-hosted server
- Can migrate to PostgreSQL if needed for scale

## Monorepo Structure

```
maifead/
├── apps/
│   ├── backend/                  # NestJS application
│   │   ├── src/
│   │   │   ├── main.ts           # Entry point
│   │   │   ├── app.module.ts     # Root module
│   │   │   ├── auth/             # Authentication module
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.module.ts
│   │   │   │   └── dto/          # Data transfer objects
│   │   │   ├── users/            # User management
│   │   │   ├── feeds/            # RSS feed management
│   │   │   │   ├── feeds.controller.ts
│   │   │   │   ├── feeds.service.ts
│   │   │   │   └── feeds.module.ts
│   │   │   ├── content/          # Content aggregation & normalization
│   │   │   │   ├── content.controller.ts
│   │   │   │   ├── content.service.ts
│   │   │   │   ├── normalizers/  # Source-specific normalizers
│   │   │   │   │   ├── rss.normalizer.ts
│   │   │   │   │   ├── reddit.normalizer.ts (future)
│   │   │   │   │   └── youtube.normalizer.ts (future)
│   │   │   │   └── content.module.ts
│   │   │   ├── filters/          # Filter management (future)
│   │   │   └── common/           # Shared utilities
│   │   │       ├── guards/
│   │   │       ├── interceptors/
│   │   │       └── pipes/
│   │   ├── prisma/
│   │   │   ├── schema.prisma     # Database schema
│   │   │   └── migrations/       # Migration history
│   │   ├── test/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── frontend/                 # React application
│       ├── src/
│       │   ├── main.tsx          # Entry point
│       │   ├── App.tsx           # Root component
│       │   ├── components/       # Reusable UI components
│       │   │   ├── Card/
│       │   │   ├── Modal/
│       │   │   ├── Navigation/
│       │   │   └── ui/           # shadcn/ui components
│       │   ├── features/         # Feature-based modules
│       │   │   ├── feed/
│       │   │   │   ├── FeedView.tsx
│       │   │   │   ├── useFeedData.ts
│       │   │   │   └── FeedCard.tsx
│       │   │   ├── sources/
│       │   │   ├── filters/
│       │   │   └── auth/
│       │   ├── hooks/            # Custom React hooks
│       │   ├── stores/           # Zustand stores
│       │   │   ├── themeStore.ts
│       │   │   └── uiStore.ts
│       │   ├── theme/            # Styled Components theme
│       │   │   ├── theme.ts
│       │   │   ├── GlobalStyles.ts
│       │   │   └── ThemeProvider.tsx
│       │   ├── api/              # API client (TanStack Query)
│       │   │   ├── client.ts
│       │   │   ├── queries.ts
│       │   │   └── mutations.ts
│       │   ├── types/            # Frontend-specific types
│       │   └── utils/            # Utility functions
│       ├── public/
│       ├── package.json
│       ├── vite.config.ts
│       └── tsconfig.json
│
├── packages/
│   └── types/                    # Shared types package
│       ├── src/
│       │   ├── index.ts
│       │   ├── content.ts        # ContentItem interface
│       │   ├── user.ts           # User types
│       │   ├── feed.ts           # Feed source types
│       │   └── schemas.ts        # Zod schemas
│       ├── package.json
│       └── tsconfig.json
│
├── docs/                         # Documentation
├── docker-compose.yml
├── Dockerfile
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

## Data Flow

### 1. User Adds RSS Feed

```
User (Frontend)
    ↓ POST /feeds { url: "https://blog.example.com/rss" }
Backend API
    ↓ Validate URL, fetch feed to test
    ↓ Create FeedSource record in database
    ↓ Return FeedSource object
Frontend
    ↓ Update UI, show new feed in sources list
```

### 2. User Refreshes Feed

```
User (Frontend)
    ↓ GET /content?refresh=true
Backend API
    ↓ Fetch all user's FeedSources from database
    ↓ For each feed:
    │   ↓ Fetch RSS feed from external URL
    │   ↓ Parse XML/Atom with rss-parser
    │   ↓ Transform to unified ContentItem[]
    │   ↓ Check read/saved state from database
    │   ↓ Attach state to each item
    ↓ Merge all sources into single array
    ↓ Sort chronologically
    ↓ Return ContentItem[]
Frontend
    ↓ TanStack Query caches response
    ↓ Render feed cards
    ↓ Lazy-load images/embeds as user scrolls
```

### 3. User Clicks Card to Read

```
User (Frontend)
    ↓ Click card → open modal
    ↓ Display full content (already have from feed)
    ↓ Render embeds (YouTube iframe, Twitter embed, etc.)
    ↓ Automatically mark as read
    ↓ POST /content/:id/read
Backend API
    ↓ Create/update read state in database
    ↓ Return success
Frontend
    ↓ Update UI (grey out card, update count)
```

### 4. User Applies Filter

```
User (Frontend)
    ↓ Enter keyword "TypeScript"
Frontend Only (Client-side filtering for MVP)
    ↓ Filter cached ContentItem[] locally
    ↓ Re-render feed with filtered items

(Future: Server-side filtering)
    ↓ GET /content?filter=keyword:TypeScript
Backend API
    ↓ Apply filter logic to fetched content
    ↓ Return filtered ContentItem[]
```

## Backend Architecture (NestJS)

### Module Structure

```typescript
// app.module.ts - Root module
@Module({
  imports: [
    AuthModule,
    UsersModule,
    FeedsModule,
    ContentModule,
    FiltersModule,
  ],
})
export class AppModule {}
```

### Key Services

#### FeedsService
- CRUD operations for feed sources
- Validate feed URLs
- Test feed accessibility
- User-scoped feed management

#### ContentService
- Fetch content from all user's sources
- Coordinate normalizers
- Merge and sort content
- Apply filters (future)
- Handle read/saved state

#### Normalizers
Each source type has a normalizer that transforms its specific format to `ContentItem`:

```typescript
// content/normalizers/rss.normalizer.ts
export class RssNormalizer {
  normalize(rssFeed: RSSFeed): ContentItem[] {
    return rssFeed.items.map(item => ({
      id: generateId(item.link),
      source: { type: 'rss', name: rssFeed.title, ... },
      title: item.title,
      content: { text: stripHtml(item.content), html: item.content },
      media: this.extractMedia(item),
      author: { name: item.creator },
      publishedAt: new Date(item.pubDate),
      url: item.link,
    }));
  }
}
```

### Database Schema (Prisma)

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String   // Hashed with Lucia
  name      String?
  createdAt DateTime @default(now())

  feeds     FeedSource[]
  readItems ReadState[]
  savedItems SavedState[]
  sessions  Session[]
}

model FeedSource {
  id          String   @id @default(uuid())
  type        String   // 'rss', 'reddit', 'youtube', etc.
  url         String
  name        String
  icon        String?
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  createdAt   DateTime @default(now())
  lastFetched DateTime?

  @@unique([userId, url])
}

model ReadState {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  contentId String   // Hash of original content URL
  readAt    DateTime @default(now())

  @@unique([userId, contentId])
}

model SavedState {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  contentId String
  savedAt   DateTime @default(now())

  @@unique([userId, contentId])
}

model Session {
  id        String   @id
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  expiresAt DateTime
}
```

**Key Points:**
- No content storage - only metadata
- `contentId` is hash of original URL (stable identifier)
- User-scoped data for multi-tenancy
- Minimal tables = fast queries

## Frontend Architecture (React)

### State Management Strategy

#### Server State (TanStack Query)
```typescript
// api/queries.ts
export const useFeedContent = () => {
  return useQuery({
    queryKey: ['content'],
    queryFn: async () => {
      const response = await apiClient.get('/content');
      return response.data as ContentItem[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
```

#### UI State (Zustand)
```typescript
// stores/uiStore.ts
interface UIStore {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  selectedContentId: string | null;
  setSelectedContent: (id: string | null) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  theme: 'dark',
  toggleTheme: () => set((state) => ({
    theme: state.theme === 'light' ? 'dark' : 'light'
  })),
  selectedContentId: null,
  setSelectedContent: (id) => set({ selectedContentId: id }),
}));
```

### Component Organization

- **Presentational Components** - `components/` (Card, Button, Modal)
- **Feature Components** - `features/` (FeedView, SourceManager)
- **Layout Components** - `components/layout/` (Navigation, TopBar)

### Routing (Future - MVP might not need routing)
```typescript
// Using React Router
<Routes>
  <Route path="/" element={<FeedView />} />
  <Route path="/sources" element={<SourceManager />} />
  <Route path="/filters" element={<FilterBuilder />} />
  <Route path="/settings" element={<Settings />} />
  <Route path="/login" element={<Login />} />
</Routes>
```

## Deployment Architecture

### Docker Multi-Stage Build

```dockerfile
# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/frontend ./apps/frontend
COPY packages/types ./packages/types
RUN npm install -g pnpm
RUN pnpm install
RUN pnpm --filter frontend build

# Stage 2: Build backend
FROM node:20-alpine AS backend-builder
WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/backend ./apps/backend
COPY packages/types ./packages/types
RUN npm install -g pnpm
RUN pnpm install
RUN pnpm --filter backend build

# Stage 3: Production
FROM node:20-alpine
WORKDIR /app
COPY --from=backend-builder /app/apps/backend/dist ./dist
COPY --from=backend-builder /app/apps/backend/node_modules ./node_modules
COPY --from=frontend-builder /app/apps/frontend/dist ./public
COPY --from=backend-builder /app/apps/backend/prisma ./prisma

# Backend serves frontend static files
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### Single Container Deployment
- NestJS serves static frontend files via `@nestjs/serve-static`
- SQLite database file mounted as volume
- Single port (3000)
- Simple reverse proxy (Caddy/nginx) for HTTPS

```yaml
# docker-compose.yml
version: '3.8'
services:
  maifead:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data  # SQLite database persists here
    environment:
      - DATABASE_URL=file:/app/data/maifead.db
      - JWT_SECRET=${JWT_SECRET}
```

## Security Considerations

### Authentication
- Passwords hashed with Lucia (bcrypt/argon2)
- HTTP-only cookies for session tokens
- CSRF protection (NestJS built-in)
- Rate limiting on auth endpoints

### API Security
- All endpoints require authentication (except public assets)
- User-scoped data queries (prevent cross-user access)
- Input validation with Zod schemas
- SQL injection prevention (Prisma ORM)

### External Content
- Sanitize HTML from RSS feeds before rendering
- CSP headers to prevent XSS from embedded content
- Iframe sandboxing for embeds
- Image proxy for privacy (future enhancement)

## Performance Considerations

### Backend
- RSS feeds cached for 5-15 minutes (configurable)
- Parallel feed fetching with Promise.all()
- Lazy pagination for large feeds (future)
- Database indexes on frequently queried fields

### Frontend
- Virtual scrolling for long feeds (TanStack Virtual)
- Lazy image loading (IntersectionObserver)
- Code splitting (React.lazy for routes)
- Service worker caching (PWA)

### Network
- Gzip compression on API responses
- Frontend assets served with cache headers
- CDN for static assets (optional)

## Scalability Path

### Current (MVP)
- SQLite database
- Single server instance
- 5-50 users easily supported

### Future Growth
1. **Medium scale** (100-500 users)
   - Migrate to PostgreSQL
   - Add Redis for caching
   - Horizontal scaling (multiple backend instances)

2. **Large scale** (1000+ users)
   - Job queue for feed fetching (Bull/BullMQ)
   - Separate content service (microservices)
   - CDN for static assets
   - Read replicas for database

**Note:** Given self-hosted nature, scaling is low priority. Architecture supports growth if needed.

## Testing Strategy

### Backend
- Unit tests for services (Jest)
- Integration tests for API endpoints
- E2E tests for critical flows

### Frontend
- Component tests (Vitest + Testing Library)
- Integration tests for user flows
- Visual regression tests (future)

### E2E
- Playwright for full user journeys
- Run in CI/CD pipeline

## Monitoring & Observability (Future)

- **Logging**: Structured logs (Winston/Pino)
- **Metrics**: Prometheus + Grafana
- **Errors**: Sentry for error tracking
- **Analytics**: Plausible (privacy-friendly, optional)

---

This architecture balances simplicity (MVP), performance (lightweight backend), and future extensibility (can add Reddit, YouTube, advanced features).

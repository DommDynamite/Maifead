# Development Phases

## Overview

Development follows a **frontend-first approach**: build the UI with dummy data to validate UX, then build the backend to power it with real data.

**Philosophy:** Work backwards from the user experience.

---

## Phase 1: Documentation & Planning ✅

**Status:** COMPLETE

**Duration:** 1 day

### Deliverables
- [x] Project overview
- [x] Technical stack decisions
- [x] Architecture documentation
- [x] Data models specification
- [x] API specification
- [x] Frontend routes plan
- [x] Design system specification
- [x] User workflows mapping
- [x] MVP scope definition
- [x] Development phases roadmap (this document)

### Outcomes
- Clear vision of what we're building
- Technical decisions made and documented
- Shared understanding of scope and goals
- Reference docs for entire development process

---

## Phase 2: Frontend POC with Dummy Data

**Goal:** Build a fully interactive, beautiful UI with mock RSS data to validate the UX before touching the backend.

**Duration:** 3-4 days (part-time) / 1.5-2 days (full-time)

---

### 2.1: Project Setup

**Duration:** 2 hours

**Tasks:**
- [x] Create monorepo structure
  ```
  maifead/
  ├── apps/
  │   └── frontend/
  ├── packages/
  │   └── types/
  ├── docs/
  └── pnpm-workspace.yaml
  ```
- [x] Initialize frontend app with Vite + React + TypeScript
- [x] Configure pnpm workspace
- [x] Install core dependencies:
  - React Router
  - Styled Components
  - TanStack Query
  - Zustand
  - Framer Motion
  - Lucide React (icons)
- [x] Setup ESLint + Prettier
- [x] Create basic folder structure
- [x] Configure TypeScript (strict mode)
- [x] Test dev server runs

**Validation:**
- `pnpm dev` starts dev server
- TypeScript compiles without errors
- Hot reload works

---

### 2.2: Design System Implementation

**Duration:** 4 hours

**Tasks:**
- [ ] Create theme tokens (colors, typography, spacing)
  - Light theme colors
  - Dark theme colors
  - Font sizes, weights, line heights
  - Spacing scale
  - Border radius, shadows
- [ ] Build Styled Components theme provider
- [ ] Create global styles
- [ ] Build theme toggle component
- [ ] Test theme switching
- [ ] Implement responsive breakpoints

**Deliverables:**
- `src/theme/theme.ts` - Theme tokens
- `src/theme/ThemeProvider.tsx` - Theme context
- `src/theme/GlobalStyles.ts` - Base styles
- `src/components/ThemeToggle.tsx` - Toggle component

**Validation:**
- Theme toggle switches colors smoothly
- Typography scales correctly
- Spacing is consistent

---

### 2.3: Dummy Data Creation

**Duration:** 1 hour

**Tasks:**
- [ ] Define `ContentItem` interface in `packages/types`
- [ ] Create mock data file with 30-50 dummy RSS items
  - Mix of sources (tech blogs, news, etc.)
  - Variety of media types (images, videos, text-only)
  - Different timestamps (today, yesterday, last week)
  - Some marked as read
- [ ] Export typed dummy data

**Deliverables:**
- `packages/types/src/content.ts` - ContentItem interface
- `apps/frontend/src/data/mockFeed.ts` - Dummy data

**Sample:**
```typescript
export const mockFeedItems: ContentItem[] = [
  {
    id: '1',
    source: {
      type: 'rss',
      name: 'CSS-Tricks',
      url: 'https://css-tricks.com/feed/',
      icon: 'https://css-tricks.com/favicon.ico',
    },
    title: 'Understanding CSS Grid Layout',
    content: {
      text: 'CSS Grid Layout is a powerful tool...',
      html: '<p>CSS Grid Layout is...</p>',
      excerpt: 'CSS Grid Layout is a powerful tool for...',
    },
    media: [
      {
        type: 'image',
        url: 'https://picsum.photos/1200/630?random=1',
        alt: 'CSS Grid example',
      }
    ],
    publishedAt: new Date('2024-03-15T10:30:00Z'),
    url: 'https://css-tricks.com/grid-layout/',
    isRead: false,
  },
  // ... 29 more
];
```

---

### 2.4: Core Components

**Duration:** 6 hours

#### Card Component (2 hours)
**File:** `src/components/Card/Card.tsx`

**Features:**
- Source metadata (icon, name, timestamp)
- Title (bold, large)
- Excerpt (truncated to 3-4 lines)
- Media display (image with lazy loading)
- Read state styling (lower opacity)
- Hover effect (lift + shadow)
- Click handler

**Props:**
```typescript
interface CardProps {
  item: ContentItem;
  onClick: () => void;
}
```

---

#### Content Modal (3 hours)
**File:** `src/components/Modal/ContentModal.tsx`

**Features:**
- Full content display (HTML rendered)
- Embedded media (images, videos)
- Scrollable content area
- Close button (X)
- Click backdrop to close
- ESC key to close
- "Open original" link
- Mark read/unread toggle
- Smooth open/close animation (Framer Motion)

**Props:**
```typescript
interface ContentModalProps {
  item: ContentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleRead: (id: string) => void;
}
```

---

#### Navigation (1 hour)
**Files:**
- `src/components/Navigation/TopNav.tsx` (desktop)
- `src/components/Navigation/BottomNav.tsx` (mobile)

**Features:**
- Logo + app name
- Route links (Feed, Sources, Settings)
- Theme toggle
- Active route highlighting
- Responsive (top nav on desktop, bottom on mobile)

---

### 2.5: Feed View Page

**Duration:** 4 hours

**File:** `src/pages/FeedView.tsx`

**Features:**
- Load dummy data from mock file
- Render list of Cards
- Virtual scrolling (TanStack Virtual)
- Click card → open modal
- Pull-to-refresh component (visual only, triggers console.log)
- Loading skeleton state
- Empty state (if no items)

**State Management:**
- Zustand store for:
  - Selected content (for modal)
  - Read/unread tracking (client-side array)
  - Theme preference

**Deliverables:**
- Feed view with 30-50 cards
- Smooth scrolling
- Modal opens/closes smoothly
- Mark as read updates UI

---

### 2.6: Mobile Responsive & Polish

**Duration:** 3 hours

**Tasks:**
- [ ] Test on mobile breakpoints (320px, 375px, 768px, 1024px, 1440px)
- [ ] Implement pull-to-refresh gesture
- [ ] Touch-friendly tap targets (min 44px)
- [ ] Bottom nav on mobile
- [ ] Card layout adjustments for small screens
- [ ] Modal full-screen on mobile
- [ ] Test with Chrome DevTools device emulation

**Deliverables:**
- Fully responsive layout
- Pull-to-refresh works
- Looks great on all screen sizes

---

### 2.7: Animations & Interactions

**Duration:** 3 hours

**Tasks:**
- [ ] Card hover effects (lift + shadow)
- [ ] Modal open/close animations
- [ ] Page transitions
- [ ] Loading skeletons
- [ ] Button hover/active states
- [ ] Theme toggle transition
- [ ] Smooth color transitions on theme change

**Libraries:**
- Framer Motion for complex animations
- CSS transitions for simple hover effects

---

### Phase 2 Completion Checklist

**Functionality:**
- [ ] Can browse 30-50 dummy feed items
- [ ] Can click card to open modal
- [ ] Can read full content in modal
- [ ] Can close modal (X, ESC, backdrop)
- [ ] Can mark as read/unread
- [ ] Can toggle light/dark theme
- [ ] Pull-to-refresh shows visual feedback
- [ ] Works on mobile and desktop

**Quality:**
- [ ] No console errors
- [ ] Smooth 60 FPS scrolling
- [ ] Animations feel polished
- [ ] Colors match design system
- [ ] Typography is readable
- [ ] Spacing is consistent
- [ ] Accessible (keyboard nav, focus states)

**Deliverables:**
- Fully interactive frontend POC
- Design system implemented
- Core components built and reusable
- Mock data in place
- **Ready for user testing/feedback before building backend**

---

## Phase 3: Backend Development

**Goal:** Build NestJS backend with RSS parsing, authentication, and API endpoints.

**Duration:** 3-4 days (part-time) / 1.5-2 days (full-time)

**Start Condition:** Frontend POC validated and UX feels good

---

### 3.1: Backend Project Setup

**Duration:** 2 hours

**Tasks:**
- [ ] Create `apps/backend` directory
- [ ] Initialize NestJS project
- [ ] Configure TypeScript
- [ ] Setup Prisma with SQLite
- [ ] Create database schema (User, FeedSource, ReadState, Session)
- [ ] Run first migration
- [ ] Install dependencies:
  - Lucia (auth)
  - rss-parser
  - Zod (validation)
  - class-validator
  - class-transformer
- [ ] Configure CORS for frontend URL
- [ ] Test dev server runs

**Validation:**
- `pnpm --filter backend dev` starts NestJS
- Prisma generates client successfully
- Database file created

---

### 3.2: Authentication Module

**Duration:** 4 hours

**Tasks:**
- [ ] Setup Lucia auth with Prisma adapter
- [ ] Create AuthModule, AuthController, AuthService
- [ ] Implement endpoints:
  - POST `/auth/register`
  - POST `/auth/login`
  - POST `/auth/logout`
  - GET `/auth/me`
- [ ] Password hashing (Lucia built-in)
- [ ] Session management
- [ ] Auth guard (protect routes)
- [ ] Input validation (Zod DTOs)

**Deliverables:**
- Auth endpoints working
- Sessions persist in database
- HTTP-only cookies set correctly

**Testing:**
- Register user → Success
- Login → Session created
- Access protected route → Works
- Logout → Session cleared

---

### 3.3: Feed Sources Module

**Duration:** 3 hours

**Tasks:**
- [ ] Create FeedsModule, FeedsController, FeedsService
- [ ] Implement endpoints:
  - GET `/feeds` - List user's feeds
  - POST `/feeds` - Add new feed
  - PATCH `/feeds/:id` - Update feed
  - DELETE `/feeds/:id` - Delete feed
  - POST `/feeds/:id/refresh` - Refresh single feed
- [ ] Feed URL validation
- [ ] Test feed fetch on add (verify it's valid RSS)
- [ ] Auto-detect feed name and icon
- [ ] User-scoped queries (only show user's own feeds)

**Deliverables:**
- CRUD operations for feed sources
- Feed validation works
- Icons auto-detected from feeds

---

### 3.4: RSS Parsing & Normalization

**Duration:** 4 hours

**Tasks:**
- [ ] Create ContentModule, ContentService
- [ ] Implement RSS fetcher using `rss-parser`
- [ ] Build normalizer to transform RSS → ContentItem
- [ ] Extract media from RSS (images, enclosures)
- [ ] Sanitize HTML content (prevent XSS)
- [ ] Handle malformed feeds gracefully
- [ ] Cache feed data (in-memory for 5-15 min)
- [ ] Parallel feed fetching (Promise.all)

**Normalizer Logic:**
```typescript
class RssNormalizer {
  normalize(feed: RSSFeed, source: FeedSource): ContentItem[] {
    return feed.items.map(item => ({
      id: generateContentId(item.link),
      source: {
        type: 'rss',
        name: feed.title,
        url: source.url,
        icon: source.icon,
      },
      title: item.title,
      content: {
        text: stripHtml(item.content),
        html: sanitizeHtml(item.content),
        excerpt: truncate(stripHtml(item.content), 200),
      },
      media: this.extractMedia(item),
      author: { name: item.creator },
      publishedAt: new Date(item.pubDate),
      url: item.link,
    }));
  }
}
```

**Deliverables:**
- RSS feeds parsed correctly
- Content normalized to ContentItem[]
- HTML sanitized
- Media extracted

---

### 3.5: Content API Endpoints

**Duration:** 3 hours

**Tasks:**
- [ ] Implement GET `/content` endpoint
  - Fetch all user's enabled feeds
  - Parse and normalize
  - Merge into single array
  - Sort by publishedAt
  - Attach read/saved state from database
  - Return ContentItem[]
- [ ] Implement POST `/content/:id/read`
  - Create/delete ReadState record
  - Return updated state
- [ ] Implement POST `/content/:id/save` (optional for MVP)
- [ ] Query parameters:
  - `refresh=true` to bypass cache
  - `includeRead=false` to filter out read items
  - `search=keyword` for client-side filtering

**Deliverables:**
- Content endpoint returns unified feed
- Read state persists correctly
- Performance is acceptable (< 2s for 10 feeds)

---

### 3.6: User Preferences Module

**Duration:** 2 hours

**Tasks:**
- [ ] Create UserPreferences model in Prisma
- [ ] Default preferences on user registration
- [ ] Implement endpoints:
  - GET `/preferences`
  - PATCH `/preferences`
- [ ] Store theme preference
- [ ] Other preferences (for future use)

**Deliverables:**
- Preferences persist in database
- Frontend can save/load theme

---

### 3.7: Error Handling & Validation

**Duration:** 2 hours

**Tasks:**
- [ ] Global exception filter
- [ ] Consistent error response format
- [ ] Zod validation for all inputs
- [ ] Rate limiting on auth endpoints
- [ ] Feed fetch error handling
- [ ] Helpful error messages

**Error Response Format:**
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email format" }
  ],
  "timestamp": "2024-03-15T10:30:00Z",
  "path": "/api/auth/register"
}
```

---

### Phase 3 Completion Checklist

**Functionality:**
- [ ] Users can register and log in
- [ ] Sessions persist across requests
- [ ] Users can add RSS feeds
- [ ] Users can list/update/delete feeds
- [ ] Content endpoint returns normalized feed
- [ ] Read state persists
- [ ] Preferences persist (theme)

**Quality:**
- [ ] All endpoints have proper validation
- [ ] Error responses are helpful
- [ ] User-scoped queries prevent data leaks
- [ ] Passwords are hashed
- [ ] CORS configured correctly
- [ ] Rate limiting active

**Performance:**
- [ ] Content endpoint responds in < 2s (10 feeds)
- [ ] Feed parsing handles 50+ items
- [ ] Caching reduces redundant fetches

---

## Phase 4: Frontend-Backend Integration

**Goal:** Connect the frontend POC to the real backend API.

**Duration:** 2 days (part-time) / 1 day (full-time)

---

### 4.1: API Client Setup

**Duration:** 2 hours

**Tasks:**
- [ ] Create axios client with base URL
- [ ] Configure credentials: true (cookies)
- [ ] Add request/response interceptors
- [ ] Handle 401 (redirect to login)
- [ ] Setup TanStack Query
- [ ] Create query hooks for all endpoints

**Files:**
- `apps/frontend/src/api/client.ts`
- `apps/frontend/src/api/queries.ts`
- `apps/frontend/src/api/mutations.ts`

**Example Query:**
```typescript
export const useContent = () => {
  return useQuery({
    queryKey: ['content'],
    queryFn: async () => {
      const { data } = await apiClient.get<GetContentResponse>('/content');
      return data.items;
    },
    staleTime: 5 * 60 * 1000,
  });
};
```

---

### 4.2: Replace Dummy Data

**Duration:** 3 hours

**Tasks:**
- [ ] Update FeedView to use `useContent()` hook
- [ ] Replace mock data with real API data
- [ ] Implement refresh functionality (call API)
- [ ] Update read state mutations
- [ ] Add error handling (display errors)
- [ ] Add loading states

**Changes:**
- Remove `mockFeed.ts`
- Update components to handle API loading/error states
- Wire up refresh button to API call

---

### 4.3: Authentication Flow

**Duration:** 2 hours

**Tasks:**
- [ ] Create Login page
- [ ] Create Register page
- [ ] Implement login form with validation
- [ ] Implement register form with validation
- [ ] Add protected route guard
- [ ] Redirect after login
- [ ] Handle session expiration

**Deliverables:**
- Login/register pages
- Auth flow working end-to-end
- Protected routes enforce auth

---

### 4.4: Feed Management UI

**Duration:** 3 hours

**Tasks:**
- [ ] Create Sources page (`/sources`)
- [ ] List feeds from API
- [ ] Add feed form
- [ ] Delete feed with confirmation
- [ ] Enable/disable feed toggle
- [ ] Show fetch errors
- [ ] Manual refresh single feed

**Deliverables:**
- Full CRUD for feeds
- UI updates optimistically
- Errors displayed clearly

---

### 4.5: User Preferences Integration

**Duration:** 1 hour

**Tasks:**
- [ ] Load theme from API on login
- [ ] Save theme to API on toggle
- [ ] Sync with localStorage (instant on load)

---

### 4.6: Bug Fixes & Polish

**Duration:** 4 hours

**Tasks:**
- [ ] Fix CORS issues
- [ ] Fix session cookie issues
- [ ] Handle edge cases (empty feeds, error states)
- [ ] Improve loading states
- [ ] Test all user flows end-to-end
- [ ] Fix any console errors
- [ ] Performance optimization

---

### Phase 4 Completion Checklist

**Functionality:**
- [ ] Full auth flow works (register, login, logout)
- [ ] Can add real RSS feeds
- [ ] Feed view shows real content from APIs
- [ ] Can read articles (modal)
- [ ] Read state persists to database
- [ ] Can delete/disable feeds
- [ ] Theme persists across sessions
- [ ] Refresh updates content

**Quality:**
- [ ] No console errors
- [ ] Errors display user-friendly messages
- [ ] Loading states show during API calls
- [ ] Optimistic updates work
- [ ] Session persists across page refreshes

---

## Phase 5: Docker & Deployment

**Goal:** Containerize app for easy self-hosting.

**Duration:** 1 day

---

### 5.1: Docker Configuration

**Duration:** 3 hours

**Tasks:**
- [ ] Create multi-stage Dockerfile
  - Stage 1: Build frontend (Vite)
  - Stage 2: Build backend (NestJS)
  - Stage 3: Production (serve both)
- [ ] Backend serves frontend static files
- [ ] Create docker-compose.yml
- [ ] Configure environment variables
- [ ] SQLite volume mount
- [ ] Test build and run

**Files:**
- `Dockerfile`
- `docker-compose.yml`
- `.dockerignore`
- `.env.example`

---

### 5.2: Documentation

**Duration:** 2 hours

**Tasks:**
- [ ] README.md with:
  - Project description
  - Features list
  - Installation instructions (Docker)
  - Development setup
  - Environment variables
  - Troubleshooting
- [ ] Self-hosting guide
- [ ] Contributing guidelines (if open-source)

---

### 5.3: Testing & Validation

**Duration:** 2 hours

**Tasks:**
- [ ] Test Docker build
- [ ] Test Docker Compose up
- [ ] Test on clean machine (VM or friend's computer)
- [ ] Verify all features work
- [ ] Load test (100+ items)
- [ ] Cross-browser testing
- [ ] Mobile device testing

---

### Phase 5 Completion Checklist

**Docker:**
- [ ] `docker-compose up` starts app
- [ ] Frontend accessible at http://localhost:3000
- [ ] Backend API works
- [ ] Database persists (volume mounted)
- [ ] Environment variables work

**Documentation:**
- [ ] README is clear and comprehensive
- [ ] Setup instructions work for new users
- [ ] Screenshots included

**Quality:**
- [ ] App works on fresh install
- [ ] No hardcoded values (env vars used)
- [ ] Logs are clear and helpful

---

## Phase 6: MVP Testing & Iteration

**Goal:** Use the app daily, gather feedback, fix issues.

**Duration:** 1-2 weeks

---

### 6.1: Personal Use Testing

**Tasks:**
- [ ] Use app daily for 1-2 weeks
- [ ] Add 10-20 real RSS feeds
- [ ] Note any frustrations or bugs
- [ ] Track feature wishes
- [ ] Monitor performance

---

### 6.2: Friend Testing

**Tasks:**
- [ ] Share with 2-3 friends
- [ ] Help them self-host
- [ ] Gather feedback
- [ ] Fix critical bugs
- [ ] Improve documentation based on their questions

---

### 6.3: Iteration

**Based on feedback:**
- [ ] Fix bugs
- [ ] Improve unclear UX
- [ ] Add small quality-of-life features
- [ ] Optimize performance
- [ ] Update documentation

---

### Phase 6 Completion Criteria

- **Personal:** Using daily without frustration
- **Friends:** At least 1-2 friends successfully self-hosting
- **Stability:** No critical bugs
- **Performance:** Fast enough for daily use
- **Documentation:** Clear enough for others to set up

---

## Post-MVP: Future Phases

### Phase 7: Enhanced RSS Reader
- Saved items / bookmarks
- Advanced filtering (boolean logic, regex)
- Mark all as read
- OPML import/export
- Full PWA (offline support, service worker)
- Auto-refresh (background polling)
- Keyboard shortcuts
- Better error recovery

### Phase 8: Multi-Source Aggregation
- Reddit integration
- YouTube integration
- Twitter/X integration
- Mastodon integration
- Feed categories/folders
- Content deduplication
- Cross-source search

### Phase 9: Community Features
- Multi-user improvements
- Share feeds between users
- Public feed discovery
- Feed recommendations
- Comments/annotations
- Social features

---

## Development Best Practices

Throughout all phases:

### Code Quality
- Write clean, readable code
- Add comments for complex logic
- Use TypeScript strictly
- Follow consistent naming conventions
- Keep components small and focused

### Version Control
- Commit often with clear messages
- Use feature branches for major work
- Tag releases (v0.1.0, v0.2.0, etc.)

### Testing (Future)
- Unit tests for utilities
- Integration tests for API endpoints
- E2E tests for critical flows
- Manual testing on each deploy

### Performance
- Monitor bundle size
- Lazy load routes and images
- Use React.memo for expensive components
- Profile with React DevTools

### Accessibility
- Test with keyboard only
- Test with screen reader
- Ensure color contrast
- Add ARIA labels where needed

---

## Success Metrics

### MVP Success
- ✅ App works end-to-end
- ✅ Deployed and usable by friends
- ✅ No critical bugs
- ✅ Pleasant to use daily
- ✅ Faster than visiting individual sites

### Long-term Success
- Active daily use for 3+ months
- Friends continue using it
- Positive feedback on UX
- Consider open-sourcing
- Community contributions

---

## Timeline Summary

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| 1. Documentation | 1 day | This doc! ✅ |
| 2. Frontend POC | 3-4 days | Interactive UI with dummy data |
| 3. Backend | 3-4 days | NestJS API + RSS parsing |
| 4. Integration | 2 days | Frontend ↔ Backend connected |
| 5. Docker | 1 day | Containerized, documented |
| 6. Testing | 1-2 weeks | Validated, polished MVP |

**Total: ~2-3 weeks part-time, or ~1 week full-time**

---

This phased approach reduces risk, allows for iteration, and ensures we build something that feels great to use!

# MVP Scope

## MVP Definition

The **Minimum Viable Product (MVP)** is the simplest version of Maifead that delivers core value: a beautiful, unified interface for reading RSS feeds without algorithmic distractions.

**Goal:** Validate the concept with a fully functional RSS reader that feels polished and delightful to use.

---

## ✅ In Scope for MVP

### Core Features

#### 1. Authentication
- [x] User registration (email + password)
- [x] User login (email + password)
- [x] Session management (Lucia + HTTP-only cookies)
- [x] Logout
- [x] "Remember me" functionality
- [x] Password strength validation

**Out of scope:**
- OAuth (Google, GitHub login) - Phase 2
- Password reset/recovery - Phase 2
- Email verification - Phase 2

---

#### 2. Feed Management
- [x] Add RSS feed by URL
- [x] Auto-detect feed name and icon from feed metadata
- [x] List all user's feeds
- [x] Enable/disable feeds
- [x] Delete feeds
- [x] Show last fetched time
- [x] Show fetch errors (if feed is broken)
- [x] Manual refresh for individual feed

**Out of scope:**
- Auto-discover feeds from blog homepage - Phase 2
- Import/export OPML - Phase 2
- Feed categories/folders - Phase 2
- Custom feed refresh intervals - Phase 2
- Feed health monitoring/notifications - Phase 2

---

#### 3. Content Aggregation
- [x] Fetch content from all enabled RSS feeds
- [x] Normalize to unified ContentItem format
- [x] Parse feed metadata (title, link, description, image, author, date)
- [x] Extract media (images, videos, audio from RSS enclosures)
- [x] Sanitize HTML content (prevent XSS)
- [x] Sort content chronologically (newest first)
- [x] Manual refresh all feeds

**Out of scope:**
- Reddit API integration - Phase 2+
- YouTube API integration - Phase 2+
- Twitter/social media - Phase 3+
- Auto-refresh (background polling) - Phase 2
- Smart content deduplication - Phase 2

---

#### 4. Content Display (Feed View)
- [x] Card-based feed layout
- [x] Display: source icon, name, timestamp, title, excerpt, media
- [x] Virtual scrolling for performance (TanStack Virtual)
- [x] Lazy-load images (IntersectionObserver)
- [x] Responsive layout (mobile & desktop)
- [x] Empty state (no feeds configured)
- [x] Loading state (skeleton cards)
- [x] Pull-to-refresh on mobile

**Out of scope:**
- Grid layout view - Phase 2
- Magazine layout view - Phase 2
- Infinite scroll - Phase 2 (pagination first)
- Swipe gestures (mark as read, save) - Phase 2
- Compact/comfortable/cozy density options - Phase 2

---

#### 5. Content Reading (Modal)
- [x] Click card to open modal
- [x] Display full content (HTML rendered)
- [x] Display embedded media (images, videos, iframes)
- [x] Scroll within modal
- [x] Close modal (X button, ESC key, click backdrop)
- [x] "Open original" link to source
- [x] Auto-mark as read on open

**Out of scope:**
- Previous/Next navigation within modal - Phase 2
- Reader mode (simplified text view) - Phase 2
- Text-to-speech - Phase 3+
- Print/PDF export - Phase 3+
- Comments/annotations - Phase 3+

---

#### 6. Read State Management
- [x] Mark item as read (automatic on open)
- [x] Mark item as unread (manual toggle)
- [x] Visual indication (lower opacity, badge)
- [x] Persist read state in database

**Out of scope:**
- "Mark all as read" - Phase 2
- "Show/hide read items" filter - Phase 2
- Read state sync across devices - Phase 2
- Read state expiration (auto-delete old read states) - Phase 2

---

#### 7. User Preferences
- [x] Theme toggle (light/dark)
- [x] Persist theme preference (backend + localStorage)

**Out of scope:**
- Items per page setting - Phase 2
- Auto-mark as read setting - Phase 2
- Default sort order - Phase 2
- Language selection - Phase 3+
- Font size customization - Phase 3+
- Custom accent color - Phase 3+

---

#### 8. Design & UX
- [x] Beautiful, minimal design (Obsidian-inspired)
- [x] Dark theme (default)
- [x] Light theme
- [x] Responsive layout (mobile, tablet, desktop)
- [x] Smooth animations and transitions
- [x] Loading states (skeletons)
- [x] Error states (friendly messages)
- [x] Empty states (helpful CTAs)
- [x] Accessible (keyboard navigation, ARIA labels, color contrast)

**Out of scope:**
- Custom themes - Phase 3+
- Animations on/off toggle - Phase 2
- Accessibility settings (high contrast, reduce motion) - Phase 2

---

#### 9. Mobile Experience
- [x] Responsive design (works on all screen sizes)
- [x] Touch-friendly targets (min 44px)
- [x] Bottom navigation bar (mobile)
- [x] Pull-to-refresh gesture
- [x] PWA manifest (installable)

**Out of scope:**
- Full PWA (offline support, service worker) - Phase 2
- Push notifications - Phase 3+
- Native app (React Native) - Phase 3+
- Swipe gestures for actions - Phase 2

---

#### 10. Performance
- [x] Virtual scrolling for long feeds
- [x] Lazy image loading
- [x] TanStack Query caching (5 min stale time)
- [x] Backend feed caching (5-15 min)
- [x] Code splitting (lazy load routes)

**Out of scope:**
- Advanced caching strategies (Redis) - Phase 2
- CDN for static assets - Production deployment
- Image optimization/resizing - Phase 2
- Service worker caching - Phase 2

---

### Technical Requirements

#### Frontend
- [x] React 18+ with TypeScript
- [x] Vite build tool
- [x] Styled Components (theming)
- [x] TanStack Query (server state)
- [x] Zustand (UI state)
- [x] shadcn/ui (select components)
- [x] Framer Motion (animations)
- [x] React Router (routing)

#### Backend
- [x] NestJS with TypeScript
- [x] SQLite database
- [x] Prisma ORM
- [x] Lucia authentication
- [x] rss-parser (feed parsing)
- [x] Input validation (Zod)
- [x] CORS configuration
- [x] Rate limiting (basic)

#### DevOps
- [x] Monorepo (pnpm workspaces)
- [x] Shared types package
- [x] Docker support (Dockerfile)
- [x] Docker Compose (local development)

**Out of scope:**
- CI/CD pipeline - Phase 2
- Automated testing (unit, integration, e2e) - Phase 2
- Monitoring/logging (Sentry, Prometheus) - Phase 2
- Production deployment - After MVP validation

---

## ❌ Out of Scope for MVP

### Features Deferred to Phase 2+

#### Content Sources
- Reddit integration (subreddits, user posts)
- YouTube integration (channels, playlists)
- Twitter/X integration
- Mastodon integration
- Instagram integration
- Any other social media platforms

#### Advanced Filtering
- Boolean filter logic (AND/OR)
- Regex-based filters
- Filter builder UI
- Saved filter presets
- Tag-based filtering
- Source-based filtering (beyond simple search)

#### Content Management
- Save for later / bookmarks
- Saved items view
- Folders/categories for organizing feeds
- Tags (user-added or auto-extracted)
- Export content (JSON, Markdown, etc.)

#### Advanced Reading Features
- Reader mode (text-only view)
- Font customization
- Text-to-speech
- Translation
- Highlights/annotations
- Share to other apps

#### Social Features
- Share items with other users
- Comments on items
- Collaborative feeds
- Feed recommendations

#### Automation
- Auto-refresh (background polling)
- Smart notifications (new items from favorite sources)
- IFTTT/Zapier integration
- Email digests

#### Administration
- Multi-user management (admin panel)
- User analytics
- Feed health dashboard
- Content moderation tools

---

## MVP Success Criteria

### Functional Requirements (Must Have)
1. ✅ User can register and log in
2. ✅ User can add at least 5-10 RSS feeds successfully
3. ✅ User can view unified feed with content from all sources
4. ✅ User can click to read full articles
5. ✅ Read state persists across sessions
6. ✅ Works on mobile and desktop
7. ✅ Theme toggle works and persists

### Non-Functional Requirements (Must Have)
1. ✅ Feed loads in < 2 seconds with 500 items
2. ✅ No critical bugs (app doesn't crash)
3. ✅ Responsive on screens 320px - 2560px wide
4. ✅ Accessible via keyboard navigation
5. ✅ WCAG 2.1 AA color contrast compliance

### User Experience (Should Have)
1. ✅ Interface feels fast and responsive
2. ✅ Design is clean and not cluttered
3. ✅ First-time user can add feed and read content within 2 minutes
4. ✅ Feels pleasant to use daily

### Validation Metrics
- **Personal use test:** Use daily for 2 weeks without major frustrations
- **Friend test:** 2-3 friends can successfully self-host and use
- **Technical validation:** No major performance issues with 20 feeds, 1000 items

---

## MVP Feature Priority

### P0 (Critical - Must have)
- User authentication
- Add RSS feeds
- View unified feed
- Read full content in modal
- Mark as read
- Mobile responsive
- Light/dark theme

### P1 (Important - Should have)
- Pull-to-refresh
- Virtual scrolling
- Loading/error states
- Delete feeds
- Enable/disable feeds
- Basic keyword search (client-side)

### P2 (Nice to have - Could defer)
- Empty states with helpful CTAs
- Toast notifications
- Smooth animations
- PWA manifest
- Feed icons auto-detection

---

## Post-MVP Roadmap Glimpse

### Phase 2 (Enhanced RSS Reader)
- Saved items
- Advanced filtering
- Mark all as read
- OPML import/export
- Full PWA (offline support)
- Auto-refresh
- Keyboard shortcuts
- Better error recovery

### Phase 3 (Multi-Source Aggregation)
- Reddit integration
- YouTube integration
- Twitter/X integration
- Feed categories/folders
- Content deduplication

### Phase 4 (Community & Sharing)
- Multi-user improvements
- Share feeds between users
- Public feed discovery
- Feed recommendations
- Social features

---

## Development Time Estimate

### Frontend POC (Dummy Data)
- Setup: 2 hours
- Design system: 4 hours
- Components (Card, Modal, Nav): 6 hours
- Feed view with interactions: 4 hours
- Mobile responsive: 3 hours
- Polish: 3 hours
**Total: ~22 hours (3-4 days part-time)**

### Backend Development
- NestJS setup + Auth: 6 hours
- Database schema + Prisma: 3 hours
- Feed parsing + normalization: 6 hours
- API endpoints: 6 hours
- Testing: 4 hours
**Total: ~25 hours (3-4 days part-time)**

### Integration
- Connect frontend to backend: 4 hours
- Bug fixes: 6 hours
- End-to-end testing: 4 hours
**Total: ~14 hours (2 days part-time)**

### Docker & Deployment
- Dockerfile + Docker Compose: 3 hours
- Documentation: 2 hours
**Total: ~5 hours (1 day part-time)**

---

**Grand Total: ~66 hours (~10-12 days part-time or ~2 weeks)**

---

## MVP Acceptance Checklist

Before considering MVP complete:

### Functionality
- [ ] User can register a new account
- [ ] User can log in with email/password
- [ ] User can add RSS feed by URL
- [ ] User can see list of their feeds
- [ ] User can delete a feed
- [ ] User can view unified feed from all sources
- [ ] User can click card to read full content
- [ ] User can close modal and return to feed
- [ ] Items auto-mark as read when opened
- [ ] User can manually toggle read/unread
- [ ] User can refresh feed (button + pull gesture)
- [ ] User can toggle light/dark theme
- [ ] Theme preference persists

### Quality
- [ ] No JavaScript errors in console
- [ ] Works in Chrome, Firefox, Safari
- [ ] Works on iPhone, Android, tablet, desktop
- [ ] All interactive elements have hover/focus states
- [ ] Keyboard navigation works throughout
- [ ] Screen reader can navigate app
- [ ] Loading states show for async operations
- [ ] Error messages are helpful and clear
- [ ] Empty states provide clear next steps

### Performance
- [ ] Feed view loads in < 2 seconds
- [ ] Scrolling is smooth (60 FPS)
- [ ] Images lazy-load properly
- [ ] Modal opens/closes smoothly
- [ ] No memory leaks during extended use

### Documentation
- [ ] README with setup instructions
- [ ] Docker setup documented
- [ ] API endpoints documented
- [ ] Code comments for complex logic

---

This MVP scope balances ambition with pragmatism, delivering a usable product while leaving room for growth.

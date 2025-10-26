# Frontend Routes & Navigation

## Overview
Maifead uses a single-page application (SPA) architecture with React Router for client-side routing. The interface is optimized for both desktop and mobile with adaptive navigation.

---

## Route Structure

### Public Routes (Unauthenticated)

#### `/login`
**Purpose:** User authentication

**Components:**
- LoginForm
- Link to `/register`

**Features:**
- Email/password form
- "Remember me" checkbox (longer session)
- Password visibility toggle
- Error messaging
- Redirect to `/` after successful login

---

#### `/register`
**Purpose:** New user signup

**Components:**
- RegisterForm
- Link to `/login`

**Features:**
- Email, password, optional name fields
- Password strength indicator
- Form validation
- Terms of service acceptance
- Redirect to `/` after successful registration

---

### Protected Routes (Authenticated)

All routes below require authentication. Redirect to `/login` if not authenticated.

#### `/` (Home/Feed View)
**Purpose:** Main content feed

**Components:**
- FeedView
- CardList
- ContentCard (repeated)
- ContentModal (overlay)
- RefreshButton
- FilterBar (future)

**URL Parameters:**
- None for MVP (future: `?filter=`, `?source=`, `?page=`)

**Features:**
- Displays unified feed (all sources, chronological)
- Virtual scrolling for performance
- Pull-to-refresh on mobile
- Click card → open modal with full content
- Floating refresh button (desktop) or pull gesture (mobile)
- Empty state if no feeds configured

**State:**
- Content items (from API)
- Selected content (for modal)
- Scroll position (restore on back navigation)

---

#### `/sources`
**Purpose:** Manage feed sources

**Components:**
- SourceList
- SourceCard (per feed)
- AddSourceForm
- TestFeedModal

**Features:**
- List all user's feed sources
- Add new RSS feed by URL
- Test feed before adding (preview items)
- Enable/disable feeds without deleting
- Edit feed name/icon
- Delete feed (with confirmation)
- Show last fetched time & error status
- Empty state with "Add your first feed" CTA

**State:**
- Feed sources (from API)
- Add/edit modal state

---

#### `/filters` (Future Phase)
**Purpose:** Create and manage filter rules

**Components:**
- FilterList
- FilterBuilder
- FilterPreview

**Features:**
- Create custom filter rules
- Boolean logic (AND/OR)
- Keyword, regex, source-based filters
- Preview filtered results
- Save filter presets
- Enable/disable filters

---

#### `/saved` (Future Phase)
**Purpose:** View saved items

**Components:**
- SavedItemsList (similar to FeedView)

**Features:**
- List of items marked as "saved"
- Same card interface as main feed
- Remove from saved

---

#### `/settings`
**Purpose:** User preferences and account settings

**Components:**
- SettingsForm
- ThemeToggle
- AccountSection
- DangerZone (delete account)

**Sections:**

**Appearance:**
- Theme toggle (light/dark)
- Language selector (future)
- Items per page
- Font size (future)

**Behavior:**
- Auto-mark as read
- Show/hide read items
- Default sort order

**Account:**
- Change email
- Change password
- Export data (future)

**Danger Zone:**
- Delete all read items
- Delete account

---

### Modal Routes (Overlays, not URL routes)

#### Content Modal
**Trigger:** Click any content card

**URL:** No URL change (modal overlay)

**Components:**
- ModalContainer
- ContentBody (full HTML rendering)
- MediaViewer (images, videos, embeds)
- ActionButtons (mark read/unread, save, open original)

**Features:**
- Full content display
- Embedded media (lazy-loaded)
- Scroll within modal
- Close with X, ESC key, or click outside
- Auto-mark as read on open
- "Open original" link to source
- Previous/Next buttons (navigate within feed)

**Accessibility:**
- Trap focus within modal
- ARIA labels
- Keyboard navigation

---

## Navigation Structure

### Desktop Navigation (Top Bar)

```
┌────────────────────────────────────────────────────────┐
│ [Logo] Maifead    [Feed] [Sources] [Settings]   [Theme Toggle] [User Menu] │
└────────────────────────────────────────────────────────┘
```

**Components:**
- App logo (clickable, goes to `/`)
- Navigation links (Feed, Sources, Settings)
- Theme toggle button
- User menu dropdown (profile, logout)

**Styling:**
- Fixed position (stays at top when scrolling)
- Semi-transparent background with backdrop blur
- Active route highlighted

---

### Mobile Navigation (Bottom Bar)

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│                   (Content Area)                       │
│                                                        │
└────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────┐
│  [Feed Icon]  [Sources Icon]  [Filters Icon]  [Settings Icon]  │
└────────────────────────────────────────────────────────┘
```

**Components:**
- Bottom nav bar (fixed)
- Icons with labels
- Active route highlighted
- Badge on Feed icon (unread count)

**Breakpoint:** `< 768px` switches to bottom nav

---

## Route Guards & Redirects

### Authentication Guard

```typescript
// apps/frontend/src/components/ProtectedRoute.tsx
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { data: user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
```

### Redirect Logic

| From | To | Condition |
|------|-----|-----------|
| `/login` | `/` | Already authenticated |
| `/register` | `/` | Already authenticated |
| Any protected route | `/login` | Not authenticated |
| `/` | `/sources` | No feeds configured (first-time user) |

---

## Route Configuration

```typescript
// apps/frontend/src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<FeedView />} />
          <Route path="/sources" element={<SourceManager />} />
          <Route path="/settings" element={<Settings />} />

          {/* Future routes */}
          <Route path="/filters" element={<FilterBuilder />} />
          <Route path="/saved" element={<SavedItems />} />
        </Route>

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### Protected Layout

```typescript
// apps/frontend/src/components/ProtectedLayout.tsx
const ProtectedLayout = () => {
  return (
    <ProtectedRoute>
      <ThemeProvider>
        <Navigation /> {/* Top or bottom nav based on screen size */}
        <main>
          <Outlet /> {/* Nested routes render here */}
        </main>
      </ThemeProvider>
    </ProtectedRoute>
  );
};
```

---

## URL Parameters & Query Strings

### MVP (Simple)
No query parameters initially. State managed in React.

### Future Enhancement

#### `/` (Feed View)
```
/?filter=keyword:TypeScript
/?source=rss:uuid-123
/?page=2
/?view=grid
```

**Parameters:**
- `filter` - Filter rule ID or inline keyword
- `source` - Show only specific source
- `page` - Pagination
- `view` - Layout mode (list, grid, magazine)

#### `/sources`
```
/sources?add=https://example.com/feed.xml
```

**Parameters:**
- `add` - Pre-fill add feed form (from browser extension)

#### `/settings`
```
/settings?tab=appearance
/settings?tab=account
```

**Parameters:**
- `tab` - Open specific settings section

---

## Deep Linking (Future)

### Share Specific Content
```
/content/:contentId
```

**Example:** `/content/abc123`

**Behavior:**
- Show feed view with that item's modal open
- If not in user's feed, show "Not found" or "Add this source?"

### Share Filter
```
/filter/:filterId
```

**Example:** `/filter/uuid-123`

**Behavior:**
- Open feed view with that filter applied
- If filter not found, show error

---

## Navigation Patterns

### Breadcrumbs (Desktop)
Not needed for MVP (flat structure). Future consideration for nested views.

### Back Button Behavior
- Browser back button works as expected (React Router handles)
- Modal close → doesn't change URL → no back button needed
- Mobile: Hardware back button closes modal if open

### Scroll Restoration
```typescript
// React Router config
<BrowserRouter>
  <ScrollRestoration />
  {/* routes */}
</BrowserRouter>
```

**Behavior:**
- Navigating away from feed → scroll position saved
- Returning to feed → scroll restored
- Opening modal → scroll position preserved

---

## Loading & Error States

### Route-Level Loading
```typescript
// Suspense boundaries for lazy-loaded routes
<Suspense fallback={<PageSkeleton />}>
  <Route path="/sources" element={<SourceManager />} />
</Suspense>
```

### Error Boundaries
```typescript
// apps/frontend/src/components/ErrorBoundary.tsx
<ErrorBoundary fallback={<ErrorPage />}>
  <App />
</ErrorBoundary>
```

**Error Page:**
- Friendly message
- "Go to Home" button
- "Report issue" link

---

## Mobile-Specific Routing

### Swipe Navigation (Future)
- Swipe right on feed → open filters panel
- Swipe left on feed → open sources panel
- Configurable in settings

### Pull-to-Refresh
- Only on `/` (feed view)
- Not on `/sources`, `/settings`

---

## Analytics & Tracking (Future)

Track route changes for understanding user behavior:

```typescript
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

function RouteTracker() {
  const location = useLocation();

  useEffect(() => {
    // Privacy-friendly analytics (Plausible/Umami)
    trackPageView(location.pathname);
  }, [location]);
}
```

---

## Route Transitions (Polish)

### Page Transitions
```typescript
// Using Framer Motion
<AnimatePresence mode="wait">
  <motion.div
    key={location.pathname}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.2 }}
  >
    <Outlet />
  </motion.div>
</AnimatePresence>
```

### Modal Transitions
```typescript
<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
    >
      <Modal />
    </motion.div>
  )}
</AnimatePresence>
```

---

## Routing Best Practices

1. **Shallow Routing for Modals** - Don't change URL for modal overlays
2. **Preserve Scroll Position** - Save/restore when navigating
3. **Optimistic Navigation** - Start transition before data loads
4. **Prefetch on Hover** - Prefetch route data on nav link hover
5. **Loading Skeletons** - Show skeleton UI while route loads
6. **Keyboard Shortcuts** - `g + f` → Feed, `g + s` → Sources, etc.

---

## Accessibility

### Skip Links
```html
<a href="#main-content" className="skip-link">
  Skip to main content
</a>
```

### Focus Management
- Focus first heading on route change
- Trap focus in modals
- Clear focus outline on click, show on keyboard nav

### ARIA Labels
```html
<nav aria-label="Main navigation">
  <a href="/" aria-current={isActive ? 'page' : undefined}>
    Feed
  </a>
</nav>
```

---

## Route Summary Table

| Route | Auth Required | Desktop Nav | Mobile Nav | Purpose |
|-------|---------------|-------------|------------|---------|
| `/login` | No | Hidden | Hidden | Authentication |
| `/register` | No | Hidden | Hidden | Signup |
| `/` | Yes | "Feed" | Home icon | Main feed |
| `/sources` | Yes | "Sources" | Sources icon | Manage feeds |
| `/filters` | Yes | "Filters" | Filters icon | Filter rules (future) |
| `/saved` | Yes | Dropdown | — | Saved items (future) |
| `/settings` | Yes | User menu | Settings icon | Preferences |

---

This routing structure balances simplicity (MVP) with room for growth (future features).

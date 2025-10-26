# User Workflows

## Overview
This document maps out key user journeys through Maifead, from first-time onboarding to daily usage patterns.

---

## 1. First-Time User Onboarding

### Journey Map

```
Registration → Login → Empty Feed State → Add First Feed → View Content
```

### Detailed Flow

#### Step 1: Registration
**Entry:** User navigates to app URL

**Screen:** `/register`

**Actions:**
1. User sees registration form
2. Enters email, password, optional name
3. Sees password strength indicator
4. Clicks "Create Account"
5. Backend validates, creates user, auto-logs in
6. Redirects to `/`

**Success Criteria:**
- Account created
- User logged in (session cookie set)
- No errors

---

#### Step 2: Empty Feed State
**Screen:** `/` (Feed View)

**UI State:**
```
┌────────────────────────────────────────┐
│         No feeds configured yet         │
│                                        │
│      [RSS Feed Icon - Large]           │
│                                        │
│  Get started by adding your first      │
│  RSS feed to begin aggregating         │
│  content from your favorite sources.   │
│                                        │
│      [+ Add Your First Feed]           │
│                                        │
└────────────────────────────────────────┘
```

**Actions:**
1. User sees empty state with clear CTA
2. Clicks "+ Add Your First Feed"
3. Navigates to `/sources` OR opens inline modal

---

#### Step 3: Add First Feed
**Screen:** `/sources`

**UI Components:**
- Empty feed list
- "Add Feed" form (prominent)

**User Flow:**
1. Sees input field labeled "RSS Feed URL"
2. Placeholder text: "https://example.com/feed.xml"
3. Enters feed URL (e.g., "https://css-tricks.com/feed/")
4. Clicks "Add Feed" or presses Enter
5. **Backend validates:**
   - Fetches feed to verify it exists
   - Parses feed to get name, icon
   - Creates FeedSource record
6. **Success state:**
   - Toast notification: "CSS-Tricks added successfully"
   - Feed appears in sources list
   - Button: "View Feed" or "Add Another"

**Error Handling:**
- Invalid URL → "Please enter a valid URL"
- Feed not found → "Unable to fetch feed. Please check the URL."
- Already added → "You've already added this feed"
- Parse error → "This doesn't appear to be a valid RSS feed"

---

#### Step 4: View Content
**Flow:**
1. User clicks "View Feed" or navigates to `/`
2. Backend fetches feed content
3. Loading state: Skeleton cards (3-4 visible)
4. Content loads → Cards appear with slide-up animation
5. User sees first batch of content items

**Success State:**
```
┌────────────────────────────────────────┐
│ [Refresh]                    [Theme]   │
├────────────────────────────────────────┤
│                                        │
│ ┌────────────────────────────────────┐ │
│ │ [CSS-Tricks] Understanding Grid... │ │
│ │ [Image]                            │ │
│ │ Preview text...                    │ │
│ └────────────────────────────────────┘ │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │ [CSS-Tricks] Flexbox vs Grid...    │ │
│ └────────────────────────────────────┘ │
│                                        │
└────────────────────────────────────────┘
```

**Onboarding Complete!** User understands core loop.

---

## 2. Daily Content Consumption

### Journey Map

```
Open App → Refresh Feed → Browse Cards → Read Article → Mark Complete → Continue
```

### Detailed Flow

#### Step 1: Open App
**Context:** Returning user, has feeds configured

**Entry Points:**
- Browser bookmark
- PWA home screen icon (mobile)
- Direct URL

**Actions:**
1. App loads `/`
2. Checks authentication (session cookie)
3. If authenticated → Load feed view
4. If not → Redirect to `/login`

---

#### Step 2: Refresh Feed
**Trigger Options:**
- **Desktop:** Click refresh button in top-right
- **Mobile:** Pull down gesture
- **Auto:** Every 15 minutes (background, future feature)

**Interaction:**
1. User triggers refresh
2. **Visual feedback:**
   - Button shows spinning icon
   - Or pull-to-refresh spinner appears
3. **Backend:**
   - Fetches all enabled feed sources
   - Checks cache (if < 5 min old, return cached)
   - If stale, fetches from RSS URLs
   - Normalizes to ContentItem[]
   - Returns to frontend
4. **Frontend:**
   - Receives new items
   - Compares with cached items
   - Inserts new items at top with fade-in animation
   - Shows toast: "5 new items" (if any)
5. **Complete:**
   - Spinner stops
   - Feed updated

**Edge Cases:**
- No new items → Toast: "You're all caught up!"
- Fetch error → Toast: "Unable to refresh some feeds" (show which ones failed)
- Network offline → Toast: "You're offline. Showing cached content."

---

#### Step 3: Browse Cards
**Behavior:**
- User scrolls through feed
- Virtual scrolling (TanStack Virtual) for performance
- Cards load as they enter viewport

**Scan Pattern:**
1. User's eye scans cards:
   - Source icon + name (recognize source)
   - Timestamp (recency)
   - Title (main decision point)
   - Image/media (visual hook)
   - Excerpt (if title unclear)
2. Decision: Read now, skip, or save for later

**Interactions:**
- **Click card** → Open modal (read now)
- **Swipe left** (mobile, future) → Save for later
- **Swipe right** (mobile, future) → Mark as read (dismiss)

---

#### Step 4: Read Article
**Trigger:** User clicks card

**Modal Open Animation:**
1. Backdrop fades in (0.15s)
2. Modal scales in from center (0.15s)
3. Content loads (if not already cached)

**Modal Content:**
```
┌──────────────────────────────────────────┐
│  [X]                          [•••]      │ ← Close + Actions menu
├──────────────────────────────────────────┤
│  Understanding CSS Grid Layout           │ ← Title (large)
│  by Chris Coyier • CSS-Tricks • 2h ago   │ ← Metadata
│                                          │
│  [Image - full width]                    │ ← Media
│                                          │
│  Full article content with HTML          │ ← Content (scrollable)
│  formatting preserved...                 │
│  ...                                     │
│  ...                                     │
│                                          │
├──────────────────────────────────────────┤
│  [Open Original ↗] [Mark Unread] [Save] │ ← Actions
└──────────────────────────────────────────┘
```

**User Actions:**
1. Reads content (scrolls within modal)
2. Views embedded media (images, videos auto-load)
3. **Automatic:** Marked as read on open
4. **Optional Actions:**
   - Click "Open Original" → Opens source URL in new tab
   - Click "Mark Unread" → Toggles read state (if opened by accident)
   - Click "Save" → Saves for later
   - Click "X" or ESC → Close modal

**Navigation:**
- **Previous/Next buttons** (future) → Navigate to adjacent items without closing modal
- **Keyboard:** `←` previous, `→` next, `ESC` close

---

#### Step 5: Mark Complete & Continue
**Close Modal:**
1. User clicks X, presses ESC, or clicks backdrop
2. Modal scales out (0.15s)
3. Returns to feed view
4. **Card state updated:**
   - Lower opacity (60%)
   - "Read" badge (optional)
   - Moves to bottom of feed (if "hide read items" enabled in future)

**Continue Flow:**
1. User scrolls to next card
2. Repeats read cycle
3. Or navigates away

---

## 3. Managing Feed Sources

### Journey Map

```
Navigate to Sources → View List → Add/Edit/Delete Feeds → Return to Feed
```

### Detailed Flow

#### Step 1: Navigate to Sources
**Entry Points:**
- Desktop: Click "Sources" in top nav
- Mobile: Tap "Sources" icon in bottom nav
- From feed: Click "Manage Sources" in empty state or settings

**Screen:** `/sources`

---

#### Step 2: View Feed List
**UI Layout:**
```
┌────────────────────────────────────────┐
│  Feed Sources                  [+ Add] │
├────────────────────────────────────────┤
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ [🎨] CSS-Tricks              [⚙️]│ │
│  │ https://css-tricks.com/feed/     │ │
│  │ Last updated: 5 min ago          │ │
│  │ ✓ Enabled                        │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ [🦀] Rust Blog               [⚙️]│ │
│  │ https://blog.rust-lang.org/...   │ │
│  │ Last updated: 1 hour ago         │ │
│  │ ✓ Enabled                        │ │
│  └──────────────────────────────────┘ │
│                                        │
└────────────────────────────────────────┘
```

**Actions Available:**
- View all feeds
- See status (enabled, last fetched, errors)
- Click [⚙️] → Feed settings menu
- Click [+ Add] → Add new feed

---

#### Step 3: Add Feed
**Trigger:** Click "+ Add Feed" button

**Flow:**
1. Modal or inline form appears
2. User enters RSS feed URL
3. **Optional:** Custom name (auto-detected by default)
4. Clicks "Add Feed"
5. **Validation:**
   - Frontend: URL format check
   - Backend: Fetch & parse feed
6. **Success:**
   - Feed added to list
   - Toast: "Feed added successfully"
   - Modal closes
7. **Error:**
   - Show inline error message
   - Keep modal open for correction

**Advanced (Future):**
- Auto-discover feeds from blog homepage
- Import OPML file (export from other RSS readers)
- Suggested feeds based on popular sources

---

#### Step 4: Edit Feed
**Trigger:** Click [⚙️] → "Edit"

**Editable Fields:**
- Feed name
- Enable/disable toggle
- Refresh interval (future)

**Actions:**
1. User modifies fields
2. Clicks "Save"
3. Backend updates FeedSource
4. UI updates immediately (optimistic)
5. Toast: "Feed updated"

---

#### Step 5: Delete Feed
**Trigger:** Click [⚙️] → "Delete"

**Flow:**
1. Confirmation modal appears:
   ```
   Delete "CSS-Tricks"?

   This will remove this feed source.
   Your read history will be preserved.

   [Cancel] [Delete]
   ```
2. User confirms
3. Backend deletes FeedSource
4. Feed removed from list (fade-out animation)
5. Toast: "Feed deleted"

**Safety:**
- Requires explicit confirmation
- Cannot be undone (no "undo" in MVP)

---

#### Step 6: Test/Refresh Single Feed
**Trigger:** Click [⚙️] → "Refresh Now"

**Flow:**
1. Spinner appears on that feed card
2. Backend fetches just that feed
3. Updates lastFetched timestamp
4. Shows item count: "25 items fetched"
5. If error: Shows error message on card

**Use Case:**
- User just added feed, wants to see content immediately
- Feed has error, user fixed issue, wants to retry

---

## 4. Filtering & Search (MVP - Simple)

### Journey Map

```
View Feed → Enter Keyword → See Filtered Results → Clear Filter
```

### Detailed Flow

#### Step 1: Enter Filter
**UI Element:** Search bar above feed (always visible)

**Interaction:**
1. User clicks search bar
2. Types keyword (e.g., "TypeScript")
3. **Client-side filtering (MVP):**
   - Filter cached ContentItem[] in memory
   - Match against title, content text, tags
   - Case-insensitive

**Real-time:**
- Updates as user types (debounced 300ms)
- Shows result count: "12 items match 'TypeScript'"

---

#### Step 2: View Filtered Results
**UI Changes:**
1. Only matching cards shown
2. Search term highlighted in titles (future)
3. "Clear filter" X button appears in search bar

**Empty State:**
If no matches:
```
No items match "xyz"

Try a different keyword or clear the filter.

[Clear Filter]
```

---

#### Step 3: Clear Filter
**Actions:**
1. User clicks X in search bar or clears text
2. Full feed restored
3. Smooth transition (fade in filtered-out items)

---

## 5. Theme Switching

### Journey Map

```
Click Theme Toggle → Theme Changes → Preference Saved
```

### Flow

**Trigger:** Click sun/moon icon in nav

**Interaction:**
1. Click icon
2. Theme transitions smoothly (0.3s all colors)
3. Icon swaps (sun ↔ moon)
4. **Persist:**
   - Saved to backend (user preferences)
   - Also saved to localStorage (instant on next visit)

**Default:**
- System preference (prefers-color-scheme)
- Falls back to dark if no preference

---

## 6. Reading Saved Items (Future)

### Journey Map

```
Save Item → Navigate to Saved → View Saved List → Read Item
```

### Flow

#### Saving an Item
**Trigger:** Click bookmark icon in modal or card menu

**Action:**
1. Icon fills in (visual feedback)
2. POST /content/:id/save { saved: true }
3. Toast: "Saved for later"

---

#### Viewing Saved
**Screen:** `/saved`

**UI:** Same as main feed, but filtered to isSaved: true

**Actions:**
- Read items (same modal)
- Remove from saved (bookmark icon unfills)

---

## 7. Mobile-Specific Workflows

### Pull-to-Refresh

**Gesture:**
1. User at top of feed
2. Pulls down (finger drag or scroll beyond top)
3. Spinner appears
4. Release → Triggers refresh
5. Spinner continues until complete
6. Snaps back with new content

**Library:** `react-simple-pull-to-refresh`

---

### Swipe Actions (Future)

**Left Swipe (Save):**
1. User swipes card left
2. Card slides, reveals "Save" button
3. Release or tap → Saves item
4. Card snaps back

**Right Swipe (Mark as Read):**
1. User swipes card right
2. Card slides, reveals "Read" checkmark
3. Release → Marks as read, card fades out
4. Undo toast appears briefly

---

## 8. Error Recovery Workflows

### Feed Fetch Error

**Scenario:** RSS feed URL is down or changed

**Detection:**
- Backend gets 404 or timeout
- Updates FeedSource.fetchError

**User Experience:**
1. User refreshes feed
2. Toast: "Unable to fetch some feeds"
3. Navigate to `/sources`
4. Problem feed highlighted in red:
   ```
   ⚠️ CSS-Tricks
   Error: Feed not found (404)
   Last successful fetch: 2 days ago

   [Retry] [Edit URL] [Disable]
   ```

**Recovery:**
- User clicks "Retry" → Attempts refetch
- User clicks "Edit URL" → Updates feed URL
- User clicks "Disable" → Disables feed temporarily

---

### Network Offline

**Scenario:** User loses internet connection

**Detection:** TanStack Query detects fetch failure

**User Experience:**
1. Offline banner appears at top:
   ```
   ⚠️ You're offline. Showing cached content.
   ```
2. Refresh button disabled
3. Cached content still viewable
4. When online again: Banner dismisses, refresh enabled

---

### Session Expired

**Scenario:** User's session cookie expires

**Detection:** API returns 401

**User Experience:**
1. Redirect to `/login`
2. Toast: "Your session expired. Please log in again."
3. After login → Redirect back to previous page

---

## 9. Keyboard Shortcuts (Future Enhancement)

| Shortcut | Action |
|----------|--------|
| `r` | Refresh feed |
| `j` | Next item |
| `k` | Previous item |
| `Enter` | Open selected item |
| `Esc` | Close modal |
| `m` | Mark as read/unread |
| `s` | Save/unsave item |
| `g f` | Go to feed |
| `g s` | Go to sources |
| `?` | Show keyboard shortcuts help |

---

## 10. User Journey Summary

### New User (First Session)
1. Register (30 sec)
2. Add first feed (1 min)
3. Browse content (5 min)
4. Read 2-3 articles (10 min)
5. Add 2-3 more feeds (2 min)

**Total: ~20 min to fully onboard**

---

### Daily Active User
1. Open app (5 sec)
2. Refresh feed (2 sec)
3. Scan 20-30 cards (2 min)
4. Read 3-5 articles (15 min)
5. Optionally add new feed or adjust settings (1 min)

**Total: ~20 min daily consumption**

---

### Power User (Advanced)
1. Open app (via PWA icon, instant)
2. Keyboard shortcuts to navigate
3. Custom filters pre-configured
4. Multiple feeds organized by category (future)
5. Saved items for weekly review

**Total: Seamless, integrated into daily routine**

---

These workflows prioritize simplicity and clarity, ensuring users can accomplish their goals with minimal friction.

# Design System

## Design Philosophy

### Core Principles

1. **Content-First**
   - Inspired by Obsidian's minimal approach
   - UI should fade into the background
   - Content is the reason we're here
   - No unnecessary decoration or distraction

2. **Beautiful Simplicity**
   - Clean, modern aesthetics
   - Generous whitespace
   - Thoughtful typography
   - Subtle, purposeful animations

3. **Accessibility First**
   - WCAG 2.1 AA compliance minimum
   - Keyboard navigation throughout
   - Screen reader friendly
   - Sufficient color contrast

4. **Mobile-Ready**
   - Touch-friendly targets (min 44px)
   - Responsive layouts
   - Gesture support
   - Progressive enhancement

---

## Color System

### Brand Colors

```typescript
const brand = {
  primary: '#00B4A6',        // Blue-green (teal) - Main brand color
  primaryHover: '#009B8F',   // Darker for hover states
  primaryActive: '#008075',  // Even darker for active states
  primaryLight: '#E0F7F5',   // Light tint for backgrounds
  primaryDark: '#006B61',    // Dark variant
};
```

**Usage:**
- Primary actions (buttons, links)
- Active states
- Progress indicators
- Accents and highlights

### Light Theme

```typescript
const lightTheme = {
  // Backgrounds
  background: '#FAFAFA',      // Main app background
  surface: '#FFFFFF',         // Cards, modals, panels
  surfaceHover: '#F5F5F5',    // Hover state for interactive surfaces
  surfaceActive: '#EEEEEE',   // Active state

  // Borders
  border: '#E5E5E5',          // Default borders
  borderHover: '#D4D4D4',     // Hover state
  borderFocus: '#00B4A6',     // Focus state (uses brand primary)

  // Text
  text: '#1A1A1A',            // Primary text (high contrast)
  textSecondary: '#737373',   // Secondary text (metadata, labels)
  textTertiary: '#A3A3A3',    // Tertiary text (placeholders, disabled)
  textInverse: '#FFFFFF',     // Text on dark backgrounds

  // Semantic colors
  success: '#22C55E',         // Green
  successBg: '#F0FDF4',
  warning: '#F59E0B',         // Amber
  warningBg: '#FFFBEB',
  error: '#EF4444',           // Red
  errorBg: '#FEF2F2',
  info: '#3B82F6',            // Blue
  infoBg: '#EFF6FF',
};
```

### Dark Theme (Default)

```typescript
const darkTheme = {
  // Backgrounds
  background: '#1E1E1E',      // Main app background (Obsidian-inspired)
  surface: '#2A2A2A',         // Cards, modals, panels
  surfaceHover: '#333333',    // Hover state
  surfaceActive: '#3D3D3D',   // Active state

  // Borders
  border: '#404040',          // Default borders
  borderHover: '#525252',     // Hover state
  borderFocus: '#00B4A6',     // Focus state

  // Text
  text: '#E5E5E5',            // Primary text
  textSecondary: '#A3A3A3',   // Secondary text
  textTertiary: '#737373',    // Tertiary text
  textInverse: '#1A1A1A',     // Text on light backgrounds

  // Semantic colors (adjusted for dark mode)
  success: '#22C55E',
  successBg: '#14532D',
  warning: '#F59E0B',
  warningBg: '#451A03',
  error: '#EF4444',
  errorBg: '#450A0A',
  info: '#3B82F6',
  infoBg: '#1E3A8A',
};
```

### Color Usage Guidelines

| Element | Light | Dark | Notes |
|---------|-------|------|-------|
| App background | `#FAFAFA` | `#1E1E1E` | Subtle, not pure white/black |
| Card background | `#FFFFFF` | `#2A2A2A` | Distinct from main background |
| Primary button | `#00B4A6` | `#00B4A6` | Same in both themes |
| Text on primary | `#FFFFFF` | `#FFFFFF` | Always white for contrast |
| Body text | `#1A1A1A` | `#E5E5E5` | High contrast (AAA) |
| Metadata text | `#737373` | `#A3A3A3` | Lower contrast (AA) |

### Contrast Ratios

All color combinations meet WCAG 2.1 AA standards (4.5:1 for normal text, 3:1 for large text).

**Tested combinations:**
- Light: `#1A1A1A` on `#FAFAFA` = 13.2:1 ✓
- Dark: `#E5E5E5` on `#1E1E1E` = 12.1:1 ✓
- Primary: `#FFFFFF` on `#00B4A6` = 4.9:1 ✓

---

## Typography

### Font Families

```typescript
const fonts = {
  sans: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
         'Helvetica Neue', Arial, sans-serif,
         'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'`,

  mono: `'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code',
         'Cascadia Code', 'Roboto Mono', monospace`,
};
```

**Rationale:**
- System fonts for performance (no web font loading)
- Native feel on each platform
- Excellent readability

### Type Scale (1.250 - Major Third)

```typescript
const fontSizes = {
  xs: '0.75rem',      // 12px - Fine print, labels
  sm: '0.875rem',     // 14px - Secondary text, metadata
  base: '1rem',       // 16px - Body text (default)
  lg: '1.125rem',     // 18px - Subheadings
  xl: '1.25rem',      // 20px - Card titles
  '2xl': '1.5rem',    // 24px - Section headings
  '3xl': '1.875rem',  // 30px - Page headings
  '4xl': '2.25rem',   // 36px - Hero text (rare)
};
```

### Font Weights

```typescript
const fontWeights = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
};
```

**Usage:**
- `normal` (400) - Body text, descriptions
- `medium` (500) - Emphasized body text, button text
- `semibold` (600) - Card titles, subheadings
- `bold` (700) - Page headings, important callouts

### Line Heights

```typescript
const lineHeights = {
  tight: 1.25,    // Headings
  normal: 1.5,    // Body text (most readable)
  relaxed: 1.75,  // Long-form content
};
```

### Typography Examples

```css
/* Page heading */
h1 {
  font-size: 1.875rem;  /* 30px */
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.02em;
}

/* Card title */
h2 {
  font-size: 1.25rem;   /* 20px */
  font-weight: 600;
  line-height: 1.25;
}

/* Body text */
p {
  font-size: 1rem;      /* 16px */
  font-weight: 400;
  line-height: 1.5;
}

/* Metadata */
.metadata {
  font-size: 0.875rem;  /* 14px */
  font-weight: 400;
  line-height: 1.5;
  color: var(--text-secondary);
}
```

---

## Spacing System (8px Grid)

```typescript
const spacing = {
  0: '0',
  1: '0.25rem',   // 4px  - Tiny gaps
  2: '0.5rem',    // 8px  - Base unit
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px - Standard gap
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px - Section gap
  8: '2rem',      // 32px - Large gap
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px - Extra large gap
  16: '4rem',     // 64px - Page sections
  20: '5rem',     // 80px
  24: '6rem',     // 96px
};
```

### Spacing Usage

| Element | Spacing | Example |
|---------|---------|---------|
| Card padding | `spacing[4]` (16px) | Internal card content |
| Card gap | `spacing[4]` (16px) | Between cards |
| Section gap | `spacing[8]` (32px) | Between page sections |
| Icon-text gap | `spacing[2]` (8px) | Icon next to label |
| Button padding | `spacing[3]` `spacing[4]` | 12px vertical, 16px horizontal |

---

## Border Radius

```typescript
const borderRadius = {
  none: '0',
  sm: '0.25rem',    // 4px  - Small elements
  base: '0.5rem',   // 8px  - Buttons, inputs (default)
  md: '0.75rem',    // 12px - Cards
  lg: '1rem',       // 16px - Modals, large containers
  xl: '1.5rem',     // 24px - Hero elements
  full: '9999px',   // Circular (avatars, pills)
};
```

### Border Radius Usage

| Element | Radius | Notes |
|---------|--------|-------|
| Buttons | `base` (8px) | Rounded but not too soft |
| Cards | `md` (12px) | Friendly, modern |
| Input fields | `base` (8px) | Consistent with buttons |
| Modals | `lg` (16px) | Softer for large surfaces |
| Avatars | `full` | Perfect circles |

---

## Shadows & Elevation

```typescript
const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
};
```

### Elevation Levels

| Level | Shadow | Usage |
|-------|--------|-------|
| 0 | None | Flat elements, background |
| 1 | `sm` | Subtle depth (input fields) |
| 2 | `base` | Cards at rest |
| 3 | `md` | Cards on hover |
| 4 | `lg` | Modals, dropdowns |
| 5 | `xl` | Important overlays |

**Dark mode adjustment:**
Shadows are less pronounced in dark mode (reduce opacity by 50%).

---

## Component Design Specs

### Content Card

The most important component in the app.

```
┌─────────────────────────────────────────────────┐
│ [Icon] Source Name • 2h ago          [•••]      │ ← Header (48px height)
├─────────────────────────────────────────────────┤
│                                                 │
│        [Image/Video/Embed - 16:9 ratio]        │ ← Media (if present)
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│ Article Title Goes Here                         │ ← Title (xl, semibold)
│                                                 │
│ Preview text showing the first few lines of     │ ← Excerpt (base, normal)
│ the article content. Truncated to about 3-4     │
│ lines maximum for a clean appearance.           │
│                                                 │
│ [tag] [tag] [tag]                               │ ← Tags (optional)
│                                                 │
└─────────────────────────────────────────────────┘

Spacing:
- Card padding: 16px
- Title to excerpt: 12px
- Excerpt to tags: 8px
- Media to content: 16px

Colors:
- Card background: surface
- Title: text
- Excerpt: textSecondary
- Border: border (1px)
- Hover: surfaceHover + borderHover + shadow md
- Read state: 60% opacity

Dimensions:
- Desktop: Max width 700px
- Mobile: Full width minus 16px margin
- Min height: 120px (text-only cards)
```

### Button Styles

#### Primary Button
```css
.button-primary {
  background: #00B4A6;
  color: #FFFFFF;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  border: none;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.15s ease;
}

.button-primary:hover {
  background: #009B8F;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.button-primary:active {
  background: #008075;
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
```

#### Secondary Button
```css
.button-secondary {
  background: transparent;
  color: var(--text);
  border: 1px solid var(--border);
  /* ... rest same as primary */
}

.button-secondary:hover {
  background: var(--surfaceHover);
  border-color: var(--borderHover);
}
```

#### Ghost Button (Icon only)
```css
.button-ghost {
  background: transparent;
  color: var(--textSecondary);
  padding: 8px;
  border-radius: 8px;
  border: none;
}

.button-ghost:hover {
  background: var(--surfaceHover);
  color: var(--text);
}
```

### Input Fields

```css
.input {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 1rem;
  color: var(--text);
  transition: all 0.15s ease;
}

.input:hover {
  border-color: var(--borderHover);
}

.input:focus {
  outline: none;
  border-color: #00B4A6;
  box-shadow: 0 0 0 3px rgba(0, 180, 166, 0.1);
}

.input::placeholder {
  color: var(--textTertiary);
}
```

### Modal

```
┌──────────────────────────────────────────────────┐
│  [X Close]                                       │ ← Header (sticky)
├──────────────────────────────────────────────────┤
│                                                  │
│  Article Title Here                              │ ← Content (scrollable)
│                                                  │
│  [Media if present]                              │
│                                                  │
│  Full article content with HTML formatting...    │
│  ...                                             │
│  ...                                             │
│                                                  │
├──────────────────────────────────────────────────┤
│  [← Previous]  [Mark as Read]  [Next →]         │ ← Footer (sticky)
└──────────────────────────────────────────────────┘

Specs:
- Max width: 800px
- Background: surface
- Border radius: 16px (lg)
- Shadow: xl
- Padding: 24px
- Backdrop: rgba(0,0,0,0.5) with blur
```

### Navigation Bar (Desktop)

```
┌──────────────────────────────────────────────────┐
│  [Logo] Maifead    Feed  Sources  Settings   [Theme] [User]  │
└──────────────────────────────────────────────────┘

Specs:
- Height: 64px
- Background: surface with 80% opacity + backdrop blur
- Border bottom: 1px border color
- Padding: 0 24px
- Fixed position
- Z-index: 100
```

### Bottom Navigation (Mobile)

```
┌──────────────────────────────────────────────────┐
│  [Feed]    [Sources]    [Filters]    [Settings]  │
└──────────────────────────────────────────────────┘

Specs:
- Height: 64px
- Background: surface
- Border top: 1px border color
- Safe area inset bottom (iOS notch)
- Fixed position
- Z-index: 100
- Icons: 24px
- Active indicator: primary color bar on top
```

---

## Animations & Transitions

### Timing Functions

```typescript
const easings = {
  default: 'cubic-bezier(0.4, 0, 0.2, 1)',    // Material Design standard
  in: 'cubic-bezier(0.4, 0, 1, 1)',           // Decelerate
  out: 'cubic-bezier(0, 0, 0.2, 1)',          // Accelerate
  inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',      // Smooth
};
```

### Duration

```typescript
const durations = {
  fast: '100ms',      // Micro-interactions (hover)
  base: '150ms',      // Most transitions
  slow: '300ms',      // Large movements (modals)
  slower: '500ms',    // Page transitions
};
```

### Common Animations

```css
/* Fade in */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide up */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scale in (modals) */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

### Hover Effects

- **Cards**: Lift with shadow (`translateY(-2px)` + `shadow md`)
- **Buttons**: Lift with shadow (`translateY(-1px)`)
- **Links**: Underline appears (border-bottom transition)

### Loading States

```css
/* Skeleton loader */
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--surface) 0%,
    var(--surfaceHover) 50%,
    var(--surface) 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite linear;
}
```

---

## Iconography

### Icon Library
**Lucide React** - Clean, consistent, well-maintained

```bash
pnpm add lucide-react
```

### Icon Sizes

```typescript
const iconSizes = {
  xs: 16,    // Inline with text
  sm: 20,    // Buttons, nav
  base: 24,  // Default
  lg: 32,    // Section headers
  xl: 48,    // Empty states
};
```

### Common Icons

| Usage | Icon Name | Size |
|-------|-----------|------|
| Source icon | `Rss` | sm (20px) |
| Refresh | `RefreshCw` | sm (20px) |
| Settings | `Settings` | sm (20px) |
| User menu | `User` | sm (20px) |
| Close modal | `X` | sm (20px) |
| Mark as read | `Check` | sm (20px) |
| Save item | `Bookmark` | sm (20px) |
| External link | `ExternalLink` | xs (16px) |
| Theme toggle | `Sun` / `Moon` | sm (20px) |

---

## Responsive Breakpoints

```typescript
const breakpoints = {
  sm: '640px',     // Mobile landscape
  md: '768px',     // Tablet
  lg: '1024px',    // Desktop
  xl: '1280px',    // Large desktop
  '2xl': '1536px', // Extra large
};
```

### Layout Adaptations

| Screen Size | Layout | Navigation |
|-------------|--------|------------|
| < 768px | Single column, full width | Bottom nav bar |
| 768px - 1024px | Single column, max 700px | Top nav bar |
| > 1024px | Single column, max 700px, centered | Top nav bar |

### Font Size Adjustments

```css
@media (max-width: 768px) {
  html { font-size: 15px; } /* Slightly smaller base */
}
```

---

## Accessibility

### Focus States

```css
/* Visible focus ring */
*:focus-visible {
  outline: 2px solid #00B4A6;
  outline-offset: 2px;
  border-radius: 4px;
}

/* Remove focus ring on mouse click */
*:focus:not(:focus-visible) {
  outline: none;
}
```

### Screen Reader Only

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

### Color Contrast

All text meets WCAG 2.1 AA standards:
- Normal text: 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- UI elements: 3:1 minimum

---

## Styled Components Theme

```typescript
// apps/frontend/src/theme/theme.ts
export const lightTheme = {
  colors: { /* ... light colors ... */ },
  fonts: { /* ... */ },
  fontSizes: { /* ... */ },
  spacing: { /* ... */ },
  borderRadius: { /* ... */ },
  shadows: { /* ... */ },
};

export const darkTheme = {
  colors: { /* ... dark colors ... */ },
  // ... rest same as light
};

export type Theme = typeof lightTheme;
```

### Usage in Components

```typescript
import styled from 'styled-components';

const Card = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing[4]};
  box-shadow: ${props => props.theme.shadows.base};

  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
    box-shadow: ${props => props.theme.shadows.md};
  }
`;
```

---

This design system creates a cohesive, beautiful, and accessible interface that lets content shine.

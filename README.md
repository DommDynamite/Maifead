# Maifead

> _Irish for "feed/stream"_

A beautiful RSS feed aggregator designed to help you consume content from your favorite sources without algorithmic distractions.

## 🎯 Vision

Maifead provides a unified, distraction-free interface for reading content from multiple sources. No algorithms, no recommendations—just the sources you choose, displayed beautifully.

## 🚀 Current Status: Frontend POC (Phase 2)

### ✅ Completed

- [x] Monorepo structure with pnpm workspaces
- [x] Shared types package
- [x] Vite + React + TypeScript setup
- [x] Complete design system (dark/light themes)
- [x] Styled Components with theme support
- [x] Theme toggle functionality
- [x] Mock RSS feed data (10 items)
- [x] Global styles and typography
- [x] Development server running

### 🎨 Design System

- **Colors**: Dark grey (`#1E1E1E`) + blue-green accent (`#00B4A6`)
- **Typography**: System font stack with responsive scaling
- **Spacing**: 8px grid system
- **Themes**: Dark (default) and light modes with smooth transitions
- **Inspiration**: Obsidian's content-first, minimal aesthetic

### 📦 Tech Stack

**Frontend:**
- React 19 + TypeScript
- Vite (build tool)
- Styled Components (styling + theming)
- Zustand (UI state)
- TanStack Query (planned - server state)
- Framer Motion (planned - animations)
- Lucide React (icons)

**Backend (Planned):**
- NestJS + TypeScript
- SQLite + Prisma ORM
- Lucia (authentication)
- rss-parser (feed parsing)

## 🏗️ Project Structure

```
maifead/
├── apps/
│   └── frontend/          # React application
│       ├── src/
│       │   ├── components/    # Reusable UI components
│       │   ├── theme/         # Design system (colors, typography, spacing)
│       │   ├── stores/        # Zustand stores (theme, UI state)
│       │   ├── data/          # Mock data for POC
│       │   ├── pages/         # Page components
│       │   └── App.tsx        # Root component
│       └── package.json
├── packages/
│   └── types/             # Shared TypeScript types
│       └── src/
│           └── content.ts     # ContentItem interface
├── docs/                  # Comprehensive documentation
│   ├── 00-project-overview.md
│   ├── 01-technical-stack.md
│   ├── 02-architecture.md
│   ├── 03-data-models.md
│   ├── 04-api-specification.md
│   ├── 05-frontend-routes.md
│   ├── 06-design-system.md
│   ├── 07-user-workflows.md
│   ├── 08-mvp-scope.md
│   └── 09-development-phases.md
└── pnpm-workspace.yaml
```

## 🚦 Getting Started

### Prerequisites

- Node.js 20.x or higher
- pnpm 8.x or higher

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Or start frontend only
pnpm --filter @maifead/frontend dev
```

The app will be available at `http://localhost:5173`

### Try It Out

1. Open `http://localhost:5173` in your browser
2. See the welcome page with design system showcase
3. **Click the theme toggle** (sun/moon icon) in the top-right to switch between light and dark modes
4. Notice smooth color transitions and beautiful typography

## 📋 Next Steps (Phase 2 Continuation)

1. **Card Component** - Build the RSS feed card with:
   - Source icon, name, timestamp
   - Title and excerpt
   - Media display (image/video)
   - Read/unread state
   - Hover effects

2. **Feed View** - Create the main feed page:
   - List of cards with virtual scrolling
   - Pull-to-refresh gesture (mobile)
   - Loading skeleton states

3. **Content Modal** - Reading experience:
   - Full content display
   - Embedded media
   - Mark as read/unread
   - Open original link

4. **Mobile Responsive** - Adapt for all screen sizes:
   - Bottom navigation on mobile
   - Touch-friendly targets
   - Responsive card layout

5. **Polish** - Animations and interactions:
   - Card hover effects
   - Modal open/close transitions
   - Smooth scrolling

## 📚 Documentation

See the [`docs/`](./docs) directory for comprehensive documentation:

- **[Project Overview](./docs/00-project-overview.md)** - Vision, goals, principles
- **[Technical Stack](./docs/01-technical-stack.md)** - Technology decisions and rationale
- **[Architecture](./docs/02-architecture.md)** - System design and data flow
- **[Data Models](./docs/03-data-models.md)** - Database schemas and TypeScript interfaces
- **[API Specification](./docs/04-api-specification.md)** - Backend API endpoints (planned)
- **[Frontend Routes](./docs/05-frontend-routes.md)** - Page structure and navigation
- **[Design System](./docs/06-design-system.md)** - Colors, typography, components
- **[User Workflows](./docs/07-user-workflows.md)** - User journey maps
- **[MVP Scope](./docs/08-mvp-scope.md)** - What's in/out for v1
- **[Development Phases](./docs/09-development-phases.md)** - Build roadmap

## 🎨 Design Principles

1. **Content-First** - UI fades into the background
2. **No Algorithms** - User controls what they see
3. **Beautiful Simplicity** - Clean, modern aesthetics
4. **Mobile-Ready** - Works great on all devices
5. **Fast & Lightweight** - Minimal backend storage

## 🛠️ Development

### Available Scripts

```bash
# Start all apps in parallel
pnpm dev

# Start frontend only
pnpm --filter @maifead/frontend dev

# Build all packages
pnpm build

# Lint all packages
pnpm lint

# Format code
pnpm format
```

### Code Style

- TypeScript strict mode enabled
- ESLint for code quality
- Prettier for formatting
- Styled Components for styling

## 📖 Learn More

- [Styled Components Documentation](https://styled-components.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 📝 License

MIT

---

**Status**: 🚧 Under active development - Phase 2 (Frontend POC with dummy data)

**Current**: Design system complete, theme working, ready to build components!

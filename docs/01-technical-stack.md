# Technical Stack

## Overview
Maifead uses a modern, type-safe monorepo architecture with React frontend and NestJS backend.

## Repository Structure
**Monorepo** using pnpm workspaces

**Rationale:**
- Share TypeScript types between frontend and backend
- Single `git clone`, unified versioning
- Easier Docker build including both apps
- Better for single-developer or small-team projects

## Frontend Stack

### Core Framework
- **React 18+** - Industry standard UI library
- **TypeScript** - Type safety, better DX, shared types with backend
- **Vite** - Modern build tool, extremely fast HMR, industry standard for new React projects

**Rationale:** React + TypeScript is the gold standard for modern web apps. Vite provides the best development experience.

### State Management

#### Server State
- **TanStack Query (React Query)**
  - Perfect for managing server data (feeds, content)
  - Built-in caching, refetching, loading/error states
  - Optimistic updates for instant UI feedback
  - Essential for API-heavy applications

**Rationale:** RSS aggregator is primarily server-state heavy. TanStack Query handles this elegantly.

#### UI/Client State
- **Zustand**
  - Lightweight global state (theme, read/unread tracking, UI preferences)
  - Simple API, minimal boilerplate
  - Works well alongside TanStack Query

**Rationale:** For the small amount of UI state we need, Zustand is simpler than Redux while still being powerful.

### Styling & Design

#### CSS-in-JS
- **Styled Components**
  - Component-scoped styles
  - Dynamic theming (light/dark mode)
  - TypeScript support for theme
  - Great for responsive design

**Rationale:** Theme switching is a core feature. Styled Components makes dynamic theming straightforward and type-safe.

#### Component Library
- **shadcn/ui**
  - Copy/paste components built on Radix UI + Tailwind
  - Own the code, full customization
  - Beautiful, accessible defaults
  - Use selectively for complex components (modals, dropdowns, command palettes)

**Rationale:** We want custom design but don't want to rebuild complex accessible patterns. shadcn/ui gives us both.

### Additional Frontend Libraries

- **Framer Motion** - Animations and gestures
- **TanStack Virtual** - Virtual scrolling for performance
- **React Hook Form** - Form handling (add feeds, filters)
- **Zod** - Runtime validation (shared with backend)
- **date-fns** - Date formatting and manipulation

### Mobile/PWA
- **Vite PWA Plugin** - Service worker, offline support, install prompts
- **react-simple-pull-to-refresh** - Pull-to-refresh gesture
- **Responsive design** - Mobile-first CSS with Styled Components

**Rationale:** Mobile compatibility is a must. PWA features make it feel native without separate app.

## Backend Stack

### Core Framework
- **NestJS** - TypeScript-first Node.js framework
  - Structured, opinionated architecture
  - Built-in modules for auth, validation, dependency injection
  - Excellent for team environments (scalable patterns)
  - Great TypeScript support

**Rationale:** Learning NestJS teaches professional patterns useful for team work. Its structure prevents messy codebases as features grow.

### Database
- **SQLite** - File-based SQL database
  - Zero configuration
  - Perfect for self-hosted deployments
  - Fast for read-heavy workloads
  - Single file = easy backups

**Rationale:** Lightweight, no separate database server needed, ideal for self-hosting. Can migrate to PostgreSQL later if needed.

### ORM
- **Prisma** - Modern TypeScript ORM
  - Type-safe database queries
  - Great migrations system
  - Prisma Studio for database inspection
  - Excellent DX

**Alternative:** Drizzle ORM (lighter, more SQL-like, also excellent)

**Rationale:** Prisma's type safety and tooling are outstanding. Migrations are clean and trackable.

### Authentication
- **Lucia** - Modern auth library
  - Lightweight, framework-agnostic
  - Type-safe session management
  - Easier to extend with OAuth later (GitHub, Google login)
  - Better security defaults than rolling our own

**Rationale:** Slightly more setup than basic sessions, but worth it for security and future extensibility.

### Feed Parsing
- **rss-parser** - RSS/Atom feed parser
  - Simple API
  - Handles most RSS/Atom formats
  - Good error handling for malformed feeds

**Rationale:** Battle-tested, works with the Node.js ecosystem.

### Validation
- **Zod** - TypeScript schema validation
  - Runtime validation of API inputs
  - Share schemas with frontend
  - Generate TypeScript types from schemas

**Rationale:** Single source of truth for data shapes. Prevents frontend/backend type drift.

### Future API Integrations
- **Axios** - HTTP client for external APIs
- **snoowrap** - Reddit API wrapper (Phase 2+)
- **googleapis** - YouTube Data API (Phase 2+)

## Shared Packages

### `packages/types`
- Shared TypeScript interfaces
- Zod schemas (runtime validation)
- Exported to both frontend and backend

**Example:**
```typescript
// packages/types/src/content.ts
export interface ContentItem {
  id: string;
  source: { ... };
  title: string;
  // ...
}
```

**Rationale:** Type safety across the entire stack. Changes in one place automatically propagate.

## Development Tools

### Package Management
- **pnpm** - Fast, efficient package manager
  - Saves disk space with shared dependencies
  - Workspace support for monorepos
  - Faster than npm/yarn

### Code Quality
- **ESLint** - Linting for TypeScript/React
- **Prettier** - Code formatting
- **Husky** - Git hooks (run linter on commit)
- **lint-staged** - Only lint changed files

### TypeScript
- **Strict mode enabled**
- Shared `tsconfig.base.json` for consistency
- Path aliases for clean imports (`@/components` instead of `../../../components`)

## Deployment

### Containerization
- **Docker** - Container platform
  - Multi-stage build (build frontend → build backend → serve both)
  - Single container for simple deployment
  - Includes SQLite database file

- **Docker Compose** - Multi-container orchestration
  - Development environment
  - Easy to add services later (Redis, PostgreSQL)

### Production Server
- **NestJS serves frontend static files** from Vite build
- Single port, single container
- Simple reverse proxy setup (nginx/Caddy)

**Rationale:** Self-hosting should be as simple as `docker-compose up`. Single container = minimal complexity.

## Technology Decision Summary

| Concern | Technology | Why |
|---------|-----------|-----|
| Frontend Framework | React + TypeScript | Industry standard, huge ecosystem |
| Build Tool | Vite | Fastest DX, modern standard |
| Server State | TanStack Query | Best for API-heavy apps |
| UI State | Zustand | Lightweight, simple |
| Styling | Styled Components | Dynamic theming support |
| Components | shadcn/ui | Accessible primitives, own the code |
| Backend Framework | NestJS | Professional patterns, scalable |
| Database | SQLite | Lightweight, self-host friendly |
| ORM | Prisma | Type-safe, excellent DX |
| Auth | Lucia | Modern, secure, extensible |
| Feed Parsing | rss-parser | Simple, reliable |
| Validation | Zod | Shared runtime validation |
| Package Manager | pnpm | Fast, monorepo support |
| Deployment | Docker | Easy self-hosting |

## Future Considerations

### Potential Additions
- **Redis** - Caching layer for feed data (reduce API calls)
- **PostgreSQL** - If SQLite becomes limiting (unlikely for this use case)
- **Bull/BullMQ** - Job queue for scheduled feed fetching
- **Sentry** - Error tracking and monitoring
- **Plausible/Umami** - Privacy-friendly analytics (optional)

### Mobile Native (Far Future)
- **React Native** - If web PWA isn't sufficient
  - Can share business logic and types
  - Separate UI layer

## Directory Structure

```
maifead/
├── apps/
│   ├── backend/              # NestJS application
│   │   ├── src/
│   │   ├── prisma/           # Database schema & migrations
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── frontend/             # React application
│       ├── src/
│       ├── public/
│       ├── package.json
│       ├── vite.config.ts
│       └── tsconfig.json
├── packages/
│   └── types/                # Shared TypeScript types
│       ├── src/
│       ├── package.json
│       └── tsconfig.json
├── docs/                     # This documentation
├── docker-compose.yml
├── Dockerfile
├── pnpm-workspace.yaml
├── package.json              # Root package.json
├── tsconfig.base.json        # Shared TypeScript config
├── .eslintrc.js
├── .prettierrc
└── README.md
```

## Development Workflow

### Local Development
```bash
# Install all dependencies
pnpm install

# Start frontend dev server (Vite)
pnpm --filter frontend dev

# Start backend dev server (NestJS)
pnpm --filter backend dev

# Or run both concurrently
pnpm dev
```

### Production Build
```bash
# Build all packages
pnpm build

# Or use Docker
docker build -t maifead .
docker run -p 3000:3000 maifead
```

## Version Requirements

- **Node.js**: 20.x LTS
- **pnpm**: 8.x or higher
- **TypeScript**: 5.x
- **Docker**: 24.x or higher (for deployment)

## Learning Resources

For team members or contributors unfamiliar with these technologies:

- **NestJS**: https://docs.nestjs.com
- **TanStack Query**: https://tanstack.com/query/latest/docs/react/overview
- **Styled Components**: https://styled-components.com/docs
- **Prisma**: https://www.prisma.io/docs
- **Lucia**: https://lucia-auth.com
- **pnpm workspaces**: https://pnpm.io/workspaces

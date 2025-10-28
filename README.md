# Maifead

> _Irish for "feed/stream"_

A beautiful, privacy-focused RSS feed aggregator designed to help you consume content from your favorite sources without algorithmic distractions.

## Features

- **Multi-Source Support**: RSS feeds, YouTube channels, Bluesky profiles
- **Smart Organization**: Collections and custom Feads for grouping sources
- **Cross-Device Sync**: Read/saved status syncs across all your devices
- **Privacy-Focused**: Self-hosted, no tracking, your data stays yours
- **Beautiful UI**: Dark/light themes with customizable color presets
- **Mobile-First**: Responsive design that works great on all devices
- **Keyword Filtering**: Whitelist/blacklist for fine-tuned content control
- **YouTube Shorts Control**: Filter shorts separately from regular videos
- **Flexible Viewing**: Multiple sort options including novel "Shuffle" mode for balanced source mixing

## Tech Stack

**Frontend:**
- React 19 + TypeScript
- Vite (build tool)
- Styled Components (styling + theming)
- Zustand (state management)
- Lucide React (icons)

**Backend:**
- Express + TypeScript
- SQLite with better-sqlite3 (simple, file-based database)
- JWT authentication
- RSS parsing with rss-parser
- YouTube integration via RSS feeds
- Bluesky AT Protocol integration
- Scheduled feed fetching with node-cron

## Getting Started

### Option 1: Docker (Recommended)

The easiest way to run Maifead is with Docker:

```bash
# Clone the repository
git clone https://github.com/DommDynamite/Maifead.git
cd maifead

# Create environment file
cat > .env << EOF
JWT_SECRET=your-secret-key-change-this-in-production
ADMIN_EMAIL=your-email@example.com
BASE_URL=http://localhost
EOF

# Start with Docker Compose
docker-compose up -d
```

The app will be available at `http://localhost`

**For production deployment:**

```bash
# Use the production compose file
docker-compose -f docker-compose.prod.yml up -d
```

### Option 2: Manual Installation

If you prefer to run without Docker:

**Prerequisites:**
- Node.js 20.x or higher
- pnpm 8.x or higher

```bash
# Clone the repository
git clone https://github.com/DommDynamite/Maifead.git
cd maifead

# Install dependencies
pnpm install

# Set up environment variables
cd apps/backend
cp .env.example .env
# Edit .env and set your JWT_SECRET and ADMIN_EMAIL

# Start the backend
pnpm --filter @maifead/backend dev

# In a new terminal, start the frontend
pnpm --filter @maifead/frontend dev
```

The app will be available at `http://localhost:5173`

### First-Time Setup

1. Open the app in your browser (http://localhost or http://localhost:5173)
2. Sign up with your email (the first user with ADMIN_EMAIL becomes admin)
3. Add your first RSS feed, YouTube channel, or Bluesky profile
4. Start organizing with Collections and Feads!

## Project Structure

```
maifead/
├── apps/
│   ├── backend/               # Express API server
│   │   ├── src/
│   │   │   ├── config/        # Database, auth configuration
│   │   │   ├── controllers/   # API route handlers
│   │   │   ├── middleware/    # Auth, error handling
│   │   │   ├── routes/        # API routes
│   │   │   ├── services/      # Feed fetching, parsing
│   │   │   └── index.ts       # Server entry point
│   │   └── data/              # SQLite database storage
│   └── frontend/              # React application
│       ├── src/
│       │   ├── components/    # Reusable UI components
│       │   ├── pages/         # Page components
│       │   ├── stores/        # Zustand state stores
│       │   ├── theme/         # Design system
│       │   └── lib/           # Utilities, API client
│       └── package.json
└── packages/
    └── types/                 # Shared TypeScript types
```

## Configuration

### Environment Variables (Backend)

Create `apps/backend/.env`:

```env
PORT=3001
NODE_ENV=development
JWT_SECRET=your-secret-key-change-this-in-production
DATABASE_PATH=./data/maifead.db
FEED_FETCH_INTERVAL=*/15 * * * *

# Admin Configuration
ADMIN_EMAIL=your-email@example.com

# App URL (for invite links)
BASE_URL=http://localhost:5173
```

### Admin Features

The first user who signs up with the `ADMIN_EMAIL` becomes an admin and can:
- Manage user accounts (activate/deactivate)
- Generate invite codes for new users
- View system statistics

## Architecture Highlights

### Per-User Read/Saved Status
- Uses junction table pattern (`user_feed_items`) for true multi-user support
- Read status syncs automatically across all devices
- Efficient LEFT JOIN queries with COALESCE for default values

### Scheduled Feed Fetching
- Background job runs every 15 minutes (configurable)
- Fetches new content from all sources
- Deduplicates based on URL
- Respects user keyword filters

### Theme System
- 10 color presets with light/dark modes
- Persistent per-user preferences
- Smooth transitions between themes
- System font stack for performance

## Development

### Available Scripts

```bash
# Start all apps
pnpm dev

# Start specific app
pnpm --filter @maifead/backend dev
pnpm --filter @maifead/frontend dev

# Build for production
pnpm build

# Lint code
pnpm lint
```

## Deployment

### Docker Deployment

The recommended way to deploy Maifead is with Docker:

1. **Set up your server** with Docker and Docker Compose installed

2. **Clone and configure:**
   ```bash
   git clone https://github.com/DommDynamite/Maifead.git
   cd maifead

   # Create production environment file
   cat > .env << EOF
   JWT_SECRET=$(openssl rand -base64 32)
   ADMIN_EMAIL=your-admin@email.com
   BASE_URL=https://your-domain.com
   FEED_FETCH_INTERVAL=*/15 * * * *
   DATA_DIR=./data
   FRONTEND_PORT=80
   EOF
   ```

3. **Start the application:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

4. **Set up reverse proxy** (optional but recommended):
   - Use Nginx or Caddy to add HTTPS
   - Point your domain to the server
   - Configure SSL certificates (Let's Encrypt)

### Data Persistence

The SQLite database is stored in a Docker volume (`maifead-data` in development or `DATA_DIR` in production). To backup your data:

```bash
# Backup
docker-compose exec backend tar czf - /app/apps/backend/data > maifead-backup-$(date +%Y%m%d).tar.gz

# Restore
docker-compose exec -T backend tar xzf - -C / < maifead-backup-20250128.tar.gz
```

### Updating

To update to the latest version:

```bash
git pull
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

## Contributing

Contributions are welcome! This is a privacy-focused, community-driven project.

## License

MIT

## Mirrors

- **GitHub** (primary): [github.com/DommDynamite/Maifead](https://github.com/DommDynamite/Maifead)
- **Codeberg** (mirror): [codeberg.org/DommDynamite/Maifead](https://codeberg.org/DommDynamite/Maifead)

---

Built with TypeScript, React, and a focus on user privacy and control.

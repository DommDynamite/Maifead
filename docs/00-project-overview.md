# Project Overview

## Project Name
**Maifead** (Irish for "feed/stream")

## Vision
A unified content aggregation platform that consolidates diverse content sources (RSS feeds, Reddit, YouTube, social media) into a single, distraction-free interface. The primary goal is to empower users to consume content from their chosen sources without being subjected to algorithmic manipulation or engagement-maximizing dark patterns.

## Problem Statement
Modern social media and content platforms use algorithms designed to:
- Maximize engagement and time-on-site
- Show content based on what keeps you scrolling, not what you chose to see
- Create "rabbit holes" that lead you away from your original intent
- Mix unwanted content with the sources you actually care about

This creates a distraction-filled experience where you lose agency over your information diet.

## Solution
Maifead provides a beautiful, unified interface where:
- **You choose your sources** - explicitly add the RSS feeds, subreddits, YouTube channels, and social media accounts you want
- **No algorithmic recommendations** - content appears chronologically or by your custom filtering rules
- **Unified experience** - all content normalized into a consistent, beautiful card-based interface
- **Custom filtering** - sophisticated, user-defined rules to organize and surface content
- **Distraction-free** - clean design that prioritizes content over UI chrome

## Target Users

### Primary User
- **Self** - Built primarily for personal use
- Control over information consumption
- Technical user comfortable with self-hosting

### Secondary Users
- **Friends and like-minded individuals** who want to escape algorithmic feeds
- Users who can self-host on their own servers
- Each user creates their own feeds and filters (multi-tenant capable)

## Core Principles

### 1. User Agency Over Algorithms
- Users explicitly choose all content sources
- No recommendation engine
- No "you might also like" or "trending now" distractions
- Content displayed chronologically or by user-defined rules, not engagement metrics

### 2. Minimal, Beautiful Design
- Inspired by Obsidian's content-first philosophy
- Clean, unobtrusive interface
- Let the content be the focus
- Simple and not in the way

### 3. Custom Filtering & Organization
- Sophisticated filtering logic that users define themselves
- Ability to categorize, tag, and organize feeds
- Filter by keywords, topics, content type, date ranges
- Create custom views/streams combining multiple sources

### 4. Lightweight Data Storage
- Rely on original sources for content storage
- Use embeds to minimize server storage requirements
- Backend manages lightweight metadata only
- Pass minimal data to UI layer, let it fetch embeds on-demand

### 5. Self-Hosted Friendly
- Easy deployment via Docker
- Multi-tenant capable for sharing with friends
- Privacy-focused (your data, your server)
- Minimal resource requirements

## Content Sources

### MVP (Phase 1)
- **RSS Feeds** - Blogs, news sites, podcasts
  - Standardized format, straightforward to implement
  - Primary focus for initial release

### Future Phases
- **Reddit** - Specific subreddits or user posts
- **YouTube** - Channel uploads, community posts
- **Social Media** - Twitter/X, Mastodon, Instagram
- **Other** - Any service with an API or parseable feed

## Key Features

### For MVP
- Add RSS feeds by URL
- Unified card-based feed view
- Click cards to view full content in modal
- Mark as read/unread
- Basic keyword filtering
- Light/dark theme toggle
- Mobile responsive design
- Manual refresh (button + pull-to-refresh on mobile)
- Simple authentication (Lucia)

### Future Features
- Advanced filtering (boolean logic, regex, custom rules)
- Multiple content source types (Reddit, YouTube, etc.)
- Saved items / read later
- Categories and tags
- Multi-user management
- Export/import configurations
- PWA features (offline support, install to home screen)
- Auto-refresh with configurable intervals

## Success Criteria

### MVP Success
- Can add 5-10 RSS feeds
- View unified, chronological feed
- Read articles in clean, distraction-free interface
- Works beautifully on mobile and desktop
- Fast, responsive, pleasant to use
- Makes daily news/content consumption more intentional

### Long-term Success
- Replaces need to visit individual sites
- Replaces algorithmic social media consumption
- Friends want to use it
- Easy for technical users to self-host
- Community contributions and feature requests

## Technical Philosophy
- **Build to learn** - Choose technologies that teach valuable patterns (NestJS for team-oriented architecture)
- **Quality over speed** - Take time to do it right
- **Mobile-first** - Assume mobile compatibility from day one
- **Type-safe** - TypeScript everywhere, shared types between frontend and backend
- **Modern practices** - Use current best practices and tooling

## Timeline
See [09-development-phases.md](./09-development-phases.md) for detailed development roadmap.

## Documentation
This is part of a comprehensive documentation suite:
- [01-technical-stack.md](./01-technical-stack.md) - Technology choices
- [02-architecture.md](./02-architecture.md) - System architecture
- [03-data-models.md](./03-data-models.md) - Data structures
- [04-api-specification.md](./04-api-specification.md) - Backend API
- [05-frontend-routes.md](./05-frontend-routes.md) - Frontend structure
- [06-design-system.md](./06-design-system.md) - UI/UX design
- [07-user-workflows.md](./07-user-workflows.md) - User journeys
- [08-mvp-scope.md](./08-mvp-scope.md) - What's in/out for v1
- [09-development-phases.md](./09-development-phases.md) - Build roadmap

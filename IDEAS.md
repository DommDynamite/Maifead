# Maifead - Future Ideas & Enhancements

This document tracks potential features and improvements for future development.

## Database

### PostgreSQL Support (Optional)
- Add optional PostgreSQL support via environment variables
- Keep SQLite as default for simplicity
- Configuration:
  - Set `USE_POSTGRES=true` in .env to enable
  - Add PostgreSQL connection details (host, port, database, user, password)
- Benefits for large-scale deployments:
  - Better performance with 100,000+ items
  - Support for dozens of concurrent users
  - Advanced querying capabilities
- Implementation:
  - Install dependencies: `pg`, `kysely`
  - Create database abstraction layer
  - Support both SQLite and PostgreSQL query syntax
  - Provide migration script from SQLite to PostgreSQL

## Content Features

### YouTube Shorts Filtering
**Status:** Implemented ✅

Add filtering options to YouTube sources to control whether shorts are included in the feed.

**Options:**
- **Show All** (default) - Display both regular videos and shorts
- **Exclude Shorts** - Only show regular videos, filter out shorts
- **Shorts Only** - Show only shorts, filter out regular videos

**Use Cases:**
- Users can create separate feeds for shorts vs regular videos
- Some users may prefer to consume shorts separately from long-form content
- Enables different viewing/consumption patterns for different content types

**Future Enhancement: Shorts Replacement Feature**
Potential idea to build a shorts-style viewer/replacement within Maifead:
- Vertical scrolling interface for shorts
- Swipe navigation between shorts
- Could become a YouTube Shorts alternative experience
- Keeps users in the Maifead ecosystem for all content consumption

**Implementation Notes:**
- Detection: Check video duration or URL format (`/shorts/` vs `/watch`)
- May need to fetch additional metadata to determine if a video is a short
- Could add a `content_type` field to feed items (e.g., 'video', 'short', 'article')
- UI: Add dropdown/toggle in the "Add YouTube Source" modal
- Backend: Filter items during fetch or storage based on user preference

**Related Considerations:**
- Some YouTube channels post exclusively shorts, others mix both
- Shorts URLs use `/shorts/VIDEO_ID` format
- Shorts are typically under 60 seconds in duration
- Could extend this concept to other platforms (TikTok, Instagram Reels, etc.)

### Reddit Video Audio Merging (Server-side)
Build server-side tool using FFmpeg to merge Reddit's separate audio/video DASH streams.

**Implementation approach:**
- Implement as streaming proxy or temporary cache (not permanent storage)
- Technical requirements:
  - Install FFmpeg on backend server
  - Create endpoint to handle video merging on-demand
  - Add caching layer to avoid re-processing same videos
  - Implement cleanup for temporary files

**Benefits:**
- Full video with audio works in-app without redirecting to Reddit

**Drawbacks:**
- Increased server resources
- Legal gray area for public/commercial use

**Legal consideration:**
- Keep for personal use only, don't deploy publicly without legal review

## Ideas to be categorized

(Add new ideas here as they come up)

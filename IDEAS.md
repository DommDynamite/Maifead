# Maifead - Future Ideas & Enhancements

## Video Features
- **Reddit Video Audio Merging** (Server-side)
  - Build server-side tool using FFmpeg to merge Reddit's separate audio/video DASH streams
  - Implement as streaming proxy or temporary cache (not permanent storage)
  - Legal consideration: Keep for personal use only, don't deploy publicly without legal review
  - Technical requirements:
    - Install FFmpeg on backend server
    - Create endpoint to handle video merging on-demand
    - Add caching layer to avoid re-processing same videos
    - Implement cleanup for temporary files
  - Benefits: Full video with audio works in-app without redirecting to Reddit
  - Drawbacks: Increased server resources, legal gray area for public/commercial use

## Ideas to Add Later
(Add future enhancement ideas here)

# Feature Ideas

## YouTube Shorts Filtering

### Concept
Add filtering options to YouTube sources to control whether shorts are included in the feed.

### Options
- **Show All** (default) - Display both regular videos and shorts
- **Exclude Shorts** - Only show regular videos, filter out shorts
- **Shorts Only** - Show only shorts, filter out regular videos

### Use Cases
- Users can create separate feeds for shorts vs regular videos
- Some users may prefer to consume shorts separately from long-form content
- Enables different viewing/consumption patterns for different content types

### Future Enhancement: Shorts Replacement Feature
Potential idea to build a shorts-style viewer/replacement within Maifead:
- Vertical scrolling interface for shorts
- Swipe navigation between shorts
- Could become a YouTube Shorts alternative experience
- Keeps users in the Maifead ecosystem for all content consumption

### Implementation Notes
- Detection: Check video duration or URL format (`/shorts/` vs `/watch`)
- May need to fetch additional metadata to determine if a video is a short
- Could add a `content_type` field to feed items (e.g., 'video', 'short', 'article')
- UI: Add dropdown/toggle in the "Add YouTube Source" modal
- Backend: Filter items during fetch or storage based on user preference

### Related Considerations
- Some YouTube channels post exclusively shorts, others mix both
- Shorts URLs use `/shorts/VIDEO_ID` format
- Shorts are typically under 60 seconds in duration
- Could extend this concept to other platforms (TikTok, Instagram Reels, etc.)

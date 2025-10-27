import Parser from 'rss-parser';
import { db } from '../config/database.js';
import { randomUUID } from 'crypto';
import type { Source, FeedItem } from '../types/index.js';

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'media'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['media:group', 'mediaGroup'],
      ['content:encoded', 'contentEncoded'],
      ['description', 'description'],
    ],
  },
});

interface ParsedFeedItem {
  title?: string;
  link?: string;
  content?: string;
  contentSnippet?: string;
  pubDate?: string;
  creator?: string;
  author?: string;
  enclosure?: { url: string };
  media?: { $: { url: string } };
  mediaThumbnail?: { $: { url: string } } | Array<{ $: { url: string; width?: string; height?: string } }>;
  mediaGroup?: {
    'media:thumbnail'?: Array<{ $: { url: string; width?: string; height?: string } }>;
    'media:description'?: Array<{ _: string }>;
    'media:content'?: Array<{ $: { url: string } }>;
  };
  contentEncoded?: string;
  description?: string;
}

export class FeedService {
  /**
   * Extract YouTube channel ID from various URL formats
   * Supports:
   * - https://www.youtube.com/@username
   * - https://www.youtube.com/c/ChannelName
   * - https://www.youtube.com/channel/CHANNEL_ID
   * - https://www.youtube.com/user/username
   */
  static extractYouTubeChannelId(url: string): string | null {
    try {
      const urlObj = new URL(url);

      // Handle RSS feed URL format: /feeds/videos.xml?channel_id=UCxxxxxxxxxx
      if (urlObj.pathname === '/feeds/videos.xml' && urlObj.searchParams.has('channel_id')) {
        return urlObj.searchParams.get('channel_id');
      }

      // Handle video URLs - we'll need to fetch the channel ID from the video page
      // /watch?v=VIDEO_ID or /shorts/VIDEO_ID
      if (urlObj.pathname === '/watch' || urlObj.pathname.startsWith('/shorts/')) {
        return 'VIDEO_URL'; // Special marker to indicate we need to fetch from video page
      }

      // Handle @username format
      const atMatch = urlObj.pathname.match(/^\/@([\w-]+)/);
      if (atMatch) {
        return `@${atMatch[1]}`;
      }

      // Handle /c/ChannelName format
      const cMatch = urlObj.pathname.match(/^\/c\/([\w-]+)/);
      if (cMatch) {
        return cMatch[1];
      }

      // Handle /channel/CHANNEL_ID format
      const channelMatch = urlObj.pathname.match(/^\/channel\/([\w-]+)/);
      if (channelMatch) {
        return channelMatch[1];
      }

      // Handle /user/username format
      const userMatch = urlObj.pathname.match(/^\/user\/([\w-]+)/);
      if (userMatch) {
        return userMatch[1];
      }

      return null;
    } catch (error) {
      console.error('Error extracting YouTube channel ID:', error);
      return null;
    }
  }

  /**
   * Fetch the actual YouTube channel ID from a channel URL
   * Handles @username, /c/, /user/ formats by scraping the channel page
   */
  static async getYouTubeChannelId(url: string): Promise<string | null> {
    try {
      const response = await fetch(url);
      const html = await response.text();

      // Try to find channel ID in the HTML
      // Look for pattern: "channelId":"UCxxxxxxxxxxxxxxxxxx"
      const channelIdMatch = html.match(/"channelId":"(UC[\w-]+)"/);
      if (channelIdMatch) {
        return channelIdMatch[1];
      }

      // Alternative pattern: "browse_id":"UCxxxxxxxxxxxxxxxxxx"
      const browseIdMatch = html.match(/"browse_id":"(UC[\w-]+)"/);
      if (browseIdMatch) {
        return browseIdMatch[1];
      }

      // Another pattern in meta tags
      const metaMatch = html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/channel\/(UC[\w-]+)"/);
      if (metaMatch) {
        return metaMatch[1];
      }

      return null;
    } catch (error) {
      console.error('Error fetching YouTube channel ID:', error);
      return null;
    }
  }

  /**
   * Fetch YouTube channel avatar/icon URL
   */
  static async getYouTubeChannelIcon(url: string): Promise<string | null> {
    try {
      console.log(`[getYouTubeChannelIcon] Fetching URL: ${url}`);
      const response = await fetch(url);
      const html = await response.text();

      // Try meta tag first (most specific to this channel)
      const metaAvatarMatch = html.match(/<link itemprop="thumbnailUrl" href="([^"]+)"/);
      console.log(`[getYouTubeChannelIcon] Meta match:`, metaAvatarMatch ? metaAvatarMatch[1].substring(0, 100) : 'NOT FOUND');

      if (metaAvatarMatch && metaAvatarMatch[1].includes('yt3.google')) {
        // Normalize to 240px size
        const avatarUrl = metaAvatarMatch[1].replace(/=s\d+-/, '=s240-');
        console.log(`[getYouTubeChannelIcon] Returning from meta tag: ${avatarUrl.substring(0, 100)}`);
        return avatarUrl;
      }

      // Fallback: try to extract from link tag with image_src
      const linkImageMatch = html.match(/<link rel="image_src" href="([^"]+)"/);
      console.log(`[getYouTubeChannelIcon] Link match:`, linkImageMatch ? linkImageMatch[1].substring(0, 100) : 'NOT FOUND');

      if (linkImageMatch && linkImageMatch[1].includes('yt3.google')) {
        const avatarUrl = linkImageMatch[1].replace(/=s\d+-/, '=s240-');
        console.log(`[getYouTubeChannelIcon] Returning from link tag: ${avatarUrl.substring(0, 100)}`);
        return avatarUrl;
      }

      console.warn(`[getYouTubeChannelIcon] No valid icon found for ${url}`);
      return null;
    } catch (error) {
      console.error('[getYouTubeChannelIcon] Error:', error);
      return null;
    }
  }

  /**
   * Convert YouTube channel ID to RSS feed URL
   */
  static convertYouTubeToRss(channelId: string): string {
    return `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  }

  /**
   * Extract Reddit identifier from various URL formats
   * Supports:
   * - https://www.reddit.com/r/subreddit
   * - https://www.reddit.com/user/username
   * - reddit.com/r/subreddit
   * - Just the subreddit or username directly
   */
  static extractRedditIdentifier(input: string): { type: 'subreddit' | 'user'; value: string } | null {
    try {
      // Try to parse as URL first
      let urlStr = input.trim();
      if (!urlStr.startsWith('http')) {
        urlStr = `https://${urlStr}`;
      }

      const urlObj = new URL(urlStr);

      // Handle /r/subreddit format
      const subredditMatch = urlObj.pathname.match(/^\/r\/([\w-]+)/);
      if (subredditMatch) {
        return { type: 'subreddit', value: subredditMatch[1] };
      }

      // Handle /user/username format
      const userMatch = urlObj.pathname.match(/^\/user\/([\w-]+)/);
      if (userMatch) {
        return { type: 'user', value: userMatch[1] };
      }

      return null;
    } catch (error) {
      // If URL parsing fails, check if it's a direct subreddit/username
      const trimmed = input.trim().replace(/^\/?(r\/|user\/)/, '');
      if (trimmed && /^[\w-]+$/.test(trimmed)) {
        // Assume it's a subreddit if no prefix specified
        return { type: 'subreddit', value: trimmed };
      }
      return null;
    }
  }

  /**
   * Convert Reddit subreddit to RSS feed URL
   */
  static convertRedditSubredditToRss(subreddit: string): string {
    return `https://www.reddit.com/r/${subreddit}.rss`;
  }

  /**
   * Convert Reddit user to RSS feed URL
   */
  static convertRedditUserToRss(username: string): string {
    return `https://www.reddit.com/user/${username}/submitted.rss`;
  }

  /**
   * Fetch subreddit icon from Reddit's JSON API using browser-like headers
   */
  static async getRedditSubredditIcon(subreddit: string): Promise<string | null> {
    try {
      const response = await fetch(`https://www.reddit.com/r/${subreddit}/about.json`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });

      if (!response.ok) {
        console.error(`Failed to fetch subreddit info: ${response.status}`);
        return null;
      }

      const data = await response.json() as any;
      const subredditData = data?.data;

      if (!subredditData) {
        return null;
      }

      // Try community_icon first (this is usually the best quality)
      if (subredditData.community_icon) {
        // The community_icon is HTML encoded, need to decode &amp; to &
        return subredditData.community_icon.replace(/&amp;/g, '&');
      }

      // Fallback to icon_img
      if (subredditData.icon_img) {
        return subredditData.icon_img.replace(/&amp;/g, '&');
      }

      // Fallback to header_img (older subreddits might only have this)
      if (subredditData.header_img) {
        return subredditData.header_img.replace(/&amp;/g, '&');
      }

      return null;
    } catch (error) {
      console.error(`Error fetching Reddit subreddit icon for r/${subreddit}:`, error);
      return null;
    }
  }

  /**
   * Fetch Reddit user icon from Reddit's JSON API using browser-like headers
   */
  static async getRedditUserIcon(username: string): Promise<string | null> {
    try {
      const response = await fetch(`https://www.reddit.com/user/${username}/about.json`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });

      if (!response.ok) {
        console.error(`Failed to fetch user info: ${response.status}`);
        return null;
      }

      const data = await response.json() as any;
      const userData = data?.data;

      if (!userData) {
        return null;
      }

      // Try icon_img first (user avatar)
      if (userData.icon_img) {
        return userData.icon_img.replace(/&amp;/g, '&');
      }

      // Fallback to snoovatar_img (Reddit's custom avatar system)
      if (userData.snoovatar_img) {
        return userData.snoovatar_img.replace(/&amp;/g, '&');
      }

      return null;
    } catch (error) {
      console.error(`Error fetching Reddit user icon for u/${username}:`, error);
      return null;
    }
  }

  /**
   * Fetch and parse an RSS feed from a URL
   */
  static async fetchFeed(url: string) {
    try {
      const feed = await parser.parseURL(url);
      return feed;
    } catch (error) {
      console.error(`Error fetching feed from ${url}:`, error);
      throw new Error(`Failed to fetch feed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract favicon/icon URL from feed URL or feed metadata
   */
  static async getFaviconUrl(feedUrl: string, feed?: any): Promise<string | undefined> {
    try {
      // Try to get from feed metadata first
      if (feed?.image?.url) {
        return feed.image.url;
      }

      // Extract base URL from feed URL
      const urlObj = new URL(feedUrl);
      const baseUrl = `${urlObj.protocol}//${urlObj.hostname}`;

      // Use Google's favicon service as a reliable fallback
      // This service fetches favicons from multiple sources and caches them
      return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=128`;
    } catch (error) {
      console.error(`Error getting favicon for ${feedUrl}:`, error);
      return undefined;
    }
  }

  /**
   * Check if a YouTube URL is a short
   */
  private static isYouTubeShort(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.startsWith('/shorts/');
    } catch (error) {
      return false;
    }
  }

  /**
   * Extract video ID from YouTube URL
   */
  private static extractYouTubeVideoId(url: string): string | null {
    try {
      const urlObj = new URL(url);

      // Handle youtube.com/watch?v=VIDEO_ID
      if (urlObj.hostname.includes('youtube.com') && urlObj.searchParams.has('v')) {
        return urlObj.searchParams.get('v');
      }

      // Handle youtu.be/VIDEO_ID
      if (urlObj.hostname === 'youtu.be') {
        return urlObj.pathname.slice(1);
      }

      // Handle youtube.com/shorts/VIDEO_ID
      const shortsMatch = urlObj.pathname.match(/^\/shorts\/([\w-]+)/);
      if (shortsMatch) {
        return shortsMatch[1];
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Format YouTube description with proper line breaks, clickable links, and timestamps
   */
  private static formatYouTubeDescription(description: string, videoId: string): string {
    if (!description) return '';

    // Escape HTML to prevent XSS but preserve text formatting
    let formatted = description
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

    // Convert URLs to clickable links (must be done before timestamps to avoid conflicts)
    // Match http(s):// URLs
    formatted = formatted.replace(
      /(https?:\/\/[^\s<]+[^\s<.,:;?!)\]]*)/gi,
      '<a href="$1" target="_blank" rel="noopener noreferrer" style="color: #3b82f6; text-decoration: underline;">$1</a>'
    );

    // Convert timestamps (MM:SS or HH:MM:SS) to clickable links that jump to that time in the video
    formatted = formatted.replace(
      /\b(\d{1,2}):(\d{2})(?::(\d{2}))?\b/g,
      (match, hours, minutes, seconds) => {
        let totalSeconds;
        if (seconds !== undefined) {
          // HH:MM:SS format
          totalSeconds = parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);
        } else {
          // MM:SS format
          totalSeconds = parseInt(hours) * 60 + parseInt(minutes);
        }
        return `<a href="https://www.youtube.com/watch?v=${videoId}&t=${totalSeconds}s" target="_blank" rel="noopener noreferrer" style="color: #3b82f6; text-decoration: none; font-weight: 500;">${match}</a>`;
      }
    );

    // Convert line breaks to <br> tags
    formatted = formatted.replace(/\n/g, '<br>');

    return `<div class="youtube-description" style="margin-top: 1rem; line-height: 1.6; color: #9ca3af; font-size: 0.875rem; white-space: pre-wrap; word-wrap: break-word;">${formatted}</div>`;
  }

  /**
   * Create YouTube embed HTML
   * Uses portrait mode (9:16) for Shorts, landscape mode (16:9) for regular videos
   */
  private static createYouTubeEmbed(videoId: string, description?: string, isShort: boolean = false): string {
    const formattedDescription = description ? this.formatYouTubeDescription(description, videoId) : '';

    // For Shorts: use fixed height approach to fit in modal (max 70vh)
    // For regular videos: use aspect ratio padding (16:9 = 56.25%)
    if (isShort) {
      return `
        <div class="youtube-embed youtube-short" style="position: relative; width: 100%; max-width: 400px; height: 70vh; max-height: 700px; margin: 1rem auto; overflow: hidden;">
          <iframe
            src="https://www.youtube.com/embed/${videoId}"
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen>
          </iframe>
        </div>
        ${formattedDescription}
      `.trim();
    } else {
      return `
        <div class="youtube-embed" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; margin: 1rem 0;">
          <iframe
            src="https://www.youtube.com/embed/${videoId}"
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen>
          </iframe>
        </div>
        ${formattedDescription}
      `.trim();
    }
  }

  /**
   * Extract Reddit video URL from content HTML
   */
  private static extractRedditVideoUrl(html: string): string | null {
    // Look for v.redd.it URLs in anchor tags or direct video sources
    const redditVideoMatch = html.match(/https?:\/\/v\.redd\.it\/[a-zA-Z0-9]+/);
    if (redditVideoMatch) {
      return redditVideoMatch[0];
    }

    // Look for preview.redd.it video URLs
    const previewVideoMatch = html.match(/https?:\/\/preview\.redd\.it\/[^"'\s]+\.mp4/);
    if (previewVideoMatch) {
      return previewVideoMatch[0];
    }

    // Look for video sources in video tags
    const videoSrcMatch = html.match(/<video[^>]*src="([^"]+)"/);
    if (videoSrcMatch) {
      return videoSrcMatch[1];
    }

    return null;
  }

  /**
   * Extract Redgifs URL from content HTML
   */
  private static extractRedgifsUrl(html: string): string | null {
    // Look for redgifs.com URLs in anchor tags
    const redgifsMatch = html.match(/https?:\/\/(?:www\.)?redgifs\.com\/watch\/([a-zA-Z0-9-_]+)/i);
    if (redgifsMatch) {
      return redgifsMatch[0];
    }

    // Also check for i.redgifs.com direct media URLs
    const directMatch = html.match(/https?:\/\/i\.redgifs\.com\/[^"'\s]+/);
    if (directMatch) {
      return directMatch[0];
    }

    return null;
  }

  /**
   * Extract Redgifs video ID from URL
   */
  private static extractRedgifsId(url: string): string | null {
    const idMatch = url.match(/\/watch\/([a-zA-Z0-9-_]+)/i);
    return idMatch ? idMatch[1] : null;
  }

  /**
   * Create Redgifs iframe embed HTML
   * Uses Redgifs' official embed which doesn't require API authentication
   * Uses taller aspect ratio (9:16) to better fit portrait-oriented videos
   */
  private static createRedgifsEmbed(watchUrl: string): string {
    const videoId = this.extractRedgifsId(watchUrl);
    if (!videoId) {
      return '';
    }

    return `
      <div class="redgifs-embed" style="position: relative; padding-bottom: 133%; height: 0; overflow: hidden; max-width: 600px; margin: 1rem auto; border-radius: 8px; background: #000;">
        <iframe
          src="https://www.redgifs.com/ifr/${videoId}?autoplay=0"
          style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
          scrolling="no"
          allowfullscreen
          allow="autoplay; fullscreen"
          sandbox="allow-scripts allow-same-origin">
        </iframe>
      </div>
    `.trim();
  }

  /**
   * Create Reddit video embed HTML
   */
  private static createRedditVideoEmbed(videoUrl: string, content: string): string {
    // Reddit videos on v.redd.it need to be accessed with /DASH_720.mp4 or similar for direct playback
    let playbackUrl = videoUrl;

    // If it's a v.redd.it URL without a quality suffix, try common resolutions
    if (videoUrl.includes('v.redd.it') && !videoUrl.includes('DASH_')) {
      // Try to find the actual video URL in the content
      const dashMatch = content.match(/https?:\/\/v\.redd\.it\/[a-zA-Z0-9]+\/DASH_[0-9]+\.mp4/);
      if (dashMatch) {
        playbackUrl = dashMatch[0];
      } else {
        // Default to trying 720p
        playbackUrl = `${videoUrl}/DASH_720.mp4`;
      }
    }

    return `
      <div class="reddit-video" style="margin: 1rem 0;">
        <video
          controls
          preload="metadata"
          style="width: 100%; max-width: 100%; height: auto; border-radius: 8px; background: #000;"
        >
          <source src="${playbackUrl}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
      </div>
    `.trim();
  }

  /**
   * Fetch Reddit gallery images using the JSON API
   * Returns array of full-resolution image URLs
   * Uses Reddit's public JSON API by appending .json to the URL
   */
  private static async fetchRedditGalleryImages(postLink: string): Promise<string[]> {
    try {
      // Convert gallery URL to JSON API URL
      // https://www.reddit.com/gallery/xxxxx -> https://www.reddit.com/gallery/xxxxx.json
      const jsonUrl = postLink.endsWith('/') ? `${postLink.slice(0, -1)}.json` : `${postLink}.json`;

      const response = await fetch(jsonUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        console.error(`Failed to fetch Reddit JSON API: ${response.status}`);
        return [];
      }

      const jsonData = await response.json() as any;
      const images: string[] = [];
      const seenUrls = new Set<string>();

      // Navigate the JSON API response structure
      // Structure: [0].data.children[0].data.media_metadata or gallery_data
      const postData = jsonData?.[0]?.data?.children?.[0]?.data;

      if (!postData) {
        console.log(`No post data found in JSON API response for: ${postLink}`);
        return [];
      }

      // Check if this is a gallery post
      const gallery = postData.gallery_data;
      const mediaMetadata = postData.media_metadata;

      if (gallery?.items && mediaMetadata) {
        console.log(`[DEBUG] Found gallery with ${gallery.items.length} items`);

        for (const item of gallery.items) {
          const mediaId = item.media_id;
          const media = mediaMetadata[mediaId];

          if (!media) continue;

          // Get the highest resolution image URL
          // Structure: media.s.u (unobfuscated URL) or media.s.gif/mp4 for animated content
          let imageUrl: string | null = null;

          if (media.s?.u) {
            imageUrl = media.s.u;
          } else if (media.s?.gif) {
            imageUrl = media.s.gif; // Animated GIF URL
          } else if (media.s?.mp4) {
            imageUrl = media.s.mp4; // Animated MP4 URL
          }

          if (imageUrl) {
            // Decode HTML entities
            imageUrl = imageUrl.replace(/&amp;/g, '&');

            // Upgrade preview.redd.it to i.redd.it for full resolution
            if (imageUrl.includes('preview.redd.it')) {
              imageUrl = imageUrl.replace('preview.redd.it', 'i.redd.it');
            }

            const cleanUrl = imageUrl.split('?')[0];
            if (!seenUrls.has(cleanUrl)) {
              seenUrls.add(cleanUrl);
              images.push(cleanUrl);
            }
          }
        }

        if (images.length > 0) {
          console.log(`Extracted ${images.length} gallery images from JSON API`);
          return images;
        }
      }

      // If not a gallery, check if it's a single image post
      if (postData.url && (postData.url.includes('i.redd.it') || postData.url.includes('preview.redd.it'))) {
        let imageUrl = postData.url.replace(/&amp;/g, '&');
        if (imageUrl.includes('preview.redd.it')) {
          imageUrl = imageUrl.replace('preview.redd.it', 'i.redd.it');
        }
        const cleanUrl = imageUrl.split('?')[0];
        if (/\.(jpg|jpeg|png|gif|webp)$/i.test(cleanUrl)) {
          images.push(cleanUrl);
          console.log(`Extracted single image from JSON API`);
          return images;
        }
      }

      console.log(`No gallery images found in JSON API for: ${postLink}`);
      return images;
    } catch (error) {
      console.error('Error fetching Reddit gallery images from JSON API:', error);
      return [];
    }
  }

  /**
   * Extract and upgrade Reddit image URLs to high resolution
   */
  private static async extractRedditImages(html: string, postLink?: string): Promise<string[]> {
    const images: string[] = [];
    const seenUrls = new Set<string>();

    // FIRST: Check if this is a gallery post and fetch images from the gallery link
    if (html.includes('/gallery/')) {
      // Extract the gallery link from the HTML content (www. is optional)
      const galleryLinkMatch = html.match(/href="(https:\/\/(?:www\.)?reddit\.com\/gallery\/[a-zA-Z0-9]+)"/);
      const galleryLink = galleryLinkMatch ? galleryLinkMatch[1] : postLink;

      if (galleryLink) {
        const galleryImages = await this.fetchRedditGalleryImages(galleryLink);
        if (galleryImages.length > 0) {
          return galleryImages; // Return gallery images directly
        }
      }
    }

    // SECOND: Match href attributes in anchor tags (Reddit wraps images in links to full-res versions)
    const hrefRegex = /<a[^>]+href="([^"]+)"[^>]*>/gi;
    let match;

    while ((match = hrefRegex.exec(html)) !== null) {
      let imageUrl = match[1];

      // Decode HTML entities
      imageUrl = imageUrl.replace(/&amp;/g, '&');

      // Look for i.redd.it URLs in hrefs (these are full resolution direct links to images)
      if (imageUrl.includes('i.redd.it') && /\.(jpg|jpeg|png|gif|webp)$/i.test(imageUrl)) {
        const cleanUrl = imageUrl.split('?')[0]; // Remove query params
        if (!seenUrls.has(cleanUrl)) {
          seenUrls.add(cleanUrl);
          images.push(cleanUrl);
        }
      }
    }

    // THIRD: Fallback to img src tags if no href images found
    const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/gi;

    while ((match = imgRegex.exec(html)) !== null) {
      let imageUrl = match[1];

      // Decode HTML entities
      imageUrl = imageUrl.replace(/&amp;/g, '&');

      // Skip external preview thumbnails (very low quality)
      if (imageUrl.includes('external-preview.redd.it')) continue;

      // Handle thumbs.redditmedia.com - try to upgrade to i.redd.it
      // thumbs URLs look like: https://b.thumbs.redditmedia.com/HASH.jpg
      // We can't reliably convert these, so skip them for now
      if (imageUrl.includes('thumbs.redditmedia.com')) continue;

      // Upgrade preview.redd.it URLs to i.redd.it for full resolution
      if (imageUrl.includes('preview.redd.it')) {
        imageUrl = imageUrl.split('?')[0]; // Remove query params
        imageUrl = imageUrl.replace('preview.redd.it', 'i.redd.it');
      }

      // Only include Reddit-hosted images we haven't seen yet
      if (imageUrl.includes('i.redd.it')) {
        const cleanUrl = imageUrl.split('?')[0];
        if (!seenUrls.has(cleanUrl)) {
          seenUrls.add(cleanUrl);
          images.push(cleanUrl);
        }
      }
    }

    return images;
  }

  /**
   * Process Reddit content to improve image quality and display
   */
  private static async processRedditImages(html: string, postLink?: string): Promise<string> {
    try {
      const images = await this.extractRedditImages(html, postLink);

      // Ensure images is an array
      if (!Array.isArray(images) || images.length === 0) {
        return html;
      }

      // Remove all existing img tags and their wrapper links
      let processed = html.replace(/<a[^>]*>\s*<img[^>]*>\s*<\/a>/gi, '');
      processed = processed.replace(/<img[^>]*>/gi, '');

      // Create clean image gallery with high-res images
      const imageElements = images.map((url: string) =>
        `<img src="${url}" style="width: 100%; height: auto; border-radius: 8px; margin: 0.5rem 0;" />`
      ).join('\n');

      const gallery = `
        <div class="reddit-gallery" style="margin: 1rem 0;">
          ${imageElements}
        </div>
      `.trim();

      // Prepend gallery to content
      return gallery + '\n' + processed;
    } catch (error) {
      console.error('Error processing Reddit images:', error);
      return html; // Return original HTML on error
    }
  }

  /**
   * Fetch and store feed items for a specific source
   */
  static async fetchAndStoreItems(source: Source): Promise<number> {
    try {
      const feed = await this.fetchFeed(source.url);
      let newItemsCount = 0;

      for (const item of feed.items as ParsedFeedItem[]) {
        // Check if item already exists
        const existing = db.prepare('SELECT id FROM feed_items WHERE link = ? AND source_id = ?')
          .get(item.link, source.id);

        if (existing) continue;

        // Apply YouTube shorts filter if this is a YouTube source
        if (source.type === 'youtube' && item.link) {
          const isShort = this.isYouTubeShort(item.link);
          const shortsFilter = (source as any).youtubeShortsFilter || 'all';

          // Skip if filter doesn't match
          if (shortsFilter === 'exclude' && isShort) continue;
          if (shortsFilter === 'only' && !isShort) continue;
        }

        // Extract image URL from various possible locations
        const imageUrl = this.extractImageUrl(item);

        // Extract content - for YouTube, create embedded player
        let content = (item as any).contentEncoded || item.content || item.description || '';

        // If this is a YouTube source, create embedded video
        if (source.type === 'youtube' && item.link) {
          const videoId = this.extractYouTubeVideoId(item.link);
          if (videoId) {
            // Get description from multiple possible locations
            let description = '';

            // Try media:group['media:description'] (can be array or string)
            const mediaDesc = item.mediaGroup?.['media:description'];
            if (mediaDesc) {
              if (Array.isArray(mediaDesc)) {
                const firstDesc = mediaDesc[0];
                if (typeof firstDesc === 'object' && '_' in firstDesc) {
                  description = firstDesc._ || '';
                } else if (typeof firstDesc === 'string') {
                  description = firstDesc;
                }
              } else if (typeof mediaDesc === 'string') {
                description = mediaDesc;
              } else if (typeof mediaDesc === 'object' && '_' in mediaDesc) {
                description = (mediaDesc as any)._ || '';
              }
            }

            // Fallback to description field
            if (!description && item.description) {
              description = item.description;
            }

            // Detect if this is a Short to use portrait mode
            const isShort = this.isYouTubeShort(item.link);
            content = this.createYouTubeEmbed(videoId, description, isShort);
          }
        }

        // If this is a Reddit source, process video and image content
        if (source.type === 'reddit' && content) {
          // FIRST: Check for Redgifs content
          const redgifsUrl = this.extractRedgifsUrl(content);
          if (redgifsUrl) {
            // Handle Redgifs posts with iframe embed
            const redgifsEmbed = this.createRedgifsEmbed(redgifsUrl);
            if (redgifsEmbed) {
              // Remove ALL anchor tags from the content to prevent clicking through
              // This is aggressive but necessary since Reddit wraps everything in links
              content = content.replace(/<a[^>]*>.*?<\/a>/gis, '');
              // Also remove any remaining standalone anchor tags
              content = content.replace(/<\/?a[^>]*>/gi, '');
              // Remove images that might be Redgifs thumbnails
              content = content.replace(/<img[^>]*src="[^"]*redgifs\.com[^"]*"[^>]*>/gi, '');
              content = content.replace(/<img[^>]*src="[^"]*external-preview\.redd\.it[^"]*"[^>]*>/gi, '');
              // Prepend the Redgifs embed to the content
              content = redgifsEmbed + '\n' + content;
              console.log(`Embedded Redgifs iframe: ${redgifsUrl}`);
            }
          } else {
            // SECOND: Check for Reddit native videos
            const videoUrl = this.extractRedditVideoUrl(content);
            if (videoUrl) {
              // Handle video posts
              const videoEmbed = this.createRedditVideoEmbed(videoUrl, content);
              // Remove any anchor tags wrapping video links to prevent navigation on click
              content = content.replace(/<a[^>]*href="[^"]*v\.redd\.it[^"]*"[^>]*>.*?<\/a>/gi, '');
              content = content.replace(/<a[^>]*href="[^"]*preview\.redd\.it[^"]*"[^>]*>.*?<\/a>/gi, '');
              // Remove images that are video thumbnails (usually from preview.redd.it or i.redd.it)
              content = content.replace(/<img[^>]*src="[^"]*preview\.redd\.it[^"]*"[^>]*>/gi, '');
              content = content.replace(/<img[^>]*src="[^"]*external-preview\.redd\.it[^"]*"[^>]*>/gi, '');
              // Prepend the video embed to the content
              content = videoEmbed + '\n' + content;
            } else {
              // THIRD: Handle image posts - upgrade to high resolution and remove link wrappers
              content = await this.processRedditImages(content, item.link);
            }
          }
        }

        const excerpt = this.createExcerpt(item.contentSnippet || item.description || content);

        // Create feed item
        const feedItem: Omit<FeedItem, 'createdAt'> & { createdAt: number } = {
          id: randomUUID(),
          sourceId: source.id,
          title: item.title || 'Untitled',
          link: item.link || '',
          content,
          excerpt,
          author: item.creator || item.author,
          publishedAt: item.pubDate ? new Date(item.pubDate) : undefined,
          imageUrl,
          read: false,
          saved: false,
          createdAt: Date.now(),
        };

        // Insert into database
        db.prepare(`
          INSERT INTO feed_items (
            id, source_id, title, link, content, excerpt, author, published_at, image_url, read, saved, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          feedItem.id,
          feedItem.sourceId,
          feedItem.title,
          feedItem.link,
          feedItem.content,
          feedItem.excerpt,
          feedItem.author,
          feedItem.publishedAt?.getTime(),
          feedItem.imageUrl,
          feedItem.read ? 1 : 0,
          feedItem.saved ? 1 : 0,
          feedItem.createdAt
        );

        newItemsCount++;
      }

      // Update last fetched timestamp
      db.prepare('UPDATE sources SET last_fetched_at = ? WHERE id = ?')
        .run(Date.now(), source.id);

      console.log(`Fetched ${newItemsCount} new items for source: ${source.name}`);
      return newItemsCount;
    } catch (error) {
      console.error(`Error fetching items for source ${source.name}:`, error);
      throw error;
    }
  }

  /**
   * Fetch items for all sources belonging to a user
   */
  static async fetchAllUserSources(userId: string): Promise<void> {
    const sources = db.prepare('SELECT * FROM sources WHERE user_id = ?')
      .all(userId) as any[];

    for (const sourceRow of sources) {
      const source = this.rowToSource(sourceRow);
      try {
        await this.fetchAndStoreItems(source);
      } catch (error) {
        console.error(`Failed to fetch source ${source.name}:`, error);
        // Continue with other sources even if one fails
      }
    }
  }

  /**
   * Fetch items for all sources (used by cron job)
   */
  static async fetchAllSources(): Promise<void> {
    const sources = db.prepare('SELECT * FROM sources').all() as any[];

    for (const sourceRow of sources) {
      const source = this.rowToSource(sourceRow);
      try {
        await this.fetchAndStoreItems(source);
      } catch (error) {
        console.error(`Failed to fetch source ${source.name}:`, error);
        // Continue with other sources even if one fails
      }
    }
  }

  /**
   * Extract image URL from various feed item formats
   */
  private static extractImageUrl(item: ParsedFeedItem): string | undefined {
    // Try media:group (YouTube uses this)
    if (item.mediaGroup) {
      // Try media:thumbnail in media:group
      const thumbnails = item.mediaGroup['media:thumbnail'];
      if (thumbnails && Array.isArray(thumbnails) && thumbnails.length > 0) {
        // Get the largest thumbnail (last one is usually highest resolution)
        const thumbnail = thumbnails[thumbnails.length - 1];
        if (thumbnail?.$ && thumbnail.$.url) {
          return thumbnail.$.url;
        }
      }

      // Try media:content in media:group
      const mediaContent = item.mediaGroup['media:content'];
      if (mediaContent && Array.isArray(mediaContent) && mediaContent.length > 0) {
        const content = mediaContent[0];
        if (content?.$ && content.$.url) {
          return content.$.url;
        }
      }
    }

    // Try media:thumbnail directly
    if (item.mediaThumbnail) {
      if (Array.isArray(item.mediaThumbnail) && item.mediaThumbnail.length > 0) {
        const thumbnail = item.mediaThumbnail[item.mediaThumbnail.length - 1];
        if (thumbnail?.$ && thumbnail.$.url) {
          return thumbnail.$.url;
        }
      } else if (typeof item.mediaThumbnail === 'object' && '$' in item.mediaThumbnail) {
        return item.mediaThumbnail.$.url;
      }
    }

    // Try media:content
    if (item.media && typeof item.media === 'object' && '$' in item.media) {
      return item.media.$.url;
    }

    // Try enclosure
    if (item.enclosure?.url) {
      return item.enclosure.url;
    }

    // Try to find image in content
    const content = (item as any).contentEncoded || item.content || item.description || '';
    const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
    if (imgMatch) {
      return imgMatch[1];
    }

    return undefined;
  }

  /**
   * Create excerpt from content
   */
  private static createExcerpt(text: string, maxLength: number = 200): string {
    // Strip HTML tags
    const stripped = text.replace(/<[^>]*>/g, '');
    // Truncate
    if (stripped.length <= maxLength) return stripped;
    return stripped.substring(0, maxLength).trim() + '...';
  }

  /**
   * Update source icon URL by fetching it from the feed
   */
  static async updateSourceIcon(sourceId: string, url: string): Promise<void> {
    try {
      const feed = await this.fetchFeed(url);
      const iconUrl = await this.getFaviconUrl(url, feed);

      if (iconUrl) {
        db.prepare('UPDATE sources SET icon_url = ?, updated_at = ? WHERE id = ?')
          .run(iconUrl, Date.now(), sourceId);
        console.log(`Updated icon for source ${sourceId}: ${iconUrl}`);
      }
    } catch (error) {
      console.error(`Failed to update icon for source ${sourceId}:`, error);
    }
  }

  /**
   * Update icons for all sources that don't have one
   */
  static async updateMissingIcons(): Promise<void> {
    const sources = db.prepare('SELECT * FROM sources WHERE icon_url IS NULL').all() as any[];

    console.log(`Updating icons for ${sources.length} sources...`);

    for (const sourceRow of sources) {
      const source = this.rowToSource(sourceRow);
      await this.updateSourceIcon(source.id, source.url);
    }

    console.log('Finished updating source icons');
  }

  /**
   * Convert database row to Source object
   */
  private static rowToSource(row: any): Source {
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      url: row.url,
      type: row.type || 'rss',
      channelId: row.channel_id,
      subreddit: row.subreddit,
      redditUsername: row.reddit_username,
      redditSourceType: row.reddit_source_type,
      youtubeShortsFilter: row.youtube_shorts_filter || 'all',
      iconUrl: row.icon_url,
      description: row.description,
      category: row.category,
      fetchInterval: row.fetch_interval,
      lastFetchedAt: row.last_fetched_at ? new Date(row.last_fetched_at) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}

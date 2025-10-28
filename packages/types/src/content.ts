import { z } from 'zod';

// Source types
export type ContentSourceType = 'rss' | 'reddit' | 'youtube' | 'twitter' | 'mastodon' | 'bluesky';

export type MediaType = 'image' | 'video' | 'audio' | 'embed';

// Content source
export interface ContentSource {
  type: ContentSourceType;
  name: string;
  url: string;
  icon?: string;
}

export const contentSourceSchema = z.object({
  type: z.enum(['rss', 'reddit', 'youtube', 'twitter', 'mastodon', 'bluesky']),
  name: z.string(),
  url: z.string().url(),
  icon: z.string().url().optional(),
});

// Content media
export interface ContentMedia {
  type: MediaType;
  url: string;
  thumbnail?: string;
  embedUrl?: string;
  width?: number;
  height?: number;
  alt?: string;
}

export const contentMediaSchema = z.object({
  type: z.enum(['image', 'video', 'audio', 'embed']),
  url: z.string().url(),
  thumbnail: z.string().url().optional(),
  embedUrl: z.string().url().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  alt: z.string().optional(),
});

// Content author
export interface ContentAuthor {
  name: string;
  url?: string;
  avatar?: string;
}

export const contentAuthorSchema = z.object({
  name: z.string(),
  url: z.string().url().optional(),
  avatar: z.string().url().optional(),
});

// Content body
export interface ContentBody {
  text: string;
  html?: string;
  excerpt?: string;
}

export const contentBodySchema = z.object({
  text: z.string(),
  html: z.string().optional(),
  excerpt: z.string().optional(),
});

// Main ContentItem interface
export interface ContentItem {
  id: string;
  source: ContentSource;
  title: string;
  content: ContentBody;
  media?: ContentMedia[];
  author?: ContentAuthor;
  publishedAt: Date;
  url: string;
  isRead?: boolean;
  isSaved?: boolean;
  tags?: string[];
  category?: string;
  language?: string;
}

export const contentItemSchema = z.object({
  id: z.string(),
  source: contentSourceSchema,
  title: z.string(),
  content: contentBodySchema,
  media: z.array(contentMediaSchema).optional(),
  author: contentAuthorSchema.optional(),
  publishedAt: z.date(),
  url: z.string().url(),
  isRead: z.boolean().optional(),
  isSaved: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  language: z.string().length(2).optional(),
});

// Type inference from schema
export type ContentItemDTO = z.infer<typeof contentItemSchema>;

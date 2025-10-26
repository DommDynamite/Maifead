export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  userId: string;
  themeMode: 'light' | 'dark';
  themePreset: string;
  viewMode: 'detailed' | 'compact';
  feedLayout: 'single' | 'double' | 'triple';
}

export interface Source {
  id: string;
  userId: string;
  name: string;
  url: string;
  iconUrl?: string;
  description?: string;
  category?: string;
  fetchInterval: number;
  lastFetchedAt?: Date;
  whitelistKeywords?: string[];
  blacklistKeywords?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FeedItem {
  id: string;
  sourceId: string;
  title: string;
  link: string;
  content?: string;
  excerpt?: string;
  author?: string;
  publishedAt?: Date;
  imageUrl?: string;
  read: boolean;
  saved: boolean;
  createdAt: Date;
}

export interface Collection {
  id: string;
  userId: string;
  name: string;
  color: string;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CollectionItem {
  collectionId: string;
  feedItemId: string;
  addedAt: Date;
}

// API request/response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  username: string;
  displayName: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'passwordHash'>;
  token: string;
}

export interface CreateSourceRequest {
  name: string;
  url: string;
  category?: string;
  whitelistKeywords?: string[];
  blacklistKeywords?: string[];
}

export interface UpdateSourceRequest {
  name?: string;
  category?: string;
  fetchInterval?: number;
  whitelistKeywords?: string[];
  blacklistKeywords?: string[];
}

export interface CreateCollectionRequest {
  name: string;
  color: string;
  icon?: string;
}

export interface UpdateCollectionRequest {
  name?: string;
  color?: string;
  icon?: string;
}

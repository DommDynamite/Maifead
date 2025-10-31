// Use the local network IP for mobile access, fallback to localhost for desktop
const getApiUrl = () => {
  // Check if VITE_API_URL is defined in environment
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Try to detect if we're on mobile by checking if we're accessing via a network IP
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;

  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    // Use same protocol as the page (http/https) and appropriate port
    const port = protocol === 'https:' ? '' : ':3001';
    return `${protocol}//${hostname}${port}/api`;
  }
  return 'http://localhost:3001/api';
};

const API_URL = getApiUrl();

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth-token', token);
    } else {
      localStorage.removeItem('auth-token');
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth-token');
    }
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async signup(data: {
    email: string;
    username: string;
    displayName: string;
    password: string;
  }) {
    const result = await this.request<{ user: any; token: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(result.token);
    return result;
  }

  async login(email: string, password: string) {
    const result = await this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(result.token);
    return result;
  }

  async getMe() {
    return this.request<any>('/auth/me');
  }

  async updateProfile(updates: { displayName?: string; username?: string; email?: string }) {
    return this.request<any>('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteAccount() {
    return this.request<{ message: string }>('/auth/me', {
      method: 'DELETE',
    });
  }

  // Sources endpoints
  async getSources() {
    return this.request<any[]>('/sources');
  }

  async createSource(data: { name: string; url: string; type?: string; channelId?: string; subreddit?: string; redditUsername?: string; redditSourceType?: string; redditMinUpvotes?: number; youtubeShortsFilter?: string; blueskyHandle?: string; blueskyDid?: string; blueskyFeedUri?: string; category?: string; retentionDays?: number; suppressFromMainFeed?: boolean; whitelistKeywords?: string[]; blacklistKeywords?: string[]; collectionIds?: string[] }) {
    return this.request<any>('/sources', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSource(id: string, data: { name?: string; category?: string; redditMinUpvotes?: number; youtubeShortsFilter?: string; retentionDays?: number; suppressFromMainFeed?: boolean; whitelistKeywords?: string[]; blacklistKeywords?: string[] }) {
    return this.request<any>(`/sources/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteSource(id: string) {
    return this.request<{ message: string }>(`/sources/${id}`, {
      method: 'DELETE',
    });
  }

  async refreshSource(id: string) {
    return this.request<{ message: string; newItemsCount: number }>(`/sources/${id}/refresh`, {
      method: 'POST',
    });
  }

  async refreshAllSources() {
    return this.request<{ message: string; totalNewItems: number; sourcesRefreshed: number }>(`/sources/refresh-all`, {
      method: 'POST',
    });
  }

  // Feed items endpoints
  async getFeedItems(params?: {
    sourceId?: string;
    read?: boolean;
    saved?: boolean;
    limit?: number;
    offset?: number;
  }) {
    const query = new URLSearchParams();
    if (params?.sourceId) query.append('sourceId', params.sourceId);
    if (params?.read !== undefined) query.append('read', String(params.read));
    if (params?.saved !== undefined) query.append('saved', String(params.saved));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.offset) query.append('offset', String(params.offset));

    const queryString = query.toString();
    return this.request<any[]>(`/feed-items${queryString ? `?${queryString}` : ''}`);
  }

  async getFeedItem(id: string) {
    return this.request<any>(`/feed-items/${id}`);
  }

  async markItemRead(id: string, read: boolean) {
    return this.request<{ message: string }>(`/feed-items/${id}/read`, {
      method: 'PATCH',
      body: JSON.stringify({ read }),
    });
  }

  async markItemSaved(id: string, saved: boolean) {
    return this.request<{ message: string }>(`/feed-items/${id}/saved`, {
      method: 'PATCH',
      body: JSON.stringify({ saved }),
    });
  }

  async markAllRead(sourceId?: string) {
    const query = sourceId ? `?sourceId=${sourceId}` : '';
    return this.request<{ message: string }>(`/feed-items/mark-all-read${query}`, {
      method: 'POST',
    });
  }

  // Collections endpoints
  async getCollections() {
    return this.request<any[]>('/collections');
  }

  async getCollection(id: string) {
    return this.request<any>(`/collections/${id}`);
  }

  async createCollection(data: { name: string; color: string; icon?: string }) {
    return this.request<any>('/collections', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCollection(id: string, data: { name?: string; color?: string; icon?: string; isPublic?: boolean }) {
    return this.request<any>(`/collections/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getCollectionSubscriberCount(id: string): Promise<number> {
    const result = await this.request<{ count: number }>(`/collections/${id}/subscribers`);
    return result.count;
  }

  async getPublicCollections(params?: { search?: string }): Promise<any[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);

    const queryString = query.toString();
    return this.request<any[]>(`/collections/public${queryString ? `?${queryString}` : ''}`);
  }

  async getPublicCollection(id: string): Promise<any> {
    return this.request<any>(`/collections/public/${id}`);
  }

  async deleteCollection(id: string) {
    return this.request<{ message: string }>(`/collections/${id}`, {
      method: 'DELETE',
    });
  }

  async addItemToCollection(collectionId: string, itemId: string) {
    return this.request<{ message: string }>(`/collections/${collectionId}/items/${itemId}`, {
      method: 'POST',
    });
  }

  async removeItemFromCollection(collectionId: string, itemId: string) {
    return this.request<{ message: string }>(`/collections/${collectionId}/items/${itemId}`, {
      method: 'DELETE',
    });
  }

  // Feads endpoints
  async getFeads() {
    return this.request<any[]>('/feads');
  }

  async getFead(id: string) {
    return this.request<any>(`/feads/${id}`);
  }

  async createFead(data: { name: string; icon: string; isImportant?: boolean; sourceIds: string[] }) {
    return this.request<any>('/feads', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateFead(id: string, data: { name?: string; icon?: string; isImportant?: boolean; sourceIds?: string[] }) {
    return this.request<any>(`/feads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteFead(id: string) {
    return this.request<{ message: string }>(`/feads/${id}`, {
      method: 'DELETE',
    });
  }

  async markFeadAsRead(id: string) {
    return this.request<{ message: string; itemsMarked: number }>(`/feads/${id}/mark-all-read`, {
      method: 'POST',
    });
  }

  // Admin endpoints
  async getUsers() {
    return this.request<{ users: any[] }>('/admin/users');
  }

  async approveUser(userId: string) {
    return this.request<{ message: string }>(`/admin/users/${userId}/approve`, {
      method: 'POST',
    });
  }

  async banUser(userId: string) {
    return this.request<{ message: string }>(`/admin/users/${userId}/ban`, {
      method: 'POST',
    });
  }

  async unbanUser(userId: string) {
    return this.request<{ message: string }>(`/admin/users/${userId}/unban`, {
      method: 'POST',
    });
  }

  async getInviteCodes() {
    return this.request<{ inviteCodes: any[] }>('/admin/invite-codes');
  }

  async generateInviteCode(expiresInDays?: number) {
    return this.request<{ inviteCode: any }>('/admin/invite-codes', {
      method: 'POST',
      body: JSON.stringify({ expiresInDays }),
    });
  }

  async deleteInviteCode(codeId: string) {
    return this.request<{ message: string }>(`/admin/invite-codes/${codeId}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient();

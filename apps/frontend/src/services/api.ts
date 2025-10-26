const API_URL = 'http://localhost:3001/api';

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
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
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

  async createSource(data: { name: string; url: string; category?: string }) {
    return this.request<any>('/sources', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSource(id: string, data: { name?: string; category?: string; whitelistKeywords?: string[]; blacklistKeywords?: string[] }) {
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

  async updateCollection(id: string, data: { name?: string; color?: string; icon?: string }) {
    return this.request<any>(`/collections/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
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
}

export const api = new ApiClient();

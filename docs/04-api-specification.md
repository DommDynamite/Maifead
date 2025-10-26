# API Specification

## Overview
RESTful API built with NestJS. All endpoints require authentication except `/auth/register` and `/auth/login`.

**Base URL:** `http://localhost:3000/api`

**Authentication:** Session-based with HTTP-only cookies (Lucia)

---

## Authentication Endpoints

### POST `/auth/register`
Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe" // optional
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Cookies Set:**
- `session` (HTTP-only, secure, SameSite=Lax)

**Errors:**
- `400` - Validation error (weak password, invalid email)
- `409` - Email already exists

---

### POST `/auth/login`
Authenticate existing user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Cookies Set:**
- `session` (HTTP-only, secure, SameSite=Lax)

**Errors:**
- `400` - Validation error
- `401` - Invalid credentials

---

### POST `/auth/logout`
End current session.

**Response:** `200 OK`
```json
{
  "message": "Logged out successfully"
}
```

**Cookies Cleared:**
- `session`

---

### GET `/auth/me`
Get current authenticated user.

**Response:** `200 OK`
```json
{
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-03-15T10:30:00Z"
  },
  "preferences": {
    "theme": "dark",
    "language": "en",
    "itemsPerPage": 50
  }
}
```

**Errors:**
- `401` - Not authenticated

---

## Feed Source Endpoints

### GET `/feeds`
Get all feed sources for authenticated user.

**Query Parameters:**
- `enabled` (boolean, optional) - Filter by enabled status

**Response:** `200 OK`
```json
{
  "feeds": [
    {
      "id": "uuid-1",
      "type": "rss",
      "url": "https://css-tricks.com/feed/",
      "name": "CSS-Tricks",
      "icon": "https://css-tricks.com/favicon.ico",
      "enabled": true,
      "createdAt": "2024-03-10T10:00:00Z",
      "lastFetched": "2024-03-15T09:30:00Z",
      "fetchError": null
    },
    {
      "id": "uuid-2",
      "type": "rss",
      "url": "https://blog.rust-lang.org/feed.xml",
      "name": "Rust Blog",
      "icon": "https://www.rust-lang.org/favicon.ico",
      "enabled": true,
      "createdAt": "2024-03-12T14:20:00Z",
      "lastFetched": "2024-03-15T09:30:00Z",
      "fetchError": null
    }
  ],
  "total": 2
}
```

---

### POST `/feeds`
Add a new feed source.

**Request:**
```json
{
  "type": "rss",
  "url": "https://example.com/feed.xml",
  "name": "My Favorite Blog" // optional, will auto-detect from feed
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid-new",
  "type": "rss",
  "url": "https://example.com/feed.xml",
  "name": "My Favorite Blog",
  "icon": "https://example.com/favicon.ico",
  "enabled": true,
  "createdAt": "2024-03-15T10:45:00Z",
  "lastFetched": null,
  "fetchError": null
}
```

**Errors:**
- `400` - Invalid URL or feed format
- `409` - Feed already exists for this user
- `422` - Unable to fetch or parse feed

---

### PATCH `/feeds/:id`
Update feed source settings.

**Request:**
```json
{
  "name": "Updated Name",
  "enabled": false
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid-1",
  "type": "rss",
  "url": "https://example.com/feed.xml",
  "name": "Updated Name",
  "enabled": false,
  // ... rest of fields
}
```

**Errors:**
- `404` - Feed not found or doesn't belong to user

---

### DELETE `/feeds/:id`
Remove a feed source.

**Response:** `204 No Content`

**Errors:**
- `404` - Feed not found or doesn't belong to user

---

### POST `/feeds/:id/refresh`
Manually trigger refresh for a specific feed.

**Response:** `200 OK`
```json
{
  "itemsCount": 25,
  "lastFetched": "2024-03-15T10:50:00Z"
}
```

**Errors:**
- `404` - Feed not found
- `422` - Unable to fetch feed

---

## Content Endpoints

### GET `/content`
Get unified feed of content from all enabled sources.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 50, max: 100)
- `includeRead` (boolean, default: true) - Include already-read items
- `sourceType` (SourceType, optional) - Filter by source type
- `search` (string, optional) - Keyword search in title/content
- `refresh` (boolean, default: false) - Force refresh all feeds

**Response:** `200 OK`
```json
{
  "items": [
    {
      "id": "content-id-1",
      "source": {
        "type": "rss",
        "name": "CSS-Tricks",
        "url": "https://css-tricks.com/feed/",
        "icon": "https://css-tricks.com/favicon.ico"
      },
      "title": "Understanding CSS Grid Layout",
      "content": {
        "text": "CSS Grid Layout is a powerful tool...",
        "html": "<p>CSS Grid Layout is a <strong>powerful tool</strong>...</p>",
        "excerpt": "CSS Grid Layout is a powerful tool for creating complex layouts..."
      },
      "media": [
        {
          "type": "image",
          "url": "https://css-tricks.com/images/grid.png",
          "width": 1200,
          "height": 630,
          "alt": "CSS Grid example"
        }
      ],
      "author": {
        "name": "Chris Coyier",
        "url": "https://css-tricks.com/author/chriscoyier/",
        "avatar": "https://css-tricks.com/avatars/chris.jpg"
      },
      "publishedAt": "2024-03-15T10:30:00Z",
      "url": "https://css-tricks.com/understanding-css-grid-layout/",
      "isRead": false,
      "isSaved": false,
      "tags": ["css", "grid", "layout"],
      "language": "en"
    }
    // ... more items
  ],
  "total": 247,
  "page": 1,
  "hasMore": true
}
```

**Notes:**
- Items sorted by `publishedAt` descending (newest first)
- Backend fetches from RSS feeds, normalizes to `ContentItem[]`
- Attaches `isRead` and `isSaved` from database
- Caching: Backend may cache feed data for 5-15 minutes

**Errors:**
- `401` - Not authenticated
- `500` - Error fetching feeds

---

### GET `/content/:id`
Get a single content item by ID.

**Response:** `200 OK`
```json
{
  // Single ContentItem object
  "id": "content-id-1",
  "source": { ... },
  // ... full ContentItem
}
```

**Errors:**
- `404` - Content not found or not accessible to user

---

### POST `/content/:id/read`
Mark content as read or unread.

**Request:**
```json
{
  "read": true
}
```

**Response:** `200 OK`
```json
{
  "contentId": "content-id-1",
  "isRead": true,
  "readAt": "2024-03-15T10:55:00Z"
}
```

**Notes:**
- Creates or deletes `ReadState` record
- `contentId` is hash of content URL (stable identifier)

---

### POST `/content/:id/save`
Mark content as saved or unsaved.

**Request:**
```json
{
  "saved": true
}
```

**Response:** `200 OK`
```json
{
  "contentId": "content-id-1",
  "isSaved": true,
  "savedAt": "2024-03-15T10:56:00Z"
}
```

---

### POST `/content/mark-all-read`
Mark all current feed items as read.

**Request:**
```json
{
  "before": "2024-03-15T00:00:00Z" // optional, mark all before this date
}
```

**Response:** `200 OK`
```json
{
  "markedCount": 123
}
```

---

## User Preferences Endpoints

### GET `/preferences`
Get user preferences.

**Response:** `200 OK`
```json
{
  "theme": "dark",
  "language": "en",
  "itemsPerPage": 50,
  "autoMarkAsRead": false,
  "showReadItems": true,
  "defaultSort": "chronological",
  "emailNotifications": false
}
```

---

### PATCH `/preferences`
Update user preferences.

**Request:**
```json
{
  "theme": "light",
  "itemsPerPage": 75
}
```

**Response:** `200 OK`
```json
{
  // Updated full preferences object
  "theme": "light",
  "language": "en",
  "itemsPerPage": 75,
  // ...
}
```

---

## Filter Endpoints (Future)

### GET `/filters`
Get all user-defined filters.

### POST `/filters`
Create a new filter rule.

### PATCH `/filters/:id`
Update a filter rule.

### DELETE `/filters/:id`
Delete a filter rule.

---

## Error Response Format

All errors follow this structure:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ],
  "timestamp": "2024-03-15T10:30:00Z",
  "path": "/api/auth/register"
}
```

**Common Status Codes:**
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (authenticated but not allowed)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `422` - Unprocessable Entity (external service error)
- `429` - Too Many Requests (rate limiting)
- `500` - Internal Server Error

---

## Rate Limiting

**Auth endpoints:**
- 5 requests per minute per IP

**Other endpoints:**
- 100 requests per minute per user

**Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1710498600
```

---

## Caching Strategy

### Backend Caching
- **Feed data:** Cached for 5-15 minutes (configurable per feed)
- **Content list:** No caching (always fresh with cached feed data)
- **User preferences:** Cached in-memory for session duration

### Frontend Caching (TanStack Query)
- **Content:** `staleTime: 5 minutes`, `cacheTime: 30 minutes`
- **Feed sources:** `staleTime: Infinity` (update on mutation)
- **Preferences:** `staleTime: Infinity`

### Cache Headers
```
Cache-Control: private, max-age=300  // 5 minutes for content
ETag: "abc123"                       // For conditional requests
```

---

## WebSocket Endpoints (Future)

For real-time updates:

### WS `/ws/updates`
```json
// Server → Client
{
  "type": "new_content",
  "count": 5,
  "sources": ["CSS-Tricks", "Rust Blog"]
}
```

---

## API Versioning

**Current:** No versioning (MVP)

**Future:** Version in URL
- `/api/v1/content`
- `/api/v2/content`

Or header-based:
```
Accept: application/vnd.maifead.v1+json
```

---

## Example API Client (Frontend)

```typescript
// apps/frontend/src/api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true, // Include cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use((config) => {
  // Add CSRF token if needed
  return config;
});

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### TanStack Query Usage

```typescript
// apps/frontend/src/api/queries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './client';
import type { ContentItem } from '@maifead/types';

export const useContent = (params?: GetContentParams) => {
  return useQuery({
    queryKey: ['content', params],
    queryFn: async () => {
      const { data } = await apiClient.get<GetContentResponse>('/content', {
        params,
      });
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contentId, read }: { contentId: string; read: boolean }) => {
      const { data } = await apiClient.post(`/content/${contentId}/read`, { read });
      return data;
    },
    onSuccess: () => {
      // Invalidate content query to refresh
      queryClient.invalidateQueries({ queryKey: ['content'] });
    },
  });
};
```

---

## Security Considerations

### Authentication
- Passwords hashed with Lucia (bcrypt/argon2)
- HTTP-only cookies (prevent XSS theft)
- SameSite=Lax (CSRF protection)
- Secure flag in production (HTTPS only)

### Input Validation
- All inputs validated with Zod schemas
- SQL injection prevented by Prisma ORM
- HTML sanitized before storage/rendering

### CORS
```typescript
// apps/backend/src/main.ts
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
});
```

### Rate Limiting
- Implemented with `@nestjs/throttler`
- Prevent brute force attacks
- Protect against DoS

---

## Testing the API

### cURL Examples

**Register:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123!"}'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"test@example.com","password":"SecurePass123!"}'
```

**Get Content:**
```bash
curl http://localhost:3000/api/content \
  -b cookies.txt
```

### Postman/Insomnia Collection
(Future: Export collection for easy testing)

---

This API design prioritizes simplicity (RESTful), security (session-based auth), and performance (caching strategy).

# Custom API Client

## Cấu hình

### Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:5283
```

## Sử dụng

### 1. Import
```typescript
import { fetchRest } from '@/lib/custom-api/rest-client'
import { endpoints } from '@/lib/custom-api/endpoints'
```

### 2. Gọi API với Authentication (Supabase JWT)

```typescript
// GET request với auth
const { data, error } = await fetchRest(
  endpoints.socialAccountsByUser(userId),
  {
    method: 'GET',
    requireAuth: true  // Tự động thêm Supabase JWT token
  }
)

// POST request với auth
const { data, error } = await fetchRest(
  endpoints.createPost(),
  {
    method: 'POST',
    body: {
      userId: user.id,
      socialAccountId: accountId,
      socialTargetId: targetId,
      message: 'Hello World',
      published: true
    },
    requireAuth: true
  }
)
```

### 3. Gọi API không cần Authentication

```typescript
const { data, error } = await fetchRest(
  '/public-endpoint',
  {
    method: 'GET',
    requireAuth: false  // Không cần token
  }
)
```

## Backend Endpoints

### Social Accounts
- `GET /api/social/accounts/user/{userId}` - Lấy danh sách social accounts
- `DELETE /api/social-auth/unlink/{userId}/{socialAccountId}` - Unlink account

### Facebook OAuth
- `GET /api/social-auth/facebook` - Lấy auth URL
- `GET /api/social-auth/facebook/callback` - OAuth callback
- `POST /api/social-auth/link-page-token` - Link page bằng token

### Available Targets & Linking
- `GET /api/social-auth/{provider}/available-targets` - Lấy danh sách pages/targets
- `POST /api/social-auth/link-selected` - Link selected targets

### Content/Posts
- `POST /api/content` - Tạo content/post mới
- `POST /api/content/{contentId}/publish/{integrationId}` - Publish content
- `GET /api/content/{contentId}` - Lấy content theo ID
- `GET /api/content` - Lấy tất cả content của user

### Users
- `GET /api/users/profile` - Lấy user profile (với Supabase JWT)
- `GET /api/users/social-accounts` - Lấy social accounts (cần [Authorize])
- `GET /api/users` - Lấy danh sách users (paginated)

## Authentication Flow

1. **Frontend**: User login qua Supabase
2. **Frontend**: Supabase trả về JWT token
3. **Frontend**: `fetchRest` tự động lấy token từ Supabase session
4. **Frontend**: Gửi request với header `Authorization: Bearer <supabase_jwt>`
5. **Backend**: Validate JWT với `SUPABASE_JWT_SECRET`
6. **Backend**: Extract user info từ JWT claims (`sub`, `email`)

## Error Handling

```typescript
const { data, error } = await fetchRest(endpoint, options)

if (error) {
  console.error('API Error:', error.message)
  // error.status - HTTP status code
  // error.message - Error message
  return
}

// Use data
console.log('Success:', data)
```

## Debugging

### Check Backend is Running
```bash
curl http://localhost:5283/api/users/profile
```

### Check Supabase Token
```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { data: { session } } = await supabase.auth.getSession()
console.log('Access Token:', session?.access_token)
```

### Common Issues

1. **"Authentication required but no token found"**
   - User chưa login
   - Supabase session expired
   - Check: `supabase.auth.getSession()`

2. **"Failed to fetch" / Network Error**
   - Backend chưa chạy
   - CORS issue
   - Check: Backend đang chạy ở `http://localhost:5283`

3. **401 Unauthorized**
   - JWT token không hợp lệ
   - Backend `SUPABASE_JWT_SECRET` không đúng
   - Check: Backend `.env` có `SUPABASE_JWT_SECRET`

4. **404 Not Found**
   - Endpoint path không đúng
   - Check: `endpoints.ts` và backend Controller routes

5. **500 Internal Server Error**
   - Backend error
   - Check: Backend logs

# Troubleshooting Guide - Social Accounts & API Issues

## Vấn đề: Social Accounts, Facebook không hoạt động

### Checklist

#### 1. ✅ Backend đang chạy?

```bash
# Kiểm tra backend
curl http://localhost:5283/api/users/profile
```

**Nếu lỗi "Connection refused":**
- Backend chưa chạy
- Chạy backend: `cd d:\PRN232_Backend\AISAM.API && dotnet run`

#### 2. ✅ Environment Variables đúng?

**Frontend `.env.local`:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://qqoyvrlnfdslhqgouhvt.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=sb_publishable_...
NEXT_PUBLIC_API_URL=http://localhost:5283
```

**Backend `.env`:**
```env
SUPABASE_URL=https://qqoyvrlnfdslhqgouhvt.supabase.co
SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_JWT_SECRET=your_jwt_secret_from_supabase_dashboard
```

**Lấy JWT Secret:**
1. Vào Supabase Dashboard
2. Settings > API
3. Copy "JWT Secret"

#### 3. ✅ User đã login?

- Kiểm tra trong dashboard có hiển thị email không
- Nếu chưa login: Đăng nhập lại

#### 4. ✅ Supabase Token OK?

Dùng **API Test Panel** trong dashboard:
1. Click "Test Supabase Token"
2. Phải thấy: ✅ Supabase Token OK

**Nếu lỗi:**
- Logout và login lại
- Clear browser cache
- Check `.env.local` có đúng Supabase URL/Key không

#### 5. ✅ Backend Connection OK?

Dùng **API Test Panel**:
1. Click "Test Backend Connection"
2. Phải thấy: ✅ Backend is running

**Nếu lỗi:**
- Backend chưa chạy
- Port 5283 bị chiếm
- CORS issue (check backend logs)

#### 6. ✅ User Profile API OK?

Dùng **API Test Panel**:
1. Click "Test User Profile API"
2. Phải thấy: ✅ User Profile API OK

**Nếu lỗi 401 Unauthorized:**
- Backend `SUPABASE_JWT_SECRET` không đúng
- Check backend `.env` file
- Restart backend sau khi sửa `.env`

**Nếu lỗi 404:**
- Backend endpoint không đúng
- Check backend đang chạy đúng project không

#### 7. ✅ Social Accounts API OK?

Dùng **API Test Panel**:
1. Click "Test Social Accounts API"
2. Phải thấy: ✅ Social Accounts API OK

**Nếu lỗi:**
- User chưa có social accounts (bình thường)
- Backend database connection issue
- Check backend logs

---

## Common Errors

### Error: "Authentication required but no token found"

**Nguyên nhân:**
- User chưa login
- Supabase session expired

**Giải pháp:**
1. Logout
2. Login lại
3. Nếu vẫn lỗi: Clear browser cache

---

### Error: "Failed to fetch" / Network Error

**Nguyên nhân:**
- Backend chưa chạy
- CORS issue
- Firewall blocking

**Giải pháp:**
1. Start backend: `cd d:\PRN232_Backend\AISAM.API && dotnet run`
2. Check backend logs có CORS error không
3. Check `Program.cs` có CORS policy đúng không

---

### Error: 401 Unauthorized

**Nguyên nhân:**
- JWT token không hợp lệ
- Backend `SUPABASE_JWT_SECRET` sai

**Giải pháp:**
1. Lấy JWT Secret từ Supabase Dashboard
2. Update backend `.env`:
   ```env
   SUPABASE_JWT_SECRET=your_correct_jwt_secret
   ```
3. Restart backend
4. Login lại ở frontend

---

### Error: 404 Not Found

**Nguyên nhân:**
- Endpoint path không đúng
- Backend route không match

**Giải pháp:**
1. Check `endpoints.ts`:
   ```typescript
   socialAccountsByUser: (userId: string) => `/social/accounts/user/${userId}`
   ```
2. Check backend Controller:
   ```csharp
   [Route("api/social/accounts")]
   ```
3. Full URL phải là: `http://localhost:5283/api/social/accounts/user/{userId}`

---

### Error: 500 Internal Server Error

**Nguyên nhân:**
- Backend code error
- Database connection issue
- Missing configuration

**Giải pháp:**
1. Check backend console logs
2. Check backend database connection string
3. Check backend `.env` có đầy đủ không

---

## Debug Steps

### 1. Kiểm tra Frontend

```typescript
// In browser console
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { data: { session } } = await supabase.auth.getSession()
console.log('Session:', session)
console.log('Token:', session?.access_token)
```

### 2. Kiểm tra Backend

```bash
# Test backend health
curl http://localhost:5283/api/users/profile

# Test with token
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5283/api/users/profile
```

### 3. Kiểm tra Database

```sql
-- Check users table
SELECT * FROM users LIMIT 10;

-- Check social accounts
SELECT * FROM social_accounts LIMIT 10;
```

---

## Cấu trúc API

### Authentication Flow

```
1. User login → Supabase
2. Supabase → JWT token
3. Frontend → Store token in session
4. Frontend → API request with token
5. Backend → Validate token with SUPABASE_JWT_SECRET
6. Backend → Extract user ID from token
7. Backend → Query database
8. Backend → Return response
```

### API Endpoints

**Public (No Auth):**
- None currently

**Protected (Supabase JWT Required):**
- `GET /api/users/profile` - Get user profile
- `GET /api/social/accounts/user/{userId}` - Get social accounts
- `POST /api/content` - Create post
- `GET /api/social-auth/facebook/available-targets` - Get Facebook pages
- `POST /api/social-auth/link-selected` - Link selected pages

---

## Production Checklist

- [ ] Remove `<ApiTestPanel />` from dashboard
- [ ] Update `NEXT_PUBLIC_API_URL` to production URL
- [ ] Update backend CORS to allow production domain
- [ ] Set proper `SUPABASE_JWT_SECRET` in production
- [ ] Enable HTTPS for production
- [ ] Set secure cookies in production
- [ ] Add rate limiting
- [ ] Add proper error logging
- [ ] Add monitoring/alerts

---

## Liên hệ

Nếu vẫn gặp vấn đề sau khi thử các bước trên:
1. Check backend logs
2. Check browser console
3. Check network tab trong DevTools
4. Gửi logs để được hỗ trợ

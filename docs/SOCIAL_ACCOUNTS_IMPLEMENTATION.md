# Social Accounts & Social Integration Implementation

## Tổng quan

Implementation này cung cấp đầy đủ UI và logic frontend cho luồng **Social Account và Social Integration** trong hệ thống AISAM, sử dụng Next.js 15 (App Router), Shadcn UI, TailwindCSS, React Hook Form, Tanstack Query (React Query), và Lucide icons.

## Cấu trúc Files

### 1. API Hooks (`hooks/use-social-accounts.ts`)
- `useGetSocialAccounts`: Lấy danh sách social accounts
- `useGetAccountsWithTargets`: Lấy accounts với targets đã link
- `useGetAvailableTargets`: Lấy danh sách fanpages có thể link
- `useGetLinkedTargets`: Lấy targets đã link với brands
- `useGetAuthUrl`: Lấy OAuth URL cho provider
- `useConnectSocialAccount`: Kết nối social account (OAuth callback)
- `useLinkTargets`: Link fanpages với brands
- `useUnlinkAccount`: Hủy liên kết social account
- `useUnlinkTarget`: Hủy liên kết fanpage với brand
- `useGetBrands`: Lấy danh sách brands

### 2. Components (`components/social/`)

#### `SocialAccountList.tsx`
- Hiển thị danh sách social accounts với accordion layout
- Hỗ trợ expand/collapse để xem chi tiết
- Hiển thị linked targets (fanpages) cho mỗi account
- Actions: Re-authenticate, Link to Brand, Delete

#### `ConnectModal.tsx`
- Modal để chọn provider (Facebook/TikTok/Twitter)
- Trigger OAuth flow
- Error handling cho connection process

#### `LinkIntegrationModal.tsx`
- Modal để link fanpages với brands
- Select brand và chọn fanpages
- Validation và error handling

#### `ReAuthButton.tsx`
- Button để re-authenticate khi token expire
- Hiển thị trạng thái expired/expiring soon
- Auto-redirect OAuth flow

#### `EmptyState.tsx`
- Component hiển thị khi không có accounts
- Call-to-action để connect account

#### `LoadingState.tsx`
- Skeleton loading cho danh sách accounts
- Responsive và consistent với design system

#### `ErrorState.tsx`
- Error display với retry functionality
- User-friendly error messages

### 3. Pages

#### `/dashboard/social-accounts` (`app/dashboard/social-accounts/page.tsx`)
- Main page hiển thị social accounts management
- Sử dụng `SocialAccountsManagement` component

#### `/social-callback/[provider]` (`app/social-callback/[provider]/page.tsx`)
- Handle OAuth callback từ social providers
- Process authorization code và lưu social account
- Redirect về social accounts page

### 4. Types (`lib/types/aisam-types.ts`)
- `SocialAccountDto`: Social account data structure
- `SocialTargetDto`: Linked target (fanpage) data
- `AvailableTargetDto`: Available fanpage for linking
- `SocialAuthUrlResponse`: OAuth URL response
- `SocialCallbackRequest/Response`: OAuth callback data
- `LinkTargetsRequest/Response`: Link targets data
- `ApiErrorResponse`: Error response structure

## API Endpoints Mapping

### Social Auth
- `GET /api/social-auth/{provider}`: Lấy OAuth URL
- `POST /api/social-auth/{provider}/callback`: Xử lý OAuth callback

### Social Accounts
- `GET /api/social/accounts/me`: Lấy accounts của user hiện tại
- `GET /api/social/accounts/user/{userId}`: Lấy accounts của user cụ thể
- `DELETE /api/social/accounts/unlink/{userId}/{socialAccountId}`: Hủy liên kết account

### Social Targets
- `GET /api/social/accounts/{socialAccountId}/available-targets`: Lấy fanpages có thể link
- `POST /api/social/accounts/{socialAccountId}/link-targets`: Link fanpages với brand
- `GET /api/social/accounts/{socialAccountId}/linked-targets`: Lấy targets đã link
- `DELETE /api/social/accounts/unlink-target/{userId}/{socialIntegrationId}`: Hủy liên kết target

### Brands
- `GET /api/brands`: Lấy brands của user

## Business Cases Handled

### 1. Liên Kết Social Account Mới
- User chọn provider → Modal hiển thị options
- Click "Connect" → Redirect OAuth → Callback xử lý → Lưu account
- Success: Toast notification, refresh list
- Error: Toast error, retry option

### 2. Quản Lý Social Accounts
- Hiển thị list với accordion layout
- Mỗi account: provider, status, expiresAt, linked targets
- Actions: Re-auth, Link to Brand, Delete
- Role-based: User/Vendor/Admin có quyền khác nhau

### 3. Liên Kết Fanpage Với Brand
- Từ social account → "Link to Brand" button
- Modal: Select brand + chọn fanpages
- Validation: Brand required, fanpages required
- Success: Toast, refresh linked targets

### 4. Xử Lý Token Expire
- Check expiresAt < now → Show "Expired" badge
- ReAuthButton → Redirect OAuth → Update tokens
- Auto-check on page load

### 5. Edit/Delete Operations
- Delete account: Confirm dialog, unlink all targets
- Delete target: Confirm dialog, unlink specific fanpage
- Error handling: Toast notifications

### 6. Role-Based UI
- User: Chỉ thấy brands của mình
- Vendor: Thấy all brands (clients/teams)
- Admin: Read-only mode

### 7. Loading & Error States
- Loading: Skeleton components
- Error: ErrorState với retry button
- Empty: EmptyState với call-to-action

## Error Handling

### API Errors
- 401/403: Không retry, redirect login
- Network errors: Retry với exponential backoff
- Validation errors: Toast với specific message

### OAuth Errors
- User cancel: Redirect back với message
- Provider errors: Display error message
- Network issues: Retry option

### UI Errors
- Component errors: Error boundaries
- Form validation: Real-time feedback
- Loading states: Skeleton placeholders

## Security Considerations

### Authentication
- JWT token từ Supabase auth
- Auto-refresh khi token expire
- Secure API calls với Authorization header

### OAuth Flow
- State parameter để prevent CSRF
- Secure redirect URLs
- Token storage trong backend (không lưu frontend)

### Data Protection
- Không expose access tokens
- Secure API endpoints
- Input validation và sanitization

## Responsive Design

### Mobile-First
- Tailwind responsive classes
- Touch-friendly buttons
- Optimized modal sizes

### Dark Mode
- Sử dụng oklch colors từ globals.css
- Auto-apply theme
- Consistent với design system

## Performance Optimizations

### React Query
- Caching với staleTime 5 minutes
- Background refetch
- Optimistic updates

### Code Splitting
- Lazy loading components
- Dynamic imports
- Bundle optimization

### UI Optimizations
- Skeleton loading
- Debounced search
- Virtual scrolling cho large lists

## Testing Strategy

### Unit Tests
- Component rendering
- Hook functionality
- Error handling

### Integration Tests
- API integration
- OAuth flow
- User interactions

### E2E Tests
- Complete user flows
- Cross-browser testing
- Mobile responsiveness

## Deployment Notes

### Environment Variables
- `NEXT_PUBLIC_API_BASE_URL`: Backend API URL
- Supabase configuration
- OAuth provider credentials

### Build Optimization
- Next.js 15 với Turbopack
- Tree shaking
- Bundle analysis

## Future Enhancements

### Features
- Bulk operations
- Advanced filtering
- Analytics dashboard
- Webhook notifications

### Performance
- Server-side rendering
- Edge caching
- CDN optimization

### UX Improvements
- Drag & drop
- Keyboard shortcuts
- Advanced search
- Custom themes

## Troubleshooting

### Common Issues
1. **OAuth redirect không work**: Check redirect URLs trong provider settings
2. **Token expire**: Implement auto-refresh
3. **API errors**: Check network và authentication
4. **UI không load**: Check component imports và dependencies

### Debug Tools
- React Query DevTools
- Browser DevTools
- Network tab
- Console logs

## Support

Để được hỗ trợ, vui lòng:
1. Check documentation này
2. Review error logs
3. Test với different browsers
4. Contact development team


# Content System Components

This directory contains all the components related to the content management system in the AISAM application.

## Components

### ContentCard
A reusable card component that displays content information with action buttons.

**Props:**
- `content: ContentResponseDto` - The content data
- `onView?: (content) => void` - Callback when view button is clicked
- `onEdit?: (content) => void` - Callback when edit button is clicked
- `onDelete?: (contentId) => void` - Callback for delete action
- `onSubmit?: (contentId) => void` - Callback for submit action
- `onPublish?: (contentId, integrationId) => void` - Callback for publish action
- `isProcessing?: boolean` - Loading state
- `showActions?: boolean` - Whether to show action buttons

### ContentModal
A modal component for creating, viewing, and editing content.

**Props:**
- `content: ContentResponseDto | null` - The content to view/edit (null for create mode)
- `isEditing?: boolean` - Whether the modal is in edit mode
- `onClose: () => void` - Callback to close modal
- `onSave?: (data) => Promise<void>` - Callback to save changes
- `onCreate?: (data) => Promise<void>` - Callback to create new content
- `onSubmit?: (contentId) => Promise<void>` - Callback to submit for approval
- `onPublish?: (contentId, integrationId) => Promise<void>` - Callback to publish
- `isProcessing?: boolean` - Loading state
- `brands?: Array<{id, name}>` - Available brands
- `products?: Array<{id, name, brandId}>` - Available products

### ContentFilters
A filter component for searching and filtering content.

**Props:**
- `searchTerm: string` - Current search term
- `onSearchChange: (value) => void` - Search change callback
- `statusFilter: ContentStatusEnum | "all"` - Current status filter
- `onStatusChange: (status) => void` - Status filter change callback
- `adTypeFilter: AdTypeEnum | "all"` - Current ad type filter
- `onAdTypeChange: (adType) => void` - Ad type filter change callback
- `brandFilter: string` - Current brand filter
- `onBrandChange: (brandId) => void` - Brand filter change callback
- `totalCount: number` - Total number of contents
- `onCreateNew?: () => void` - Callback for create new button
- `brands?: Array<{id, name}>` - Available brands

### ContentList
A complete list component that combines cards and modal functionality.

**Props:**
- `contents: ContentResponseDto[]` - Array of contents
- `onEdit?: (contentId, data) => Promise<void>` - Edit callback
- `onCreate?: (data) => Promise<void>` - Create callback
- `onDelete?: (contentId) => Promise<void>` - Delete callback
- `onSubmit?: (contentId) => Promise<void>` - Submit callback
- `onPublish?: (contentId, integrationId) => Promise<void>` - Publish callback
- `isProcessing?: boolean` - Loading state
- `emptyMessage?: string` - Custom empty state message
- `emptyDescription?: string` - Custom empty state description
- `brands?: Array<{id, name}>` - Available brands
- `products?: Array<{id, name, brandId}>` - Available products

### ContentStatusWidget
A dashboard widget showing content overview and recent activity.

**Props:**
- `brandId?: string` - Filter by specific brand
- `limit?: number` - Number of contents to show (default: 5)
- `showViewAll?: boolean` - Whether to show "View All" button (default: true)

## Hooks

### useContents
Main hook for fetching contents with filters.

### useContent
Hook for fetching a single content by ID.

### useContentsByBrand
Hook for fetching contents filtered by brand ID.

### useCreateContent
Mutation hook for creating new content.

### useUpdateContent
Mutation hook for updating content.

### useDeleteContent
Mutation hook for deleting content.

### useRestoreContent
Mutation hook for restoring deleted content.

### useSubmitContent
Mutation hook for submitting content for approval.

### usePublishContent
Mutation hook for publishing content to social media.

## API Endpoints

The content system uses the following API endpoints:

- `GET /api/content` - Get contents with filters
- `POST /api/content` - Create new content
- `GET /api/content/{contentId}` - Get content by ID
- `DELETE /api/content/{contentId}` - Delete content
- `POST /api/content/{contentId}/restore` - Restore content
- `POST /api/content/{contentId}/submit` - Submit content for approval
- `POST /api/content/{contentId}/publish/{integrationId}` - Publish content

## Types

### ContentResponseDto
```typescript
interface ContentResponseDto {
  id: string;
  brandId: string;
  title: string;
  description?: string;
  textContent?: string;
  imageUrl?: string;
  videoUrl?: string;
  adType: AdTypeEnum;
  status: ContentStatusEnum;
  createdAt: string;
  updatedAt?: string;
  brandName?: string;
  productId?: string;
  productName?: string;
}
```

### AdTypeEnum
```typescript
enum AdTypeEnum {
  ImageText = 'ImageText',
  VideoText = 'VideoText',
  TextOnly = 'TextOnly'
}
```

### ContentStatusEnum
```typescript
enum ContentStatusEnum {
  Draft = 'Draft',
  PendingApproval = 'PendingApproval',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Published = 'Published'
}
```

## Usage Examples

### Basic Content Management
```tsx
import { ContentsManagement } from '@/components/pages/contents/contents-management';

function ContentPage() {
  return <ContentsManagement />;
}
```

### Content List with Custom Actions
```tsx
import { ContentList } from '@/components/contents';
import { useContents, useCreateContent, useUpdateContent } from '@/hooks/use-contents';

function MyContentList() {
  const { data: contentsData } = useContents();
  const createContentMutation = useCreateContent();
  const updateContentMutation = useUpdateContent("");

  const handleCreate = async (data: CreateContentRequest) => {
    await createContentMutation.mutateAsync(data);
  };

  const handleEdit = async (contentId: string, data: UpdateContentRequest) => {
    // You'd need to create a new mutation instance for the specific content
    const updateMutation = useUpdateContent(contentId);
    await updateMutation.mutateAsync(data);
  };

  return (
    <ContentList
      contents={contentsData?.data || []}
      onCreate={handleCreate}
      onEdit={handleEdit}
      isProcessing={createContentMutation.isPending}
    />
  );
}
```

### Dashboard Widget
```tsx
import { ContentStatusWidget } from '@/components/contents';

function Dashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ContentStatusWidget limit={5} />
      {/* Other widgets */}
    </div>
  );
}
```

## Content Workflow

1. **Draft** - Content is created and can be edited
2. **Submit for Approval** - Content is submitted and status changes to PendingApproval
3. **Approval Process** - Approvers can approve or reject the content
4. **Approved** - Content is approved and ready for publishing
5. **Published** - Content is published to social media platforms

## Features

- ✅ Full CRUD operations for content
- ✅ Content submission for approval workflow
- ✅ Publishing to social media integrations
- ✅ Multiple ad types (Text, Image+Text, Video+Text)
- ✅ Brand and product associations
- ✅ Search and filtering capabilities
- ✅ Real-time updates with React Query
- ✅ Optimistic updates for better UX
- ✅ Loading states and error handling
- ✅ Reusable components for different use cases
- ✅ Dashboard widgets for content overview
- ✅ TypeScript support with proper types
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useBrands } from "@/hooks/use-brands";
import { useProducts } from "@/hooks/use-products";
import { 
  useContents, 
  useCreateContent, 
  useUpdateContent, 
  useDeleteContent,
  useSubmitContent,
  usePublishContent
} from "@/hooks/use-contents";
import { useContentsByBrandFilter } from "@/hooks/use-contents-by-brand";
import { 
  ContentResponseDto, 
  ContentStatusEnum,
  AdTypeEnum,
  ContentFilters,
  CreateContentRequest,
  UpdateContentRequest
} from "@/lib/types/aisam-types";
import { ContentFilters as ContentFiltersComponent } from "@/components/contents/content-filters";
import { ContentList } from "@/components/contents/content-list";
import { ContentModal } from "@/components/contents/content-modal";
import { toast } from "sonner";

// TODO: Replace with actual auth hook
const useCurrentUser = () => {
  return { userId: 'current-user-id' }; // This should come from your auth system
};

interface ContentsManagementProps {
  initialBrandId?: string; // Allow passing brandId from parent component
}

export function ContentsManagement({ initialBrandId }: ContentsManagementProps = {}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContentStatusEnum | "all">("all");
  const [adTypeFilter, setAdTypeFilter] = useState<AdTypeEnum | "all">("all");
  const [brandFilter, setBrandFilter] = useState(initialBrandId || "");

  // Update brandFilter when initialBrandId changes
  useEffect(() => {
    if (initialBrandId && initialBrandId !== brandFilter) {
      setBrandFilter(initialBrandId);
    }
  }, [initialBrandId]);
  const [isCreating, setIsCreating] = useState(false);

  // State for current content operations
  const [currentContentId, setCurrentContentId] = useState<string>("");

  // Hooks
  const { userId } = useCurrentUser();
  const { data: brandsData, isLoading: brandsLoading } = useBrands();
  const { data: products = [] } = useProducts();
  
  // Use the specialized hook for better brand filtering
  const { 
    data: contentsData, 
    isLoading, 
    filters,
    queryString,
    isBrandFiltered 
  } = useContentsByBrandFilter({
    brandId: brandFilter || undefined,
    searchTerm: searchTerm || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    adType: adTypeFilter !== "all" ? adTypeFilter : undefined,
    page: 1,
    pageSize: 50
  });

  // Transform brands data to ensure correct format
  const brands = useMemo(() => {
    if (!brandsData) return [];
    // Handle both array and paginated response formats
    const brandArray = Array.isArray(brandsData) ? brandsData : (brandsData as any).data || [];
    return brandArray.map((brand: any) => ({
      id: brand.id,
      name: brand.name
    }));
  }, [brandsData]);

  // Debug: Log the current filters and brandId
  useEffect(() => {
    console.log('Current filters:', filters);
    console.log('Selected brandFilter:', brandFilter);
    console.log('Available brands:', brands);
  }, [filters, brandFilter, brands]);

  // Use hooks with current content ID
  const createContentMutation = useCreateContent();
  const updateContentMutation = useUpdateContent(currentContentId);
  const deleteContentMutation = useDeleteContent(currentContentId);
  const submitContentMutation = useSubmitContent(currentContentId);
  const publishContentMutation = usePublishContent(currentContentId);

  const contents = contentsData?.data || [];

  const filteredContents = contents.filter(content => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return content.title?.toLowerCase().includes(searchLower) ||
           content.description?.toLowerCase().includes(searchLower) ||
           content.textContent?.toLowerCase().includes(searchLower) ||
           content.brandName?.toLowerCase().includes(searchLower);
  });

  const handleCreateContent = async (data: CreateContentRequest) => {
    try {
      const contentData = {
        ...data,
        userId,
      };
      await createContentMutation.mutateAsync(contentData);
      setIsCreating(false);
      toast.success('Content created successfully');
    } catch (error) {
      console.error('Failed to create content:', error);
      toast.error('Failed to create content');
    }
  };

  const handleUpdateContent = async (contentId: string, data: UpdateContentRequest) => {
    setCurrentContentId(contentId);
    try {
      // Use the mutation that was created with the current content ID
      await updateContentMutation.mutateAsync(data);
      toast.success('Content updated successfully');
    } catch (error) {
      console.error('Failed to update content:', error);
      toast.error('Failed to update content');
    }
  };

  const handleDeleteContent = async (contentId: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;

    setCurrentContentId(contentId);
    try {
      // Use the mutation that was created with the current content ID
      await deleteContentMutation.mutateAsync();
      toast.success('Content deleted successfully');
    } catch (error) {
      console.error('Failed to delete content:', error);
      toast.error('Failed to delete content');
    }
  };

  const handleSubmitContent = async (contentId: string) => {
    setCurrentContentId(contentId);
    try {
      // Use the mutation that was created with the current content ID
      await submitContentMutation.mutateAsync();
      toast.success('Content submitted for approval');
    } catch (error) {
      console.error('Failed to submit content:', error);
      toast.error('Failed to submit content');
    }
  };

  const handlePublishContent = async (contentId: string, integrationId: string) => {
    setCurrentContentId(contentId);
    try {
      // Use the mutation that was created with the current content ID
      await publishContentMutation.mutateAsync(integrationId);
      toast.success('Content published successfully');
    } catch (error) {
      console.error('Failed to publish content:', error);
      toast.error('Failed to publish content');
    }
  };

  if (isLoading || brandsLoading) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-background">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              {brandsLoading ? 'Loading brands...' : 'Loading contents...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
          <p className="text-muted-foreground">
            Create, manage, and publish your social media content
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {filteredContents.length} Content{filteredContents.length !== 1 ? 's' : ''}
          </Badge>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Content
          </Button>
        </div>
      </div>

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="p-4 bg-gray-100 rounded-lg text-sm">
          <strong>Debug Info:</strong>
          <br />
          Selected Brand ID: {brandFilter || 'None'}
          <br />
          Available Brands: {brands.length}
          <br />
          API URL: {`/api/content?${queryString}`}
          <br />
          Is Brand Filtered: {isBrandFiltered ? 'Yes' : 'No'}
        </div>
      )}

      {/* Search and Filters */}
      <ContentFiltersComponent
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        adTypeFilter={adTypeFilter}
        onAdTypeChange={setAdTypeFilter}
        brandFilter={brandFilter}
        onBrandChange={setBrandFilter}
        totalCount={filteredContents.length}
        onCreateNew={() => setIsCreating(true)}
        brands={brands}
      />

      {/* Content List */}
      <ContentList
        contents={filteredContents}
        onEdit={handleUpdateContent}
        onCreate={handleCreateContent}
        onDelete={handleDeleteContent}
        onSubmit={handleSubmitContent}
        onPublish={handlePublishContent}
        isProcessing={
          createContentMutation.isPending ||
          updateContentMutation.isPending ||
          deleteContentMutation.isPending ||
          submitContentMutation.isPending ||
          publishContentMutation.isPending
        }
        emptyMessage={
          searchTerm || statusFilter !== "all" || adTypeFilter !== "all" || brandFilter
            ? 'No content found'
            : 'No content yet'
        }
        emptyDescription={
          searchTerm || statusFilter !== "all" || adTypeFilter !== "all" || brandFilter
            ? 'Try adjusting your search terms or filters'
            : 'Create your first piece of content to get started'
        }
        brands={brands}
        products={products}
        userId={userId}
      />

      {/* Create Content Modal */}
      {isCreating && (
        <ContentModal
          content={null}
          isEditing={true}
          onClose={() => setIsCreating(false)}
          onCreate={handleCreateContent}
          isProcessing={createContentMutation.isPending}
          brands={brands}
          products={products}
          userId={userId}
        />
      )}
    </div>
  );
}
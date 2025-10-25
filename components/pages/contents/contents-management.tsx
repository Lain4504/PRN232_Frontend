"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, FileText, Brain, AlertCircle, Search, Filter, X } from "lucide-react";
import { ActionsDropdown, ActionItem } from "@/components/ui/actions-dropdown";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBrands } from "@/hooks/use-brands";
import { useProducts } from "@/hooks/use-products";
import { 
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
  CreateContentRequest,
  UpdateContentRequest
} from "@/lib/types/aisam-types";
// import { ContentFilters as ContentFiltersComponent } from "@/components/contents/content-filters"; // Removed unused import
// import { ContentList } from "@/components/contents/content-list"; // Removed unused import
import { ContentModal } from "@/components/contents/content-modal";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Edit, Trash2, Send, Globe } from "lucide-react";

// TODO: Replace with actual auth hook
const useCurrentUser = () => {
  return { userId: 'current-user-id' }; // This should come from your auth system
};

// Create columns for the data table
const createColumns = (
  handleEditContent: (contentId: string) => void,
  handleViewContent: (contentId: string) => void,
  handleDeleteContent: (contentId: string) => void,
  handleSubmitContent: (contentId: string) => void,
  handlePublishContent: (contentId: string, integrationId: string) => void,
  brands: { id: string; name: string }[] = [],
  isProcessing: boolean
): ColumnDef<ContentResponseDto>[] => [
  {
    accessorKey: "title",
    header: "Content Title",
    cell: ({ row }) => {
      const content = row.original;
      const status = content.status;
      
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>
              <FileText className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div>
            <div 
              className="font-medium cursor-pointer hover:text-primary transition-colors"
              onClick={() => handleViewContent(row.original.id)}
            >
              {row.getValue("title")}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className={
                status === ContentStatusEnum.Published ? "bg-green-100 text-green-800" :
                status === ContentStatusEnum.Approved ? "bg-blue-100 text-blue-800" :
                status === ContentStatusEnum.PendingApproval ? "bg-yellow-100 text-yellow-800" :
                status === ContentStatusEnum.Rejected ? "bg-red-100 text-red-800" :
                "bg-gray-100 text-gray-800"
              }>
                {status}
              </Badge>
              <span className="text-xs text-muted-foreground">
                ID: {row.original.id.slice(0, 8)}
              </span>
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "adType",
    header: "Type",
    cell: ({ row }) => {
      const adType = row.getValue("adType") as AdTypeEnum;
      return (
        <div className="text-sm">
          {adType === AdTypeEnum.TextOnly ? (
            <Badge variant="outline">Text Only</Badge>
          ) : adType === AdTypeEnum.ImageText ? (
            <Badge variant="outline">Image + Text</Badge>
          ) : adType === AdTypeEnum.VideoText ? (
            <Badge variant="outline">Video + Text</Badge>
          ) : (
            <span className="text-muted-foreground">Unknown</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "brandId",
    header: "Brand",
    cell: ({ row }) => {
      const brandId = row.getValue("brandId") as string;
      const brand = brands.find(b => b.id === brandId);
      return (
        <div className="text-sm">
          {brand ? (
            <Badge variant="outline">
              {brand.name}
            </Badge>
          ) : (
            <span className="text-muted-foreground">No brand</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as string;
      
      return (
        <div className="text-sm text-muted-foreground">
          {createdAt ? (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <div>
                <div>{new Date(createdAt).toLocaleDateString()}</div>
                <div className="text-xs">{new Date(createdAt).toLocaleTimeString()}</div>
              </div>
            </div>
          ) : (
            <span>No date</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Actions",
    cell: ({ row }) => {
      const content = row.original;
      const canSubmit = content.status === ContentStatusEnum.Draft;
      const canPublish = content.status === ContentStatusEnum.Approved;
      
      const actions: ActionItem[] = [];
      
      if (canSubmit) {
        actions.push({
          label: "Submit for Approval",
          icon: <Send className="h-4 w-4" />,
          onClick: () => handleSubmitContent(content.id),
          disabled: isProcessing,
        });
      }
      
      if (canPublish) {
        actions.push({
          label: "Publish",
          icon: <Globe className="h-4 w-4" />,
          onClick: () => handlePublishContent(content.id, "integration-id"),
          disabled: isProcessing,
        });
      }
      
      actions.push(
        {
          label: "Edit",
          icon: <Edit className="h-4 w-4" />,
          onClick: () => handleEditContent(content.id),
        },
        {
          label: "Delete",
          icon: <Trash2 className="h-4 w-4" />,
          onClick: () => handleDeleteContent(content.id),
          variant: "destructive" as const,
          disabled: isProcessing,
        }
      );
      
      return <ActionsDropdown actions={actions} disabled={isProcessing} />;
    },
  },
];

interface ContentsManagementProps {
  initialBrandId?: string; // Allow passing brandId from parent component
}

export function ContentsManagement({ initialBrandId }: ContentsManagementProps = {}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContentStatusEnum | "all">("all");
  const [adTypeFilter, setAdTypeFilter] = useState<AdTypeEnum | "all">("all");
  const [brandFilter, setBrandFilter] = useState(initialBrandId || "all");
  
  // Update brandFilter when initialBrandId changes
  useEffect(() => {
    if (initialBrandId && initialBrandId !== brandFilter) {
      setBrandFilter(initialBrandId);
    }
  }, [initialBrandId, brandFilter]);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentResponseDto | null>(null);
  const [isEditing, setIsEditing] = useState(false);

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
    error
  } = useContentsByBrandFilter({
    brandId: brandFilter !== "all" ? brandFilter : undefined,
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
    const brandArray = Array.isArray(brandsData) ? brandsData : (brandsData as { data?: { id: string; name: string }[] }).data || [];
    return brandArray.map((brand: { id: string; name: string }) => ({
      id: brand.id,
      name: brand.name
    }));
  }, [brandsData]);


  // Use hooks with current content ID
  const createContentMutation = useCreateContent();
  const updateContentMutation = useUpdateContent(currentContentId);
  const deleteContentMutation = useDeleteContent(currentContentId);
  const submitContentMutation = useSubmitContent(currentContentId);
  const publishContentMutation = usePublishContent(currentContentId);

  // Handle the data structure from API response
  // From debug info, we see that contentsData is already the array of contents
  const contents = Array.isArray(contentsData) ? contentsData : (contentsData?.data || []);
  

  const filteredContents = contents.filter((content: any) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return content.title?.toLowerCase().includes(searchLower) ||
           content.textContent?.toLowerCase().includes(searchLower) ||
           content.styleDescription?.toLowerCase().includes(searchLower) ||
           content.contextDescription?.toLowerCase().includes(searchLower);
  });

  const handleCreateContent = async (data: CreateContentRequest) => {
    try {
      await createContentMutation.mutateAsync(data);
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

  // Function to open edit modal
  const handleEditContent = (contentId: string) => {
    const content = contents.find((c: any) => c.id === contentId);
    if (content) {
      setSelectedContent(content);
      setIsEditing(true);
    }
  };

  // Function to open view modal
  const handleViewContent = (contentId: string) => {
    const content = contents.find((c: any) => c.id === contentId);
    if (content) {
      setSelectedContent(content);
      setIsEditing(false);
    }
  };

  // Wrapper function for ContentModal onSave
  const handleSaveContent = async (data: UpdateContentRequest) => {
    if (selectedContent) {
      await handleUpdateContent(selectedContent.id, data);
      setSelectedContent(null);
      setIsEditing(false);
    }
  };

  // Wrapper function for ContentModal onCreate
  const handleCreateContentWrapper = async (data: CreateContentRequest) => {
    await handleCreateContent(data);
    setIsCreating(false);
  };

  
  if (isLoading || brandsLoading) {
    return (
      <div className="w-full max-w-full overflow-x-hidden">
        <div className="space-y-6 lg:space-y-8 p-4 lg:p-6 xl:p-8 bg-background">
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Skeleton className="h-10 w-64 mb-3" />
                <Skeleton className="h-5 w-80" />
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-8 w-28" />
              </div>
            </div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="space-y-6 lg:space-y-8 p-4 lg:p-6 xl:p-8 bg-background">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Content Management</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="space-y-3 lg:space-y-6">
          <div>
            <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold tracking-tight text-foreground">
              Content Management
            </h1>
            <p className="text-sm lg:text-base xl:text-lg text-muted-foreground mt-2 max-w-2xl">
              Create, manage, and publish your social media content with AI assistance
            </p>
          </div>
          
          
          {/* Stats */}
          <div className="flex flex-wrap items-center gap-2 lg:gap-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border text-xs lg:text-sm">
              <FileText className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground flex-shrink-0" />
              <span className="font-medium">{contents.length}</span>
              <span className="text-muted-foreground">Content{contents.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border text-xs lg:text-sm">
              <Brain className="h-3 w-3 lg:h-4 lg:w-4 text-primary flex-shrink-0" />
              <span className="font-medium">AI Powered</span>
            </div>
          </div>
        </div>



        {/* Actions and Search */}
        {contents.length > 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Search and Create */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="relative w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search content..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-9"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">
                      {contents.length} content{contents.length !== 1 ? 's' : ''}
                    </Badge>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        onClick={() => setIsCreating(true)} 
                        variant="outline"
                        size="sm"
                        className="flex items-center justify-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        Create Manual Content
                      </Button>
                      <Button 
                        onClick={() => window.location.href = `/dashboard/brands/${brandFilter}/contents/new`}
                        size="sm"
                        className="flex items-center justify-center gap-2"
                      >
                        <Brain className="h-4 w-4" />
                        Create with AI
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Filters */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Filters:</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ContentStatusEnum | "all")}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value={ContentStatusEnum.Draft}>Draft</SelectItem>
                        <SelectItem value={ContentStatusEnum.PendingApproval}>Pending Approval</SelectItem>
                        <SelectItem value={ContentStatusEnum.Approved}>Approved</SelectItem>
                        <SelectItem value={ContentStatusEnum.Rejected}>Rejected</SelectItem>
                        <SelectItem value={ContentStatusEnum.Published}>Published</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={adTypeFilter === "all" ? "all" : adTypeFilter.toString()} onValueChange={(value) => setAdTypeFilter(value === "all" ? "all" : parseInt(value) as AdTypeEnum)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value={AdTypeEnum.TextOnly.toString()}>Text Only</SelectItem>
                        <SelectItem value={AdTypeEnum.ImageText.toString()}>Image + Text</SelectItem>
                        <SelectItem value={AdTypeEnum.VideoText.toString()}>Video + Text</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={brandFilter} onValueChange={setBrandFilter}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Brand" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Brands</SelectItem>
                        {brands.map((brand: { id: string; name: string }) => (
                          <SelectItem key={brand.id} value={brand.id}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {(searchTerm || statusFilter !== "all" || adTypeFilter !== "all" || brandFilter !== "all") && (
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearchTerm("");
                          setStatusFilter("all");
                          setAdTypeFilter("all");
                          setBrandFilter("all");
                        }}
                        className="text-muted-foreground"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Empty state with beautiful card design */
          <Card className="border border-dashed border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                <FileText className="h-6 w-6 text-primary" />
              </div>
                <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? 'No content found' : 'No content yet'}
                </h3>
              <p className="text-muted-foreground mb-4 text-sm leading-relaxed max-w-sm mx-auto">
                {searchTerm
                  ? 'Try adjusting your search terms or filters to find your content.'
                  : 'Create your first piece of content to start your social media journey.'
                }
              </p>
              {!searchTerm && brands.length > 0 && (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button 
                      onClick={() => setIsCreating(true)} 
                      variant="outline"
                      size="sm" 
                      className="h-8 text-xs flex items-center justify-center gap-2"
                    >
                      <FileText className="h-3 w-3" />
                      Create Manual Content
                    </Button>
                    <Button 
                      onClick={() => window.location.href = `/dashboard/brands/${brandFilter}/contents/new`}
                      size="sm" 
                      className="h-8 text-xs flex items-center justify-center gap-2"
                    >
                      <Brain className="h-3 w-3" />
                      Create with AI
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    AI-powered content • Multiple formats • Easy publishing
                  </p>
                </div>
                )}
            </CardContent>
          </Card>
        )}

        {/* Content Table */}
        {contents.length > 0 && (
          <DataTable
            columns={createColumns(
              handleEditContent,
              handleViewContent,
              handleDeleteContent,
              handleSubmitContent,
              handlePublishContent,
              brands,
              createContentMutation.isPending ||
              updateContentMutation.isPending ||
              deleteContentMutation.isPending ||
              submitContentMutation.isPending ||
              publishContentMutation.isPending
            )}
            data={filteredContents}
            pageSize={10}
            showSearch={false}
          />
        )}

        {/* Help Section */}
        <Card className="border border-blue-200 dark:border-blue-800">
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 text-xs mb-1">
                  About Content Management
                </h3>
                <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                  Create and manage your social media content with AI assistance. All content goes through an approval workflow before publishing to ensure quality and brand consistency.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Create Content Modal */}
        <ContentModal
          content={null}
          isEditing={true}
          open={isCreating}
          onOpenChange={setIsCreating}
          onCreate={handleCreateContentWrapper}
          isProcessing={createContentMutation.isPending}
          brands={brands}
          products={products}
          userId={userId}
        />

        {/* Edit Content Modal */}
        <ContentModal
          content={selectedContent}
          isEditing={isEditing}
          open={!!selectedContent}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedContent(null);
              setIsEditing(false);
            }
          }}
          onSave={handleSaveContent}
          onSubmit={handleSubmitContent}
          onPublish={handlePublishContent}
          isProcessing={updateContentMutation.isPending || submitContentMutation.isPending || publishContentMutation.isPending}
          brands={brands}
          products={products}
          userId={userId}
        />
      </div>
    </div>
  );
}
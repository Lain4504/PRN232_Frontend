"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Brain, AlertCircle, Search } from "lucide-react";
import { ActionsDropdown, ActionItem } from "@/components/ui/actions-dropdown";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { CustomTable } from "@/components/ui/custom-table";
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
import { useTeamBrands } from "@/hooks/use-team-brands";
import { 
  useCreateContent, 
  useUpdateContent, 
  useDeleteContent,
  useSubmitContent,
  usePublishContent,
  useCloneContent
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
import { ContentPreviewModal } from "@/components/contents/content-preview-modal";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Edit, Trash2, Send, Eye } from "lucide-react";
import { SubmitApprovalDialog } from "@/components/contents/submit-approval-dialog";
import { useTeamMembers } from "@/hooks/use-teams";
import { useCreateApproval } from "@/hooks/use-approvals";
import { useQueryClient } from "@tanstack/react-query";
import { api, endpoints } from "@/lib/api";
import type { ApiResponse } from "@/lib/types/aisam-types";

// TODO: Replace with actual auth hook
const useCurrentUser = () => {
  return { userId: 'current-user-id' }; // This should come from your auth system
};

// Create columns for the data table
const createColumns = (
  handleEditContent: (contentId: string) => void,
  handleViewContent: (content: ContentResponseDto) => void,
  handleDeleteContent: (contentId: string) => void,
  handleSubmitContent: (contentId: string) => void,
  handleCloneContent: (contentId: string) => void,
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
            <div className="font-medium">
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
      const raw = row.getValue("adType") as unknown;
      const value = typeof raw === 'string' ? raw : (raw as AdTypeEnum);
      const label = (() => {
        if (typeof value === 'string') {
          const v = value.toLowerCase();
          if (v === 'textonly' || v === 'text_only') return 'Text Only';
          if (v === 'imagetext' || v === 'image_text') return 'Image + Text';
          if (v === 'videotext' || v === 'video_text') return 'Video + Text';
          return null;
        } else {
          if (value === AdTypeEnum.TextOnly) return 'Text Only';
          if (value === AdTypeEnum.ImageText) return 'Image + Text';
          if (value === AdTypeEnum.VideoText) return 'Video + Text';
          return null;
        }
      })();
      return (
        <div className="text-sm">
          {label ? (
            <Badge variant="outline">{label}</Badge>
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
      
      const actions: ActionItem[] = [];
      
      // Always show Preview option
      actions.push({
        label: "Preview",
        icon: <Eye className="h-4 w-4" />,
        onClick: () => handleViewContent(content),
      });
      
      if (canSubmit) {
        actions.push({
          label: "Submit for Approval",
          icon: <Send className="h-4 w-4" />,
          onClick: () => handleSubmitContent(content.id),
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
          label: "Clone",
          icon: <FileText className="h-4 w-4" />,
          onClick: () => handleCloneContent(content.id),
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
  teamId?: string; // When provided, can show all team brands content
}

export function ContentsManagement({ initialBrandId, teamId }: ContentsManagementProps = {}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContentStatusEnum | "all">("all");
  const [adTypeFilter, setAdTypeFilter] = useState<AdTypeEnum | "all">("all");

  const [isCreating, setIsCreating] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentResponseDto | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState<ContentResponseDto | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // State for current content operations
  const [currentContentId, setCurrentContentId] = useState<string>("");

  // Hooks
  const { userId } = useCurrentUser();
  const { data: brandsData, isLoading: brandsLoading } = useBrands();
  const { data: teamBrands = [] } = useTeamBrands(teamId || "");
  const { data: products = [] } = useProducts();
  
  // Use the specialized hook for better brand filtering
  // Scope selection: when teamId provided, allow selecting All team brands or a specific brand
  const [scopeBrandId, setScopeBrandId] = useState<string | "team-all">(teamId ? "team-all" : (initialBrandId || ""));

  // When "team-all" is selected, brandId is undefined (fetch all)
  // When a specific brand is selected, use that brandId
  const byBrand = useContentsByBrandFilter({
    brandId: scopeBrandId !== "team-all" ? (scopeBrandId || initialBrandId || undefined) : undefined,
    searchTerm: searchTerm || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    adType: adTypeFilter !== "all" ? adTypeFilter : undefined,
    page: 1,
    pageSize: 50
  });

  const isLoading = byBrand.isLoading;
  const contentsData = byBrand.data as { data?: unknown[] } | undefined;
  

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
  const createApprovalMutation = useCreateApproval();
  
  // Create mutations with placeholder - will be updated when contentId is set
  // Note: These mutations will be recreated when currentContentId changes
  const updateContentMutation = useUpdateContent(currentContentId || "placeholder");
  const deleteContentMutation = useDeleteContent(currentContentId || "placeholder");
  const submitContentMutation = useSubmitContent(currentContentId || "placeholder");
  const publishContentMutation = usePublishContent(currentContentId || "placeholder");
  const cloneContentMutation = useCloneContent(currentContentId || "placeholder");

  // Active team for member lookup (from header context)
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setActiveTeamId(localStorage.getItem('activeTeamId'));
    }
  }, []);
  const { data: teamMembers = [] } = useTeamMembers(activeTeamId || undefined);

  // Handle the data structure from API response
  // From debug info, we see that contentsData is already the array of contents
  const contents: ContentResponseDto[] = Array.isArray(contentsData) 
    ? (contentsData as ContentResponseDto[])
    : ((contentsData?.data as ContentResponseDto[]) || []);
  

  const filteredContents = contents.filter((content: ContentResponseDto) => {

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

  const queryClient = useQueryClient();
  
  const handleUpdateContent = async (contentId: string, data: UpdateContentRequest) => {
    if (!contentId) {
      toast.error('Content ID is required');
      return;
    }
    
    try {
      // Call API directly with the contentId to ensure correct endpoint
      // This avoids the issue of using mutation with empty contentId
      const resp = await api.put<ApiResponse<ContentResponseDto>>(endpoints.contentById(contentId), data);
      
      if (resp.data?.data) {
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['contents'] });
        queryClient.invalidateQueries({ queryKey: ['contents', 'detail', contentId] });
        if (resp.data.data.brandId) {
          queryClient.invalidateQueries({ queryKey: ['contents', 'brand', resp.data.data.brandId] });
        }
        toast.success('Content updated successfully');
        setCurrentContentId(contentId);
      }
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

  const handleCloneContent = async (contentId: string) => {
    setCurrentContentId(contentId);
    try {
      const cloned = await cloneContentMutation.mutateAsync();
      toast.success('Cloned content created');
      setSelectedContent(cloned);
      setIsEditing(true);
    } catch (error) {
      console.error('Failed to clone content:', error);
      toast.error('Failed to clone content');
    }
  };

  const handleSubmitContent = async (contentId: string) => {
    setCurrentContentId(contentId);
    // Open approver selection dialog instead of direct submit
    setIsApprovalDialogOpen(true);
  };


  // Function to open edit modal
  const handleEditContent = (contentId: string) => {
    const content = contents.find((c) => c.id === contentId);

    if (content) {
      setSelectedContent(content);
      setIsEditing(true);
    }
  };

  // Function to open preview modal
  const handleViewContent = (content: ContentResponseDto) => {
    // Enrich content with brandName if missing
    const enrichedContent: ContentResponseDto = {
      ...content,
      // If brandName is missing, try to find it from brands list
      brandName: content.brandName || brands.find(b => b.id === content.brandId)?.name || content.brandName
    };
    setPreviewContent(enrichedContent);
    setIsPreviewModalOpen(true);
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
        <div>
          <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold tracking-tight text-foreground">
            Content Management
          </h1>
          <p className="text-sm lg:text-base xl:text-lg text-muted-foreground mt-2 max-w-2xl">
            Create, manage, and publish your social media content with AI assistance
          </p>
        </div>



        {/* Single Row Layout - Stats, Filters, Search, Content Count, Create Buttons */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 flex-wrap">
          {/* Stats */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border text-xs lg:text-sm">
              <FileText className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground flex-shrink-0" />
              <span className="font-medium">{contents.length}</span>
              <span className="text-muted-foreground">Content{contents.length !== 1 ? 's' : ''}</span>
            </div>

          </div>

          {/* Filters */}
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ContentStatusEnum | "all")}>
            <SelectTrigger className="w-full sm:w-[140px] md:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value={ContentStatusEnum.Draft}>Draft</SelectItem>
              <SelectItem value={ContentStatusEnum.PendingApproval}>Pending</SelectItem>
              <SelectItem value={ContentStatusEnum.Approved}>Approved</SelectItem>
              <SelectItem value={ContentStatusEnum.Rejected}>Rejected</SelectItem>
              <SelectItem value={ContentStatusEnum.Published}>Published</SelectItem>
            </SelectContent>
          </Select>

          <Select value={adTypeFilter === "all" ? "all" : adTypeFilter.toString()} onValueChange={(value) => setAdTypeFilter(value === "all" ? "all" : parseInt(value) as AdTypeEnum)}>
            <SelectTrigger className="w-full sm:w-[140px] md:w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value={AdTypeEnum.TextOnly.toString()}>Text Only</SelectItem>
              <SelectItem value={AdTypeEnum.ImageText.toString()}>Image + Text</SelectItem>
              <SelectItem value={AdTypeEnum.VideoText.toString()}>Video + Text</SelectItem>
            </SelectContent>
          </Select>
          {/* Team scope selector */}
          {teamId && (
            <Select
              value={scopeBrandId}
              onValueChange={(val) => setScopeBrandId(val)}
            >
              <SelectTrigger className="w-full sm:w-[160px] md:w-56">
                <SelectValue placeholder="Scope" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="team-all">All team brands</SelectItem>
                {teamBrands.map((b: { id: string; name: string }) => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}


          {/* Search */}
          <div className="relative w-full sm:w-64 md:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9"
            />
          </div>





          {/* Create Buttons */}
          <div className="w-full sm:w-auto sm:ml-auto flex items-center gap-2">
            <Button 
              onClick={() => setIsCreating(true)} 
              variant="outline"
              size="sm"
              className="flex items-center justify-center gap-2 flex-1 sm:flex-initial"
            >
              <FileText className="h-4 w-4" />
              Manual
            </Button>
            <Button 
              onClick={() => window.location.href = `/dashboard/brands/${initialBrandId || 'all'}/contents/new`}
              size="sm"
              className="flex items-center justify-center gap-2 flex-1 sm:flex-initial"
            >
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Create with AI</span>
              <span className="sm:hidden">AI</span>
            </Button>
          </div>
        </div>

        {/* Content Table or Empty State */}
        {contents.length > 0 ? (
          <CustomTable
            columns={createColumns(
              handleEditContent,
              handleViewContent,
              handleDeleteContent,
              handleSubmitContent,
              handleCloneContent,
              brands,
              createContentMutation.isPending ||
              updateContentMutation.isPending ||
              deleteContentMutation.isPending ||
              submitContentMutation.isPending
            )}
            data={filteredContents}
            pageSize={10}
          />
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-6">
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
                        onClick={() => window.location.href = `/dashboard/brands/${initialBrandId || 'all'}/contents/new`}
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
              </div>
            </CardContent>
          </Card>
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
          brands={teamId ? undefined : brands}
          products={teamId ? undefined : products}
          teamId={teamId}
          userId={userId}
          defaultBrandId={scopeBrandId !== "team-all" ? scopeBrandId : (initialBrandId || undefined)}
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
          onSubmit={async (contentId) => {
            await handleSubmitContent(contentId);
          }}
          isProcessing={updateContentMutation.isPending || submitContentMutation.isPending}
          brands={teamId ? undefined : brands}
          products={teamId ? undefined : products}
          teamId={teamId}
          userId={userId}
          showButtons={isEditing}
        />

        {/* Submit Approval Dialog */}
        <SubmitApprovalDialog
          content={selectedContent || contents.find(c => c.id === currentContentId) || null}
          isOpen={isApprovalDialogOpen}
          onClose={() => setIsApprovalDialogOpen(false)}
          isSubmitting={createApprovalMutation.isPending}
          approvers={teamMembers.map(m => ({ id: m.userId, email: m.userEmail, name: m.userEmail.split('@')[0], canApproveContent: m.canApproveContent }))}
          onSubmit={async (approvalData) => {
            try {
              await createApprovalMutation.mutateAsync(approvalData)
              toast.success('Approval request created')
              setIsApprovalDialogOpen(false)
            } catch (error) {
              console.error('Failed to create approval:', error)
              toast.error('Failed to create approval')
            }
          }}
        />

        {/* Content Preview Modal */}
        {previewContent && (
          <ContentPreviewModal
            content={previewContent}
            open={isPreviewModalOpen}
            onOpenChange={setIsPreviewModalOpen}
            onSubmit={async (contentId) => {
              await handleSubmitContent(contentId);
              setIsPreviewModalOpen(false);
            }}
            onPublish={async (contentId, integrationId) => {
              setCurrentContentId(contentId);
              try {
                await publishContentMutation.mutateAsync(integrationId);
                toast.success('Content published successfully');
                setIsPreviewModalOpen(false);
              } catch (error) {
                console.error('Failed to publish content:', error);
                toast.error('Failed to publish content');
              }
            }}
            isProcessing={publishContentMutation.isPending || submitContentMutation.isPending}
            brands={brands}
          />
        )}
      </div>
    </div>
  );
}
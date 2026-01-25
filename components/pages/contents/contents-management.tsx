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
import { ContentModal } from "@/components/contents/content-modal";
import { ContentPreviewModal } from "@/components/contents/content-preview-modal";
import { ChangeStatusModal } from "@/components/contents/change-status-modal";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Edit, Trash2, Send, Eye } from "lucide-react";
import { SubmitApprovalDialog } from "@/components/contents/submit-approval-dialog";
import { useTeamMembers } from "@/hooks/use-teams";
import { useCreateApproval } from "@/hooks/use-approvals";
import { useQueryClient } from "@tanstack/react-query";
import { api, endpoints } from "@/lib/api";
import type { ApiResponse } from "@/lib/types/aisam-types";
import { useProfile } from "@/lib/contexts/profile-context";
import { ProfileTypeEnum } from "@/lib/utils/profile-utils";
import { useUser } from "@/hooks/use-user";


// Create columns for the data table
const createColumns = (
  handleEditContent: (contentId: string) => void,
  handleViewContent: (content: ContentResponseDto) => void,
  handleDeleteContent: (contentId: string) => void,
  handleSubmitContent: (contentId: string) => void,
  handleCloneContent: (contentId: string) => void,
  handleChangeStatus: (content: ContentResponseDto) => void,
  brands: { id: string; name: string }[] = [],
  isProcessing: boolean,
  canUseTeamFeatures: boolean
): ColumnDef<ContentResponseDto>[] => [
    {
      accessorKey: "title",
      header: "Content",
      cell: ({ row }) => {
        const content = row.original;
        const status = content.status;

        return (
          <div className="flex items-center gap-3 py-1">
            <Avatar className="h-10 w-10 rounded-lg border bg-muted">
              <AvatarFallback>
                <FileText className="h-5 w-5 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold text-sm line-clamp-1">{row.getValue("title")}</div>
              <div className="mt-1">
                <Badge variant="outline" className={`text-[9px] font-bold uppercase tracking-wider rounded-md px-1.5 h-4 border-muted-foreground/20 ${status === ContentStatusEnum.Published ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                    status === ContentStatusEnum.Approved ? "bg-blue-50 text-blue-700 border-blue-200" :
                      status === ContentStatusEnum.PendingApproval ? "bg-amber-50 text-amber-700 border-amber-200" :
                        status === ContentStatusEnum.Draft ? "bg-slate-50 text-slate-700 border-slate-200" :
                          "bg-red-50 text-red-700 border-red-200"
                  }`}>
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
        const value = row.getValue("adType") as unknown as AdTypeEnum;
        const label = (() => {
          if (typeof value === 'string') {
            const v = String(value).toLowerCase();
            if (v === 'textonly' || v === 'text_only') return 'Text';
            if (v === 'imagetext' || v === 'image_text') return 'Image + Text';
            if (v === 'videotext' || v === 'video_text') return 'Video + Text';
            return value;
          } else {
            if (value === AdTypeEnum.TextOnly) return 'Text';
            if (value === AdTypeEnum.ImageText) return 'Image + Text';
            if (value === AdTypeEnum.VideoText) return 'Video + Text';
            return 'Unknown';
          }
        })();
        return (
          <Badge variant="secondary" className="font-medium text-[10px] rounded-md px-2 bg-muted/50 border-none">
            {label}
          </Badge>
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
      accessorKey: "actions",
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

        // Submit for Approval only available for Basic/Pro profiles (team features)
        if (canSubmit && canUseTeamFeatures) {
          actions.push({
            label: "Submit for Approval",
            icon: <Send className="h-4 w-4" />,
            onClick: () => handleSubmitContent(content.id),
            disabled: isProcessing,
          });
        }

        // Change Status only available for Free profiles
        if (!canUseTeamFeatures) {
          actions.push({
            label: "Change Status",
            icon: <Edit className="h-4 w-4" />,
            onClick: () => handleChangeStatus(content),
            disabled: isProcessing,
          });
        }

        actions.push(
          {
            label: "Edit",
            icon: <Edit className="h-4 w-4" />,
            onClick: () => handleEditContent(content.id),
            disabled: isProcessing,
          },
          {
            label: "Clone",
            icon: <FileText className="h-4 w-4" />,
            onClick: () => handleCloneContent(content.id),
            disabled: isProcessing,
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
  const { profileType } = useProfile();
  const canUseTeamFeatures = profileType !== ProfileTypeEnum.Free;

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContentStatusEnum | "all">("all");
  const [adTypeFilter, setAdTypeFilter] = useState<AdTypeEnum | "all">("all");

  const [isCreating, setIsCreating] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentResponseDto | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState<ContentResponseDto | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [statusChangeContent, setStatusChangeContent] = useState<ContentResponseDto | null>(null);
  const [isChangeStatusModalOpen, setIsChangeStatusModalOpen] = useState(false);

  // State for current content operations
  const [currentContentId, setCurrentContentId] = useState<string>("");

  // Hooks
  const { data: currentUser } = useUser();
  const userId = currentUser?.id || "";
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

  const handleChangeStatus = (content: ContentResponseDto) => {
    setStatusChangeContent(content);
    setIsChangeStatusModalOpen(true);
  };

  const handleChangeStatusModalClose = () => {
    setIsChangeStatusModalOpen(false);
    setStatusChangeContent(null);
  };

  const handleChangeStatusSuccess = () => {
    // Refresh the contents list
    queryClient.invalidateQueries({ queryKey: ['contents'] });
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
    <div className="max-w-[1440px] mx-auto font-fira-sans">
      <div className="space-y-8 p-6 lg:p-10 bg-background">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard" className="text-sm font-medium">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-sm font-medium text-primary">Content Management</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Contents
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Create and manage your social media content with AI assistance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsCreating(true)}
              variant="outline"
              className="rounded-lg h-10 px-4 font-semibold"
            >
              <FileText className="h-4 w-4 mr-2" />
              Manual
            </Button>
            <Button
              onClick={() => window.location.href = `/dashboard/brands/${initialBrandId || 'all'}/contents/new`}
              className="rounded-lg h-10 px-4 font-semibold"
            >
              <Brain className="h-4 w-4 mr-2" />
              Create with AI
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col xl:flex-row items-center justify-between gap-4 p-4 rounded-xl border bg-card shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 bg-background rounded-lg border-border/60"
              />
            </div>

            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ContentStatusEnum | "all")}>
              <SelectTrigger className="h-10 w-full sm:w-[140px] rounded-lg">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-lg">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value={ContentStatusEnum.Draft}>Draft</SelectItem>
                <SelectItem value={ContentStatusEnum.PendingApproval}>Pending</SelectItem>
                <SelectItem value={ContentStatusEnum.Approved}>Approved</SelectItem>
                <SelectItem value={ContentStatusEnum.Rejected}>Rejected</SelectItem>
                <SelectItem value={ContentStatusEnum.Published}>Published</SelectItem>
              </SelectContent>
            </Select>

            <Select value={adTypeFilter === "all" ? "all" : adTypeFilter.toString()} onValueChange={(value) => setAdTypeFilter(value === "all" ? "all" : parseInt(value) as AdTypeEnum)}>
              <SelectTrigger className="h-10 w-full sm:w-[140px] rounded-lg">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="rounded-lg">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value={AdTypeEnum.TextOnly.toString()}>Text Only</SelectItem>
                <SelectItem value={AdTypeEnum.ImageText.toString()}>Image + Text</SelectItem>
                <SelectItem value={AdTypeEnum.VideoText.toString()}>Video + Text</SelectItem>
              </SelectContent>
            </Select>

            {teamId && (
              <Select
                value={scopeBrandId}
                onValueChange={(val) => setScopeBrandId(val)}
              >
                <SelectTrigger className="h-10 w-full sm:w-[160px] rounded-lg">
                  <SelectValue placeholder="Scope" />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  <SelectItem value="team-all">All team brands</SelectItem>
                  {teamBrands.map((b: { id: string; name: string }) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-lg border text-sm font-medium">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span>{contents.length} Total</span>
          </div>
        </div>

        {/* Content Table or Empty State */}
        {contents.length > 0 ? (
          <Card className="rounded-xl border shadow-sm overflow-hidden">
            <CustomTable
              columns={createColumns(
                handleEditContent,
                handleViewContent,
                handleDeleteContent,
                handleSubmitContent,
                handleCloneContent,
                handleChangeStatus,
                brands,
                createContentMutation.isPending ||
                updateContentMutation.isPending ||
                deleteContentMutation.isPending ||
                submitContentMutation.isPending,
                canUseTeamFeatures
              )}
              data={filteredContents}
              pageSize={10}
              className="border-0 shadow-none bg-transparent"
              headerClassName="bg-muted/30 border-b py-3"
            />
          </Card>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center border border-dashed rounded-xl bg-muted/5">
            <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center mb-6 text-muted-foreground">
              <FileText className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">{searchTerm ? 'No content found' : 'No content yet'}</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                {searchTerm ? 'Try adjusting your filters.' : 'Create your first piece of content to get started.'}
              </p>
            </div>
            {!searchTerm && (
              <div className="mt-8 flex items-center gap-3">
                <Button
                  onClick={() => setIsCreating(true)}
                  variant="outline"
                  className="rounded-lg h-10 px-6"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Manual Content
                </Button>
                <Button
                  onClick={() => window.location.href = `/dashboard/brands/${initialBrandId || 'all'}/contents/new`}
                  className="rounded-lg h-10 px-6"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Create with AI
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Info Card */}
        <Card className="border p-4 rounded-xl shadow-sm bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">Workflow Note</h3>
              <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                All content goes through an approval workflow before publishing to ensure brand consistency.
              </p>
            </div>
          </div>
        </Card>

        {/* Modals */}
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

        <ChangeStatusModal
          content={statusChangeContent}
          isOpen={isChangeStatusModalOpen}
          onClose={handleChangeStatusModalClose}
          onSuccess={handleChangeStatusSuccess}
        />
      </div>
    </div>
  );
}
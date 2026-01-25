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
import { cn } from "@/lib/utils";


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
      header: "Asset Library",
      cell: ({ row }) => {
        const content = row.original;
        const status = content.status;

        return (
          <div className="flex items-center gap-4 py-3 px-2">
            <div className="size-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground shrink-0 border border-border shadow-sm overflow-hidden">
              <div className="size-full bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center">
                <FileText className="size-5 opacity-60" />
              </div>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-base text-foreground truncate">{row.getValue("title")}</span>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="secondary" className={cn("text-[9px] font-bold uppercase tracking-tight h-5 px-2 rounded-lg",
                  status === ContentStatusEnum.Published ? "bg-emerald-500/10 text-emerald-600 border-none" :
                    status === ContentStatusEnum.Approved ? "bg-blue-500/10 text-blue-600 border-none" :
                      status === ContentStatusEnum.PendingApproval ? "bg-amber-500/10 text-amber-600 border-none" :
                        status === ContentStatusEnum.Draft ? "bg-slate-500/10 text-slate-600 border-none" :
                          "bg-red-500/10 text-red-600 border-none"
                )}>
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
      header: "Format",
      cell: ({ row }) => {
        const value = row.getValue("adType") as unknown as AdTypeEnum;
        const label = (() => {
          if (typeof value === 'string') {
            const v = String(value).toLowerCase();
            if (v === 'textonly' || v === 'text_only') return 'Text';
            if (v === 'imagetext' || v === 'image_text') return 'Image + Text';
            if (v === 'videotext' || v === 'video_text') return 'Video + Text';
            return value;
          }
          if (value === AdTypeEnum.TextOnly) return 'Text Only';
          if (value === AdTypeEnum.ImageText) return 'Visual Story';
          if (value === AdTypeEnum.VideoText) return 'Motion Clip';
          return 'Unknown';
        })();
        return (
          <div className="py-3">
            <span className="text-sm font-semibold text-foreground italic">{label}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "brandId",
      header: "Brand Identity",
      cell: ({ row }) => {
        const brandId = row.getValue("brandId") as string;
        const brand = brands.find(b => b.id === brandId);
        return (
          <div className="py-3">
            {brand ? (
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-primary/40" />
                <span className="text-sm font-bold text-foreground truncate max-w-[120px]">{brand.name}</span>
              </div>
            ) : (
              <span className="text-xs font-bold text-muted-foreground/40 uppercase">Global</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Registry",
      cell: ({ row }) => {
        const createdAt = row.getValue("createdAt") as string;
        return (
          <div className="flex flex-col py-3">
            <span className="text-sm font-bold text-foreground italic">{createdAt ? new Date(createdAt).toLocaleDateString() : "Draft"}</span>
            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-0.5">Recorded</span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Explore</div>,
      cell: ({ row }) => {
        const content = row.original;
        const canSubmit = content.status === ContentStatusEnum.Draft;
        const actions: ActionItem[] = [];

        actions.push({
          label: "View Creative",
          icon: <Eye className="size-4" />,
          onClick: () => handleViewContent(content),
        });

        if (canSubmit && canUseTeamFeatures) {
          actions.push({
            label: "Request Approval",
            icon: <Send className="size-4" />,
            onClick: () => handleSubmitContent(content.id),
            disabled: isProcessing,
          });
        }

        if (!canUseTeamFeatures) {
          actions.push({
            label: "Update Status",
            icon: <Edit className="size-4" />,
            onClick: () => handleChangeStatus(content),
            disabled: isProcessing,
          });
        }

        actions.push(
          {
            label: "Edit Source",
            icon: <Edit className="size-4" />,
            onClick: () => handleEditContent(content.id),
            disabled: isProcessing,
          },
          {
            label: "Duplicate Content",
            icon: <FileText className="size-4" />,
            onClick: () => handleCloneContent(content.id),
            disabled: isProcessing,
          },
          {
            label: "Remove Permanently",
            icon: <Trash2 className="size-4" />,
            onClick: () => handleDeleteContent(content.id),
            variant: "destructive",
            disabled: isProcessing,
          }
        );

        return (
          <div className="flex justify-end pr-4">
            <ActionsDropdown actions={actions} disabled={isProcessing} />
          </div>
        );
      },
    },
  ];

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
  const [currentContentId, setCurrentContentId] = useState<string>("");

  const { data: currentUser } = useUser();
  const userId = currentUser?.id || "";
  const { data: brandsData, isLoading: brandsLoading } = useBrands();
  const { data: teamBrands = [] } = useTeamBrands(teamId || "");
  const { data: products = [] } = useProducts();
  const [scopeBrandId, setScopeBrandId] = useState<string | "team-all">(teamId ? "team-all" : (initialBrandId || ""));

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

  const brands = useMemo(() => {
    if (!brandsData) return [];
    const brandArray = Array.isArray(brandsData) ? brandsData : (brandsData as any).data || [];
    return brandArray.map((b: any) => ({ id: b.id, name: b.name }));
  }, [brandsData]);

  const createContentMutation = useCreateContent();
  const createApprovalMutation = useCreateApproval();
  const updateContentMutation = useUpdateContent(currentContentId || "placeholder");
  const deleteContentMutation = useDeleteContent(currentContentId || "placeholder");
  const submitContentMutation = useSubmitContent(currentContentId || "placeholder");
  const publishContentMutation = usePublishContent(currentContentId || "placeholder");
  const cloneContentMutation = useCloneContent(currentContentId || "placeholder");

  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window !== 'undefined') setActiveTeamId(localStorage.getItem('activeTeamId'));
  }, []);
  const { data: teamMembers = [] } = useTeamMembers(activeTeamId || undefined);

  const contents: ContentResponseDto[] = Array.isArray(contentsData) ? (contentsData as any) : (contentsData?.data || []);
  const filteredContents = contents.filter(c => !searchTerm || c.title?.toLowerCase().includes(searchTerm.toLowerCase()));

  const queryClient = useQueryClient();

  const handleEditContent = (contentId: string) => {
    const content = contents.find((c) => c.id === contentId) || null;
    setSelectedContent(content);
    setIsEditing(true);
    if (contentId) setCurrentContentId(contentId);
  };

  const handleViewContent = (content: ContentResponseDto) => {
    setPreviewContent(content);
    setIsPreviewModalOpen(true);
  };

  const handleDeleteContent = async (contentId: string) => {
    if (confirm("Are you sure you want to delete this content?")) {
      try {
        await api.delete(endpoints.contentById(contentId));
        queryClient.invalidateQueries({ queryKey: ["contents"] });
        toast.success("Content deleted successfully");
      } catch (error) {
        toast.error("Failed to delete content");
      }
    }
  };

  const handleSubmitContent = (contentId: string) => {
    setCurrentContentId(contentId);
    setIsApprovalDialogOpen(true);
  };

  const handleCloneContent = async (contentId: string) => {
    try {
      // Assuming a standard clone endpoint pattern
      await api.post(`${endpoints.contentById(contentId)}/clone`);
      queryClient.invalidateQueries({ queryKey: ["contents"] });
      toast.success("Content cloned successfully");
    } catch (error) {
      toast.error("Failed to clone content");
    }
  };

  const handleChangeStatus = (content: ContentResponseDto) => {
    setStatusChangeContent(content);
    setIsChangeStatusModalOpen(true);
  };

  const handleSaveContent = async (data: any) => {
    if (selectedContent) {
      await handleUpdateContent(selectedContent.id, data);
    }
  };

  const handleUpdateContent = async (contentId: string, data: UpdateContentRequest) => {
    try {
      await api.put(endpoints.contentById(contentId), data);
      queryClient.invalidateQueries({ queryKey: ['contents'] });
      toast.success('Content synchronized');
      setIsEditing(false);
      setSelectedContent(null);
    } catch (e) { toast.error('Sync failed'); }
  };

  if (isLoading || brandsLoading) return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8 animate-pulse">
      <div className="h-8 w-64 bg-muted rounded-lg" />
      <div className="h-96 bg-muted rounded-2xl" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage>Creative Assets</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Content Factory</h1>
            <p className="text-lg text-muted-foreground mt-1">Design, approve, and distribute your creative library.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="lg" className="rounded-xl font-bold h-12 px-6 border-2" onClick={() => setIsCreating(true)}>
            <FileText className="mr-2 size-5" />
            Manual Script
          </Button>
          <Button size="lg" className="rounded-xl font-bold h-12 px-6 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            onClick={() => window.location.href = `/dashboard/brands/${initialBrandId || 'all'}/contents/new`}>
            <Brain className="mr-2 size-5" />
            Forge with AI
          </Button>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row items-center justify-between gap-4 p-4 rounded-2xl border bg-card/60 backdrop-blur-sm shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Filter by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-11 bg-background rounded-xl border-border/50"
            />
          </div>

          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <SelectTrigger className="h-11 w-full sm:w-[150px] rounded-xl bg-background border-border/50 font-semibold">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All States</SelectItem>
              {Object.values(ContentStatusEnum).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={adTypeFilter === "all" ? "all" : adTypeFilter.toString()} onValueChange={(v) => setAdTypeFilter(v === "all" ? "all" : parseInt(v))}>
            <SelectTrigger className="h-11 w-full sm:w-[150px] rounded-xl bg-background border-border/50 font-semibold">
              <SelectValue placeholder="Format" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Formats</SelectItem>
              <SelectItem value={AdTypeEnum.TextOnly.toString()}>Text Only</SelectItem>
              <SelectItem value={AdTypeEnum.ImageText.toString()}>Image + Text</SelectItem>
              <SelectItem value={AdTypeEnum.VideoText.toString()}>Video + Text</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3 px-4 py-2 bg-muted/30 rounded-xl border border-border/50">
          <div className="size-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-extrabold text-muted-foreground uppercase tracking-widest">{contents.length} Active Assets</span>
        </div>
      </div>

      {contents.length > 0 ? (
        <Card className="rounded-2xl border bg-card/40 overflow-hidden shadow-xl shadow-foreground/5 mb-10 transition-all">
          <CustomTable
            columns={createColumns(handleEditContent, handleViewContent, handleDeleteContent, handleSubmitContent, handleCloneContent, handleChangeStatus, brands, false, canUseTeamFeatures)}
            data={filteredContents}
            pageSize={10}
            className="border-0 shadow-none bg-transparent"
            headerClassName="bg-muted/30 border-b py-4 px-6 text-[10px] font-bold uppercase tracking-widest"
          />
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center pt-24 pb-32 px-6 text-center border-2 border-dashed rounded-3xl bg-muted/5">
          <div className="size-20 rounded-2xl bg-primary/5 flex items-center justify-center mb-8 text-primary shadow-inner">
            <FileText className="size-10" />
          </div>
          <div className="space-y-4 max-w-sm">
            <h3 className="text-2xl font-extrabold text-foreground">{searchTerm ? 'No results found' : 'Your vault is empty'}</h3>
            <p className="text-muted-foreground font-medium leading-relaxed">
              {searchTerm ? 'Try refining your search query.' : 'Begin your journey by creating content manually or leveraging our AI engine.'}
            </p>
          </div>
        </div>
      )}

      {/* Workflow Indicator */}
      <Card className="p-6 rounded-2xl border bg-primary/5 flex items-start gap-5 shadow-sm border-l-4 border-l-primary mb-20">
        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <AlertCircle className="size-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-base font-extrabold text-foreground tracking-tight italic">Governance & Compliance</h4>
          <p className="text-sm font-medium text-muted-foreground/80 leading-relaxed italic">
            Our enterprise workflow ensures every asset is vetted and approved before going live. This maintains a pristine brand reputation.
          </p>
        </div>
      </Card>

      {/* Modals & Dialogs */}
      <ContentModal content={null} isEditing={true} open={isCreating} onOpenChange={setIsCreating} onCreate={(d: any) => createContentMutation.mutateAsync(d).then(() => setIsCreating(false))} isProcessing={createContentMutation.isPending} brands={teamId ? undefined : brands} products={teamId ? undefined : products} teamId={teamId} userId={userId} defaultBrandId={scopeBrandId !== "team-all" ? scopeBrandId : (initialBrandId || undefined)} />
      <ContentModal content={selectedContent} isEditing={isEditing} open={!!selectedContent} onOpenChange={o => !o && setSelectedContent(null)} onSave={handleSaveContent} isProcessing={updateContentMutation.isPending} brands={teamId ? undefined : brands} products={teamId ? undefined : products} teamId={teamId} userId={userId} showButtons={isEditing} />

      <SubmitApprovalDialog content={selectedContent || contents.find(c => c.id === currentContentId) || null} isOpen={isApprovalDialogOpen} onClose={() => setIsApprovalDialogOpen(false)} isSubmitting={createApprovalMutation.isPending} approvers={teamMembers.map(m => ({ id: m.userId, email: m.userEmail, name: m.userEmail.split('@')[0], canApproveContent: m.canApproveContent }))} onSubmit={(d: any) => createApprovalMutation.mutateAsync(d).then(() => setIsApprovalDialogOpen(false))} />

      {previewContent && (
        <ContentPreviewModal content={previewContent} open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen} onSubmit={async (id) => { handleSubmitContent(id); setIsPreviewModalOpen(false); }} onPublish={(id, iid) => { setCurrentContentId(id); publishContentMutation.mutateAsync(iid).then(() => setIsPreviewModalOpen(false)); }} isProcessing={publishContentMutation.isPending} brands={brands} />
      )}

      <ChangeStatusModal content={statusChangeContent} isOpen={isChangeStatusModalOpen} onClose={() => setIsChangeStatusModalOpen(false)} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['contents'] })} />
    </div>
  );
}
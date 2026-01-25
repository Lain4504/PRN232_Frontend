"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Brain,
  AlertCircle,
  Search,
  MoreHorizontal,
  Plus,
  Trash2,
  Send,
  Eye,
  Settings,
  LayoutGrid,
  Edit,
  Copy
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
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
import {
  useCreateContent,
  useUpdateContent,
  usePublishContent,
} from "@/hooks/use-contents";
import { useContentsByBrandFilter } from "@/hooks/use-contents-by-brand";
import {
  ContentResponseDto,
  ContentStatusEnum,
  AdTypeEnum,
  CreateContentRequest,
  UpdateContentRequest,
  CreateApprovalRequest
} from "@/lib/types/omniadly-types";
import { ContentModal } from "@/components/contents/content-modal";
import { ContentPreviewModal } from "@/components/contents/content-preview-modal";
import { ChangeStatusModal } from "@/components/contents/change-status-modal";
import { toast } from "sonner";
import { SubmitApprovalDialog } from "@/components/contents/submit-approval-dialog";
import { useTeamMembers } from "@/hooks/use-teams";
import { useCreateApproval } from "@/hooks/use-approvals";
import { useQueryClient } from "@tanstack/react-query";
import { api, endpoints } from "@/lib/api";
import { useProfile } from "@/lib/contexts/profile-context";
import { ProfileTypeEnum } from "@/lib/utils/profile-utils";
import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const createColumns = (
  handleEditContent: (contentId: string) => void,
  handleViewContent: (content: ContentResponseDto) => void,
  handleDeleteContent: (contentId: string) => void,
  handleSubmitContent: (contentId: string) => void,
  handleCloneContent: (contentId: string) => void,
  handleChangeStatus: (content: ContentResponseDto) => void,
  brands: { id: string; name: string }[] = [],
  isProcessing: boolean,
  canUseTeamFeatures: boolean,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any
): ColumnDef<ContentResponseDto>[] => [
    {
      accessorKey: "title",
      header: t("contents.contentTitle"),
      cell: ({ row }) => {
        const content = row.original;
        const status = content.status;

        return (
          <div className="flex items-center gap-3 py-2">
            <div className="size-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0 border border-border overflow-hidden">
              <FileText className="size-4 opacity-70" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-sm text-foreground truncate max-w-[250px]">{row.getValue("title")}</span>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="outline" className={cn("text-[8px] font-bold uppercase tracking-wider h-4 px-1.5 rounded-sm",
                  status === ContentStatusEnum.Published ? "border-emerald-500/30 text-emerald-600 bg-emerald-50/50" :
                    status === ContentStatusEnum.Approved ? "border-blue-500/30 text-blue-600 bg-blue-50/50" :
                      status === ContentStatusEnum.PendingApproval ? "border-amber-500/30 text-amber-600 bg-amber-50/50" :
                        "border-slate-500/20 text-slate-600 bg-slate-50/50"
                )}>
                  {t(`contents.status.${status.toLowerCase()}`, status)}
                </Badge>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "adType",
      header: t("contents.format"),
      cell: ({ row }) => {
        const value = row.getValue("adType") as unknown as AdTypeEnum;
        const label = (() => {
          if (typeof value === 'string') {
            const v = String(value).toLowerCase();
            if (v === 'textonly' || v === 'text_only') return t("contents.adType.textOnly");
            if (v === 'imagetext' || v === 'image_text') return t("contents.adType.imageText");
            if (v === 'videotext' || v === 'video_text') return t("contents.adType.videoText");
            return value;
          }
          if (value === AdTypeEnum.TextOnly) return t("contents.adType.textOnly");
          if (value === AdTypeEnum.ImageText) return t("contents.adType.imageText");
          if (value === AdTypeEnum.VideoText) return t("contents.adType.videoText");
          return t("contents.adType.unknown");
        })();
        return (
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
        );
      },
    },
    {
      accessorKey: "brandId",
      header: t("brands.title"),
      cell: ({ row }) => {
        const brandId = row.getValue("brandId") as string;
        const brand = brands.find(b => b.id === brandId);
        return (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-foreground truncate max-w-[120px]">{brand?.name || "Global"}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: t("contents.registry"),
      cell: ({ row }) => {
        const createdAt = row.getValue("createdAt") as string;
        return (
          <span className="text-xs text-muted-foreground font-medium">
            {createdAt ? format(new Date(createdAt), 'dd/MM/yyyy') : "-"}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">{t("contents.actions")}</div>,
      cell: ({ row }) => {
        const content = row.original;
        const canSubmit = content.status === ContentStatusEnum.Draft;

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[180px]">
                <DropdownMenuItem onClick={() => handleViewContent(content)}>
                  <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                  {t("contents.viewCreative")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {canSubmit && canUseTeamFeatures && (
                  <DropdownMenuItem onClick={() => handleSubmitContent(content.id)} disabled={isProcessing}>
                    <Send className="mr-2 h-4 w-4 text-muted-foreground" />
                    {t("contents.requestApproval")}
                  </DropdownMenuItem>
                )}
                {!canUseTeamFeatures && (
                  <DropdownMenuItem onClick={() => handleChangeStatus(content)} disabled={isProcessing}>
                    <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                    {t("contents.updateStatus")}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => handleEditContent(content.id)} disabled={isProcessing}>
                  <Edit className="mr-2 h-4 w-4 text-muted-foreground" />
                  {t("contents.editSource")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleCloneContent(content.id)} disabled={isProcessing}>
                  <Copy className="mr-2 h-4 w-4 text-muted-foreground" />
                  {t("contents.duplicate")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleDeleteContent(content.id)} disabled={isProcessing} className="text-destructive focus:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t("contents.removePermanently")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

export interface ContentsManagementProps {
  initialBrandId?: string;
  teamId?: string;
}

export function ContentsManagement({ initialBrandId, teamId }: ContentsManagementProps = {}) {
  const { t } = useTranslation("common");
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
  const { data: products = [] } = useProducts();
  const [scopeBrandId] = useState<string | "team-all">(teamId ? "team-all" : (initialBrandId || ""));

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
    const brandArray = Array.isArray(brandsData) ? brandsData : (brandsData as { data: { id: string; name: string }[] }).data || [];
    return brandArray.map((b: { id: string; name: string }) => ({ id: b.id, name: b.name }));
  }, [brandsData]);

  const queryClient = useQueryClient();
  const updateContentMutation = useUpdateContent(currentContentId || "placeholder");
  const publishContentMutation = usePublishContent(currentContentId || "placeholder");

  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window !== 'undefined') setActiveTeamId(localStorage.getItem('activeTeamId'));
  }, []);
  const { data: teamMembers = [] } = useTeamMembers(activeTeamId || undefined);

  const contents: ContentResponseDto[] = Array.isArray(contentsData) ? (contentsData as ContentResponseDto[]) : ((contentsData as { data: ContentResponseDto[] })?.data || []);
  const filteredContents = contents.filter(c => !searchTerm || c.title?.toLowerCase().includes(searchTerm.toLowerCase()));

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
    if (confirm(t("brands.deleteConfirm"))) {
      try {
        await api.delete(endpoints.contentById(contentId));
        queryClient.invalidateQueries({ queryKey: ["contents"] });
        toast.success(t("success"));
      } catch {
        toast.error(t("error"));
      }
    }
  };

  const handleSubmitContent = (contentId: string) => {
    setCurrentContentId(contentId);
    setIsApprovalDialogOpen(true);
  };

  const handleCloneContent = async (contentId: string) => {
    try {
      await api.post(`${endpoints.contentById(contentId)}/clone`);
      queryClient.invalidateQueries({ queryKey: ["contents"] });
      toast.success(t("success"));
    } catch {
      toast.error(t("error"));
    }
  };

  const handleChangeStatus = (content: ContentResponseDto) => {
    setStatusChangeContent(content);
    setIsChangeStatusModalOpen(true);
  };

  const handleSaveContent = async (data: UpdateContentRequest) => {
    if (selectedContent) {
      try {
        await api.put(endpoints.contentById(selectedContent.id), data);
        queryClient.invalidateQueries({ queryKey: ['contents'] });
        toast.success(t("contents.syncSuccess"));
        setIsEditing(false);
        setSelectedContent(null);
      } catch { toast.error(t("contents.syncError")); }
    }
  };

  if (isLoading || brandsLoading) return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-muted rounded" />
      <div className="h-[400px] bg-muted rounded-xl" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 font-fira-sans animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Breadcrumb className="mb-2">
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink href="/dashboard" className="text-[10px] uppercase font-bold tracking-wider">{t("dashboard.title")}</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage className="text-[10px] uppercase font-bold tracking-wider text-primary">{t("contents.title")}</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("contents.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("contents.description")}</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setIsCreating(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t("contents.createContent")}
          </Button>
          <Button onClick={() => window.location.href = `/dashboard/brands/${initialBrandId || 'all'}/contents/new`}>
            <Brain className="mr-2 h-4 w-4" />
            {t("contents.aiGenerate")}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col xl:flex-row items-center justify-between gap-4 p-4 rounded-xl border bg-card shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder={t("contents.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ContentStatusEnum | 'all')}>
            <SelectTrigger className="h-9 w-full sm:w-[150px]">
              <SelectValue placeholder={t("contents.filterByStatus")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("contents.allStatuses")}</SelectItem>
              {Object.values(ContentStatusEnum).map(s => (
                <SelectItem key={s} value={s}>{t(`contents.status.${s.toLowerCase()}`, s)}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={adTypeFilter === "all" ? "all" : adTypeFilter.toString()} onValueChange={(v) => setAdTypeFilter(v === "all" ? "all" : parseInt(v))}>
            <SelectTrigger className="h-9 w-full sm:w-[150px]">
              <SelectValue placeholder={t("contents.format")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả định dạng</SelectItem>
              <SelectItem value={AdTypeEnum.TextOnly.toString()}>{t("contents.adType.textOnly")}</SelectItem>
              <SelectItem value={AdTypeEnum.ImageText.toString()}>{t("contents.adType.imageText")}</SelectItem>
              <SelectItem value={AdTypeEnum.VideoText.toString()}>{t("contents.adType.videoText")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/40 rounded-lg border text-xs font-bold text-muted-foreground">
          <div className="size-1.5 rounded-full bg-primary animate-pulse" />
          {contents.length} {t("contents.activeAssets")}
        </div>
      </div>

      {/* Table Section */}
      {contents.length > 0 ? (
        <Card className="border shadow-sm overflow-hidden">
          <CustomTable
            columns={createColumns(handleEditContent, handleViewContent, handleDeleteContent, handleSubmitContent, handleCloneContent, handleChangeStatus, brands, false, canUseTeamFeatures, t)}
            data={filteredContents}
            pageSize={10}
            className="border-0 shadow-none bg-transparent"
            headerClassName="bg-muted/50 border-b py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
          />
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center border-2 border-dashed rounded-xl bg-muted/5">
          <div className="size-16 rounded-2xl bg-muted flex items-center justify-center mb-6">
            <FileText className="size-8 text-muted-foreground/30" />
          </div>
          <h3 className="text-lg font-bold">{searchTerm ? t("products.noResults") : t("contents.noContents")}</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-8">
            {searchTerm ? t("contents.description") : t("contents.noContentsDescription")}
          </p>
        </div>
      )}

      {/* Governance Footer Card */}
      <Card className="p-4 rounded-xl border bg-primary/5 flex items-start gap-4 border-l-4 border-l-primary">
        <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <AlertCircle className="size-5" />
        </div>
        <div className="grid gap-0.5">
          <h4 className="text-sm font-bold text-foreground">{t("contents.governance")}</h4>
          <p className="text-xs text-muted-foreground leading-relaxed italic">
            {t("contents.governanceDesc")}
          </p>
        </div>
      </Card>

      {/* Modals & Dialogs */}
      <ContentModal content={null} isEditing={true} open={isCreating} onOpenChange={setIsCreating} onCreate={(d: CreateContentRequest) => api.post(endpoints.contents(), d).then(() => { setIsCreating(false); queryClient.invalidateQueries({ queryKey: ["contents"] }); toast.success(t("success")); })} isProcessing={false} brands={teamId ? undefined : brands} products={teamId ? undefined : products} teamId={teamId} userId={userId} defaultBrandId={scopeBrandId !== "team-all" ? scopeBrandId : (initialBrandId || undefined)} />

      {selectedContent && (
        <ContentModal content={selectedContent} isEditing={isEditing} open={!!selectedContent} onOpenChange={o => !o && setSelectedContent(null)} onSave={handleSaveContent} isProcessing={false} brands={teamId ? undefined : brands} products={teamId ? undefined : products} teamId={teamId} userId={userId} showButtons={isEditing} />
      )}

      <SubmitApprovalDialog content={selectedContent || contents.find(c => c.id === currentContentId) || null} isOpen={isApprovalDialogOpen} onClose={() => setIsApprovalDialogOpen(false)} isSubmitting={false} approvers={teamMembers.map(m => ({ id: m.userId, email: m.userEmail, name: m.userEmail.split('@')[0], canApproveContent: m.canApproveContent }))} onSubmit={(d: CreateApprovalRequest) => api.post(endpoints.approvals(), d).then(() => { setIsApprovalDialogOpen(false); queryClient.invalidateQueries({ queryKey: ["contents"] }); toast.success(t("success")); })} />

      {previewContent && (
        <ContentPreviewModal content={previewContent} open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen} onSubmit={async (id) => { handleSubmitContent(id); setIsPreviewModalOpen(false); }} onPublish={async (id, iid) => { setCurrentContentId(id); await api.post(endpoints.contentPublish(id, iid)); queryClient.invalidateQueries({ queryKey: ["contents"] }); toast.success(t("success")); setIsPreviewModalOpen(false); }} isProcessing={false} brands={brands} />
      )}

      <ChangeStatusModal content={statusChangeContent} isOpen={isChangeStatusModalOpen} onClose={() => setIsChangeStatusModalOpen(false)} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['contents'] })} />
    </div>
  );
}

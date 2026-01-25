"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Search, Calendar, User, FileText, Eye, Trash2, Plus } from "lucide-react";
import { ActionsDropdown, ActionItem } from "@/components/ui/actions-dropdown";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomTable } from "@/components/ui/custom-table";
import { ColumnDef } from "@tanstack/react-table";
import { useBrands } from "@/hooks/use-brands";
import {
  useApprovals,
  usePendingApprovals,
  useApproveApproval,
  useRejectApproval,
  useDeleteApprovalWithConfirm
} from "@/hooks/use-approvals";
import {
  ApprovalResponseDto,
  ContentStatusEnum,
  ApprovalFilters
} from "@/lib/types/omniadly-types";
import { ApprovalModal } from "@/components/approvals/approval-modal";
import { ChangeApproverDialog } from "@/components/approvals/change-approver-dialog";
import { toast } from "sonner";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useProfile } from "@/lib/contexts/profile-context";
import { useTranslation } from "react-i18next";
import { ProfileTypeEnum } from "@/lib/utils/profile-utils";

interface SharedApprovalManagementProps {
  context: 'dashboard' | 'team';
  teamId?: string;
  showCreateButton?: boolean;
  title?: string;
  description?: string;
}

// Create columns for the approvals data table
const createColumns = (
  handleReview: (approval: ApprovalResponseDto) => void,
  handleQuickApprove: (approvalId: string) => void,
  handleQuickReject: (approvalId: string) => void,
  handleDelete: (approval: ApprovalResponseDto) => void,
  handleChangeApprover: (approval: ApprovalResponseDto) => void,
  isProcessing: boolean,
  canUseTeamFeatures: boolean,
  t: (key: string) => string,
  i18n: any
): ColumnDef<ApprovalResponseDto>[] => [
    {
      accessorKey: "contentTitle",
      header: t('approvals.contentTitle'),
      cell: ({ row }) => {

        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                <FileText className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold">
                {row.getValue("contentTitle")}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: t('approvals.status'),
      cell: ({ row }) => {
        const status = row.getValue("status") as ContentStatusEnum;
        return (
          <div className="text-center">
            <Badge variant="secondary" className={
              status === ContentStatusEnum.Approved ? "bg-green-100 text-green-800" :
                status === ContentStatusEnum.PendingApproval ? "bg-yellow-100 text-yellow-800" :
                  status === ContentStatusEnum.Rejected ? "bg-red-100 text-red-800" :
                    "bg-gray-100 text-gray-800"
            }>
              {status ? t(`contents.status.${status.charAt(0).toLowerCase() + status.slice(1)}`) : t('common.unknown')}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "brandName",
      header: t('approvals.brand'),
      cell: ({ row }) => {
        const brandName = row.getValue("brandName") as string;
        return (
          <div className="text-sm text-center">
            {brandName ? (
              <Badge variant="outline">
                {brandName}
              </Badge>
            ) : (
              <span className="text-muted-foreground">{t('approvals.noBrand')}</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "approverEmail",
      header: t('approvals.approver'),
      cell: ({ row }) => {
        const approverEmail = row.getValue("approverEmail") as string;
        return (
          <div className="flex items-center justify-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">
                <User className="h-3 w-3" />
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">{approverEmail || "N/A"}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: t('approvals.created'),
      cell: ({ row }) => {
        const createdAt = row.getValue("createdAt") as string;

        return (
          <div className="text-sm text-muted-foreground text-center">
            {createdAt ? (
              <div className="flex items-center justify-center gap-1">
                <Calendar className="h-3 w-3" />
                <div>
                  <div>{new Date(createdAt).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')}</div>
                  <div className="text-xs">{new Date(createdAt).toLocaleTimeString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')}</div>
                </div>
              </div>
            ) : (
              <span>{t('common.noData')}</span>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "",
      size: 50,
      maxSize: 50,
      cell: ({ row }) => {
        const approval = row.original;

        const actions: ActionItem[] = [
          {
            label: t('approvals.review'),
            icon: <Eye className="h-4 w-4" />,
            onClick: () => handleReview(approval),
          },
        ];

        // Quick Approve/Reject removed per requirement

        // Add Change Approver action for pending approvals (only for Basic/Pro profiles)
        if (approval.status === ContentStatusEnum.PendingApproval && canUseTeamFeatures) {
          actions.push({
            label: t('approvals.changeApprover'),
            icon: <User className="h-4 w-4" />,
            onClick: () => handleChangeApprover(approval),
            disabled: isProcessing,
          });
        }

        actions.push({
          label: t('approvals.delete'),
          icon: <Trash2 className="h-4 w-4" />,
          onClick: () => handleDelete(approval),
          variant: "destructive" as const,
          disabled: isProcessing,
        });

        return (
          <div className="flex justify-center">
            <ActionsDropdown actions={actions} disabled={isProcessing} />
          </div>
        );
      },
    },
  ];

export function SharedApprovalManagement({
  context,
  teamId,
  showCreateButton = true,
  title,
  description
}: SharedApprovalManagementProps) {
  const { t, i18n } = useTranslation("common");
  const { profileType } = useProfile();
  const canUseTeamFeatures = profileType !== ProfileTypeEnum.Free;

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContentStatusEnum | "all">("all");
  const [selectedApproval, setSelectedApproval] = useState<ApprovalResponseDto | null>(null);
  const [, setApprovalNotes] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [approvalToDelete, setApprovalToDelete] = useState<ApprovalResponseDto | null>(null);
  const [showChangeApproverDialog, setShowChangeApproverDialog] = useState(false);
  const [approvalToChange, setApprovalToChange] = useState<ApprovalResponseDto | null>(null);

  // Build filters for approvals query
  const filters: ApprovalFilters = {
    page: 1,
    pageSize: 50,
    searchTerm: searchTerm || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    sortBy: "createdAt",
    sortDescending: true,
  };

  // Hooks
  useBrands();
  const { data: pendingApprovalsData } = usePendingApprovals(1, 50);
  const { data: approvalsData, isLoading } = useApprovals(filters);
  const approveApprovalMutation = useApproveApproval(selectedApproval?.id || "");
  const rejectApprovalMutation = useRejectApproval(selectedApproval?.id || "");
  const deleteApprovalMutation = useDeleteApprovalWithConfirm();

  // Get approvals based on filter
  const approvals = statusFilter === "all" ? approvalsData?.data || [] :
    statusFilter === ContentStatusEnum.PendingApproval ? pendingApprovalsData?.data || [] :
      approvalsData?.data || [];

  const filteredApprovals = approvals.filter(approval => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return approval.contentTitle?.toLowerCase().includes(searchLower) ||
      approval.brandName?.toLowerCase().includes(searchLower) ||
      approval.approverEmail?.toLowerCase().includes(searchLower);
  });

  const handleApprove = async (notes: string) => {
    if (!selectedApproval) return;

    try {
      await approveApprovalMutation.mutateAsync(notes);
      setApprovalNotes("");
      toast.success(t('approvals.approveSuccess'));
      // Show publish dialog after approval (keep selectedApproval for publish dialog)
    } catch (error) {
      console.error('Failed to approve content:', error);
      toast.error(t('common.error'));
      setSelectedApproval(null);
    }
  };

  const handleReject = async (notes: string) => {
    if (!selectedApproval) return;

    if (!notes.trim()) {
      toast.error(t('approvals.rejectionReason'));
      return;
    }

    try {
      await rejectApprovalMutation.mutateAsync(notes);
      setSelectedApproval(null);
      setApprovalNotes("");
      toast.success(t('approvals.rejectSuccess'));
    } catch (error) {
      console.error('Failed to reject content:', error);
      toast.error(t('common.error'));
    }
  };

  const handleQuickApprove = async (approvalId: string) => {
    try {
      const approval = approvals.find(a => a.id === approvalId);
      if (!approval) return;

      setSelectedApproval(approval);
      await approveApprovalMutation.mutateAsync("");
      toast.success(t('approvals.approveSuccess'));
      // Show publish dialog after approval (keep selectedApproval for publish dialog)
    } catch (error) {
      console.error('Failed to approve content:', error);
      toast.error('Failed to approve content');
      setSelectedApproval(null);
    }
  };

  const handleQuickReject = async (approvalId: string) => {
    const approval = approvals.find(a => a.id === approvalId);
    if (!approval) return;

    setSelectedApproval(approval);
    // For quick reject, we still need to open the modal to get rejection reason
  };

  const handleDelete = (approval: ApprovalResponseDto) => {
    setApprovalToDelete(approval);
    setShowDeleteDialog(true);
  };

  const handleChangeApprover = (approval: ApprovalResponseDto) => {
    setApprovalToChange(approval);
    setShowChangeApproverDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!approvalToDelete) return;

    try {
      await deleteApprovalMutation.mutateAsync(approvalToDelete.id);
      toast.success(t('approvals.deleteSuccess'));
      setShowDeleteDialog(false);
      setApprovalToDelete(null);
    } catch (error) {
      console.error('Failed to delete approval:', error);
      toast.error(t('common.error'));
    }
  };

  const handleChangeApproverClose = () => {
    setShowChangeApproverDialog(false);
    setApprovalToChange(null);
  };


  if (isLoading) {
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
              <BreadcrumbLink href="/dashboard">{t('common.overview.title')}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{title || t('approvals.title')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div>
          <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold tracking-tight text-foreground">
            {title || t('approvals.title')}
          </h1>
          <p className="text-sm lg:text-base xl:text-lg text-muted-foreground mt-2 max-w-2xl">
            {description || t('approvals.description')}
          </p>
        </div>

        {/* Single Row Layout - Stats, Filters, Search, Approvals Count, Create Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 flex-wrap">
          {/* Stats */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border text-xs lg:text-sm">
              <CheckCircle className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground flex-shrink-0" />
              <span className="font-medium">{filteredApprovals.length}</span>
              <span className="text-muted-foreground">{t('approvals.count')}{filteredApprovals.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border text-xs lg:text-sm">
              <span className="font-medium">{approvals.filter(a => a.status === ContentStatusEnum.PendingApproval).length}</span>
              <span className="text-muted-foreground">{t('approvals.pending')}</span>
            </div>
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ContentStatusEnum | "all")}>
            <SelectTrigger className="w-full sm:w-[140px] md:w-40">
              <SelectValue placeholder={t('approvals.status')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.allStatuses')}</SelectItem>
              <SelectItem value={ContentStatusEnum.PendingApproval}>{t('approvals.pending')}</SelectItem>
              <SelectItem value={ContentStatusEnum.Approved}>{t('approvals.approved')}</SelectItem>
              <SelectItem value={ContentStatusEnum.Rejected}>{t('approvals.rejected')}</SelectItem>
            </SelectContent>
          </Select>

          {/* Search */}
          <div className="relative w-full sm:w-64 md:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('approvals.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9"
            />
          </div>





          {/* Create Button */}
          {showCreateButton && (
            <div className="w-full sm:w-auto sm:ml-auto flex items-center gap-2">
              <Button
                onClick={() => {
                  // Navigate to content creation or approval creation page
                  if (context === 'team' && teamId) {
                    window.location.href = `/team/${teamId}/contents`;
                  } else {
                    window.location.href = '/dashboard/contents';
                  }
                }}
                size="sm"
                className="flex items-center gap-2 w-full sm:w-auto"
              >
                <Plus className="h-4 w-4" />
                {t('approvals.createApproval')}
              </Button>
            </div>
          )}
        </div>

        {/* Approvals Table or Empty State */}
        {filteredApprovals.length > 0 ? (
          <CustomTable
            columns={createColumns(
              setSelectedApproval,
              handleQuickApprove,
              handleQuickReject,
              handleDelete,
              handleChangeApprover,
              approveApprovalMutation.isPending || rejectApprovalMutation.isPending,
              canUseTeamFeatures,
              t,
              i18n
            )}
            data={filteredApprovals}
            pageSize={10}
          />
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-6">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {searchTerm || statusFilter !== "all" ? t('common.noMatchesFound') : t('approvals.allCaughtUp')}
                </h3>
                <p className="text-muted-foreground mb-4 text-sm leading-relaxed max-w-sm mx-auto">
                  {searchTerm || statusFilter !== "all"
                    ? t('common.noMatchesDesc')
                    : t('approvals.noPendingApprovals')
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Approval Modal */}
        <ApprovalModal
          approval={selectedApproval}
          onClose={() => setSelectedApproval(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          onPublishComplete={() => {
            setSelectedApproval(null);
            toast.success(t('approvals.publishSuccess'));
          }}
          isProcessing={approveApprovalMutation.isPending || rejectApprovalMutation.isPending}
        />


        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('approvals.confirmDeleteTitle')}</DialogTitle>
              <DialogDescription>
                {t('approvals.confirmDeleteDesc')}
                {approvalToDelete && (
                  <div className="mt-2 p-3 bg-muted rounded-md">
                    <p className="font-medium">{approvalToDelete.contentTitle}</p>
                    <p className="text-sm text-muted-foreground">
                      Brand: {approvalToDelete.brandName} • Status: {approvalToDelete.status}
                    </p>
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                disabled={deleteApprovalMutation.isPending}
              >
                {t('common.cancel')}
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={deleteApprovalMutation.isPending}
              >
                {deleteApprovalMutation.isPending ? t('common.saving') : t('approvals.deleteApproval')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Change Approver Dialog */}
        <ChangeApproverDialog
          approval={approvalToChange}
          isOpen={showChangeApproverDialog}
          onClose={handleChangeApproverClose}
        />
      </div>
    </div>
  );
}

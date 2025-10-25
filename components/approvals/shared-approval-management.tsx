"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Search, Filter, X, Calendar, User, FileText, Eye, Check, X as XIcon, Trash2, Plus } from "lucide-react";
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
import { DataTable } from "@/components/ui/data-table";
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
} from "@/lib/types/aisam-types";
import { ApprovalModal } from "@/components/approvals/approval-modal";
import { toast } from "sonner";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
  isProcessing: boolean
): ColumnDef<ApprovalResponseDto>[] => [
    {
      accessorKey: "contentTitle",
      header: "Content Title",
      cell: ({ row }) => {
        const approval = row.original;
        const status = approval.status;

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
                onClick={() => handleReview(approval)}
              >
                {row.getValue("contentTitle")}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className={
                  status === ContentStatusEnum.Approved ? "bg-green-100 text-green-800" :
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
      accessorKey: "brandName",
      header: "Brand",
      cell: ({ row }) => {
        const brandName = row.getValue("brandName") as string;
        return (
          <div className="text-sm">
            {brandName ? (
              <Badge variant="outline">
                {brandName}
              </Badge>
            ) : (
              <span className="text-muted-foreground">No brand</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "approverEmail",
      header: "Approver",
      cell: ({ row }) => {
        const approverEmail = row.getValue("approverEmail") as string;
        return (
          <div className="flex items-center gap-2">
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
        const approval = row.original;
        const canApprove = approval.status === ContentStatusEnum.PendingApproval;
        const canReject = approval.status === ContentStatusEnum.PendingApproval;

        const actions: ActionItem[] = [
          {
            label: "Review",
            icon: <Eye className="h-4 w-4" />,
            onClick: () => handleReview(approval),
          },
        ];

        if (canApprove) {
          actions.push({
            label: "Quick Approve",
            icon: <Check className="h-4 w-4" />,
            onClick: () => handleQuickApprove(approval.id),
            disabled: isProcessing,
          });
        }

        if (canReject) {
          actions.push({
            label: "Quick Reject",
            icon: <XIcon className="h-4 w-4" />,
            onClick: () => handleQuickReject(approval.id),
            disabled: isProcessing,
          });
        }

        actions.push({
          label: "Delete",
          icon: <Trash2 className="h-4 w-4" />,
          onClick: () => handleDelete(approval),
          variant: "destructive" as const,
          disabled: isProcessing,
        });

        return <ActionsDropdown actions={actions} disabled={isProcessing} />;
      },
    },
  ];

export function SharedApprovalManagement({
  context,
  teamId,
  showCreateButton = true,
  title = "Content Approvals",
  description = "Review and approve content before publishing"
}: SharedApprovalManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContentStatusEnum | "all">("all");
  const [selectedApproval, setSelectedApproval] = useState<ApprovalResponseDto | null>(null);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [approvalToDelete, setApprovalToDelete] = useState<ApprovalResponseDto | null>(null);

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
  const { data: brands = [] } = useBrands();
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
      toast.success('Content approved successfully');
      // Show publish dialog after approval (keep selectedApproval for publish dialog)
    } catch (error) {
      console.error('Failed to approve content:', error);
      toast.error('Failed to approve content');
      setSelectedApproval(null);
    }
  };

  const handleReject = async (notes: string) => {
    if (!selectedApproval) return;

    if (!notes.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      await rejectApprovalMutation.mutateAsync(notes);
      setSelectedApproval(null);
      setApprovalNotes("");
      toast.success('Content rejected');
    } catch (error) {
      console.error('Failed to reject content:', error);
      toast.error('Failed to reject content');
    }
  };

  const handleQuickApprove = async (approvalId: string) => {
    try {
      const approval = approvals.find(a => a.id === approvalId);
      if (!approval) return;

      setSelectedApproval(approval);
      await approveApprovalMutation.mutateAsync("");
      toast.success('Content approved successfully');
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

  const handleConfirmDelete = async () => {
    if (!approvalToDelete) return;

    try {
      await deleteApprovalMutation.mutateAsync(approvalToDelete.id);
      toast.success('Approval deleted successfully');
      setShowDeleteDialog(false);
      setApprovalToDelete(null);
    } catch (error) {
      console.error('Failed to delete approval:', error);
      toast.error('Failed to delete approval');
    }
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
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div>
          <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="text-sm lg:text-base xl:text-lg text-muted-foreground mt-2 max-w-2xl">
            {description}
          </p>
        </div>

        {/* Single Row Layout - Stats, Filters, Search, Approvals Count, Create Button */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Stats */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border text-xs lg:text-sm">
              <CheckCircle className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground flex-shrink-0" />
              <span className="font-medium">{filteredApprovals.length}</span>
              <span className="text-muted-foreground">Approval{filteredApprovals.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border text-xs lg:text-sm">
              <span className="font-medium">{approvals.filter(a => a.status === ContentStatusEnum.PendingApproval).length}</span>
              <span className="text-muted-foreground">Pending</span>
            </div>
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ContentStatusEnum | "all")}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value={ContentStatusEnum.PendingApproval}>Pending</SelectItem>
              <SelectItem value={ContentStatusEnum.Approved}>Approved</SelectItem>
              <SelectItem value={ContentStatusEnum.Rejected}>Rejected</SelectItem>
            </SelectContent>
          </Select>

          {/* Search */}
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search approvals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9"
            />
          </div>





          {/* Create Button */}
          {showCreateButton && (
            <div className="ml-auto">
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
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Approval
              </Button>
            </div>
          )}
        </div>

        {/* Approvals Table or Empty State */}
        {filteredApprovals.length > 0 ? (
          <DataTable
            columns={createColumns(
              setSelectedApproval,
              handleQuickApprove,
              handleQuickReject,
              handleDelete,
              approveApprovalMutation.isPending || rejectApprovalMutation.isPending
            )}
            data={filteredApprovals}
            pageSize={10}
            showSearch={false}
            showPageSize={false}
          />
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-6">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {searchTerm || statusFilter !== "all" ? 'No approvals found' : 'All caught up!'}
                </h3>
                <p className="text-muted-foreground mb-4 text-sm leading-relaxed max-w-sm mx-auto">
                  {searchTerm || statusFilter !== "all"
                    ? 'Try adjusting your search terms or filters to find your approvals.'
                    : 'There are no pending approvals at the moment.'
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
            toast.success('Content published successfully!');
          }}
          isProcessing={approveApprovalMutation.isPending || rejectApprovalMutation.isPending}
        />


        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Approval</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this approval? This action cannot be undone.
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
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={deleteApprovalMutation.isPending}
              >
                {deleteApprovalMutation.isPending ? 'Deleting...' : 'Delete Approval'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

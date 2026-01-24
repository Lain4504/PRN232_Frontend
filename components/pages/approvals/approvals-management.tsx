"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Search, Filter, X, Calendar, User, FileText, Eye, Check, X as XIcon, Trash2 } from "lucide-react";
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
              <div className="font-medium">
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

        // Quick Approve/Reject removed per requirement

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

export function ApprovalsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContentStatusEnum | "all">("all");
  const [selectedApproval, setSelectedApproval] = useState<ApprovalResponseDto | null>(null);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [approvalToDelete, setApprovalToDelete] = useState<ApprovalResponseDto | null>(null);
  const [pageSize, setPageSize] = useState(10);

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
      setSelectedApproval(null);
      setApprovalNotes("");
      toast.success('Content approved successfully');
    } catch (error) {
      console.error('Failed to approve content:', error);
      toast.error('Failed to approve content');
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
      setSelectedApproval(null);
      toast.success('Content approved successfully');
    } catch (error) {
      console.error('Failed to approve content:', error);
      toast.error('Failed to approve content');
    }
  };

  const handleQuickReject = async (approvalId: string) => {
    const approval = approvals.find(a => a.id === approvalId);
    if (!approval) return;

    setSelectedApproval(approval);
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
      <div className="w-full max-w-full overflow-x-hidden font-fira-sans">
        <div className="space-y-10 p-6 lg:p-10 bg-background">
          <div className="space-y-6">
            <Skeleton className="h-4 w-48 mb-6" />
            <div>
              <Skeleton className="h-12 w-64 mb-3" />
              <Skeleton className="h-6 w-96" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-14 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto font-fira-sans">
      <div className="space-y-10 p-6 lg:p-10 bg-background">
        {/* Breadcrumb - Clean & Strategic */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard" className="text-[10px] font-black uppercase tracking-[0.2em]">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Content Pipeline</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Tactical Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-2 w-8 bg-primary rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">Governance Hub</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-foreground uppercase leading-none">
              Content <span className="text-primary italic">Approvals</span>
            </h1>
            <p className="text-lg text-muted-foreground font-medium max-w-2xl leading-relaxed tracking-tight">
              Maintain absolute creative sovereignty. Review and authorize precision-generated assets.
            </p>
          </div>

          {/* Quick Metrics Vault */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 px-6 py-4 bg-card/40 backdrop-blur-xl rounded-2xl border border-border/40 shadow-xl">
              <div className="space-y-1 pr-4 border-r border-border/20">
                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Total Nodes</div>
                <div className="text-2xl font-black font-fira-mono tracking-tighter tabular-nums text-foreground">{filteredApprovals.length}</div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">Pending Action</div>
                <div className="text-2xl font-black font-fira-mono tracking-tighter tabular-nums text-primary">{approvals.filter(a => a.status === ContentStatusEnum.PendingApproval).length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Command Toolbar */}
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-4 bg-muted/20 p-4 rounded-3xl border border-border/40">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground stroke-[2.5]" />
            <Input
              placeholder="SEARCH ASSET METADATA..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 bg-background/50 border-border/40 rounded-2xl font-bold text-xs uppercase tracking-widest focus:ring-primary/20"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ContentStatusEnum | "all")}>
              <SelectTrigger className="h-12 w-full sm:w-[180px] bg-background/50 border-border/40 rounded-xl font-bold text-[11px] uppercase tracking-widest">
                <SelectValue placeholder="STATUS" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/40 font-fira-sans">
                <SelectItem value="all" className="font-bold uppercase text-[10px] tracking-widest">ALL ANALYTES</SelectItem>
                <SelectItem value={ContentStatusEnum.PendingApproval} className="font-bold uppercase text-[10px] tracking-widest">PENDING ACTION</SelectItem>
                <SelectItem value={ContentStatusEnum.Approved} className="font-bold uppercase text-[10px] tracking-widest">AUTHORIZED</SelectItem>
                <SelectItem value={ContentStatusEnum.Rejected} className="font-bold uppercase text-[10px] tracking-widest">REJECTED</SelectItem>
              </SelectContent>
            </Select>

            <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
              <SelectTrigger className="h-12 w-full sm:w-[130px] bg-background/50 border-border/40 rounded-xl font-bold text-[11px] uppercase tracking-widest">
                <SelectValue placeholder="DENSITY" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/40 font-fira-sans">
                {[5, 10, 20, 50].map((size) => (
                  <SelectItem key={size} value={String(size)} className="font-bold uppercase text-[10px] tracking-widest">{size} NODES</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(searchTerm || statusFilter !== "all") && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
                className="h-12 px-6 font-black text-[10px] uppercase tracking-widest hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-all"
              >
                <X className="mr-2 h-4 w-4 stroke-[3]" />
                TERMINATE FILTERS
              </Button>
            )}
          </div>
        </div>

        {/* Data Matrix */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-[2.5rem] blur-2xl opacity-50" />
          <div className="relative">
            {filteredApprovals.length > 0 ? (
              <div className="bg-card/40 backdrop-blur-xl rounded-[2.5rem] border border-border/40 shadow-2xl overflow-hidden p-2">
                <CustomTable
                  columns={createColumns(
                    setSelectedApproval,
                    handleQuickApprove,
                    handleQuickReject,
                    handleDelete,
                    approveApprovalMutation.isPending || rejectApprovalMutation.isPending
                  )}
                  data={filteredApprovals}
                  pageSize={pageSize}
                />
              </div>
            ) : (
              <Card className="border-border/40 bg-card/40 backdrop-blur-xl rounded-[2.5rem] p-20 shadow-2xl border-dashed">
                <CardContent className="flex flex-col items-center justify-center text-center space-y-6">
                  <div className="h-20 w-20 rounded-3xl bg-primary/5 flex items-center justify-center border border-primary/10">
                    <CheckCircle className="h-10 w-10 text-primary stroke-[1.5]" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black uppercase tracking-tight">System Purified</h3>
                    <p className="text-muted-foreground font-medium max-w-sm mx-auto tracking-tight">
                      No active approval requests detected in the neural pipeline. All content is performing within nominal parameters.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Asset Authorization Modal */}
        <ApprovalModal
          approval={selectedApproval}
          onClose={() => setSelectedApproval(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          isProcessing={approveApprovalMutation.isPending || rejectApprovalMutation.isPending}
        />

        {/* Critical Action Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="rounded-[2.5rem] border-border/40 bg-background/95 backdrop-blur-xl p-8 max-w-md font-fira-sans">
            <DialogHeader className="space-y-4">
              <div className="h-14 w-14 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive mx-auto shadow-inner">
                <Trash2 className="h-7 w-7 stroke-[2.5]" />
              </div>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight text-center">Terminate Record?</DialogTitle>
              <DialogDescription className="text-center font-medium leading-relaxed">
                This will permanently eject the asset from the approval pipeline. This operation is IRREVERSIBLE.
                {approvalToDelete && (
                  <div className="mt-6 p-5 bg-card/50 rounded-2xl border border-destructive/20 text-left space-y-2">
                    <p className="text-xs font-black uppercase tracking-widest text-destructive">Asset Identity</p>
                    <p className="font-bold text-foreground truncate">{approvalToDelete.contentTitle}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      BRAND: {approvalToDelete.brandName} • DOMAIN: {approvalToDelete.status}
                    </p>
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="grid grid-cols-2 gap-4 mt-8 sm:justify-center">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                disabled={deleteApprovalMutation.isPending}
                className="h-12 rounded-xl font-bold uppercase tracking-widest text-[11px]"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={deleteApprovalMutation.isPending}
                className="h-12 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-destructive/20"
              >
                {deleteApprovalMutation.isPending ? 'TERMINATING...' : 'CONFIRM TERMINATION'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Search, X, Calendar, User, FileText, Eye, Trash2, Activity } from "lucide-react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// Create columns for the approvals data table
const createColumns = (
  handleReview: (approval: ApprovalResponseDto) => void,
  handleDelete: (approval: ApprovalResponseDto) => void,
  isProcessing: boolean
): ColumnDef<ApprovalResponseDto>[] => [
    {
      accessorKey: "contentTitle",
      header: "Neural Pattern",
      cell: ({ row }) => {
        const approval = row.original;
        const status = approval.status;

        return (
          <div className="flex items-center gap-4 py-1">
            <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 transition-transform group-hover:scale-110">
              <FileText className="size-5" />
            </div>
            <div>
              <div className="font-extrabold text-foreground italic">
                {row.getValue("contentTitle")}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="secondary" className={cn(
                  "text-[9px] font-black uppercase tracking-widest py-0 px-2 rounded-sm",
                  status === ContentStatusEnum.Approved ? "bg-emerald-500/10 text-emerald-500" :
                    status === ContentStatusEnum.PendingApproval ? "bg-amber-500/10 text-amber-500" :
                      status === ContentStatusEnum.Rejected ? "bg-destructive/10 text-destructive" :
                        "bg-muted text-muted-foreground"
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
      accessorKey: "brandName",
      header: "Brand Identity",
      cell: ({ row }) => {
        const brandName = row.getValue("brandName") as string;
        return (
          <div className="space-y-0.5">
            <div className="text-xs font-black italic">{brandName || "INDEPENDENT"}</div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Global Descriptor</div>
          </div>
        );
      },
    },
    {
      accessorKey: "approverEmail",
      header: "Auth Approver",
      cell: ({ row }) => {
        const approverEmail = row.getValue("approverEmail") as string;
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6 border">
              <AvatarFallback className="text-[8px] font-black">
                {approverEmail?.substring(0, 2).toUpperCase() || <User className="size-3" />}
              </AvatarFallback>
            </Avatar>
            <span className="text-[11px] font-bold italic">{approverEmail || "AUTONOMOUS"}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Index Date",
      cell: ({ row }) => {
        const createdAt = row.getValue("createdAt") as string;
        if (!createdAt) return <span className="text-[10px] text-muted-foreground italic font-bold uppercase tracking-widest">Legacy</span>;

        const date = new Date(createdAt);
        return (
          <div className="space-y-0.5">
            <div className="text-xs font-black flex items-center gap-1.5 italic">
              <Calendar className="size-3 text-primary" />
              {date.toLocaleDateString()}
            </div>
            <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest px-4.5">{date.toLocaleTimeString()}</div>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Protocol",
      cell: ({ row }) => {
        const approval = row.original;
        const actions: ActionItem[] = [
          {
            label: "Review Pattern",
            icon: <Eye className="h-4 w-4" />,
            onClick: () => handleReview(approval),
          },
          {
            label: "Purge Record",
            icon: <Trash2 className="h-4 w-4" />,
            onClick: () => handleDelete(approval),
            variant: "destructive" as const,
            disabled: isProcessing,
          }
        ];
        return <ActionsDropdown actions={actions} disabled={isProcessing} />;
      },
    },
  ];

export function ApprovalsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContentStatusEnum | "all">("all");
  const [selectedApproval, setSelectedApproval] = useState<ApprovalResponseDto | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [approvalToDelete, setApprovalToDelete] = useState<ApprovalResponseDto | null>(null);
  const [pageSize, setPageSize] = useState(10);

  const filters: ApprovalFilters = {
    page: 1,
    pageSize: 50,
    searchTerm: searchTerm || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    sortBy: "createdAt",
    sortDescending: true,
  };

  const { data: approvalsData, isLoading } = useApprovals(filters);
  const { data: pendingApprovalsData } = usePendingApprovals(1, 50);
  const approveApprovalMutation = useApproveApproval(selectedApproval?.id || "");
  const rejectApprovalMutation = useRejectApproval(selectedApproval?.id || "");
  const deleteApprovalMutation = useDeleteApprovalWithConfirm();

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
      toast.success('Neural pattern authorized');
    } catch (error) {
      toast.error('Authentication protocol failed');
    }
  };

  const handleReject = async (notes: string) => {
    if (!selectedApproval) return;
    if (!notes.trim()) {
      toast.error('Reason for rejection required');
      return;
    }
    try {
      await rejectApprovalMutation.mutateAsync(notes);
      setSelectedApproval(null);
      toast.success('Pattern rejected');
    } catch (error) {
      toast.error('Rejection sequence failed');
    }
  };

  const handleDelete = (approval: ApprovalResponseDto) => {
    setApprovalToDelete(approval);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!approvalToDelete) return;
    try {
      await deleteApprovalMutation.mutateAsync(approvalToDelete.id);
      toast.success('Record purged');
      setShowDeleteDialog(false);
      setApprovalToDelete(null);
    } catch (error) {
      toast.error('Purge sequence aborted');
    }
  };

  if (isLoading) return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-12 animate-pulse">
      <div className="h-8 w-64 bg-muted rounded-xl" />
      <div className="h-40 bg-muted rounded-[40px]" />
      <div className="h-[600px] bg-muted rounded-[40px]" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-12 font-fira-sans mb-20">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/dashboard" className="text-[10px] font-black uppercase">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage className="text-[10px] font-black uppercase text-primary">Content Forge Pipeline</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-2 w-10 bg-primary rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80">Neural Governance</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-foreground uppercase italic leading-none">
            Asset <span className="text-primary italic">Approvals</span>
          </h1>
          <p className="text-lg text-muted-foreground font-medium max-w-2xl leading-relaxed italic border-l-4 border-primary pl-6">
            Reviewing and authorizing generated outputs for cross-channel deployment. Sovereignty through visual precision.
          </p>
        </div>

        <div className="flex items-center gap-6 px-8 py-6 bg-card/40 backdrop-blur-xl rounded-[32px] border-2 border-dashed shadow-2xl shadow-foreground/5">
          <div className="space-y-1 pr-6 border-r-2 border-dashed">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Registry Size</p>
            <p className="text-3xl font-black italic">{filteredApprovals.length}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-primary uppercase tracking-widest">Active Action</p>
            <p className="text-3xl font-black text-primary italic">{approvals.filter(a => a.status === ContentStatusEnum.PendingApproval).length}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-6 p-6 rounded-[32px] border-2 bg-muted/10 backdrop-blur-md">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search neural patterns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-14 h-14 bg-background/50 border-none shadow-inner rounded-2xl font-black italic text-xs uppercase tracking-widest"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ContentStatusEnum | "all")}>
            <SelectTrigger className="h-14 w-full sm:w-[200px] rounded-2xl border-none shadow-inner bg-background/50 font-black uppercase text-[10px] tracking-widest px-6">
              <SelectValue placeholder="PHASE FILTER" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-2">
              <SelectItem value="all" className="font-bold text-[10px] uppercase">All Signals</SelectItem>
              <SelectItem value={ContentStatusEnum.PendingApproval} className="font-bold text-[10px] uppercase">Pending Review</SelectItem>
              <SelectItem value={ContentStatusEnum.Approved} className="font-bold text-[10px] uppercase">Authorized</SelectItem>
              <SelectItem value={ContentStatusEnum.Rejected} className="font-bold text-[10px] uppercase">Suppressed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
            <SelectTrigger className="h-14 w-full sm:w-[130px] rounded-2xl border-none shadow-inner bg-background/50 font-black uppercase text-[10px] tracking-widest px-6">
              <SelectValue placeholder="DENSITY" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-2">
              {[10, 20, 50].map((s) => (
                <SelectItem key={s} value={String(s)} className="font-bold text-[10px] uppercase">{s} Nodes</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(searchTerm || statusFilter !== "all") && (
            <Button variant="ghost" className="h-14 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-destructive/10 hover:text-destructive" onClick={() => { setSearchTerm(""); setStatusFilter("all"); }}>
              <X className="mr-3 size-4" /> Reset Filters
            </Button>
          )}
        </div>
      </div>

      <Card className="rounded-[40px] border-2 bg-card/40 overflow-hidden shadow-2xl shadow-foreground/5 relative group">
        <div className="absolute top-0 right-0 p-10 opacity-5 -rotate-12 group-hover:rotate-0 transition-transform duration-1000">
          <Activity className="size-40 text-primary" />
        </div>
        <CustomTable
          columns={createColumns(setSelectedApproval, handleDelete, approveApprovalMutation.isPending || rejectApprovalMutation.isPending)}
          data={filteredApprovals}
          pageSize={pageSize}
          className="border-0 shadow-none bg-transparent"
          headerClassName="bg-muted/30 border-b py-6 px-10 font-black uppercase text-[10px] tracking-widest"
          emptyMessage="Governance Complete. No active signals pending review."
        />
      </Card>

      <ApprovalModal
        approval={selectedApproval}
        onClose={() => setSelectedApproval(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        isProcessing={approveApprovalMutation.isPending || rejectApprovalMutation.isPending}
      />

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="rounded-[40px] border-2 bg-background/95 backdrop-blur-2xl p-10 max-w-md font-fira-sans border-destructive/20 shadow-2xl shadow-destructive/10">
          <DialogHeader className="space-y-6 text-center">
            <div className="size-20 rounded-3xl bg-destructive/10 flex items-center justify-center text-destructive mx-auto border border-destructive/20 shadow-inner">
              <Trash2 className="size-10" />
            </div>
            <DialogTitle className="text-3xl font-black uppercase tracking-tight italic">Purge <span className="text-destructive">Record</span>?</DialogTitle>
            <DialogDescription className="font-bold text-muted-foreground/80 leading-relaxed italic">
              Initiating immediate ejection of the asset descriptor from the neural pipeline. This operation is permanent.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="grid grid-cols-2 gap-6 mt-10">
            <Button variant="outline" className="h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] border-2" onClick={() => setShowDeleteDialog(false)}>
              Abort
            </Button>
            <Button variant="destructive" className="h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-destructive/30" onClick={handleConfirmDelete} disabled={deleteApprovalMutation.isPending}>
              Confirm Purge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

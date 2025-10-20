"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { useBrands } from "@/hooks/use-brands";
import { 
  useApprovals, 
  usePendingApprovals, 
  useApproveApproval, 
  useRejectApproval 
} from "@/hooks/use-approvals";
import { 
  ApprovalResponseDto, 
  ContentStatusEnum,
  ApprovalFilters 
} from "@/lib/types/aisam-types";
import { ApprovalCard } from "@/components/approvals/approval-card";
import { ApprovalModal } from "@/components/approvals/approval-modal";
import { ApprovalFilters as ApprovalFiltersComponent } from "@/components/approvals/approval-filters";
import { toast } from "sonner";

export function ApprovalsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContentStatusEnum | "all">("all");
  const [selectedApproval, setSelectedApproval] = useState<ApprovalResponseDto | null>(null);
  const [approvalNotes, setApprovalNotes] = useState("");

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
    // For quick reject, we still need to open the modal to get rejection reason
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-background">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading approvals...</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Content Approvals</h1>
          <p className="text-muted-foreground">
            Review and approve content before publishing
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          {approvals.filter(a => a.status === ContentStatusEnum.PendingApproval).length} Pending
        </Badge>
      </div>

      {/* Search and Filters */}
      <ApprovalFiltersComponent
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        totalCount={filteredApprovals.length}
      />

      {/* Approvals List */}
      {filteredApprovals.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm || statusFilter !== "all" ? 'No approvals found' : 'All caught up!'}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all"
                  ? 'Try adjusting your search terms or filters'
                  : 'There are no pending approvals at the moment'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredApprovals.map((approval) => (
            <ApprovalCard
              key={approval.id}
              approval={approval}
              onReview={setSelectedApproval}
              onApprove={handleQuickApprove}
              onReject={handleQuickReject}
              isProcessing={approveApprovalMutation.isPending || rejectApprovalMutation.isPending}
            />
          ))}
        </div>
      )}

      {/* Approval Modal */}
      <ApprovalModal
        approval={selectedApproval}
        onClose={() => setSelectedApproval(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        isProcessing={approveApprovalMutation.isPending || rejectApprovalMutation.isPending}
      />
    </div>
  );
}

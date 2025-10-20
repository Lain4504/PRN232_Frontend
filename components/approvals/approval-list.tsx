"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { ApprovalResponseDto, ContentStatusEnum } from "@/lib/types/aisam-types";
import { ApprovalCard } from "./approval-card";
import { ApprovalModal } from "./approval-modal";
import { DeleteApprovalDialog } from "./delete-approval-dialog";

interface ApprovalListProps {
  approvals: ApprovalResponseDto[];
  onApprove?: (notes: string) => Promise<void>;
  onReject?: (notes: string) => Promise<void>;
  onDelete?: (approvalId: string) => Promise<void>;
  isProcessing?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
}

export function ApprovalList({
  approvals,
  onApprove,
  onReject,
  onDelete,
  isProcessing = false,
  emptyMessage = "No approvals found",
  emptyDescription = "There are no approvals to display"
}: ApprovalListProps) {
  const [selectedApproval, setSelectedApproval] = useState<ApprovalResponseDto | null>(null);
  const [approvalToDelete, setApprovalToDelete] = useState<ApprovalResponseDto | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleQuickApprove = async (approvalId: string) => {
    if (!onApprove) return;
    
    try {
      const approval = approvals.find(a => a.id === approvalId);
      if (!approval) return;
      
      setSelectedApproval(approval);
      await onApprove("");
      setSelectedApproval(null);
    } catch (error) {
      console.error('Failed to approve content:', error);
    }
  };

  const handleQuickReject = async (approvalId: string) => {
    const approval = approvals.find(a => a.id === approvalId);
    if (!approval) return;
    
    setSelectedApproval(approval);
  };

  const handleModalApprove = async (notes: string) => {
    if (!onApprove) return;
    
    try {
      await onApprove(notes);
      setSelectedApproval(null);
    } catch (error) {
      console.error('Failed to approve content:', error);
    }
  };

  const handleModalReject = async (notes: string) => {
    if (!onReject) return;
    
    try {
      await onReject(notes);
      setSelectedApproval(null);
    } catch (error) {
      console.error('Failed to reject content:', error);
    }
  };

  const handleDeleteClick = (approval: ApprovalResponseDto) => {
    setApprovalToDelete(approval);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async (approvalId: string) => {
    if (!onDelete) return;
    
    try {
      await onDelete(approvalId);
      setIsDeleteDialogOpen(false);
      setApprovalToDelete(null);
    } catch (error) {
      console.error('Failed to delete approval:', error);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setApprovalToDelete(null);
  };

  if (approvals.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{emptyMessage}</h3>
            <p className="text-muted-foreground">{emptyDescription}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {approvals.map((approval) => (
          <ApprovalCard
            key={approval.id}
            approval={approval}
            onReview={setSelectedApproval}
            onApprove={onApprove ? handleQuickApprove : undefined}
            onReject={onReject ? handleQuickReject : undefined}
            onDelete={onDelete ? handleDeleteClick : undefined}
            isProcessing={isProcessing}
          />
        ))}
      </div>

      <ApprovalModal
        approval={selectedApproval}
        onClose={() => setSelectedApproval(null)}
        onApprove={handleModalApprove}
        onReject={handleModalReject}
        isProcessing={isProcessing}
      />

      <DeleteApprovalDialog
        approval={approvalToDelete}
        isOpen={isDeleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        isDeleting={isProcessing}
      />
    </>
  );
}
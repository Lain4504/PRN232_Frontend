"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { ApprovalResponseDto, ContentStatusEnum } from "@/lib/types/omniadly-types";
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
      <Card className="rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/50 transition-all duration-300">
        <CardContent className="p-20">
          <div className="text-center">
            <div className="size-20 rounded-3xl bg-white dark:bg-slate-900 flex items-center justify-center mx-auto mb-8 shadow-sm border border-slate-100 dark:border-slate-800">
              <CheckCircle className="size-10 text-slate-200 dark:text-slate-700" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-widest">{emptyMessage}</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto leading-relaxed uppercase tracking-tighter text-xs">{emptyDescription}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

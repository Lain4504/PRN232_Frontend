"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ApprovalResponseDto } from "@/lib/types/aisam-types";

interface DeleteApprovalDialogProps {
  approval: ApprovalResponseDto | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (approvalId: string) => void;
  isDeleting?: boolean;
}

export function DeleteApprovalDialog({
  approval,
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false
}: DeleteApprovalDialogProps) {
  if (!approval) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Approval</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this approval for &ldquo;{approval.contentTitle}&rdquo;?
            <br />
            <br />
            This action cannot be undone. The approval will be permanently removed from the system.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onConfirm(approval.id)}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete Approval"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
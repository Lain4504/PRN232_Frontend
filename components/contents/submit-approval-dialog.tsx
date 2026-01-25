"use client";

import React, { useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ContentResponseDto, CreateApprovalRequest } from "@/lib/types/omniadly-types";
import { Send } from "lucide-react";

interface SubmitApprovalDialogProps {
  content: ContentResponseDto | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (approvalData: CreateApprovalRequest) => Promise<void>;
  isSubmitting?: boolean;
  approvers?: Array<{ id: string; name?: string; email: string; canApproveContent?: boolean }>;
}

function SubmitApprovalForm({ 
  content, 
  onSubmit, 
  onClose, 
  isSubmitting = false,
  approvers = []
}: Omit<SubmitApprovalDialogProps, 'isOpen'>) {
  const [selectedApproverId, setSelectedApproverId] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async () => {
    if (!content || !selectedApproverId) return;

    const approvalData: CreateApprovalRequest = {
      contentId: content.id,
      approverId: selectedApproverId,
      notes: notes || undefined,
    };

    await onSubmit(approvalData);
    setSelectedApproverId("");
    setNotes("");
  };

  if (!content) return null;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="font-semibold">{content.title}</h3>
        <p className="text-sm text-muted-foreground">{content.brandName}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="approver">Select Approver</Label>
        <Select value={selectedApproverId} onValueChange={setSelectedApproverId}>
          <SelectTrigger>
            <SelectValue placeholder="Choose an approver" />
          </SelectTrigger>
          <SelectContent>
            {approvers.map((approver) => (
              <SelectItem key={approver.id} value={approver.id}>
                <div className="flex items-center gap-2">
                  <span>{approver.email}</span>
                  {approver.canApproveContent && (
                    <Badge variant="secondary" className="ml-auto">Can approve</Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes for the approver..."
          rows={3}
        />
      </div>

      <div className="flex flex-col gap-2 pt-4">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !selectedApproverId}
          className="w-full"
        >
          <Send className="mr-2 h-4 w-4" />
          {isSubmitting ? "Submitting..." : "Submit for Approval"}
        </Button>
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
          className="w-full"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

export function SubmitApprovalDialog(props: SubmitApprovalDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={props.isOpen} onOpenChange={props.onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Submit for Approval</DialogTitle>
            <DialogDescription>
              Choose an approver and submit this content for review.
            </DialogDescription>
          </DialogHeader>
          <SubmitApprovalForm {...props} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={props.isOpen} onOpenChange={props.onClose}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Submit for Approval</DrawerTitle>
          <DrawerDescription>
            Choose an approver and submit this content for review.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4">
          <SubmitApprovalForm {...props} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

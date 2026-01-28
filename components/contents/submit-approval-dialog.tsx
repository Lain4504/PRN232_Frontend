"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ContentResponseDto, CreateApprovalRequest } from "@/lib/types/omniadly-types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface SubmitApprovalDialogProps {
  content: ContentResponseDto | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (approvalData: CreateApprovalRequest) => Promise<void>;
  isSubmitting?: boolean;
  approvers?: Array<{ id: string; name?: string; email: string; canApproveContent?: boolean }>;
}

export function SubmitApprovalDialog({
  content,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  approvers = []
}: SubmitApprovalDialogProps) {
  const [selectedApproverId, setSelectedApproverId] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!content || !selectedApproverId) return;

    const approvalData: CreateApprovalRequest = {
      contentId: content.id,
      approverId: selectedApproverId,
      notes: notes || undefined,
    };

    try {
      await onSubmit(approvalData);
      setSelectedApproverId("");
      setNotes("");
      onClose();
    } catch (error) {
      // Error handling is handled by parent/toast
    }
  };

  if (!content) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Gửi phê duyệt nội dung</DialogTitle>
          <DialogDescription>
            Tên bài viết: <span className="font-medium text-slate-900">{content.title}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="approver">Người phê duyệt</Label>
            <Select value={selectedApproverId} onValueChange={setSelectedApproverId}>
              <SelectTrigger id="approver">
                <SelectValue placeholder="Chọn người phê duyệt" />
              </SelectTrigger>
              <SelectContent>
                {approvers.map((approver) => (
                  <SelectItem key={approver.id} value={approver.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="size-6">
                        <AvatarFallback className="text-[10px]">
                          {approver.name?.[0].toUpperCase() || approver.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{approver.name || approver.email}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú (không bắt buộc)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Nhập ghi chú cho người phê duyệt..."
              className="min-h-[100px]"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !selectedApproverId}
            >
              {isSubmitting ? "Đang gửi..." : "Gửi phê duyệt"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

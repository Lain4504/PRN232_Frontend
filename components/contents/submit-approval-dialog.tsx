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
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="p-8 pb-4 bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800">
          <DialogTitle className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Gửi phê duyệt nội dung</DialogTitle>
          <DialogDescription className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-2">
            Tên bài viết: <span className="font-black text-slate-900 dark:text-white ml-2">{content.title}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 p-8">
          <div className="space-y-2">
            <Label htmlFor="approver" className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Người phê duyệt mục tiêu</Label>
            <Select value={selectedApproverId} onValueChange={setSelectedApproverId}>
              <SelectTrigger id="approver" className="h-12 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 rounded-xl font-bold text-slate-900 dark:text-white shadow-sm">
                <SelectValue placeholder="Chọn người phê duyệt" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100 dark:border-slate-800 p-1 shadow-2xl bg-white dark:bg-slate-900">
                {approvers.map((approver) => (
                  <SelectItem key={approver.id} value={approver.id} className="rounded-xl p-3 focus:bg-slate-50 dark:focus:bg-slate-800">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm">
                        <AvatarFallback className="text-[10px] font-black bg-slate-900 dark:bg-primary text-white">
                          {approver.name?.[0].toUpperCase() || approver.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-900 dark:text-white leading-none mb-1">{approver.name || approver.email.split('@')[0]}</span>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{approver.email}</span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Ghi chú tác chiến (không bắt buộc)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Nhập nội dung cần lưu ý cho người phê duyệt..."
              className="min-h-[120px] bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 rounded-xl font-medium text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 p-4 resize-none"
            />
          </div>

          <DialogFooter className="pt-6 grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-12 rounded-xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-black uppercase tracking-widest text-[10px] text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              Hủy bỏ lệnh
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !selectedApproverId}
              className="h-12 rounded-xl bg-slate-900 dark:bg-primary hover:bg-slate-800 dark:hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-slate-200 dark:shadow-primary/20 transition-all active:scale-95"
            >
              {isSubmitting ? "Đang xử lý..." : "Kích hoạt phê duyệt"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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
import { Send, ShieldCheck, MessageSquare, ChevronRight, X, UserCheck, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
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
  const isMobile = useIsMobile();

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
      // Error handling is usually done by parent or toast
    }
  };

  const renderFormContent = (onCancel: () => void) => (
    <form onSubmit={handleSubmit} className="space-y-10">
      {/* Content Info Preview */}
      {content && (
        <div className="p-6 rounded-3xl bg-slate-50 border-2 border-slate-100 flex items-center gap-6 group hover:border-slate-200 transition-all">
          <div className="size-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-200 group-hover:scale-110 transition-transform">
            <LayoutDashboard className="size-5" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nội dung đệ trình</span>
            <div className="font-black text-slate-900 text-lg leading-none truncate max-w-[200px] sm:max-w-[400px]">
              {content.title}
            </div>
          </div>
        </div>
      )}

      {/* Approver Selection */}
      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Chỉ định Người phê duyệt</label>
        <Select value={selectedApproverId} onValueChange={setSelectedApproverId}>
          <SelectTrigger className="h-14 rounded-2xl border-2 border-slate-100 bg-white px-6 focus:ring-0 shadow-sm font-black text-slate-900 uppercase tracking-tight">
            <SelectValue placeholder="Chọn vai trò phê duyệt cao cấp" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-1 max-h-[300px]">
            {approvers.map((approver) => (
              <SelectItem key={approver.id} value={approver.id} className="rounded-xl h-14 focus:bg-slate-50 px-4">
                <div className="flex items-center gap-4">
                  <Avatar className="size-8 rounded-lg border border-slate-200">
                    <AvatarFallback className="bg-slate-900 text-white font-black text-[10px]">
                      {approver.name?.[0].toUpperCase() || approver.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-black text-slate-900 text-xs">{approver.name || approver.email}</span>
                    {approver.canApproveContent && (
                      <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Authorized Core Approver</span>
                    )}
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Notes Area */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Ghi chú vận hành (Không bắt buộc)</label>
          <MessageSquare className="size-4 text-slate-200" />
        </div>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Cung cấp ngữ cảnh chiến lược cho người phê duyệt..."
          className="bg-slate-50 border-2 border-slate-100 hover:border-slate-200 transition-all rounded-2xl min-h-[120px] font-medium text-sm p-6 leading-relaxed tracking-tight focus-visible:ring-slate-100"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="h-14 rounded-2xl border-slate-100 bg-slate-50 text-slate-400 hover:bg-slate-100 font-black uppercase tracking-widest text-[10px] order-2 sm:order-1 flex-1 sm:flex-none sm:px-10"
        >
          Hủy bỏ
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !selectedApproverId}
          className="h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-slate-200 transition-all hover:-translate-y-1 order-1 sm:order-2 flex-1 sm:flex-none sm:px-10"
        >
          {isSubmitting ? (
            <>
              <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Đang xác thực...
            </>
          ) : (
            <>
              Gửi Phê duyệt <ChevronRight className="ml-2 size-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  )

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="max-h-[90vh] flex flex-col rounded-t-[3rem] border-none shadow-2xl bg-white">
          <DrawerHeader className="flex-shrink-0 text-left p-10 pb-4">
            <div className="size-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-6 border border-slate-200">
              <ShieldCheck className="size-6" />
            </div>
            <DrawerTitle className="text-2xl font-black uppercase tracking-tight text-slate-900 leading-none">Phê duyệt Nội dung</DrawerTitle>
            <DrawerDescription className="text-sm font-medium text-slate-400 mt-2 italic">Chuyển trạng thái nội dung sang quy trình đánh giá chiến lược.</DrawerDescription>
          </DrawerHeader>
          <div className="px-10 overflow-y-auto flex-1 pb-10">
            {renderFormContent(onClose)}
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col rounded-3xl border-none p-0 shadow-2xl bg-white">
        <DialogHeader className="flex-shrink-0 p-12 pb-8">
          <div className="size-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-8 border border-slate-200 shadow-sm">
            <ShieldCheck className="size-8" />
          </div>
          <DialogTitle className="text-4xl font-black uppercase tracking-tight text-slate-900 leading-none">Phê duyệt Nội dung</DialogTitle>
          <DialogDescription className="text-base font-medium text-slate-500 mt-2 italic">Chuyển trạng thái nội dung sang quy trình đánh giá và xác thực chiến lược.</DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 px-12 pb-12">
          {renderFormContent(onClose)}
        </div>
      </DialogContent>
    </Dialog>
  );
}

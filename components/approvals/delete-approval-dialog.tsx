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
import { AlertCircle } from "lucide-react";
import { ApprovalResponseDto } from "@/lib/types/omniadly-types";

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
      <AlertDialogContent className="rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-0 max-w-md shadow-2xl bg-white dark:bg-slate-900 overflow-hidden">
        <AlertDialogHeader className="p-10 pb-4 space-y-6">
          <div className="size-20 rounded-[2rem] bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-rose-100 dark:border-rose-500/20 shadow-sm">
            <AlertCircle className="size-10" />
          </div>
          <AlertDialogTitle className="text-3xl font-black tracking-tight text-center uppercase text-slate-900 dark:text-white">Xóa yêu cầu?</AlertDialogTitle>
          <AlertDialogDescription className="text-[11px] font-bold text-slate-400 dark:text-slate-500 leading-relaxed text-center uppercase tracking-widest mt-2 italic px-4">
            Bạn có chắc chắn muốn xóa yêu cầu phê duyệt cho nội dung &ldquo;{approval.contentTitle}&rdquo;? Hành động này sẽ loại bỏ hoàn toàn hồ sơ khỏi hệ thống.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="p-10 pt-6 grid grid-cols-2 gap-4">
          <AlertDialogCancel disabled={isDeleting} className="rounded-xl h-12 font-black uppercase tracking-widest text-[10px] bg-slate-50 dark:bg-slate-800 border-none text-slate-400 dark:text-slate-500 m-0">
            Hủy lệnh
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onConfirm(approval.id)}
            disabled={isDeleting}
            className="rounded-xl h-12 font-black uppercase tracking-widest text-[10px] bg-rose-500 hover:bg-rose-600 text-white border-none shadow-lg shadow-rose-100 dark:shadow-rose-900/20 transition-all active:scale-95 m-0"
          >
            {isDeleting ? "Đang xử lý..." : "Xác nhận xóa"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

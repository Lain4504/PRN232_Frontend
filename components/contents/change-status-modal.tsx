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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ContentStatusEnum, ContentResponseDto, UpdateContentRequest } from "@/lib/types/omniadly-types";
import { toast } from "sonner";
import { api, endpoints, ApiResponse } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";

interface ChangeStatusModalProps {
  content: ContentResponseDto | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ChangeStatusModal({
  content,
  isOpen,
  onClose,
  onSuccess,
}: ChangeStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<ContentStatusEnum>(
    (content?.status as unknown as ContentStatusEnum) || ContentStatusEnum.Draft
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  // Update selected status when content changes
  React.useEffect(() => {
    if (content) {
      setSelectedStatus(content.status as unknown as ContentStatusEnum);
    }
  }, [content]);

  const handleChangeStatus = async () => {
    if (!content) {
      toast.error("Không tìm thấy nội dung");
      return;
    }

    if (selectedStatus === (content.status as unknown as ContentStatusEnum)) {
      toast.info("Trạng thái hiện tại đã là giá trị này");
      onClose();
      return;
    }

    setIsProcessing(true);
    try {
      const resp = await api.put<ApiResponse<ContentResponseDto>>(
        endpoints.contentById(content.id),
        {
          status: selectedStatus,
        } as UpdateContentRequest
      );

      if (resp.data?.success) {
        queryClient.invalidateQueries({ queryKey: ["contents"] });
        queryClient.invalidateQueries({
          queryKey: ["contents", "detail", content.id],
        });
        if (resp.data.data.brandId) {
          queryClient.invalidateQueries({
            queryKey: ["contents", "brand", resp.data.data.brandId],
          });
        }
        queryClient.invalidateQueries({ queryKey: ["posts"] });

        toast.success(`Cập nhật trạng thái thành công`);
        onSuccess?.();
        onClose();
      }
    } catch (error) {
      console.error("Failed to change content status:", error);
      let errorMessage = "Lỗi khi cập nhật trạng thái";
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!content) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-[2rem] p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="p-8 pb-4 bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800 text-left">
          <DialogTitle className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Cập nhật trạng thái</DialogTitle>
          <DialogDescription className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-2">
            Bài viết: <span className="font-black text-slate-900 dark:text-white ml-2">{content.title}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 p-8">
          <div className="grid gap-2">
            <Label htmlFor="status" className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Trạng thái mục tiêu</Label>
            <Select
              value={selectedStatus}
              onValueChange={(value) => setSelectedStatus(value as ContentStatusEnum)}
              disabled={isProcessing}
            >
              <SelectTrigger id="status" className="h-12 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 rounded-xl font-bold text-slate-900 dark:text-white shadow-sm px-6">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100 dark:border-slate-800 p-1 shadow-2xl bg-white dark:bg-slate-900">
                <SelectItem value={ContentStatusEnum.Draft} className="rounded-xl font-bold uppercase text-[10px]">Bản nháp</SelectItem>
                <SelectItem value={ContentStatusEnum.PendingApproval} className="rounded-xl font-bold uppercase text-[10px]">Chờ phê duyệt</SelectItem>
                <SelectItem value={ContentStatusEnum.Approved} className="rounded-xl font-bold uppercase text-[10px]">Đã phê duyệt</SelectItem>
                <SelectItem value={ContentStatusEnum.Rejected} className="rounded-xl font-bold uppercase text-[10px]">Từ chối</SelectItem>
                <SelectItem value={ContentStatusEnum.Published} className="rounded-xl font-bold uppercase text-[10px]">Đã xuất bản</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-2 italic leading-relaxed">
              Lưu ý: Chuyển sang &quot;Đã xuất bản&quot; sẽ tự động kích hoạt tiến trình tạo bài viết tương ứng trên các nền tảng đã liên kết.
            </p>
          </div>
        </div>

        <DialogFooter className="p-8 pt-0 grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
            className="h-12 rounded-xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-black uppercase tracking-widest text-[10px] text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            Hủy tác vụ
          </Button>
          <Button
            onClick={handleChangeStatus}
            disabled={isProcessing || selectedStatus === (content.status as unknown as ContentStatusEnum)}
            className="h-12 rounded-xl bg-slate-900 dark:bg-primary hover:bg-slate-800 dark:hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-slate-200 dark:shadow-primary/20 transition-all"
          >
            {isProcessing ? "Đang xử lý..." : "Cập nhật lệnh"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cập nhật trạng thái</DialogTitle>
          <DialogDescription>
            Thay đổi trạng thái cho bài viết: <span className="font-semibold text-slate-900">{content.title}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="status">Trạng thái mới</Label>
            <Select
              value={selectedStatus}
              onValueChange={(value) => setSelectedStatus(value as ContentStatusEnum)}
              disabled={isProcessing}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ContentStatusEnum.Draft}>Bản nháp</SelectItem>
                <SelectItem value={ContentStatusEnum.PendingApproval}>Chờ phê duyệt</SelectItem>
                <SelectItem value={ContentStatusEnum.Approved}>Đã phê duyệt</SelectItem>
                <SelectItem value={ContentStatusEnum.Rejected}>Từ chối</SelectItem>
                <SelectItem value={ContentStatusEnum.Published}>Đã xuất bản</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[12px] text-slate-500 mt-1">
              Lưu ý: Chuyển sang &quot;Đã xuất bản&quot; sẽ tự động tạo một bài viết tương ứng.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
          >
            Hủy
          </Button>
          <Button
            onClick={handleChangeStatus}
            disabled={isProcessing || selectedStatus === (content.status as unknown as ContentStatusEnum)}
          >
            {isProcessing ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

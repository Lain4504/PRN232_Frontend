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
import { ContentStatusEnum, ContentResponseDto } from "@/lib/types/aisam-types";
import { toast } from "sonner";
import { api, endpoints, ApiResponse } from "@/lib/api";
import { UpdateContentRequest } from "@/lib/types/aisam-types";
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
    content?.status || ContentStatusEnum.Draft
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  // Update selected status when content changes
  React.useEffect(() => {
    if (content) {
      setSelectedStatus(content.status);
    }
  }, [content]);

  const handleChangeStatus = async () => {
    if (!content) {
      toast.error("Content not found");
      return;
    }

    if (selectedStatus === content.status) {
      toast.info("Status is already set to this value");
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

      if (resp.data?.data) {
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["contents"] });
        queryClient.invalidateQueries({
          queryKey: ["contents", "detail", content.id],
        });
        if (resp.data.data.brandId) {
          queryClient.invalidateQueries({
            queryKey: ["contents", "brand", resp.data.data.brandId],
          });
        }
        toast.success(`Content status changed to ${selectedStatus}`);
        onSuccess?.();
        onClose();
      }
    } catch (error: unknown) {
      console.error("Failed to change content status:", error);
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (error as { message?: string })?.message ||
        "Failed to change content status";
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusLabel = (status: ContentStatusEnum) => {
    switch (status) {
      case ContentStatusEnum.Draft:
        return "Draft";
      case ContentStatusEnum.PendingApproval:
        return "Pending Approval";
      case ContentStatusEnum.Approved:
        return "Approved";
      case ContentStatusEnum.Rejected:
        return "Rejected";
      case ContentStatusEnum.Published:
        return "Published";
      default:
        return status;
    }
  };

  if (!content) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Content Status</DialogTitle>
          <DialogDescription>
            Update the status for this content. Current status:{" "}
            <span className="font-semibold">
              {getStatusLabel(content.status)}
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="status">New Status</Label>
            <Select
              value={selectedStatus}
              onValueChange={(value) =>
                setSelectedStatus(value as ContentStatusEnum)
              }
              disabled={isProcessing}
            >
              <SelectTrigger id="status" className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ContentStatusEnum.Draft}>Draft</SelectItem>
                <SelectItem value={ContentStatusEnum.Approved}>
                  Approved
                </SelectItem>
                <SelectItem value={ContentStatusEnum.Rejected}>
                  Rejected
                </SelectItem>
                <SelectItem value={ContentStatusEnum.Published}>
                  Published
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Note: Free profiles can change content status directly without
              approval workflow.
            </p>
          </div>
          {content.title && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm font-medium">{content.title}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Content ID: {content.id.substring(0, 8)}...
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleChangeStatus}
            disabled={isProcessing || selectedStatus === content.status}
          >
            {isProcessing ? "Changing..." : "Change Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


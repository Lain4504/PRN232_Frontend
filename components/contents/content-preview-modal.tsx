"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  ContentResponseDto,
  ContentStatusEnum
} from "@/lib/types/omniadly-types";
import { ContentPreviewView } from "./content-preview-view";

interface ContentPreviewModalProps {
  content: ContentResponseDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (contentId: string) => Promise<void>;
  onPublish?: (contentId: string, integrationId: string) => Promise<void>;
  isProcessing?: boolean;
  brands?: Array<{ id: string; name: string }>;
}

export function ContentPreviewModal({
  content,
  open,
  onOpenChange,
  onSubmit,
  onPublish,
  isProcessing = false,
  brands = [],
}: ContentPreviewModalProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const getStatusLabel = (status: ContentStatusEnum) => {
    switch (status) {
      case ContentStatusEnum.Draft: return 'Bản nháp';
      case ContentStatusEnum.PendingApproval: return 'Chờ phê duyệt';
      case ContentStatusEnum.Approved: return 'Đã phê duyệt';
      case ContentStatusEnum.Rejected: return 'Từ chối';
      case ContentStatusEnum.Published: return 'Đã xuất bản';
      default: return status;
    }
  };

  const getStatusBadge = (status: ContentStatusEnum) => {
    return <Badge variant="outline">{getStatusLabel(status)}</Badge>;
  };

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl w-[90vw] max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b flex-row items-center justify-between space-y-0">
            <div>
              <DialogTitle className="text-xl font-bold">Xem trước nội dung</DialogTitle>
              <DialogDescription>
                Mô phỏng hiển thị và chi tiết nội dung bài viết.
              </DialogDescription>
            </div>
            <div className="flex items-center gap-4">
              {getStatusBadge(content.status)}
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
            <ContentPreviewView
              content={content}
              onSubmit={onSubmit}
              onPublish={onPublish}
              isProcessing={isProcessing}
              brands={brands}
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh] flex flex-col">
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-lg font-bold">Xem trước bài viết</DrawerTitle>
            {getStatusBadge(content.status)}
          </div>
          <DrawerDescription>
            Xem thông tin chi tiết bài viết.
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto p-4">
          <ContentPreviewView
            content={content}
            onSubmit={onSubmit}
            onPublish={onPublish}
            isProcessing={isProcessing}
            brands={brands}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

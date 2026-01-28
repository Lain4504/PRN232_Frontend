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
import { Laptop } from "lucide-react";

interface ContentPreviewModalProps {
  content: ContentResponseDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (contentId: string) => Promise<void>;
  onPublish?: (contentId: string, integrationId: string) => Promise<void>;
  isProcessing?: boolean;
  brands?: Array<{ id: string; name: string }>; // Optional: pass brands to map brandId to name
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

  const getStatusBadge = (status: ContentStatusEnum) => {
    switch (status) {
      case ContentStatusEnum.Draft:
        return <Badge variant="secondary">Draft</Badge>;
      case ContentStatusEnum.PendingApproval:
        return <Badge variant="outline" className="border-chart-4 text-chart-4">Pending Approval</Badge>;
      case ContentStatusEnum.Approved:
        return <Badge variant="default" className="bg-chart-2">Approved</Badge>;
      case ContentStatusEnum.Rejected:
        return <Badge variant="destructive">Rejected</Badge>;
      case ContentStatusEnum.Published:
        return <Badge variant="default" className="bg-green-600">Published</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl w-[90vw] max-h-[90vh] flex flex-col rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="flex-shrink-0 p-12 pb-8">
            <div className="size-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-8 border border-slate-200 shadow-sm">
              <Laptop className="size-8" />
            </div>
            <div className="flex items-center gap-4">
              <DialogTitle className="text-4xl font-black uppercase tracking-tight text-slate-900 leading-none">Xem trước Nội dung</DialogTitle>
              <div className="mt-1">{getStatusBadge(content.status)}</div>
            </div>
            <DialogDescription className="text-base font-medium text-slate-500 mt-2 italic">
              Kiểm tra chi tiết và hình thức hiển thị thực tế của nội dung trên các nền tảng.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-12 pb-12 scrollbar-hide">
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
        <DrawerHeader className="flex-shrink-0">
          <div className="flex items-center gap-3">
            <DrawerTitle className="text-lg font-bold">Content Preview</DrawerTitle>
            {getStatusBadge(content.status)}
          </div>
          <DrawerDescription>
            View content details and information
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto px-4">
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


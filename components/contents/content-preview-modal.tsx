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
        <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-lg font-bold">Content Preview</DialogTitle>
              {getStatusBadge(content.status)}
            </div>
            <DialogDescription>
              View content details and information
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2">
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


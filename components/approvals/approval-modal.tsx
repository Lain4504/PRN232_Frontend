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
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, X, Loader2, FileText, Send, AlertCircle, ShieldCheck } from "lucide-react";
import { ApprovalResponseDto, ContentStatusEnum } from "@/lib/types/omniadly-types";
import { useSocialIntegrations } from "@/hooks/use-social-integrations";
import { usePublishContent, useContent } from "@/hooks/use-contents";
import { ContentPreviewView } from "@/components/contents/content-preview-view";
import { toast } from "sonner";

interface ApprovalModalProps {
  approval: ApprovalResponseDto | null;
  onClose: () => void;
  onApprove: (notes: string) => Promise<void>;
  onReject: (notes: string) => Promise<void>;
  onPublishComplete?: () => void;
  isProcessing?: boolean;
}

export function ApprovalModal({
  approval,
  onClose,
  onApprove,
  onReject,
  onPublishComplete,
  isProcessing = false
}: ApprovalModalProps) {
  const [notes, setNotes] = useState("");
  const [selectedIntegrationId, setSelectedIntegrationId] = useState<string>("");
  const [isPublishing, setIsPublishing] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const approvalContent = approval?.content;
  const { data: fetchedContent, isLoading: contentLoading } = useContent(
    approvalContent ? undefined : approval?.contentId
  );
  const content = approvalContent || fetchedContent;

  const { data: integrations = [], isLoading: integrationsLoading } = useSocialIntegrations(
    approval?.brandId || approval?.content?.brandId || content?.brandId || ""
  );

  const publishContentMutation = usePublishContent(approval?.contentId || "");

  if (!approval) return null;

  const handleApprove = async () => {
    try {
      await onApprove(notes);
      setNotes("");
      onClose();
    } catch (error) {
      console.error('Failed to approve:', error);
    }
  };

  const handleReject = async () => {
    if (!notes.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }
    try {
      await onReject(notes);
      setNotes("");
      onClose();
    } catch (error) {
      console.error('Failed to reject:', error);
    }
  };

  const handlePublish = async () => {
    if (!approval || !selectedIntegrationId || !content) return;
    if (approval.status === 'Published' || content.status === 'Published') {
      toast.info('Nội dung này đã được đăng');
      return;
    }
    setIsPublishing(true);
    try {
      await publishContentMutation.mutateAsync(selectedIntegrationId);
      toast.success("Đăng bài thành công!");
      onPublishComplete?.();
      onClose();
    } catch (error) {
      console.error('Failed to publish:', error);
      toast.error("Lỗi khi đăng bài.");
    } finally {
      setIsPublishing(false);
    }
  };

  const modalContent = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg border bg-slate-50/50 flex items-center gap-3">
          <ShieldCheck className="size-5 text-slate-400" />
          <div className="min-w-0">
            <p className="text-[10px] text-slate-500 font-bold uppercase">Thương hiệu</p>
            <p className="text-sm font-semibold truncate">{approval.brandName}</p>
          </div>
        </div>
        <div className="p-4 rounded-lg border bg-slate-50/50 flex items-center gap-3">
          <Loader2 className="size-5 text-slate-400" />
          <div className="min-w-0">
            <p className="text-[10px] text-slate-500 font-bold uppercase">Người phê duyệt</p>
            <p className="text-sm font-semibold truncate">{approval.approverEmail}</p>
          </div>
        </div>
      </div>

      {approval.notes && (
        <div className="p-4 rounded-lg border bg-slate-50/50 space-y-2">
          <Label className="text-xs text-slate-500">Ghi chú từ người tạo</Label>
          <p className="text-sm italic text-slate-700 leading-relaxed">&quot;{approval.notes}&quot;</p>
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-xs text-slate-500 flex items-center gap-2">
          <FileText className="size-3" /> Nội dung cần xét duyệt
        </Label>
        <div className="rounded-lg border bg-white overflow-hidden shadow-sm">
          {contentLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="size-8 animate-spin text-slate-400" />
              <span className="text-xs text-slate-400">Đang tải nội dung...</span>
            </div>
          ) : content ? (
            <div className="p-1">
              <ContentPreviewView
                content={content}
                showActions={false}
              />
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="size-10 text-rose-500 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-bold">Không thể tải nội dung.</p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4 pt-6 border-t mt-6">
        <div className="space-y-2">
          <Label className="text-xs text-slate-500">Nhận xét của bạn</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[100px]"
            placeholder="Nhập nhận xét hoặc lý do từ chối..."
          />
        </div>

        {approval.status === ContentStatusEnum.PendingApproval && (
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={handleReject}
              disabled={isProcessing || contentLoading}
              className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 border-rose-200"
            >
              <X className="mr-2 size-4" />
              Từ chối
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isProcessing || contentLoading}
            >
              <Check className="mr-2 size-4" />
              Phê duyệt
            </Button>
          </div>
        )}

        {approval.status === ContentStatusEnum.Approved && content && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="space-y-2">
              <Label className="text-xs text-slate-500">Kênh đăng bài</Label>
              {integrationsLoading ? (
                <div className="h-10 bg-slate-50 animate-pulse rounded-md" />
              ) : integrations.length === 0 ? (
                <div className="p-3 bg-amber-50 rounded-md border border-amber-100 flex items-center gap-3">
                  <AlertCircle className="size-4 text-amber-600" />
                  <p className="text-[11px] font-bold text-amber-700 uppercase">Chưa có kênh mạng xã hội nào được liên kết.</p>
                </div>
              ) : (
                <Select
                  value={selectedIntegrationId}
                  onValueChange={setSelectedIntegrationId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn kênh để đăng bài..." />
                  </SelectTrigger>
                  <SelectContent>
                    {integrations.map((integration) => (
                      <SelectItem key={integration.id} value={integration.id}>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{integration.name}</span>
                          <Badge variant="outline" className="text-[10px] py-0">{integration.platform}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isPublishing}
              >
                Đóng
              </Button>
              <Button
                onClick={handlePublish}
                disabled={!selectedIntegrationId || isPublishing || integrations.length === 0}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Đang đăng...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 size-4" />
                    Đăng bài ngay
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={!!approval} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b">
            <DialogTitle>
              {approval.status === ContentStatusEnum.PendingApproval ? "Phê duyệt nội dung" : "Sẵn sàng đăng bài"}
            </DialogTitle>
            <DialogDescription>
              Kiểm tra kỹ nội dung trước khi quyết định phê duyệt hoặc đăng tải.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
            {modalContent}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={!!approval} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[95vh] flex flex-col">
        <DrawerHeader className="p-4 border-b text-left">
          <DrawerTitle>
            {approval.status === ContentStatusEnum.PendingApproval ? "Phê duyệt" : "Đăng bài"}
          </DrawerTitle>
          <DrawerDescription>
            Kiểm tra và thực hiện thao tác.
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
          {modalContent}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

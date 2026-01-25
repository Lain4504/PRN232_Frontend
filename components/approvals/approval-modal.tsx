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
import { Check, X, Loader2, FileText, Send, AlertCircle, ShieldCheck, ChevronRight, MessageSquare } from "lucide-react";
import { ApprovalResponseDto, ContentStatusEnum } from "@/lib/types/omniadly-types";
import { useSocialIntegrations } from "@/hooks/use-social-integrations";
import { usePublishContent, useContent } from "@/hooks/use-contents";
import { ContentPreviewView } from "@/components/contents/content-preview-view";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
      toast.error('Vui lòng cung cấp lý do từ chối');
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
      toast.info('Nội dung này đã được phân phối');
      return;
    }
    setIsPublishing(true);
    try {
      await publishContentMutation.mutateAsync(selectedIntegrationId);
      toast.success("Đã phân phối nội dung thành công!");
      onPublishComplete?.();
      onClose();
    } catch (error) {
      toast.error("Lỗi khi phân phối nội dung.");
    } finally {
      setIsPublishing(false);
    }
  };

  const modalContent = (
    <div className="space-y-10">
      {/* Overview Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-[1.5rem] bg-slate-50 border border-slate-100 flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-white flex items-center justify-center text-slate-900 shadow-sm border border-slate-200">
            <ShieldCheck className="size-6" />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thương hiệu</p>
            <p className="text-sm font-black text-slate-900 uppercase tracking-tight truncate max-w-[150px]">{approval.brandName}</p>
          </div>
        </div>
        <div className="p-6 rounded-[1.5rem] bg-slate-50 border border-slate-100 flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-white flex items-center justify-center text-slate-900 shadow-sm border border-slate-200">
            <Loader2 className="size-6" />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Người phê duyệt</p>
            <p className="text-sm font-black text-slate-900 uppercase tracking-tight truncate max-w-[150px]">{approval.approverEmail}</p>
          </div>
        </div>
      </div>

      {approval.notes && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <MessageSquare className="size-4 text-slate-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Ghi chú từ Content Creator</span>
          </div>
          <div className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 italic font-medium text-slate-600 text-sm leading-relaxed border-l-4 border-l-slate-900">
            {approval.notes}
          </div>
        </div>
      )}

      {/* Content Preview */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <FileText className="size-4 text-slate-400" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Xem trước tài sản truyền thông</span>
        </div>
        <div className="p-2 rounded-[2rem] border border-slate-100 bg-white overflow-hidden shadow-xl shadow-slate-100">
          {contentLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="size-10 animate-spin text-slate-900" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Đang giải mã dữ liệu nội dung...</span>
            </div>
          ) : content ? (
            <ContentPreviewView
              content={content}
              showActions={false}
            />
          ) : (
            <div className="text-center py-20 px-10">
              <AlertCircle className="size-12 text-rose-500 mx-auto mb-4" />
              <p className="text-sm font-bold text-slate-500 uppercase tracking-tighter">Không thể tải cấu trúc nội dung.</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Decision Section */}
      <div className="space-y-8 pt-10 border-t border-slate-100">
        <div className="space-y-4">
          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Nhận xét & Quyết định</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[120px] rounded-[1.5rem] border-slate-100 bg-white p-6 focus-visible:ring-slate-100 font-medium text-slate-900 shadow-sm"
            placeholder={
              approval.status === ContentStatusEnum.PendingApproval
                ? "Thêm phản hồi kỹ thuật cho người tạo nội dung (tùy chọn)..."
                : "Thêm ghi chú bổ sung cho phiên bản này..."
            }
          />
        </div>

        {approval.status === ContentStatusEnum.PendingApproval && (
          <div className="grid grid-cols-2 gap-6">
            <Button
              variant="outline"
              onClick={handleReject}
              disabled={isProcessing || contentLoading}
              className="h-14 rounded-2xl border-rose-100 bg-rose-50 text-rose-500 hover:bg-rose-100 font-black uppercase tracking-widest text-[10px] border-none shadow-sm"
            >
              <X className="mr-3 size-4" />
              Từ chối nội dung
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isProcessing || contentLoading}
              className="h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-slate-200 transition-all hover:-translate-y-1"
            >
              <Check className="mr-3 size-4" />
              Phê duyệt & Tiếp tục
            </Button>
          </div>
        )}

        {approval.status === ContentStatusEnum.Approved && content && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Chọn nút phân phối (Social Integration)</Label>
              {integrationsLoading ? (
                <div className="h-14 bg-slate-50 animate-pulse rounded-2xl" />
              ) : integrations.length === 0 ? (
                <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex items-center gap-4">
                  <AlertCircle className="size-5 text-amber-600" />
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-tighter">Không tìm thấy kênh social nào được liên kết với Brand này.</p>
                </div>
              ) : (
                <Select
                  value={selectedIntegrationId}
                  onValueChange={setSelectedIntegrationId}
                >
                  <SelectTrigger className="h-14 rounded-2xl border-slate-100 bg-white px-6 focus:ring-0 shadow-sm font-black text-slate-900 uppercase tracking-tight">
                    <SelectValue placeholder="Chọn kênh phân phối..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-1">
                    {integrations.map((integration) => (
                      <SelectItem key={integration.id} value={integration.id} className="rounded-xl h-12 focus:bg-slate-50">
                        <div className="flex items-center justify-between w-full">
                          <span className="font-black text-slate-900 uppercase tracking-tight">{integration.name}</span>
                          <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest text-slate-400 border-slate-100 ml-4">{integration.platform}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isPublishing}
                className="h-14 rounded-2xl border-slate-100 bg-slate-50 text-slate-400 hover:bg-slate-100 font-black uppercase tracking-widest text-[10px]"
              >
                Để sau
              </Button>
              <Button
                onClick={handlePublish}
                disabled={!selectedIntegrationId || isPublishing || integrations.length === 0}
                className="h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-emerald-100 transition-all hover:-translate-y-1"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="mr-3 size-4 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <Send className="mr-3 size-4" />
                    Phát hành ngay
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
        <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] flex flex-col p-0 border-none rounded-[3rem] shadow-2xl overflow-hidden bg-white font-sans">
          <DialogHeader className="flex-shrink-0 p-10 pb-0">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Badge className="bg-slate-900 text-white border-none font-black text-[9px] uppercase tracking-widest px-3 py-1 mb-2">
                  {approval.status === ContentStatusEnum.PendingApproval ? "QUY TRÌNH KIỂM SOÁT" : "SẴN SÀNG PHÁT HÀNH"}
                </Badge>
                <DialogTitle className="text-4xl font-black text-slate-900 uppercase tracking-tight leading-none">
                  {approval.status === ContentStatusEnum.PendingApproval
                    ? "Xem xét Nội dung"
                    : "Phân phối Tài sản"
                  }
                </DialogTitle>
                <DialogDescription className="text-base font-medium text-slate-500 mt-2 italic">
                  Kiểm tra lần cuối mọi thông số chiến dịch trước khi xác nhận lưu trữ hoặc xuất bản.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-10 scrollbar-hide">
            {modalContent}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={!!approval} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[90vh] flex flex-col border-none rounded-t-[3rem] bg-white font-sans">
        <DrawerHeader className="flex-shrink-0 p-8 pb-0 text-left">
          <Badge className="bg-slate-900 text-white border-none font-black text-[8px] uppercase tracking-widest w-fit mb-4">REVIEW MODE</Badge>
          <DrawerTitle className="text-2xl font-black text-slate-900 uppercase tracking-tight">
            {approval.status === ContentStatusEnum.PendingApproval
              ? "Xem xét Nội dung"
              : "Sẵn sàng Phát hành"
            }
          </DrawerTitle>
          <DrawerDescription className="text-sm font-medium text-slate-500 mt-1">
            Mọi thao tác của bạn sẽ được ghi nhật ký hệ thống.
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto p-8 pt-6">
          {modalContent}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

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
import { Check, X, Loader2, FileText, Send, AlertCircle, ShieldCheck, User } from "lucide-react";
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
        <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex items-center gap-4">
          <div className="size-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center shadow-sm">
            <ShieldCheck className="size-5 text-slate-400 dark:text-slate-500" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Thương hiệu</p>
            <p className="text-sm font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">{approval.brandName}</p>
          </div>
        </div>
        <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex items-center gap-4">
          <div className="size-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center shadow-sm">
            <User className="size-5 text-slate-400 dark:text-slate-500" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Người phê duyệt</p>
            <p className="text-sm font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">{approval.approverEmail?.split('@')[0]}</p>
          </div>
        </div>
      </div>

      {approval.notes && (
        <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Ghi chú từ quân sư</Label>
          <p className="text-sm italic text-slate-600 dark:text-slate-400 leading-relaxed font-medium">&ldquo;{approval.notes}&rdquo;</p>
        </div>
      )}

      <div className="space-y-4">
        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-2">
          <FileText className="size-3.5" /> Nội dung chiến lược cần xét duyệt
        </Label>
        <div className="rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xl shadow-slate-200/20 @container">
          {contentLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="size-10 animate-spin text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Đang đồng bộ dữ liệu...</span>
            </div>
          ) : content ? (
            <div className="p-2">
              <ContentPreviewView
                content={content}
                showActions={false}
              />
            </div>
          ) : (
            <div className="text-center py-20 px-6">
              <AlertCircle className="size-12 text-rose-500 mx-auto mb-4 opacity-20" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Không thể tải nội dung mục tiêu.</p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6 pt-8 border-t border-slate-100 dark:border-slate-800 mt-10">
        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Nhận xét tác chiến</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[120px] rounded-2xl bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 p-4 font-medium text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 resize-none shadow-sm"
            placeholder="Nhập nhận xét chuyên sâu hoặc lý do nếu từ chối..."
          />
        </div>

        {approval.status === ContentStatusEnum.PendingApproval && (
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={handleReject}
              disabled={isProcessing || contentLoading}
              className="h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-white dark:bg-slate-900 border-rose-100 dark:border-rose-900/30 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition-all hover:-translate-y-1"
            >
              <X className="mr-3 size-4" />
              Từ chối lệnh
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isProcessing || contentLoading}
              className="h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-slate-900 dark:bg-primary hover:bg-slate-800 dark:hover:bg-primary/90 text-white shadow-2xl shadow-slate-200 dark:shadow-primary/20 transition-all hover:-translate-y-1"
            >
              <Check className="mr-3 size-4" />
              Kích hoạt phê duyệt
            </Button>
          </div>
        )}

        {approval.status === ContentStatusEnum.Approved && content && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Thiết lập trung tâm phát hành</Label>
              {integrationsLoading ? (
                <div className="h-14 bg-slate-50 dark:bg-slate-800 animate-pulse rounded-2xl" />
              ) : integrations.length === 0 ? (
                <div className="p-4 bg-amber-50 dark:bg-amber-500/10 rounded-2xl border border-amber-100 dark:border-amber-900/30 flex items-center gap-3">
                  <AlertCircle className="size-5 text-amber-600" />
                  <p className="text-[10px] font-black text-amber-700 dark:text-amber-500 uppercase tracking-widest">Không tìm thấy trung tâm phát hành khả dụng.</p>
                </div>
              ) : (
                <Select
                  value={selectedIntegrationId}
                  onValueChange={setSelectedIntegrationId}
                >
                  <SelectTrigger className="h-14 rounded-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 font-black uppercase tracking-tighter text-[11px] text-slate-900 dark:text-white shadow-sm">
                    <SelectValue placeholder="CHỌN TRUNG TÂM PHÁT HÀNH..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-[2rem] border-slate-100 dark:border-slate-800 p-2 shadow-2xl bg-white dark:bg-slate-900">
                    {integrations.map((integration) => (
                      <SelectItem key={integration.id} value={integration.id} className="rounded-2xl p-4 focus:bg-slate-50 dark:focus:bg-slate-800">
                        <div className="flex items-center gap-4">
                          <div className="size-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-[10px] uppercase">
                            {integration.platform.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-900 dark:text-white leading-none mb-1">{integration.name}</span>
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{integration.platform}</span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isPublishing}
                className="h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-slate-50 dark:bg-slate-800 border-none text-slate-400 dark:text-slate-500"
              >
                Đóng tác vụ
              </Button>
              <Button
                onClick={handlePublish}
                disabled={!selectedIntegrationId || isPublishing || integrations.length === 0}
                className="h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xl shadow-emerald-100 dark:shadow-emerald-900/20 transition-all hover:-translate-y-1 active:scale-95"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="mr-3 size-5 animate-spin" />
                    Đang truyền tải...
                  </>
                ) : (
                  <>
                    <Send className="mr-3 size-5" />
                    Lệnh phát hành ngay
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
        <DialogContent className="max-w-5xl w-[95vw] max-h-[95vh] flex flex-col p-0 overflow-hidden bg-white dark:bg-slate-900 border-none rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.15)] dark:shadow-[0_0_100px_rgba(0,0,0,0.4)]">
          <DialogHeader className="p-8 md:p-10 border-b border-slate-100 dark:border-slate-800 flex-row items-center justify-between space-y-0 bg-slate-50/50 dark:bg-slate-800/20">
            <div>
              <DialogTitle className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
                {approval.status === ContentStatusEnum.PendingApproval ? "Xét duyệt chiến lược" : "Trung tâm điều phối phát hành"}
              </DialogTitle>
              <DialogDescription className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-2">
                Kiểm tra kỹ lưỡng các tài sản truyền thông trước khi thi hành lệnh.
              </DialogDescription>
            </div>
            <div className="hidden sm:block">
              <Badge variant="secondary" className={cn("text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-xl border-none shadow-sm",
                approval.status === ContentStatusEnum.Approved ? "bg-emerald-500 text-white" :
                  approval.status === ContentStatusEnum.PendingApproval ? "bg-amber-500 text-white" :
                    "bg-slate-800 text-white"
              )}>
                {approval.status === ContentStatusEnum.Approved ? "Sẵn sàng" : "Đang chờ"}
              </Badge>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-8 md:p-10 scrollbar-hide">
            {modalContent}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={!!approval} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[95vh] flex flex-col bg-white dark:bg-slate-900 border-none rounded-t-[2.5rem] shadow-2xl">
        <DrawerHeader className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 text-left bg-slate-50/50 dark:bg-slate-800/20">
          <DrawerTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
            {approval.status === ContentStatusEnum.PendingApproval ? "Phê duyệt" : "Phát hành"}
          </DrawerTitle>
          <DrawerDescription className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
            Xác thực thông tin và thi hành tác vụ.
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          {modalContent}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

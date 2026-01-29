"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  MessageSquare,
  Check,
  X,
  Clock,
  Trash2,
  User
} from "lucide-react";
import { ApprovalResponseDto, ContentStatusEnum } from "@/lib/types/omniadly-types";
import { useProfile } from "@/lib/contexts/profile-context";
import { ProfileTypeEnum } from "@/lib/utils/profile-utils";

interface ApprovalCardProps {
  approval: ApprovalResponseDto;
  onReview: (approval: ApprovalResponseDto) => void;
  onApprove?: (approvalId: string) => void;
  onReject?: (approvalId: string) => void;
  onDelete?: (approval: ApprovalResponseDto) => void;
  onChangeApprover?: (approval: ApprovalResponseDto) => void;
  isProcessing?: boolean;
}

export function ApprovalCard({
  approval,
  onReview,
  onApprove,
  onReject,
  onDelete,
  onChangeApprover,
  isProcessing = false
}: ApprovalCardProps) {
  const { profileType } = useProfile();
  const canUseTeamFeatures = profileType !== ProfileTypeEnum.Free;

  const getStatusBadge = (status: ContentStatusEnum) => {
    switch (status) {
      case ContentStatusEnum.PendingApproval:
        return <Badge variant="secondary" className="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-none font-black text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-lg">Pending</Badge>;
      case ContentStatusEnum.Approved:
        return <Badge variant="secondary" className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none font-black text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-lg">Approved</Badge>;
      case ContentStatusEnum.Rejected:
        return <Badge variant="secondary" className="bg-rose-50 dark:bg-rose-500/10 text-rose-500 dark:text-rose-400 border-none font-black text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-lg">Rejected</Badge>;
      case ContentStatusEnum.Draft:
        return <Badge variant="secondary" className="bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-none font-black text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-lg">Draft</Badge>;
      case ContentStatusEnum.Published:
        return <Badge variant="secondary" className="bg-primary dark:bg-primary/20 text-white dark:text-primary border-none font-black text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-lg">Published</Badge>;
      default:
        return <Badge variant="secondary" className="font-black text-[9px] uppercase tracking-widest">{status}</Badge>;
    }
  };

  return (
    <Card className="hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-black/40 transition-all duration-300 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden group">
      <CardHeader className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              {getStatusBadge(approval.status)}
              <Badge variant="outline" className="border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-bold text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-lg">CONTENT</Badge>
            </div>
            <CardTitle className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight truncate leading-tight mb-1">{approval.contentTitle || 'Nhiệm vụ không tên'}</CardTitle>
            <CardDescription className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <span className="text-slate-900 dark:text-slate-300">{approval.brandName || 'Thương hiệu N/A'}</span>
              <span className="size-1 rounded-full bg-slate-200 dark:bg-slate-700" />
              {new Date(approval.createdAt).toLocaleDateString()}
            </CardDescription>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReview(approval)}
              className="h-9 px-4 rounded-xl font-black uppercase tracking-widest text-[9px] border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              <Eye className="mr-2 h-3.5 w-3.5" />
              Xem xét
            </Button>
            {onChangeApprover && approval.status === ContentStatusEnum.PendingApproval && canUseTeamFeatures && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onChangeApprover(approval)}
                disabled={isProcessing}
                className="h-9 px-4 rounded-xl font-black uppercase tracking-widest text-[9px] border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                <User className="mr-2 h-3.5 w-3.5" />
                Đổi người
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-6 pb-6 mt-4">
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              <Clock className="h-3 w-3" />
              <span>Gửi lúc: {new Date(approval.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            {approval.notes && (
              <div className="flex items-center gap-2 text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                <MessageSquare className="h-3 w-3" />
                <span>Có phản hồi</span>
              </div>
            )}
            {approval.approverEmail && (
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                <User className="h-3 w-3 text-primary" />
                <span>Bởi: {approval.approverEmail.split('@')[0]}</span>
              </div>
            )}
          </div>

          {approval.status === ContentStatusEnum.PendingApproval && onApprove && onReject && (
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => onApprove(approval.id)}
                disabled={isProcessing}
                className="h-10 rounded-xl font-black uppercase tracking-widest text-[9px] bg-slate-900 dark:bg-primary text-white hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 dark:shadow-primary/20"
              >
                <Check className="mr-2 h-3.5 w-3.5" />
                Duyệt
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onReject(approval.id)}
                disabled={isProcessing}
                className="h-10 rounded-xl font-black uppercase tracking-widest text-[9px] bg-rose-500 text-white hover:bg-rose-600 transition-all shadow-lg shadow-rose-100 dark:shadow-rose-900/20"
              >
                <X className="mr-2 h-3.5 w-3.5" />
                Từ chối
              </Button>
            </div>
          )}

          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(approval)}
              className="h-10 w-10 rounded-xl text-slate-300 dark:text-slate-700 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950 transition-all ml-auto"
              disabled={isProcessing}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

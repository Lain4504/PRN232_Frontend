"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Edit,
  Trash2,
  Send,
  Clock,
  Image,
  Video,
  FileText
} from "lucide-react";
import { ContentResponseDto, ContentStatusEnum, AdTypeEnum } from "@/lib/types/omniadly-types";
import { ContentScheduleActions } from "./content-schedule-actions";

interface ContentCardProps {
  content: ContentResponseDto;
  onEdit?: (content: ContentResponseDto) => void;
  onDelete?: (contentId: string) => void;
  onSubmit?: (contentId: string) => void;
  onSubmitForApproval?: (content: ContentResponseDto) => void;
  isProcessing?: boolean;
  showActions?: boolean;
}

export function ContentCard({
  content,
  onEdit,
  onDelete,
  onSubmit,
  isProcessing = false,
  showActions = true
}: ContentCardProps) {

  const getStatusBadge = (status: ContentStatusEnum) => {
    switch (status) {
      case ContentStatusEnum.Draft:
        return <Badge variant="secondary">Bản nháp</Badge>;
      case ContentStatusEnum.PendingApproval:
        return <Badge variant="outline" className="border-amber-500 text-amber-600">Chờ phê duyệt</Badge>;
      case ContentStatusEnum.Approved:
        return <Badge className="bg-emerald-500">Đã phê duyệt</Badge>;
      case ContentStatusEnum.Rejected:
        return <Badge variant="destructive">Bị từ chối</Badge>;
      case ContentStatusEnum.Published:
        return <Badge className="bg-blue-600">Đã đăng</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const normalizeAdType = (adType: string | AdTypeEnum): AdTypeEnum => {
    if (typeof adType === 'number') return adType as AdTypeEnum;
    if (typeof adType === 'string') {
      const normalized = adType.toLowerCase().replace(/_/g, '');
      if (normalized === 'textonly') return AdTypeEnum.TextOnly;
      if (normalized === 'imagetext' || normalized === 'image+text') return AdTypeEnum.ImageText;
      if (normalized === 'videotext' || normalized === 'video+text') return AdTypeEnum.VideoText;
    }
    return AdTypeEnum.TextOnly;
  };

  const getAdTypeIcon = (adType: AdTypeEnum) => {
    switch (adType) {
      case AdTypeEnum.TextOnly: return <FileText className="h-3 w-3" />;
      case AdTypeEnum.ImageText: return <Image className="h-3 w-3" />;
      case AdTypeEnum.VideoText: return <Video className="h-3 w-3" />;
      default: return <FileText className="h-3 w-3" />;
    }
  };

  const getAdTypeLabel = (adType: AdTypeEnum) => {
    switch (adType) {
      case AdTypeEnum.TextOnly: return "Văn bản";
      case AdTypeEnum.ImageText: return "Hình ảnh";
      case AdTypeEnum.VideoText: return "Video";
      default: return "Khác";
    }
  };

  return (
    <Card className="group hover:shadow-md transition-all duration-300">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              {getStatusBadge(content.status)}
              <Badge variant="outline" className="flex items-center gap-1 text-[10px] font-normal">
                {getAdTypeIcon(normalizeAdType(content.adType))}
                {getAdTypeLabel(normalizeAdType(content.adType))}
              </Badge>
            </div>
            <CardTitle className="text-sm font-bold line-clamp-1">
              {content.title}
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0 space-y-3">
        {(content.description || content.textContent) && (
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {content.description || content.textContent}
          </p>
        )}

        <div className="flex items-center justify-between gap-2 pt-2 border-t mt-auto">
          <div className="flex items-center gap-1 text-[10px] text-slate-400">
            <Clock className="size-3" />
            <span>{new Date(content.createdAt).toLocaleDateString('vi-VN')}</span>
          </div>

          {showActions && (
            <div className="flex items-center gap-1">
              {content.status === ContentStatusEnum.Draft && onEdit && (
                <Button size="icon" variant="ghost" onClick={() => onEdit(content)} disabled={isProcessing} className="size-7">
                  <Edit className="size-3.5" />
                </Button>
              )}

              {(content.status === ContentStatusEnum.Draft || content.status === ContentStatusEnum.Rejected) && onSubmit && (
                <Button size="sm" onClick={() => onSubmit(content.id)} disabled={isProcessing} className="h-7 text-[10px] px-2">
                  Gửi duyệt
                </Button>
              )}

              {content.status === ContentStatusEnum.Approved && (
                <ContentScheduleActions content={content} />
              )}

              {(content.status === ContentStatusEnum.Draft || content.status === ContentStatusEnum.Rejected) && onDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="icon" variant="ghost" disabled={isProcessing} className="size-7 text-rose-500 hover:text-rose-600 hover:bg-rose-50">
                      <Trash2 className="size-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Xóa nội dung</AlertDialogTitle>
                      <AlertDialogDescription>
                        Bạn có chắc chắn muốn xóa bài viết &ldquo;{content.title}&rdquo;? Hành động này không thể hoàn tác.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(content.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Xác nhận xóa
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

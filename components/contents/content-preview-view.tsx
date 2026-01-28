"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ContentResponseDto,
  ContentStatusEnum,
  AdTypeEnum
} from "@/lib/types/omniadly-types";
import { useSocialIntegrations } from "@/hooks/use-social-integrations";
import { Send, FileText, Image as ImageIcon, Video, Calendar, Share, Loader2, Facebook, MoreHorizontal, ThumbsUp, MessageCircle, Share2, Globe, CheckCircle2 } from "lucide-react";
import { useProfile } from "@/lib/contexts/profile-context";
import { ProfileTypeEnum } from "@/lib/utils/profile-utils";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ContentPreviewViewProps {
  content: ContentResponseDto;
  onSubmit?: (contentId: string) => Promise<void>;
  onPublish?: (contentId: string, integrationId: string) => Promise<void>;
  isProcessing?: boolean;
  showActions?: boolean;
  brands?: Array<{ id: string; name: string }>;
}

export function ContentPreviewView({
  content,
  onSubmit,
  onPublish,
  isProcessing = false,
  showActions = true,
  brands = [],
}: ContentPreviewViewProps) {
  const { profileType } = useProfile();
  const canUseTeamFeatures = profileType !== ProfileTypeEnum.Free;
  const [selectedIntegrationId, setSelectedIntegrationId] = useState<string>("");
  const [previewMode, setPreviewMode] = useState<'detail' | 'facebook'>('detail');

  const { data: integrations = [] } = useSocialIntegrations(content.brandId);

  const imageUrls = React.useMemo(() => {
    const value = content.imageUrl;
    if (value == null) return [];
    if (Array.isArray(value)) return value.filter((v): v is string => typeof v === 'string' && !!v);
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed || trimmed.toLowerCase() === 'null' || trimmed.toLowerCase() === 'undefined') return [];
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.filter(Boolean);
        if (typeof parsed === 'string') return [parsed];
      } catch { return [trimmed]; }
    }
    return [];
  }, [content.imageUrl]);

  const videoUrl = React.useMemo(() => {
    const value = content.videoUrl;
    if (value == null) return null;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed || trimmed.toLowerCase() === 'null' || trimmed.toLowerCase() === 'undefined') return null;
      try {
        const parsed = JSON.parse(trimmed);
        if (typeof parsed === 'string') return parsed;
      } catch { return trimmed; }
    }
    return null;
  }, [content.videoUrl]);

  const adTypeLabel = React.useMemo(() => {
    const type = content.adType;
    const normalized = typeof type === 'string' ? type.toLowerCase().replace(/_/g, '') : type;
    if (normalized === AdTypeEnum.TextOnly || normalized === 'textonly') return "Văn bản";
    if (normalized === AdTypeEnum.ImageText || normalized === 'imagetext') return "Ảnh + Văn bản";
    if (normalized === AdTypeEnum.VideoText || normalized === 'videotext') return "Video + Văn bản";
    return "Khác";
  }, [content.adType]);

  const FacebookPreview = () => (
    <div className="max-w-[600px] mx-auto bg-white border rounded-lg shadow-sm overflow-hidden font-sans animation-in fade-in duration-500">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="size-10">
            <AvatarFallback className="bg-blue-600 text-white text-xs font-bold">
              {content.brandName?.charAt(0) || 'B'}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-sm text-slate-900 leading-tight">{content.brandName || 'Thương hiệu'}</span>
              <CheckCircle2 className="size-3 text-blue-500 fill-blue-500" />
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <span>Đang chờ đăng</span>
              <span>•</span>
              <Globe className="size-3" />
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-slate-400"><MoreHorizontal className="size-5" /></Button>
      </div>

      <div className="px-4 pb-3 text-sm text-slate-900 leading-relaxed whitespace-pre-wrap">
        {content.textContent || 'Nội dung chưa cập nhật...'}
      </div>

      <div className="bg-slate-100 min-h-[300px] flex items-center justify-center relative overflow-hidden">
        {imageUrls.length > 0 ? (
          <div className={cn(
            "grid w-full gap-0.5",
            imageUrls.length === 1 ? "grid-cols-1" : "grid-cols-2"
          )}>
            {imageUrls.slice(0, 4).map((url, i) => (
              <div key={i} className="aspect-square relative">
                <img src={url} alt="" className="absolute inset-0 w-full h-full object-cover" />
              </div>
            ))}
          </div>
        ) : videoUrl ? (
          <video src={videoUrl} controls className="w-full max-h-[400px]" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-300">
            <ImageIcon className="size-10" />
            <span className="text-xs">Không có tệp đính kèm</span>
          </div>
        )}
      </div>

      <div className="px-4 py-1 border-t flex items-center justify-around">
        <Button variant="ghost" size="sm" className="flex-1 text-slate-500 font-semibold h-10">
          <ThumbsUp className="size-4 mr-2" /> Thích
        </Button>
        <Button variant="ghost" size="sm" className="flex-1 text-slate-500 font-semibold h-10">
          <MessageCircle className="size-4 mr-2" /> Bình luận
        </Button>
        <Button variant="ghost" size="sm" className="flex-1 text-slate-500 font-semibold h-10">
          <Share2 className="size-4 mr-2" /> Chia sẻ
        </Button>
      </div>
    </div>
  )

  const DetailView = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="space-y-1">
            <Label className="text-xs text-slate-500">Tiêu đề</Label>
            <h2 className="text-2xl font-bold text-slate-900">{content.title}</h2>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary">{adTypeLabel}</Badge>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Calendar className="size-3" /> {new Date(content.createdAt).toLocaleDateString('vi-VN')}
            </div>
          </div>
        </div>
        <div className="p-4 rounded-lg border bg-slate-50/50 space-y-2">
          <Label className="text-xs text-slate-500">Thông tin liên kết</Label>
          <div className="text-sm">
            <p className="font-semibold">Thương hiệu: <span className="font-normal">{content.brandName || 'N/A'}</span></p>
            <p className="font-semibold">Sản phẩm: <span className="font-normal">{content.productName || 'N/A'}</span></p>
          </div>
        </div>
      </div>

      {content.textContent && (
        <div className="space-y-2">
          <Label className="text-xs text-slate-500">Nội dung bài viết</Label>
          <div className="p-4 rounded-lg border bg-white shadow-sm">
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{content.textContent}</p>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg w-fit">
        <Button
          variant={previewMode === 'detail' ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setPreviewMode('detail')}
          className="text-xs h-8"
        >
          Thông số
        </Button>
        <Button
          variant={previewMode === 'facebook' ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setPreviewMode('facebook')}
          className="text-xs h-8"
        >
          <Facebook className="size-3 mr-2" /> Xem thử Facebook
        </Button>
      </div>

      <div className="min-h-[300px]">
        {previewMode === 'facebook' ? <FacebookPreview /> : <DetailView />}
      </div>

      {showActions && (
        <div className="pt-6 border-t mt-6">
          {content.status === ContentStatusEnum.Draft && onSubmit && canUseTeamFeatures && (
            <Button
              onClick={() => onSubmit(content.id)}
              disabled={isProcessing}
              className="w-full h-12"
            >
              {isProcessing && <Loader2 className="mr-2 size-4 animate-spin" />}
              Gửi phê duyệt nội dung
            </Button>
          )}

          {content.status === ContentStatusEnum.Approved && onPublish && (
            <div className="space-y-4">
              <Label className="text-xs text-slate-500">Kênh phát hành</Label>
              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={selectedIntegrationId} onValueChange={setSelectedIntegrationId}>
                  <SelectTrigger className="flex-1 h-11">
                    <SelectValue placeholder="Chọn kênh đăng bài..." />
                  </SelectTrigger>
                  <SelectContent>
                    {integrations.map((integration) => (
                      <SelectItem key={integration.id} value={integration.id}>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{integration.name}</span>
                          <Badge variant="outline" className="text-[10px] py-0">{integration.platform}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  onClick={() => selectedIntegrationId && onPublish(content.id, selectedIntegrationId)}
                  disabled={!selectedIntegrationId || isProcessing || integrations.length === 0}
                  className="px-8 h-11"
                >
                  {isProcessing && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Đăng bài ngay
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

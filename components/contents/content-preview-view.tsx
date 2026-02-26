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
import { ImageIcon, Calendar, Share2, Facebook, MoreHorizontal, ThumbsUp, MessageCircle, Globe, CheckCircle2, Loader2 } from "lucide-react";
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
    <div className="max-w-[600px] mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden font-sans animation-in fade-in duration-500">
      <div className="p-4 flex items-center justify-between border-b border-slate-50 dark:border-slate-800/10">
        <div className="flex items-center gap-3">
          <Avatar className="size-10">
            <AvatarFallback className="bg-blue-600 text-white text-xs font-bold">
              {content.brandName?.charAt(0) || 'B'}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{content.brandName || 'Thương hiệu'}</span>
              <CheckCircle2 className="size-3 text-blue-500 fill-blue-500" />
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight">
              <span>Đang chờ đăng</span>
              <span>•</span>
              <Globe className="size-3" />
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-slate-400"><MoreHorizontal className="size-5" /></Button>
      </div>

      <div className="px-5 py-4 text-sm text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-wrap font-medium">
        {content.textContent || 'Nội dung chưa cập nhật...'}
      </div>

      <div className="bg-slate-100 dark:bg-slate-950 min-h-[300px] flex items-center justify-center relative overflow-hidden">
        {imageUrls.length > 0 ? (
          <div className={cn(
            "grid w-full gap-1",
            imageUrls.length === 1 ? "grid-cols-1" : "grid-cols-2"
          )}>
            {imageUrls.slice(0, 4).map((url, i) => (
              <div key={i} className="aspect-square relative">
                <img src={url} alt="Nội dung hình ảnh" className="absolute inset-0 w-full h-full object-cover" />
              </div>
            ))}
          </div>
        ) : videoUrl ? (
          <video src={videoUrl} controls className="w-full max-h-[400px]" />
        ) : (
          <div className="flex flex-col items-center gap-3 text-slate-300 dark:text-slate-700">
            <ImageIcon className="size-12" />
            <span className="text-[10px] font-black uppercase tracking-widest">Không có tệp phương tiện</span>
          </div>
        )}
      </div>

      <div className="px-4 py-1 border-t border-slate-100 dark:border-slate-800 flex items-center justify-around bg-slate-50/50 dark:bg-slate-800/10">
        <Button variant="ghost" size="sm" className="flex-1 text-slate-500 dark:text-slate-400 font-black tracking-widest text-[10px] uppercase h-12 hover:bg-white dark:hover:bg-slate-800">
          <ThumbsUp className="size-4 mr-2" /> Thích
        </Button>
        <Button variant="ghost" size="sm" className="flex-1 text-slate-500 dark:text-slate-400 font-black tracking-widest text-[10px] uppercase h-12 hover:bg-white dark:hover:bg-slate-800">
          <MessageCircle className="size-4 mr-2" /> Bình luận
        </Button>
        <Button variant="ghost" size="sm" className="flex-1 text-slate-500 dark:text-slate-400 font-black tracking-widest text-[10px] uppercase h-12 hover:bg-white dark:hover:bg-slate-800">
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
            <Label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Tiêu đề nội dung</Label>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{content.title}</h2>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-slate-900 dark:bg-primary text-white border-none font-black text-[9px] uppercase tracking-widest rounded-lg">{adTypeLabel}</Badge>
            <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              <Calendar className="size-3.5" /> {new Date(content.createdAt).toLocaleDateString('vi-VN').replace(/\//g, '.')}
            </div>
          </div>
        </div>
        <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 space-y-3">
          <Label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Thông tin chiến dịch</Label>
          <div className="text-sm space-y-1">
            <p className="font-medium text-slate-400 dark:text-slate-500 text-[11px] uppercase tracking-tighter">Thương hiệu: <span className="font-black text-slate-900 dark:text-white ml-2">{content.brandName || 'N/A'}</span></p>
            <p className="font-medium text-slate-400 dark:text-slate-500 text-[11px] uppercase tracking-tighter">Sản phẩm: <span className="font-black text-slate-900 dark:text-white ml-2">{content.productName || 'N/A'}</span></p>
          </div>
        </div>
      </div>

      {content.textContent && (
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Nội dung chi tiết</Label>
          <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/20 dark:shadow-black/20">
            <p className="text-sm whitespace-pre-wrap leading-relaxed font-medium text-slate-900 dark:text-slate-100">{content.textContent}</p>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit border border-slate-200 dark:border-slate-700 shadow-sm">
        <Button
          variant={previewMode === 'detail' ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setPreviewMode('detail')}
          className={cn(
            "text-[10px] font-black uppercase tracking-widest h-9 px-6 rounded-xl transition-all",
            previewMode === 'detail' ? "bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500"
          )}
        >
          Thông số tác chiến
        </Button>
        <Button
          variant={previewMode === 'facebook' ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setPreviewMode('facebook')}
          className={cn(
            "text-[10px] font-black uppercase tracking-widest h-9 px-6 rounded-xl transition-all",
            previewMode === 'facebook' ? "bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500"
          )}
        >
          <Facebook className="size-3.5 mr-2" /> Mô phỏng Facebook
        </Button>
      </div>

      <div className="min-h-[300px]">
        {previewMode === 'facebook' ? <FacebookPreview /> : <DetailView />}
      </div>

      {showActions && (
        <div className="pt-8 border-t border-slate-100 dark:border-slate-800 mt-10">
          {content.status === ContentStatusEnum.Draft && onSubmit && canUseTeamFeatures && (
            <Button
              onClick={() => onSubmit(content.id)}
              disabled={isProcessing}
              className="w-full h-14 rounded-2xl bg-slate-900 dark:bg-primary shadow-2xl shadow-slate-200 dark:shadow-primary/20 text-white font-black uppercase tracking-[0.2em] text-[11px] hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {isProcessing && <Loader2 className="mr-3 size-5 animate-spin" />}
              Kích hoạt quy trình phê duyệt nội dung
            </Button>
          )}

          {content.status === ContentStatusEnum.Approved && onPublish && (
            <div className="space-y-6">
              <Label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Thiết lập kênh phát hành</Label>
              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={selectedIntegrationId} onValueChange={setSelectedIntegrationId}>
                  <SelectTrigger className="flex-1 h-14 rounded-2xl bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 px-6 font-bold text-slate-900 dark:text-white shadow-sm">
                    <SelectValue placeholder="Chọn trung tâm phát hành..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-100 dark:border-slate-800 p-2 shadow-2xl bg-white dark:bg-slate-900">
                    {integrations.map((integration) => (
                      <SelectItem key={integration.id} value={integration.id} className="rounded-xl p-3 focus:bg-slate-50 dark:focus:bg-slate-800">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-black text-[10px] uppercase">
                            {integration.platform.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-900 dark:text-white leading-none mb-1">{integration.name}</span>
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{integration.platform}</span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  onClick={() => selectedIntegrationId && onPublish(content.id, selectedIntegrationId)}
                  disabled={!selectedIntegrationId || isProcessing || integrations.length === 0}
                  className="px-10 h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-emerald-200 dark:shadow-emerald-900/20 transition-all hover:-translate-y-1 active:scale-95"
                >
                  {isProcessing && <Loader2 className="mr-3 size-5 animate-spin" />}
                  Lệnh xuất bản ngay
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

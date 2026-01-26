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
import { Send, FileText, Image as ImageIcon, Video, Calendar, Package, Share, Loader2, Facebook, Smartphone, Laptop, MoreHorizontal, ThumbsUp, MessageCircle, Share2, Globe, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useProfile } from "@/lib/contexts/profile-context";
import { ProfileTypeEnum } from "@/lib/utils/profile-utils";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

  const { data: integrations = [], isLoading: integrationsLoading } = useSocialIntegrations(content.brandId);

  const parseAdType = (adType: string | number | AdTypeEnum): AdTypeEnum => {
    if (typeof adType === 'number') return adType as AdTypeEnum;
    if (typeof adType === 'string') {
      const normalized = adType.toLowerCase().replace(/_/g, '');
      if (normalized === 'textonly') return AdTypeEnum.TextOnly;
      if (normalized === 'imagetext' || normalized === 'image+text') return AdTypeEnum.ImageText;
      if (normalized === 'videotext' || normalized === 'video+text') return AdTypeEnum.VideoText;
    }
    return AdTypeEnum.TextOnly;
  };

  const parseImageUrls = (value: unknown): string[] => {
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
  };

  const parseVideoUrl = (value: unknown): string | null => {
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
  };

  const imageUrls = parseImageUrls(content.imageUrl);
  const videoUrl = parseVideoUrl(content.videoUrl);
  const adType = parseAdType(content.adType);

  const FacebookPreview = () => (
    <div className="max-w-[500px] mx-auto bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden font-sans animation-in fade-in duration-500">
      {/* FB Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="size-10 rounded-full border border-slate-100">
            <AvatarFallback className="bg-blue-600 text-white font-black text-xs">
              {content.brandName?.charAt(0) || 'B'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-bold text-[14px] text-slate-900 leading-tight hover:underline cursor-pointer">{content.brandName || 'Thương hiệu của bạn'}</span>
              <CheckCircle2 className="size-3 text-blue-500 fill-blue-500" />
            </div>
            <div className="flex items-center gap-1 text-[12px] text-slate-500 font-medium">
              <span>1 phút trước</span>
              <span>•</span>
              <Globe className="size-3" />
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-slate-500"><MoreHorizontal className="size-5" /></Button>
      </div>

      {/* FB Post Text */}
      <div className="px-4 pb-3 text-[14px] text-slate-900 leading-relaxed whitespace-pre-wrap font-normal">
        {content.textContent || 'Đang chuẩn bị nội dung...'}
      </div>

      {/* FB Media Content */}
      <div className="bg-slate-100 min-h-[300px] flex items-center justify-center relative overflow-hidden">
        {adType === AdTypeEnum.ImageText && imageUrls.length > 0 ? (
          <div className={cn(
            "grid w-full gap-0.5",
            imageUrls.length === 1 ? "grid-cols-1" :
              imageUrls.length === 2 ? "grid-cols-2" :
                "grid-cols-2"
          )}>
            {imageUrls.slice(0, 4).map((url, i) => (
              <div key={i} className={cn(
                "aspect-square relative",
                imageUrls.length === 3 && i === 0 ? "row-span-2 aspect-auto" : ""
              )}>
                <img src={url} alt="" className="absolute inset-0 w-full h-full object-cover" />
              </div>
            ))}
            {imageUrls.length > 4 && (
              <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded">
                +{imageUrls.length - 4}
              </div>
            )}
          </div>
        ) : adType === AdTypeEnum.VideoText && videoUrl ? (
          <video src={videoUrl} controls className="w-full max-h-[500px]" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-300">
            <ImageIcon className="size-12" />
            <span className="text-[10px] font-bold uppercase tracking-widest">No Media Asset</span>
          </div>
        )}
      </div>

      {/* FB Bottom Actions Shell */}
      <div className="p-1 px-4 border-t border-slate-100 flex items-center justify-between mt-1">
        <div className="flex items-center gap-1.5 py-2 px-3 rounded-lg hover:bg-slate-50 cursor-pointer flex-1 justify-center transition-colors">
          <ThumbsUp className="size-4 text-slate-500" />
          <span className="text-[13px] font-semibold text-slate-500">Thích</span>
        </div>
        <div className="flex items-center gap-1.5 py-2 px-3 rounded-lg hover:bg-slate-50 cursor-pointer flex-1 justify-center transition-colors">
          <MessageCircle className="size-4 text-slate-500" />
          <span className="text-[13px] font-semibold text-slate-500">Bình luận</span>
        </div>
        <div className="flex items-center gap-1.5 py-2 px-3 rounded-lg hover:bg-slate-50 cursor-pointer flex-1 justify-center transition-colors">
          <Share2 className="size-4 text-slate-500" />
          <span className="text-[13px] font-semibold text-slate-500">Chia sẻ</span>
        </div>
      </div>
    </div>
  )

  const DetailView = () => (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Định danh nội dung</Label>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight leading-[1.1]">{content.title}</h2>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-slate-900 text-white border-none font-black text-[9px] uppercase tracking-widest px-3 py-1">
              {adType === AdTypeEnum.TextOnly ? "TEXT ONLY" : adType === AdTypeEnum.ImageText ? "IMAGE + TEXT" : "VIDEO CONTENT"}
            </Badge>
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
              <Calendar className="size-3" /> {new Date(content.createdAt).toLocaleDateString('vi-VN')}
            </div>
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
          <div className="flex items-center gap-3">
            <Package className="size-4 text-slate-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Thực thể liên quan</span>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Thương hiệu: {content.brandName || 'General'}</p>
            <p className="text-sm font-black text-slate-400 uppercase tracking-tight">Sản phẩm: {content.productName || 'N/A'}</p>
          </div>
        </div>
      </div>

      {content.description && (
        <div className="space-y-4">
          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Bối cảnh & Mô tả sáng tạo</Label>
          <p className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 text-sm font-medium text-slate-600 leading-relaxed italic">{content.description}</p>
        </div>
      )}

      {content.textContent && (
        <div className="space-y-4">
          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Nội dung văn bản (Copywriting)</Label>
          <div className="p-8 bg-white rounded-[2rem] border-2 border-slate-100 shadow-sm relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] rotate-12 group-hover:rotate-0 transition-transform">
              <FileText className="size-20" />
            </div>
            <p className="text-base font-medium text-slate-900 whitespace-pre-wrap leading-relaxed relative z-10">{content.textContent}</p>
          </div>
        </div>
      )}

      {/* Style & Context details block */}
      {(content.styleDescription || content.contextDescription || content.representativeCharacter) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {content.styleDescription && (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 block">Style Persona</Label>
              <p className="text-xs font-bold text-slate-700 uppercase tracking-tight">{content.styleDescription}</p>
            </div>
          )}
          {content.representativeCharacter && (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 block">Brand Character</Label>
              <p className="text-xs font-bold text-slate-700 uppercase tracking-tight">{content.representativeCharacter}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-8 font-sans">
      {/* Visualizer Toggle */}
      <div className="flex items-center justify-between p-1 bg-slate-100 rounded-2xl w-fit">
        <button
          onClick={() => setPreviewMode('detail')}
          className={cn(
            "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
            previewMode === 'detail' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-900"
          )}
        >
          Thông số Chi tiết
        </button>
        <button
          onClick={() => setPreviewMode('facebook')}
          className={cn(
            "flex items-center gap-2 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
            previewMode === 'facebook' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-900"
          )}
        >
          <Facebook className="size-3 fill-current" /> Preview Facebook
        </button>
      </div>

      <div className="min-h-[400px]">
        {previewMode === 'facebook' ? <FacebookPreview /> : <DetailView />}
      </div>

      {showActions && (
        <div className="pt-10 border-t border-slate-100">
          {content.status === ContentStatusEnum.Draft && onSubmit && canUseTeamFeatures && (
            <Button
              onClick={() => onSubmit(content.id)}
              disabled={isProcessing}
              className="h-16 w-full rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-slate-200 transition-all hover:-translate-y-1"
            >
              {isProcessing ? <Loader2 className="mr-3 size-5 animate-spin" /> : <Send className="mr-3 size-4" />}
              Gửi yêu cầu Phê duyệt
            </Button>
          )}

          {content.status === ContentStatusEnum.Approved && onPublish && (
            <div className="space-y-6">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Tích hợp Social sẵn có</Label>
              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={selectedIntegrationId} onValueChange={setSelectedIntegrationId}>
                  <SelectTrigger className="h-16 rounded-2xl border-2 border-slate-100 bg-white px-6 focus:ring-0 shadow-sm font-black text-slate-900 uppercase tracking-tight flex-1">
                    <SelectValue placeholder="Chọn kênh phát hành..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-1">
                    {integrations.map((integration) => (
                      <SelectItem key={integration.id} value={integration.id} className="rounded-xl h-12 focus:bg-slate-50">
                        <div className="flex items-center justify-between w-[250px]">
                          <span className="font-black text-slate-900 uppercase text-[10px]">{integration.name}</span>
                          <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest text-slate-400 border-slate-100">{integration.platform}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  onClick={() => selectedIntegrationId && onPublish(content.id, selectedIntegrationId)}
                  disabled={!selectedIntegrationId || isProcessing || integrations.length === 0}
                  className="h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-emerald-100 transition-all hover:-translate-y-1 px-12"
                >
                  {isProcessing ? <Loader2 className="mr-3 size-5 animate-spin" /> : <Share className="mr-3 size-4" />}
                  Phát hành
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

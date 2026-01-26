"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Save,
  Send,
  Binary,
  Target,
  FileText,
  Sparkles,
  Zap,
  Tag,
  Rocket,
  Upload,
  Image as ImageIcon,
  Video,
  Check,
  Package,
  ChevronRight
} from "lucide-react";
import {
  ContentResponseDto,
  CreateContentRequest,
  ContentStatusEnum,
  AdTypeEnum
} from "@/lib/types/omniadly-types";
import { useProfile } from "@/lib/contexts/profile-context";
import { ProfileTypeEnum } from "@/lib/utils/profile-utils";
import { cn } from "@/lib/utils";

interface ContentFormSharedProps {
  formData: CreateContentRequest;
  setFormData: (data: CreateContentRequest) => void;
  content: ContentResponseDto | null;
  isEditing: boolean;
  isCreateMode: boolean;
  brands: Array<{ id: string; name: string }>;
  products: Array<{ id: string; name: string; brandId: string }>;
  handleSave: () => Promise<void>;
  handleSubmit: () => Promise<void>;
  isProcessing: boolean;
  onSubmit?: (contentId: string) => Promise<void>;
  className?: string;
  showButtons?: boolean;
  onSelectImages: (files: FileList | null) => void;
  onSelectVideo: (file: File | null) => void;
  imagePreviews: string[];
  videoPreview: string | null;
}

export function ContentFormShared({
  formData,
  setFormData,
  content,
  isEditing,
  isCreateMode,
  brands,
  products,
  handleSave,
  handleSubmit,
  isProcessing,
  onSubmit,
  className,
  showButtons = true,
  onSelectImages,
  onSelectVideo,
  imagePreviews,
  videoPreview
}: ContentFormSharedProps) {
  const { profileType } = useProfile();
  const canUseTeamFeatures = profileType !== ProfileTypeEnum.Free;

  const existingImageUrls = React.useMemo(() => {
    const normalize = (val: unknown): string[] => {
      if (val == null) return [];
      if (Array.isArray(val)) return val.filter((v): v is string => typeof v === 'string' && !!v);
      if (typeof val === 'string') {
        const trimmed = val.trim();
        if (!trimmed || trimmed.toLowerCase() === 'null' || trimmed.toLowerCase() === 'undefined') return [];
        let current: unknown = trimmed;
        for (let i = 0; i < 2; i++) {
          try {
            const parsed = JSON.parse(current as string);
            if (Array.isArray(parsed)) return parsed.filter(Boolean);
            if (typeof parsed === 'string') { current = parsed; continue; }
            break;
          } catch { break; }
        }
        return [trimmed];
      }
      return [];
    };
    return normalize(formData.imageUrl as unknown);
  }, [formData.imageUrl]);

  const displayImageUrls = React.useMemo(() => [...existingImageUrls, ...imagePreviews], [existingImageUrls, imagePreviews]);

  const displayVideoUrl = React.useMemo(() => {
    if (videoPreview) return videoPreview;
    const val: unknown = formData.videoUrl as unknown;
    if (val == null) return null;
    if (typeof val === 'string') {
      const trimmed = val.trim();
      if (!trimmed || trimmed.toLowerCase() === 'null' || trimmed.toLowerCase() === 'undefined') return null;
      let current: unknown = trimmed;
      for (let i = 0; i < 2; i++) {
        try {
          const parsed = JSON.parse(current as string);
          if (typeof parsed === 'string' && parsed) { current = parsed; continue; }
          break;
        } catch { break; }
      }
      return typeof current === 'string' ? current : null;
    }
    return null;
  }, [videoPreview, formData.videoUrl]);

  const filteredProducts = products.filter(p => p.brandId === formData.brandId);

  return (
    <div className={cn("space-y-10 animate-in fade-in duration-500", className)}>
      {/* Context Cluster */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Sở hữu bởi Thương hiệu</Label>
          <Select
            value={formData.brandId}
            onValueChange={(value) => setFormData({ ...formData, brandId: value, productId: undefined })}
            disabled={!isEditing && !isCreateMode}
          >
            <SelectTrigger className="h-14 rounded-2xl border-2 border-slate-100 bg-slate-50 px-6 focus:ring-0 shadow-sm font-black text-slate-900 uppercase tracking-tight">
              <SelectValue placeholder="Chọn brand chủ quản..." />
            </SelectTrigger>
            <SelectContent className="rounded-2xl p-1 shadow-2xl">
              {brands.map((brand) => (
                <SelectItem key={brand.id} value={brand.id} className="rounded-xl h-11 uppercase font-black text-[10px]">
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Gán vào Sản phẩm (Tùy chọn)</Label>
          <Select
            value={formData.productId || 'none'}
            onValueChange={(value) => setFormData({ ...formData, productId: value === 'none' ? undefined : value })}
            disabled={!isEditing && !isCreateMode}
          >
            <SelectTrigger className="h-14 rounded-2xl border-2 border-slate-100 bg-white px-6 focus:ring-0 shadow-sm font-black text-slate-900 uppercase tracking-tight">
              <SelectValue placeholder="Gán sản phẩm..." />
            </SelectTrigger>
            <SelectContent className="rounded-2xl p-1 shadow-2xl">
              <SelectItem value="none" className="rounded-xl h-11 uppercase font-black text-[10px]">Không gán sản phẩm</SelectItem>
              {filteredProducts.map((product) => (
                <SelectItem key={product.id} value={product.id} className="rounded-xl h-11 uppercase font-black text-[10px]">
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Tiêu đề Nội dung</Label>
        <div className="relative group">
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            disabled={!isEditing && !isCreateMode}
            placeholder="Ví dụ: Campaign Launch - Ultra Tech..."
            className="h-14 rounded-2xl border-2 border-slate-100 bg-white px-6 focus-visible:ring-slate-100 font-black text-slate-900 uppercase tracking-tight shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Phong cách Persona</Label>
          <Textarea
            value={formData.styleDescription || ''}
            onChange={(e) => setFormData({ ...formData, styleDescription: e.target.value })}
            disabled={!isEditing && !isCreateMode}
            placeholder="Hài hước, chuyên nghiệp, phá cách..."
            rows={2}
            className="rounded-2xl border-2 border-slate-100 bg-white p-4 focus-visible:ring-slate-100 font-medium text-slate-900 text-sm shadow-sm"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Bối cảnh xuất bản</Label>
          <Textarea
            value={formData.contextDescription || ''}
            onChange={(e) => setFormData({ ...formData, contextDescription: e.target.value })}
            disabled={!isEditing && !isCreateMode}
            placeholder="Mô tả bối cảnh hoặc chiến dịch liên quan..."
            rows={2}
            className="rounded-2xl border-2 border-slate-100 bg-white p-4 focus-visible:ring-slate-100 font-medium text-slate-900 text-sm shadow-sm"
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Loại hình truyền thông</Label>
        <div className="flex flex-wrap gap-3">
          {[
            { id: AdTypeEnum.TextOnly, label: 'Text Only', icon: FileText },
            { id: AdTypeEnum.ImageText, label: 'Image + Text', icon: ImageIcon },
            { id: AdTypeEnum.VideoText, label: 'Video + Text', icon: Video }
          ].map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFormData({ ...formData, adType: item.id })}
              disabled={!isEditing && !isCreateMode}
              className={cn(
                "flex-1 min-w-[140px] px-6 py-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-3",
                formData.adType === item.id
                  ? "border-slate-900 bg-slate-900 text-white shadow-lg"
                  : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200"
              )}
            >
              <item.icon className="size-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Nội dung Copywriting</Label>
        <div className="relative group">
          <div className="absolute top-4 right-4 p-2 opacity-10">
            <Zap className="size-10 text-slate-900" />
          </div>
          <Textarea
            value={formData.textContent || ''}
            onChange={(e) => setFormData({ ...formData, textContent: e.target.value })}
            disabled={!isEditing && !isCreateMode}
            placeholder="Nhập nội dung văn bản sẽ hiển thị trên bài viết..."
            rows={8}
            className="rounded-[2rem] border-2 border-slate-100 bg-white p-8 focus-visible:ring-slate-100 font-medium text-slate-900 text-base shadow-sm leading-relaxed"
          />
        </div>
      </div>

      {/* Media Asset Pool */}
      {(formData.adType === AdTypeEnum.ImageText || formData.adType === AdTypeEnum.VideoText) && (
        <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 space-y-6">
          <div className="flex items-center gap-3">
            <Upload className="size-4 text-slate-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Tài sản truyền thông đa phương tiện</span>
          </div>

          <div className="space-y-6">
            <input
              type="file"
              id="content-media"
              accept={formData.adType === AdTypeEnum.ImageText ? "image/*" : "video/*"}
              multiple={formData.adType === AdTypeEnum.ImageText}
              onChange={(e) => formData.adType === AdTypeEnum.ImageText ? onSelectImages(e.target.files) : onSelectVideo(e.target.files?.[0] || null)}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('content-media')?.click()}
              disabled={!isEditing && !isCreateMode}
              className="h-14 px-8 rounded-2xl border-slate-200 bg-white text-slate-900 font-black uppercase tracking-widest text-[10px] shadow-sm hover:bg-slate-50 transition-all active:scale-95"
            >
              {formData.adType === AdTypeEnum.ImageText ? <ImageIcon className="mr-3 size-4" /> : <Video className="mr-3 size-4" />}
              {formData.adType === AdTypeEnum.ImageText ? 'Tải lên Hình ảnh' : 'Tải lên Video'}
            </Button>

            {formData.adType === AdTypeEnum.ImageText && displayImageUrls.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                {displayImageUrls.map((src: string, i: number) => (
                  <div key={i} className="aspect-square relative rounded-xl overflow-hidden border-2 border-white shadow-md group/img">
                    <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform group-hover/img:scale-110 duration-500" />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                      <Check className="size-6 text-white" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {formData.adType === AdTypeEnum.VideoText && displayVideoUrl && (
              <div className="max-w-md rounded-2xl overflow-hidden border-4 border-white shadow-2xl bg-black">
                <video className="w-full aspect-video" controls src={displayVideoUrl} />
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Nhân vật đại diện (Brand Character)</Label>
        <Input
          value={formData.representativeCharacter || ''}
          onChange={(e) => setFormData({ ...formData, representativeCharacter: e.target.value })}
          disabled={!isEditing && !isCreateMode}
          placeholder="Tên nhân vật AI hoặc người đại diện..."
          className="h-14 rounded-2xl border-2 border-slate-100 bg-white px-6 focus-visible:ring-slate-100 font-black text-slate-900 uppercase tracking-tight shadow-sm"
        />
      </div>

      {showButtons && (
        <div className="flex flex-col sm:flex-row gap-4 pt-10 border-t border-slate-100">
          {(isEditing || isCreateMode) && (
            <Button
              onClick={handleSave}
              disabled={isProcessing || !formData.brandId}
              className="h-16 flex-[2] rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-slate-200 transition-all hover:-translate-y-1"
            >
              {isProcessing ? <Loader2 className="mr-3 size-5 animate-spin" /> : <Save className="mr-3 size-4" />}
              {isCreateMode ? 'Kiến tạo Nội dung' : 'Lưu Thay đổi'} <ChevronRight className="ml-2 size-5" />
            </Button>
          )}

          {content && content.status === ContentStatusEnum.Draft && onSubmit && !isEditing && canUseTeamFeatures && (
            <Button
              onClick={handleSubmit}
              disabled={isProcessing}
              className="h-16 flex-1 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-[11px] shadow-xl group"
            >
              <Send className="mr-3 size-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              Gửi phê duyệt
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

const Loader2 = ({ className }: { className?: string }) => (
  <svg className={cn("animate-spin", className)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

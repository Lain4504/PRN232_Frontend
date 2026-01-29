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
  FileText,
  Upload,
  Image as ImageIcon,
  Video,
  Check,
  ChevronRight,
  Loader2
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
    <div className={cn("space-y-6", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Thương hiệu</Label>
          <Select
            value={formData.brandId}
            onValueChange={(value) => setFormData({ ...formData, brandId: value, productId: undefined })}
            disabled={!isEditing && !isCreateMode}
          >
            <SelectTrigger className="h-11 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 rounded-xl font-bold text-slate-900 dark:text-white">
              <SelectValue placeholder="Chọn thương hiệu" />
            </SelectTrigger>
            <SelectContent>
              {brands.map((brand) => (
                <SelectItem key={brand.id} value={brand.id}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Sản phẩm (Tùy chọn)</Label>
          <Select
            value={formData.productId || 'none'}
            onValueChange={(value) => setFormData({ ...formData, productId: value === 'none' ? undefined : value })}
            disabled={!isEditing && !isCreateMode}
          >
            <SelectTrigger className="h-11 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 rounded-xl font-bold text-slate-900 dark:text-white">
              <SelectValue placeholder="Chọn sản phẩm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Không có</SelectItem>
              {filteredProducts.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Tiêu đề</Label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          disabled={!isEditing && !isCreateMode}
          placeholder="Nhập tiêu đề nội dung..."
          className="h-11 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 rounded-xl font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Loại bài viết</Label>
        <div className="flex flex-wrap gap-2">
          {[
            { id: AdTypeEnum.TextOnly, label: 'Văn bản', icon: FileText },
            { id: AdTypeEnum.ImageText, label: 'Ảnh + Văn bản', icon: ImageIcon },
            { id: AdTypeEnum.VideoText, label: 'Video + Văn bản', icon: Video }
          ].map(item => (
            <Button
              key={item.id}
              type="button"
              variant={formData.adType === item.id ? "default" : "outline"}
              onClick={() => setFormData({ ...formData, adType: item.id })}
              disabled={!isEditing && !isCreateMode}
              className={cn(
                "flex-1 min-w-[120px] h-11 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all",
                formData.adType === item.id
                  ? "bg-slate-900 dark:bg-primary text-white shadow-lg shadow-slate-200 dark:shadow-primary/20"
                  : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
            >
              <item.icon className="mr-2 size-4" />
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Nội dung bài viết</Label>
        <Textarea
          value={formData.textContent || ''}
          onChange={(e) => setFormData({ ...formData, textContent: e.target.value })}
          disabled={!isEditing && !isCreateMode}
          placeholder="Nhập nội dung chi tiết bài viết..."
          rows={6}
          className="resize-none bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 rounded-xl font-medium text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 p-4"
        />
      </div>

      {(formData.adType === AdTypeEnum.ImageText || formData.adType === AdTypeEnum.VideoText) && (
        <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 space-y-6">
          <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            <Upload className="size-4" />
            <span>Tệp phương tiện tác chiến</span>
          </div>

          <div className="space-y-4">
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
              size="sm"
              onClick={() => document.getElementById('content-media')?.click()}
              disabled={!isEditing && !isCreateMode}
              className="h-10 px-6 rounded-xl bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white font-black uppercase tracking-widest text-[9px] shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:-translate-y-0.5"
            >
              <Upload className="mr-2 size-3.5" />
              Tải lên {formData.adType === AdTypeEnum.ImageText ? 'hình ảnh' : 'video'}
            </Button>

            {formData.adType === AdTypeEnum.ImageText && displayImageUrls.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {displayImageUrls.map((src: string, i: number) => (
                  <div key={i} className="aspect-square relative rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-transform hover:scale-105 cursor-pointer">
                    <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            {formData.adType === AdTypeEnum.VideoText && displayVideoUrl && (
              <div className="max-w-xs rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-900 dark:bg-black shadow-xl">
                <video className="w-full aspect-video" controls src={displayVideoUrl} />
              </div>
            )}
          </div>
        </div>
      )}

      {showButtons && (
        <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-slate-100 dark:border-slate-800">
          {(isEditing || isCreateMode) && (
            <Button
              onClick={handleSave}
              disabled={isProcessing || !formData.brandId}
              className="flex-1 h-12 rounded-xl bg-slate-900 dark:bg-primary hover:bg-slate-800 dark:hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-slate-200 dark:shadow-primary/20 transition-all hover:-translate-y-1"
            >
              {isProcessing && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isCreateMode ? 'Khởi tạo nội dung' : 'Lưu lại thay đổi'}
            </Button>
          )}

          {content && content.status === ContentStatusEnum.Draft && onSubmit && !isEditing && canUseTeamFeatures && (
            <Button
              variant="outline"
              onClick={handleSubmit}
              disabled={isProcessing}
              className="flex-1 h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all hover:-translate-y-1"
            >
              <Send className="mr-3 size-4 opacity-50" />
              Gửi phê duyệt nội dung
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

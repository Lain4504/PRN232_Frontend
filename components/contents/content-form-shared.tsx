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
          <Label>Thương hiệu</Label>
          <Select
            value={formData.brandId}
            onValueChange={(value) => setFormData({ ...formData, brandId: value, productId: undefined })}
            disabled={!isEditing && !isCreateMode}
          >
            <SelectTrigger>
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
          <Label>Sản phẩm (Tùy chọn)</Label>
          <Select
            value={formData.productId || 'none'}
            onValueChange={(value) => setFormData({ ...formData, productId: value === 'none' ? undefined : value })}
            disabled={!isEditing && !isCreateMode}
          >
            <SelectTrigger>
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
        <Label>Tiêu đề</Label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          disabled={!isEditing && !isCreateMode}
          placeholder="Nhập tiêu đề nội dung..."
        />
      </div>

      <div className="space-y-2">
        <Label>Loại bài viết</Label>
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
              className="flex-1 min-w-[120px]"
            >
              <item.icon className="mr-2 size-4" />
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Nội dung bài viết</Label>
        <Textarea
          value={formData.textContent || ''}
          onChange={(e) => setFormData({ ...formData, textContent: e.target.value })}
          disabled={!isEditing && !isCreateMode}
          placeholder="Nhập nội dung chi tiết bài viết..."
          rows={6}
          className="resize-none"
        />
      </div>

      {(formData.adType === AdTypeEnum.ImageText || formData.adType === AdTypeEnum.VideoText) && (
        <div className="p-4 rounded-lg border bg-slate-50/50 space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <Upload className="size-4" />
            <span>Tệp đính kèm</span>
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
            >
              <Upload className="mr-2 size-4" />
              Tải lên {formData.adType === AdTypeEnum.ImageText ? 'ảnh' : 'video'}
            </Button>

            {formData.adType === AdTypeEnum.ImageText && displayImageUrls.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {displayImageUrls.map((src: string, i: number) => (
                  <div key={i} className="aspect-square relative rounded-md overflow-hidden border bg-white">
                    <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            {formData.adType === AdTypeEnum.VideoText && displayVideoUrl && (
              <div className="max-w-xs rounded-md overflow-hidden border bg-black">
                <video className="w-full aspect-video" controls src={displayVideoUrl} />
              </div>
            )}
          </div>
        </div>
      )}

      {showButtons && (
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
          {(isEditing || isCreateMode) && (
            <Button
              onClick={handleSave}
              disabled={isProcessing || !formData.brandId}
              className="flex-1"
            >
              {isProcessing && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isCreateMode ? 'Tạo nội dung' : 'Lưu thay đổi'}
            </Button>
          )}

          {content && content.status === ContentStatusEnum.Draft && onSubmit && !isEditing && canUseTeamFeatures && (
            <Button
              variant="outline"
              onClick={handleSubmit}
              disabled={isProcessing}
              className="flex-1"
            >
              <Send className="mr-2 size-4" />
              Gửi phê duyệt
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

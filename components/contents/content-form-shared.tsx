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
  Loader2,
  Plus
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-muted-foreground">Định danh Thương hiệu</Label>
          <Select
            value={formData.brandId}
            onValueChange={(value) => setFormData({ ...formData, brandId: value, productId: undefined })}
            disabled={!isEditing && !isCreateMode}
          >
            <SelectTrigger className="h-10 bg-card border-border rounded-md px-4 focus:ring-0 shadow-sm font-medium text-foreground">
              <SelectValue placeholder="Chọn thương hiệu" />
            </SelectTrigger>
            <SelectContent className="rounded-md border-border shadow-lg p-1">
              {brands.map((brand) => (
                <SelectItem key={brand.id} value={brand.id} className="rounded-sm h-10 font-medium text-sm focus:bg-accent">
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-muted-foreground">Sản phẩm liên kết (Tùy chọn)</Label>
          <Select
            value={formData.productId || 'none'}
            onValueChange={(value) => setFormData({ ...formData, productId: value === 'none' ? undefined : value })}
            disabled={!isEditing && !isCreateMode}
          >
            <SelectTrigger className="h-10 bg-card border-border rounded-md px-4 focus:ring-0 shadow-sm font-medium text-foreground">
              <SelectValue placeholder="Chọn sản phẩm" />
            </SelectTrigger>
            <SelectContent className="rounded-md border-border shadow-lg p-1">
              <SelectItem value="none" className="rounded-sm h-10 font-medium text-sm focus:bg-accent text-muted-foreground">Không có sản phẩm</SelectItem>
              {filteredProducts.map((product) => (
                <SelectItem key={product.id} value={product.id} className="rounded-sm h-10 font-medium text-sm focus:bg-accent">
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold text-muted-foreground">Tiêu đề bài viết bản sắc</Label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          disabled={!isEditing && !isCreateMode}
          placeholder="Nhập tiêu đề thu hút..."
          className="h-10 bg-card border-border rounded-md px-4 focus-visible:ring-primary font-medium text-foreground shadow-sm placeholder:text-muted-foreground/50 transition-all"
        />
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-semibold text-muted-foreground">Định dạng Truyền thông</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: AdTypeEnum.TextOnly, label: 'Chỉ văn bản', icon: FileText },
            { id: AdTypeEnum.ImageText, label: 'Ảnh & Văn bản', icon: ImageIcon },
            { id: AdTypeEnum.VideoText, label: 'Video & Văn bản', icon: Video }
          ].map(item => (
            <Button
              key={item.id}
              type="button"
              variant={formData.adType === item.id ? "default" : "outline"}
              onClick={() => setFormData({ ...formData, adType: item.id })}
              disabled={!isEditing && !isCreateMode}
              className={cn(
                "h-10 rounded-md font-bold text-xs transition-all border shadow-sm",
                formData.adType === item.id
                  ? "bg-primary text-primary-foreground border-transparent ring-1 ring-primary/20"
                  : "bg-card border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="mr-2 size-4" />
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold text-muted-foreground">Ma trận Nội dung chi tiết</Label>
        <Textarea
          value={formData.textContent || ''}
          onChange={(e) => setFormData({ ...formData, textContent: e.target.value })}
          disabled={!isEditing && !isCreateMode}
          placeholder="Viết nội dung truyền thông đỉnh cao của bạn tại đây..."
          rows={8}
          className="resize-none bg-card border-border rounded-md font-medium text-foreground placeholder:text-muted-foreground/40 p-5 focus-visible:ring-primary shadow-sm leading-relaxed"
        />
      </div>

      {(formData.adType === AdTypeEnum.ImageText || formData.adType === AdTypeEnum.VideoText) && (
        <div className="p-6 rounded-lg border border-border bg-muted/20 space-y-6">
          <div className="flex items-center gap-3 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
            <Upload className="size-4 text-primary" />
            <span>Tài nguyên Phương tiện bài viết</span>
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
              className="h-10 px-6 rounded-md bg-card border-border text-foreground font-bold uppercase tracking-wider text-[10px] shadow-sm hover:bg-muted transition-all"
            >
              <Plus className="mr-2 size-4" />
              Tải lên {formData.adType === AdTypeEnum.ImageText ? 'tập ảnh' : 'video'}
            </Button>

            {formData.adType === AdTypeEnum.ImageText && displayImageUrls.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                {displayImageUrls.map((src: string, i: number) => (
                  <div key={i} className="aspect-square relative rounded-lg overflow-hidden border border-border bg-card shadow-sm group/media cursor-pointer hover:border-primary/50 transition-all">
                    <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform group-hover/media:scale-110" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/media:opacity-100 transition-opacity flex items-center justify-center">
                      <Check className="size-6 text-white" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {formData.adType === AdTypeEnum.VideoText && displayVideoUrl && (
              <div className="max-w-md rounded-lg overflow-hidden border border-border bg-card shadow-lg mx-auto sm:mx-0">
                <video className="w-full aspect-video" controls src={displayVideoUrl} />
              </div>
            )}
          </div>
        </div>
      )}

      {showButtons && (
        <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-border mt-8">
          {(isEditing || isCreateMode) && (
            <Button
              onClick={handleSave}
              disabled={isProcessing || !formData.brandId}
              className="flex-1 h-12 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-lg transition-all border-none"
            >
              {isProcessing && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isCreateMode ? 'Khởi tạo nội dung ngay' : 'Lưu lại mọi thay đổi'}
            </Button>
          )}

          {content && content.status === ContentStatusEnum.Draft && onSubmit && !isEditing && canUseTeamFeatures && (
            <Button
              variant="outline"
              onClick={handleSubmit}
              disabled={isProcessing}
              className="flex-1 h-12 rounded-md border-border bg-card text-foreground font-bold text-sm hover:bg-muted shadow-sm transition-all"
            >
              <Send className="mr-3 size-4 opacity-50 text-primary" />
              Gửi phê duyệt chiến lược
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  X,
  Plus,
  ChevronRight
} from "lucide-react";
import {
  ContentResponseDto,
  CreateContentRequest,
  UpdateContentRequest,
  ContentStatusEnum,
  AdTypeEnum
} from "@/lib/types/omniadly-types";
import { api, endpoints } from "@/lib/api";
import { ProfileContentForm } from "./content-form-profile";
import { TeamContentForm } from "./content-form-team";
import { useProfile } from "@/lib/contexts/profile-context";
import { ProfileTypeEnum } from "@/lib/utils/profile-utils";
import { cn } from "@/lib/utils";

interface ContentModalProps {
  content?: ContentResponseDto | null;
  isEditing?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (data: UpdateContentRequest) => Promise<void>;
  onCreate?: (data: CreateContentRequest) => Promise<void>;
  onSubmit?: (contentId: string) => Promise<void>;
  isProcessing?: boolean;
  brands?: Array<{ id: string; name: string }>;
  products?: Array<{ id: string; name: string; brandId: string }>;
  teamId?: string;
  userId?: string;
  showButtons?: boolean;
  defaultBrandId?: string;
}

export function ContentModal({
  content,
  isEditing = false,
  open,
  onOpenChange,
  onSave,
  onCreate,
  onSubmit,
  isProcessing = false,
  brands = [],
  products = [],
  teamId,
  userId = 'current-user-id',
  showButtons = true,
  defaultBrandId
}: ContentModalProps) {
  const { profileType } = useProfile();
  const canUseTeamFeatures = profileType !== ProfileTypeEnum.Free;
  const [formData, setFormData] = useState<CreateContentRequest>({
    brandId: '',
    productId: undefined,
    adType: AdTypeEnum.TextOnly,
    title: '',
    textContent: '',
    imageUrl: undefined,
    videoUrl: undefined,
    publishImmediately: false,
    integrationId: undefined,
  });

  const isCreateMode = !content;
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

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

  const parseImageUrlToArray = (value: unknown): string[] => {
    if (value == null) return [];
    if (Array.isArray(value)) return value.filter((v): v is string => typeof v === 'string' && !!v);
    if (typeof value === 'string') {
      const trimmed = value.trim();
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

  useEffect(() => {
    if (content) {
      setFormData({
        brandId: content.brandId,
        productId: content.productId || undefined,
        adType: parseAdType(content.adType),
        title: content.title || '',
        textContent: content.textContent || '',
        imageUrl: content.imageUrl || undefined,
        videoUrl: content.videoUrl || undefined,
        publishImmediately: false,
        integrationId: undefined,
      });
      setImageFiles([]);
      setImagePreviews([]);
      setVideoFile(null);
      setVideoPreview(null);
    } else {
      setFormData({
        brandId: '',
        productId: undefined,
        adType: AdTypeEnum.TextOnly,
        title: '',
        textContent: '',
        imageUrl: undefined,
        videoUrl: undefined,
        publishImmediately: false,
        integrationId: undefined,
      });
      setImageFiles([]);
      setImagePreviews([]);
      setVideoFile(null);
      setVideoPreview(null);
    }
  }, [content]);

  useEffect(() => {
    if (formData.adType === AdTypeEnum.TextOnly) {
      setImageFiles([]);
      setImagePreviews([]);
      setVideoFile(null);
      setVideoPreview(null);
      setFormData((prev) => ({ ...prev, imageUrl: undefined, videoUrl: undefined }));
    } else if (formData.adType === AdTypeEnum.ImageText) {
      setVideoFile(null);
      setVideoPreview(null);
      setFormData((prev) => ({ ...prev, videoUrl: undefined }));
    } else if (formData.adType === AdTypeEnum.VideoText) {
      setImageFiles([]);
      setImagePreviews([]);
      setFormData((prev) => ({ ...prev, imageUrl: undefined }));
    }
  }, [formData.adType]);

  const uploadToPublic = async (file: File): Promise<string> => {
    const fd = new FormData();
    const fileType = file.type || (file.name.toLowerCase().endsWith('.mp4') ? 'video/mp4' : '');
    const fileWithType = fileType && file.type !== fileType ? new File([file], file.name, { type: fileType }) : file;
    fd.append('file', fileWithType);
    const bucketName = 'ContentMedia';
    const resp = await api.postForm<{ url: string }>(endpoints.storageUpload(bucketName), fd);
    return resp.data.url || '';
  };

  const handleSave = async () => {
    if (isCreateMode && onCreate) {
      let uploadedImageUrls: string[] = [];
      if (imageFiles.length > 0) uploadedImageUrls = await Promise.all(imageFiles.map(uploadToPublic));
      let videoUrl: string | undefined = undefined;
      if (videoFile) videoUrl = await uploadToPublic(videoFile);

      const payload: CreateContentRequest = {
        ...formData,
        imageUrl: (() => {
          const existing = parseImageUrlToArray(formData.imageUrl as unknown);
          const combined = Array.from(new Set([...existing, ...uploadedImageUrls].filter(Boolean)));
          return combined.length > 0 ? JSON.stringify(combined) : formData.imageUrl;
        })(),
        videoUrl: videoUrl || formData.videoUrl,
      };
      await onCreate(payload);
    } else if (content && onSave) {
      const updateData: UpdateContentRequest = {
        title: formData.title,
        textContent: formData.textContent,
        adType: formData.adType,
        productId: formData.productId,
        imageUrl: formData.imageUrl,
        videoUrl: formData.videoUrl,
      };
      if (imageFiles.length > 0) {
        const urls = await Promise.all(imageFiles.map(uploadToPublic));
        const existing = parseImageUrlToArray(formData.imageUrl as unknown);
        const combined = Array.from(new Set([...existing, ...urls].filter(Boolean)));
        updateData.imageUrl = JSON.stringify(combined);
      }
      if (videoFile) updateData.videoUrl = await uploadToPublic(videoFile);
      await onSave(updateData);
    }
  };

  const handleSelectImages = async (files: FileList | null) => {
    if (!files) return;
    const list = Array.from(files);
    setImageFiles(list);
    const previews = await Promise.all(list.map(f => new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(f);
    })));
    setImagePreviews(previews);
  };

  const handleSelectVideo = async (file: File | null) => {
    if (!file) { setVideoFile(null); setVideoPreview(null); return; }
    setVideoFile(file);
    const reader = new FileReader();
    reader.onload = () => setVideoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Draft': return 'Nháp';
      case 'PendingApproval': return 'Chờ phê duyệt';
      case 'Approved': return 'Đã phê duyệt';
      case 'Published': return 'Đã xuất bản';
      case 'Rejected': return 'Bị từ chối';
      default: return status;
    }
  };

  const statusBadge = content ? (
    <Badge variant="outline" className="font-medium">
      {getStatusLabel(content.status)}
    </Badge>
  ) : null;

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 border-b flex-row items-center justify-between space-y-0">
            <div>
              <DialogTitle className="text-xl font-bold">
                {isCreateMode ? 'Tạo nội dung mới' : 'Chỉnh sửa nội dung'}
              </DialogTitle>
              <DialogDescription>
                {isCreateMode ? 'Khởi tạo nội dung quảng cáo cho thương hiệu của bạn.' : 'Cập nhật thông tin chi tiết của nội dung.'}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-3">
              {statusBadge}
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
            {teamId ? (
              <TeamContentForm
                formData={formData}
                setFormData={setFormData}
                content={content ?? null}
                isEditing={isEditing}
                isCreateMode={isCreateMode}
                handleSave={handleSave}
                handleSubmit={async () => { if (content && onSubmit) await onSubmit(content.id) }}
                isProcessing={isProcessing}
                onSubmit={onSubmit}
                showButtons={showButtons}
                onSelectImages={handleSelectImages}
                onSelectVideo={handleSelectVideo}
                imagePreviews={imagePreviews}
                videoPreview={videoPreview}
                teamId={teamId}
                defaultBrandId={defaultBrandId}
              />
            ) : (
              <ProfileContentForm
                formData={formData}
                setFormData={setFormData}
                content={content ?? null}
                isEditing={isEditing}
                isCreateMode={isCreateMode}
                brands={brands}
                products={products}
                handleSave={handleSave}
                handleSubmit={async () => { if (content && onSubmit) await onSubmit(content.id) }}
                isProcessing={isProcessing}
                onSubmit={onSubmit}
                showButtons={showButtons}
                onSelectImages={handleSelectImages}
                onSelectVideo={handleSelectVideo}
                imagePreviews={imagePreviews}
                videoPreview={videoPreview}
                defaultBrandId={defaultBrandId}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[95vh] flex flex-col">
        <DrawerHeader className="text-left border-b">
          <div className="flex items-center justify-between mb-2">
            <DrawerTitle className="text-xl font-bold">
              {isCreateMode ? 'Tạo nội dung' : 'Chỉnh sửa nội dung'}
            </DrawerTitle>
            {statusBadge}
          </div>
          <DrawerDescription>
            {isCreateMode ? 'Khởi tạo nội dung mới.' : 'Cập nhật thông tin.'}
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto p-4">
          {teamId ? (
            <TeamContentForm
              formData={formData}
              setFormData={setFormData}
              content={content ?? null}
              isEditing={isEditing}
              isCreateMode={isCreateMode}
              handleSave={handleSave}
              handleSubmit={async () => { if (content && onSubmit) await onSubmit(content.id); else return Promise.resolve(); }}
              isProcessing={isProcessing}
              onSubmit={onSubmit}
              showButtons={false}
              onSelectImages={handleSelectImages}
              onSelectVideo={handleSelectVideo}
              imagePreviews={imagePreviews}
              videoPreview={videoPreview}
              teamId={teamId}
              defaultBrandId={defaultBrandId}
            />
          ) : (
            <ProfileContentForm
              formData={formData}
              setFormData={setFormData}
              content={content ?? null}
              isEditing={isEditing}
              isCreateMode={isCreateMode}
              brands={brands}
              products={products}
              handleSave={handleSave}
              handleSubmit={async () => { if (content && onSubmit) await onSubmit(content.id); else return Promise.resolve(); }}
              isProcessing={isProcessing}
              onSubmit={onSubmit}
              showButtons={false}
              onSelectImages={handleSelectImages}
              onSelectVideo={handleSelectVideo}
              imagePreviews={imagePreviews}
              videoPreview={videoPreview}
              defaultBrandId={defaultBrandId}
            />
          )}
        </div>
        <DrawerFooter className="border-t p-4">
          <div className="flex flex-col gap-2">
            {(isEditing || isCreateMode) && (
              <Button
                onClick={handleSave}
                disabled={isProcessing || !formData.brandId}
                className="w-full"
              >
                {isCreateMode ? 'Tạo nội dung' : 'Lưu thay đổi'}
              </Button>
            )}
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

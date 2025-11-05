"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { 
  Save, 
  Send
} from "lucide-react";
import { 
  ContentResponseDto, 
  CreateContentRequest, 
  UpdateContentRequest, 
  ContentStatusEnum, 
  AdTypeEnum 
} from "@/lib/types/aisam-types";
import { api, endpoints } from "@/lib/api";
import { ProfileContentForm } from "./content-form-profile";
import { TeamContentForm } from "./content-form-team";

interface ContentModalProps {
  content?: ContentResponseDto | null; // Optional - if null, it's create mode
  isEditing?: boolean; // If true, editing existing content
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (data: UpdateContentRequest) => Promise<void>;
  onCreate?: (data: CreateContentRequest) => Promise<void>;
  onSubmit?: (contentId: string) => Promise<void>;
  isProcessing?: boolean;
  brands?: Array<{ id: string; name: string }>; // Optional: pass brands from parent (for profile context)
  products?: Array<{ id: string; name: string; brandId: string }>; // Optional: pass products from parent (for profile context)
  teamId?: string; // Optional: if provided, use TeamContentForm instead of ProfileContentForm
  userId?: string;
  showButtons?: boolean;
  defaultBrandId?: string; // Optional: default brand ID for create mode
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
  const [formData, setFormData] = useState<CreateContentRequest>({
    brandId: '',
    productId: undefined,
    adType: AdTypeEnum.TextOnly,
    title: '',
    textContent: '',
    imageUrl: undefined,
    videoUrl: undefined,
    styleDescription: undefined,
    contextDescription: undefined,
    representativeCharacter: undefined,
    publishImmediately: false,
    integrationId: undefined,
  });

  const isCreateMode = !content;
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Local state for media uploads
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  // Helper function to convert adType string to enum
  const parseAdType = (adType: string | number | AdTypeEnum): AdTypeEnum => {
    if (typeof adType === 'number') {
      return adType as AdTypeEnum;
    }
    if (typeof adType === 'string') {
      const normalized = adType.toLowerCase().replace(/_/g, '');
      if (normalized === 'textonly') return AdTypeEnum.TextOnly;
      if (normalized === 'imagetext' || normalized === 'image+text') return AdTypeEnum.ImageText;
      if (normalized === 'videotext' || normalized === 'video+text') return AdTypeEnum.VideoText;
    }
    return AdTypeEnum.TextOnly; // Default fallback
  };

  // Helper to parse imageUrl field into array (supports array, JSON string, double-encoded, or single string)
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
        styleDescription: content.styleDescription || undefined,
        contextDescription: content.contextDescription || undefined,
        representativeCharacter: content.representativeCharacter || undefined,
        publishImmediately: false,
        integrationId: undefined,
      });
      setImageFiles([]);
      setImagePreviews([]);
      setVideoFile(null);
      setVideoPreview(null);
    } else {
      // Reset form for create mode
      setFormData({
        brandId: '',
        productId: undefined,
        adType: AdTypeEnum.TextOnly,
        title: '',
        textContent: '',
        imageUrl: undefined,
        videoUrl: undefined,
        styleDescription: undefined,
        contextDescription: undefined,
        representativeCharacter: undefined,
        publishImmediately: false,
        integrationId: undefined,
      });
      setImageFiles([]);
      setImagePreviews([]);
      setVideoFile(null);
      setVideoPreview(null);
    }
  }, [content, userId]);

  // Reset incompatible media fields when switching ad type
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

  // Ensure global body remains interactive when dialog/drawer is open
  useEffect(() => {
    if (typeof document === 'undefined') return;
    // Capture previous styles to restore later
    const previousPointerEvents = document.body.style.pointerEvents;
    const previousCursor = document.body.style.cursor;
    // Force-enable interactions/cursor in case any scroll-lock library disables them
    document.body.style.pointerEvents = 'auto';
    document.body.style.cursor = 'auto';
    return () => {
      document.body.style.pointerEvents = previousPointerEvents;
      document.body.style.cursor = previousCursor;
    };
  }, [open]);

  // Upload file to ContentMedia bucket (NOT 'public' - use 'contentmedia')
  const uploadToPublic = async (file: File): Promise<string> => {
    const fd = new FormData();
    // Ensure content-type is set correctly for video files
    // Some browsers may not set content-type automatically
    const fileType = file.type || (file.name.toLowerCase().endsWith('.mp4') ? 'video/mp4' : 
                                   file.name.toLowerCase().endsWith('.mov') ? 'video/quicktime' :
                                   file.name.toLowerCase().endsWith('.avi') ? 'video/x-msvideo' :
                                   file.name.toLowerCase().endsWith('.webm') ? 'video/webm' :
                                   file.name.toLowerCase().endsWith('.mpeg') ? 'video/mpeg' : '');
    
    // Create a new File with explicit type if needed
    const fileWithType = fileType && file.type !== fileType ? new File([file], file.name, { type: fileType }) : file;
    fd.append('file', fileWithType);
    
    // IMPORTANT: Use ContentMedia bucket (matches DefaultBucketEnum.ContentMedia)
    const bucketName = 'ContentMedia';
    const resp = await api.postForm<{ url: string }>(endpoints.storageUpload(bucketName), fd);
    // Backend returns { data: { url } } shape
    // @ts-expect-error - Response shape may vary
    return (resp.data?.url) || (resp.data?.data?.url) || '';
  };

  const handleSave = async () => {
    if (isCreateMode && onCreate) {
      // Upload files if provided
      let uploadedImageUrls: string[] = [];
      if (imageFiles.length > 0) {
        uploadedImageUrls = await Promise.all(imageFiles.map(uploadToPublic));
      }
      let videoUrl: string | undefined = undefined;
      if (videoFile) {
        videoUrl = await uploadToPublic(videoFile);
      }

      const payload: CreateContentRequest = {
        ...formData,
        imageUrl: (() => {
          const existing = parseImageUrlToArray(formData.imageUrl as unknown);
          const combined = Array.from(new Set([...
            existing,
            ...uploadedImageUrls
          ].filter(Boolean)));
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
        styleDescription: formData.styleDescription,
        contextDescription: formData.contextDescription,
        representativeCharacter: formData.representativeCharacter,
      };

      // If user selected new images, upload and append to existing
      if (imageFiles.length > 0) {
        const urls = await Promise.all(imageFiles.map(uploadToPublic));
        const existing = parseImageUrlToArray(formData.imageUrl as unknown);
        const combined = Array.from(new Set([...
          existing,
          ...urls
        ].filter(Boolean)));
        updateData.imageUrl = JSON.stringify(combined);
      }
      if (videoFile) {
        const url = await uploadToPublic(videoFile);
        updateData.videoUrl = url;
      }
      await onSave(updateData);
    }
  };

  const handleSubmit = async () => {
    if (content && onSubmit) {
      await onSubmit(content.id);
    }
  };

  const getStatusBadge = (status: ContentStatusEnum) => {
    switch (status) {
      case ContentStatusEnum.Draft:
        return <Badge variant="secondary">Draft</Badge>;
      case ContentStatusEnum.PendingApproval:
        return <Badge variant="outline" className="border-chart-4 text-chart-4">Pending Approval</Badge>;
      case ContentStatusEnum.Approved:
        return <Badge variant="default" className="bg-chart-2">Approved</Badge>;
      case ContentStatusEnum.Rejected:
        return <Badge variant="destructive">Rejected</Badge>;
      case ContentStatusEnum.Published:
        return <Badge variant="default" className="bg-green-600">Published</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
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

  if (isDesktop) {
  return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl w-[90vw] max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <div className="flex items-center gap-3">
            <DialogTitle className="text-lg font-bold">
              {isCreateMode ? 'Create Content' : 'Edit Content'}
            </DialogTitle>
            {content && getStatusBadge(content.status)}
          </div>
          <DialogDescription>
              {isCreateMode ? 'Create new content for your brand' : 'Edit your content'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            {teamId ? (
              <TeamContentForm
                formData={formData}
                setFormData={setFormData}
                content={content ?? null}
                isEditing={isEditing}
                isCreateMode={isCreateMode}
                handleSave={handleSave}
                handleSubmit={handleSubmit}
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
                handleSubmit={handleSubmit}
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
      <DrawerContent className="max-h-[90vh] flex flex-col">
        <DrawerHeader className="flex-shrink-0">
          <div className="flex items-center gap-3">
            <DrawerTitle className="text-lg font-bold">
              {isCreateMode ? 'Create Content' : 'Edit Content'}
            </DrawerTitle>
            {content && getStatusBadge(content.status)}
          </div>
          <DrawerDescription>
              {isCreateMode ? 'Create new content for your brand' : 'Edit your content'}
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto">
            {teamId ? (
              <TeamContentForm
                formData={formData}
                setFormData={setFormData}
                content={content ?? null}
                isEditing={isEditing}
                isCreateMode={isCreateMode}
                handleSave={handleSave}
                handleSubmit={handleSubmit}
                isProcessing={isProcessing}
                onSubmit={onSubmit}
                className="px-4"
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
                handleSubmit={handleSubmit}
                isProcessing={isProcessing}
                onSubmit={onSubmit}
                className="px-4"
                showButtons={false}
                onSelectImages={handleSelectImages}
                onSelectVideo={handleSelectVideo}
                imagePreviews={imagePreviews}
                videoPreview={videoPreview}
                defaultBrandId={defaultBrandId}
              />
            )}
          </div>
        <DrawerFooter className="flex-shrink-0">
          <div className="flex flex-col gap-2">
            {(isEditing || isCreateMode) && (
              <Button
                onClick={handleSave}
                disabled={isProcessing || !formData.brandId}
                className="w-full"
              >
                <Save className="mr-2 h-4 w-4" />
                {isCreateMode ? 'Create Content' : 'Save Changes'}
              </Button>
            )}
            
            {content && content.status === ContentStatusEnum.Draft && onSubmit && !isEditing && (
              <Button
                onClick={handleSubmit}
                disabled={isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Send className="mr-2 h-4 w-4" />
                Submit for Approval
              </Button>
            )}
            
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
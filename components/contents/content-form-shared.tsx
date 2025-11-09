"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Save, 
  Send
} from "lucide-react";
import { 
  ContentResponseDto, 
  CreateContentRequest, 
  ContentStatusEnum, 
  AdTypeEnum 
} from "@/lib/types/aisam-types";
import { useProfile } from "@/lib/contexts/profile-context";
import { ProfileTypeEnum } from "@/lib/utils/profile-utils";

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
  // Derive preview sources from existing content if user hasn't selected new media
  const existingImageUrls = React.useMemo(() => {
    const normalize = (val: unknown): string[] => {
      if (val == null) return [];
      if (Array.isArray(val)) return val.filter((v): v is string => typeof v === 'string' && !!v);
      if (typeof val === 'string') {
        const trimmed = val.trim();
        if (!trimmed || trimmed.toLowerCase() === 'null' || trimmed.toLowerCase() === 'undefined') return [];
        // Try up to two JSON parses to handle double-encoded strings
        let current: unknown = trimmed;
        for (let i = 0; i < 2; i++) {
          try {
            const parsed = JSON.parse(current as string);
            if (Array.isArray(parsed)) return parsed.filter(Boolean);
            if (typeof parsed === 'string') {
              current = parsed;
              continue;
            }
            // Fallback if parsed to non-string/array
            break;
          } catch {
            break;
          }
        }
        // If we reach here, treat as single URL string
        return [trimmed];
      }
      return [];
    };
    return normalize(formData.imageUrl as unknown);
  }, [formData.imageUrl]);

  // For multi-upload, show existing images plus any newly selected previews
  const displayImageUrls = React.useMemo(() => {
    return [...existingImageUrls, ...imagePreviews];
  }, [existingImageUrls, imagePreviews]);
  
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
          if (typeof parsed === 'string' && parsed) {
            current = parsed;
            continue;
          }
          break;
        } catch {
          break;
        }
      }
      return typeof current === 'string' ? current : null;
    }
    return null;
  }, [videoPreview, formData.videoUrl]);

  const filteredProducts = products.filter(p => p.brandId === formData.brandId);

  return (
    <div className={`space-y-4 pb-4 ${className || ''}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="brand" className="text-sm font-medium">Brand</Label>
          <Select
            value={formData.brandId}
            onValueChange={(value) => setFormData({ ...formData, brandId: value, productId: undefined })}
            disabled={!isEditing && !isCreateMode}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select a brand" />
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
          <Label htmlFor="product" className="text-sm font-medium">Product (Optional)</Label>
          <Select
            value={formData.productId || 'none'}
            onValueChange={(value) => setFormData({ ...formData, productId: value === 'none' ? undefined : value })}
            disabled={!isEditing && !isCreateMode}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="No product" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No product</SelectItem>
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
        <Label htmlFor="title" className="text-sm font-medium">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          disabled={!isEditing && !isCreateMode}
          placeholder="Enter content title"
          className="h-9"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="styleDescription" className="text-sm font-medium">Style Description</Label>
        <Textarea
          id="styleDescription"
          value={formData.styleDescription || ''}
          onChange={(e) => setFormData({ ...formData, styleDescription: e.target.value })}
          disabled={!isEditing && !isCreateMode}
          placeholder="Describe the style and tone for this content"
          rows={2}
          className="text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contextDescription" className="text-sm font-medium">Context Description</Label>
        <Textarea
          id="contextDescription"
          value={formData.contextDescription || ''}
          onChange={(e) => setFormData({ ...formData, contextDescription: e.target.value })}
          disabled={!isEditing && !isCreateMode}
          placeholder="Provide context about this content"
          rows={2}
          className="text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="adType" className="text-sm font-medium">Ad Type</Label>
        <Select
          value={formData.adType.toString()}
          onValueChange={(value) => setFormData({ ...formData, adType: parseInt(value) as AdTypeEnum })}
          disabled={!isEditing && !isCreateMode}
        >
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={AdTypeEnum.TextOnly.toString()}>
              Text Only
            </SelectItem>
            <SelectItem value={AdTypeEnum.ImageText.toString()}>
              Image + Text
            </SelectItem>
            <SelectItem value={AdTypeEnum.VideoText.toString()}>
              Video + Text
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="textContent" className="text-sm font-medium">Content</Label>
        <Textarea
          id="textContent"
          value={formData.textContent || ''}
          onChange={(e) => setFormData({ ...formData, textContent: e.target.value })}
          disabled={!isEditing && !isCreateMode}
          placeholder="Enter your content text"
          rows={6}
          className="text-sm"
        />
      </div>

      {/* Media uploads by Ad Type */}
      {formData.adType === AdTypeEnum.ImageText && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Images</Label>
          <Input type="file" accept="image/*" multiple onChange={(e) => onSelectImages(e.target.files)} />
          {displayImageUrls.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
              {displayImageUrls.map((src: string, i: number) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={src} alt="Preview" className="w-full h-24 object-cover rounded" />
              ))}
            </div>
          )}
        </div>
      )}

      {formData.adType === AdTypeEnum.VideoText && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Video</Label>
          <Input type="file" accept="video/*" onChange={(e) => onSelectVideo(e.target.files?.[0] || null)} />
          {displayVideoUrl && (
            <video className="w-full h-48 rounded" controls src={displayVideoUrl} />
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="representativeCharacter" className="text-sm font-medium">Representative Character</Label>
        <Input
          id="representativeCharacter"
          value={formData.representativeCharacter || ''}
          onChange={(e) => setFormData({ ...formData, representativeCharacter: e.target.value })}
          disabled={!isEditing && !isCreateMode}
          placeholder="Character or persona for this content"
          className="h-9"
        />
      </div>

      {content && !isEditing && (
        <div className="space-y-4 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Created</Label>
              <p>{new Date(content.createdAt).toLocaleString()}</p>
            </div>
            {content.updatedAt && (
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Updated</Label>
                <p>{new Date(content.updatedAt).toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {showButtons && (
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          {(isEditing || isCreateMode) && (
            <Button
              onClick={handleSave}
              disabled={isProcessing || !formData.brandId}
              className="flex-1 min-w-[120px] h-9 text-sm"
            >
              <Save className="mr-2 h-4 w-4" />
              {isCreateMode ? 'Create Content' : 'Save Changes'}
            </Button>
          )}
          
          {/* Submit for Approval only available for Basic/Pro profiles (team features) */}
          {content && content.status === ContentStatusEnum.Draft && onSubmit && !isEditing && canUseTeamFeatures && (
            <Button
              onClick={handleSubmit}
              disabled={isProcessing}
              className="flex-1 min-w-[120px] h-9 text-sm bg-blue-600 hover:bg-blue-700"
            >
              <Send className="mr-2 h-4 w-4" />
              Submit for Approval
            </Button>
          )}
        </div>
      )}
    </div>
  );
}


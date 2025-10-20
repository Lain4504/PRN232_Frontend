"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  X, 
  Save, 
  Send, 
  Share, 
  Image, 
  Video, 
  FileText 
} from "lucide-react";
import { 
  ContentResponseDto, 
  CreateContentRequest, 
  UpdateContentRequest, 
  ContentStatusEnum, 
  AdTypeEnum 
} from "@/lib/types/aisam-types";

interface ContentModalProps {
  content: ContentResponseDto | null;
  isEditing?: boolean;
  onClose: () => void;
  onSave?: (data: UpdateContentRequest) => Promise<void>;
  onCreate?: (data: CreateContentRequest) => Promise<void>;
  onSubmit?: (contentId: string) => Promise<void>;
  onPublish?: (contentId: string, integrationId: string) => Promise<void>;
  isProcessing?: boolean;
  brands?: Array<{ id: string; name: string }>;
  products?: Array<{ id: string; name: string; brandId: string }>;
  userId?: string;
}

export function ContentModal({ 
  content, 
  isEditing = false,
  onClose, 
  onSave, 
  onCreate,
  onSubmit, 
  onPublish,
  isProcessing = false,
  brands = [],
  products = [],
  userId = 'current-user-id'
}: ContentModalProps) {
  const [formData, setFormData] = useState<CreateContentRequest>({
    userId,
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

  useEffect(() => {
    if (content) {
      setFormData({
        userId,
        brandId: content.brandId,
        productId: content.productId || undefined,
        adType: content.adType,
        title: content.title || '',
        textContent: content.textContent || '',
        imageUrl: content.imageUrl || undefined,
        videoUrl: content.videoUrl || undefined,
        styleDescription: undefined,
        contextDescription: undefined,
        representativeCharacter: undefined,
        publishImmediately: false,
        integrationId: undefined,
      });
    } else {
      // Reset form for create mode
      setFormData({
        userId,
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
    }
  }, [content, userId]);

  const handleSave = async () => {
    if (isCreateMode && onCreate) {
      await onCreate(formData);
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
      await onSave(updateData);
    }
  };

  const handleSubmit = async () => {
    if (content && onSubmit) {
      await onSubmit(content.id);
    }
  };

  const handlePublish = async () => {
    if (content && onPublish) {
      // In a real app, you'd show an integration selection modal
      await onPublish(content.id, 'default-integration');
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

  const getAdTypeIcon = (adType: AdTypeEnum) => {
    switch (adType) {
      case AdTypeEnum.TextOnly:
        return <FileText className="h-4 w-4" />;
      case AdTypeEnum.ImageText:
        return <Image className="h-4 w-4" />;
      case AdTypeEnum.VideoText:
        return <Video className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const filteredProducts = products.filter(p => p.brandId === formData.brandId);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle>
                {isCreateMode ? 'Create Content' : isEditing ? 'Edit Content' : 'View Content'}
              </CardTitle>
              {content && getStatusBadge(content.status)}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <select
                id="brand"
                value={formData.brandId}
                onChange={(e) => setFormData({ ...formData, brandId: e.target.value, productId: undefined })}
                disabled={!isEditing && !isCreateMode}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select a brand</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="product">Product (Optional)</Label>
              <select
                id="product"
                value={formData.productId || ''}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value || undefined })}
                disabled={!isEditing && !isCreateMode}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">No product</option>
                {filteredProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              disabled={!isEditing && !isCreateMode}
              placeholder="Enter content title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="styleDescription">Style Description</Label>
            <Textarea
              id="styleDescription"
              value={formData.styleDescription || ''}
              onChange={(e) => setFormData({ ...formData, styleDescription: e.target.value })}
              disabled={!isEditing && !isCreateMode}
              placeholder="Describe the style and tone for this content"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contextDescription">Context Description</Label>
            <Textarea
              id="contextDescription"
              value={formData.contextDescription || ''}
              onChange={(e) => setFormData({ ...formData, contextDescription: e.target.value })}
              disabled={!isEditing && !isCreateMode}
              placeholder="Provide context about this content"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adType">Ad Type</Label>
            <select
              id="adType"
              value={formData.adType}
              onChange={(e) => setFormData({ ...formData, adType: parseInt(e.target.value) as AdTypeEnum })}
              disabled={!isEditing && !isCreateMode}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value={AdTypeEnum.TextOnly}>
                Text Only
              </option>
              <option value={AdTypeEnum.ImageText}>
                Image + Text
              </option>
              <option value={AdTypeEnum.VideoText}>
                Video + Text
              </option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="textContent">Content</Label>
            <Textarea
              id="textContent"
              value={formData.textContent || ''}
              onChange={(e) => setFormData({ ...formData, textContent: e.target.value })}
              disabled={!isEditing && !isCreateMode}
              placeholder="Enter your content text"
              rows={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="representativeCharacter">Representative Character</Label>
            <Input
              id="representativeCharacter"
              value={formData.representativeCharacter || ''}
              onChange={(e) => setFormData({ ...formData, representativeCharacter: e.target.value })}
              disabled={!isEditing && !isCreateMode}
              placeholder="Character or persona for this content"
            />
          </div>

          {(isEditing || isCreateMode) && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="publishImmediately"
                checked={formData.publishImmediately}
                onChange={(e) => setFormData({ ...formData, publishImmediately: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="publishImmediately" className="text-sm">
                Publish immediately after approval
              </Label>
            </div>
          )}

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
          
          <div className="flex gap-3 pt-4">
            {(isEditing || isCreateMode) && (
              <Button
                onClick={handleSave}
                disabled={isProcessing || !formData.brandId}
                className="flex-1"
              >
                <Save className="mr-2 h-4 w-4" />
                {isCreateMode ? 'Create Content' : 'Save Changes'}
              </Button>
            )}
            
            {content && content.status === ContentStatusEnum.Draft && onSubmit && !isEditing && (
              <Button
                onClick={handleSubmit}
                disabled={isProcessing}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Send className="mr-2 h-4 w-4" />
                Submit for Approval
              </Button>
            )}
            
            {content && content.status === ContentStatusEnum.Approved && onPublish && !isEditing && (
              <Button
                onClick={handlePublish}
                disabled={isProcessing}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Share className="mr-2 h-4 w-4" />
                Publish Content
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
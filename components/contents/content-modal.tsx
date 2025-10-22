"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { 
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
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
  open,
  onOpenChange,
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

  useEffect(() => {
    if (content) {
      setFormData({
        brandId: content.brandId,
        productId: content.productId || undefined,
        adType: content.adType,
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

  if (isDesktop) {
  return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-lg font-bold">
                {isCreateMode ? 'Create Content' : isEditing ? 'Edit Content' : 'View Content'}
              </DialogTitle>
              {content && getStatusBadge(content.status)}
            </div>
            <DialogDescription>
              {isCreateMode ? 'Create new content for your brand' : isEditing ? 'Edit your content' : 'View content details'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            <ContentForm 
              formData={formData}
              setFormData={setFormData}
              content={content}
              isEditing={isEditing}
              isCreateMode={isCreateMode}
              brands={brands}
              products={filteredProducts}
              handleSave={handleSave}
              handleSubmit={handleSubmit}
              handlePublish={handlePublish}
              isProcessing={isProcessing}
              onSubmit={onSubmit}
              onPublish={onPublish}
              showButtons={true}
            />
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
              {isCreateMode ? 'Create Content' : isEditing ? 'Edit Content' : 'View Content'}
            </DrawerTitle>
            {content && getStatusBadge(content.status)}
          </div>
          <DrawerDescription>
              {isCreateMode ? 'Create new content for your brand' : isEditing ? 'Edit your content' : 'View content details'}
            </DrawerDescription>
          </DrawerHeader>
        <div className="flex-1 overflow-y-auto">
          <ContentForm 
            formData={formData}
            setFormData={setFormData}
            content={content}
            isEditing={isEditing}
            isCreateMode={isCreateMode}
            brands={brands}
            products={filteredProducts}
            handleSave={handleSave}
            handleSubmit={handleSubmit}
            handlePublish={handlePublish}
            isProcessing={isProcessing}
            onSubmit={onSubmit}
            onPublish={onPublish}
            className="px-4"
            showButtons={false}
          />
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
            
            {content && content.status === ContentStatusEnum.Approved && onPublish && !isEditing && (
              <Button
                onClick={handlePublish}
                disabled={isProcessing}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Share className="mr-2 h-4 w-4" />
                Publish Content
              </Button>
            )}
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function ContentForm({ 
  formData, 
  setFormData, 
  content, 
  isEditing, 
  isCreateMode, 
  brands, 
  products, 
  handleSave, 
  handleSubmit, 
  handlePublish, 
  isProcessing,
  onSubmit,
  onPublish,
  className,
  showButtons = true
}: {
  formData: CreateContentRequest;
  setFormData: (data: CreateContentRequest) => void;
  content: ContentResponseDto | null;
  isEditing: boolean;
  isCreateMode: boolean;
  brands: Array<{ id: string; name: string }>;
  products: Array<{ id: string; name: string; brandId: string }>;
  handleSave: () => Promise<void>;
  handleSubmit: () => Promise<void>;
  handlePublish: () => Promise<void>;
  isProcessing: boolean;
  onSubmit?: (contentId: string) => Promise<void>;
  onPublish?: (contentId: string, integrationId: string) => Promise<void>;
  className?: string;
  showButtons?: boolean;
}) {
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
              {products.map((product) => (
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
            
            {content && content.status === ContentStatusEnum.Draft && onSubmit && !isEditing && (
              <Button
                onClick={handleSubmit}
                disabled={isProcessing}
                className="flex-1 min-w-[120px] h-9 text-sm bg-blue-600 hover:bg-blue-700"
              >
                <Send className="mr-2 h-4 w-4" />
                Submit for Approval
              </Button>
            )}
            
            {content && content.status === ContentStatusEnum.Approved && onPublish && !isEditing && (
              <Button
                onClick={handlePublish}
                disabled={isProcessing}
                className="flex-1 min-w-[120px] h-9 text-sm bg-green-600 hover:bg-green-700"
              >
                <Share className="mr-2 h-4 w-4" />
                Publish Content
              </Button>
            )}
          </div>
      )}
    </div>
  );
}
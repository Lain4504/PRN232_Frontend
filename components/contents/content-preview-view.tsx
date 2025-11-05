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
} from "@/lib/types/aisam-types";
import { useSocialIntegrations } from "@/hooks/use-social-integrations";
import { Send, FileText, Image, Video, Calendar, Package, Share, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ContentPreviewViewProps {
  content: ContentResponseDto;
  onSubmit?: (contentId: string) => Promise<void>;
  onPublish?: (contentId: string, integrationId: string) => Promise<void>;
  isProcessing?: boolean;
  showActions?: boolean;
  brands?: Array<{ id: string; name: string }>; // Optional: pass brands to map brandId to name
}

export function ContentPreviewView({
  content,
  onSubmit,
  onPublish,
  isProcessing = false,
  showActions = true,
  brands = [],
}: ContentPreviewViewProps) {
  const [selectedIntegrationId, setSelectedIntegrationId] = useState<string>("");
  
  // Get social integrations for the content's brand
  const { data: integrations = [], isLoading: integrationsLoading } = useSocialIntegrations(content.brandId);
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

  const getAdTypeLabel = (adType: AdTypeEnum) => {
    switch (adType) {
      case AdTypeEnum.TextOnly:
        return "Text Only";
      case AdTypeEnum.ImageText:
        return "Image + Text";
      case AdTypeEnum.VideoText:
        return "Video + Text";
      default:
        return `Type ${adType}`;
    }
  };

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
    return AdTypeEnum.TextOnly;
  };

  // Parse image URLs from various formats
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
      } catch {
        return [trimmed];
      }
    }
    return [];
  };

  // Parse video URL
  const parseVideoUrl = (value: unknown): string | null => {
    if (value == null) return null;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed || trimmed.toLowerCase() === 'null' || trimmed.toLowerCase() === 'undefined') return null;
      try {
        const parsed = JSON.parse(trimmed);
        if (typeof parsed === 'string') return parsed;
      } catch {
        return trimmed;
      }
      return trimmed;
    }
    return null;
  };

  const imageUrls = parseImageUrls(content.imageUrl);
  const videoUrl = parseVideoUrl(content.videoUrl);
  const adType = parseAdType(content.adType);

  const handleSubmit = async () => {
    if (onSubmit) {
      await onSubmit(content.id);
    }
  };

  const handlePublish = async () => {
    if (!onPublish) return;
    
    if (!selectedIntegrationId) {
      toast.error('Please select a social integration to publish');
      return;
    }

    try {
      await onPublish(content.id, selectedIntegrationId);
    } catch (error) {
      console.error('Failed to publish content:', error);
      toast.error('Failed to publish content');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="space-y-4 border-b pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">{content.title}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              {getStatusBadge(content.status)}
              <Badge variant="outline" className="flex items-center gap-1">
                {getAdTypeIcon(adType)}
                {getAdTypeLabel(adType)}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Metadata Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        {content.productName && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Package className="h-4 w-4" />
            <span className="font-medium">Product:</span>
            <span>{content.productName}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span className="font-medium">Created:</span>
          <span>{new Date(content.createdAt).toLocaleString()}</span>
        </div>
        {content.updatedAt && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span className="font-medium">Updated:</span>
            <span>{new Date(content.updatedAt).toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Description Section */}
      {content.description && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Description</h3>
          <p className="text-sm text-muted-foreground">{content.description}</p>
        </div>
      )}

      {/* Style & Context Descriptions */}
      {(content.styleDescription || content.contextDescription) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {content.styleDescription && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Style Description</h3>
              <p className="text-sm text-muted-foreground">{content.styleDescription}</p>
            </div>
          )}
          {content.contextDescription && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Context Description</h3>
              <p className="text-sm text-muted-foreground">{content.contextDescription}</p>
            </div>
          )}
        </div>
      )}

      {/* Representative Character */}
      {content.representativeCharacter && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Representative Character</h3>
          <p className="text-sm text-muted-foreground">{content.representativeCharacter}</p>
        </div>
      )}

      {/* Content Text */}
      {content.textContent && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Content</h3>
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm whitespace-pre-wrap">{content.textContent}</p>
          </div>
        </div>
      )}

      {/* Media Section */}
      {adType === AdTypeEnum.ImageText && imageUrls.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Images</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {imageUrls.map((url, index) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={index}
                src={url}
                alt={`Content image ${index + 1}`}
                className="w-full h-48 object-cover rounded-lg border"
              />
            ))}
          </div>
        </div>
      )}

      {adType === AdTypeEnum.VideoText && videoUrl && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Video</h3>
          <div className="rounded-lg border overflow-hidden">
            <video
              src={videoUrl}
              controls
              className="w-full h-auto max-h-96"
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {showActions && (
        <div className="space-y-4 pt-4 border-t">
          {content.status === ContentStatusEnum.Draft && onSubmit && (
            <Button
              onClick={handleSubmit}
              disabled={isProcessing}
              className="w-full h-9 text-sm bg-blue-600 hover:bg-blue-700"
            >
              <Send className="mr-2 h-4 w-4" />
              Submit for Approval
            </Button>
          )}
          
          {content.status === ContentStatusEnum.Approved && onPublish && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Select Social Integration</Label>
                {integrationsLoading ? (
                  <div className="flex items-center justify-center p-4 border rounded-md">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">Loading integrations...</span>
                  </div>
                ) : integrations.length === 0 ? (
                  <div className="p-4 bg-muted rounded-md text-center">
                    <p className="text-sm text-muted-foreground">No social integrations available for this brand.</p>
                    <p className="text-xs text-muted-foreground mt-1">Please set up an integration first.</p>
                  </div>
                ) : (
                  <Select
                    value={selectedIntegrationId}
                    onValueChange={setSelectedIntegrationId}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select an integration to publish" />
                    </SelectTrigger>
                    <SelectContent>
                      {integrations.map((integration) => (
                        <SelectItem key={integration.id} value={integration.id}>
                          <div className="flex items-center justify-between w-full">
                            <span className="font-medium">{integration.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">{integration.platform}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              
              <Button
                onClick={handlePublish}
                disabled={!selectedIntegrationId || isProcessing || integrations.length === 0}
                className="w-full h-9 text-sm bg-green-600 hover:bg-green-700"
              >
                <Share className="mr-2 h-4 w-4" />
                {isProcessing ? 'Publishing...' : 'Publish Content'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


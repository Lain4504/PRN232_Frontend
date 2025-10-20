"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Eye,
  Edit,
  Trash2,
  Send,
  Share,
  Clock,
  Image,
  Video,
  FileText
} from "lucide-react";
import { ContentResponseDto, ContentStatusEnum, AdTypeEnum } from "@/lib/types/aisam-types";

interface ContentCardProps {
  content: ContentResponseDto;
  onView?: (content: ContentResponseDto) => void;
  onEdit?: (content: ContentResponseDto) => void;
  onDelete?: (contentId: string) => void;
  onSubmit?: (contentId: string) => void;
  onSubmitForApproval?: (content: ContentResponseDto) => void;
  onPublish?: (contentId: string, integrationId: string) => void;
  isProcessing?: boolean;
  showActions?: boolean;
}

export function ContentCard({ 
  content, 
  onView, 
  onEdit, 
  onDelete, 
  onSubmit, 
  onPublish,
  isProcessing = false,
  showActions = true
}: ContentCardProps) {
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

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {getStatusBadge(content.status)}
              <Badge variant="outline" className="flex items-center gap-1">
                {getAdTypeIcon(content.adType)}
                {getAdTypeLabel(content.adType)}
              </Badge>
            </div>
            <CardTitle className="text-lg">{content.title}</CardTitle>
            <CardDescription>
              {content.brandName || 'Unknown Brand'} • {new Date(content.createdAt).toLocaleDateString()}
            </CardDescription>
          </div>
          
          {showActions && (
            <div className="flex gap-2">
              {onView && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onView(content)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {content.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {content.description}
          </p>
        )}

        {content.textContent && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
            {content.textContent}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Created {new Date(content.createdAt).toLocaleDateString()}</span>
            </div>
            {content.productName && (
              <div className="flex items-center gap-1">
                <span>Product: {content.productName}</span>
              </div>
            )}
          </div>
          
          {showActions && (
            <div className="flex gap-2">
              {content.status === ContentStatusEnum.Draft && onEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(content)}
                  disabled={isProcessing}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              )}
              
              {(content.status === ContentStatusEnum.Draft || content.status === ContentStatusEnum.Rejected) && onSubmit && (
                <Button
                  size="sm"
                  onClick={() => onSubmit(content.id)}
                  disabled={isProcessing}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Submit for Approval
                </Button>
              )}
              
              {content.status === ContentStatusEnum.Approved && onPublish && (
                <Button
                  size="sm"
                  onClick={() => onPublish(content.id, 'default-integration')} // You'd need to handle integration selection
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Share className="mr-2 h-4 w-4" />
                  Publish
                </Button>
              )}
              
              {(content.status === ContentStatusEnum.Draft || content.status === ContentStatusEnum.Rejected) && onDelete && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDelete(content.id)}
                  disabled={isProcessing}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
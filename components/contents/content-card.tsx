"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { ContentScheduleActions } from "./content-schedule-actions";

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
    <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm hover:bg-card/80 hover:scale-[1.02] hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              {getStatusBadge(content.status)}
              <Badge variant="outline" className="flex items-center gap-1 text-xs">
                {getAdTypeIcon(content.adType)}
                {getAdTypeLabel(content.adType)}
              </Badge>
            </div>
            <CardTitle className="text-base font-bold mb-1 group-hover:text-primary transition-colors">
              {content.title}
            </CardTitle>
            <CardDescription className="text-xs">
              {content.brandName || 'Unknown Brand'} • {new Date(content.createdAt).toLocaleDateString()}
            </CardDescription>
          </div>
          
          {showActions && (
            <div className="flex gap-1">
              {onView && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onView(content)}
                  className="h-8 text-xs"
                >
                  <Eye className="mr-1 h-3 w-3" />
                  View
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {content.description && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
            {content.description}
          </p>
        )}

        {content.textContent && (
          <p className="text-xs text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
            {content.textContent}
          </p>
        )}
        
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Created {new Date(content.createdAt).toLocaleDateString()}</span>
            </div>
            {content.productName && (
              <div className="flex items-center gap-1">
                <span>• {content.productName}</span>
              </div>
            )}
          </div>
          
          {showActions && (
            <div className="flex flex-wrap gap-2">
              {content.status === ContentStatusEnum.Draft && onEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(content)}
                  disabled={isProcessing}
                  className="h-7 text-xs"
                >
                  <Edit className="mr-1 h-3 w-3" />
                  Edit
                </Button>
              )}
              
              {(content.status === ContentStatusEnum.Draft || content.status === ContentStatusEnum.Rejected) && onSubmit && (
                <Button
                  size="sm"
                  onClick={() => onSubmit(content.id)}
                  disabled={isProcessing}
                  className="bg-blue-600 hover:bg-blue-700 h-7 text-xs"
                >
                  <Send className="mr-1 h-3 w-3" />
                  Submit
                </Button>
              )}
              
              {content.status === ContentStatusEnum.Approved && onPublish && (
                <Button
                  size="sm"
                  onClick={() => onPublish(content.id, 'default-integration')}
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700 h-7 text-xs"
                >
                  <Share className="mr-1 h-3 w-3" />
                  Publish
                </Button>
              )}
              
              {content.status === ContentStatusEnum.Approved && (
                <ContentScheduleActions content={content} />
              )}
              
              {(content.status === ContentStatusEnum.Draft || content.status === ContentStatusEnum.Rejected) && onDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={isProcessing}
                      className="h-7 text-xs"
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Content</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{content.title}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(content.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
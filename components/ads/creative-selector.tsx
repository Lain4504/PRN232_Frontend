"use client";

import React from "react";
import { useCreatives } from "@/hooks/use-creatives";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Image, Video, FileText, Play } from "lucide-react";
import type { AdCreativeResponse } from "@/lib/types/creatives";

interface CreativeSelectorProps {
  value?: string;
  onChange?: (creativeId: string) => void;
}

export function CreativeSelector({ value, onChange }: CreativeSelectorProps) {
  // Don't pass adSetId - get all creatives instead
  const { data, isLoading } = useCreatives({ page: 1, pageSize: 100 });
  const creatives = data?.data || [];

  const getCreativeDisplayName = (creative: AdCreativeResponse) => {
    // For Facebook post creatives
    if (creative.facebookPostId) {
      if (creative.contentPreview?.title && creative.contentPreview.title !== "Facebook Post Ad") {
        return creative.contentPreview.title;
      }
      return `Facebook Post ${creative.facebookPostId}`;
    }
    // Use contentPreview title if available
    if (creative.contentPreview?.title) {
      return creative.contentPreview.title;
    }
    // Use name if available
    if (creative.name) {
      return creative.name;
    }
    // Fallback to creativeId
    return creative.creativeId || creative.id;
  };

  const getCreativeType = (creative: AdCreativeResponse) => {
    // Check if it's a Facebook post creative
    if (creative.facebookPostId) {
      return 'FACEBOOK_POST';
    }
    if (creative.contentPreview?.adType) {
      return creative.contentPreview.adType;
    }
    if (creative.type) {
      return creative.type;
    }
    return 'UNKNOWN';
  };

  const getTypeIcon = (type: string) => {
    const upperType = type.toUpperCase();
    if (upperType.includes('IMAGE') || upperType === 'IMAGETEXT') {
      return Image;
    }
    if (upperType.includes('VIDEO') || upperType === 'VIDEOTEXT') {
      return Video;
    }
    if (upperType.includes('TEXT') || upperType === 'TEXTONLY') {
      return FileText;
    }
    if (upperType.includes('FACEBOOK')) {
      return Play;
    }
    return Image;
  };

  const getTypeColor = (type: string) => {
    const upperType = type.toUpperCase();
    if (upperType.includes('IMAGE')) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
    if (upperType.includes('VIDEO')) {
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    }
    if (upperType.includes('TEXT')) {
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
    if (upperType.includes('FACEBOOK')) {
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  return (
    <Select value={value} onValueChange={(v) => onChange?.(v)} disabled={isLoading}>
      <SelectTrigger>
        <SelectValue placeholder={isLoading ? "Loading creatives..." : "Select a creative"} />
      </SelectTrigger>
      <SelectContent className="max-h-[400px]">
        {creatives.map((c) => {
          const displayName = getCreativeDisplayName(c);
          const type = getCreativeType(c);
          const TypeIcon = getTypeIcon(type);
          const typeColor = getTypeColor(type);
          
          // Format type for display
          const formatTypeLabel = (type: string) => {
            if (type === 'FACEBOOK_POST') return 'Facebook Post';
            if (type === 'IMAGETEXT') return 'Image + Text';
            if (type === 'VIDEOTEXT') return 'Video + Text';
            if (type === 'TEXTONLY') return 'Text Only';
            return type.replace(/_/g, ' ');
          };
          
          return (
            <SelectItem key={c.id} value={c.id}>
              <div className="flex items-center gap-2 w-full">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  {c.contentPreview?.imageUrl ? (
                    <AvatarImage src={c.contentPreview.imageUrl} alt={displayName} />
                  ) : null}
                  <AvatarFallback className="bg-muted">
                    <TypeIcon className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{displayName}</span>
                    <Badge variant="outline" className={`text-xs shrink-0 ${typeColor}`}>
                      {formatTypeLabel(type)}
                    </Badge>
                  </div>
                </div>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}



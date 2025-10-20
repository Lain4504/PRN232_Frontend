"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Image,
  Play,
  FileText,
  Upload,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Tag,
  BarChart3,
} from "lucide-react";
import type { AdCreativeResponse } from "@/lib/types/creatives";
import { getCreativeStatus, getCreativeStatusColor, getCreativeTypeColor, CREATIVE_TYPES } from "@/lib/types/creatives";
import { format } from "date-fns";

interface CreativeGalleryProps {
  creatives: AdCreativeResponse[];
  viewMode: "grid" | "list";
  onEdit: (creative: AdCreativeResponse) => void;
  onDelete: (creative: AdCreativeResponse) => void;
  onPreview: (creative: AdCreativeResponse) => void;
}

export function CreativeGallery({ 
  creatives, 
  viewMode, 
  onEdit, 
  onDelete, 
  onPreview 
}: CreativeGalleryProps) {
  const getCreativeIcon = (type: string) => {
    switch (type) {
      case 'IMAGE':
        return Image;
      case 'VIDEO':
        return Play;
      case 'TEXT':
        return FileText;
      case 'GIF':
        return Play;
      case 'CAROUSEL':
        return Upload;
      case 'STORY':
        return Image;
      default:
        return Image;
    }
  };

  if (viewMode === "list") {
    return (
      <div className="space-y-4">
        {creatives.map((creative) => {
          const status = getCreativeStatus(creative);
          const statusColor = getCreativeStatusColor(status);
          const typeColor = getCreativeTypeColor(creative.type);
          const typeInfo = CREATIVE_TYPES.find(t => t.value === creative.type);
          const CreativeIcon = getCreativeIcon(creative.type);

          return (
            <Card key={creative.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        <CreativeIcon className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{creative.name}</h3>
                        <Badge variant="secondary" className={statusColor}>
                          {status}
                        </Badge>
                        <Badge variant="outline" className={typeColor}>
                          {typeInfo?.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(creative.createdAt), 'MMM d, yyyy')}
                        </div>
                        {creative.tags && creative.tags.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {creative.tags.length} tags
                          </div>
                        )}
                        {creative.metrics && (
                          <div className="flex items-center gap-1">
                            <BarChart3 className="h-3 w-3" />
                            {creative.metrics.impressions.toLocaleString()} impressions
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onPreview(creative)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(creative)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(creative)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {creatives.map((creative) => {
        const status = getCreativeStatus(creative);
        const statusColor = getCreativeStatusColor(status);
        const typeColor = getCreativeTypeColor(creative.type);
        const typeInfo = CREATIVE_TYPES.find(t => t.value === creative.type);
        const CreativeIcon = getCreativeIcon(creative.type);

        return (
          <Card key={creative.id} className="group hover:shadow-lg transition-all duration-200">
            <CardContent className="p-0">
              {/* Creative Preview */}
              <div className="relative aspect-square bg-muted rounded-t-lg overflow-hidden">
                {creative.thumbnailUrl ? (
                  <img
                    src={creative.thumbnailUrl}
                    alt={creative.name}
                    className="w-full h-full object-cover"
                  />
                ) : creative.mediaUrl ? (
                  <img
                    src={creative.mediaUrl}
                    alt={creative.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <CreativeIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onPreview(creative)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onEdit(creative)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(creative)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Type Badge */}
                <div className="absolute top-2 left-2">
                  <Badge variant="outline" className={typeColor}>
                    {typeInfo?.label}
                  </Badge>
                </div>

                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className={statusColor}>
                    {status}
                  </Badge>
                </div>
              </div>

              {/* Creative Info */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-sm line-clamp-2">{creative.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(creative.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>

                {/* Tags */}
                {creative.tags && creative.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {creative.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {creative.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{creative.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Metrics */}
                {creative.metrics && (
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <BarChart3 className="h-3 w-3" />
                      {creative.metrics.impressions.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <span>CTR: {creative.metrics.ctr.toFixed(1)}%</span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => onPreview(creative)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => onEdit(creative)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

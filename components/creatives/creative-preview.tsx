"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Image,
  Play,
  FileText,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Smartphone,
  Monitor,
  Tablet,
  Maximize2,
} from "lucide-react";
import type { AdCreativeResponse } from "@/lib/types/creatives";
import { getCreativeTypeColor, CREATIVE_TYPES } from "@/lib/types/creatives";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface CreativePreviewProps {
  creative: AdCreativeResponse;
  fullScreen?: boolean;
}

export function CreativePreview({ creative, fullScreen = false }: CreativePreviewProps) {
  const [selectedPlatform, setSelectedPlatform] = useState("facebook");
  const [selectedDevice, setSelectedDevice] = useState("desktop");
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);

  const typeInfo = CREATIVE_TYPES.find(t => t.value === creative.type);
  const typeColor = getCreativeTypeColor(creative.type);

  const platforms = [
    { value: "facebook", label: "Facebook", icon: Facebook },
    { value: "instagram", label: "Instagram", icon: Instagram },
    { value: "twitter", label: "Twitter", icon: Twitter },
    { value: "linkedin", label: "LinkedIn", icon: Linkedin },
  ];

  const devices = [
    { value: "desktop", label: "Desktop", icon: Monitor },
    { value: "tablet", label: "Tablet", icon: Tablet },
    { value: "mobile", label: "Mobile", icon: Smartphone },
  ];

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
        return Image;
      case 'STORY':
        return Image;
      default:
        return Image;
    }
  };

  const CreativeIcon = getCreativeIcon(creative.type);

  const renderCreativeContent = () => {
    switch (creative.type) {
      case 'IMAGE':
        return (
          <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden">
            {creative.mediaUrl ? (
              <img
                src={creative.mediaUrl}
                alt={creative.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Image className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>
        );

      case 'VIDEO':
        return (
          <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
            {creative.mediaUrl ? (
              <video
                src={creative.mediaUrl}
                controls
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Play className="h-16 w-16 text-white" />
              </div>
            )}
          </div>
        );

      case 'TEXT':
        return (
          <div className="w-full h-full bg-white border rounded-lg p-6 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <FileText className="h-8 w-8 text-gray-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{creative.name}</h3>
                {creative.content && (
                  <p className="text-gray-600 whitespace-pre-wrap">{creative.content}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 'GIF':
        return (
          <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden">
            {creative.mediaUrl ? (
              <img
                src={creative.mediaUrl}
                alt={creative.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Play className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>
        );

      case 'CAROUSEL':
        return (
          <div className="w-full h-full bg-gray-100 rounded-lg overflow-hidden">
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
                  <Image className="h-8 w-8 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Carousel Creative</h3>
                  <p className="text-gray-600">Multiple media items</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'STORY':
        return (
          <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden">
            {creative.mediaUrl ? (
              <img
                src={creative.mediaUrl}
                alt={creative.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Image className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
            <CreativeIcon className="h-16 w-16 text-gray-400" />
          </div>
        );
    }
  };

  const getPreviewDimensions = () => {
    const platform = platforms.find(p => p.value === selectedPlatform);
    const device = devices.find(d => d.value === selectedDevice);

    if (selectedDevice === 'mobile') {
      return { width: 375, height: 667, aspectRatio: '9:16' };
    } else if (selectedDevice === 'tablet') {
      return { width: 768, height: 1024, aspectRatio: '3:4' };
    } else {
      return { width: 1200, height: 628, aspectRatio: '1.91:1' };
    }
  };

  const dimensions = getPreviewDimensions();

  const PreviewContent = () => (
    <div className="space-y-6">
      {/* Platform and Device Selectors */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2">
          {platforms.map((platform) => {
            const Icon = platform.icon;
            return (
              <Button
                key={platform.value}
                variant={selectedPlatform === platform.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPlatform(platform.value)}
              >
                <Icon className="h-4 w-4 mr-2" />
                {platform.label}
              </Button>
            );
          })}
        </div>
        
        <div className="flex gap-2">
          {devices.map((device) => {
            const Icon = device.icon;
            return (
              <Button
                key={device.value}
                variant={selectedDevice === device.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDevice(device.value)}
              >
                <Icon className="h-4 w-4 mr-2" />
                {device.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Preview Container */}
      <div className="flex justify-center">
        <div className="relative">
          <div
            className="border-2 border-gray-300 rounded-lg overflow-hidden shadow-lg"
            style={{
              width: Math.min(dimensions.width, 400),
              height: Math.min(dimensions.height, 600),
            }}
          >
            {renderCreativeContent()}
          </div>
          
          {/* Preview Info */}
          <div className="absolute -bottom-8 left-0 right-0 text-center">
            <p className="text-xs text-gray-500">
              {dimensions.width} × {dimensions.height} ({dimensions.aspectRatio})
            </p>
          </div>
        </div>
      </div>

      {/* Creative Info */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Creative Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Type:</span>
              <Badge variant="outline" className={typeColor}>
                {typeInfo?.label}
              </Badge>
            </div>
            <div>
              <span className="text-sm font-medium">Name:</span>
              <p className="text-sm text-gray-600">{creative.name}</p>
            </div>
            {creative.content && (
              <div>
                <span className="text-sm font-medium">Content:</span>
                <p className="text-sm text-gray-600 line-clamp-3">{creative.content}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {creative.metrics ? (
              <>
                <div className="flex justify-between text-sm">
                  <span>Impressions:</span>
                  <span className="font-medium">{creative.metrics.impressions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Clicks:</span>
                  <span className="font-medium">{creative.metrics.clicks.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>CTR:</span>
                  <span className="font-medium">{creative.metrics.ctr.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Engagement:</span>
                  <span className="font-medium">{creative.metrics.engagement.toLocaleString()}</span>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500">No performance data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Creative Preview</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullScreenOpen(true)}
            >
              <Maximize2 className="h-4 w-4 mr-2" />
              Full Screen
            </Button>
          </div>
          <PreviewContent />
        </div>

        <Dialog open={isFullScreenOpen} onOpenChange={setIsFullScreenOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Creative Preview - {creative.name}</DialogTitle>
            </DialogHeader>
            <PreviewContent />
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Creative Preview</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsFullScreenOpen(true)}
        >
          <Maximize2 className="h-4 w-4 mr-2" />
          Full Screen
        </Button>
      </div>
      <PreviewContent />

      <Dialog open={isFullScreenOpen} onOpenChange={setIsFullScreenOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Creative Preview - {creative.name}</DialogTitle>
          </DialogHeader>
          <PreviewContent />
        </DialogContent>
      </Dialog>
    </div>
  );
}

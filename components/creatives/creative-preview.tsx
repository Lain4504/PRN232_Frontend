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
  TrendingUp,
  Activity,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdCreativeResponse, CreativeType } from "@/lib/types/creatives";
import { getCreativeTypeColor, CREATIVE_TYPES } from "@/lib/types/creatives";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import NextImage from "next/image";

interface CreativePreviewProps {
  creative: AdCreativeResponse;
  fullScreen?: boolean;
}

export function CreativePreview({ creative, fullScreen = false }: CreativePreviewProps) {
  const [selectedPlatform, setSelectedPlatform] = useState("facebook");
  const [selectedDevice, setSelectedDevice] = useState("desktop");
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);

  const safeType = (creative.type ?? 'IMAGE') as CreativeType;
  const typeInfo = CREATIVE_TYPES.find(t => t.value === safeType);
  const typeColor = getCreativeTypeColor(safeType);

  const platforms = [
    { value: "facebook", label: "Facebook", icon: Facebook },
    { value: "instagram", label: "Instagram", icon: Instagram },
    { value: "twitter", label: "Twitter", icon: Twitter },
    { value: "linkedin", label: "LinkedIn", icon: Linkedin },
  ];

  const devices = [
    { value: "desktop", label: "Máy tính", icon: Monitor },
    { value: "tablet", label: "Máy tính bảng", icon: Tablet },
    { value: "mobile", label: "Di động", icon: Smartphone },
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

  const CreativeIcon = getCreativeIcon(safeType);

  const renderCreativeContent = () => {
    switch (safeType) {
      case 'IMAGE':
        return (
          <div className="relative w-full h-full bg-slate-50 dark:bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center">
            {creative.mediaUrl ? (
              <NextImage
                src={creative.mediaUrl}
                alt={creative.name || "Creative Image"}
                fill
                unoptimized
                className="object-contain"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                <Image className="h-12 w-12 text-slate-200 dark:text-slate-800" />
                <span className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest">Không có ảnh</span>
              </div>
            )}
          </div>
        );

      case 'VIDEO':
        return (
          <div className="relative w-full h-full bg-black rounded-lg overflow-hidden flex items-center justify-center">
            {creative.mediaUrl ? (
              <video
                src={creative.mediaUrl}
                controls
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                <Play className="h-12 w-12 text-slate-700" />
                <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Không có video</span>
              </div>
            )}
          </div>
        );

      case 'TEXT':
        return (
          <div className="w-full h-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg p-10 flex flex-col items-center justify-center text-center">
            <div className="size-20 rounded-3xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-8 shadow-sm">
              <FileText className="size-10 text-slate-900 dark:text-primary" />
            </div>
            <div className="space-y-4 max-w-md">
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{creative.name}</h3>
              {creative.content && (
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed italic line-clamp-6">&quot;{creative.content}&quot;</p>
              )}
            </div>
          </div>
        );

      case 'GIF':
        return (
          <div className="relative w-full h-full bg-slate-50 dark:bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center">
            {creative.mediaUrl ? (
              <NextImage
                src={creative.mediaUrl}
                alt={creative.name || "Creative GIF"}
                fill
                unoptimized
                className="object-contain"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                <Play className="h-12 w-12 text-slate-200 dark:text-slate-800" />
                <span className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest">Không có GIF</span>
              </div>
            )}
          </div>
        );

      case 'CAROUSEL':
        return (
          <div className="w-full h-full bg-slate-50 dark:bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center">
            <div className="text-center space-y-6">
              <div className="size-20 rounded-3xl bg-white dark:bg-slate-900 flex items-center justify-center mx-auto shadow-sm border border-slate-100 dark:border-slate-800">
                <Image className="size-10 text-slate-900 dark:text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Quảng cáo Carousel</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Đang hiển thị dạng Album</p>
              </div>
            </div>
          </div>
        );

      case 'STORY':
        return (
          <div className="relative w-full h-full bg-slate-50 dark:bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center">
            {creative.mediaUrl ? (
              <NextImage
                src={creative.mediaUrl}
                alt={creative.name || "Creative Story"}
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                <Image className="h-12 w-12 text-slate-200 dark:text-slate-800" />
                <span className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest">Story Preview</span>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="w-full h-full bg-slate-50 dark:bg-slate-950 rounded-lg flex items-center justify-center">
            <CreativeIcon className="size-16 text-slate-100 dark:text-slate-900" />
          </div>
        );
    }
  };

  const getPreviewDimensions = () => {
    if (selectedDevice === 'mobile') {
      return { width: 375, height: 667, aspectRatio: '9:16' };
    } else if (selectedDevice === 'tablet') {
      return { width: 768, height: 1024, aspectRatio: '3:4' };
    } else {
      return { width: 800, height: 420, aspectRatio: '1.91:1' };
    }
  };

  const dimensions = getPreviewDimensions();

  const PreviewContent = () => (
    <div className="space-y-10">
      {/* Platform and Device Selectors */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between p-6 bg-slate-50/50 dark:bg-slate-800/20 rounded-3xl border border-slate-100 dark:border-slate-800">
        <div className="flex flex-wrap gap-2">
          {platforms.map((platform) => {
            const Icon = platform.icon;
            const isActive = selectedPlatform === platform.value;
            return (
              <Button
                key={platform.value}
                variant="ghost"
                size="sm"
                onClick={() => setSelectedPlatform(platform.value)}
                className={cn(
                  "h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  isActive
                    ? "bg-slate-900 dark:bg-primary text-white shadow-lg shadow-slate-200 dark:shadow-primary/20"
                    : "text-slate-500 dark:text-slate-500 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <Icon className="size-3.5 mr-2 opacity-70" />
                {platform.label}
              </Button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2">
          {devices.map((device) => {
            const Icon = device.icon;
            const isActive = selectedDevice === device.value;
            return (
              <Button
                key={device.value}
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDevice(device.value)}
                className={cn(
                  "h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  isActive
                    ? "bg-slate-900 dark:bg-primary text-white shadow-lg shadow-slate-200 dark:shadow-primary/20"
                    : "text-slate-500 dark:text-slate-500 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <Icon className="size-3.5 mr-2 opacity-70" />
                {device.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Preview Container */}
      <div className="flex flex-col items-center gap-8">
        <div className="relative group/preview">
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-[2.5rem] blur-2xl opacity-0 group-hover/preview:opacity-100 transition-opacity duration-700" />
          <div
            className="relative border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl bg-white dark:bg-slate-900 flex items-center justify-center transition-all duration-700"
            style={{
              width: Math.min(dimensions.width, 800),
              height: Math.min(dimensions.height, 800),
            }}
          >
            {renderCreativeContent()}
          </div>

          {/* Preview Info Bubble */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-slate-900/10 dark:bg-white/10 backdrop-blur-md">
            <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">
              {dimensions.width}PX × {dimensions.height}PX • {dimensions.aspectRatio} ASPECT
            </p>
          </div>
        </div>
      </div>

      {/* Creative Info Grid */}
      <div className="grid gap-8 lg:grid-cols-2 pt-12">
        <Card className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden group">
          <CardHeader className="p-8 border-b border-slate-50 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-800/20">
            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white flex items-center gap-3">
              <div className="size-8 rounded-lg bg-slate-900 dark:bg-primary flex items-center justify-center text-white">
                <FileText className="size-4" />
              </div>
              CHI TIẾT NỘI DUNG
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center justify-between py-4 border-b border-slate-50 dark:border-slate-800/50">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Định dạng</span>
              <Badge variant="outline" className={cn("rounded-lg px-3 py-1 font-black uppercase tracking-[0.1em] text-[9px] border-none", typeColor)}>
                {typeInfo?.label}
              </Badge>
            </div>
            <div className="flex items-center justify-between py-4 border-b border-slate-50 dark:border-slate-800/50">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Tên tài sản</span>
              <p className="text-xs font-black text-slate-900 dark:text-white uppercase truncate max-w-[200px]">{creative.name}</p>
            </div>
            {creative.content && (
              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Mô tả hiển thị</span>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl italic">&quot;{creative.content}&quot;</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden group">
          <CardHeader className="p-8 border-b border-slate-50 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-800/20">
            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white flex items-center gap-3">
              <div className="size-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                <TrendingUp className="size-4" />
              </div>
              CHỈ SỐ HIỆU SUẤT
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-4">
            {creative.metrics ? (
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Lượt hiển thị", value: creative.metrics.impressions.toLocaleString(), sub: "Impressions" },
                  { label: "Lượt nhấp", value: creative.metrics.clicks.toLocaleString(), sub: "Clicks" },
                  { label: "Tỉ lệ CTR", value: `${creative.metrics.ctr.toFixed(2)}%`, sub: "Click-through" },
                  { label: "Tương tác", value: creative.metrics.engagement.toLocaleString(), sub: "Engagements" }
                ].map((m, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 group/item hover:bg-emerald-500 transition-all duration-300">
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 group-hover/item:text-white/70 mb-1">{m.label}</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white group-hover/item:text-white">{m.value}</p>
                    <p className="text-[7px] font-bold text-slate-300 dark:text-slate-600 group-hover/item:text-white/40 uppercase tracking-tighter mt-1">{m.sub}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 gap-4 opacity-50">
                <div className="size-12 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center">
                  <Activity className="size-6 text-slate-300" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chưa có dữ liệu thống kê</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const MainHeader = () => (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-8 text-slate-900 dark:text-white">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="size-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
            <Smartphone className="size-3.5" />
          </div>
          <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Hệ thống xem trước nội dung</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-none uppercase">
          XEM TRƯỚC SÁNG TẠO
        </h1>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 tracking-tight uppercase">Mô phỏng hiển thị trên các thiết bị và nền tảng khác nhau.</p>
      </div>
      <Button
        variant="outline"
        onClick={() => setIsFullScreenOpen(true)}
        className="h-12 px-6 rounded-2xl border-slate-200 dark:border-slate-800 font-black uppercase tracking-widest text-[10px] bg-white dark:bg-slate-900 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all hover:-translate-y-1"
      >
        <Maximize2 className="h-4 w-4 mr-3 opacity-70" />
        CHẾ ĐỘ TOÀN MÀN HÌNH
      </Button>
    </div>
  );

  return (
    <div className="space-y-8">
      {!fullScreen && <MainHeader />}
      <PreviewContent />

      <Dialog open={isFullScreenOpen} onOpenChange={setIsFullScreenOpen}>
        <DialogContent className="w-[98vw] h-[96vh] max-w-none p-0 rounded-[3rem] overflow-hidden bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800 shadow-3xl flex flex-col">
          <div className="p-8 border-b border-slate-50 dark:border-slate-900 bg-slate-50/10 dark:bg-slate-900/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-xl bg-slate-900 dark:bg-primary flex items-center justify-center text-white">
                <Maximize2 className="size-5" />
              </div>
              <div className="space-y-0.5">
                <DialogTitle className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">{creative.name}</DialogTitle>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Simulation Environment Mode Control</p>
              </div>
            </div>
            <Button variant="ghost" onClick={() => setIsFullScreenOpen(false)} className="rounded-full size-12 hover:bg-slate-100 dark:hover:bg-slate-800 p-0 text-slate-400">
              <Plus className="size-6 rotate-45" />
            </Button>
          </div>
          <div className="flex-1 overflow-auto p-10 bg-white dark:bg-slate-950">
            <div className="max-w-7xl mx-auto">
              <PreviewContent />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

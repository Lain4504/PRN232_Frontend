"use client";

import React from "react";
import { Eye, Heart, Share, MessageCircle, TrendingUp } from "lucide-react";
import type { PostMetrics as PostMetricsType } from "@/lib/types/aisam-types";

interface PostMetricsProps {
  metrics: PostMetricsType;
  compact?: boolean;
}

export function PostMetrics({ metrics, compact = false }: PostMetricsProps) {
  const metricsData = [
    {
      key: 'views',
      label: 'Views',
      value: metrics.views || 0,
      icon: Eye,
      color: 'text-chart-1'
    },
    {
      key: 'likes',
      label: 'Likes',
      value: metrics.likes || 0,
      icon: Heart,
      color: 'text-destructive'
    },
    {
      key: 'shares',
      label: 'Shares',
      value: metrics.shares || 0,
      icon: Share,
      color: 'text-chart-2'
    },
    {
      key: 'comments',
      label: 'Comments',
      value: metrics.comments || 0,
      icon: MessageCircle,
      color: 'text-chart-3'
    },
    {
      key: 'clicks',
      label: 'Clicks',
      value: metrics.clicks || 0,
      icon: TrendingUp,
      color: 'text-chart-4'
    }
  ];

  if (compact) {
    return (
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        {metricsData.map(({ key, label, value, icon: Icon, color }) => (
          <div key={key} className="flex items-center gap-1">
            <Icon className={`h-3 w-3 ${color}`} />
            <span>{value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
      {metricsData.map(({ key, label, value, icon: Icon, color }) => (
        <div key={key} className="text-center p-3 bg-muted rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Icon className={`h-4 w-4 ${color}`} />
            <span className="text-sm font-medium">{label}</span>
          </div>
          <div className="text-lg font-bold">{value.toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}

"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  MousePointer,
  TrendingUp,
  BarChart3,
  Heart,
  Share2,
  MessageCircle,
} from "lucide-react";
import type { AdCreativeMetrics } from "@/lib/types/creatives";

interface CreativeMetricsProps {
  metrics: AdCreativeMetrics;
  showDetails?: boolean;
  compact?: boolean;
}

export function CreativeMetrics({ metrics, showDetails = true, compact = false }: CreativeMetricsProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  const getPerformanceColor = (performance: number) => {
    if (performance >= 80) return "text-green-600";
    if (performance >= 60) return "text-yellow-600";
    if (performance >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getPerformanceBadge = (performance: number) => {
    if (performance >= 80) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    if (performance >= 60) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    if (performance >= 40) return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
  };

  if (compact) {
    return (
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1">
          <Eye className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{formatNumber(metrics.impressions)}</span>
        </div>
        <div className="flex items-center gap-1">
          <MousePointer className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{formatNumber(metrics.clicks)}</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{metrics.ctr.toFixed(1)}%</span>
        </div>
        <Badge variant="secondary" className={getPerformanceBadge(metrics.performance)}>
          {metrics.performance.toFixed(0)}% Performance
        </Badge>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impressions</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(metrics.impressions)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total views
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clicks</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(metrics.clicks)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total clicks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CTR</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.ctr.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Click-through rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(metrics.engagement)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total engagement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Overview
          </CardTitle>
          <CardDescription>
            Overall performance score and key metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Performance Score</span>
              <Badge variant="secondary" className={getPerformanceBadge(metrics.performance)}>
                {metrics.performance.toFixed(0)}%
              </Badge>
            </div>
            
            {showDetails && (
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium">Engagement Rate</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {((metrics.engagement / metrics.impressions) * 100).toFixed(2)}%
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Share2 className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Share Rate</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {((metrics.engagement * 0.1) / metrics.impressions * 100).toFixed(2)}%
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Comment Rate</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {((metrics.engagement * 0.05) / metrics.impressions * 100).toFixed(2)}%
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
          <CardDescription>
            Key insights and recommendations based on performance data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.ctr > 3 && (
              <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-300">
                    Excellent CTR
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-400">
                    Your click-through rate is above average. Consider scaling this creative.
                  </p>
                </div>
              </div>
            )}
            
            {metrics.ctr < 1 && (
              <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <TrendingUp className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                    Low CTR
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-400">
                    Consider updating your creative content or targeting to improve click-through rate.
                  </p>
                </div>
              </div>
            )}
            
            {metrics.performance < 40 && (
              <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <BarChart3 className="h-4 w-4 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">
                    Low Performance
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-400">
                    This creative is underperforming. Consider pausing or updating the content.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

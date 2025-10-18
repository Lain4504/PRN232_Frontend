"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Users,
  Target,
  Calendar,
  Download,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { reportsApi, contentApi } from "@/lib/mock-api";
import { Content, PerformanceReport, PerformanceMetrics } from "@/lib/types/aisam-types";
import { toast } from "sonner";

interface ContentPerformanceProps {
  contentId?: string;
}

interface PerformanceData {
  content: Content;
  metrics: PerformanceMetrics[];
  summary: {
    total_impressions: number;
    total_engagement: number;
    total_clicks: number;
    average_ctr: number;
    average_cpc: number;
    best_performing_platform: string;
    growth_rate: number;
  };
}

export function ContentPerformance({ contentId }: ContentPerformanceProps) {
  const [contents, setContents] = useState<Content[]>([]);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState("30d");

  useEffect(() => {
    loadContents();
  }, []);

  useEffect(() => {
    if (selectedContent) {
      loadPerformanceData(selectedContent.id);
    }
  }, [selectedContent, timeRange]);

  const loadContents = async () => {
    try {
      setLoading(true);
      const response = await contentApi.getContents();
      if (response.success) {
        setContents(response.data.filter(c => c.status === 'published'));
        if (contentId) {
          const content = response.data.find(c => c.id === contentId);
          if (content) {
            setSelectedContent(content);
          }
        } else if (response.data.length > 0) {
          setSelectedContent(response.data[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load contents:', error);
      toast.error('Failed to load contents');
    } finally {
      setLoading(false);
    }
  };

  const loadPerformanceData = async (contentId: string) => {
    try {
      setRefreshing(true);

      // Mock performance data generation
      const mockMetrics: PerformanceMetrics[] = [];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      for (let i = 0; i < 30; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);

        mockMetrics.push({
          id: `metric-${i}`,
          post_id: contentId,
          impressions: Math.floor(Math.random() * 10000) + 1000,
          reach: Math.floor(Math.random() * 8000) + 800,
          engagement: Math.floor(Math.random() * 500) + 50,
          clicks: Math.floor(Math.random() * 200) + 20,
          ctr: Math.random() * 5 + 0.5,
          cpc: Math.random() * 2 + 0.1,
          cpm: Math.random() * 10 + 1,
          date: date.toISOString().split('T')[0],
          created_at: date.toISOString(),
        });
      }

      const summary = {
        total_impressions: mockMetrics.reduce((sum, m) => sum + m.impressions, 0),
        total_engagement: mockMetrics.reduce((sum, m) => sum + m.engagement, 0),
        total_clicks: mockMetrics.reduce((sum, m) => sum + m.clicks, 0),
        average_ctr: mockMetrics.reduce((sum, m) => sum + m.ctr, 0) / mockMetrics.length,
        average_cpc: mockMetrics.reduce((sum, m) => sum + m.cpc, 0) / mockMetrics.length,
        best_performing_platform: "Facebook",
        growth_rate: 12.5,
      };

      const content = contents.find(c => c.id === contentId);
      if (content) {
        setPerformanceData({
          content,
          metrics: mockMetrics,
          summary,
        });
      }
    } catch (error) {
      console.error('Failed to load performance data:', error);
      toast.error('Failed to load performance data');
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    if (selectedContent) {
      loadPerformanceData(selectedContent.id);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatPercentage = (num: number) => {
    return num.toFixed(2) + '%';
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-background">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading performance data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Performance</h1>
          <p className="text-muted-foreground">
            Monitor engagement and analytics for your published content
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Content Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Content</CardTitle>
          <CardDescription>
            Choose which content piece to analyze
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedContent?.id || ''}
            onValueChange={(value) => {
              const content = contents.find(c => c.id === value);
              if (content) {
                setSelectedContent(content);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select content to analyze" />
            </SelectTrigger>
            <SelectContent>
              {contents.map((content) => (
                <SelectItem key={content.id} value={content.id}>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{content.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {content.status}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {performanceData && (
        <>
          {/* Overview Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(performanceData.summary.total_impressions)}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +12.5%
                  </span>
                  from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Engagement</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(performanceData.summary.total_engagement)}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +8.2%
                  </span>
                  from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Click-through Rate</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPercentage(performanceData.summary.average_ctr)}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-red-600 flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" />
                    -2.1%
                  </span>
                  from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cost per Click</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${performanceData.summary.average_cpc.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600 flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" />
                    -5.3%
                  </span>
                  from last period
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Content Preview and Details */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Content Preview</CardTitle>
                  <CardDescription>
                    {performanceData.content.title}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 rounded-lg p-4">
                    {performanceData.content.text_content && (
                      <p className="text-sm mb-3">{performanceData.content.text_content}</p>
                    )}
                    {performanceData.content.image_url && (
                      <img
                        src={performanceData.content.image_url}
                        alt="Content"
                        className="w-full max-w-md h-auto rounded-lg mb-3"
                      />
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline">{performanceData.content.ad_type.replace('_', ' ')}</Badge>
                      <span>•</span>
                      <span>Published {new Date(performanceData.content.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Engagement Rate</span>
                      <span className="font-medium">
                        {((performanceData.summary.total_engagement / performanceData.summary.total_impressions) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${(performanceData.summary.total_engagement / performanceData.summary.total_impressions) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Click Rate</span>
                      <span className="font-medium">
                        {((performanceData.summary.total_clicks / performanceData.summary.total_impressions) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${(performanceData.summary.total_clicks / performanceData.summary.total_impressions) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="border-t my-4" />

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Best Performing Platform</p>
                    <Badge variant="secondary" className="w-full justify-center">
                      {performanceData.summary.best_performing_platform}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Growth Rate</p>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium text-green-600">
                        +{performanceData.summary.growth_rate}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Detailed Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Metrics</CardTitle>
              <CardDescription>
                Daily performance breakdown for the selected time period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="engagement">Engagement</TabsTrigger>
                  <TabsTrigger value="clicks">Clicks</TabsTrigger>
                  <TabsTrigger value="platforms">Platforms</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Impressions</span>
                      </div>
                      <div className="text-2xl font-bold">{formatNumber(performanceData.summary.total_impressions)}</div>
                      <div className="text-xs text-muted-foreground">Total views across all platforms</div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-medium">Engagement</span>
                      </div>
                      <div className="text-2xl font-bold">{formatNumber(performanceData.summary.total_engagement)}</div>
                      <div className="text-xs text-muted-foreground">Likes, shares, comments</div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Reach</span>
                      </div>
                      <div className="text-2xl font-bold">
                        {formatNumber(performanceData.metrics.reduce((sum, m) => sum + m.reach, 0))}
                      </div>
                      <div className="text-xs text-muted-foreground">Unique people reached</div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="engagement" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Engagement Breakdown</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Heart className="h-4 w-4 text-red-500" />
                            <span className="text-sm">Likes</span>
                          </div>
                          <span className="font-medium">{formatNumber(Math.floor(performanceData.summary.total_engagement * 0.6))}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MessageCircle className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">Comments</span>
                          </div>
                          <span className="font-medium">{formatNumber(Math.floor(performanceData.summary.total_engagement * 0.3))}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Share2 className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Shares</span>
                          </div>
                          <span className="font-medium">{formatNumber(Math.floor(performanceData.summary.total_engagement * 0.1))}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Engagement Rate Trend</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-green-600 mb-2">
                            {((performanceData.summary.total_engagement / performanceData.summary.total_impressions) * 100).toFixed(1)}%
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Average engagement rate
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="clicks" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Click Performance</h4>
                      <div className="text-2xl font-bold">{formatNumber(performanceData.summary.total_clicks)}</div>
                      <div className="text-xs text-muted-foreground">Total clicks received</div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Average CTR</h4>
                      <div className="text-2xl font-bold">{formatPercentage(performanceData.summary.average_ctr)}</div>
                      <div className="text-xs text-muted-foreground">Click-through rate</div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="platforms" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {['Facebook', 'Instagram', 'Twitter', 'LinkedIn'].map((platform) => (
                      <Card key={platform}>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold mb-2">
                              {formatNumber(Math.floor(performanceData.summary.total_impressions * Math.random()))}
                            </div>
                            <p className="text-sm text-muted-foreground">{platform}</p>
                            <Badge variant="outline" className="mt-2">
                              {platform === performanceData.summary.best_performing_platform ? 'Best' : 'Active'}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Export Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Export Report</h3>
                  <p className="text-sm text-muted-foreground">
                    Download detailed performance report as PDF or CSV
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    CSV
                  </Button>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
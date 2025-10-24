"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  Share,
  Bookmark,
  Users,
  Zap,
  RefreshCw,
  Image,
  Video,
  FileText,
  Grid3X3
} from 'lucide-react';
import { useContentAnalytics } from '@/hooks/use-analytics';
import { useAnalytics } from '@/hooks/use-analytics';
import { useExport } from '@/hooks/use-export';
import { 
  formatNumber, 
  formatPercentage, 
  generateTimeRange
} from '@/lib/utils/analytics';
import { 
  DEFAULT_TIME_RANGES,
  ANALYTICS_PLATFORMS 
} from '@/lib/constants/analytics-metrics';
import { AnalyticsCharts } from './analytics-charts';
import { ExportFunctionality } from './export-functionality';
import { toast } from 'sonner';

interface ContentAnalyticsProps {
  contentId?: string;
  className?: string;
}

export function ContentAnalytics({ contentId, className }: ContentAnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedContent, setSelectedContent] = useState(contentId || 'content-1');
  const [activeTab, setActiveTab] = useState('overview');
  const [isRealTime, setIsRealTime] = useState(false);

  // Initialize content analytics hook
  const {
    data: contentData,
    isLoading: isLoadingContent,
    error: contentError,
    refetch: refetchContent,
  } = useContentAnalytics(selectedContent, generateTimeRange(selectedPeriod));

  // Initialize general analytics hook for comparison data
  const {
    data: analyticsData,
    isLoading: isLoadingAnalytics,
    updateFilters,
  } = useAnalytics(
    {
      platforms: Object.values(ANALYTICS_PLATFORMS),
      metrics: ['impressions', 'engagement', 'reach', 'shares', 'comments', 'likes'],
    },
    generateTimeRange(selectedPeriod)
  );

  // Initialize export hook
  const {
    exportData,
    isExporting,
    exportHistory,
  } = useExport();

  // Get content type icon
  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'text':
        return <FileText className="h-4 w-4" />;
      case 'carousel':
        return <Grid3X3 className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Get sentiment color
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'negative':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'neutral':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Calculate content performance score
  const performanceScore = useMemo(() => {
    if (!contentData?.data) return 0;
    
    const metrics = contentData.data.metrics;
    const engagement = contentData.data.engagement;
    
    // Simple scoring algorithm (0-100)
    const engagementScore = Math.min(engagement.rate * 10, 50); // Max 50 points
    const reachScore = Math.min((metrics.reach / 10000) * 20, 20); // Max 20 points
    const interactionScore = Math.min((engagement.total / 1000) * 20, 20); // Max 20 points
    const sentimentScore = engagement.sentiment === 'positive' ? 10 : engagement.sentiment === 'neutral' ? 5 : 0; // Max 10 points
    
    return Math.round(engagementScore + reachScore + interactionScore + sentimentScore);
  }, [contentData]);

  // Handle period change
  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
  };

  // Handle content change
  const handleContentChange = (contentId: string) => {
    setSelectedContent(contentId);
  };

  // Handle real-time toggle
  const handleRealTimeToggle = (enabled: boolean) => {
    setIsRealTime(enabled);
  };

  // Handle export
  const handleExport = async (format: string) => {
    try {
      await exportData({
        reportId: `content-${selectedContent}`,
        format: format as 'pdf' | 'csv' | 'excel' | 'json',
        options: {
          includeCharts: true,
          includeRawData: format === 'csv' || format === 'excel',
          dateRange: generateTimeRange(selectedPeriod),
          filters: {
            contentIds: [selectedContent],
          }
        }
      });
      toast.success(`Content export started in ${format.toUpperCase()} format`);
    } catch (error) {
      toast.error('Failed to start content export');
    }
  };

  if (isLoadingContent) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-background">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading content analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (contentError || !contentData?.data) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-background">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-red-600 mb-2">Failed to load content analytics</p>
            <Button onClick={() => refetchContent()} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 space-y-6 p-6 bg-background ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Analytics</h1>
          <p className="text-muted-foreground">
            Performance insights for {contentData.data.contentTitle}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleRealTimeToggle(!isRealTime)}
            className={isRealTime ? 'bg-green-50 border-green-200 text-green-700' : ''}
          >
            <Zap className="mr-2 h-4 w-4" />
            {isRealTime ? 'Real-time ON' : 'Real-time OFF'}
          </Button>
          <Button variant="outline" onClick={() => refetchContent()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <ExportFunctionality
            onExport={handleExport}
            isExporting={isExporting}
            exportHistory={exportHistory}
          />
        </div>
      </div>

      {/* Content Info and Controls */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Content Type</label>
              <div className="flex items-center gap-2">
                {getContentTypeIcon(contentData.data.contentType)}
                <span className="text-sm capitalize">{contentData.data.contentType}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Performance Score</label>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">{performanceScore}</div>
                <div className="text-xs text-muted-foreground">/ 100</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Sentiment</label>
              <Badge className={`${getSentimentColor(contentData.data.engagement.sentiment)} text-xs`}>
                {contentData.data.engagement.sentiment.toUpperCase()}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Period</label>
              <div className="flex gap-2">
                {Object.entries(DEFAULT_TIME_RANGES).slice(0, 4).map(([key, range]) => (
                  <Button
                    key={key}
                    variant={selectedPeriod === range.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePeriodChange(range.value)}
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(contentData.data.metrics.impressions)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              <span className="text-green-600">+12.5%</span>
              <span className="ml-1">from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(contentData.data.engagement.rate)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span>Total: {formatNumber(contentData.data.engagement.total)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reach</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(contentData.data.reach.total)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span>Organic: {formatNumber(contentData.data.reach.organic)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shares</CardTitle>
            <Share className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(contentData.data.metrics.shares)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span>Viral: {formatNumber(contentData.data.reach.viral)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance Over Time
                </CardTitle>
                <CardDescription>
                  Track your content performance across key metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AnalyticsCharts
                  data={analyticsData}
                  type="line"
                  metrics={['impressions', 'engagement', 'reach']}
                  timeRange={generateTimeRange(selectedPeriod)}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Engagement Breakdown
                </CardTitle>
                <CardDescription>
                  Detailed breakdown of engagement metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <Heart className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                      <div className="text-lg font-bold">{formatNumber(contentData.data.engagement.breakdown.likes)}</div>
                      <div className="text-xs text-muted-foreground">Likes</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <MessageCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                      <div className="text-lg font-bold">{formatNumber(contentData.data.engagement.breakdown.comments)}</div>
                      <div className="text-xs text-muted-foreground">Comments</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <Share className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                      <div className="text-lg font-bold">{formatNumber(contentData.data.engagement.breakdown.shares)}</div>
                      <div className="text-xs text-muted-foreground">Shares</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <Bookmark className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                      <div className="text-lg font-bold">{formatNumber(contentData.data.engagement.breakdown.saves)}</div>
                      <div className="text-xs text-muted-foreground">Saves</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Engagement Trends
                </CardTitle>
                <CardDescription>
                  Track engagement metrics over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AnalyticsCharts
                  data={analyticsData}
                  type="area"
                  metrics={['engagement', 'shares', 'comments', 'likes']}
                  timeRange={generateTimeRange(selectedPeriod)}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Top Comments
                </CardTitle>
                <CardDescription>
                  Most engaging comments on your content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {contentData.data.engagement.topComments.map((comment, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm">{comment}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audience" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Age Demographics
                </CardTitle>
                <CardDescription>
                  Age distribution of your audience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AnalyticsCharts
                  data={analyticsData}
                  type="pie"
                  metrics={['reach']}
                  dimension="age_group"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Gender Distribution
                </CardTitle>
                <CardDescription>
                  Gender breakdown of your audience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AnalyticsCharts
                  data={analyticsData}
                  type="doughnut"
                  metrics={['reach']}
                  dimension="gender"
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Geographic Distribution
              </CardTitle>
              <CardDescription>
                Top locations of your audience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(contentData.data.reach.demographics.locations).map(([location, count]) => (
                  <div key={location} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{location}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ 
                            width: `${(count / Math.max(...Object.values(contentData.data.reach.demographics.locations))) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-muted-foreground w-12 text-right">
                        {formatNumber(count)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                AI Insights & Recommendations
              </CardTitle>
              <CardDescription>
                AI-powered insights to improve your content performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {contentData.data.insights.map((insight) => (
                  <div key={insight.id} className={`p-4 rounded-lg border ${
                    insight.impact === 'high' ? 'bg-green-50 border-green-200' :
                    insight.impact === 'medium' ? 'bg-blue-50 border-blue-200' :
                    'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className={`h-4 w-4 ${
                        insight.impact === 'high' ? 'text-green-600' :
                        insight.impact === 'medium' ? 'text-blue-600' :
                        'text-gray-600'
                      }`} />
                      <h4 className={`font-medium text-sm ${
                        insight.impact === 'high' ? 'text-green-800' :
                        insight.impact === 'medium' ? 'text-blue-800' :
                        'text-gray-800'
                      }`}>
                        {insight.title}
                      </h4>
                    </div>
                    <p className={`text-sm ${
                      insight.impact === 'high' ? 'text-green-700' :
                      insight.impact === 'medium' ? 'text-blue-700' :
                      'text-gray-700'
                    }`}>
                      {insight.description}
                    </p>
                    {insight.actionable && (
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          Actionable
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

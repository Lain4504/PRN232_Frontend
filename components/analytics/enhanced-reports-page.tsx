"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp,
  TrendingDown,
  Eye,
  Heart,
  Share,
  Target,
  Zap,
  RefreshCw,
  Plus,
  MoreHorizontal
} from 'lucide-react';
import { 
  SiFacebook, 
  SiInstagram, 
  SiX, 
  SiYoutube, 
  SiTiktok 
} from '@icons-pack/react-simple-icons';
import { useAnalytics } from '@/hooks/use-analytics';
import { useReports } from '@/hooks/use-reports';
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
import { CampaignAnalytics } from './campaign-analytics';
import { ContentAnalytics } from './content-analytics';
import { TeamAnalytics } from './team-analytics';
import { toast } from 'sonner';

export function EnhancedReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(Object.values(ANALYTICS_PLATFORMS));
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['impressions', 'clicks', 'engagement', 'ctr']);
  const [isRealTime, setIsRealTime] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Initialize analytics hook
  const {
    data: analyticsData,
    isLoading: isLoadingAnalytics,
    error: analyticsError,
    filters,
    timeRange,
    isRealTime: isRealTimeEnabled,
    updateFilters,
    updateTimeRange,
    setTimeRangeByPeriod,
    toggleRealTime,
    refresh,
    clearFilters,
  } = useAnalytics(
    {
      platforms: selectedPlatforms,
      metrics: selectedMetrics,
    },
    generateTimeRange(selectedPeriod)
  );

  // Initialize reports hook
  const {
    reports,
    isLoading: isLoadingReports,
    createReport,
    isCreating,
    reportsStats,
    getRecentReports,
  } = useReports();

  // Initialize export hook
  const {
    exportData,
    isExporting,
    exportHistory,
    exportStats,
  } = useExport();

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    if (!analyticsData || analyticsData.length === 0) {
      return {
        totalImpressions: 0,
        totalClicks: 0,
        totalEngagement: 0,
        averageCTR: 0,
        totalReach: 0,
        totalConversions: 0,
        averageCPC: 0,
        averageROI: 0,
      };
    }

    const totals = analyticsData.reduce((acc, item) => {
      acc.impressions += item.metrics.impressions;
      acc.clicks += item.metrics.clicks;
      acc.engagement += item.metrics.engagement;
      acc.reach += item.metrics.reach;
      acc.conversions += item.metrics.conversions;
      acc.cpc += item.metrics.cpc;
      acc.roi += item.metrics.roi;
      return acc;
    }, {
      impressions: 0,
      clicks: 0,
      engagement: 0,
      reach: 0,
      conversions: 0,
      cpc: 0,
      roi: 0,
    });

    const count = analyticsData.length;
    return {
      totalImpressions: totals.impressions,
      totalClicks: totals.clicks,
      totalEngagement: totals.engagement,
      averageCTR: totals.clicks > 0 ? (totals.clicks / totals.impressions) * 100 : 0,
      totalReach: totals.reach,
      totalConversions: totals.conversions,
      averageCPC: totals.cpc / count,
      averageROI: totals.roi / count,
    };
  }, [analyticsData]);

  // Get platform icon
  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook':
        return <SiFacebook className="h-4 w-4" color="#1877F2" />;
      case 'instagram':
        return <SiInstagram className="h-4 w-4" color="#E4405F" />;
      case 'twitter':
        return <SiX className="h-4 w-4" color="#000000" />;
      case 'youtube':
        return <SiYoutube className="h-4 w-4" color="#FF0000" />;
      case 'tiktok':
        return <SiTiktok className="h-4 w-4" color="#000000" />;
      default:
        return <Share className="h-4 w-4" />;
    }
  };

  // Handle period change
  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    setTimeRangeByPeriod(period);
  };

  // Handle platform filter change
  const handlePlatformFilterChange = (platforms: string[]) => {
    setSelectedPlatforms(platforms);
    updateFilters({ platforms });
  };

  // Handle metrics filter change
  const handleMetricsFilterChange = (metrics: string[]) => {
    setSelectedMetrics(metrics);
    updateFilters({ metrics });
  };

  // Handle real-time toggle
  const handleRealTimeToggle = (enabled: boolean) => {
    setIsRealTime(enabled);
    toggleRealTime(enabled);
  };

  // Handle create report
  const handleCreateReport = async () => {
    try {
      await createReport({
        name: `Analytics Report - ${new Date().toLocaleDateString()}`,
        type: 'custom',
        filters: {
          platforms: selectedPlatforms,
          metrics: selectedMetrics,
          dateRange: {
            start: timeRange.start,
            end: timeRange.end,
          }
        },
        format: 'pdf',
      });
      toast.success('Report created successfully');
    } catch (error) {
      toast.error('Failed to create report');
    }
  };

  // Handle export
  const handleExport = async (format: string) => {
    try {
      await exportData({
        reportId: 'current-analytics',
        format: format as 'pdf' | 'csv' | 'excel' | 'json',
        options: {
          includeCharts: true,
          includeRawData: format === 'csv' || format === 'excel',
          dateRange: timeRange,
          filters: {
            platforms: selectedPlatforms,
            metrics: selectedMetrics,
          }
        }
      });
      toast.success(`Export started in ${format.toUpperCase()} format`);
    } catch (error) {
      toast.error('Failed to start export');
    }
  };

  if (isLoadingAnalytics) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-background">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading analytics data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (analyticsError) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-background">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-red-600 mb-2">Failed to load analytics data</p>
            <Button onClick={refresh} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
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
          <h1 className="text-3xl font-bold tracking-tight">Enhanced Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights and performance metrics for your campaigns
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
          <Button variant="outline" onClick={refresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={handleCreateReport} disabled={isCreating}>
            <Plus className="mr-2 h-4 w-4" />
            Create Report
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Platforms</label>
              <div className="flex flex-wrap gap-1">
                {selectedPlatforms.map(platform => (
                  <Badge key={platform} variant="secondary" className="text-xs">
                    {getPlatformIcon(platform)}
                    <span className="ml-1 capitalize">{platform}</span>
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Metrics</label>
              <div className="flex flex-wrap gap-1">
                {selectedMetrics.map(metric => (
                  <Badge key={metric} variant="outline" className="text-xs">
                    {metric}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isRealTime ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="text-sm text-muted-foreground">
                  {isRealTime ? 'Live updates' : 'Static data'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(summaryMetrics.totalImpressions)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              <span className="text-green-600">+12.5%</span>
              <span className="ml-1">from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(summaryMetrics.totalClicks)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              <span className="text-green-600">+8.2%</span>
              <span className="ml-1">from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(summaryMetrics.totalEngagement)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              <span className="text-green-600">+15.3%</span>
              <span className="ml-1">from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average CTR</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(summaryMetrics.averageCTR)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
              <span className="text-red-600">-2.1%</span>
              <span className="ml-1">from last period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
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
                  Track your key metrics across the selected time period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AnalyticsCharts
                  data={analyticsData}
                  type="line"
                  metrics={selectedMetrics}
                  timeRange={timeRange}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share className="h-5 w-5" />
                  Platform Performance
                </CardTitle>
                <CardDescription>
                  Performance breakdown by platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AnalyticsCharts
                  data={analyticsData}
                  type="bar"
                  metrics={['impressions', 'clicks']}
                  dimension="platform"
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                AI Insights & Recommendations
              </CardTitle>
              <CardDescription>
                AI-powered insights to improve your campaign performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <h4 className="font-medium text-green-800">Performance Boost</h4>
                  </div>
                  <p className="text-sm text-green-700">
                    Your Instagram posts are performing 40% better than average. Consider increasing your Instagram posting frequency.
                  </p>
                </div>
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    <h4 className="font-medium text-blue-800">Optimization Tip</h4>
                  </div>
                  <p className="text-sm text-blue-700">
                    Posts with images perform 2.3x better than text-only posts. Consider adding visuals to your content.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <CampaignAnalytics />
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <ContentAnalytics />
        </TabsContent>

        <TabsContent value="teams" className="space-y-4">
          <TeamAnalytics />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Recent Reports</h3>
              <p className="text-sm text-muted-foreground">
                {reportsStats.total} total reports, {reportsStats.ready} ready
              </p>
            </div>
            <ExportFunctionality
              onExport={handleExport}
              isExporting={isExporting}
              exportHistory={exportHistory}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {getRecentReports(6).map((report) => (
              <Card key={report.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{report.name}</CardTitle>
                    <Badge variant={report.status === 'ready' ? 'default' : 'secondary'}>
                      {report.status}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    {new Date(report.generatedAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground capitalize">
                      {report.type} • {report.format.toUpperCase()}
                    </span>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

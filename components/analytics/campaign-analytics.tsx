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
  Target,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Zap,
  RefreshCw,
} from 'lucide-react';
import { useCampaignAnalytics } from '@/hooks/use-analytics';
import { useAnalytics } from '@/hooks/use-analytics';
import { useExport } from '@/hooks/use-export';
import { 
  formatNumber, 
  formatPercentage, 
  formatCurrency,
  generateTimeRange
} from '@/lib/utils/analytics';
import { 
  DEFAULT_TIME_RANGES,
  ANALYTICS_PLATFORMS 
} from '@/lib/constants/analytics-metrics';
import { AnalyticsCharts } from './analytics-charts';
import { ExportFunctionality } from './export-functionality';
import { toast } from 'sonner';

interface CampaignAnalyticsProps {
  campaignId?: string;
  className?: string;
}

export function CampaignAnalytics({ campaignId, className }: CampaignAnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedCampaign, setSelectedCampaign] = useState(campaignId || 'campaign-1');
  const [activeTab, setActiveTab] = useState('overview');
  const [isRealTime, setIsRealTime] = useState(false);

  // Initialize campaign analytics hook
  const {
    data: campaignData,
    isLoading: isLoadingCampaign,
    error: campaignError,
    refetch: refetchCampaign,
  } = useCampaignAnalytics(selectedCampaign, generateTimeRange(selectedPeriod));

  // Initialize general analytics hook for comparison data
  const {
    data: analyticsData,
    isLoading: isLoadingAnalytics,
    updateFilters,
  } = useAnalytics(
    {
      platforms: Object.values(ANALYTICS_PLATFORMS),
      metrics: ['impressions', 'clicks', 'conversions', 'ctr', 'cpc', 'roi'],
    },
    generateTimeRange(selectedPeriod)
  );

  // Initialize export hook
  const {
    exportData,
    isExporting,
    exportHistory,
  } = useExport();

  // Calculate campaign performance metrics
  const performanceMetrics = useMemo(() => {
    if (!campaignData) return null;

    const metrics = campaignData.metrics;
    const performance = campaignData.performance;
    
    return {
      budgetUtilization: performance.budget > 0 ? (performance.spent / performance.budget) * 100 : 0,
      remainingBudget: performance.remaining,
      daysRemaining: performance.endDate ? 
        Math.ceil((new Date(performance.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0,
      averageDailySpend: performance.startDate ? 
        performance.spent / Math.ceil((new Date().getTime() - new Date(performance.startDate).getTime()) / (1000 * 60 * 60 * 24)) : 0,
      projectedSpend: 0, // Would calculate based on current spend rate
      efficiency: metrics.roi > 0 ? metrics.roi * 100 : 0,
    };
  }, [campaignData]);

  // Get campaign status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get alert severity color
  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Handle period change
  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
  };

  // Handle campaign change
  const handleCampaignChange = (campaignId: string) => {
    setSelectedCampaign(campaignId);
  };

  // Handle real-time toggle
  const handleRealTimeToggle = (enabled: boolean) => {
    setIsRealTime(enabled);
  };

  // Handle export
  const handleExport = async (format: string) => {
    try {
      await exportData({
        reportId: `campaign-${selectedCampaign}`,
        format: format as 'pdf' | 'csv' | 'excel' | 'json',
        options: {
          includeCharts: true,
          includeRawData: format === 'csv' || format === 'excel',
          dateRange: generateTimeRange(selectedPeriod),
          filters: {
            campaignIds: [selectedCampaign],
          }
        }
      });
      toast.success(`Campaign export started in ${format.toUpperCase()} format`);
    } catch (error) {
      toast.error('Failed to start campaign export');
    }
  };

  if (isLoadingCampaign) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-background">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading campaign analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (campaignError || !campaignData) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-background">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-red-600 mb-2">Failed to load campaign analytics</p>
            <Button onClick={refetchCampaign} variant="outline" size="sm">
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
          <h1 className="text-3xl font-bold tracking-tight">Campaign Analytics</h1>
          <p className="text-muted-foreground">
            Detailed performance insights for {campaignData.campaignName}
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
          <Button variant="outline" onClick={refetchCampaign}>
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

      {/* Campaign Status and Controls */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Campaign Status</label>
              <Badge className={`${getStatusColor(campaignData.performance.status)} text-xs`}>
                {campaignData.performance.status.toUpperCase()}
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

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Budget Status</label>
              <div className="text-sm">
                <div className="flex justify-between">
                  <span>Spent:</span>
                  <span className="font-medium">{formatCurrency(campaignData.performance.spent)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Remaining:</span>
                  <span className="font-medium">{formatCurrency(campaignData.performance.remaining)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Performance</label>
              <div className="text-sm">
                <div className="flex justify-between">
                  <span>ROI:</span>
                  <span className="font-medium text-green-600">{formatPercentage(campaignData.metrics.roi * 100)}</span>
                </div>
                <div className="flex justify-between">
                  <span>CTR:</span>
                  <span className="font-medium">{formatPercentage(campaignData.metrics.ctr)}</span>
                </div>
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
            <div className="text-2xl font-bold">{formatNumber(campaignData.metrics.impressions)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {campaignData.trends.find(t => t.metric === 'impressions') && (
                <>
                  {campaignData.trends.find(t => t.metric === 'impressions')?.changeType === 'increase' ? (
                    <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                  )}
                  <span className={campaignData.trends.find(t => t.metric === 'impressions')?.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}>
                    {formatPercentage(Math.abs(campaignData.trends.find(t => t.metric === 'impressions')?.change || 0))}
                  </span>
                  <span className="ml-1">from last period</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(campaignData.metrics.clicks)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {campaignData.trends.find(t => t.metric === 'clicks') && (
                <>
                  {campaignData.trends.find(t => t.metric === 'clicks')?.changeType === 'increase' ? (
                    <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                  )}
                  <span className={campaignData.trends.find(t => t.metric === 'clicks')?.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}>
                    {formatPercentage(Math.abs(campaignData.trends.find(t => t.metric === 'clicks')?.change || 0))}
                  </span>
                  <span className="ml-1">from last period</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(campaignData.metrics.conversions)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span>Conversion Rate: {formatPercentage((campaignData.metrics.conversions / campaignData.metrics.clicks) * 100)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Per Click</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(campaignData.metrics.cpc)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span>Total Spend: {formatCurrency(campaignData.performance.spent)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
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
                  Track your campaign performance across key metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AnalyticsCharts
                  data={analyticsData}
                  type="line"
                  metrics={['impressions', 'clicks', 'conversions']}
                  timeRange={generateTimeRange(selectedPeriod)}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Budget & Spend Analysis
                </CardTitle>
                <CardDescription>
                  Monitor your budget utilization and spending patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Budget Utilization</span>
                    <span className="text-sm text-muted-foreground">
                      {formatPercentage(performanceMetrics?.budgetUtilization || 0)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${Math.min(performanceMetrics?.budgetUtilization || 0, 100)}%` }}
                    ></div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Total Budget</div>
                      <div className="font-medium">{formatCurrency(campaignData.performance.budget)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Remaining</div>
                      <div className="font-medium">{formatCurrency(campaignData.performance.remaining)}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Campaign Alerts
              </CardTitle>
              <CardDescription>
                Important notifications and performance alerts for your campaign
              </CardDescription>
            </CardHeader>
            <CardContent>
              {campaignData.alerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No alerts at this time</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {campaignData.alerts.map((alert) => (
                    <div key={alert.id} className={`p-4 rounded-lg border ${getAlertColor(alert.severity)}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="font-medium text-sm">{alert.title}</span>
                            <Badge variant="outline" className="text-xs">
                              {alert.severity}
                            </Badge>
                          </div>
                          <p className="text-sm">{alert.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(alert.triggeredAt).toLocaleString()}
                          </p>
                        </div>
                        {!alert.isRead && (
                          <Badge variant="default" className="text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

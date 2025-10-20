"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp,
  TrendingDown,
  Eye,
  Heart,
  Share,
  Users,
  Calendar,
  Download,
  Filter,
  Target,
  Zap,
} from "lucide-react";
import { 
  SiFacebook, 
  SiInstagram, 
  SiX, 
  SiYoutube, 
  SiTiktok 
} from "@icons-pack/react-simple-icons";
import { authApi, reportsApi } from "@/lib/mock-api";
import { User, PerformanceReport } from "@/lib/types/aisam-types";
import { toast } from "sonner";

export function ReportsManagement() {
  const [user, setUser] = useState<User | null>(null);
  const [report, setReport] = useState<PerformanceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("7");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const userResponse = await authApi.getCurrentUser();
        if (userResponse.success && userResponse.data) {
          setUser(userResponse.data);
        }
        
        // Get performance report
        const reportResponse = await reportsApi.getPerformanceReport(`Last ${selectedPeriod} days`);
        if (reportResponse.success) {
          setReport(reportResponse.data);
        }
      } catch (error) {
        console.error('Failed to load reports data:', error);
        toast.error('Failed to load reports data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedPeriod]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getTrendIcon = (value: number) => {
    return value > 0 ? (
      <TrendingUp className="h-4 w-4 text-chart-2" />
    ) : (
      <TrendingDown className="h-4 w-4 text-destructive" />
    );
  };

  const getTrendColor = (value: number) => {
    return value > 0 ? 'text-chart-2' : 'text-destructive';
  };

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

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-background">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading reports...</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Performance Reports</h1>
          <p className="text-muted-foreground">
            Detailed analytics and insights for your campaigns
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Period Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Report Period:</span>
            <div className="flex gap-2">
              {['7', '30', '90'].map(period => (
                <Button
                  key={period}
                  variant={selectedPeriod === period ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPeriod(period)}
                >
                  Last {period} days
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {report && (
        <>
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(report.total_impressions)}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {getTrendIcon(12.5)}
                  <span className={`ml-1 ${getTrendColor(12.5)}`}>+12.5%</span>
                  <span className="ml-1">from last period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Engagement</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(report.total_engagement)}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {getTrendIcon(8.2)}
                  <span className={`ml-1 ${getTrendColor(8.2)}`}>+8.2%</span>
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
                <div className="text-2xl font-bold">{formatNumber(report.total_clicks)}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {getTrendIcon(15.3)}
                  <span className={`ml-1 ${getTrendColor(15.3)}`}>+15.3%</span>
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
                <div className="text-2xl font-bold">{report.average_ctr}%</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {getTrendIcon(2.1)}
                  <span className={`ml-1 ${getTrendColor(2.1)}`}>+2.1%</span>
                  <span className="ml-1">from last period</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance Over Time
              </CardTitle>
              <CardDescription>
                Daily performance metrics for the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Chart visualization would be here</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Integration with charting library like Recharts or Chart.js
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Metrics */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Top Performing Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Top Performing Content
                </CardTitle>
                <CardDescription>
                  Your best performing posts this period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { title: "AI Analytics Platform Launch", impressions: 12500, engagement: 450, ctr: 3.6 },
                    { title: "Smart Automation Suite Demo", impressions: 8900, engagement: 320, ctr: 3.6 },
                    { title: "Bamboo Phone Case Feature", impressions: 6700, engagement: 280, ctr: 4.2 },
                  ].map((content, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{content.title}</h4>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <span>{formatNumber(content.impressions)} impressions</span>
                          <span>{content.engagement} engagement</span>
                          <span>{content.ctr}% CTR</span>
                        </div>
                      </div>
                      <Badge variant="secondary">#{index + 1}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Platform Performance */}
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
                <div className="space-y-4">
                  {[
                    { platform: "Facebook", impressions: 45000, engagement: 1800, ctr: 4.0 },
                    { platform: "Instagram", impressions: 32000, engagement: 2100, ctr: 6.6 },
                    { platform: "LinkedIn", impressions: 18000, engagement: 900, ctr: 5.0 },
                    { platform: "Twitter", impressions: 12000, engagement: 600, ctr: 5.0 },
                  ].map((platform, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                          {getPlatformIcon(platform.platform)}
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{platform.platform}</h4>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{formatNumber(platform.impressions)} impressions</span>
                            <span>{platform.engagement} engagement</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{platform.ctr}% CTR</div>
                        <div className="text-xs text-muted-foreground">Avg. CTR</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Insights */}
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
                <div className="p-4 bg-chart-2/10 border border-chart-2/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-chart-2" />
                    <h4 className="font-medium text-chart-2">Performance Boost</h4>
                  </div>
                  <p className="text-sm text-chart-2">
                    Your Instagram posts are performing 40% better than average. Consider increasing your Instagram posting frequency.
                  </p>
                </div>
                
                <div className="p-4 bg-chart-1/10 border border-chart-1/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-chart-1" />
                    <h4 className="font-medium text-chart-1">Optimization Tip</h4>
                  </div>
                  <p className="text-sm text-chart-1">
                    Posts with images perform 2.3x better than text-only posts. Consider adding visuals to your content.
                  </p>
                </div>
                
                <div className="p-4 bg-chart-4/10 border border-chart-4/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-chart-4" />
                    <h4 className="font-medium text-chart-4">Timing Insight</h4>
                  </div>
                  <p className="text-sm text-chart-4">
                    Your audience is most active on weekdays between 2-4 PM. Schedule more posts during this time.
                  </p>
                </div>
                
                <div className="p-4 bg-chart-3/10 border border-chart-3/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-chart-3" />
                    <h4 className="font-medium text-chart-3">Audience Growth</h4>
                  </div>
                  <p className="text-sm text-chart-3">
                    Your follower growth rate is 15% above industry average. Keep up the great content strategy!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

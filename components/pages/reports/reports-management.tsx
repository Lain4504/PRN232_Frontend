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
// Removed mock-api import - using real API instead
import { User, PerformanceReport } from "@/lib/types/aisam-types";
import { toast } from "sonner";
import { api, endpoints } from "@/lib/api";

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
        const userResponse = await api.get<User>(endpoints.userProfile);
        if (userResponse.success && userResponse.data) {
          setUser(userResponse.data);
        }

        // Get performance report - using a custom endpoint
        const reportResponse = await api.get<PerformanceReport>(`/reports/performance?period=${selectedPeriod}`);
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
      <TrendingUp className="h-4 w-4 text-emerald-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-destructive" />
    );
  };

  const getTrendColor = (value: number) => {
    return value > 0 ? 'text-emerald-500' : 'text-destructive';
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook':
        return <SiFacebook className="h-4 w-4" color="#1877F2" />;
      case 'instagram':
        return <SiInstagram className="h-4 w-4" color="#ff006e" />;
      case 'twitter':
        return <SiX className="h-4 w-4 text-foreground" />;
      case 'youtube':
        return <SiYoutube className="h-4 w-4" color="#FF0000" />;
      case 'tiktok':
        return <SiTiktok className="h-4 w-4 text-foreground" />;
      default:
        return <Share className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-full overflow-x-hidden font-fira-sans">
        <div className="space-y-10 p-6 lg:p-10 bg-background">
          <div className="flex flex-col items-center justify-center h-[60vh] space-y-6">
            <div className="h-20 w-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary/70 animate-pulse italic">Loading Analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto font-fira-sans">
      <div className="space-y-8 p-6 lg:p-10 bg-background min-h-screen">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Performance Analytics
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Track your engagement and performance metrics across all connected accounts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-lg h-10 px-4 font-semibold">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button className="rounded-lg h-10 px-6 font-semibold">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border bg-card shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-muted-foreground mr-2">Period:</span>
            {['7', '30', '90'].map(period => (
              <Button
                key={period}
                variant={selectedPeriod === period ? "default" : "ghost"}
                size="sm"
                className={`rounded-md px-4 font-semibold ${selectedPeriod === period ? '' : 'text-muted-foreground'}`}
                onClick={() => setSelectedPeriod(period)}
              >
                {period}D
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg text-sm font-medium border">
            <Calendar className="h-4 w-4 text-muted-foreground mr-1" />
            <span>Last {selectedPeriod} days</span>
          </div>
        </div>

        {report && (
          <div className="space-y-8">
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Impressions", value: report.total_impressions, icon: Eye, trend: 12.5, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/10" },
                { title: "Engagement", value: report.total_engagement, icon: Heart, trend: 8.2, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-900/10" },
                { title: "Clicks", value: report.total_clicks, icon: Target, trend: 15.3, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/10" },
                { title: "Avg. CTR", value: `${report.average_ctr}%`, icon: BarChart3, trend: 2.1, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/10" },
              ].map((metric) => (
                <Card key={metric.title} className="rounded-xl border shadow-sm group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`h-10 w-10 rounded-lg ${metric.bg} flex items-center justify-center ${metric.color}`}>
                        <metric.icon className="h-5 w-5" />
                      </div>
                      <div className="flex items-center gap-1.5 font-bold text-xs" style={{ color: metric.trend > 0 ? '#10b981' : '#ef4444' }}>
                        {getTrendIcon(metric.trend)}
                        <span>{metric.trend}%</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold tracking-tight">
                        {typeof metric.value === 'number' ? formatNumber(metric.value) : metric.value}
                      </p>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{metric.title}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Main Chart Card */}
            <Card className="rounded-xl border shadow-sm overflow-hidden">
              <CardHeader className="border-b bg-muted/10 p-6">
                <CardTitle className="text-lg font-bold">Performance Trends</CardTitle>
                <CardDescription>Visualizing engagement over the last {selectedPeriod} days</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-80 w-full bg-muted/5 rounded-lg border border-dashed flex items-center justify-center relative overflow-hidden">
                  <div className="text-center space-y-4">
                    <div className="relative h-12 w-12 mx-auto">
                      <div className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                      <BarChart3 className="h-5 w-5 text-primary absolute inset-0 m-auto" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">Generating Chart Data...</p>
                      <p className="text-xs text-muted-foreground">Preparing metrics visualization</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Content */}
              <div className="space-y-4">
                <h2 className="text-lg font-bold px-1">Top Performing Content</h2>
                <div className="space-y-3">
                  {[
                    { title: "AI Analytics Platform Launch", impressions: 12500, ctr: 3.6, color: "bg-blue-500" },
                    { title: "Smart Automation Suite Demo", impressions: 8900, ctr: 3.6, color: "bg-emerald-500" },
                    { title: "Bamboo Phone Case Feature", impressions: 6700, ctr: 4.2, color: "bg-rose-500" },
                  ].map((content, index) => (
                    <Card key={index} className="rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-xs ${content.color}`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-sm font-bold line-clamp-1">{content.title}</p>
                            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Top Performance</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-primary">{content.ctr}% CTR</p>
                          <p className="text-[10px] text-muted-foreground uppercase font-semibold">{formatNumber(content.impressions)} Views</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* AI Insights */}
              <div className="space-y-4">
                <h2 className="text-lg font-bold px-1">AI Actionable Insights</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { title: "Platform Strategy", icon: Zap, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/10", text: "Instagram posts are performing 40% above average." },
                    { title: "Visual Advice", icon: Eye, color: "text-primary", bg: "bg-primary/5", text: "High-contrast visuals get 2.3x better engagement." },
                    { title: "Scheduling", icon: Calendar, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/10", text: "Peak activity detected between 2 PM - 4 PM." },
                    { title: "Audience Growth", icon: Users, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/10", text: "Growth rate is 15% above industry average." },
                  ].map((insight, idx) => (
                    <Card key={idx} className="rounded-xl border shadow-sm">
                      <CardContent className="p-5 space-y-3">
                        <div className={`h-8 w-8 rounded-lg ${insight.bg} ${insight.color} flex items-center justify-center`}>
                          <insight.icon className="h-4 w-4" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold uppercase text-foreground">{insight.title}</h4>
                          <p className="text-xs text-muted-foreground leading-relaxed font-medium">{insight.text}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

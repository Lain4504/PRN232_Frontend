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
      <div className="space-y-12 p-6 lg:p-10 bg-background">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-2 w-8 bg-primary rounded-full" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/70">Reports</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-none">
              Performance <span className="text-primary italic">Analytics</span>
            </h1>
            <p className="text-lg text-muted-foreground font-medium max-w-2xl tracking-tight leading-relaxed">
              Track your engagement and performance metrics across all connected accounts.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" className="h-14 px-8 rounded-2xl border-border/40 font-bold text-[10px] uppercase tracking-widest hover:bg-muted/50 transition-all">
              <Download className="mr-3 h-4 w-4 stroke-[2.5]" />
              Export Data
            </Button>
            <Button className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/95 text-primary-foreground font-bold uppercase tracking-widest text-xs shadow-2xl shadow-primary/30 transition-all hover:scale-105">
              <Filter className="mr-3 h-4 w-4 stroke-[2.5]" />
              Filters
            </Button>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-6 p-4 bg-muted/20 border border-border/40 rounded-[2rem] w-fit">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-4">Date Range:</span>
          <div className="flex gap-2">
            {['7', '30', '90'].map(period => (
              <Button
                key={period}
                variant={selectedPeriod === period ? "default" : "ghost"}
                className={`h-10 px-6 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all
                  ${selectedPeriod === period ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'}`}
                onClick={() => setSelectedPeriod(period)}
              >
                {period} Days
              </Button>
            ))}
          </div>
        </div>

        {report && (
          <div className="space-y-12">
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Impressions", value: report.total_impressions, icon: Eye, trend: 12.5, color: "text-blue-500" },
                { title: "Engagement", value: report.total_engagement, icon: Heart, trend: 8.2, color: "text-rose-500" },
                { title: "Clicks", value: report.total_clicks, icon: Target, trend: 15.3, color: "text-amber-500" },
                { title: "CTR (Click Rate)", value: `${report.average_ctr}%`, icon: BarChart3, trend: 2.1, color: "text-emerald-500" },
              ].map((metric) => (
                <Card key={metric.title} className="bg-card/40 backdrop-blur-3xl border-border/40 hover:border-primary/50 rounded-[2rem] transition-all duration-300 shadow-xl shadow-black/5 overflow-hidden group">
                  <CardContent className="p-8 space-y-4 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-between">
                      <div className={`h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center ${metric.color} transition-transform group-hover:scale-110 duration-500`}>
                        <metric.icon className="h-6 w-6 stroke-[2.5]" />
                      </div>
                      <div className="hidden sm:flex items-center gap-2">
                        {getTrendIcon(metric.trend)}
                        <span className={`text-[10px] font-bold tracking-widest ${getTrendColor(metric.trend)}`}>+{metric.trend}%</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-4xl font-black font-fira-mono tracking-tighter tabular-nums text-foreground">
                        {typeof metric.value === 'number' ? formatNumber(metric.value) : metric.value}
                      </p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{metric.title}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Performance Chart */}
            <Card className="bg-card/40 backdrop-blur-3xl border-border/40 rounded-[2rem] shadow-2xl overflow-hidden group">
              <CardHeader className="p-10 pb-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-1 bg-primary rounded-full transition-all group-hover:h-14 duration-500" />
                  <div>
                    <CardTitle className="text-2xl font-bold uppercase tracking-tight">Performance Trends</CardTitle>
                    <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-60">Engagement over last {selectedPeriod} days</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-10 pt-4">
                <div className="h-80 w-full bg-muted/20 border border-border/40 rounded-[1.5rem] flex flex-col items-center justify-center overflow-hidden relative">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
                  <div className="text-center relative z-10 space-y-6">
                    <div className="relative">
                      <div className="h-20 w-20 rounded-full border-2 border-primary/20 border-t-primary animate-spin mx-auto scale-110" />
                      <BarChart3 className="h-8 w-8 text-primary absolute inset-0 m-auto stroke-[2.5]" />
                    </div>
                    <div className="space-y-2">
                      <p className="font-bold uppercase tracking-[0.3em] text-xs text-primary/70">Loading Chart...</p>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">Preparing visualization</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Insights and Top Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

              {/* Top Content */}
              <div className="lg:col-span-12 space-y-6">
                <div className="flex items-center gap-4 px-4">
                  <div className="h-5 w-1 bg-primary rounded-full" />
                  <h2 className="text-xl font-bold uppercase tracking-tight">Top Performing Content</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { title: "AI Analytics Platform Launch", impressions: 12500, engagement: 450, ctr: 3.6, color: "bg-blue-500" },
                    { title: "Smart Automation Suite Demo", impressions: 8900, engagement: 320, ctr: 3.6, color: "bg-emerald-500" },
                    { title: "Bamboo Phone Case Feature", impressions: 6700, engagement: 280, ctr: 4.2, color: "bg-rose-500" },
                  ].map((content, index) => (
                    <div key={index} className="group p-8 rounded-[2rem] bg-card/40 backdrop-blur-xl border border-border/40 hover:border-primary/50 transition-all duration-300 shadow-xl shadow-black/5 space-y-6 relative overflow-hidden">
                      <div className={`absolute top-0 right-0 p-8 font-fira-mono font-black text-6xl opacity-5 italic group-hover:scale-110 transition-transform duration-700`}>0{index + 1}</div>
                      <div className="space-y-2 relative z-10">
                        <Badge className="h-6 px-3 rounded-lg bg-primary/10 text-primary border-none font-bold text-[9px] uppercase tracking-widest">Top Rated</Badge>
                        <h4 className="font-bold text-lg uppercase tracking-tight line-clamp-1">{content.title}</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4 relative z-10 pt-2 border-t border-border/20">
                        <div className="space-y-1">
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Impressions</p>
                          <p className="text-sm font-black font-fira-mono tracking-tight tabular-nums">{formatNumber(content.impressions)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-bold text-primary uppercase tracking-widest">CTR</p>
                          <p className="text-sm font-black font-fira-mono tracking-tight text-primary tabular-nums">{content.ctr}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Insights */}
              <div className="lg:col-span-12 space-y-6">
                <div className="flex items-center gap-4 px-4">
                  <div className="h-5 w-1 bg-primary rounded-full" />
                  <h2 className="text-xl font-bold uppercase tracking-tight">AI Insights</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { title: "Platform Optimization", icon: TrendingUp, color: "bg-emerald-500", text: "Instagram posts are performing 40% above average. Consider posting more frequently.", border: "border-emerald-500/30" },
                    { title: "Content Strategy", icon: Target, color: "bg-primary", text: "High-contrast visuals get 2.3x better engagement. Use more bold images.", border: "border-primary/30" },
                    { title: "Best Time to Post", icon: Calendar, color: "bg-blue-500", text: "Highest activity detected between 2 PM - 4 PM. Schedule posts accordingly.", border: "border-blue-500/30" },
                    { title: "Growth Analysis", icon: Users, color: "bg-amber-500", text: "Growth rate is 15% above industry average. Keep up the momentum.", border: "border-amber-500/30" },
                  ].map((insight, idx) => (
                    <div key={idx} className={`p-8 rounded-[2rem] bg-card/40 backdrop-blur-xl border ${insight.border} space-y-6 group hover:scale-[1.02] transition-transform duration-500`}>
                      <div className={`h-14 w-14 rounded-2xl ${insight.color} text-white flex items-center justify-center shadow-2xl shadow-black/20 shrink-0`}>
                        <insight.icon className="h-7 w-7 stroke-[2.5]" />
                      </div>
                      <div className="space-y-3">
                        <h4 className="font-bold uppercase tracking-tight text-foreground">{insight.title}</h4>
                        <p className="text-sm font-medium text-muted-foreground tracking-tight leading-relaxed">{insight.text}</p>
                      </div>
                    </div>
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

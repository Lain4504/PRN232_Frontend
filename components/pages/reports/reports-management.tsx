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
import { User, PerformanceReport } from "@/lib/types/omniadly-types";
import { toast } from "sonner";
import { api, endpoints } from "@/lib/api";
import { cn } from "@/lib/utils";

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

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border/50 pb-10 transition-all duration-300">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-primary/5 text-primary border border-primary/10">
                <BarChart3 className="size-4" />
              </div>
              <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest italic">Phân tích & Thống kê • Analytics Engine</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight italic uppercase">
              Báo cáo Hiệu suất
            </h1>
            <p className="text-sm text-muted-foreground font-medium max-w-xl italic leading-relaxed">
              Theo dõi các chỉ số tương tác và hiệu suất chiến dịch đồng bộ trên toàn mạng lưới Node.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" className="h-11 px-6 rounded-md border-border font-bold text-xs uppercase tracking-wider hover:bg-muted shadow-sm transition-all hover:-translate-y-0.5">
              <Download className="mr-2 h-4 w-4" />
              Xuất dữ liệu
            </Button>
            <Button className="h-11 px-8 rounded-md font-bold text-xs uppercase tracking-wider shadow-lg transition-all hover:-translate-y-0.5">
              <Filter className="mr-2 h-4 w-4" />
              Bộ lọc Node
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-4 rounded-lg border border-border bg-card shadow-sm transition-all hover:bg-muted/50">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 italic">Chu kỳ Node:</span>
            <div className="flex items-center gap-2 p-1 bg-muted/30 rounded-md border border-border/50">
              {['7', '30', '90'].map(period => (
                <Button
                  key={period}
                  variant={selectedPeriod === period ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "h-8 rounded-md px-4 font-bold text-[10px] uppercase tracking-wider transition-all",
                    selectedPeriod === period ? 'bg-background shadow-sm' : 'text-muted-foreground/60'
                  )}
                  onClick={() => setSelectedPeriod(period)}
                >
                  {period}D
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 h-10 bg-primary/5 rounded-md border border-primary/10 text-[10px] font-bold text-primary uppercase tracking-widest italic shadow-inner">
            <Calendar className="h-4 w-4 text-primary/40" />
            <span>{selectedPeriod} Ngày gần nhất</span>
          </div>
        </div>

        {report && (
          <div className="space-y-8">
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Số lượt hiển thị", value: report.total_impressions, icon: Eye, trend: 12.5, color: "text-blue-600", bg: "bg-blue-500/5" },
                { title: "Độ tương tác", value: report.total_engagement, icon: Heart, trend: 8.2, color: "text-rose-600", bg: "bg-rose-500/5" },
                { title: "Số lượt click", value: report.total_clicks, icon: Target, trend: 15.3, color: "text-amber-600", bg: "bg-amber-500/5" },
                { title: "Tỷ lệ CTR Trung bình", value: `${report.average_ctr}%`, icon: BarChart3, trend: 2.1, color: "text-emerald-600", bg: "bg-emerald-500/5" },
              ].map((metric) => (
                <Card key={metric.title} className="rounded-lg border border-border bg-card shadow-sm group hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className={`size-10 rounded-md ${metric.bg} flex items-center justify-center ${metric.color} shadow-inner border border-current/10`}>
                        <metric.icon className="size-5" />
                      </div>
                      <div className="flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider" style={{ color: metric.trend > 0 ? '#10b981' : '#ef4444' }}>
                        {getTrendIcon(metric.trend)}
                        <span>{metric.trend > 0 ? '+' : ''}{metric.trend}%</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-3xl font-bold tracking-tight italic">
                        {typeof metric.value === 'number' ? formatNumber(metric.value) : metric.value}
                      </p>
                      <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest italic">{metric.title}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="rounded-lg border border-border bg-card shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
              <CardHeader className="border-b border-border/50 bg-muted/20 p-8">
                <CardTitle className="text-lg font-bold italic uppercase tracking-tight">Biểu đồ Xu hướng Hiệu suất</CardTitle>
                <CardDescription className="text-sm font-medium italic text-muted-foreground/60">Trực quan hóa sự biến động của lượt tương tác trong {selectedPeriod} ngày gần nhất</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="h-96 w-full bg-muted/5 rounded-lg border border-dashed border-border/50 flex items-center justify-center relative overflow-hidden group">
                  <div className="text-center space-y-6">
                    <div className="relative h-16 w-16 mx-auto">
                      <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                      <BarChart3 className="size-6 text-primary absolute inset-0 m-auto opacity-30 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-bold italic uppercase tracking-widest text-muted-foreground/40">Đang khởi tạo Visual Data...</p>
                      <p className="text-[10px] font-bold text-muted-foreground/20 italic uppercase tracking-tighter">Đồng bộ hóa các điểm dữ liệu Node Analytics</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Top Content */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 px-1">
                  <div className="size-2 rounded-full bg-primary" />
                  <h2 className="text-lg font-bold italic uppercase tracking-tight text-foreground/80">Nội dung Hiệu suất cao nhất</h2>
                </div>
                <div className="space-y-4">
                  {[
                    { title: "Phát hành Nền tảng AI Analytics 2.0", impressions: 12500, ctr: 3.6, color: "bg-blue-500", label: "PHÁT HÀNH MỚI" },
                    { title: "Bộ giải pháp Tự động hóa Thông minh", impressions: 8900, ctr: 3.6, color: "bg-emerald-500", label: "HƯỚNG DẪN" },
                    { title: "Ra mắt Phụ kiện Ốp lưng Tre Bamboo", impressions: 6700, ctr: 4.2, color: "bg-rose-500", label: "TÍNH NĂNG" },
                  ].map((content, index) => (
                    <Card key={index} className="rounded-lg border border-border bg-card shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden">
                      <CardContent className="p-5 flex items-center justify-between">
                        <div className="flex items-center gap-5">
                          <div className={`size-10 rounded-md flex items-center justify-center text-white font-bold text-xs shadow-md border border-white/10 ${content.color} transition-transform group-hover:scale-110`}>
                            {index + 1}
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-bold italic line-clamp-1 text-foreground/80">{content.title}</p>
                            <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">{content.label}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-primary italic">{content.ctr}% CTR</p>
                          <p className="text-[11px] font-bold text-muted-foreground/40 uppercase tracking-tighter italic">{formatNumber(content.impressions)} Lượt xem</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* AI Insights */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 px-1">
                  <div className="size-2 rounded-full bg-primary" />
                  <h2 className="text-lg font-bold italic uppercase tracking-tight text-foreground/80">Gợi ý Hành động từ AI</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[
                    { title: "Chiến lược Nền tảng", icon: Zap, color: "text-emerald-600", bg: "bg-emerald-500/5", text: "Các bài đăng Instagram đang có hiệu suất cao hơn 40% so với trung bình." },
                    { title: "Lời khuyên Hình ảnh", icon: Eye, color: "text-primary", bg: "bg-primary/5", text: "Hình ảnh có độ tương phản cao mang lại tương tác gấp 2.3 lần." },
                    { title: "Tối ưu Lịch đăng", icon: Calendar, color: "text-blue-600", bg: "bg-blue-500/5", text: "Thời điểm peak activity được phát hiện từ 2 PM - 4 PM." },
                    { title: "Tăng trưởng Audience", icon: Users, color: "text-amber-600", bg: "bg-amber-500/5", text: "Tỷ lệ tăng trưởng đang vượt 15% so với mặt bằng chung ngành." },
                  ].map((insight, idx) => (
                    <Card key={idx} className="rounded-lg border border-border bg-card shadow-sm hover:shadow-md transition-all duration-300 group">
                      <CardContent className="p-6 space-y-4">
                        <div className={`size-9 rounded-md ${insight.bg} ${insight.color} flex items-center justify-center shadow-inner border border-current/10 transition-transform group-hover:rotate-12`}>
                          <insight.icon className="size-4" />
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-foreground/60 italic">{insight.title}</h4>
                          <p className="text-xs text-muted-foreground leading-relaxed italic font-medium">{insight.text}</p>
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

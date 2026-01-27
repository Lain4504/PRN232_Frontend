"use client";

import React from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Megaphone,
  Calendar,
  DollarSign,
  Target,
  TrendingUp,
  Eye,
  MousePointer,
  BarChart3,
  Edit,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCampaign } from "@/hooks/use-campaigns";
import { useBrands } from "@/hooks/use-brands";
import { getCampaignStatus, getCampaignStatusColor } from "@/lib/types/campaigns";
import Link from "next/link";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { CampaignModal } from "@/components/campaigns/campaign-modal";
import { format } from "date-fns";


interface CampaignDetailsProps {
  basePath?: string;
}

export function CampaignDetails({ basePath = '/dashboard/campaigns' }: CampaignDetailsProps = {}) {
  const params = useParams();
  const campaignId = params.id as string;


  const { data: campaign, isLoading, error } = useCampaign(campaignId);
  const { data: brands = [] } = useBrands();

  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

  if (isLoading) return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8 animate-pulse">
      <div className="h-8 w-64 bg-muted rounded-lg" />
      <div className="h-32 bg-muted rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-muted rounded-2xl" />)}
      </div>
    </div>
  );

  if (error || !campaign) return (
    <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col items-center justify-center text-center">
      <div className="size-20 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-6">
        <Megaphone className="size-10" />
      </div>
      <h2 className="text-3xl font-extrabold text-foreground">Không tìm thấy chiến dịch</h2>
      <p className="text-muted-foreground mt-2 max-w-md">Chiến dịch bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
      <Button asChild className="mt-10 rounded-xl h-12 px-8 font-bold" variant="outline">
        <Link href={basePath}><ArrowLeft className="mr-2 size-4" /> Quay lại Dashboard</Link>
      </Button>
    </div>
  );

  const brand = brands.find(b => b.id === campaign.brandId);
  const status = getCampaignStatus(campaign);
  const statusColor = getCampaignStatusColor(status);
  const metrics = campaign.metrics;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10 mb-20">
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink href="/dashboard">TRUNG TÂM ĐIỀU KHIỂN</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbLink href={basePath}>CHIẾN DỊCH</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage>{campaign.name}</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex items-center gap-5">
            <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20 shadow-sm">
              <Megaphone className="size-8" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground">{campaign.name}</h1>
              <div className="flex items-center gap-3 mt-1.5">
                <Badge variant="secondary" className={cn("text-xs font-bold uppercase py-0.5 px-3 rounded-lg", statusColor)}>
                  {status}
                </Badge>
                {brand && (
                  <Badge variant="outline" className="text-xs font-bold uppercase py-0.5 px-3 rounded-lg border-2">
                    {brand.name}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline" size="lg" className="rounded-xl font-bold h-12 px-6 border-2" asChild>
            <Link href={`${basePath}/${campaign.id}/ad-sets`}>
              <Target className="mr-2 size-5" />
              Hiệu suất nhóm quảng cáo
            </Link>
          </Button>
          <Button size="lg" className="rounded-xl font-bold h-12 px-6 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]" onClick={() => setIsEditModalOpen(true)}>
            <Edit className="mr-2 size-5" />
            Chỉnh sửa hồ sơ
          </Button>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Ngân sách dự kiến", value: campaign.budget ? `₫${Number(campaign.budget).toLocaleString('vi-VN')}` : "None", desc: "Đầu tư toàn cầu", icon: DollarSign, color: "text-emerald-500" },
          { label: "Chiến lược cốt lõi", value: campaign.objective?.replace(/_/g, ' ') || "Dynamic", desc: "Mục tiêu chính", icon: Target, color: "text-blue-500" },
          { label: "Thời gian", value: campaign.startDate ? format(new Date(campaign.startDate), 'MMM dd, yyyy') : "Pending", desc: "Ngày triển khai", icon: Calendar, color: "text-primary" },
          { label: "Nút hoạt động", value: campaign.adSets?.length || 0, desc: "Nhóm kết nối", icon: BarChart3, color: "text-amber-500" },
        ].map((stat, i) => (
          <Card key={i} className="rounded-2xl border bg-card/40 p-6 shadow-sm border-b-4 border-b-transparent hover:border-b-primary transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("size-10 rounded-xl bg-muted/50 flex items-center justify-center", stat.color)}>
                <stat.icon className="size-5" />
              </div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">METADATA</span>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-extrabold text-foreground truncate">{stat.value}</p>
              <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-tight">{stat.label}</p>
              <p className="text-[10px] text-muted-foreground italic mt-2">{stat.desc}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Performance Analytics Section */}
      {metrics && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Phân tích trực tiếp</h2>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Lượt hiển thị", value: metrics.totalImpressions.toLocaleString(), sub: "Tổng tiếp cận hình ảnh", icon: Eye },
              { label: "Lượt nhấp", value: metrics.totalClicks.toLocaleString(), sub: "Tương tác người dùng", icon: MousePointer },
              { label: "Tỷ lệ chuyển đổi", value: `${metrics.ctr.toFixed(2)}%`, sub: "Chỉ số hiệu suất", icon: TrendingUp },
              { label: "Chi phí thực tế", value: `₫${Number(metrics.totalSpend).toLocaleString('vi-VN')}`, sub: "Tiêu thụ tài nguyên", icon: DollarSign },
            ].map((metric, i) => (
              <Card key={i} className="rounded-2xl border bg-card/10 backdrop-blur-md p-6 shadow-inner relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 translate-x-4 -translate-y-4 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform">
                  <metric.icon className="size-16" />
                </div>
                <div className="space-y-1 relative">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{metric.label}</p>
                  <p className="text-3xl font-black text-foreground">{metric.value}</p>
                  <p className="text-xs text-muted-foreground/80 font-medium italic mt-2">{metric.sub}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Registry & Governance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 rounded-2xl border bg-card/40 overflow-hidden shadow-sm">
          <CardHeader className="bg-muted/30 border-b py-6 px-8">
            <CardTitle className="text-xl font-extrabold tracking-tight">Thông tin đăng ký</CardTitle>
            <CardDescription className="text-sm font-medium">Bản ghi hệ thống về vòng đời và trạng thái của chiến dịch này.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-2 p-4 rounded-xl bg-background/50 border shadow-inner">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Đăng ký ban đầu</label>
              <div className="flex items-center gap-3 mt-1">
                <Calendar className="size-4 text-primary" />
                <p className="text-base font-bold text-foreground">{format(new Date(campaign.createdAt), 'PPP')}</p>
              </div>
            </div>
            <div className="space-y-2 p-4 rounded-xl bg-background/50 border shadow-inner">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Đồng bộ lần cuối</label>
              <div className="flex items-center gap-3 mt-1">
                <TrendingUp className="size-4 text-blue-500" />
                <p className="text-base font-bold text-foreground">{format(new Date(campaign.updatedAt), 'PPP')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border bg-primary/5 flex flex-col items-center justify-center p-8 text-center border-l-4 border-l-primary shadow-sm">
          <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 shadow-sm">
            <BarChart3 className="size-8" />
          </div>
          <h4 className="text-lg font-extrabold text-foreground tracking-tight">Tối ưu hóa thông minh</h4>
          <p className="text-sm font-medium text-muted-foreground/80 leading-relaxed mt-4 italic">
            Hệ thống AI đang liên tục phân tích và tối ưu hóa hiệu suất chiến dịch của bạn.
          </p>
          <Button variant="ghost" className="mt-8 font-bold text-primary hover:bg-primary/10">Xem nhật ký kiểm tra</Button>
        </Card>
      </div>

      <CampaignModal
        mode="edit"
        campaign={campaign}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />
    </div>
  );
}

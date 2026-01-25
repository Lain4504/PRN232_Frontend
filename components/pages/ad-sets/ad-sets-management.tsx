"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Target,
  Plus,
  Search,
  ArrowLeft,
  BarChart3,
  Users,
} from "lucide-react";
import { useAdSets } from "@/hooks/use-ad-sets";
import { useCampaign } from "@/hooks/use-campaigns";
import { getAdSetStatus, getAdSetStatusColor, type AdSetResponse } from "@/lib/types/ad-sets";
import Link from "next/link";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { CustomTable } from "@/components/ui/custom-table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { AdSetForm } from "@/components/ad-sets/ad-set-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface AdSetsManagementProps {
  campaignId: string;
  basePath?: string;
}

export function AdSetsManagement({ campaignId, basePath = '/dashboard/campaigns' }: AdSetsManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: campaign, isLoading: campaignLoading, error: campaignError } = useCampaign(campaignId);
  const { data: adSetsData, isLoading: adSetsLoading, error: adSetsError } = useAdSets({
    campaignId,
    page: 1,
    pageSize: 20,
    search: searchTerm || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  if (campaignLoading || adSetsLoading) return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8 animate-pulse">
      <div className="h-8 w-64 bg-muted rounded-lg" />
      <div className="h-32 bg-muted rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-muted rounded-2xl" />)}
      </div>
    </div>
  );

  if (campaignError || !campaign) return (
    <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col items-center justify-center text-center">
      <div className="size-20 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-6">
        <Target className="size-10" />
      </div>
      <h2 className="text-3xl font-extrabold text-foreground tracking-tight italic uppercase">Campaign Error</h2>
      <p className="text-muted-foreground mt-2 max-w-md italic font-medium">The target campaign matrix could not be localized or access is restricted.</p>
      <Button asChild className="mt-10 rounded-xl h-12 px-8 font-black uppercase tracking-widest border-2" variant="outline">
        <Link href={basePath}><ArrowLeft className="mr-2 size-4" /> Back to Safety</Link>
      </Button>
    </div>
  );

  const adSets = adSetsData?.data || [];
  const totalCount = adSetsData?.totalCount || 0;

  const columns = [
    {
      accessorKey: "name",
      header: "Identity",
      cell: ({ row }: { row: { original: AdSetResponse } }) => (
        <div className="flex items-center gap-4">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
            <Target className="size-5" />
          </div>
          <div>
            <div className="font-extrabold text-foreground">{row.original.name}</div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Node</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "budget",
      header: "Allocation",
      cell: ({ row }: { row: { original: AdSetResponse } }) => {
        const dailyBudget = Number(((row.original as unknown as Record<string, unknown>).dailyBudget) ?? row.original.budget ?? 0);
        return (
          <div className="space-y-0.5">
            <span className="font-black text-foreground">
              ₫{dailyBudget.toLocaleString('vi-VN')}
            </span>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Daily Cap</div>
          </div>
        );
      },
    },
    {
      accessorKey: "targeting",
      header: "Core Target",
      cell: ({ row }: { row: { original: AdSetResponse } }) => {
        const targeting = row.original.targeting;
        const criteria = [];
        if (targeting.ageRange) criteria.push(`${targeting.ageRange.min}-${targeting.ageRange.max}y`);
        if (targeting.gender) {
          if (targeting.gender.male && targeting.gender.female) criteria.push("All");
          else if (targeting.gender.male) criteria.push("M");
          else if (targeting.gender.female) criteria.push("F");
        }
        return (
          <div className="flex flex-wrap gap-1">
            {criteria.map((c, i) => (
              <Badge key={i} variant="outline" className="text-[10px] font-black border-2">{c}</Badge>
            ))}
            {targeting.interests && targeting.interests.length > 0 && (
              <Badge variant="secondary" className="text-[10px] font-black">{targeting.interests.length} Targets</Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Phase",
      cell: ({ row }: { row: { original: AdSetResponse } }) => {
        const status = getAdSetStatus(row.original);
        return (
          <Badge variant="secondary" className={cn("text-[10px] font-black uppercase py-0.5 px-3 rounded-lg", getAdSetStatusColor(status))}>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "metrics",
      header: "Indexing",
      cell: ({ row }: { row: { original: AdSetResponse } }) => {
        const metrics = row.original.metrics;
        if (!metrics) return <span className="text-[10px] font-black text-muted-foreground/40 italic">In Queue</span>;
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black">{metrics.impressions.toLocaleString()}</span>
              <div className="h-1 flex-1 bg-muted rounded-full overflow-hidden w-12">
                <div className="h-full bg-primary" style={{ width: '45%' }} />
              </div>
            </div>
            <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{metrics.ctr.toFixed(2)}% Performance</div>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Protocol",
      cell: ({ row }: { row: { original: AdSetResponse } }) => (
        <Button variant="ghost" size="sm" className="rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-colors" asChild>
          <Link href={`${basePath}/${campaignId}/ad-sets/${row.original.id}`}>
            Review Access
          </Link>
        </Button>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-12 font-fira-sans mb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbLink href={basePath}>Campaigns</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbLink href={`${basePath}/${campaignId}`}>{campaign.name}</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage>Ad Sets</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tighter text-foreground italic uppercase">Ad Sets <span className="text-primary italic">Forge</span></h1>
            <p className="text-sm font-bold text-muted-foreground italic leading-relaxed max-w-xl border-l-4 border-primary pl-4">
              Configuring demographic clusters and capital allocation for the <span className="text-foreground">{campaign.name}</span> matrix.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl h-14 px-8 font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                <Plus className="mr-3 size-5" />
                New Ad Set
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border-2">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black italic uppercase tracking-tight">Allocate New Node</DialogTitle>
              </DialogHeader>
              <AdSetForm
                campaignId={campaignId}
                onSuccess={() => setIsCreateModalOpen(false)}
                onCancel={() => setIsCreateModalOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Cluster", value: totalCount, sub: `${adSets.filter(a => getAdSetStatus(a) === 'active').length} active nodes`, icon: BarChart3, color: "text-blue-500" },
          { title: "Global Cap", value: `₫${adSets.reduce((s, a) => s + Number((a as unknown as Record<string, unknown>).dailyBudget ?? a.budget ?? 0), 0).toLocaleString('vi-VN')}`, sub: "Total daily allocation", icon: Target, color: "text-emerald-500" },
          { title: "Visual Reach", value: adSets.reduce((s, a) => s + (a.metrics?.impressions || 0), 0).toLocaleString(), sub: "Total impressions indexed", icon: Users, color: "text-amber-500" },
          { title: "Avg Index", value: `${adSets.length > 0 ? (adSets.reduce((s, a) => s + (a.metrics?.ctr || 0), 0) / adSets.length).toFixed(2) : '0.00'}%`, sub: "Performance performance index", icon: BarChart3, color: "text-primary" }
        ].map((stat, i) => (
          <Card key={i} className="rounded-3xl border bg-card/40 p-6 shadow-sm group hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("size-10 rounded-xl bg-muted/50 flex items-center justify-center shadow-inner", stat.color)}>
                <stat.icon className="size-5" />
              </div>
              <Badge variant="outline" className="text-[9px] font-black uppercase border-none bg-muted/5 p-1 px-2">Live Registry</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-black text-foreground italic">{stat.value}</p>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.title}</p>
              <p className="text-[10px] text-muted-foreground/60 font-medium italic mt-2">{stat.sub}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 rounded-2xl border-2 border-dashed bg-card/40 backdrop-blur-md">
          <div className="relative w-full sm:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search cluster matrix..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 bg-background/50 rounded-2xl border-none shadow-inner font-bold italic"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-12 w-full sm:w-[180px] rounded-2xl border-none shadow-inner bg-background/50 font-black uppercase text-[10px] tracking-widest">
              <SelectValue placeholder="PHASE FILTER" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-2">
              <SelectItem value="all" className="font-bold text-[10px] uppercase">All PHASES</SelectItem>
              <SelectItem value="active" className="font-bold text-[10px] uppercase">Active Matrix</SelectItem>
              <SelectItem value="paused" className="font-bold text-[10px] uppercase">Paused Horizon</SelectItem>
              <SelectItem value="completed" className="font-bold text-[10px] uppercase">ARCHIVED</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="rounded-3xl border-2 bg-card/40 overflow-hidden shadow-2xl shadow-foreground/5">
          <CustomTable
            columns={columns}
            data={adSets}
            pageSize={20}
            className="border-0 shadow-none bg-transparent"
            headerClassName="bg-muted/30 border-b py-5 px-8 font-black uppercase text-[10px] tracking-widest"
            emptyMessage="The matrix is currently empty for this sector."
          />
        </Card>
      </div>
    </div>
  );
}

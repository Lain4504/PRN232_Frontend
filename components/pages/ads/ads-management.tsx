"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Megaphone,
  Filter,
  Search,
  Target,
  ArrowLeft,
  Activity,
  Zap,
  Layout,
  ExternalLink,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CustomTable } from "@/components/ui/custom-table";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useAds, useAdPreview, useBulkUpdateAdStatus } from "@/hooks/use-ads";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { AdForm } from "@/components/ads/ad-form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

interface AdsManagementProps {
  campaignId: string;
  adSetId: string;
  basePath?: string;
}

interface AdListItem {
  id: string;
  name: string;
  status: string;
  impressions?: number;
  clicks?: number;
  ctr?: number;
  spend?: number;
  updatedAt?: string;
  pageName?: string;
  adSetName?: string;
  adId?: string;
}

export function AdsManagement({ campaignId, adSetId, basePath = '/dashboard/campaigns' }: AdsManagementProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data: adsPage, isLoading } = useAds({ campaignId, page, pageSize, status });
  const bulk = useBulkUpdateAdStatus();

  const toggle = (id: string, value: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (value) next.add(id); else next.delete(id);
      return next;
    });
  };

  const filtered = useMemo(() => {
    const rows = adsPage?.data || [];
    let result = rows;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter((ad) => ad.name?.toLowerCase().includes(q));
    }
    if (adSetId) {
      result = result.filter((ad) => ad.adSetId === adSetId);
    }
    return result;
  }, [adsPage, searchTerm, adSetId]);

  const data: AdListItem[] = filtered.map((ad) => ({
    id: ad.id,
    name: ad.pageName || ad.name || ad.adSetName || ad.adId || ad.id,
    status: ad.status,
    impressions: ad.metrics?.impressions ?? ad.performance?.impressions,
    clicks: ad.metrics?.clicks ?? ad.performance?.clicks,
    ctr: ad.metrics?.ctr ?? ad.performance?.ctr,
    spend: ad.metrics?.spend ?? ad.performance?.spend,
    updatedAt: ad.updatedAt,
    pageName: ad.pageName,
    adSetName: ad.adSetName,
    adId: ad.adId,
  }));

  const columns: ColumnDef<AdListItem>[] = [
    {
      id: "select",
      header: () => <div className="pl-1">Sel</div>,
      cell: ({ row }) => (
        <Checkbox
          checked={selected.has(row.original.id)}
          onCheckedChange={(v) => toggle(row.original.id, Boolean(v))}
          aria-label="Select row"
          className="rounded-md border-2"
        />
      ),
    },
    {
      header: "Creative Identity",
      accessorKey: "name",
      cell: ({ row }) => {
        const ad = row.original;
        return (
          <div className="flex items-center gap-4">
            <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <Megaphone className="size-5" />
            </div>
            <div>
              <Link className="font-black text-foreground hover:text-primary transition-colors italic" href={`${basePath}/${campaignId}/ad-sets/${adSetId}/ads/${ad.id}`}>
                {ad.name}
              </Link>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{ad.adId || 'ID: UNSYNCED'}</div>
            </div>
          </div>
        );
      }
    },
    {
      header: "State",
      accessorKey: "status",
      cell: ({ row }) => (
        <Badge variant="secondary" className={cn(
          "text-[10px] font-black uppercase py-0.5 px-3 rounded-lg",
          row.original.status === 'ACTIVE' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
        )}>
          {row.original.status}
        </Badge>
      )
    },
    {
      header: "Reach Index",
      accessorKey: "impressions",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="text-xs font-black italic">{(row.original.impressions || 0).toLocaleString()}</div>
          <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Visual Impressions</div>
        </div>
      )
    },
    {
      header: "Performance",
      accessorKey: "ctr",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="text-xs font-black text-primary">{(row.original.ctr || 0).toFixed(2)}%</div>
          <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Click Index</div>
        </div>
      )
    },
    {
      header: "Allocation",
      accessorKey: "spend",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="text-xs font-black">₫{(row.original.spend || 0).toLocaleString('vi-VN')}</div>
          <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Capital Used</div>
        </div>
      )
    },
    {
      id: "actions",
      header: "Operations",
      cell: ({ row }) => (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-colors">
              Launch Preview
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[1200px] w-[95vw] h-[90vh] p-0 overflow-hidden border-2 rounded-[32px]">
            <DialogHeader className="p-8 border-b bg-muted/20">
              <DialogTitle className="text-2xl font-black italic uppercase italic">Aethereal <span className="text-primary italic">Preview</span></DialogTitle>
              <DialogDescription className="font-bold text-muted-foreground uppercase tracking-widest">Live rendering of ad creative across platforms</DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-auto p-8">
              <AdPreviewBody adId={row.original.id} />
            </div>
          </DialogContent>
        </Dialog>
      )
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-12 font-fira-sans mb-20 animate-in fade-in duration-700">
      {/* Registry Navigation */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbLink href={basePath}>Campaigns</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbLink href={`${basePath}/${campaignId}`}>Campaign</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbLink href={`${basePath}/${campaignId}/ad-sets/${adSetId}`}>Ad Set</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage>Ads</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tighter text-foreground italic uppercase">Creatives <span className="text-primary italic">Matrix</span></h1>
            <p className="text-sm font-bold text-muted-foreground italic leading-relaxed max-w-xl border-l-4 border-primary pl-4">
              Orchestrating visual signals and audience engagement for the <span className="text-foreground">Sector Delta</span> deployment.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl h-14 px-8 font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                <Plus className="mr-3 size-5" />
                Initialize Ad
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] flex flex-col p-0 border-2 rounded-[32px] overflow-hidden">
              <DialogHeader className="p-8 border-b bg-muted/20">
                <DialogTitle className="text-2xl font-black italic uppercase underline decoration-primary decoration-4 underline-offset-8">Configure New Signal</DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto p-8">
                <AdForm campaignId={campaignId} adSetId={adSetId} onSuccess={() => setIsCreateOpen(false)} onCancel={() => setIsCreateOpen(false)} />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Control Station */}
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 p-6 rounded-[32px] border-2 border-dashed bg-card/40 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            <div className="relative w-full sm:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input className="pl-12 h-12 bg-background/50 rounded-2xl border-none shadow-inner font-bold italic" placeholder="Search creatives..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <Select value={status ?? "all"} onValueChange={(val) => setStatus(val === "all" ? undefined : val)}>
              <SelectTrigger className="h-12 w-full sm:w-[180px] rounded-2xl border-none shadow-inner bg-background/50 font-black uppercase text-[10px] tracking-widest">
                <SelectValue placeholder="PHASE FILTER" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-2">
                <SelectItem value="all" className="font-bold text-[10px] uppercase">All PHASES</SelectItem>
                <SelectItem value="ACTIVE" className="font-bold text-[10px] uppercase">Active Signal</SelectItem>
                <SelectItem value="PAUSED" className="font-bold text-[10px] uppercase">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <Button
              variant="outline"
              size="lg"
              disabled={selected.size === 0}
              onClick={() => bulk.mutate({ adIds: Array.from(selected), status: "PAUSED" })}
              className="h-12 px-6 rounded-2xl border-2 font-black uppercase text-[10px] tracking-widest flex-1 sm:flex-initial"
            >
              Suspend
            </Button>
            <Button
              size="lg"
              disabled={selected.size === 0}
              onClick={() => bulk.mutate({ adIds: Array.from(selected), status: "ACTIVE" })}
              className="h-12 px-6 rounded-2xl font-black uppercase text-[10px] tracking-widest flex-1 sm:flex-initial shadow-lg shadow-emerald-500/20"
            >
              Reactivate
            </Button>
          </div>
        </div>

        <Card className="rounded-[40px] border-2 bg-card/40 overflow-hidden shadow-2xl shadow-foreground/5">
          <CustomTable
            columns={columns}
            data={data}
            pageSize={pageSize}
            isLoading={isLoading}
            emptyMessage="No visual signals identified in this sector."
            className="border-0 shadow-none bg-transparent"
            headerClassName="bg-muted/30 border-b py-5 px-8 font-black uppercase text-[10px] tracking-widest"
          />
        </Card>
      </div>
    </div>
  );
}

function AdPreviewBody({ adId }: { adId: string }) {
  const [format, setFormat] = useState('DESKTOP_FEED_STANDARD');
  const { data, isLoading, refetch } = useAdPreview(adId, format);
  return (
    <div className="space-y-8 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-muted/30 p-6 rounded-3xl border">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <Zap className="size-6 text-primary animate-pulse" />
          <div className="space-y-0.5">
            <p className="text-sm font-black italic uppercase">Aether Sync</p>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">Live platform visualization</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select value={format} onValueChange={(v) => setFormat(v)}>
            <SelectTrigger className="w-full sm:w-64 h-12 rounded-2xl border-none shadow-inner bg-background/50 font-black uppercase text-[10px] tracking-widest">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-2">
              <SelectItem value="DESKTOP_FEED_STANDARD" className="font-bold text-[10px] uppercase">Desktop Feed</SelectItem>
              <SelectItem value="MOBILE_FEED_STANDARD" className="font-bold text-[10px] uppercase">Mobile Device</SelectItem>
              <SelectItem value="RIGHT_COLUMN_STANDARD" className="font-bold text-[10px] uppercase">Lateral Registry</SelectItem>
              <SelectItem value="FACEBOOK_STORY_MOBILE" className="font-bold text-[10px] uppercase">Visual Story</SelectItem>
              <SelectItem value="INSTAGRAM_EXPLORE_GRID_HOME" className="font-bold text-[10px] uppercase">Exploration Hub</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="secondary" size="lg" className="rounded-2xl h-12 px-6 font-black uppercase text-[10px] tracking-widest" onClick={() => refetch()}>
            <RefreshCw className="size-4 mr-2" />
            Sync
          </Button>
        </div>
      </div>
      <div className="flex-1 min-h-[400px] border-2 border-dashed rounded-[32px] bg-background/50 backdrop-blur-sm overflow-hidden flex flex-col items-center justify-start p-10 relative">
        {isLoading ? (
          <div className="my-auto flex flex-col items-center gap-4">
            <div className="size-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Synchronizing Visuals...</p>
          </div>
        ) : data ? (
          <div className="w-full max-w-lg bg-card rounded-2xl shadow-2xl overflow-hidden border p-4 shadow-foreground/5 animate-in slide-in-from-bottom-4 duration-500" dangerouslySetInnerHTML={{ __html: data }} />
        ) : (
          <div className="my-auto text-center space-y-4">
            <Layout className="size-12 text-destructive mx-auto opacity-20" />
            <p className="text-[10px] font-black uppercase text-destructive tracking-widest">Signal Failure: Data Packet Lost</p>
          </div>
        )}
      </div>
    </div>
  );
}

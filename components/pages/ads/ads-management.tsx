"use client";

import React from "react";
import { PageLayout } from "@/components/ui/page-layout";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Plus, Megaphone, Filter, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomTable } from "@/components/ui/custom-table";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useAds, useAdPreview } from "@/hooks/use-ads";
import { Checkbox } from "@/components/ui/checkbox";
import { useBulkUpdateAdStatus } from "@/hooks/use-ads";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AdForm } from "@/components/ads/ad-form";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
}

export function AdsManagement({ campaignId, adSetId, basePath = '/dashboard/campaigns' }: AdsManagementProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const columns: ColumnDef<AdListItem>[] = [
    {
      id: "select",
      header: () => <span className="text-xs text-muted-foreground">Select</span>,
      cell: ({ row }) => (
        <Checkbox
          checked={selected.has(row.original.id)}
          onCheckedChange={(v) => toggle(row.original.id, Boolean(v))}
          aria-label="Select row"
        />
      ),
    },
    {
      header: "Name",
      accessorKey: "name",
      cell: ({ row }) => (
        <Link className="font-medium hover:underline" href={`${basePath}/${campaignId}/ad-sets/${adSetId}/ads/${row.original.id}`}>
          {row.original.name}
        </Link>
      )
    },
    {
      header: "Status",
      accessorKey: "status",
    },
    {
      header: "Impr.",
      accessorKey: "impressions",
      cell: ({ getValue }) => {
        const v = getValue<number | undefined>();
        return v != null ? v.toLocaleString() : "-";
      }
    },
    {
      header: "Clicks",
      accessorKey: "clicks",
      cell: ({ getValue }) => {
        const v = getValue<number | undefined>();
        return v != null ? v.toLocaleString() : "-";
      }
    },
    {
      header: "CTR",
      accessorKey: "ctr",
      cell: ({ getValue }) => {
        const v = getValue<number | undefined>();
        return v != null ? `${v.toFixed(2)}%` : "-";
      }
    },
    {
      header: "Spend",
      accessorKey: "spend",
      cell: ({ getValue }) => {
        const v = getValue<number | undefined>();
        return v != null ? `₫${v.toLocaleString()}` : "-";
      }
    },
    {
      header: "Updated",
      accessorKey: "updatedAt",
      cell: ({ getValue }) => {
        const v = getValue<string | undefined>();
        return v ? new Date(v).toLocaleDateString() : "-";
      }
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">Preview</Button>
          </DialogTrigger>
          <DialogContent className="w-[96vw] sm:w-[94vw] md:w-[92vw] lg:w-[88vw] max-w-[1400px] h-[92vh] p-0">
            <DialogHeader>
              <DialogTitle>Ad Preview</DialogTitle>
            </DialogHeader>
            <div className="h-[calc(92vh-60px)] overflow-auto p-3 sm:p-4">
              <AdPreviewBody adId={row.original.id} />
            </div>
          </DialogContent>
        </Dialog>
      )
    }
  ];

  const { data: adsPage, isLoading } = useAds({ campaignId, page, pageSize, status });
  const bulk = useBulkUpdateAdStatus();
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const toggle = (id: string, value: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (value) next.add(id); else next.delete(id);
      return next;
    });
  };
  const filtered = useMemo(() => {
    const rows = adsPage?.data || [];
    if (!searchTerm) return rows;
    const q = searchTerm.toLowerCase();
    return rows.filter((ad) => ad.name?.toLowerCase().includes(q));
  }, [adsPage, searchTerm]);

  const data: AdListItem[] = filtered
    .filter((ad) => !adSetId || ad.adSetId === adSetId)
    .map((ad) => ({
      id: ad.id,
      name: ad.name || ad.adSetName || ad.adId || ad.id,
      status: ad.status,
      impressions: ad.metrics?.impressions ?? ad.performance?.impressions,
      clicks: ad.metrics?.clicks ?? ad.performance?.clicks,
      ctr: ad.metrics?.ctr ?? ad.performance?.ctr,
      spend: ad.metrics?.spend ?? ad.performance?.spend,
      updatedAt: ad.updatedAt,
    }));

  return (
    <PageLayout
      title="Ads"
      description="Create and manage ads."
      breadcrumbs={[
        { label: basePath.includes('/team/') ? 'Team' : 'Dashboard', href: basePath.includes('/team/') ? basePath.split('/campaigns')[0] : '/dashboard' },
        { label: "Campaigns", href: basePath },
        { label: "Campaign", href: `${basePath}/${campaignId}` },
        { label: "Ad Sets", href: `${basePath}/${campaignId}/ad-sets` },
        { label: "Ad Set", href: `${basePath}/${campaignId}/ad-sets/${adSetId}` },
        { label: "Ads", isCurrentPage: true },
      ]}
      actions={[]}
    >
      <div className="flex justify-end">
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Ad
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Create New Ad</DialogTitle>
            </DialogHeader>
            <AdForm adSetId={adSetId} onSuccess={() => setIsCreateOpen(false)} onCancel={() => setIsCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      <Card className="border-0 shadow-none bg-transparent">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Megaphone className="h-5 w-5" />
            Ads
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
              <div className="relative w-full sm:w-64 md:w-72">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input className="pl-8 bg-background shadow-none focus-visible:ring-1 focus-visible:ring-primary/30" placeholder="Search ads" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }} />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={status ?? "all"} onValueChange={(val) => { setStatus(val === "all" ? undefined : val); setPage(1); }}>
                  <SelectTrigger className="h-8 w-full sm:w-[160px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="PAUSED">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                disabled={selected.size === 0}
                onClick={() => bulk.mutate({ adIds: Array.from(selected), status: "PAUSED" })}
                className="flex-1 sm:flex-initial"
              >
                Pause
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={selected.size === 0}
                onClick={() => bulk.mutate({ adIds: Array.from(selected), status: "ACTIVE" })}
                className="flex-1 sm:flex-initial"
              >
                Start
              </Button>
            </div>
          </div>
          <CustomTable
            columns={columns}
            data={data}
            pageSize={pageSize}
            isLoading={isLoading}
            emptyMessage="No ads"
            emptyDescription="Create an ad to get started."
            className="border-0 shadow-none bg-transparent"
            headerClassName="bg-transparent hover:bg-transparent"
          />
        </CardContent>
      </Card>
    </PageLayout>
  );
}

function AdPreviewBody({ adId }: { adId: string }) {
  const [format, setFormat] = React.useState('DESKTOP_FEED_STANDARD');
  const { data, isLoading, refetch } = useAdPreview(adId, format);
  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:justify-between flex-wrap">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={format} onValueChange={(v) => setFormat(v)}>
            <SelectTrigger className="w-full sm:w-[240px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DESKTOP_FEED_STANDARD">Desktop Feed</SelectItem>
              <SelectItem value="MOBILE_FEED_STANDARD">Mobile Feed</SelectItem>
              <SelectItem value="RIGHT_COLUMN_STANDARD">Right Column</SelectItem>
              <SelectItem value="FACEBOOK_STORY_MOBILE">Facebook Story</SelectItem>
              <SelectItem value="INSTAGRAM_EXPLORE_GRID_HOME">IG Explore Home</SelectItem>
              <SelectItem value="INSTAGRAM_SEARCH_CHAIN">IG Search Results</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>Refresh</Button>
        </div>
        <div className="text-xs text-muted-foreground pr-1">Scroll to view full preview</div>
      </div>
      <div className="min-h-[240px] h-[70vh] overflow-auto rounded-md border bg-background">
        {isLoading ? (
          <div className="py-10 text-center text-muted-foreground">Loading preview…</div>
        ) : data ? (
          <div className="p-3" dangerouslySetInnerHTML={{ __html: data }} />
        ) : (
          <div className="py-10 text-center text-destructive">Failed to load preview</div>
        )}
      </div>
    </div>
  );
}



"use client";

import React from "react";
import { PageLayout } from "@/components/ui/page-layout";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Plus, Megaphone, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useAds } from "@/hooks/use-ads";
import { Checkbox } from "@/components/ui/checkbox";
import { useBulkUpdateAdStatus } from "@/hooks/use-ads";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AdForm } from "@/components/ads/ad-form";
import { useState } from "react";

interface AdsManagementProps {
  campaignId: string;
  adSetId: string;
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

export function AdsManagement({ campaignId, adSetId }: AdsManagementProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
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
        <Link className="font-medium hover:underline" href={`/dashboard/campaigns/${campaignId}/ad-sets/${adSetId}/ads/${row.original.id}`}>
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
        return v != null ? `$${v.toLocaleString()}` : "-";
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
  ];

  const { data: adsPage, isLoading } = useAds({ adSetId, page: 1, pageSize: 50 });
  const bulk = useBulkUpdateAdStatus();
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const toggle = (id: string, value: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (value) next.add(id); else next.delete(id);
      return next;
    });
  };
  const data: AdListItem[] = (adsPage?.data || []).map((ad) => ({
    id: ad.id,
    name: ad.name,
    status: ad.status,
    impressions: ad.metrics?.impressions ?? ad.performance?.impressions,
    clicks: ad.metrics?.clicks ?? ad.performance?.clicks,
    ctr: ad.metrics?.ctr ?? ad.performance?.ctr,
    spend: ad.metrics?.spend ?? ad.performance?.spend,
    updatedAt: ad.updatedAt,
  }));

  return (
    <PageLayout
      title="Ads Management"
      description="Create, monitor, and manage ads within this ad set."
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Campaigns", href: "/dashboard/campaigns" },
        { label: "Campaign", href: `/dashboard/campaigns/${campaignId}` },
        { label: "Ad Sets", href: `/dashboard/campaigns/${campaignId}/ad-sets` },
        { label: "Ad Set", href: `/dashboard/campaigns/${campaignId}/ad-sets/${adSetId}` },
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Ads
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" /> Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={selected.size === 0}
              onClick={() => bulk.mutate({ adIds: Array.from(selected), status: "PAUSED", confirm: true })}
            >
              Pause Selected
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={selected.size === 0}
              onClick={() => bulk.mutate({ adIds: Array.from(selected), status: "ACTIVE", confirm: true })}
            >
              Start Selected
            </Button>
          </div>
          <DataTable
            columns={columns}
            data={data}
            loading={isLoading}
            showSearch={false}
            emptyMessage="No ads yet"
            emptyDescription="Create your first ad to start running campaigns in this ad set."
          />
        </CardContent>
      </Card>
    </PageLayout>
  );
}



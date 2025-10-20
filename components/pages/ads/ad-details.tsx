"use client";

import React from "react";
import { PageLayout } from "@/components/ui/page-layout";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Eye, MousePointer, TrendingUp, DollarSign } from "lucide-react";
import { useAd } from "@/hooks/use-ads";
import { AdStatusControls } from "@/components/ads/ad-status-controls";
import { AdPerformanceDashboard } from "@/components/ads/ad-performance-dashboard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AdForm } from "@/components/ads/ad-form";

interface AdDetailsProps {
  campaignId: string;
  adSetId: string;
  adId: string;
}

export function AdDetails({ campaignId, adSetId, adId }: AdDetailsProps) {
  const { data: ad, isLoading } = useAd(adId);

  return (
    <PageLayout
      title="Ad Details"
      description="View performance and manage this ad."
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Campaigns", href: "/dashboard/campaigns" },
        { label: "Campaign", href: `/dashboard/campaigns/${campaignId}` },
        { label: "Ad Sets", href: `/dashboard/campaigns/${campaignId}/ad-sets` },
        { label: "Ad Set", href: `/dashboard/campaigns/${campaignId}/ad-sets/${adSetId}` },
        { label: "Ads", href: `/dashboard/campaigns/${campaignId}/ad-sets/${adSetId}/ads` },
        { label: "Details", isCurrentPage: true },
      ]}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Ad Overview
          </CardTitle>
          <CardDescription>Configuration and latest performance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary">{ad?.status ?? 'DRAFT'}</Badge>
            <Badge variant="outline">ID: {adId.slice(0, 8)}</Badge>
            <AdStatusControls adId={adId} adSetId={adSetId} status={ad?.status} />
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">Edit</Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle>Edit Ad</DialogTitle>
                </DialogHeader>
                {ad && (
                  <AdForm adSetId={adSetId} ad={ad} />
                )}
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <AdPerformanceDashboard
              impressions={ad?.metrics?.impressions ?? ad?.performance?.impressions}
              clicks={ad?.metrics?.clicks ?? ad?.performance?.clicks}
              ctr={ad?.metrics?.ctr ?? ad?.performance?.ctr}
              spend={ad?.metrics?.spend ?? ad?.performance?.spend}
            />
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}



"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Target,
  ArrowLeft,
  DollarSign,
  Calendar,
  Eye,
  MousePointer,
  TrendingUp,
  BarChart3,
  Image as ImageIcon,
} from "lucide-react";
import { useAdSet } from "@/hooks/use-ad-sets";
import { useCampaign } from "@/hooks/use-campaigns";
import { getAdSetStatus, getAdSetStatusColor } from "@/lib/types/ad-sets";
import Link from "next/link";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { format } from "date-fns";
import { useState } from "react";
import { Megaphone } from "lucide-react";

interface AdSetDetailsProps {
  campaignId: string;
  adSetId: string;
  basePath?: string;
}

export function AdSetDetails({ campaignId, adSetId, basePath = '/dashboard/campaigns' }: AdSetDetailsProps) {
  
  const { data: campaign, isLoading: campaignLoading, error: campaignError } = useCampaign(campaignId);
  const { data: adSet, isLoading: adSetLoading, error: adSetError } = useAdSet(adSetId);
  const safeFormat = (value?: string) => {
    if (!value) return '—';
    const dt = new Date(value);
    return isNaN(dt.getTime()) ? '—' : format(dt, 'PPP');
  };

  if (campaignLoading || adSetLoading) {
    return (
      <div className="flex-1 space-y-8 p-6 lg:p-8 bg-background">
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <div className="h-10 w-64 mb-3 bg-muted animate-pulse rounded" />
              <div className="h-5 w-80 bg-muted animate-pulse rounded" />
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (campaignError || !campaign || adSetError || !adSet) {
    return (
      <div className="flex-1 space-y-8 p-6 lg:p-8 bg-background">
        <div className="text-center py-8">
          <Target className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-semibold mb-2">Ad set not found</h3>
          <p className="text-muted-foreground mb-4">
            The ad set you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
          </p>
          <Button asChild>
            <Link href={`${basePath}/${campaignId}/ad-sets`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Ad Sets
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const status = getAdSetStatus(adSet);
  const statusColor = getAdSetStatusColor(status);
  const metrics = adSet.metrics;

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="space-y-6 lg:space-y-8 p-4 lg:p-6 xl:p-8 bg-background">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={basePath}>Campaigns</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`${basePath}/${campaignId}`}>{campaign.name}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`${basePath}/${campaignId}/ad-sets`}>Ad Sets</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{adSet.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="space-y-3 lg:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
              <Avatar className="h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0">
                <AvatarFallback>
                  <Target className="h-6 w-6 sm:h-8 sm:w-8" />
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold tracking-tight text-foreground break-words">
                  {adSet.name}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge variant="secondary" className={statusColor}>
                    {status}
                  </Badge>
                  <Badge variant="outline" className="text-xs sm:text-sm">
                    Campaign: <span className="truncate max-w-[120px] sm:max-w-none inline-block">{campaign.name}</span>
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:flex-shrink-0" />
          </div>
        </div>

        {/* Performance Metrics */}
        {metrics && (
          <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-0 shadow-none bg-muted/40">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Impressions</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.impressions.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total views
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-none bg-muted/40">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clicks</CardTitle>
                <MousePointer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.clicks.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total clicks
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-none bg-muted/40">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CTR</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.ctr.toFixed(2)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Click-through rate
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-none bg-muted/40">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Spend</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₫{metrics.spend.toLocaleString('vi-VN')}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total spent
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Ad Set Details */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-0 shadow-none bg-muted/40">
            <CardHeader>
              <CardTitle>Ad Set Information</CardTitle>
              <CardDescription>
                Basic details about this ad set
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Daily Budget</label>
                <p className="text-sm">₫{typeof (adSet as { budget?: number } | undefined)?.budget === 'number' ? (adSet as { budget: number }).budget.toLocaleString('vi-VN') : '0'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <Badge variant="secondary" className={statusColor}>
                  {status}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created</label>
                <p className="text-sm">{safeFormat(adSet.createdAt as string)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                <p className="text-sm">{safeFormat(adSet.updatedAt as string)}</p>
              </div>
            </CardContent>
          </Card>

          
        </div>

        {/* Schedule Information */}
        {adSet.schedule && (
          <Card className="border-0 shadow-none bg-muted/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Schedule
              </CardTitle>
              <CardDescription>
                Ad set scheduling information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                  <p className="text-sm">
                    {adSet.schedule.startDate 
                      ? format(new Date(adSet.schedule.startDate), 'PPP')
                      : 'Not set'
                    }
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">End Date</label>
                  <p className="text-sm">
                    {adSet.schedule.endDate 
                      ? format(new Date(adSet.schedule.endDate), 'PPP')
                      : 'No end date'
                    }
                  </p>
                </div>
              </div>
              {adSet.schedule.timezone && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Timezone</label>
                  <p className="text-sm">{adSet.schedule.timezone}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Creative Management */}
        <Card className="border-0 shadow-none bg-muted/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Creative Management
            </CardTitle>
            <CardDescription>
              Manage creative assets for this ad set
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Create and manage visual and textual content for your advertisements.
              </p>
              <Button asChild>
                <Link href={`${basePath}/${campaignId}/ad-sets/${adSetId}/creatives`}>
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Manage Creatives
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Ad Management */}
        <Card className="border-0 shadow-none bg-muted/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Ad Management
            </CardTitle>
            <CardDescription>
              Create and manage ads for this ad set
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Create and manage advertisements that will run in this ad set.
              </p>
              <Button asChild>
                <Link href={`${basePath}/${campaignId}/ad-sets/${adSetId}/ads`}>
                  <Megaphone className="mr-2 h-4 w-4" />
                  Manage Ads
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Associated Ads removed to avoid duplication with Ad Management */}
      </div>
    </div>
  );
}

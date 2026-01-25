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

  if (campaignLoading) {
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

  if (campaignError || !campaign) {
    return (
      <div className="flex-1 space-y-8 p-6 lg:p-8 bg-background">
        <div className="text-center py-8">
          <Target className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-semibold mb-2">Campaign not found</h3>
          <p className="text-muted-foreground mb-4">
            The campaign you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
          </p>
          <Button asChild>
            <Link href={basePath}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Campaigns
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const adSets = adSetsData?.data || [];
  const totalCount = adSetsData?.totalCount || 0;

  // Define columns for the data table
  const columns = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }: { row: { original: AdSetResponse } }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              <Target className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{row.original.name}</div>

          </div>
        </div>
      ),
    },
    {
      accessorKey: "budget",
      header: "Budget",
      cell: ({ row }: { row: { original: AdSetResponse } }) => {
        const dailyBudget = Number(((row.original as unknown as { dailyBudget?: number }).dailyBudget) ?? (row.original as AdSetResponse).budget ?? 0);
        return (
          <span className="font-medium">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(dailyBudget)}
          </span>
        );
      },
    },
    {
      accessorKey: "targeting",
      header: "Targeting",
      cell: ({ row }: { row: { original: AdSetResponse } }) => {
        const targeting = row.original.targeting;
        const criteria = [];
        if (targeting.ageRange) criteria.push(`Age ${targeting.ageRange.min}-${targeting.ageRange.max}`);
        if (targeting.gender) {
          const genders = [];
          if (targeting.gender.male) genders.push("Male");
          if (targeting.gender.female) genders.push("Female");
          if (genders.length > 0) criteria.push(genders.join(", "));
        }
        if (targeting.interests?.length) criteria.push(`${targeting.interests.length} interests`);
        if (targeting.locations?.length) criteria.push(`${targeting.locations.length} locations`);
        {/* Breadcrumb */ }
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
              <BreadcrumbPage>Ad Sets</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        return (
          <div className="text-sm">
            {criteria.length > 0 ? criteria.slice(0, 2).join(", ") : "No targeting"}
            {criteria.length > 2 && <span className="text-muted-foreground"> +{criteria.length - 2} more</span>}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: { row: { original: AdSetResponse } }) => {
        const status = getAdSetStatus(row.original);
        return (
          <Badge variant="secondary" className={getAdSetStatusColor(status)}>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }: { row: { original: AdSetResponse } }) => (
        <div className="text-sm text-muted-foreground">
          {format(new Date(row.original.createdAt), 'MMM dd, yyyy')}
        </div>
      ),
    },
    {
      accessorKey: "metrics",
      header: "Performance",
      cell: ({ row }: { row: { original: AdSetResponse } }) => {
        const metrics = row.original.metrics;
        if (!metrics) return <span className="text-muted-foreground">No data</span>;

        return (
          <div className="text-sm">
            <div className="font-medium">{metrics.impressions.toLocaleString()} impressions</div>
            <div className="text-muted-foreground">{metrics.ctr.toFixed(2)}% CTR</div>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: { row: { original: AdSetResponse } }) => (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`${basePath}/${campaignId}/ad-sets/${row.original.id}`}>
              View
            </Link>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-[1440px] mx-auto font-fira-sans">
      <div className="space-y-8 p-6 lg:p-10 bg-background min-h-screen">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard" className="text-sm font-medium">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={basePath} className="text-sm font-medium">Campaigns</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`${basePath}/${campaignId}`} className="text-sm font-medium">{campaign.name}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-sm font-medium text-primary">Ad Sets</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Ad Sets
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Manage target audiences and budgeting for your campaign.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-lg h-10 px-6 font-semibold">
                  <Plus className="mr-2 h-4 w-4" />
                  New Ad Set
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl">
                <DialogHeader>
                  <DialogTitle>Create New Ad Set</DialogTitle>
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

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "Total Ad Sets", value: totalCount, subtitle: `${adSets.filter(adSet => getAdSetStatus(adSet) === 'active').length} active`, icon: BarChart3 },
            {
              title: "Daily Budget",
              value: new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", minimumFractionDigits: 0 }).format(adSets.reduce((sum, adSet) => sum + Number(((adSet as unknown as { dailyBudget?: number }).dailyBudget) ?? (adSet as AdSetResponse).budget ?? 0), 0)),
              subtitle: "Allocated budget",
              icon: Target
            },
            {
              title: "Impressions",
              value: adSets.reduce((sum, adSet) => sum + (adSet.metrics?.impressions || 0), 0).toLocaleString(),
              subtitle: "Total reached",
              icon: Users
            },
            {
              title: "Average CTR",
              value: `${adSets.length > 0 ? (adSets.reduce((sum, adSet) => sum + (adSet.metrics?.ctr || 0), 0) / adSets.length).toFixed(2) : '0.00'}%`,
              subtitle: "Click rate",
              icon: BarChart3
            }
          ].map((stat, i) => (
            <Card key={i} className="rounded-xl border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{stat.title}</span>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold tracking-tight mb-1">{stat.value}</div>
                <p className="text-xs font-medium text-muted-foreground">{stat.subtitle}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Toolbar + Table */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border bg-card shadow-sm">
            <div className="relative w-full sm:w-80 group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search ad sets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 bg-background rounded-lg border-border/60"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10 w-full sm:w-[140px] rounded-lg">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-lg">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="rounded-xl border shadow-sm overflow-hidden">
            <CustomTable
              columns={columns}
              data={adSets}
              pageSize={20}
              className="border-0 shadow-none bg-transparent"
              headerClassName="bg-muted/30 border-b py-3"
              emptyMessage="No ad sets found"
            />
          </Card>
        </div>
      </div>
    </div>
  );
}

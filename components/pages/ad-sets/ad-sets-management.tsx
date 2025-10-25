"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Target,
  Plus,
  Search,
  ArrowLeft,
  BarChart3,
  DollarSign,
  Users,
} from "lucide-react";
import { useAdSets } from "@/hooks/use-ad-sets";
import { useCampaign } from "@/hooks/use-campaigns";
import { getAdSetStatus, getAdSetStatusColor, type AdSetResponse } from "@/lib/types/ad-sets";
import Link from "next/link";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { AdSetForm } from "@/components/ad-sets/ad-set-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";

interface AdSetsManagementProps {
  campaignId: string;
}

export function AdSetsManagement({ campaignId }: AdSetsManagementProps) {
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
            <Link href="/dashboard/campaigns">
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
      cell: ({ row }: { row: { original: AdSetResponse } }) => (
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">${row.original.budget.toLocaleString()}</span>
        </div>
      ),
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
            <Link href={`/dashboard/campaigns/${campaignId}/ad-sets/${row.original.id}`}>
              View
            </Link>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="space-y-6 lg:space-y-8 p-4 lg:p-6 xl:p-8 bg-background">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard/campaigns">Campaigns</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/dashboard/campaigns/${campaignId}`}>
                {campaign.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Ad Sets</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="space-y-3 lg:space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback>
                  <Target className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold tracking-tight text-foreground">
                  Ad Sets
                </h1>
                <p className="text-muted-foreground">
                  Manage ad sets for {campaign.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Ad Set
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Ad Sets</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCount}</div>
              <p className="text-xs text-muted-foreground">
                {adSets.filter(adSet => getAdSetStatus(adSet) === 'active').length} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${adSets.reduce((sum, adSet) => sum + adSet.budget, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Daily budget allocation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {adSets.reduce((sum, adSet) => sum + (adSet.metrics?.impressions || 0), 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all ad sets
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average CTR</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {adSets.length > 0 
                  ? (adSets.reduce((sum, adSet) => sum + (adSet.metrics?.ctr || 0), 0) / adSets.length).toFixed(2)
                  : '0.00'
                }%
              </div>
              <p className="text-xs text-muted-foreground">
                Click-through rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Ad Sets</CardTitle>
            <CardDescription>
              Manage and monitor your ad sets for this campaign
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search ad sets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {adSetsLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : adSetsError ? (
              <div className="text-center py-8">
                <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Failed to load ad sets</p>
              </div>
            ) : adSets.length === 0 ? (
              <div className="text-center py-6">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No ad sets found</h3>
                <p className="text-muted-foreground mb-4 text-sm leading-relaxed max-w-sm mx-auto">
                  Create your first ad set to get started
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 text-xs"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Create Your First Ad Set
                </Button>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={adSets}
                pageSize={20}
                showSearch={false}
                emptyMessage="No ad sets found"
                emptyDescription="Create your first ad set to get started"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

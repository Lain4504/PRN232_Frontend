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
import { useCampaign } from "@/hooks/use-campaigns";
import { useBrands } from "@/hooks/use-brands";
import { getCampaignStatus, getCampaignStatusColor } from "@/lib/types/campaigns";
import Link from "next/link";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { CampaignModal } from "@/components/campaigns/campaign-modal";
import { format } from "date-fns";

export function CampaignDetails() {
  const params = useParams();
  const campaignId = params.id as string;
  
  const { data: campaign, isLoading, error } = useCampaign(campaignId);
  const { data: brands = [] } = useBrands();
  
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

  if (isLoading) {
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

  if (error || !campaign) {
    return (
      <div className="flex-1 space-y-8 p-6 lg:p-8 bg-background">
        <div className="text-center py-8">
          <Megaphone className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
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

  const brand = brands.find(b => b.id === campaign.brandId);
  const status = getCampaignStatus(campaign);
  const statusColor = getCampaignStatusColor(status);
  const metrics = campaign.metrics;

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
              <BreadcrumbLink href="/dashboard/campaigns">Campaigns</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{campaign.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="space-y-3 lg:space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback>
                  <Megaphone className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold tracking-tight text-foreground">
                  {campaign.name}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className={statusColor}>
                    {status}
                  </Badge>
                  {brand && (
                    <Badge variant="outline">
                      {brand.name}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link href={`/dashboard/campaigns/${campaign.id}/ad-sets`}>
                  <Target className="mr-2 h-4 w-4" />
                  Manage Ad Sets
                </Link>
              </Button>
              <CampaignModal
                mode="edit"
                campaign={campaign}
                open={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
              >
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Campaign
                </Button>
              </CampaignModal>
            </div>
          </div>
        </div>

        {/* Campaign Overview Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${campaign.budget?.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-muted-foreground">
                Daily budget
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Objective</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {campaign.objective ? campaign.objective.replace(/_/g, ' ') : 'None'}
              </div>
              <p className="text-xs text-muted-foreground">
                Campaign goal
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Duration</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {campaign.startDate ? format(new Date(campaign.startDate), 'MMM dd') : 'Not set'}
              </div>
              <p className="text-xs text-muted-foreground">
                {campaign.endDate ? `to ${format(new Date(campaign.endDate), 'MMM dd')}` : 'No end date'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ad Sets</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {campaign.adSets?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Active ad sets
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        {metrics && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Impressions</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.totalImpressions.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total views
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clicks</CardTitle>
                <MousePointer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.totalClicks.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total clicks
                </p>
              </CardContent>
            </Card>

            <Card>
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

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Spend</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${metrics.totalSpend.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total spent
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Campaign Details */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Information</CardTitle>
              <CardDescription>
                Basic details about this campaign
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Campaign ID</label>
                <p className="text-sm">{campaign.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Ad Account ID</label>
                <p className="text-sm">{campaign.adAccountId}</p>
              </div>
              {campaign.facebookCampaignId && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Facebook Campaign ID</label>
                  <p className="text-sm">{campaign.facebookCampaignId}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created</label>
                <p className="text-sm">{format(new Date(campaign.createdAt), 'PPP')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                <p className="text-sm">{format(new Date(campaign.updatedAt), 'PPP')}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ad Sets</CardTitle>
              <CardDescription>
                Associated ad sets for this campaign
              </CardDescription>
            </CardHeader>
            <CardContent>
              {campaign.adSets && campaign.adSets.length > 0 ? (
                <div className="space-y-2">
                  {campaign.adSets.map((adSet) => (
                    <div key={adSet.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{adSet.name}</p>
                        <p className="text-sm text-muted-foreground">ID: {adSet.id.slice(0, 8)}</p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/campaigns/${campaign.id}/ad-sets/${adSet.id}`}>
                          View
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No ad sets created yet</p>
                  <Button variant="outline" size="sm" className="mt-2" asChild>
                    <Link href={`/dashboard/campaigns/${campaign.id}/ad-sets`}>
                      Create Ad Set
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

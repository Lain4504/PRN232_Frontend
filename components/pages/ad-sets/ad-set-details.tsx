"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Target,
  Edit,
  Trash2,
  ArrowLeft,
  DollarSign,
  Calendar,
  MapPin,
  Eye,
  MousePointer,
  TrendingUp,
  BarChart3,
  Image,
} from "lucide-react";
import { useAdSet } from "@/hooks/use-ad-sets";
import { useCampaign } from "@/hooks/use-campaigns";
import { getAdSetStatus, getAdSetStatusColor } from "@/lib/types/ad-sets";
import Link from "next/link";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { format } from "date-fns";
import { AdSetForm } from "@/components/ad-sets/ad-set-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useDeleteAdSet } from "@/hooks/use-ad-sets";
import { useState } from "react";
import { toast } from "sonner";
import { Megaphone } from "lucide-react";

interface AdSetDetailsProps {
  campaignId: string;
  adSetId: string;
}

export function AdSetDetails({ campaignId, adSetId }: AdSetDetailsProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const { data: campaign, isLoading: campaignLoading, error: campaignError } = useCampaign(campaignId);
  const { data: adSet, isLoading: adSetLoading, error: adSetError } = useAdSet(adSetId);
  const deleteMutation = useDeleteAdSet();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(adSetId);
      toast.success("Ad set deleted successfully");
      // Redirect to ad sets list
      window.location.href = `/dashboard/campaigns/${campaignId}/ad-sets`;
    } catch (error) {
      toast.error("Failed to delete ad set");
      console.error("Delete ad set error:", error);
    }
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
            <Link href={`/dashboard/campaigns/${campaignId}/ad-sets`}>
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
              <BreadcrumbLink href={`/dashboard/campaigns/${campaignId}/ad-sets`}>
                Ad Sets
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{adSet.name}</BreadcrumbPage>
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
                  {adSet.name}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className={statusColor}>
                    {status}
                  </Badge>
                  <Badge variant="outline">
                    Campaign: {campaign.name}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Ad Set
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit Ad Set</DialogTitle>
                  </DialogHeader>
                  <AdSetForm
                    campaignId={campaignId}
                    adSet={adSet}
                    onSuccess={() => setIsEditModalOpen(false)}
                    onCancel={() => setIsEditModalOpen(false)}
                  />
                </DialogContent>
              </Dialog>
              
              <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Ad Set</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete &quot;{adSet.name}&quot;? This action cannot be undone.
                      All associated ads will also be deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete Ad Set
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
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
                  {metrics.impressions.toLocaleString()}
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
                  {metrics.clicks.toLocaleString()}
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
                  ${metrics.spend.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total spent
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Ad Set Details */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Ad Set Information</CardTitle>
              <CardDescription>
                Basic details about this ad set
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Ad Set ID</label>
                <p className="text-sm">{adSet.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Campaign ID</label>
                <p className="text-sm">{adSet.campaignId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Daily Budget</label>
                <p className="text-sm">${adSet.budget.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <Badge variant="secondary" className={statusColor}>
                  {status}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created</label>
                <p className="text-sm">{format(new Date(adSet.createdAt), 'PPP')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                <p className="text-sm">{format(new Date(adSet.updatedAt), 'PPP')}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Targeting Configuration</CardTitle>
              <CardDescription>
                Audience targeting settings for this ad set
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {adSet.targeting.ageRange && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Age Range</label>
                  <p className="text-sm">
                    {adSet.targeting.ageRange.min} - {adSet.targeting.ageRange.max} years
                  </p>
                </div>
              )}
              
              {adSet.targeting.gender && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Gender</label>
                  <p className="text-sm">
                    {Object.entries(adSet.targeting.gender)
                .filter(([, selected]) => selected)
                .map(([gender]) => gender.charAt(0).toUpperCase() + gender.slice(1))
                      .join(", ") || "Not specified"}
                  </p>
                </div>
              )}

              {adSet.targeting.interests && adSet.targeting.interests.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Interests</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {adSet.targeting.interests.map((interest) => (
                      <Badge key={interest} variant="outline" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {adSet.targeting.locations && adSet.targeting.locations.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Locations</label>
                  <div className="space-y-1 mt-1">
                    {adSet.targeting.locations.map((location, index) => (
                      <div key={index} className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {location.country || location.region || location.city || "Location"}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {adSet.targeting.demographics && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Demographics</label>
                  <div className="space-y-1 mt-1">
                    {adSet.targeting.demographics.education && adSet.targeting.demographics.education.length > 0 && (
                      <p className="text-sm">
                        Education: {adSet.targeting.demographics.education.join(", ")}
                      </p>
                    )}
                    {adSet.targeting.demographics.relationshipStatus && adSet.targeting.demographics.relationshipStatus.length > 0 && (
                      <p className="text-sm">
                        Relationship: {adSet.targeting.demographics.relationshipStatus.join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Schedule Information */}
        {adSet.schedule && (
          <Card>
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
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
                <Link href={`/dashboard/campaigns/${campaignId}/ad-sets/${adSetId}/creatives`}>
                  <Image className="mr-2 h-4 w-4" />
                  Manage Creatives
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Associated Ads */}
        {adSet.ads && adSet.ads.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5" />
                Associated Ads
              </CardTitle>
              <CardDescription>
                Ads running in this ad set
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {adSet.ads.map((ad) => (
                  <div key={ad.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{ad.name}</p>
                      <p className="text-sm text-muted-foreground">ID: {ad.id.slice(0, 8)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{ad.status}</Badge>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/dashboard/campaigns/${campaignId}/ad-sets/${adSetId}/ads/${ad.id}`}>View</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button asChild>
                  <Link href={`/dashboard/campaigns/${campaignId}/ad-sets/${adSetId}/ads`}>
                    <Megaphone className="mr-2 h-4 w-4" />
                    Manage Ads
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

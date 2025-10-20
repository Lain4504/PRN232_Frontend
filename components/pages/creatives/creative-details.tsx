"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Image,
  Edit,
  Trash2,
  ArrowLeft,
  Eye,
  MousePointer,
  TrendingUp,
  DollarSign,
  Calendar,
  Tag,
  BarChart3,
  Play,
  FileText,
  Upload,
} from "lucide-react";
import { useCreative } from "@/hooks/use-creative";
import { useAdSet } from "@/hooks/use-ad-sets";
import { useCampaign } from "@/hooks/use-campaigns";
import { getCreativeStatus, getCreativeStatusColor, getCreativeTypeColor, CREATIVE_TYPES } from "@/lib/types/creatives";
import Link from "next/link";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { format } from "date-fns";
import { PageLayout } from "@/components/ui/page-layout";
import { PageLoading } from "@/components/layout/page-loading";
import { PageError } from "@/components/layout/page-error";
import { CreativePreview } from "@/components/creatives/creative-preview";
import { CreativeForm } from "@/components/creatives/creative-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useDeleteCreative } from "@/hooks/use-creatives";
import { toast } from "sonner";

interface CreativeDetailsProps {
  campaignId: string;
  adSetId: string;
  creativeId: string;
}

export function CreativeDetails({ campaignId, adSetId, creativeId }: CreativeDetailsProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  
  const { data: campaign, isLoading: campaignLoading, error: campaignError } = useCampaign(campaignId);
  const { data: adSet, isLoading: adSetLoading, error: adSetError } = useAdSet(adSetId);
  const { data: creative, isLoading: creativeLoading, error: creativeError } = useCreative(creativeId);
  const deleteMutation = useDeleteCreative();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(creativeId);
      toast.success("Creative deleted successfully");
      // Redirect to creatives list
      window.location.href = `/dashboard/campaigns/${campaignId}/ad-sets/${adSetId}/creatives`;
    } catch (error) {
      toast.error("Failed to delete creative");
      console.error("Delete creative error:", error);
    }
  };

  if (campaignLoading || adSetLoading || creativeLoading) {
    return <PageLoading />;
  }

  if (campaignError || !campaign || adSetError || !adSet || creativeError || !creative) {
    return (
      <PageError
        title="Creative not found"
        description="The creative you're looking for doesn't exist or you don't have access to it."
        showBackButton={true}
        showHomeButton={false}
      />
    );
  }

  const status = getCreativeStatus(creative);
  const statusColor = getCreativeStatusColor(status);
  const typeColor = getCreativeTypeColor(creative.type);
  const typeInfo = CREATIVE_TYPES.find(t => t.value === creative.type);
  const metrics = creative.metrics;

  const getCreativeIcon = (type: string) => {
    switch (type) {
      case 'IMAGE':
        return Image;
      case 'VIDEO':
        return Play;
      case 'TEXT':
        return FileText;
      case 'GIF':
        return Play;
      case 'CAROUSEL':
        return Upload;
      case 'STORY':
        return Image;
      default:
        return Image;
    }
  };

  const CreativeIcon = getCreativeIcon(creative.type);

  return (
    <PageLayout>
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
            <BreadcrumbLink href={`/dashboard/campaigns/${campaignId}/ad-sets/${adSetId}`}>
              {adSet.name}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/dashboard/campaigns/${campaignId}/ad-sets/${adSetId}/creatives`}>
              Creatives
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{creative.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback>
                <CreativeIcon className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {creative.name}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className={statusColor}>
                  {status}
                </Badge>
                <Badge variant="outline" className={typeColor}>
                  {typeInfo?.label}
                </Badge>
                <Badge variant="outline">
                  Ad Set: {adSet.name}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setIsPreviewModalOpen(true)}>
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Creative
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Creative</DialogTitle>
                </DialogHeader>
                <CreativeForm
                  creative={creative}
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
                  <AlertDialogTitle>Delete Creative</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete &quot;{creative.name}&quot;? This action cannot be undone.
                    This creative will be removed from all associated ads.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete Creative
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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
                <CardTitle className="text-sm font-medium">Engagement</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.engagement.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total engagement
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Creative Details */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Creative Information</CardTitle>
              <CardDescription>
                Basic details about this creative
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Creative ID</label>
                <p className="text-sm">{creative.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Ad Set ID</label>
                <p className="text-sm">{creative.adSetId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Type</label>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={typeColor}>
                    {typeInfo?.label}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {typeInfo?.description}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <Badge variant="secondary" className={statusColor}>
                  {status}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created</label>
                <p className="text-sm">{format(new Date(creative.createdAt), 'PPP')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                <p className="text-sm">{format(new Date(creative.updatedAt), 'PPP')}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content & Media</CardTitle>
              <CardDescription>
                Creative content and media information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {creative.content && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Content</label>
                  <p className="text-sm whitespace-pre-wrap">{creative.content}</p>
                </div>
              )}
              
              {creative.mediaUrl && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Media URL</label>
                  <p className="text-sm break-all">{creative.mediaUrl}</p>
                </div>
              )}
              
              {creative.thumbnailUrl && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Thumbnail URL</label>
                  <p className="text-sm break-all">{creative.thumbnailUrl}</p>
                </div>
              )}

              {creative.tags && creative.tags.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tags</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {creative.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Creative Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Creative Preview
            </CardTitle>
            <CardDescription>
              Preview how this creative will appear
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreativePreview creative={creative} />
          </CardContent>
        </Card>
      </div>

      {/* Preview Modal */}
      <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Creative Preview</DialogTitle>
          </DialogHeader>
          <CreativePreview creative={creative} fullScreen />
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}

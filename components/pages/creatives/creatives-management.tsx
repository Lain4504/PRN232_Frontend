"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Image,
  Search,
  Upload,
  Eye,
  Calendar,
  BarChart3,
  Play,
  FileText,
} from "lucide-react";
import { useCreatives } from "@/hooks/use-creatives";
import { useAdSet } from "@/hooks/use-ad-sets";
import { useCreativePreview } from "@/hooks/use-creative";
import { useCampaign } from "@/hooks/use-campaigns";
import { getCreativeStatus, getCreativeStatusColor, getCreativeTypeColor, type AdCreativeResponse, type CreativeType } from "@/lib/types/creatives";
import { format } from "date-fns";
import { PageLayout } from "@/components/ui/page-layout";
import { PageLoading } from "@/components/layout/page-loading";
import { PageError } from "@/components/layout/page-error";
import { PageEmpty } from "@/components/layout/page-empty";
import { CreativeUpload } from "@/components/creatives/creative-upload";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { CustomTable } from "@/components/ui/custom-table";
import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CreativesManagementProps {
  campaignId: string;
  adSetId: string;
  basePath?: string;
}

export function CreativesManagement({ campaignId, adSetId, basePath = '/dashboard/campaigns' }: CreativesManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const { data: campaign, isLoading: campaignLoading, error: campaignError } = useCampaign(campaignId);
  const [previewCreativeId, setPreviewCreativeId] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewFormat, setPreviewFormat] = useState('DESKTOP_FEED_STANDARD');
  const { data: adSet, isLoading: adSetLoading, error: adSetError } = useAdSet(adSetId);
  // Preview hook must be declared unconditionally before any early returns to keep hooks order stable
  const { data: previewHtml, isLoading: previewLoading, refetch: refetchPreview } = useCreativePreview(previewCreativeId || '', previewFormat);
  
  const page = 1;
  const [pageSize, setPageSize] = useState(20);
  const { data: creativesData, isLoading: creativesLoading, error: creativesError } = useCreatives({
    // Don't pass adSetId - get all creatives instead
    page,
    pageSize,
    search: searchTerm || undefined,
    sortBy: "createdAt",
    sortOrder: "desc"
  });

  // Helper functions - must be defined before useMemo
  const getCreativeIcon = (creative: AdCreativeResponse) => {
    // Check if it's a Facebook post creative
    if (creative.facebookPostId) {
      return Play;
    }
    const type = creative.contentPreview?.adType || creative.type;
    if (!type) return Image;
    
    const upperType = type.toUpperCase();
    if (upperType.includes('IMAGE') || upperType === 'IMAGETEXT') {
      return Image;
    }
    if (upperType.includes('VIDEO') || upperType === 'VIDEOTEXT') {
      return Play;
    }
    if (upperType.includes('TEXT') || upperType === 'TEXTONLY') {
      return FileText;
    }
    return Image;
  };

  const getCreativeDisplayName = (creative: AdCreativeResponse) => {
    // For Facebook post creatives
    if (creative.facebookPostId) {
      if (creative.contentPreview?.title && creative.contentPreview.title !== "Facebook Post Ad") {
        return creative.contentPreview.title;
      }
      return `Facebook Post ${creative.facebookPostId}`;
    }
    // Use contentPreview title if available
    if (creative.contentPreview?.title) {
      return creative.contentPreview.title;
    }
    // Use name if available
    if (creative.name) {
      return creative.name;
    }
    // Fallback to creativeId
    return creative.creativeId || creative.id;
  };

  const getCreativeType = (creative: AdCreativeResponse) => {
    // Check if it's a Facebook post creative
    if (creative.facebookPostId) {
      return 'FACEBOOK_POST';
    }
    if (creative.contentPreview?.adType) {
      return creative.contentPreview.adType;
    }
    if (creative.type) {
      return creative.type;
    }
    return 'UNKNOWN';
  };

  const formatTypeLabel = (type: string) => {
    if (type === 'FACEBOOK_POST') return 'Facebook Post';
    if (type === 'IMAGETEXT') return 'Image + Text';
    if (type === 'VIDEOTEXT') return 'Video + Text';
    if (type === 'TEXTONLY') return 'Text Only';
    return type.replace(/_/g, ' ');
  };

  // useMemo must be called before early returns to maintain hook order
  const columns = useMemo<ColumnDef<AdCreativeResponse>[]>(() => [
    {
      id: "name",
      header: "Name",
      cell: ({ row }) => {
        const creative = row.original;
        const CreativeIcon = getCreativeIcon(creative);
        const displayName = getCreativeDisplayName(creative);
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              {creative.contentPreview?.imageUrl ? (
                <AvatarImage src={creative.contentPreview.imageUrl} alt={displayName} />
              ) : creative.thumbnailUrl ? (
                <AvatarImage src={creative.thumbnailUrl} alt={displayName} />
              ) : creative.mediaUrl ? (
                <AvatarImage src={creative.mediaUrl} alt={displayName} />
              ) : null}
              <AvatarFallback>
                <CreativeIcon className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-foreground">{displayName}</span>
              {creative.contentPreview?.textContent && (
                <span className="text-xs text-muted-foreground line-clamp-1">
                  {creative.contentPreview.textContent}
                </span>
              )}
            </div>
          </div>
        );
      },
      enableSorting: true,
    },
    {
      id: "type",
      header: "Type",
      cell: ({ row }) => {
        const creative = row.original;
        const type = getCreativeType(creative);
        const allowedTypes: CreativeType[] = ['IMAGE','VIDEO','CAROUSEL','TEXT','GIF','STORY'];
        const typeColor = getCreativeTypeColor((allowedTypes.includes(type as CreativeType) ? (type as CreativeType) : 'IMAGE'));
        return (
          <Badge variant="outline" className={typeColor}>
            {formatTypeLabel(type)}
          </Badge>
        );
      },
      enableSorting: true,
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const creative = row.original;
        const status = getCreativeStatus(creative);
        const statusColor = getCreativeStatusColor(status);
        return (
          <Badge variant="secondary" className={statusColor}>
            {status}
          </Badge>
        );
      },
      enableSorting: true,
    },
    {
      id: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        const creative = row.original;
        return (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {format(new Date(creative.createdAt), 'MMM d, yyyy')}
          </div>
        );
      },
      enableSorting: true,
    },
    {
      id: "tags",
      header: "Tags",
      cell: ({ row }) => {
        const creative = row.original;
        if (!creative.tags || creative.tags.length === 0) {
          return <span className="text-sm text-muted-foreground">-</span>;
        }
        return (
          <div className="flex items-center gap-1 flex-wrap">
            {creative.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {creative.tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{creative.tags.length - 2}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      id: "metrics",
      header: "Metrics",
      cell: ({ row }) => {
        const creative = row.original;
        if (!creative.metrics) {
          return <span className="text-sm text-muted-foreground">-</span>;
        }
        return (
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex items-center gap-1 text-muted-foreground">
              <BarChart3 className="h-3 w-3" />
              {creative.metrics.impressions.toLocaleString()} impressions
            </div>
            <div className="text-muted-foreground">
              CTR: {creative.metrics.ctr.toFixed(1)}%
            </div>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const creative = row.original;
        return (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setPreviewCreativeId(creative.id);
                setIsPreviewOpen(true);
                refetchPreview();
              }}
              title="Preview"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        );
      },
      enableSorting: false,
    },
  ], [refetchPreview]);

  // Early returns after all hooks
  if (campaignLoading || adSetLoading || creativesLoading) {
    return <PageLoading />;
  }

  if (campaignError || !campaign || adSetError || !adSet || creativesError) {
    return (
      <PageError
        title="Failed to load creative management"
        description="Unable to load the creative management page. Please try again."
        showBackButton={true}
        showHomeButton={false}
      />
    );
  }

  const creatives = creativesData?.data || [];
  const hasCreatives = creatives.length > 0;

  return (
    <PageLayout
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Campaigns', href: basePath },
        { label: 'Campaign', href: `${basePath}/${campaignId}` },
        { label: 'Ad Sets', href: `${basePath}/${campaignId}/ad-sets` },
        { label: 'Ad Set', href: `${basePath}/${campaignId}/ad-sets/${adSetId}` },
        { label: 'Creatives', isCurrentPage: true },
      ]}
    >
      {/* Header */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Creatives</h1>
            <p className="text-muted-foreground">Manage creative assets.</p>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="mr-2 h-4 w-4" />
                  Create Creative
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Creative</DialogTitle>
                </DialogHeader>
                <CreativeUpload
                  adSetId={adSetId}
                  onSuccess={() => {
                    setIsUploadModalOpen(false);
                    toast.success("Creative created successfully");
                  }}
                  onCancel={() => setIsUploadModalOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-64 md:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search creatives"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background shadow-none focus-visible:ring-1 focus-visible:ring-primary/30"
            />
          </div>
        </div>

        {/* Content */}
        {!hasCreatives ? (
          <PageEmpty
            icon={Image}
            title="No creatives found"
            description="Get started by creating your first creative asset for this ad set."
            action={{
              label: "Create Your First Creative",
              onClick: () => setIsUploadModalOpen(true)
            }}
          />
        ) : (
          <CustomTable
            columns={columns}
            data={creatives}
            currentPage={page - 1}
            pageSize={pageSize}
            emptyMessage="No creatives found"
            emptyDescription="Try adjusting your search or filter criteria."
          />
        )}

        {/* Preview Modal */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="w-[96vw] sm:w-[94vw] md:w-[92vw] lg:w-[88vw] max-w-[1400px] h-[92vh] p-0 flex flex-col">
            <DialogHeader className="flex-shrink-0 px-4 sm:px-6 pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <DialogTitle>Creative Preview</DialogTitle>
                <div className="flex items-center gap-2">
                  <Select value={previewFormat} onValueChange={(v) => setPreviewFormat(v)}>
                    <SelectTrigger className="w-[200px] sm:w-[240px] h-8">
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
                  <Button variant="secondary" size="sm" onClick={() => refetchPreview()}>Refresh</Button>
                </div>
              </div>
            </DialogHeader>
            <div className="flex-1 overflow-auto p-3 sm:p-4">
              <div className="mb-2 text-xs text-muted-foreground">Scroll to view full preview</div>
              <div className="min-h-[240px] h-[70vh] overflow-auto rounded-md border bg-background p-3">
                {previewLoading ? (
                  <div className="py-10 text-center text-muted-foreground">Loading preview…</div>
                ) : previewHtml ? (
                  <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                ) : (
                  <div className="py-10 text-center text-destructive">Failed to load preview</div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
}

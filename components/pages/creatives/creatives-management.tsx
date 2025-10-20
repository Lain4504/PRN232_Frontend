"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Image,
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  Upload,
  Eye,
  Edit,
  Trash2,
  ArrowLeft,
  Calendar,
  Tag,
  BarChart3,
} from "lucide-react";
import { useCreatives } from "@/hooks/use-creatives";
import { useAdSet } from "@/hooks/use-ad-sets";
import { useCampaign } from "@/hooks/use-campaigns";
import { getCreativeStatus, getCreativeStatusColor, getCreativeTypeColor, CREATIVE_TYPES } from "@/lib/types/creatives";
import Link from "next/link";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { format } from "date-fns";
import { PageLayout } from "@/components/ui/page-layout";
import { PageLoading } from "@/components/layout/page-loading";
import { PageError } from "@/components/layout/page-error";
import { PageEmpty } from "@/components/layout/page-empty";
import { CreativeGallery } from "@/components/creatives/creative-gallery";
import { CreativeUpload } from "@/components/creatives/creative-upload";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

interface CreativesManagementProps {
  campaignId: string;
  adSetId: string;
}

export function CreativesManagement({ campaignId, adSetId }: CreativesManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const { data: campaign, isLoading: campaignLoading, error: campaignError } = useCampaign(campaignId);
  const { data: adSet, isLoading: adSetLoading, error: adSetError } = useAdSet(adSetId);
  
  const { data: creativesData, isLoading: creativesLoading, error: creativesError } = useCreatives({
    adSetId,
    page: 1,
    pageSize: 50,
    search: searchTerm || undefined,
    type: selectedType !== "all" ? selectedType as 'IMAGE' | 'VIDEO' | 'CAROUSEL' | 'TEXT' | 'GIF' | 'STORY' : undefined,
    sortBy: "createdAt",
    sortOrder: "desc"
  });

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
            <BreadcrumbPage>Creatives</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Creative Management</h1>
            <p className="text-muted-foreground">
              Manage creative assets for <strong>{adSet.name}</strong> in <strong>{campaign.name}</strong>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Creative
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
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

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search creatives..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {CREATIVE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex rounded-md border">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-r-none"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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
          <CreativeGallery
            creatives={creatives}
            viewMode={viewMode}
            onEdit={(creative) => {
              // TODO: Implement edit functionality
              toast.info("Edit functionality coming soon");
            }}
            onDelete={(creative) => {
              // TODO: Implement delete functionality
              toast.info("Delete functionality coming soon");
            }}
            onPreview={(creative) => {
              // TODO: Implement preview functionality
              toast.info("Preview functionality coming soon");
            }}
          />
        )}

        {/* Stats */}
        {hasCreatives && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Creatives</CardTitle>
                <Image className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{creatives.length}</div>
                <p className="text-xs text-muted-foreground">
                  {creatives.filter(c => c.isActive).length} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Images</CardTitle>
                <Image className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {creatives.filter(c => c.type === 'IMAGE').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Static images
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Videos</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {creatives.filter(c => c.type === 'VIDEO').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Video content
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Text</CardTitle>
                <Tag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {creatives.filter(c => c.type === 'TEXT').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Text creatives
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

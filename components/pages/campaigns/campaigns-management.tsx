"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Megaphone,
  Plus,
  Search,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  Target,
  AlertTriangle,
  AlertCircle,
  Eye,
  TrendingUp,
  Filter,
  X,
} from "lucide-react";
import { ActionsDropdown, ActionItem } from "@/components/ui/actions-dropdown";
import { AdCampaignResponse } from "@/lib/types/campaigns";
import { toast } from "sonner";
import { useBrands } from "@/hooks/use-brands";
import { useCampaigns, useDeleteCampaign } from "@/hooks/use-campaigns";
import Link from "next/link";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { getCampaignStatus, getCampaignStatusColor, CAMPAIGN_OBJECTIVES } from "@/lib/types/campaigns";
import { CampaignModal } from "@/components/campaigns/campaign-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Create columns for the data table
const createColumns = (
  handleEditCampaign: (campaign: AdCampaignResponse) => void,
  handleDeleteCampaign: (campaignId: string) => void,
  brands: { id: string; name: string }[] = [],
  isDeleting: boolean
): ColumnDef<AdCampaignResponse>[] => [
    {
      accessorKey: "name",
      header: "Campaign Name",
      cell: ({ row }) => {
        const campaign = row.original;
        const status = getCampaignStatus(campaign);
        const statusColor = getCampaignStatusColor(status);

        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                <Megaphone className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{row.getValue("name")}</div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className={statusColor}>
                  {status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  ID: {row.original.id.slice(0, 8)}
                </span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "objective",
      header: "Objective",
      cell: ({ row }) => {
        const objective = row.getValue("objective") as string;
        return (
          <div className="text-sm">
            {objective ? (
              <Badge variant="outline">
                {objective.replace(/_/g, ' ')}
              </Badge>
            ) : (
              <span className="text-muted-foreground">No objective</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "brandId",
      header: "Brand",
      cell: ({ row }) => {
        const brandId = row.getValue("brandId") as string;
        const brand = brands.find(b => b.id === brandId);
        return (
          <div className="text-sm">
            {brand ? (
              <Badge variant="outline">
                {brand.name}
              </Badge>
            ) : (
              <span className="text-muted-foreground">No brand</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "budget",
      header: "Budget",
      cell: ({ row }) => {
        const budget = row.getValue("budget") as number;
        return (
          <div className="text-sm font-medium">
            {budget ? (
              <div className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                {budget.toLocaleString()}
              </div>
            ) : (
              <span className="text-muted-foreground">No budget</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "startDate",
      header: "Duration",
      cell: ({ row }) => {
        const startDate = row.getValue("startDate") as string;
        const endDate = row.original.endDate;

        return (
          <div className="text-sm text-muted-foreground">
            {startDate ? (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <div>
                  <div>{new Date(startDate).toLocaleDateString()}</div>
                  {endDate && (
                    <div className="text-xs">to {new Date(endDate).toLocaleDateString()}</div>
                  )}
                </div>
              </div>
            ) : (
              <span>No dates set</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "metrics",
      header: "Performance",
      cell: ({ row }) => {
        const metrics = row.original.metrics;

        if (!metrics) {
          return <span className="text-muted-foreground text-sm">No data</span>;
        }

        return (
          <div className="text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3 text-muted-foreground" />
                <span>{metrics.totalImpressions.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-muted-foreground" />
                <span>{metrics.totalClicks.toLocaleString()}</span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              CTR: {metrics.ctr.toFixed(2)}%
            </div>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const actions: ActionItem[] = [
          {
            label: "View Details",
            icon: <Eye className="h-4 w-4" />,
            onClick: () => window.open(`/dashboard/campaigns/${row.original.id}`, '_self'),
          },
          {
            label: "Edit",
            icon: <Edit className="h-4 w-4" />,
            onClick: () => handleEditCampaign(row.original),
          },
          {
            label: "Delete",
            icon: <Trash2 className="h-4 w-4" />,
            onClick: () => handleDeleteCampaign(row.original.id),
            variant: "destructive" as const,
            disabled: isDeleting,
          },
        ];

        return <ActionsDropdown actions={actions} disabled={isDeleting} />;
      },
    },
  ];

export function CampaignsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [objectiveFilter, setObjectiveFilter] = useState<string>("all");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [editingCampaign, setEditingCampaign] = useState<AdCampaignResponse | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteCampaignId, setDeleteCampaignId] = useState<string | null>(null);

  // Hooks
  const { data: brands = [] } = useBrands();
  const { data: campaignsData, isLoading: loading, refetch: refetchCampaigns } = useCampaigns();
  const deleteCampaignMutation = useDeleteCampaign();

  // Ensure campaigns and brands are always arrays
  const campaigns = campaignsData?.data || [];
  const safeBrands = Array.isArray(brands) ? brands : [];

  const filteredCampaigns = campaigns.filter(campaign => {
    // Search filter
    const matchesSearch = !searchTerm ||
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.objective?.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const campaignStatus = getCampaignStatus(campaign);
    const matchesStatus = statusFilter === "all" || campaignStatus === statusFilter;

    // Objective filter
    const matchesObjective = objectiveFilter === "all" || campaign.objective === objectiveFilter;

    // Brand filter
    const matchesBrand = brandFilter === "all" || campaign.brandId === brandFilter;

    return matchesSearch && matchesStatus && matchesObjective && matchesBrand;
  });

  const handleRefresh = () => {
    refetchCampaigns();
  };



  const handleEditCampaign = (campaign: AdCampaignResponse) => {
    setEditingCampaign(campaign);
    setIsEditModalOpen(true);
  };

  const handleCloseEdit = () => {
    setEditingCampaign(null);
    setIsEditModalOpen(false);
  };

  const handleDeleteCampaign = (campaignId: string) => {
    setDeleteCampaignId(campaignId);
  };

  const confirmDeleteCampaign = async () => {
    if (!deleteCampaignId) return;

    const campaignToDelete = campaigns.find(c => c.id === deleteCampaignId);
    const campaignName = campaignToDelete?.name || 'this campaign';

    try {
      await deleteCampaignMutation.mutateAsync(deleteCampaignId);
      toast.success(`Campaign "${campaignName}" has been deleted successfully`);
      setDeleteCampaignId(null);
    } catch (error) {
      console.error('Failed to delete campaign:', error);
      toast.error('Failed to delete campaign');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex-1 space-y-8 p-6 lg:p-8 bg-background">
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <div className="h-10 w-64 mb-3 bg-muted animate-pulse rounded" />
              <div className="h-5 w-80 bg-muted animate-pulse rounded" />
            </div>
            <div className="flex items-center gap-4">
              <div className="h-8 w-32 bg-muted animate-pulse rounded" />
              <div className="h-8 w-28 bg-muted animate-pulse rounded" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Main UI
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(c => getCampaignStatus(c) === 'active').length;
  const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget || 0), 0);

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
              <BreadcrumbPage>Campaigns</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div>
          <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold tracking-tight text-foreground">
            Campaigns
          </h1>
          <p className="text-sm lg:text-base xl:text-lg text-muted-foreground mt-2 max-w-2xl">
            Manage your advertising campaigns and track their performance.
          </p>
        </div>

        {/* Single Row Layout - Stats, Filters, Search, Campaign Count, Create Button */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Stats */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border text-xs lg:text-sm">
              <Megaphone className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground flex-shrink-0" />
              <span className="font-medium">{totalCampaigns}</span>
              <span className="text-muted-foreground">Campaigns</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border text-xs lg:text-sm">
              <Target className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground flex-shrink-0" />
              <span className="font-medium">{activeCampaigns}</span>
              <span className="text-muted-foreground">Active</span>
            </div>

          </div>

          {/* Filters */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={objectiveFilter} onValueChange={setObjectiveFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Objective" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Objectives</SelectItem>
              {CAMPAIGN_OBJECTIVES.map((objective) => (
                <SelectItem key={objective} value={objective}>
                  {objective.replace(/_/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={brandFilter} onValueChange={setBrandFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Brand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Brands</SelectItem>
              {safeBrands.map((brand) => (
                <SelectItem key={brand.id} value={brand.id}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Search */}
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9"
            />
          </div>





          {/* Create Button */}
          <div className="ml-auto">
            <CampaignModal mode="create" onSuccess={handleRefresh}>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Create Campaign
              </Button>
            </CampaignModal>
          </div>
        </div>

        {/* Campaigns Table or Empty State */}
        {filteredCampaigns.length > 0 ? (
          <DataTable
            columns={createColumns(
              handleEditCampaign,
              handleDeleteCampaign,
              safeBrands,
              deleteCampaignMutation.isPending
            )}
            data={filteredCampaigns}
            pageSize={10}
            showSearch={false}
            showPageSize={false}
          />
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-6">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                  <Megaphone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {searchTerm ? 'No campaigns found' : 'No campaigns yet'}
                </h3>
                <p className="text-muted-foreground mb-4 text-sm leading-relaxed max-w-sm mx-auto">
                  {searchTerm
                    ? 'Try adjusting your search terms or filters to find your campaigns.'
                    : 'Create your first campaign to start advertising and reach your target audience.'
                  }
                </p>
                {!searchTerm && (
                  <div className="space-y-3">
                    <CampaignModal mode="create" onSuccess={handleRefresh}>
                      <Button size="sm" className="h-8 text-xs">
                        <Plus className="mr-1 h-3 w-3" />
                        Create Your First Campaign
                      </Button>
                    </CampaignModal>
                    <p className="text-xs text-muted-foreground">
                      Set up campaigns • Target audiences • Track performance
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card className="border border-blue-200 dark:border-blue-800">
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 text-xs mb-1">
                  About Campaign Management
                </h3>
                <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                  Campaigns are the foundation of your advertising strategy. Each campaign contains ad sets and individual ads.
                  Use filters to organize your campaigns by status, objective, or brand for better management.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Campaign Modal */}
        {editingCampaign && (
          <CampaignModal
            mode="edit"
            campaign={editingCampaign}
            open={isEditModalOpen}
            onOpenChange={setIsEditModalOpen}
            onSuccess={() => {
              handleRefresh();
              handleCloseEdit();
            }}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteCampaignId} onOpenChange={() => setDeleteCampaignId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Delete Campaign?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to permanently delete this campaign? This action cannot be undone and will also delete all associated ad sets and ads.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteCampaign}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={deleteCampaignMutation.isPending}
              >
                {deleteCampaignMutation.isPending ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Campaign
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

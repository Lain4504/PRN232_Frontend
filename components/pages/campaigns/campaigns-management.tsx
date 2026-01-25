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
  Sparkles,
} from "lucide-react";
import { ActionsDropdown, ActionItem } from "@/components/ui/actions-dropdown";
import { cn } from "@/lib/utils";
import { AdCampaignResponse } from "@/lib/types/campaigns";
import { toast } from "sonner";
import { useBrands } from "@/hooks/use-brands";
import { useCampaigns, useDeleteCampaign } from "@/hooks/use-campaigns";
import Link from "next/link";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { CustomTable } from "@/components/ui/custom-table";
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
  isDeleting: boolean,
  basePath: string = '/dashboard/campaigns'
): ColumnDef<AdCampaignResponse>[] => [
    {
      accessorKey: "name",
      header: "Campaign Name",
      cell: ({ row }) => {
        const campaign = row.original;
        const status = getCampaignStatus(campaign);
        const statusColor = getCampaignStatusColor(status);

        return (
          <div className="flex items-center gap-3 py-1">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20 transition-colors">
              <Megaphone className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <div className="font-semibold text-foreground text-sm">{row.getValue("name")}</div>
              <Badge variant="secondary" className={cn("text-[10px] uppercase tracking-wider font-semibold h-4 px-1.5 rounded-md", statusColor)}>
                {status}
              </Badge>
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
              <Badge variant="outline" className="bg-muted/30 border-muted-foreground/10 text-muted-foreground font-medium rounded-lg">
                {objective.replace(/_/g, ' ')}
              </Badge>
            ) : (
              <span className="text-muted-foreground italic">No objective</span>
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
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary/40" />
                <span className="font-medium text-foreground">{brand.name}</span>
              </div>
            ) : (
              <span className="text-muted-foreground italic">No brand</span>
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
          <div className="text-sm font-semibold text-foreground">
            {budget ? (
              <div className="flex items-center gap-0.5">
                <span className="text-muted-foreground font-normal">₫</span>
                {Number(budget ?? 0).toLocaleString('vi-VN')}
              </div>
            ) : (
              <span className="text-muted-foreground italic">—</span>
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
          <div className="text-xs space-y-1">
            {startDate ? (
              <>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(startDate).toLocaleDateString()}</span>
                </div>
                {endDate && (
                  <div className="pl-4.5 text-muted-foreground/60">
                    to {new Date(endDate).toLocaleDateString()}
                  </div>
                )}
              </>
            ) : (
              <span className="text-muted-foreground italic">No dates set</span>
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
          return <span className="text-muted-foreground text-xs italic">Pending data</span>;
        }

        return (
          <div className="space-y-1.5 min-w-[140px]">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              <span>Performance Index</span>
              <span>{metrics.ctr.toFixed(2)}% CTR</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-muted h-1 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(metrics.ctr * 10, 100)}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-foreground font-medium">
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3 text-muted-foreground" />
                <span>{metrics.totalImpressions.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-muted-foreground" />
                <span>{metrics.totalClicks.toLocaleString()}</span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const actions: ActionItem[] = [
          {
            label: "View Details",
            icon: <Eye className="h-4 w-4" />,
            onClick: () => window.open(`${basePath}/${row.original.id}`, '_self'),
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

        return (
          <div className="flex justify-end">
            <ActionsDropdown actions={actions} disabled={isDeleting} />
          </div>
        );
      },
    },
  ];

interface CampaignsManagementProps {
  basePath?: string;
}

export function CampaignsManagement({ basePath = '/dashboard/campaigns' }: CampaignsManagementProps = {}) {
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
    <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-8 space-y-8">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard" className="text-sm font-medium">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-sm font-medium">Campaigns</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Campaigns
          </h1>
          <p className="text-muted-foreground">
            Monitor and manage your advertising campaigns across platforms.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <div className="text-right">
            <p className="text-sm font-medium text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-primary">{activeCampaigns}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-muted-foreground">Total Budget</p>
            <p className="text-2xl font-bold">₫{totalBudget.toLocaleString('vi-VN')}</p>
          </div>
          <CampaignModal mode="create" onSuccess={handleRefresh}>
            <Button className="rounded-lg h-10 px-6 font-semibold">
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
            </Button>
          </CampaignModal>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-xl border bg-card shadow-sm">
        <div className="flex items-center gap-4 flex-wrap flex-1">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 bg-background rounded-lg border-border/60"
            />
          </div>

          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10 w-[130px] rounded-lg">
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
              <SelectTrigger className="h-10 w-[150px] rounded-lg">
                <SelectValue placeholder="Objective" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectItem value="all">All Objectives</SelectItem>
                {CAMPAIGN_OBJECTIVES.map((objective) => (
                  <SelectItem key={objective} value={objective}>
                    {objective.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Campaigns Table */}
      {filteredCampaigns.length > 0 ? (
        <Card className="rounded-xl border shadow-sm overflow-hidden">
          <CustomTable
            columns={createColumns(
              handleEditCampaign,
              handleDeleteCampaign,
              safeBrands,
              deleteCampaignMutation.isPending,
              basePath
            )}
            data={filteredCampaigns}
            pageSize={10}
            className="border-0 shadow-none bg-transparent"
            headerClassName="bg-muted/30 border-b py-3"
          />
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center border border-dashed rounded-xl bg-muted/5">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-6 text-muted-foreground">
            <Megaphone className="h-8 w-8" />
          </div>
          <div className="space-y-2 max-w-sm mx-auto">
            <h3 className="text-lg font-semibold text-foreground">
              {searchTerm ? 'No campaigns found' : 'No campaigns yet'}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm
                ? 'Try adjusting your search or filters.'
                : 'Get started by creating your first advertising campaign.'
              }
            </p>
          </div>
          {!searchTerm && (
            <div className="mt-8">
              <CampaignModal mode="create" onSuccess={handleRefresh}>
                <Button className="rounded-lg h-10 px-6">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Campaign
                </Button>
              </CampaignModal>
            </div>
          )}
        </div>
      )}

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border p-6 rounded-xl shadow-sm">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 shrink-0">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">Management Tips</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Use status filters to focus on active campaigns. Real-time metrics help you decide when to scale or pause your ads.
              </p>
            </div>
          </div>
        </Card>

        <Card className="border p-6 rounded-xl shadow-sm">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Target className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">Performance Optimization</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Campaigns with high CTR are performing well. Analyze their content to apply similar strategies to other campaigns.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteCampaignId} onOpenChange={() => setDeleteCampaignId(null)}>
        <AlertDialogContent className="rounded-xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">
              Delete Campaign?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the campaign and all its data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-2">
            <AlertDialogCancel className="rounded-lg h-10 px-4">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteCampaign}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg h-10 px-4"
              disabled={deleteCampaignMutation.isPending}
            >
              {deleteCampaignMutation.isPending ? 'Deleting...' : 'Delete Campaign'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

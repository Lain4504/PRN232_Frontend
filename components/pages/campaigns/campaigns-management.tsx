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
          <div className="flex items-center gap-4 py-1">
            <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10 transition-colors group-hover:bg-primary/10">
              <Megaphone className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <div className="font-semibold text-foreground leading-none">{row.getValue("name")}</div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className={cn("text-[10px] uppercase tracking-wider font-bold h-5 px-1.5 rounded-md", statusColor)}>
                  {status}
                </Badge>
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
    <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-10 lg:py-14 bg-background font-fira-sans">
      <div className="space-y-12">
        {/* Breadcrumb - More Minimalist */}
        <Breadcrumb className="mb-4">
          <BreadcrumbList className="gap-2">
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard" className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60 hover:text-primary transition-colors">Workspace</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-muted-foreground/30 scale-75" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-[11px] font-bold uppercase tracking-[0.15em] text-foreground/80">Campaign Engine</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header & Stats Row - Enterprise Aesthetics */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="h-2 w-8 bg-primary rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">Strategic Management</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-[1.1] selection:bg-primary/20">
              Ad Campaigns
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed font-medium">
              Monitor, optimize, and scale your cross-platform advertising with AI-orchestrated performance insights.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 p-1">
            <div className="group relative flex flex-col min-w-[120px] transition-all">
              <span className="text-3xl font-black text-foreground font-fira-mono tracking-tighter group-hover:text-primary transition-colors">{totalCampaigns}</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 px-0.5">Global Repository</span>
              <div className="absolute -bottom-2 left-0 w-0 h-0.5 bg-primary/20 group-hover:w-full transition-all duration-500" />
            </div>

            <div className="h-8 w-px bg-border/40 mx-2" />

            <div className="group relative flex flex-col min-w-[120px] transition-all">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-black text-primary font-fira-mono tracking-tighter">{activeCampaigns}</span>
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              </div>
              <span className="text-[10px] font-bold text-primary/70 uppercase tracking-widest mt-1 px-0.5">Live Operations</span>
              <div className="absolute -bottom-2 left-0 w-0 h-0.5 bg-primary/20 group-hover:w-full transition-all duration-500" />
            </div>

            <div className="h-8 w-px bg-border/40 mx-2" />

            <div className="group relative flex flex-col min-w-[160px] transition-all">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-muted-foreground mt-1 tracking-tighter">₫</span>
                <span className="text-3xl font-black text-foreground font-fira-mono tracking-tighter">{totalBudget.toLocaleString('vi-VN')}</span>
              </div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 px-0.5">Asset Allocation</span>
              <div className="absolute -bottom-2 left-0 w-0 h-0.5 bg-primary/20 group-hover:w-full transition-all duration-500" />
            </div>
          </div>
        </div>

        {/* Toolbar - Ultra Clean & Modular */}
        <div className="sticky top-20 z-40 flex flex-col md:flex-row items-center justify-between gap-6 p-5 bg-background/60 backdrop-blur-xl border border-border/40 rounded-[2rem] shadow-xl shadow-foreground/[0.02]">
          <div className="flex items-center gap-5 flex-wrap w-full md:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-80 group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Query campaigns, objectives..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 h-12 border-none bg-muted/30 focus-visible:ring-primary/20 rounded-2xl font-medium transition-all duration-300 placeholder:text-muted-foreground/40"
              />
            </div>

            <div className="h-6 w-px bg-border/40 hidden lg:block mx-1" />

            {/* Filters - Minimalist Triggers */}
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-10 px-4 border-none shadow-none bg-muted/30 hover:bg-muted/50 rounded-xl transition-all font-bold text-[11px] uppercase tracking-wider min-w-[120px]">
                  <SelectValue placeholder="STATUS" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border/40">
                  <SelectItem value="all" className="rounded-xl">ALL STATUS</SelectItem>
                  <SelectItem value="active" className="rounded-xl text-primary font-bold">ACTIVE</SelectItem>
                  <SelectItem value="paused" className="rounded-xl">PAUSED</SelectItem>
                  <SelectItem value="completed" className="rounded-xl">COMPLETED</SelectItem>
                </SelectContent>
              </Select>

              <Select value={objectiveFilter} onValueChange={setObjectiveFilter}>
                <SelectTrigger className="h-10 px-4 border-none shadow-none bg-muted/30 hover:bg-muted/50 rounded-xl transition-all font-bold text-[11px] uppercase tracking-wider">
                  <SelectValue placeholder="OBJECTIVE" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border/40 max-h-[300px]">
                  <SelectItem value="all" className="rounded-xl">ALL OBJECTIVES</SelectItem>
                  {CAMPAIGN_OBJECTIVES.map((objective) => (
                    <SelectItem key={objective} value={objective} className="rounded-xl uppercase">
                      {objective.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={brandFilter} onValueChange={setBrandFilter}>
                <SelectTrigger className="h-10 px-4 border-none shadow-none bg-muted/30 hover:bg-muted/50 rounded-xl transition-all font-bold text-[11px] uppercase tracking-wider">
                  <SelectValue placeholder="BRAND" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border/40">
                  <SelectItem value="all" className="rounded-xl">ALL ENTITIES</SelectItem>
                  {safeBrands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id} className="rounded-xl font-medium">
                      {brand.name.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="hidden sm:flex flex-col items-end px-2 pointer-events-none opacity-40">
              <span className="text-[9px] font-black uppercase tracking-widest leading-tight">Orchestrate</span>
              <span className="text-[11px] font-bold">Next Batch</span>
            </div>
            <CampaignModal mode="create" onSuccess={handleRefresh}>
              <Button className="w-full md:w-auto rounded-[1.2rem] h-14 px-8 bg-primary hover:bg-primary/95 text-primary-foreground font-black uppercase tracking-wider shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]">
                <Plus className="mr-2 h-5 w-5 stroke-[3]" />
                Initiate Campaign
              </Button>
            </CampaignModal>
          </div>
        </div>

        {/* Campaigns View Area */}
        {filteredCampaigns.length > 0 ? (
          <div className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition duration-1000" />
            <Card className="relative border-border/40 bg-card/60 backdrop-blur-md rounded-[2.5rem] overflow-hidden shadow-2xl selection:bg-primary/10">
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
                headerClassName="bg-muted/20 hover:bg-muted/20 border-b border-border/40 py-6"
              />
            </Card>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 px-10 text-center border border-border/40 border-dashed rounded-[3rem] bg-muted/10 relative overflow-hidden group">
            {/* Animated BG for empty state */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,var(--color-primary)_0%,transparent_50%)] opacity-[0.03]" />

            <div className="h-28 w-28 rounded-[2.5rem] bg-card flex items-center justify-center shadow-2xl border border-border/40 mb-10 transition-transform group-hover:rotate-6 group-hover:scale-110 duration-500">
              <Megaphone className="h-12 w-12 text-primary stroke-[1.5]" />
            </div>
            <div className="space-y-4 relative z-10 max-w-sm mx-auto">
              <h3 className="text-3xl font-black text-foreground tracking-tight leading-none uppercase">
                {searchTerm ? 'Zero Matches Found' : 'Operation Awaiting'}
              </h3>
              <p className="text-muted-foreground font-medium leading-relaxed">
                {searchTerm
                  ? 'Input query did not resonate with any existing campaign nodes. Refine parameters.'
                  : 'The tactical dashboard is primed for data. Launch your inaugural campaign to activate AISAM Intelligence.'
                }
              </p>
            </div>
            {!searchTerm && (
              <div className="mt-12 relative z-10">
                <CampaignModal mode="create" onSuccess={handleRefresh}>
                  <Button className="rounded-full px-12 h-16 text-lg font-black uppercase tracking-widest transition-all hover:scale-110 active:scale-90 shadow-2xl shadow-primary/20">
                    <Sparkles className="mr-3 h-5 w-5 fill-current" />
                    Launch Protocol
                  </Button>
                </CampaignModal>
              </div>
            )}
          </div>
        )}

        {/* Global Analytics Intelligence Footer */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-border/30 shadow-none bg-muted/20 rounded-[2rem] p-8 group transition-all hover:bg-muted/30">
            <div className="flex items-start gap-6">
              <div className="h-12 w-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-600 shrink-0 group-hover:scale-110 transition-transform">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="font-black text-xs uppercase tracking-[0.2em] text-blue-900/40 dark:text-blue-100/40">
                  Management Intelligence
                </h3>
                <p className="text-sm text-foreground/70 leading-relaxed font-medium">
                  Campaigns represent individual strategic objectives. Each node can be granularly optimized via
                  integrated ad sets. Use the cross-platform filters to isolate performance spikes and dips.
                </p>
              </div>
            </div>
          </Card>

          <Card className="border-border/30 shadow-none bg-primary/5 rounded-[2rem] p-8 group transition-all hover:bg-primary/10">
            <div className="flex items-start gap-6">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
                <Target className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="font-black text-xs uppercase tracking-[0.2em] text-primary/40">
                  Performance Optimization
                </h3>
                <p className="text-sm text-foreground/70 leading-relaxed font-medium">
                  The CTR Performance Index is calculated in real-time. Nodes with values exceeding 2.5%
                  are classified as high-yield. Analyze these to replicate success across current batches.
                </p>
              </div>
            </div>
          </Card>
        </div>

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

        {/* Delete Confirmation Overlays */}
        <AlertDialog open={!!deleteCampaignId} onOpenChange={() => setDeleteCampaignId(null)}>
          <AlertDialogContent className="rounded-[2.5rem] border-border/40 bg-background/95 backdrop-blur-xl">
            <AlertDialogHeader className="space-y-4">
              <div className="h-16 w-16 rounded-[1.5rem] bg-destructive/10 flex items-center justify-center text-destructive mb-2">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <AlertDialogTitle className="text-3xl font-black uppercase tracking-tight">
                Terminate Node?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base font-medium leading-relaxed">
                This action initiates a permanent deletion sequence. All ad sets, assets, and historical performance data associated with this node will be purged from the repository.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-8 gap-3">
              <AlertDialogCancel className="rounded-2xl h-12 px-6 font-bold border-border/40">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteCampaign}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-2xl h-12 px-8 font-black uppercase tracking-widest shadow-xl shadow-destructive/20"
                disabled={deleteCampaignMutation.isPending}
              >
                {deleteCampaignMutation.isPending ? 'Purging...' : 'Confirm Purge'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

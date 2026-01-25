"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
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
  DollarSign,
  Target,
  AlertTriangle,
  Eye,
  TrendingUp,
  X,
  Sparkles,
  Zap,
} from "lucide-react";
import { ActionsDropdown, ActionItem } from "@/components/ui/actions-dropdown";
import { cn } from "@/lib/utils";
import { AdCampaignResponse } from "@/lib/types/campaigns";
import { toast } from "sonner";
import { useBrands } from "@/hooks/use-brands";
import { useCampaigns, useDeleteCampaign } from "@/hooks/use-campaigns";
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

const createColumns = (
  handleEditCampaign: (campaign: AdCampaignResponse) => void,
  handleDeleteCampaign: (campaignId: string) => void,
  brands: { id: string; name: string }[] = [],
  isDeleting: boolean,
  basePath: string = '/dashboard/campaigns'
): ColumnDef<AdCampaignResponse>[] => [
    {
      accessorKey: "name",
      header: "Campaign Directive",
      cell: ({ row }) => {
        const campaign = row.original;
        const status = getCampaignStatus(campaign);
        const statusColor = getCampaignStatusColor(status);

        return (
          <div className="flex items-center gap-5 py-2">
            <div className="size-14 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-2xl shadow-primary/5 group-hover:scale-110 transition-transform">
              <Megaphone className="size-6" />
            </div>
            <div>
              <div className="font-black text-foreground italic text-lg leading-tight uppercase tracking-tight">{row.getValue("name")}</div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className={cn("text-[9px] font-black uppercase tracking-widest py-0 px-2 rounded-sm", statusColor)}>
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
      header: "Neural Strategy",
      cell: ({ row }) => {
        const objective = row.getValue("objective") as string;
        const brandId = row.original.brandId;
        const brand = brands.find(b => b.id === brandId);
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Target className="size-4 text-primary" />
              <span className="text-xs font-black italic uppercase tracking-tighter text-foreground">{objective?.replace(/_/g, ' ') || "UNDEFINED"}</span>
            </div>
            {brand && (
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-6">Sector: {brand.name}</div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "budget",
      header: "Injected Capital",
      cell: ({ row }) => {
        const budget = row.getValue("budget") as number;
        return (
          <div className="space-y-0.5">
            <div className="text-sm font-black text-foreground italic flex items-center gap-1">
              <span className="text-primary opacity-50">₫</span>
              {(budget || 0).toLocaleString('vi-VN')}
            </div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Global Allocation</div>
          </div>
        );
      },
    },
    {
      accessorKey: "metrics",
      header: "Velocity Report",
      cell: ({ row }) => {
        const metrics = row.original.metrics;
        if (!metrics) return <span className="text-[10px] font-black text-muted-foreground/40 italic uppercase tracking-widest">Awaiting Sync</span>;

        return (
          <div className="space-y-3 min-w-[180px]">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em]">
              <span className="text-muted-foreground/60">Performance</span>
              <span className="text-primary italic">{metrics.ctr.toFixed(2)}% CTR</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden shadow-inner border border-foreground/5">
              <div
                className="bg-primary h-full rounded-full transition-all duration-1000 shadow-lg shadow-primary/30"
                style={{ width: `${Math.min(metrics.ctr * 15, 100)}%` }}
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-[10px] font-black italic">
                <Eye className="size-3 text-muted-foreground" />
                {metrics.totalImpressions.toLocaleString()}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-black italic text-primary">
                <TrendingUp className="size-3" />
                {metrics.totalClicks.toLocaleString()}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right uppercase tracking-[0.2em] text-[10px]">Operations</div>,
      cell: ({ row }) => {
        const actions: ActionItem[] = [
          {
            label: "Performance Node",
            icon: <Eye className="size-4" />,
            onClick: () => window.open(`${basePath}/${row.original.id}`, '_self'),
          },
          {
            label: "Configure Strategy",
            icon: <Edit className="size-4" />,
            onClick: () => handleEditCampaign(row.original),
          },
          {
            label: "Eject Campaign",
            icon: <Trash2 className="size-4" />,
            onClick: () => handleDeleteCampaign(row.original.id),
            variant: "destructive",
            disabled: isDeleting,
          },
        ];

        return (
          <div className="flex justify-end pr-4">
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
  const { t } = useTranslation("common");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [objectiveFilter, setObjectiveFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [editingCampaign, setEditingCampaign] = useState<AdCampaignResponse | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteCampaignId, setDeleteCampaignId] = useState<string | null>(null);

  const { data: brands = [] } = useBrands();
  const { data: campaignsData, isLoading: loading, refetch: refetchCampaigns } = useCampaigns();
  const deleteCampaignMutation = useDeleteCampaign();

  const campaigns = campaignsData?.data || [];
  const safeBrands = Array.isArray(brands) ? brands : [];

  const filteredCampaigns = campaigns.filter(campaign => {
    const campaignStatus = getCampaignStatus(campaign);
    return (
      (!searchTerm || campaign.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === "all" || campaignStatus === statusFilter) &&
      (objectiveFilter === "all" || campaign.objective === objectiveFilter) &&
      (brandFilter === "all" || campaign.brandId === brandFilter)
    );
  });

  const confirmDeleteCampaign = async () => {
    if (!deleteCampaignId) return;
    try {
      await deleteCampaignMutation.mutateAsync(deleteCampaignId);
      toast.success("Campaign ejected from matrix");
      setDeleteCampaignId(null);
    } catch (error) {
      toast.error("Ejection sequence aborted");
    }
  };

  const handleEditCampaign = (campaign: AdCampaignResponse) => {
    setEditingCampaign(campaign);
    setIsEditModalOpen(true);
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-12 animate-pulse">
      <div className="h-8 w-64 bg-muted rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-muted rounded-[32px]" />)}
      </div>
      <div className="h-[600px] bg-muted rounded-[40px]" />
    </div>
  );

  const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget || 0), 0);
  const activeCount = campaigns.filter(c => getCampaignStatus(c) === 'active').length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-12 font-fira-sans mb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div className="space-y-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink href="/dashboard" className="text-[10px] font-black uppercase">Dashboard</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage className="text-[10px] font-black uppercase text-primary">Strategic Hub</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="space-y-1">
            <h1 className="text-5xl font-black tracking-tighter text-foreground uppercase italic leading-none">
              {t("campaigns.title")}
            </h1>
            <p className="text-lg text-muted-foreground font-medium max-w-2xl leading-relaxed italic border-l-4 border-primary pl-6">
              {t("campaigns.description")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <CampaignModal mode="create" onSuccess={refetchCampaigns}>
            <Button size="lg" className="rounded-[20px] h-16 px-10 font-black uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all bg-primary">
              <Plus className="mr-3 size-6" />
              {t("campaigns.createCampaign")}
            </Button>
          </CampaignModal>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Active Deployments", value: activeCount, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Capital Injection", value: `₫${totalBudget.toLocaleString('vi-VN')}`, icon: DollarSign, color: "text-primary", bg: "bg-primary/10" },
          { label: "Global Registry", value: campaigns.length, icon: Megaphone, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Efficiency Index", value: "92/100", icon: Sparkles, color: "text-amber-500", bg: "bg-amber-500/10" },
        ].map((stat, i) => (
          <Card key={i} className="rounded-[32px] border-2 bg-card/40 p-8 shadow-sm group hover:border-primary/50 transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-6">
              <div className={cn("size-12 rounded-2xl flex items-center justify-center shadow-inner", stat.bg, stat.color)}>
                <stat.icon className="size-6 transition-transform group-hover:rotate-12" />
              </div>
              <Badge variant="outline" className="text-[9px] font-black uppercase border-none bg-muted/5 p-1 px-2 italic tracking-widest">Realtime Stats</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-black text-foreground italic tracking-tight">{stat.value}</p>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 p-6 rounded-[32px] border-2 bg-muted/10 backdrop-blur-md">
        <div className="relative w-full lg:w-[400px] group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search operational data..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-14 h-14 bg-background/50 border-none shadow-inner rounded-2xl font-black italic text-xs uppercase tracking-widest"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-14 w-[160px] rounded-2xl border-none shadow-inner bg-background/50 font-black uppercase text-[10px] tracking-widest px-6">
              <SelectValue placeholder="PHASE" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-2">
              <SelectItem value="all" className="font-bold text-[10px] uppercase font-fira-sans">All Phases</SelectItem>
              <SelectItem value="active" className="font-bold text-[10px] uppercase font-fira-sans">Active Matrix</SelectItem>
              <SelectItem value="paused" className="font-bold text-[10px] uppercase font-fira-sans">Suspended</SelectItem>
            </SelectContent>
          </Select>

          <Select value={objectiveFilter} onValueChange={setObjectiveFilter}>
            <SelectTrigger className="h-14 w-[180px] rounded-2xl border-none shadow-inner bg-background/50 font-black uppercase text-[10px] tracking-widest px-6">
              <SelectValue placeholder="STRATEGY" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-2 max-h-[400px]">
              <SelectItem value="all" className="font-bold text-[10px] uppercase font-fira-sans">All Strategies</SelectItem>
              {CAMPAIGN_OBJECTIVES.map(obj => (
                <SelectItem key={obj} value={obj} className="font-bold text-[10px] uppercase font-fira-sans">{obj.replace(/_/g, ' ')}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(searchTerm || statusFilter !== "all" || objectiveFilter !== "all") && (
            <Button variant="ghost" className="h-14 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-destructive/10 hover:text-destructive" onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setObjectiveFilter("all");
            }}>
              <X className="mr-3 size-4" /> Reset Filters
            </Button>
          )}
        </div>
      </div>

      {filteredCampaigns.length > 0 ? (
        <Card className="rounded-[40px] border-2 bg-card/40 overflow-hidden shadow-2xl shadow-foreground/5 relative group">
          <div className="absolute top-0 right-0 p-10 opacity-5 -rotate-12 transition-transform duration-1000">
            <Zap className="size-40 text-primary" />
          </div>
          <CustomTable
            columns={createColumns(handleEditCampaign, setDeleteCampaignId, safeBrands, deleteCampaignMutation.isPending, basePath)}
            data={filteredCampaigns}
            pageSize={10}
            className="border-0 shadow-none bg-transparent"
            headerClassName="bg-muted/30 border-b py-6 px-10 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/70"
          />
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center py-40 px-6 text-center border-2 border-dashed rounded-[40px] bg-muted/5 font-fira-sans">
          <div className="size-24 rounded-[32px] bg-primary/5 flex items-center justify-center mb-10 text-primary border-2 border-primary/10 shadow-inner">
            <Megaphone className="size-12" />
          </div>
          <div className="space-y-4 max-w-md">
            <h3 className="text-3xl font-black uppercase tracking-tight text-foreground italic underline decoration-primary decoration-4 underline-offset-8">
              {searchTerm ? 'Signal Not Found' : 'Operation: NULL'}
            </h3>
            <p className="text-muted-foreground font-bold leading-relaxed italic opacity-80">
              {searchTerm
                ? "The query descriptor returned no matches from the current operational grid."
                : "The campaign matrix is currently inactive. Initialize a new deployment to start visual synthesis."
              }
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-20">
        {[
          { title: "Smart Synthetic Monitoring", desc: "Neural engines are monitoring all clusters. CTR above 2.8% detected in Sector Alpha warrants a budget scaling maneuver.", icon: Sparkles, color: "text-amber-500", bg: "bg-amber-500/10" },
          { title: "Velocity Optimization", desc: "Current throughput indicates peak engagement during the 19:00 corridor. Align scheduled posts for maximum saturation.", icon: Target, color: "text-blue-500", bg: "bg-blue-500/10" },
        ].map((insight, i) => (
          <Card key={i} className="p-10 rounded-[40px] border-2 bg-card/40 flex items-start gap-8 shadow-xl shadow-foreground/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-125 transition-transform duration-1000">
              <insight.icon className="size-32" />
            </div>
            <div className={cn("size-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg relative z-10", insight.bg, insight.color)}>
              <insight.icon className="size-7" />
            </div>
            <div className="space-y-3 relative z-10">
              <h4 className="text-xl font-black text-foreground tracking-tight italic uppercase">{insight.title}</h4>
              <p className="text-sm font-bold text-muted-foreground/80 leading-relaxed italic">{insight.desc}</p>
            </div>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteCampaignId} onOpenChange={() => setDeleteCampaignId(null)}>
        <AlertDialogContent className="rounded-[40px] border-2 bg-background/95 backdrop-blur-2xl p-10 max-w-md font-fira-sans border-destructive/20 shadow-2xl shadow-destructive/10">
          <AlertDialogHeader className="space-y-6">
            <div className="size-20 rounded-3xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto border border-destructive/20 shadow-inner">
              <AlertTriangle className="size-10" />
            </div>
            <AlertDialogTitle className="text-3xl font-black tracking-tight text-center uppercase italic">Archive <span className="text-destructive">Signal</span>?</AlertDialogTitle>
            <AlertDialogDescription className="text-base font-bold text-muted-foreground/80 leading-relaxed text-center italic mt-2">
              This will move the selected deployment to the ARCHIVE sector. Historical data remains indexed but active sync will terminate.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-12 grid grid-cols-2 gap-6">
            <AlertDialogCancel className="rounded-2xl h-14 font-black uppercase tracking-widest text-[10px] border-2">Abort</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteCampaign}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-2xl h-14 font-black uppercase tracking-widest text-[10px] border-none shadow-2xl shadow-destructive/30"
              disabled={deleteCampaignMutation.isPending}
            >
              {deleteCampaignMutation.isPending ? 'ARCHIVING...' : 'CONFIRM ARCHIVE'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CampaignModal mode="edit" campaign={editingCampaign || undefined} open={isEditModalOpen} onOpenChange={setIsEditModalOpen} onSuccess={refetchCampaigns} />
    </div>
  );
}

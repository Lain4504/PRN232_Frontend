"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Target,
  Plus,
  Search,
  Edit,
  Trash2,
  Calendar,
  Package,
  FileText,
  AlertTriangle
} from "lucide-react";
import { ActionsDropdown, ActionItem } from "@/components/ui/actions-dropdown";
import { Brand } from "@/lib/types/aisam-types";
import { toast } from "sonner";
import { useUser } from "@/hooks/use-user";
import { useBrands, useDeleteBrand } from "@/hooks/use-brands";
import Link from "next/link";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { BrandModal } from "@/components/brands/brand-modal";
import { CustomTable } from "@/components/ui/custom-table";
import { ColumnDef } from "@tanstack/react-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Create columns for the data table
const createColumns = (
  handleEditBrand: (brand: Brand) => void,
  handleDeleteBrand: (brandId: string) => void,
  isDeleting: boolean
): ColumnDef<Brand>[] => [
    {
      accessorKey: "name",
      header: "Brand Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-4 py-1">
          <div className="relative group">
            <Avatar className="h-14 w-14 rounded-2xl border-2 border-primary/10 transition-all duration-300 group-hover:scale-105 group-hover:border-primary/30">
              {(() => {
                const logo = (row.original as unknown as { logo_url?: string; logoUrl?: string }).logo_url
                  || (row.original as unknown as { logo_url?: string; logoUrl?: string }).logoUrl
                return logo ? (
                  <AvatarImage src={logo} alt={row.getValue("name")} />
                ) : (
                  <AvatarFallback className="bg-primary/5 text-primary">
                    <Target className="h-6 w-6" />
                  </AvatarFallback>
                )
              })()}
            </Avatar>
          </div>
          <div className="space-y-0.5">
            <div className="font-bold text-foreground text-base leading-none">{row.getValue("name")}</div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Verified Brand</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "About",
      cell: ({ row }) => (
        <div className="text-sm text-balance max-w-[280px]">
          {row.getValue("description") ? (
            <p className="text-muted-foreground line-clamp-2 leading-relaxed">
              {row.getValue("description")}
            </p>
          ) : (
            <span className="text-muted-foreground/40 italic">No description provided</span>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const actions: ActionItem[] = [
          {
            label: "View Products",
            icon: <Package className="h-4 w-4" />,
            onClick: () => window.open(`/dashboard/brands/${row.original.id}/products`, '_self'),
          },
          {
            label: "Manage Content",
            icon: <FileText className="h-4 w-4" />,
            onClick: () => window.open(`/dashboard/brands/${row.original.id}/contents`, '_self'),
          },
          {
            label: "Edit",
            icon: <Edit className="h-4 w-4" />,
            onClick: () => handleEditBrand(row.original),
          },
          {
            label: "Delete",
            icon: <Trash2 className="h-4 w-4" />,
            onClick: () => handleDeleteBrand(row.original.id),
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

export function BrandsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteBrandId, setDeleteBrandId] = useState<string | null>(null);

  // Hooks
  const { data: user } = useUser();
  const { data: brands = [], isLoading: loading, refetch: refetchBrands } = useBrands();
  const deleteBrandMutation = useDeleteBrand();

  // Ensure brands and profiles are always arrays
  const safeBrands = Array.isArray(brands) ? brands : [];

  // Filter brands based on search term
  const filteredBrands = safeBrands.filter(brand => {
    if (!searchTerm) return true;
    return brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand.description?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const [pageSize, setPageSize] = useState(10);


  const handleRefresh = () => {
    refetchBrands();
  };

  const handleEditBrand = (brand: Brand) => {
    setEditingBrand(brand);
    setIsEditModalOpen(true);
  };

  const handleCloseEdit = () => {
    setEditingBrand(null);
    setIsEditModalOpen(false);
  };

  const handleDeleteBrand = (brandId: string) => {
    setDeleteBrandId(brandId);
  };

  const confirmDeleteBrand = async () => {
    if (!deleteBrandId) return;

    const brandToDelete = safeBrands.find(b => b.id === deleteBrandId);
    const brandName = brandToDelete?.name || 'this brand';

    try {
      await deleteBrandMutation.mutateAsync(deleteBrandId);
      toast.success(`Brand "${brandName}" and all associated products have been deleted successfully`);
      setDeleteBrandId(null);
    } catch (error) {
      console.error('Failed to delete brand:', error);
      toast.error('Failed to delete brand');
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
  const totalBrands = safeBrands.length;

  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-10 lg:py-14 bg-background font-fira-sans">
      <div className="space-y-12">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-4">
          <BreadcrumbList className="gap-2">
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard" className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60 hover:text-primary transition-colors">Workspace</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-muted-foreground/30 scale-75" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-[11px] font-bold uppercase tracking-[0.15em] text-foreground/80">My Brands</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header Section */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="h-2 w-8 bg-primary rounded-full" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/70">Brand Management</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-[1.1] selection:bg-primary/20">
              My <span className="text-primary">Brands</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed font-medium">
              Manage your brand profiles, assets, and visual identities in one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-8 p-1">
            <div className="group relative flex flex-col min-w-[140px] transition-all">
              <span className="text-4xl font-black text-foreground font-fira-mono tracking-tighter group-hover:text-primary transition-colors">{totalBrands}</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 px-0.5">Active Brands</span>
              <div className="absolute -bottom-2 left-0 w-0 h-0.5 bg-primary/20 group-hover:w-full transition-all duration-500" />
            </div>

            <div className="group relative flex flex-col min-w-[140px] transition-all">
              <div className="flex items-center gap-2">
                <span className="text-4xl font-black text-primary font-fira-mono tracking-tighter">Active</span>
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              </div>
              <span className="text-[10px] font-bold text-primary/70 uppercase tracking-widest mt-1 px-0.5">System Status</span>
              <div className="absolute -bottom-2 left-0 w-0 h-0.5 bg-primary/20 group-hover:w-full transition-all duration-500" />
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="sticky top-20 z-40 flex flex-col md:flex-row items-center justify-between gap-6 p-5 bg-background/60 backdrop-blur-xl border border-border/40 rounded-[2rem] shadow-xl shadow-foreground/[0.02]">
          <div className="flex items-center gap-5 flex-wrap w-full md:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-96 group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search brands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 h-12 border-none bg-muted/30 focus-visible:ring-primary/20 rounded-2xl font-medium transition-all duration-300 placeholder:text-muted-foreground/40"
              />
            </div>

            <div className="h-6 w-px bg-border/40 hidden lg:block mx-1" />

            {/* Rows Selector */}
            <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
              <SelectTrigger className="h-10 px-4 border-none shadow-none bg-muted/30 hover:bg-muted/50 rounded-xl transition-all font-bold text-[11px] uppercase tracking-wider min-w-[150px]">
                <SelectValue placeholder="ROWS" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-border/40">
                {[5, 10, 20, 50].map((size) => (
                  <SelectItem key={size} value={String(size)} className="rounded-xl font-bold">
                    {size} PER PAGE
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <BrandModal mode="create" onSuccess={handleRefresh}>
              <Button className="w-full md:w-auto rounded-[1.2rem] h-14 px-8 bg-primary hover:bg-primary/95 text-primary-foreground font-bold uppercase tracking-wider shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]">
                <Plus className="mr-2 h-5 w-5 stroke-[3]" />
                Add New Brand
              </Button>
            </BrandModal>
          </div>
        </div>

        {/* Brands Repository */}
        {filteredBrands.length > 0 ? (
          <div className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition duration-1000" />
            <Card className="relative border-border/40 bg-card/60 backdrop-blur-md rounded-[2.5rem] overflow-hidden shadow-2xl">
              <CustomTable
                columns={createColumns(
                  handleEditBrand,
                  handleDeleteBrand,
                  deleteBrandMutation.isPending
                )}
                data={filteredBrands}
                pageSize={pageSize}
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
              <Target className="h-12 w-12 text-primary stroke-[1.5]" />
            </div>
            <div className="space-y-4 relative z-10 max-w-sm mx-auto">
              <h3 className="text-3xl font-black text-foreground tracking-tight leading-none uppercase">
                {searchTerm ? 'No Matches Found' : 'No Brands Yet'}
              </h3>
              <p className="text-muted-foreground font-medium leading-relaxed">
                {searchTerm
                  ? 'We couldn\'t find any brands matching your search.'
                  : 'Start by creating your first brand profile. This will act as the home for your brand assets.'
                }
              </p>
            </div>
            {!searchTerm && (
              <div className="mt-12 relative z-10">
                <BrandModal mode="create" onSuccess={handleRefresh}>
                  <Button className="rounded-full px-12 h-16 text-lg font-bold uppercase tracking-widest transition-all hover:scale-110 active:scale-90 shadow-2xl shadow-primary/20">
                    <Plus className="mr-3 h-5 w-5 stroke-[3]" />
                    Create Brand
                  </Button>
                </BrandModal>
              </div>
            )}
          </div>
        )}

        {/* Edit Brand Modal */}
        {editingBrand && (
          <BrandModal
            mode="edit"
            brand={editingBrand}
            open={isEditModalOpen}
            onOpenChange={setIsEditModalOpen}
            onSuccess={() => {
              handleRefresh();
              handleCloseEdit();
            }}
          />
        )}

        {/* Delete Dialog */}
        <AlertDialog open={!!deleteBrandId} onOpenChange={() => setDeleteBrandId(null)}>
          <AlertDialogContent className="rounded-[2.5rem] border-border/40 bg-background/95 backdrop-blur-xl">
            <AlertDialogHeader className="space-y-4">
              <div className="h-16 w-16 rounded-[1.5rem] bg-destructive/10 flex items-center justify-center text-destructive mb-2">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <AlertDialogTitle className="text-3xl font-black uppercase tracking-tight">
                Delete Brand?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base font-medium leading-relaxed">
                This will permanently delete this brand and all associated products. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-10 gap-3">
              <AlertDialogCancel className="rounded-2xl h-12 px-6 font-bold border-border/40">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteBrand}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-2xl h-12 px-8 font-bold uppercase tracking-widest shadow-xl shadow-destructive/20"
                disabled={deleteBrandMutation.isPending}
              >
                {deleteBrandMutation.isPending ? 'Deleting...' : 'Delete Brand'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}


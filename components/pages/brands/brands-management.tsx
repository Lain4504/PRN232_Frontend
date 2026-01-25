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
        <div className="flex items-center gap-3 py-1">
          <Avatar className="h-10 w-10 rounded-lg border bg-muted">
            {(() => {
              const logo = (row.original as unknown as { logo_url?: string; logoUrl?: string }).logo_url
                || (row.original as unknown as { logo_url?: string; logoUrl?: string }).logoUrl
              return logo ? (
                <AvatarImage src={logo} alt={row.getValue("name")} />
              ) : (
                <AvatarFallback>
                  <Target className="h-5 w-5 text-muted-foreground" />
                </AvatarFallback>
              )
            })()}
          </Avatar>
          <div className="space-y-0.5">
            <div className="font-semibold text-foreground text-sm">{row.getValue("name")}</div>
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
    <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-8 space-y-8">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard" className="text-sm font-medium">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-sm font-medium">Brands</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Brands
          </h1>
          <p className="text-muted-foreground">
            Manage your brand profiles and visual identities.
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-sm font-medium text-muted-foreground">Total Brands</p>
            <p className="text-2xl font-bold">{totalBrands}</p>
          </div>
          <BrandModal mode="create" onSuccess={handleRefresh}>
            <Button className="rounded-lg h-10 px-6 font-semibold">
              <Plus className="mr-2 h-4 w-4" />
              Add Brand
            </Button>
          </BrandModal>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border bg-card shadow-sm">
        <div className="relative w-full sm:w-80 group">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search brands..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 bg-background rounded-lg border-border/60"
          />
        </div>

        <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
          <SelectTrigger className="w-[140px] h-10 rounded-lg">
            <SelectValue placeholder="Per page" />
          </SelectTrigger>
          <SelectContent className="rounded-lg">
            {[5, 10, 20, 50].map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size} per page
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Brands Table */}
      {filteredBrands.length > 0 ? (
        <Card className="rounded-xl border shadow-sm overflow-hidden">
          <CustomTable
            columns={createColumns(
              handleEditBrand,
              handleDeleteBrand,
              deleteBrandMutation.isPending
            )}
            data={filteredBrands}
            pageSize={pageSize}
            className="border-0 shadow-none bg-transparent"
            headerClassName="bg-muted/30 border-b py-3"
          />
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center border border-dashed rounded-xl bg-muted/5">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-6 text-muted-foreground">
            <Target className="h-8 w-8" />
          </div>
          <div className="space-y-2 max-w-sm mx-auto">
            <h3 className="text-lg font-semibold text-foreground">
              {searchTerm ? 'No brands found' : 'No brands yet'}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm
                ? 'Try searching with a different term.'
                : 'Get started by creating your first brand profile.'
              }
            </p>
          </div>
          {!searchTerm && (
            <div className="mt-8">
              <BrandModal mode="create" onSuccess={handleRefresh}>
                <Button className="rounded-lg h-10 px-6">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Brand
                </Button>
              </BrandModal>
            </div>
          )}
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteBrandId} onOpenChange={() => setDeleteBrandId(null)}>
        <AlertDialogContent className="rounded-xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">
              Delete Brand?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this brand and all associated products. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-2">
            <AlertDialogCancel className="rounded-lg h-10 px-4">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteBrand}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg h-10 px-4"
              disabled={deleteBrandMutation.isPending}
            >
              {deleteBrandMutation.isPending ? 'Deleting...' : 'Delete Brand'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


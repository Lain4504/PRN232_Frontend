"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Brand, Profile } from "@/lib/types/aisam-types";
import { toast } from "sonner";
import { useUserProfile, useProfiles } from "@/hooks/use-profile";
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
  profiles: Profile[] = [],
  isDeleting: boolean
): ColumnDef<Brand>[] => [
  {
    accessorKey: "name",
    header: "Brand Name",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          {row.original.logo_url ? (
            <AvatarImage src={row.original.logo_url} alt={row.getValue("name")} />
          ) : (
            <AvatarFallback>
              <Target className="h-4 w-4" />
            </AvatarFallback>
          )}
        </Avatar>
        <div>
          <div className="font-semibold text-gray-800">{row.getValue("name")}</div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="text-muted-foreground line-clamp-2 max-w-xs text-center">
        {row.getValue("description") || 'No description'}
      </div>
    ),
  },
  {
    accessorKey: "profile_id",
    header: "Linked Profile",
    cell: ({ row }) => {
      const profileId = row.getValue("profile_id") as string;
      const profile = profiles.find(p => p.id === profileId);
      return (
        <div className="text-sm text-center">
          {profile ? (
            <Badge variant="outline">
              {profile.company_name || profile.profileType}
            </Badge>
          ) : (
            <span className="text-muted-foreground">No profile linked</span>
          )}
        </div>
      );
    },
  },

  {
    id: "actions",
    header: "",
    size: 50,
    maxSize: 50,
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
        <div className="flex justify-center">
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
  const { data: user } = useUserProfile();
  const { data: profiles = [] } = useProfiles();
  const { data: brands = [], isLoading: loading, refetch: refetchBrands } = useBrands();
  const deleteBrandMutation = useDeleteBrand();

  // Ensure brands and profiles are always arrays
  const safeBrands = Array.isArray(brands) ? brands : [];
  const safeProfiles = Array.isArray(profiles) ? profiles : [];

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
  const totalProfiles = profiles.length;

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
              <BreadcrumbPage>Brands</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div>
          <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold tracking-tight text-foreground">
            Brands
          </h1>
          <p className="text-sm lg:text-base xl:text-lg text-muted-foreground mt-2 max-w-2xl">
            Manage your brands and their assets in one place.
          </p>
        </div>

        {/* Single Row Layout - Stats, Rows, Search, Brands, Create Button */}
        <div className="flex items-center gap-4">
          {/* Stats */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm shadow-sm">
              <Target className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <span className="font-semibold text-gray-700">{totalBrands}</span>
              <span className="text-gray-500">Brands</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm shadow-sm">
              <span className="font-semibold text-gray-700">{totalProfiles}</span>
              <span className="text-gray-500">Profiles</span>
            </div>
          </div>

          {/* Page Size Selector */}
          <Select
            value={String(pageSize)}
            onValueChange={(value) => setPageSize(Number(value))}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Rows" />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size} rows
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Search */}
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search brands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9"
            />
          </div>



          {/* Create Button */}
          <div className="ml-auto">
            <BrandModal mode="create" onSuccess={handleRefresh}>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Create Brand
              </Button>
            </BrandModal>
          </div>
        </div>

        {/* Brands Table */}
        {filteredBrands.length > 0 ? (
          <CustomTable
            columns={createColumns(
              handleEditBrand,
              handleDeleteBrand,
              safeProfiles,
              deleteBrandMutation.isPending
            )}
            data={filteredBrands}
            pageSize={pageSize}
          />
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-6">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {searchTerm ? 'No brands found' : 'No brands yet'}
                </h3>
                <p className="text-muted-foreground mb-4 text-sm leading-relaxed max-w-sm mx-auto">
                  {searchTerm
                    ? 'Try adjusting your search terms'
                    : 'Create your first brand to get started'
                  }
                </p>
                {!searchTerm && (
                  <BrandModal mode="create" onSuccess={handleRefresh}>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Brand
                    </Button>
                  </BrandModal>
                )}
              </div>
            </CardContent>
          </Card>
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

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteBrandId} onOpenChange={() => setDeleteBrandId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Delete Brand?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to permanently delete this brand? This action cannot be undone and will also delete all associated products.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteBrand}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={deleteBrandMutation.isPending}
              >
                {deleteBrandMutation.isPending ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Brand
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


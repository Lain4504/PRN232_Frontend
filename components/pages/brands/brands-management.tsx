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
import { Brand, Profile } from "@/lib/types/aisam-types";
import { toast } from "sonner";
import { useUserProfile, useProfiles } from "@/hooks/use-profile";
import { useBrands, useDeleteBrand } from "@/hooks/use-brands";
import Link from "next/link";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { BrandModal } from "@/components/brands/brand-modal";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

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
          <div className="font-medium">{row.getValue("name")}</div>
          <div className="text-sm text-muted-foreground">ID: {row.original.id.slice(0, 8)}</div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="text-muted-foreground line-clamp-2 max-w-xs">
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
        <div className="text-sm">
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
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {new Date(row.getValue("created_at")).toLocaleDateString()}
      </div>
    ),
  },
  {
    id: "products",
    header: "Products",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Package className="h-4 w-4 text-muted-foreground" />
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground"
        >
          <Link href={`/dashboard/brands/${row.original.id}/products`}>
            View Products
          </Link>
        </Button>
      </div>
    ),
  },
  {
    id: "content",
    header: "Content",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground"
        >
          <Link href={`/dashboard/brands/${row.original.id}/contents`}>
            Manage Content
          </Link>
        </Button>
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Button
          asChild
          variant="outline"
          size="sm"
        >
          <Link href={`/dashboard/brands/${row.original.id}/products`}>
            <Package className="h-4 w-4" />
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          size="sm"
        >
          <Link href={`/dashboard/brands/${row.original.id}/contents`}>
            <FileText className="h-4 w-4" />
          </Link>
        </Button>
        <Button
          onClick={() => handleEditBrand(row.original)}
          variant="outline"
          size="sm"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => handleDeleteBrand(row.original.id)}
          variant="destructive"
          size="sm"
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
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

  const filteredBrands = safeBrands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brand.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );


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
        <div className="space-y-3 lg:space-y-6">
          <div>
            <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold tracking-tight text-foreground">
              Brands
            </h1>
            <p className="text-sm lg:text-base xl:text-lg text-muted-foreground mt-2 max-w-2xl">
              Manage your brands and their assets in one place.
            </p>
          </div>
          {/* Stats */}
          <div className="flex flex-wrap items-center gap-2 lg:gap-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border text-xs lg:text-sm">
              <Target className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground flex-shrink-0" />
              <span className="font-medium">{totalBrands}</span>
              <span className="text-muted-foreground">Brands</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border text-xs lg:text-sm">
              <span className="font-medium">{totalProfiles}</span>
              <span className="text-muted-foreground">Profiles</span>
            </div>
          </div>
        </div>

        {/* Actions and Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search brands..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary">
                  {filteredBrands.length} brand{filteredBrands.length !== 1 ? 's' : ''}
                </Badge>
                <BrandModal mode="create" onSuccess={handleRefresh}>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Brand
                  </Button>
                </BrandModal>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Brands Table */}
        {filteredBrands.length > 0 ? (
          <DataTable
            columns={createColumns(
              handleEditBrand,
              handleDeleteBrand,
              safeProfiles,
              deleteBrandMutation.isPending
            )}
            data={filteredBrands}
            pageSize={10}
            showSearch={false}
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


"use client";

import React, { useState, useEffect } from "react";
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
  AlertDialogTrigger,
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
import { User as UserType, Brand, Profile } from "@/lib/types/aisam-types";
import { toast } from "sonner";
import { useUserProfile, useProfiles } from "@/hooks/use-profile";
import { useBrands, useDeleteBrand } from "@/hooks/use-brands";
import Link from "next/link";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { BrandModal } from "@/components/brands/brand-modal";

export function BrandsManagement() {
  const [searchTerm, setSearchTerm] = useState("");

  // Hooks
  const { data: user } = useUserProfile();
  const { data: profiles = [] } = useProfiles();
  const { data: brands = [], isLoading: loading, refetch: refetchBrands } = useBrands();
  const deleteBrandMutation = useDeleteBrand();

  // Ensure brands is always an array
  const safeBrands = Array.isArray(brands) ? brands : [];

  const filteredBrands = safeBrands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brand.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Debug logs
  console.log('Raw brands data:', brands);
  console.log('Safe brands:', safeBrands);
  console.log('Search term:', searchTerm);
  console.log('Filtered brands:', filteredBrands);
  console.log('Loading state:', loading);

  const handleRefresh = () => {
    refetchBrands();
  };

  const handleDeleteBrand = async (brandId: string) => {
    const brandToDelete = safeBrands.find(b => b.id === brandId);
    const brandName = brandToDelete?.name || 'this brand';

    try {
      await deleteBrandMutation.mutateAsync(brandId);
      toast.success(`Brand "${brandName}" and all associated products have been deleted successfully`);
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
    <div className="w-full max-w-full overflow-x-hidden">
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

        {/* Create Brand Card */}
        <Card className="border border-primary/20">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Plus className="h-4 w-4 text-primary" />
              <h3 className="text-base font-semibold">Create New Brand</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Add a new brand to start managing its products and content.
            </p>
            <BrandModal mode="create" onSuccess={handleRefresh}>
              <Button size="sm" className="w-full sm:w-auto h-8 text-xs">
                <Plus className="mr-1 h-3 w-3" />
                Create Brand
              </Button>
            </BrandModal>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search brands..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Badge variant="secondary">
                {filteredBrands.length} brand{filteredBrands.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Brands List/Grid */}
        {filteredBrands.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredBrands.map((brand) => {
              const profile = brand.profile_id ? profiles.find(p => p.id === brand.profile_id) : null;
              return (
                <Card key={brand.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          {brand.logo_url ? (
                            <AvatarImage src={brand.logo_url} alt={brand.name} />
                          ) : (
                            <AvatarFallback>
                              <Target className="h-6 w-6" />
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{brand.name}</CardTitle>
                          <CardDescription>
                            {profile ? (profile.company_name || profile.profile_type) : 'No profile linked'}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <BrandModal mode="edit" brand={brand} onSuccess={handleRefresh}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </BrandModal>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive/80"
                              disabled={deleteBrandMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                                Delete Brand "{brand.name}"?
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-left space-y-3">
                                <p>
                                  Are you sure you want to permanently delete this brand? This action cannot be undone.
                                </p>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteBrand(brand.id)}
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
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {brand.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {brand.description}
                      </p>
                    )}
                    {brand.slogan && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium italic">&ldquo;{brand.slogan}&rdquo;</p>
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(brand.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild className="flex-1">
                        <Link href={`/dashboard/products?brand=${brand.id}`}>
                          <Package className="mr-2 h-4 w-4" />
                          Products
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild className="flex-1">
                        <Link href={`/dashboard/contents?brand=${brand.id}`}>
                          <FileText className="mr-2 h-4 w-4" />
                          Contents
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchTerm ? 'No brands found' : 'No brands yet'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm
                    ? 'Try adjusting your search terms'
                    : 'Create your first brand to get started with AISAM'
                  }
                </p>
                {!searchTerm && (
                  <BrandModal mode="create" onSuccess={handleRefresh}>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Brand
                    </Button>
                  </BrandModal>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card className="border border-blue-200 dark:border-blue-800">
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <Target className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 text-xs mb-1">
                  About Brand Management
                </h3>
                <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                  Managing your brands helps AISAM organize your products and content efficiently. You can add, edit, or remove brands at any time.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

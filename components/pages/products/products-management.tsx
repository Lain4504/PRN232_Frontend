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
  Package,
  Plus,
  Search,
  Pencil,
  Trash2,
  DollarSign,
  Image as ImageIcon,
  Target,
  AlertTriangle
} from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Product, Brand } from "@/lib/types/aisam-types";
import { toast } from "sonner";
import { useBrands } from "@/hooks/use-brands";
import { useProducts, useDeleteProduct } from "@/hooks/use-products";
import { useSearchParams } from "next/navigation";
import { ProductModal } from "@/components/products/product-modal";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

// Create columns function to access component state
const createColumns = (
  handleDeleteProduct: (productId: string, productName: string) => void,
  handleRefresh: () => void,
  brands: Brand[],
  isDeleting: boolean
): ColumnDef<Product>[] => [
    {
      accessorKey: "name",
      header: "Product Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={row.original.images?.[0] || "/placeholder.svg"} alt={row.getValue("name")} />
            <AvatarFallback>
              <Package className="h-4 w-4" />
            </AvatarFallback>
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
          {row.getValue("description")}
        </div>
      ),
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => {
        const price = row.getValue("price") as number;
        return (
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4 text-chart-2" />
            <span className="font-medium">{price.toFixed(2)}</span>
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
          <Badge variant="outline">
            <Target className="mr-1 h-3 w-3" />
            {brand?.name || 'Unknown Brand'}
          </Badge>
        );
      },
    },
    {
      accessorKey: "images",
      header: "Images",
      cell: ({ row }) => {
        const images = row.getValue("images") as string[] | null;
        return (
          <div className="flex items-center gap-1">
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {images?.length || 0} image{(images?.length || 0) !== 1 ? 's' : ''}
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <ProductModal mode="edit" product={row.original} onSuccess={handleRefresh}>
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4" />
            </Button>
          </ProductModal>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Delete Product &ldquo;{row.original.name}&rdquo;?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-left space-y-3">
                  <p>
                    Are you sure you want to permanently delete this product? This action cannot be undone.
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDeleteProduct(row.original.id, row.original.name)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Product
                    </>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ];

export function ProductsManagement() {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [brandFilter, setBrandFilter] = useState<string>("all");

  // Hooks
  const { data: brands = [] } = useBrands();
  const { data: products = [], isLoading: loading, refetch: refetchProducts } = useProducts();
  const deleteProductMutation = useDeleteProduct();

  // Ensure arrays are always arrays
  const safeBrands = Array.isArray(brands) ? brands : [];
  const safeProducts = Array.isArray(products) ? products : [];

  // Refresh data when window gains focus (useful when coming back from brand management)
  useEffect(() => {
    const handleFocus = () => {
      refetchProducts();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchProducts]);

  // Handle URL query parameters for brand filtering
  useEffect(() => {
    const brandFromUrl = searchParams.get('brand');
    if (brandFromUrl) {
      setBrandFilter(brandFromUrl);
    }
  }, [searchParams]);

  const filteredProducts = safeProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand = brandFilter === "all" || product.brandId === brandFilter;
    return matchesSearch && matchesBrand;
  });

  const handleRefresh = () => {
    refetchProducts();
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    try {
      await deleteProductMutation.mutateAsync(productId);
      toast.success(`Product "${productName}" deleted successfully`);
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast.error('Failed to delete product');
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
  const totalProducts = safeProducts.length;
  const totalBrands = safeBrands.length;
  const avgPrice = safeProducts.length > 0 ? (safeProducts.reduce((sum, p) => sum + (p.price || 0), 0) / safeProducts.length).toFixed(2) : '0.00';

  // Get current brand name for display
  const currentBrand = safeBrands.find(b => b.id === brandFilter);
  const isFilteredByBrand = brandFilter !== "all";

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
              <BreadcrumbLink href="/dashboard/brands">Brands</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Products</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="space-y-3 lg:space-y-6">
          <div>
            <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold tracking-tight text-foreground">
              Products
              {isFilteredByBrand && currentBrand && (
                <span className="text-lg font-normal text-muted-foreground ml-2">
                  - {currentBrand.name}
                </span>
              )}
            </h1>
            <p className="text-sm lg:text-base xl:text-lg text-muted-foreground mt-2 max-w-2xl">
              {isFilteredByBrand
                ? `Products for ${currentBrand?.name || 'selected brand'}`
                : 'Manage your product catalog and inventory.'
              }
            </p>
          </div>
          {/* Stats */}
          <div className="flex flex-wrap items-center gap-2 lg:gap-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border text-xs lg:text-sm">
              <Package className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground flex-shrink-0" />
              <span className="font-medium">{totalProducts}</span>
              <span className="text-muted-foreground">Products</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border text-xs lg:text-sm">
              <Target className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground flex-shrink-0" />
              <span className="font-medium">{totalBrands}</span>
              <span className="text-muted-foreground">Brands</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border text-xs lg:text-sm">
              <DollarSign className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground flex-shrink-0" />
              <span className="font-medium">${avgPrice}</span>
              <span className="text-muted-foreground">Avg Price</span>
            </div>
          </div>
        </div>

        {/* Brand Filter Info */}
        {isFilteredByBrand && (
          <Card className="border border-blue-200 dark:border-blue-800">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Showing products for: <strong>{currentBrand?.name}</strong>
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBrandFilter("all")}
                  className="text-xs"
                >
                  Show All Products
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add Product Card */}
        <Card className="border border-primary/20">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Plus className="h-4 w-4 text-primary" />
              <h3 className="text-base font-semibold">Add New Product</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Add a new product to your catalog to start creating content and campaigns.
            </p>
            <ProductModal
              mode="create"
              defaultBrandId={isFilteredByBrand ? brandFilter : undefined}
              onSuccess={handleRefresh}
            >
              <Button
                size="sm"
                className="w-full sm:w-auto h-8 text-xs"
              >
                <Plus className="mr-1 h-3 w-3" />
                Add Product
              </Button>
            </ProductModal>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Brands</option>
                {safeBrands.map(brand => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
              <Badge variant="secondary">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Products Table/List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Products</CardTitle>
            <CardDescription>A list of all your products in the catalog.</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredProducts.length > 0 ? (
              <DataTable columns={createColumns(handleDeleteProduct, handleRefresh, safeBrands, deleteProductMutation.isPending)} data={filteredProducts} filterColumn="name" />
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                  <Package className="h-10 w-10 text-muted-foreground" />
                </div>
                <h4 className="font-semibold text-lg mb-3">
                  {isFilteredByBrand ? 'No Products for This Brand' : 'No Products Yet'}
                </h4>
                <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                  {isFilteredByBrand
                    ? 'This brand doesn\'t have any products yet, or they may have been removed when the brand was deleted.'
                    : 'Start by adding your first product to create content and campaigns around it.'
                  }
                </p>
                <ProductModal
                  mode="create"
                  defaultBrandId={isFilteredByBrand ? brandFilter : undefined}
                  onSuccess={handleRefresh}
                >
                  <Button className="mt-6">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </Button>
                </ProductModal>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="border border-blue-200 dark:border-blue-800">
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <Package className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 text-xs mb-1">
                  About Product Management
                </h3>
                <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                  Managing your products helps AISAM organize your catalog and campaigns efficiently. You can add, edit, or remove products at any time.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

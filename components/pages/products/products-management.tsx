"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Package, 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  Filter,
  DollarSign,
  Tag,
  Image as ImageIcon,
  Target
} from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Product, Brand } from "@/lib/types/aisam-types";
import { productApi, brandApi } from "@/lib/mock-api";
import { toast } from "sonner";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

// Create columns function to access component state
const createColumns = (handleDeleteProduct: (productId: string, productName: string) => void): ColumnDef<Product>[] => [
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
    accessorKey: "brand_id",
    header: "Brand",
    cell: ({ row }) => {
      // This would be populated with actual brand data in a real app
      return (
        <Badge variant="outline">
          <Target className="mr-1 h-3 w-3" />
          Brand
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
        <Button variant="outline" size="sm" asChild>
          <Link href={`/dashboard/products/edit/${row.original.id}`}>
            <Pencil className="h-4 w-4" />
          </Link>
        </Button>
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={() => handleDeleteProduct(row.original.id, row.original.name)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];

export function ProductsManagement() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [brandFilter, setBrandFilter] = useState<string>("all");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Get products
        const productsResponse = await productApi.getProducts();
        if (productsResponse.success) {
          setProducts(productsResponse.data);
        } else {
          toast.error(productsResponse.message);
        }
        
        // Get brands for filter
        const brandsResponse = await brandApi.getBrands();
        if (brandsResponse.success) {
          setBrands(brandsResponse.data);
        }
      } catch (error) {
        console.error("Failed to load products:", error);
        toast.error("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Handle URL query parameters for brand filtering
  useEffect(() => {
    const brandFromUrl = searchParams.get('brand');
    if (brandFromUrl) {
      setBrandFilter(brandFromUrl);
    }
  }, [searchParams]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand = brandFilter === "all" || product.brand_id === brandFilter;
    return matchesSearch && matchesBrand;
  });

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await productApi.deleteProduct(productId);
      if (response.success) {
        setProducts(products.filter(p => p.id !== productId));
        toast.success('Product deleted successfully');
      } else {
        toast.error(response.message);
      }
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
  const totalProducts = products.length;
  const totalBrands = brands.length;
  const avgPrice = products.length > 0 ? (products.reduce((sum, p) => sum + (p.price || 0), 0) / products.length).toFixed(2) : '0.00';
  
  // Get current brand name for display
  const currentBrand = brands.find(b => b.id === brandFilter);
  const isFilteredByBrand = brandFilter !== "all";

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="space-y-6 lg:space-y-8 p-4 lg:p-6 xl:p-8 bg-background">
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
            <Button asChild size="sm" className="w-full sm:w-auto h-8 text-xs">
              <Link href={isFilteredByBrand ? `/dashboard/products/new?brand=${brandFilter}` : "/dashboard/products/new"}>
                <Plus className="mr-1 h-3 w-3" />
                Add Product
              </Link>
            </Button>
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
                {brands.map(brand => (
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
              <DataTable columns={createColumns(handleDeleteProduct)} data={filteredProducts} filterColumn="name" />
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                  <Package className="h-10 w-10 text-muted-foreground" />
                </div>
                <h4 className="font-semibold text-lg mb-3">No Products Yet</h4>
                <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                  Start by adding your first product to create content and campaigns around it.
                </p>
                <Button asChild className="mt-6">
                  <Link href={isFilteredByBrand ? `/dashboard/products/new?brand=${brandFilter}` : "/dashboard/products/new"}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </Link>
                </Button>
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

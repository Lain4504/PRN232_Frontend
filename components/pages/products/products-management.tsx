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

const columns: ColumnDef<Product>[] = [
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
          <DollarSign className="h-4 w-4 text-green-600" />
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
          onClick={() => toast.info(`Delete product: ${row.original.name}`)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];

export function ProductsManagement() {
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

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand = brandFilter === "all" || product.brand_id === brandFilter;
    return matchesSearch && matchesBrand;
  });

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-background">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog and inventory.</p>
        </div>
        <Button asChild size="sm">
          <Link href="/dashboard/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Add New Product
          </Link>
        </Button>
      </div>

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

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Products</CardTitle>
          <CardDescription>A list of all your products in the catalog.</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredProducts.length > 0 ? (
            <DataTable columns={columns} data={filteredProducts} filterColumn="name" />
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
                <Link href="/dashboard/products/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">
              {filteredProducts.length} shown
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${products.length > 0 ? (products.reduce((sum, p) => sum + p.price, 0) / products.length).toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all products
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Brands</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{brands.length}</div>
            <p className="text-xs text-muted-foreground">
              Active brands
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

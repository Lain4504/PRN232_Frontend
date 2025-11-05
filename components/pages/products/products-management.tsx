"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Package,
  Plus,
  Search,
  Image as ImageIcon,
  Target,
  Eye,
  Pencil,
} from "lucide-react";
import { ActionsDropdown, ActionItem } from "@/components/ui/actions-dropdown";
import { CustomTable } from "@/components/ui/custom-table";
import { ColumnDef } from "@tanstack/react-table";
import { Product, Brand } from "@/lib/types/aisam-types";
import { toast } from "sonner";
import { useBrands } from "@/hooks/use-brands";
import { useProducts, useDeleteProduct } from "@/hooks/use-products";
import { useTeamBrands } from "@/hooks/use-team-brands";
import { useTeamProducts } from "@/hooks/use-team-products";
import { useParams } from "next/navigation";
import { ProductModal } from "@/components/products/product-modal";
import Image from "next/image";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { FormField } from "@/components/ui/form-field"; // Removed unused import
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import Link from "next/link";

// Create columns function to access component state
const createColumns = (
  handleViewProduct: (product: Product) => void,
  handleEditProduct: (product: Product) => void,
  brands: Brand[],
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
        const formattedPrice = new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(price);
        return (
          <span className="font-medium">{formattedPrice}</span>
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
      cell: ({ row }) => {
        const actions: ActionItem[] = [
          {
            label: "View",
            icon: <Eye className="h-4 w-4" />,
            onClick: () => handleViewProduct(row.original),
          },
          {
            label: "Edit",
            icon: <Pencil className="h-4 w-4" />,
            onClick: () => handleEditProduct(row.original),
          },
        ];
        return <ActionsDropdown actions={actions} />;
      },
    },
  ];

interface ProductsManagementProps {
  initialBrandId?: string; // Allow passing brandId from parent component
  teamId?: string; // When provided, can show all team brands products
}

export function ProductsManagement({ initialBrandId, teamId }: ProductsManagementProps = {}) {
  const params = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [pageSize, setPageSize] = useState(10);

  // Get brand ID from route params (only if not in team mode)
  const routeBrandId = params.id as string | undefined;
  const brandId = teamId ? undefined : (routeBrandId || initialBrandId);

  // Get team brands if teamId is provided
  const { data: teamBrands = [] } = useTeamBrands(teamId || "");

  // Scope selection: when teamId provided, allow selecting All team brands or a specific brand
  // When not in team mode, use routeBrandId or initialBrandId
  const [scopeBrandId, setScopeBrandId] = useState<string | "team-all">(
    teamId ? "team-all" : (routeBrandId || initialBrandId || "")
  );

  // Update scopeBrandId when routeBrandId changes (non-team mode)
  useEffect(() => {
    if (!teamId && routeBrandId && routeBrandId !== scopeBrandId) {
      setScopeBrandId(routeBrandId);
    }
  }, [routeBrandId, teamId, scopeBrandId]);

  // Hooks - fetch brands unconditionally to avoid conditional hook calls
  const brandsQuery = useBrands();
  const brands = teamId ? teamBrands : (brandsQuery.data || []);
  
  // Get products based on mode
  // When not in team mode, use brandId (routeBrandId or initialBrandId)
  // When in team mode, use scopeBrandId
  const effectiveBrandId = teamId 
    ? (scopeBrandId !== "team-all" ? scopeBrandId : undefined)
    : (brandId || scopeBrandId || undefined);
    
  const regularProducts = useProducts(effectiveBrandId);
  const teamProducts = useTeamProducts(
    teamId && scopeBrandId === "team-all" ? teamId : undefined,
    teamId && scopeBrandId !== "team-all" ? scopeBrandId : undefined
  );

  const isLoading = teamId && scopeBrandId === "team-all" ? (teamProducts.isLoading) : (regularProducts.isLoading);
  const productsData = teamId && scopeBrandId === "team-all" ? (teamProducts.data || []) : (regularProducts.data || []);
  const refetchProducts = teamId && scopeBrandId === "team-all" ? teamProducts.refetch : regularProducts.refetch;

  const deleteProductMutation = useDeleteProduct();

  // Ensure arrays are always arrays
  const safeBrands = Array.isArray(brands) ? brands : [];
  const safeProducts = Array.isArray(productsData) ? productsData : [];

  // Get current brand info
  // When in team mode, use scopeBrandId; otherwise use brandId
  const currentBrandId = teamId 
    ? (scopeBrandId !== "team-all" ? scopeBrandId : undefined)
    : brandId;
  const currentBrand = safeBrands.find(b => b.id === currentBrandId);

  // Filter products by search term and brand
  const filteredProducts = safeProducts.filter(product => {
    // Filter by brand when brandId is specified (not in team-all mode or when specific brand is selected)
    const matchesBrand = !effectiveBrandId || product.brandId === effectiveBrandId;
    
    // Filter by search term
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesBrand && matchesSearch;
  });

  const handleRefresh = () => {
    refetchProducts();
  };

  const handleViewProduct = (product: Product) => {
    setViewingProduct(product);
    setIsViewOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsEditOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-background">
        <LoadingSkeleton className="h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-2">
          <LoadingSkeleton className="h-10 w-full" />
          <LoadingSkeleton className="h-10 w-full" />
        </div>
        <LoadingSkeleton className="h-64 w-full" />
      </div>
    );
  }

  // Main UI
  const totalProducts = filteredProducts.length;

  // Redirect to brands if no brand ID provided and not in team mode
  if (!teamId && !brandId && !initialBrandId) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-background">
        <div className="text-center py-16">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Brand Selected</h2>
          <p className="text-muted-foreground mb-6">Please select a brand to view its products.</p>
          <Button asChild>
            <Link href="/dashboard/brands">
              <Target className="mr-2 h-4 w-4" />
              Go to Brands
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="space-y-6 lg:space-y-8 p-4 lg:p-6 xl:p-8 bg-background">
        {/* Breadcrumb */}
        {!teamId && (
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
                <BreadcrumbPage>{currentBrand?.name || 'Brand'} - Products</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        )}

        {/* Header */}
        <div>
          <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold tracking-tight text-foreground">
            {teamId ? 'Team Products' : `Products - ${currentBrand?.name || 'Unknown Brand'}`}
          </h1>
          <p className="text-sm lg:text-base xl:text-lg text-muted-foreground mt-2 max-w-2xl">
            {teamId 
              ? 'Manage products for your team brands'
              : `Manage products for ${currentBrand?.name || 'this brand'}`
            }
          </p>
        </div>

        {/* Single Row Layout - Stats, Page Size, Search, Products, Create Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 flex-wrap">
          {/* Stats */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border text-xs lg:text-sm">
              <Package className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground flex-shrink-0" />
              <span className="font-medium">{totalProducts}</span>
              <span className="text-muted-foreground">Products</span>
            </div>

          </div>

          {/* Brand Selector (Team Mode) */}
          {teamId && (
            <Select
              value={scopeBrandId}
              onValueChange={(value) => setScopeBrandId(value as string | "team-all")}
            >
              <SelectTrigger className="w-full sm:w-[160px] md:w-56">
                <SelectValue placeholder="Scope" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="team-all">All team brands</SelectItem>
                {teamBrands.map((b: Brand) => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Page Size Selector */}
          <Select
            value={String(pageSize)}
            onValueChange={(value) => setPageSize(Number(value))}
          >
            <SelectTrigger className="w-full sm:w-[120px] md:w-32">
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
          <div className="relative w-full sm:w-64 md:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10 h-9"
            />
          </div>



          {/* Create Button */}
          <div className="w-full sm:w-auto sm:ml-auto flex items-center gap-2">
            <ProductModal
              mode="create"
              defaultBrandId={scopeBrandId !== "team-all" ? scopeBrandId : (brandId || initialBrandId)}
              brands={
                teamId 
                  ? teamBrands 
                  : (brandId && !initialBrandId ? safeBrands.filter(b => b.id === brandId) : safeBrands)
              }
              teamId={teamId}
              onSuccess={handleRefresh}
            >
              <Button size="sm" className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </ProductModal>
          </div>
        </div>

        {/* Products Table */}
        {filteredProducts.length > 0 ? (
          <CustomTable
            columns={createColumns(handleViewProduct, handleEditProduct, safeBrands)}
            data={filteredProducts}
            pageSize={pageSize}
          />
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-6">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  No Products for {currentBrand?.name || 'This Brand'}
                </h3>
                <p className="text-muted-foreground mb-4 text-sm leading-relaxed max-w-sm mx-auto">
                  This brand doesn&apos;t have any products yet. Start by adding your first product to create content and campaigns around it.
                </p>
                <ProductModal
                  mode="create"
                  defaultBrandId={scopeBrandId !== "team-all" ? scopeBrandId : (brandId || initialBrandId)}
                  brands={
                    teamId 
                      ? teamBrands 
                      : (brandId && !initialBrandId ? safeBrands.filter(b => b.id === brandId) : safeBrands)
                  }
                  teamId={teamId}
                  onSuccess={handleRefresh}
                >
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </Button>
                </ProductModal>
              </div>
            </CardContent>
          </Card>
        )}

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
                  Managing products for {currentBrand?.name || 'this brand'} helps AISAM organize your catalog and campaigns efficiently. You can add, edit, or remove products at any time.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* View Product Modal */}
        {viewingProduct && (
          <AlertDialog open={isViewOpen} onOpenChange={setIsViewOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  {viewingProduct.name}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Product details
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={viewingProduct.images?.[0] || ''} />
                    <AvatarFallback>
                      <ImageIcon className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm text-muted-foreground">Brand</div>
                    <div className="text-sm font-medium">{safeBrands.find(b => b.id === viewingProduct.brandId)?.name || 'Unknown'}</div>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Description</div>
                  <div className="text-sm">{viewingProduct.description || '-'}</div>
                </div>
                <div className="text-sm font-medium">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(Number(viewingProduct.price || 0))}
                </div>
                {Array.isArray(viewingProduct.images) && viewingProduct.images.length > 1 && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Images</div>
                    <div className="flex gap-2 flex-wrap">
                      {viewingProduct.images.map((img, idx) => (
                        <Image key={idx} src={img} alt="" width={48} height={48} className="h-12 w-12 rounded object-cover border" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <AlertDialogFooter>
                <AlertDialogAction onClick={() => setIsViewOpen(false)}>Close</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

         {/* Edit Product Modal */}
         {editingProduct && (
           <ProductModal
             mode="edit"
             product={editingProduct}
             defaultBrandId={brandId}
             brands={
               teamId 
                 ? teamBrands 
                 : (brandId && !initialBrandId ? safeBrands.filter(b => b.id === brandId) : safeBrands)
             }
             teamId={teamId}
             open={isEditOpen}
             onOpenChange={setIsEditOpen}
             onSuccess={() => {
               setIsEditOpen(false);
               setEditingProduct(null);
               handleRefresh();
             }}
           />
         )}
      </div>
    </div>
  );
}

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
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

// Create columns function to access component state
const createColumns = (
  handleViewProduct: (product: Product) => void,
  handleEditProduct: (product: Product) => void,
  brands: Brand[],
): ColumnDef<Product>[] => [
    {
      accessorKey: "name",
      header: "Product",
      cell: ({ row }) => (
        <div className="flex items-center gap-3 py-1">
          <Avatar className="h-10 w-10 rounded-lg border bg-muted">
            <AvatarImage src={row.original.images?.[0] || "/placeholder.svg"} className="object-cover" />
            <AvatarFallback>
              <Package className="h-5 w-5 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold text-foreground text-sm">{row.getValue("name")}</div>
            <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">#{row.original.id.slice(0, 8)}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div className="text-muted-foreground text-xs line-clamp-1 max-w-[200px]">
          {row.getValue("description") || "No description."}
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
        }).format(price);
        return (
          <span className="font-semibold text-primary text-sm">{formattedPrice}</span>
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
          <Badge variant="outline" className="h-6 border-border/60 bg-muted/30 font-semibold text-[10px] uppercase tracking-wider text-muted-foreground px-2 rounded-md">
            {brand?.name || 'Unknown'}
          </Badge>
        );
      },
    },
    {
      accessorKey: "images",
      header: "Images",
      cell: ({ row }) => {
        const images = row.getValue("images") as string[] | null;
        const count = images?.length || 0;
        return (
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2 overflow-hidden">
              {images?.slice(0, 3).map((img, i) => (
                <div key={i} className="inline-block h-6 w-6 rounded-full border border-background bg-muted">
                  <Image src={img} alt="" width={24} height={24} className="object-cover h-full w-full rounded-full" />
                </div>
              ))}
            </div>
            {count > 3 && <span className="text-[10px] font-medium text-muted-foreground">+{count - 3}</span>}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const actions: ActionItem[] = [
          {
            label: "View Details",
            icon: <Eye className="h-4 w-4" />,
            onClick: () => handleViewProduct(row.original),
          },
          {
            label: "Edit Product",
            icon: <Pencil className="h-4 w-4" />,
            onClick: () => handleEditProduct(row.original),
          },
        ];
        return <ActionsDropdown actions={actions} />;
      },
    },
  ];

interface ProductsManagementProps {
  initialBrandId?: string;
  teamId?: string;
}

export function ProductsManagement({ initialBrandId, teamId }: ProductsManagementProps = {}) {
  const params = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [pageSize, setPageSize] = useState(10);

  const routeBrandId = params.id as string | undefined;
  const brandId = teamId ? undefined : (routeBrandId || initialBrandId);
  const { data: teamBrands = [] } = useTeamBrands(teamId || "");

  const [scopeBrandId, setScopeBrandId] = useState<string | "team-all">(
    teamId ? "team-all" : (routeBrandId || initialBrandId || "")
  );

  useEffect(() => {
    if (!teamId && routeBrandId && routeBrandId !== scopeBrandId) {
      setScopeBrandId(routeBrandId);
    }
  }, [routeBrandId, teamId, scopeBrandId]);

  const brandsQuery = useBrands();
  const brands = teamId ? teamBrands : (brandsQuery.data || []);

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

  const safeBrands = Array.isArray(brands) ? brands : [];
  const safeProducts = Array.isArray(productsData) ? productsData : [];

  const currentBrandId = teamId
    ? (scopeBrandId !== "team-all" ? scopeBrandId : undefined)
    : brandId;
  const currentBrand = safeBrands.find(b => b.id === currentBrandId);

  const filteredProducts = safeProducts.filter(product => {
    const matchesBrand = !effectiveBrandId || product.brandId === effectiveBrandId;
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

  if (isLoading) {
    return (
      <div className="w-full max-w-full overflow-x-hidden font-fira-sans">
        <div className="space-y-10 p-6 lg:p-10 bg-background">
          <Skeleton className="h-4 w-48 mb-6" />
          <div className="space-y-6">
            <Skeleton className="h-12 w-64 mb-3" />
            <Skeleton className="h-6 w-96 mb-10" />
            <Skeleton className="h-14 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!teamId && !brandId && !initialBrandId) {
    return (
      <div className="flex-1 min-h-[60vh] flex flex-col items-center justify-center p-10 font-fira-sans">
        <div className="h-24 w-24 rounded-3xl bg-muted/20 flex items-center justify-center mb-8">
          <Package className="h-12 w-12 text-muted-foreground stroke-[1.5]" />
        </div>
        <h2 className="text-3xl font-black uppercase tracking-tight mb-3">No Brand Selected</h2>
        <p className="text-muted-foreground font-medium mb-10 text-center max-w-sm">
          Please select an active brand node to view its products.
        </p>
        <Button asChild className="h-12 px-8 rounded-xl font-bold uppercase tracking-widest text-[11px] bg-primary shadow-2xl shadow-primary/20 hover:scale-105 transition-all">
          <Link href="/dashboard/brands">
            Go to Brands
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto font-fira-sans">
      <div className="space-y-8 p-6 lg:p-10 bg-background">
        {/* Breadcrumb */}
        {!teamId && (
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard" className="text-sm font-medium">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard/brands" className="text-sm font-medium">Brands</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-sm font-medium text-primary">{currentBrand?.name || 'Inventory'}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {teamId ? 'Team' : (currentBrand?.name || 'Brand')} Products
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Manage product catalog for {currentBrand?.name || 'this brand'}.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm font-medium text-muted-foreground">Total Products</p>
              <p className="text-2xl font-bold">{filteredProducts.length}</p>
            </div>
            <ProductModal
              mode="create"
              defaultBrandId={scopeBrandId !== "team-all" ? scopeBrandId : (brandId || initialBrandId)}
              brands={teamId ? teamBrands : (brandId && !initialBrandId ? safeBrands.filter(b => b.id === brandId) : safeBrands)}
              teamId={teamId}
              onSuccess={handleRefresh}
            >
              <Button className="rounded-lg h-10 px-6 font-semibold">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </ProductModal>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border bg-card shadow-sm">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 bg-background rounded-lg border-border/60"
            />
          </div>

          <div className="flex items-center gap-3">
            {teamId && (
              <Select value={scopeBrandId} onValueChange={(value) => setScopeBrandId(value as string | "team-all")}>
                <SelectTrigger className="h-10 w-[180px] rounded-lg">
                  <SelectValue placeholder="Brand" />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  <SelectItem value="team-all">All Brands</SelectItem>
                  {teamBrands.map((b: Brand) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
              <SelectTrigger className="h-10 w-[140px] rounded-lg">
                <SelectValue placeholder="Per page" />
              </SelectTrigger>
              <SelectContent className="rounded-lg">
                {[5, 10, 20, 50].map((size) => (
                  <SelectItem key={size} value={String(size)}>{size} per page</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Product List */}
        {filteredProducts.length > 0 ? (
          <Card className="rounded-xl border shadow-sm overflow-hidden">
            <CustomTable
              columns={createColumns(handleViewProduct, handleEditProduct, safeBrands)}
              data={filteredProducts}
              pageSize={pageSize}
              className="border-0 shadow-none bg-transparent"
              headerClassName="bg-muted/30 border-b py-3"
            />
          </Card>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center border border-dashed rounded-xl bg-muted/5">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-6 text-muted-foreground">
              <Package className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">{searchTerm ? 'No matches found' : 'No products yet'}</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                {searchTerm ? 'Try searching for something else.' : 'Start by adding your first product to this brand catalog.'}
              </p>
            </div>
            {!searchTerm && (
              <div className="mt-8">
                <ProductModal
                  mode="create"
                  defaultBrandId={scopeBrandId !== "team-all" ? scopeBrandId : (brandId || initialBrandId)}
                  brands={teamId ? teamBrands : (brandId && !initialBrandId ? safeBrands.filter(b => b.id === brandId) : safeBrands)}
                  teamId={teamId}
                  onSuccess={handleRefresh}
                >
                  <Button className="rounded-lg h-10 px-6">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </Button>
                </ProductModal>
              </div>
            )}
          </div>
        )}

        {/* Insights */}
        <Card className="border p-6 rounded-xl shadow-sm bg-primary/5">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Package className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">Inventory Tip</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Keeping your product catalog up to date helps AI generate more accurate content for your campaigns.
              </p>
            </div>
          </div>
        </Card>

        {/* Product Details Modal */}
        {viewingProduct && (
          <AlertDialog open={isViewOpen} onOpenChange={setIsViewOpen}>
            <AlertDialogContent className="rounded-xl max-w-lg p-6">
              <AlertDialogHeader>
                <div className="flex items-center justify-between mb-4">
                  <AlertDialogTitle className="text-xl font-bold flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Product Details
                  </AlertDialogTitle>
                  <Badge variant="secondary" className="rounded-md">Active</Badge>
                </div>
              </AlertDialogHeader>

              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="relative h-40 w-40 rounded-lg overflow-hidden border bg-muted shrink-0">
                    <Image src={viewingProduct.images?.[0] || '/placeholder.svg'} alt="" fill className="object-cover" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h4 className="text-lg font-bold">{viewingProduct.name}</h4>
                      <p className="text-sm text-muted-foreground font-medium">#{viewingProduct.id.slice(0, 8)}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase">Brand</p>
                        <p className="text-sm font-medium">{safeBrands.find(b => b.id === viewingProduct.brandId)?.name || 'Unknown'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase">Price</p>
                        <p className="text-sm font-bold text-primary">
                          {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", minimumFractionDigits: 0 }).format(Number(viewingProduct.price || 0))}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Description</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{viewingProduct.description || 'No description available.'}</p>
                </div>

                {Array.isArray(viewingProduct.images) && viewingProduct.images.length > 1 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">More Images</p>
                    <div className="flex gap-2 flex-wrap">
                      {viewingProduct.images.slice(1).map((img, idx) => (
                        <div key={idx} className="relative h-14 w-14 rounded-md overflow-hidden border">
                          <Image src={img} alt="" fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <AlertDialogFooter className="mt-8">
                <AlertDialogAction className="rounded-lg h-10 px-6 w-full sm:w-auto" onClick={() => setIsViewOpen(false)}>
                  Close
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {editingProduct && (
          <ProductModal
            mode="edit"
            product={editingProduct}
            defaultBrandId={brandId}
            brands={teamId ? teamBrands : (brandId && !initialBrandId ? safeBrands.filter(b => b.id === brandId) : safeBrands)}
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

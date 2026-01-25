"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Package,
  Plus,
  Search,
  Eye,
  Pencil,
  Box,
  Layers,
  ShoppingBag,
  Sparkles,
  Zap,
  Target,
} from "lucide-react";
import { ActionsDropdown, ActionItem } from "@/components/ui/actions-dropdown";
import { CustomTable } from "@/components/ui/custom-table";
import { ColumnDef } from "@tanstack/react-table";
import { Product, Brand } from "@/lib/types/aisam-types";
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
import { cn } from "@/lib/utils";

const createColumns = (
  handleViewProduct: (product: Product) => void,
  handleEditProduct: (product: Product) => void,
  brands: Brand[],
): ColumnDef<Product>[] => [
    {
      accessorKey: "name",
      header: "Product",
      cell: ({ row }) => (
        <div className="flex items-center gap-4 py-2">
          <div className="size-10 rounded-xl bg-muted/30 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-sm transition-transform hover:scale-110">
            {row.original.images?.[0] ? (
              <Image src={row.original.images[0]} alt="" width={40} height={40} className="object-cover h-full w-full" />
            ) : (
              <Package className="h-5 w-5 text-muted-foreground/50" />
            )}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-foreground text-sm line-clamp-1">{row.getValue("name")}</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">ID: {row.original.id.slice(0, 6)}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div className="text-muted-foreground text-xs line-clamp-1 max-w-[180px] font-medium">
          {row.getValue("description") || "No description available"}
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
          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-bold font-mono">
            {formattedPrice}
          </Badge>
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
          <div className="flex items-center gap-2">
            <div className={`size-2 rounded-full ${brand ? 'bg-primary shadow-[0_0_8px_1px_rgba(var(--primary),0.5)]' : 'bg-muted'}`} />
            <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              {brand?.name || 'Unassigned'}
            </span>
          </div>
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
          <div className="flex items-center gap-1">
            <div className="flex -space-x-3 hover:space-x-1 transition-all">
              {images?.slice(0, 3).map((img, i) => (
                <div key={i} className="relative h-7 w-7 rounded-lg border-2 border-background ring-1 ring-white/10 overflow-hidden shadow-md">
                  <Image src={img} alt="" width={28} height={28} className="object-cover h-full w-full" />
                </div>
              ))}
            </div>
            {count > 3 && (
              <div className="h-7 min-w-7 rounded-lg bg-muted/50 border border-white/10 flex items-center justify-center text-[9px] font-bold ml-1">
                +{count - 3}
              </div>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Action",
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
      <div className="w-full max-w-full overflow-x-hidden font-fira-sans space-y-8 p-6 lg:p-10">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-2xl" />
      </div>
    );
  }

  if (!teamId && !brandId && !initialBrandId) {
    return (
      <div className="flex-1 min-h-[70vh] flex flex-col items-center justify-center p-10 font-fira-sans relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-lg mx-auto">
          <div className="size-24 rounded-3xl bg-background/50 backdrop-blur-xl border border-white/10 shadow-2xl flex items-center justify-center mb-8 rotate-3 transform transition-transform hover:rotate-6">
            <Box className="size-10 text-primary animate-pulse" />
          </div>

          <h2 className="text-4xl font-black uppercase tracking-tighter mb-4 bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
            Brand Selection
          </h2>

          <p className="text-lg text-muted-foreground font-medium mb-10 leading-relaxed">
            Please select a brand to view and manage its products.
          </p>

          <div className="flex gap-4">
            <Button asChild size="lg" className="h-12 px-8 rounded-xl font-bold uppercase tracking-widest text-xs bg-primary shadow-[0_0_20px_5px_rgba(var(--primary),0.3)] hover:scale-105 transition-all">
              <Link href="/dashboard/brands">
                Select Brand
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto font-fira-sans">
      <div className="space-y-8 p-6 lg:p-10 min-h-screen">
        {/* Breadcrumb */}
        {!teamId && (
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard" className="text-[10px] uppercase font-bold tracking-widest opacity-60 hover:opacity-100 transition-opacity">Command</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="opacity-40" />
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard/brands" className="text-[10px] uppercase font-bold tracking-widest opacity-60 hover:opacity-100 transition-opacity">Identity Matrix</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="opacity-40" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-[10px] uppercase font-bold tracking-widest text-primary">{currentBrand?.name || 'Registry'}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tighter text-foreground italic uppercase">
              {teamId ? 'Team' : (currentBrand?.name || 'Brand')} <span className="text-muted-foreground/30">Registry</span>
            </h1>
            <p className="text-muted-foreground font-medium text-lg max-w-2xl">
              Systematize and manage product assets for AI generation.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <ProductModal
              mode="create"
              defaultBrandId={scopeBrandId !== "team-all" ? scopeBrandId : (brandId || initialBrandId)}
              brands={teamId ? teamBrands : (brandId && !initialBrandId ? safeBrands.filter(b => b.id === brandId) : safeBrands)}
              teamId={teamId}
              onSuccess={handleRefresh}
            >
              <Button className="rounded-xl h-11 px-6 font-black uppercase tracking-widest text-[10px] bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                <Plus className="mr-2 h-4 w-4" />
                Initialize Asset
              </Button>
            </ProductModal>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="rounded-2xl border border-white/5 bg-background/40 backdrop-blur-xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <ShoppingBag className="size-24 -rotate-12" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Total Assets</span>
              <span className="text-4xl font-black tracking-tight text-foreground">{filteredProducts.length}</span>
            </div>
          </Card>

          <Card className="rounded-2xl border border-white/5 bg-gradient-to-br from-primary/10 to-transparent backdrop-blur-xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity text-primary">
              <Zap className="size-24 -rotate-12" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">System Status</span>
              <span className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                Online <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>
              </span>
              <span className="text-xs text-muted-foreground mt-1">AI Injection Ready</span>
            </div>
          </Card>
        </div>


        {/* Action Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
            <Input
              placeholder="Scan registry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 bg-background font-medium"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {teamId && (
              <Select value={scopeBrandId} onValueChange={(value) => setScopeBrandId(value as string | "team-all")}>
                <SelectTrigger className="h-10 w-full sm:w-[180px] bg-background font-bold text-xs uppercase tracking-wide">
                  <SelectValue placeholder="Brand" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-white/10 bg-background/95 backdrop-blur-xl">
                  <SelectItem value="team-all" className="font-bold text-xs uppercase">All Brands</SelectItem>
                  {teamBrands.map((b: Brand) => (
                    <SelectItem key={b.id} value={b.id} className="text-xs font-medium">{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
              <SelectTrigger className="h-10 w-[120px] bg-background font-bold text-xs uppercase tracking-wide">
                <SelectValue placeholder="Pages" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-white/10 bg-background/95 backdrop-blur-xl">
                {[5, 10, 20, 50].map((size) => (
                  <SelectItem key={size} value={String(size)} className="text-xs font-medium">Rows: {size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Product List */}
        {filteredProducts.length > 0 ? (
          <div className="rounded-2xl border border-white/5 shadow-2xl bg-background/40 backdrop-blur-sm overflow-hidden ring-1 ring-white/5">
            <CustomTable
              columns={createColumns(handleViewProduct, handleEditProduct, safeBrands)}
              data={filteredProducts}
              pageSize={pageSize}
              className="border-0"
              headerClassName="bg-white/5 border-b border-white/5 py-4"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 px-6 text-center border border-dashed border-white/10 rounded-3xl bg-white/5">
            <div className="size-20 rounded-full bg-muted/20 flex items-center justify-center mb-6 text-muted-foreground/40 backdrop-blur-sm shadow-inner">
              <Layers className="size-10" />
            </div>
            <div className="space-y-2 mb-8">
              <h3 className="text-xl font-bold">{searchTerm ? 'No assets detected' : 'Registry Empty'}</h3>
              <p className="text-muted-foreground font-medium max-w-sm mx-auto">
                {searchTerm ? 'Modify search parameters.' : 'Initialize your first product asset to populate the matrix.'}
              </p>
            </div>
            {!searchTerm && (
              <ProductModal
                mode="create"
                defaultBrandId={scopeBrandId !== "team-all" ? scopeBrandId : (brandId || initialBrandId)}
                brands={teamId ? teamBrands : (brandId && !initialBrandId ? safeBrands.filter(b => b.id === brandId) : safeBrands)}
                teamId={teamId}
                onSuccess={handleRefresh}
              >
                <Button className="rounded-xl h-11 px-8 font-black uppercase tracking-widest text-[10px] bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20">
                  <Plus className="mr-2 h-4 w-4" />
                  Initialize Asset
                </Button>
              </ProductModal>
            )}
          </div>
        )}


        {/* Product Details Modal - Redesigned as a Premium Dossier */}
        {viewingProduct && (
          <AlertDialog open={isViewOpen} onOpenChange={setIsViewOpen}>
            <AlertDialogContent className="rounded-[32px] max-w-2xl p-0 overflow-hidden bg-background/95 backdrop-blur-2xl border border-white/10 font-fira-sans shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]">

              {/* Header Image Area */}
              <div className="relative h-64 w-full bg-muted/30">
                {viewingProduct.images?.[0] ? (
                  <Image src={viewingProduct.images[0]} alt="" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                    <ShoppingBag className="size-20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

                <div className="absolute bottom-6 left-8 right-8 flex items-end justify-between">
                  <div>
                    <Badge variant="outline" className="bg-primary/20 text-primary border-primary/20 mb-2 font-bold backdrop-blur-sm">
                      ACTIVE ASSET
                    </Badge>
                    <h4 className="text-3xl font-black uppercase tracking-tight text-white shadow-sm leading-none">
                      {viewingProduct.name}
                    </h4>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">Valuation</div>
                    <div className="text-2xl font-black text-white font-mono tracking-tight">
                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", minimumFractionDigits: 0 }).format(Number(viewingProduct.price || 0))}
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => setIsViewOpen(false)}
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-md"
                >
                  <span className="sr-only">Close</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                </Button>
              </div>

              <div className="p-8 pt-2 space-y-8">

                {/* Meta Grid */}
                <div className="grid grid-cols-2 gap-4 -mt-6 relative z-10">
                  <div className="bg-card/50 backdrop-blur-xl border border-white/5 p-4 rounded-2xl shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
                        <Target className="size-4" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Identity</p>
                        <p className="font-bold text-sm truncate">{safeBrands.find(b => b.id === viewingProduct.brandId)?.name || 'Unknown'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-card/50 backdrop-blur-xl border border-white/5 p-4 rounded-2xl shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-500">
                        <Zap className="size-4" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Status</p>
                        <p className="font-bold text-sm text-emerald-500">Online</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-primary" />
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Schematic Data</span>
                  </div>
                  <p className="text-base text-muted-foreground leading-relaxed font-medium">
                    {viewingProduct.description || 'No detailed specifications available for this asset.'}
                  </p>
                </div>

                {Array.isArray(viewingProduct.images) && viewingProduct.images.length > 1 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Layers className="size-4 text-primary" />
                      <span className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Visual Database</span>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                      {viewingProduct.images.slice(1).map((img, idx) => (
                        <div key={idx} className="relative h-20 w-20 rounded-xl overflow-hidden border border-white/10 shrink-0 hover:scale-105 transition-transform cursor-pointer">
                          <Image src={img} alt="" fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 flex justify-end">
                  <Button variant="outline" className="rounded-xl font-bold uppercase tracking-wider" onClick={() => setIsViewOpen(false)}>
                    Close Dossier
                  </Button>
                </div>
              </div>
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

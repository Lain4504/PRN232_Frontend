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
      header: "Product Unit",
      cell: ({ row }) => (
        <div className="flex items-center gap-4">
          <div className="relative h-12 w-12 rounded-2xl overflow-hidden border border-border/40 shadow-inner group">
            <Avatar className="h-full w-full rounded-none">
              <AvatarImage src={row.original.images?.[0] || "/placeholder.svg"} className="object-cover group-hover:scale-110 transition-transform duration-500" />
              <AvatarFallback className="bg-muted">
                <Package className="h-5 w-5 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
          </div>
          <div>
            <div className="font-black text-foreground tracking-tight uppercase text-xs">{row.getValue("name")}</div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mt-1">ID: {row.original.id.slice(0, 8)}...</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "Metrics / Descriptor",
      cell: ({ row }) => (
        <div className="text-muted-foreground font-medium text-xs line-clamp-1 max-w-[200px] tracking-tight">
          {row.getValue("description") || "No descriptors initialized."}
        </div>
      ),
    },
    {
      accessorKey: "price",
      header: "Valuation",
      cell: ({ row }) => {
        const price = row.getValue("price") as number;
        const formattedPrice = new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
          minimumFractionDigits: 0,
        }).format(price);
        return (
          <span className="font-fira-mono font-black text-primary text-sm tracking-tighter tabular-nums">{formattedPrice}</span>
        );
      },
    },
    {
      accessorKey: "brandId",
      header: "Domain Parent",
      cell: ({ row }) => {
        const brandId = row.getValue("brandId") as string;
        const brand = brands.find(b => b.id === brandId);
        return (
          <Badge variant="outline" className="h-7 border-border/40 bg-muted/20 font-black text-[10px] uppercase tracking-widest text-muted-foreground px-3 rounded-lg overflow-hidden max-w-[120px] justify-start gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
            <span className="truncate">{brand?.name || 'UNKNOWN'}</span>
          </Badge>
        );
      },
    },
    {
      accessorKey: "images",
      header: "Assets",
      cell: ({ row }) => {
        const images = row.getValue("images") as string[] | null;
        const count = images?.length || 0;
        return (
          <div className="flex items-center gap-2">
            <div className="flex -space-x-3 overflow-hidden">
              {images?.slice(0, 3).map((img, i) => (
                <div key={i} className="inline-block h-6 w-6 rounded-full ring-2 ring-background overflow-hidden bg-muted">
                  <Image src={img} alt="" width={24} height={24} className="object-cover h-full w-full" />
                </div>
              ))}
            </div>
            {count > 3 && <span className="text-[10px] font-black text-muted-foreground">+{count - 3}</span>}
            {count === 0 && <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">NONE</span>}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Matrix",
      cell: ({ row }) => {
        const actions: ActionItem[] = [
          {
            label: "Run Diagnostics",
            icon: <Eye className="h-4 w-4 stroke-[2.5]" />,
            onClick: () => handleViewProduct(row.original),
          },
          {
            label: "Modify Structure",
            icon: <Pencil className="h-4 w-4 stroke-[2.5]" />,
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
        <h2 className="text-3xl font-black uppercase tracking-tight mb-3">Domain Missing</h2>
        <p className="text-muted-foreground font-medium mb-10 text-center max-w-sm">
          Please select an active brand node to initialize the product repository view.
        </p>
        <Button asChild className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[11px] bg-primary shadow-2xl shadow-primary/20 hover:scale-105 transition-all">
          <Link href="/dashboard/brands">
            Initialize Brands Matrix
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto font-fira-sans">
      <div className="space-y-10 p-6 lg:p-10 bg-background">
        {/* Breadcrumb - High Finesse */}
        {!teamId && (
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard" className="text-[10px] font-black uppercase tracking-[0.2em]">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard/brands" className="text-[10px] font-black uppercase tracking-[0.2em]">Brands</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{currentBrand?.name || 'Inventory'}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        )}

        {/* Tactical Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-2 w-8 bg-primary rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">Inventory Node</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-foreground uppercase leading-none">
              {teamId ? 'Team' : (currentBrand?.name || 'Local')} <span className="text-primary italic">Products</span>
            </h1>
            <p className="text-lg text-muted-foreground font-medium max-w-2xl tracking-tight leading-relaxed">
              Managing the asset matrix for {currentBrand?.name || 'this partition'}. Synchronize products for campaign deployment.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-6 py-4 bg-card/40 backdrop-blur-xl rounded-2xl border border-border/40 shadow-xl flex items-center gap-6">
              <div className="space-y-1 border-r border-border/20 pr-6">
                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Asset Units</div>
                <div className="text-2xl font-black font-fira-mono tracking-tighter tabular-nums text-foreground">{filteredProducts.length}</div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">Status</div>
                <div className="text-2xl font-black font-fira-mono tracking-tighter tabular-nums text-primary">SYNCED</div>
              </div>
            </div>
          </div>
        </div>

        {/* Command Matrix Toolbar */}
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-4 bg-muted/20 p-4 rounded-[2.5rem] border border-border/40">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground stroke-[2.5]" />
            <Input
              placeholder="SEARCH PRODUCT REGISTRY..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 bg-background/50 border-border/40 rounded-xl font-black text-[10px] uppercase tracking-widest focus:ring-primary/20"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {teamId && (
              <Select value={scopeBrandId} onValueChange={(value) => setScopeBrandId(value as string | "team-all")}>
                <SelectTrigger className="h-12 w-full sm:w-[200px] bg-background/50 border-border/40 rounded-xl font-black text-[10px] uppercase tracking-widest">
                  <SelectValue placeholder="DOMAIN" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/40 font-fira-sans">
                  <SelectItem value="team-all" className="font-black uppercase text-[10px] tracking-widest">ALL DOMAINS</SelectItem>
                  {teamBrands.map((b: Brand) => (
                    <SelectItem key={b.id} value={b.id} className="font-black uppercase text-[10px] tracking-widest">{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
              <SelectTrigger className="h-12 w-full sm:w-[130px] bg-background/50 border-border/40 rounded-xl font-black text-[10px] uppercase tracking-widest">
                <SelectValue placeholder="DENSITY" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/40 font-fira-sans">
                {[5, 10, 20, 50].map((size) => (
                  <SelectItem key={size} value={String(size)} className="font-black uppercase text-[10px] tracking-widest">{size} NODES</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <ProductModal
              mode="create"
              defaultBrandId={scopeBrandId !== "team-all" ? scopeBrandId : (brandId || initialBrandId)}
              brands={teamId ? teamBrands : (brandId && !initialBrandId ? safeBrands.filter(b => b.id === brandId) : safeBrands)}
              teamId={teamId}
              onSuccess={handleRefresh}
            >
              <Button className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02]">
                <Plus className="mr-2 h-4 w-4 stroke-[3]" />
                Deploy Asset
              </Button>
            </ProductModal>
          </div>
        </div>

        {/* Data Matrix Grid */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-[2.5rem] blur-2xl opacity-50" />
          <div className="relative">
            {filteredProducts.length > 0 ? (
              <div className="bg-card/40 backdrop-blur-xl rounded-[2.8rem] border border-border/40 shadow-2xl overflow-hidden p-2">
                <CustomTable
                  columns={createColumns(handleViewProduct, handleEditProduct, safeBrands)}
                  data={filteredProducts}
                  pageSize={pageSize}
                />
              </div>
            ) : (
              <Card className="border-border/40 bg-card/40 backdrop-blur-xl rounded-[2.8rem] p-24 shadow-2xl border-dashed">
                <CardContent className="flex flex-col items-center justify-center text-center space-y-8">
                  <div className="h-24 w-24 rounded-3xl bg-primary/5 flex items-center justify-center border border-primary/10">
                    <Package className="h-12 w-12 text-primary stroke-[1.5]" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black uppercase tracking-tight">Repository Purified</h3>
                    <p className="text-muted-foreground font-medium max-w-sm mx-auto tracking-tight leading-relaxed">
                      No products detected in {currentBrand?.name || 'this domain'}. Initialize the asset matrix to enable campaign deployment.
                    </p>
                  </div>
                  <ProductModal
                    mode="create"
                    defaultBrandId={scopeBrandId !== "team-all" ? scopeBrandId : (brandId || initialBrandId)}
                    brands={teamId ? teamBrands : (brandId && !initialBrandId ? safeBrands.filter(b => b.id === brandId) : safeBrands)}
                    teamId={teamId}
                    onSuccess={handleRefresh}
                  >
                    <Button className="h-14 px-10 rounded-2xl bg-primary hover:bg-primary/95 text-primary-foreground font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-primary/40 transition-all hover:scale-110">
                      <Plus className="mr-3 h-5 w-5 stroke-[3]" />
                      Initialize First Asset
                    </Button>
                  </ProductModal>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Insight Protocol */}
        <Card className="border-border/40 bg-primary/5 backdrop-blur-md rounded-[2.5rem] p-10 overflow-hidden group relative">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-1000">
            <Package className="h-32 w-32" />
          </div>
          <div className="relative flex items-start gap-8">
            <div className="h-16 w-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-2xl shadow-primary/30 shrink-0">
              <Package className="h-8 w-8 stroke-[2.5]" />
            </div>
            <div className="space-y-3">
              <h4 className="text-2xl font-black uppercase tracking-tight">Inventory Optimization active</h4>
              <p className="text-muted-foreground font-medium max-w-3xl text-lg leading-relaxed tracking-tight">
                Managed assets for <span className="text-primary font-black uppercase tracking-widest">{currentBrand?.name || 'GLOBAL'}</span> are
                synchronized across the global creative matrix. AI-assisted categorization is performing with <span className="text-primary font-black">99.2%</span> accuracy.
              </p>
            </div>
          </div>
        </Card>

        {/* Product Modal Matrix */}
        {viewingProduct && (
          <AlertDialog open={isViewOpen} onOpenChange={setIsViewOpen}>
            <AlertDialogContent className="rounded-[3rem] border-border/40 bg-background/95 backdrop-blur-3xl p-10 max-w-2xl font-fira-sans shadow-[0_0_100px_rgba(0,0,0,0.4)]">
              <AlertDialogHeader className="space-y-6">
                <div className="flex items-center justify-between">
                  <AlertDialogTitle className="flex items-center gap-3 text-3xl font-black uppercase tracking-tight">
                    <Package className="h-7 w-7 text-primary" />
                    Asset Diagnostics
                  </AlertDialogTitle>
                  <Badge className="bg-primary/20 text-primary border-none font-black text-[10px] px-3 py-1 rounded-lg">LIVE NODE</Badge>
                </div>
                <AlertDialogDescription className="text-base font-bold text-primary italic uppercase tracking-[0.2em] opacity-80 border-l-4 border-primary pl-4">
                  Identity: {viewingProduct.name}
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="space-y-10 py-10">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-10">
                  <div className="relative h-48 w-48 rounded-[2.5rem] overflow-hidden border border-border/40 shadow-2xl group shrink-0">
                    <Image src={viewingProduct.images?.[0] || '/placeholder.svg'} alt="" fill className="object-cover group-hover:scale-110 transition-transform duration-1000" />
                  </div>
                  <div className="flex-1 space-y-8 w-full">
                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Domain Origin</p>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          <p className="font-black uppercase tracking-tight text-sm text-foreground">{safeBrands.find(b => b.id === viewingProduct.brandId)?.name || 'UNKNOWN'}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Unit Valuation</p>
                        <p className="font-fira-mono font-black text-2xl text-primary leading-none tracking-tighter">
                          {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", minimumFractionDigits: 0 }).format(Number(viewingProduct.price || 0))}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Analytical Description</p>
                      <p className="text-sm font-medium leading-relaxed tracking-tight text-muted-foreground">{viewingProduct.description || 'NO METADATA AVAILABLE IN CURRENT SESSION.'}</p>
                    </div>
                  </div>
                </div>

                {Array.isArray(viewingProduct.images) && viewingProduct.images.length > 1 && (
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Asset Matrix Manifest</p>
                    <div className="flex gap-4 flex-wrap">
                      {viewingProduct.images.map((img, idx) => (
                        <div key={idx} className="relative h-20 w-20 rounded-2xl overflow-hidden border border-border/40 hover:border-primary/50 transition-all cursor-pointer shadow-lg">
                          <Image src={img} alt="" fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <AlertDialogFooter className="sm:justify-center">
                <AlertDialogAction className="h-14 px-12 rounded-2xl font-black uppercase tracking-widest text-[11px] bg-primary shadow-2xl shadow-primary/30" onClick={() => setIsViewOpen(false)}>Terminate Diagnostics</AlertDialogAction>
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

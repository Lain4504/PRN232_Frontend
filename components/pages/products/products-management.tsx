"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Package,
  Plus,
  Search,
  Eye,
  Pencil,
  Box,
  Layers,
  Zap,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CustomTable } from "@/components/ui/custom-table";
import { ColumnDef } from "@tanstack/react-table";
import { Product, Brand } from "@/lib/types/omniadly-types";
import { useBrands } from "@/hooks/use-brands";
import { useProducts, useDeleteProduct } from "@/hooks/use-products";
import { useTeamBrands } from "@/hooks/use-team-brands";
import { useTeamProducts } from "@/hooks/use-team-products";
import { useParams, useRouter } from "next/navigation";
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
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { format } from "date-fns";

const createColumns = (
  handleViewProduct: (product: Product) => void,
  handleEditProduct: (product: Product) => void,
  handleDeleteRequest: (productId: string) => void,
  brands: Brand[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any
): ColumnDef<Product>[] => [
    {
      accessorKey: "name",
      header: t("products.productName"),
      cell: ({ row }) => (
        <div className="flex items-center gap-3 py-2">
          <div className="size-9 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0 border">
            {row.original.images?.[0] ? (
              <Image src={row.original.images[0]} alt="" width={36} height={36} className="object-cover h-full w-full" />
            ) : (
              <Package className="h-4 w-4 text-muted-foreground/50" />
            )}
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="font-semibold text-foreground text-sm truncate max-w-[200px]">{row.getValue("name")}</span>
            <span className="text-[10px] text-muted-foreground font-medium">ID: {row.original.id.slice(0, 8)}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "price",
      header: t("products.productPrice"),
      cell: ({ row }) => {
        const price = row.getValue("price") as number;
        const formattedPrice = new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
          minimumFractionDigits: 0,
        }).format(price);
        return (
          <span className="font-medium text-sm text-foreground">
            {formattedPrice}
          </span>
        );
      },
    },
    {
      accessorKey: "brandId",
      header: t("products.productBrand"),
      cell: ({ row }) => {
        const brandId = row.getValue("brandId") as string;
        const brand = brands.find(b => b.id === brandId);
        return (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-medium rounded-md px-2 py-0 h-5">
              {brand?.name || 'Unassigned'}
            </Badge>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">{t("products.actions")}</div>,
      cell: ({ row }) => {
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted transition-colors">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuItem onClick={() => handleViewProduct(row.original)}>
                  <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                  {t("products.viewDossier")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEditProduct(row.original)}>
                  <Pencil className="mr-2 h-4 w-4 text-muted-foreground" />
                  {t("products.edit")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDeleteRequest(row.original.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t("products.delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

interface ProductsManagementProps {
  initialBrandId?: string;
  teamId?: string;
}

export function ProductsManagement({ initialBrandId, teamId }: ProductsManagementProps = {}) {
  const { t } = useTranslation("common");
  const params = useParams();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
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

  const confirmDeleteProduct = async () => {
    if (!deleteProductId) return;
    try {
      await deleteProductMutation.mutateAsync(deleteProductId);
      toast.success(t("products.deleteSuccess", "Đã xóa sản phẩm"));
      setDeleteProductId(null);
      handleRefresh();
    } catch {
      toast.error(t("products.deleteError", "Lỗi khi xóa sản phẩm"));
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!teamId && !brandId && !initialBrandId) {
    return (
      <div className="flex-1 min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="size-16 rounded-2xl bg-muted flex items-center justify-center mb-6">
          <Box className="size-8 text-muted-foreground/40" />
        </div>
        <h2 className="text-xl font-bold mb-2">{t("products.selectBrand")}</h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          {t("products.description")}
        </p>
        <Button asChild>
          <Link href="/dashboard/brands">
            {t("brands.title")}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 font-fira-sans animate-in fade-in duration-500">
      {/* Breadcrumb */}
      {!teamId && (
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard" className="text-[10px] uppercase font-bold tracking-wider">{t("dashboard.title")}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard/brands" className="text-[10px] uppercase font-bold tracking-wider">{t("brands.title")}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-[10px] uppercase font-bold tracking-wider text-primary">{currentBrand?.name || t("products.registry")}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {currentBrand?.name || (teamId ? 'Team' : 'Brand')} • {t("products.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("products.description")}
          </p>
        </div>

        <ProductModal
          mode="create"
          defaultBrandId={scopeBrandId !== "team-all" ? scopeBrandId : (brandId || initialBrandId)}
          brands={teamId ? teamBrands : (brandId && !initialBrandId ? safeBrands.filter(b => b.id === brandId) : safeBrands)}
          teamId={teamId}
          onSuccess={handleRefresh}
        >
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t("products.createProduct")}
          </Button>
        </ProductModal>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-sm border">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="grid gap-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t("products.totalAssets")}</span>
              <span className="text-2xl font-bold">{filteredProducts.length}</span>
            </div>
            <div className="size-10 rounded-lg bg-primary/5 text-primary flex items-center justify-center">
              <Box className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="grid gap-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t("products.systemStatus")}</span>
              <div className="flex items-center gap-2">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </div>
                <span className="text-sm font-bold text-emerald-600">{t("products.online")}</span>
              </div>
            </div>
            <div className="size-10 rounded-lg bg-emerald-50/50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <Zap className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("products.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto ml-auto">
          {teamId && (
            <Select value={scopeBrandId} onValueChange={(value) => setScopeBrandId(value as string | "team-all")}>
              <SelectTrigger className="h-9 w-full sm:w-[180px]">
                <SelectValue placeholder={t("products.productBrand")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="team-all">{t("products.allBrands")}</SelectItem>
                {teamBrands.map((b: Brand) => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
            <SelectTrigger className="h-9 w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 50].map((size) => (
                <SelectItem key={size} value={String(size)}>Hiển thị {size}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Section */}
      {filteredProducts.length > 0 ? (
        <Card className="border shadow-sm overflow-hidden">
          <CustomTable
            columns={createColumns(handleViewProduct, handleEditProduct, setDeleteProductId, safeBrands, t)}
            data={filteredProducts}
            pageSize={pageSize}
            className="border-0 shadow-none bg-transparent"
            headerClassName="bg-muted/50 border-b py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
          />
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center border-2 border-dashed rounded-xl bg-muted/5">
          <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-6 text-muted-foreground/30">
            <Layers className="size-8" />
          </div>
          <h3 className="text-lg font-bold">{searchTerm ? t("products.noResults") : t("products.noProducts")}</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1 mb-8">
            {searchTerm ? t("products.description") : t("products.noProductsDescription")}
          </p>
          {!searchTerm && (
            <ProductModal
              mode="create"
              defaultBrandId={scopeBrandId !== "team-all" ? scopeBrandId : (brandId || initialBrandId)}
              brands={teamId ? teamBrands : (brandId && !initialBrandId ? safeBrands.filter(b => b.id === brandId) : safeBrands)}
              teamId={teamId}
              onSuccess={handleRefresh}
            >
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t("products.createProduct")}
              </Button>
            </ProductModal>
          )}
        </div>
      )}

      {/* Product Detail "Dossier" Modal */}
      {viewingProduct && (
        <AlertDialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <AlertDialogContent className="max-w-2xl p-0 overflow-hidden bg-background border shadow-2xl rounded-xl">
            <div className="relative h-56 w-full bg-muted">
              {viewingProduct.images?.[0] ? (
                <Image src={viewingProduct.images[0]} alt="" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground/10">
                  <Package className="size-20" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between text-white">
                <div className="grid gap-1">
                  <Badge variant="secondary" className="w-fit bg-primary text-primary-foreground border-none font-bold uppercase text-[9px] tracking-wider mb-2">
                    {t("products.activeAsset")}
                  </Badge>
                  <h4 className="text-2xl font-bold leading-tight">{viewingProduct.name}</h4>
                  <p className="text-xs text-white/70 font-medium">{safeBrands.find(b => b.id === viewingProduct.brandId)?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/50 mb-0.5">{t("products.valuation")}</p>
                  <p className="text-xl font-bold">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", minimumFractionDigits: 0 }).format(Number(viewingProduct.price || 0))}
                  </p>
                </div>
              </div>
              <Button onClick={() => setIsViewOpen(false)} variant="ghost" size="icon" className="absolute top-4 right-4 h-8 w-8 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-md">
                <Plus className="rotate-45 h-4 w-4" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("products.schematicData")}</span>
                <p className="text-sm text-foreground leading-relaxed">
                  {viewingProduct.description || t("brands.noDescription")}
                </p>
              </div>

              {Array.isArray(viewingProduct.images) && viewingProduct.images.length > 1 && (
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("products.visualDatabase")}</span>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {viewingProduct.images.slice(1).map((img, idx) => (
                      <div key={idx} className="relative h-16 w-16 rounded-md overflow-hidden border shrink-0 hover:border-primary transition-colors cursor-pointer">
                        <Image src={img} alt="" fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t">
                <Button variant="outline" size="sm" onClick={() => setIsViewOpen(false)}>
                  {t("products.closeDossier")}
                </Button>
              </div>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("products.delete")} {t("products.productName")}?</AlertDialogTitle>
            <AlertDialogDescription>
              {t("brands.deleteDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("products.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteProduct}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteProductMutation.isPending}
            >
              {deleteProductMutation.isPending ? t("common.processing", "...") : t("products.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
  );
}

"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
  ChevronRight,
  Filter,
  Sparkles,
  DollarSign
} from "lucide-react"
import { ActionsDropdown, ActionItem } from "@/components/ui/actions-dropdown"
import { CustomTable } from "@/components/ui/custom-table"
import { ColumnDef } from "@tanstack/react-table"
import { Product, Brand } from "@/lib/types/omniadly-types"
import { useBrands } from "@/hooks/use-brands"
import { useProducts, useDeleteProduct } from "@/hooks/use-products"
import { useTeamBrands } from "@/hooks/use-team-brands"
import { useTeamProducts } from "@/hooks/use-team-products"
import { useParams, useRouter } from "next/navigation"
import { ProductModal } from "@/components/products/product-modal"
import Image from "next/image"
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

import { toast } from "sonner"
import { cn } from "@/lib/utils"

const createColumns = (
  handleViewProduct: (product: Product) => void,
  handleEditProduct: (product: Product) => void,
  handleDeleteRequest: (productId: string) => void,
  brands: Brand[]
): ColumnDef<Product>[] => [
    {
      accessorKey: "name",
      header: "Tên sản phẩm",
      cell: ({ row }) => (
        <div className="flex items-center gap-5 py-3 transition-all duration-300">
          <div className="size-12 rounded-lg bg-muted border border-border flex items-center justify-center overflow-hidden shrink-0 shadow-sm group-hover:scale-105 transition-transform">
            {row.original.images?.[0] ? (
              <Image src={row.original.images[0]} alt="" width={48} height={48} className="object-cover h-full w-full" />
            ) : (
              <Package className="size-5 text-muted-foreground" />
            )}
          </div>
          <div className="space-y-1">
            <span className="font-bold text-foreground text-base truncate max-w-[300px] block leading-tight">{row.getValue("name")}</span>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-muted text-muted-foreground border-none text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
                Ref: {row.original.id.slice(0, 8)}
              </Badge>
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "price",
      header: "Giá niêm yết",
      cell: ({ row }) => {
        const price = row.getValue("price") as number
        return (
          <div className="space-y-0.5">
            <div className="text-sm font-bold text-foreground">
              ₫{(price || 0).toLocaleString('vi-VN')}
            </div>
            <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider opacity-60">Giá niêm yết</div>
          </div>
        )
      },
    },
    {
      accessorKey: "brandId",
      header: "Thương hiệu",
      cell: ({ row }) => {
        const brandId = row.getValue("brandId") as string
        const brand = brands.find(b => b.id === brandId)
        return (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-foreground uppercase tracking-wider bg-muted/50 px-3 py-1 rounded-md border border-border">
              {brand?.name || 'Vô danh'}
            </span>
          </div>
        )
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Thao tác</div>,
      cell: ({ row }) => {
        const actions: ActionItem[] = [
          {
            label: "Xem hồ sơ sản phẩm",
            icon: <Eye className="size-4" />,
            onClick: () => handleViewProduct(row.original),
          },
          {
            label: "Cập nhật dữ liệu",
            icon: <Pencil className="size-4" />,
            onClick: () => handleEditProduct(row.original),
          },
          {
            label: "Xóa khỏi kho",
            icon: <Trash2 className="size-4" />,
            onClick: () => handleDeleteRequest(row.original.id),
            variant: "destructive",
          },
        ]

        return (
          <div className="flex justify-end">
            <ActionsDropdown actions={actions} />
          </div>
        )
      },
    },
  ]

interface ProductsManagementProps {
  initialBrandId?: string;
  teamId?: string;
}

export function ProductsManagement({ initialBrandId, teamId }: ProductsManagementProps = {}) {

  const params = useParams()
  const [searchTerm, setSearchTerm] = useState("")
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null)
  const [pageSize, setPageSize] = useState(10)

  const routeBrandId = params.id as string | undefined
  const brandId = teamId ? undefined : (routeBrandId || initialBrandId)
  const { data: teamBrands = [] } = useTeamBrands(teamId || "")

  const [scopeBrandId, setScopeBrandId] = useState<string | "team-all">(
    teamId ? "team-all" : (routeBrandId || initialBrandId || "")
  )

  useEffect(() => {
    if (!teamId && routeBrandId && routeBrandId !== scopeBrandId) {
      setScopeBrandId(routeBrandId)
    }
  }, [routeBrandId, teamId, scopeBrandId])

  const brandsQuery = useBrands()
  const brands = teamId ? teamBrands : (brandsQuery.data || [])

  const effectiveBrandId = teamId
    ? (scopeBrandId !== "team-all" ? scopeBrandId : undefined)
    : (brandId || scopeBrandId || undefined)

  const regularProducts = useProducts(effectiveBrandId)
  const teamProducts = useTeamProducts(
    teamId && scopeBrandId === "team-all" ? teamId : undefined,
    teamId && scopeBrandId !== "team-all" ? scopeBrandId : undefined
  )

  const isLoading = teamId && scopeBrandId === "team-all" ? (teamProducts.isLoading) : (regularProducts.isLoading)
  const productsData = teamId && scopeBrandId === "team-all" ? (teamProducts.data || []) : (regularProducts.data || [])
  const refetchProducts = teamId && scopeBrandId === "team-all" ? teamProducts.refetch : regularProducts.refetch

  const deleteProductMutation = useDeleteProduct()
  const safeBrands = Array.isArray(brands) ? brands : []
  const safeProducts = Array.isArray(productsData) ? productsData : []

  const currentBrandId = teamId ? (scopeBrandId !== "team-all" ? scopeBrandId : undefined) : brandId
  const currentBrand = safeBrands.find(b => b.id === currentBrandId)

  const filteredProducts = safeProducts.filter(product => {
    const matchesBrand = !effectiveBrandId || product.brandId === effectiveBrandId
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesBrand && matchesSearch
  })

  const handleRefresh = () => {
    refetchProducts()
  }

  const handleViewProduct = (product: Product) => {
    setViewingProduct(product)
    setIsViewOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setIsEditOpen(true)
  }

  const confirmDeleteProduct = async () => {
    if (!deleteProductId) return
    try {
      await deleteProductMutation.mutateAsync(deleteProductId)
      toast.success("Đã xóa sản phẩm thành công")
      setDeleteProductId(null)
      handleRefresh()
    } catch {
      toast.error("Lỗi khi xóa sản phẩm")
    }
  }

  if (isLoading) return (
    <div className="space-y-10 animate-pulse">
      <div className="h-10 w-64 bg-muted rounded-md" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map(i => <div key={i} className="h-32 bg-card rounded-lg border border-border" />)}
      </div>
      <div className="h-[500px] w-full bg-card rounded-lg border border-border" />
    </div>
  )

  if (!teamId && !brandId && !initialBrandId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center border border-dashed border-border rounded-lg bg-muted/5">
        <div className="size-16 rounded-full bg-card flex items-center justify-center mb-6 shadow-sm border border-border">
          <Box className="size-8 text-muted-foreground/20" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2 italic">Lồng ghép thương hiệu</h3>
        <p className="text-muted-foreground font-medium max-w-sm mb-8 italic text-sm">Vui lòng chọn một thương hiệu từ danh sách để bắt đầu tối ưu hóa danh mục tài sản.</p>
        <Link href="/dashboard/brands">
          <Button className="h-12 px-8 rounded-md font-bold text-sm shadow-md transition-all hover:scale-105">Quay lại quản trị</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-10 pb-20 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border pb-10 text-foreground">
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
              <Box className="size-4" />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Trung tâm tài tản / Kho hàng</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
            {currentBrand?.name || (teamId ? 'Team' : 'Brand')} • Kho sản phẩm
          </h1>
          <p className="text-sm md:text-lg text-muted-foreground font-medium max-w-xl leading-relaxed italic">
            Số hóa danh mục sản phẩm để đồng bộ hóa trí tuệ nhân tạo trong quá trình sáng tạo nội dung.
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
            <Button className="h-12 md:h-14 w-full md:px-8 rounded-md font-bold text-sm shadow-lg transition-all hover:scale-[1.02]">
              <Plus className="mr-2 h-4 w-4" />
              Thêm sản phẩm mới
            </Button>
          </ProductModal>
        </div>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { label: "Tổng số thực thể", value: filteredProducts.length, icon: Package, color: "text-foreground", bg: "bg-muted" },
          { label: "Trạng thái kho dữ liệu", value: "Online", icon: Zap, color: "text-emerald-600", bg: "bg-emerald-500/10", ping: true },
        ].map((stat, i) => (
          <Card key={i} className="rounded-lg border border-border bg-card p-6 shadow-sm group hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-primary/20">
            <div className="flex items-center justify-between mb-6">
              <div className={cn("size-10 rounded-md flex items-center justify-center border border-border", stat.bg, stat.color)}>
                <stat.icon className="size-5 transition-transform group-hover:rotate-12" />
              </div>
              {stat.ping && (
                <div className="flex items-center gap-2">
                  <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-600">Syncing Live</span>
                </div>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground tracking-tight">{stat.value}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="relative flex-1 group w-full lg:max-w-[420px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            placeholder="Truy vấn danh mục sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 h-11 bg-muted/10 border border-border rounded-md shadow-sm focus:ring-1 focus:ring-primary focus:outline-none font-medium transition-all text-foreground placeholder:text-muted-foreground/40"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
          {teamId && (
            <div className="flex items-center gap-2 bg-card p-1 rounded-md border border-border shadow-sm">
              <div className="size-8 rounded-sm bg-muted flex items-center justify-center text-muted-foreground">
                <Filter className="size-3.5" />
              </div>
              <Select value={scopeBrandId} onValueChange={(value) => setScopeBrandId(value as string | "team-all")}>
                <SelectTrigger className="w-[180px] border-none focus:ring-0 font-bold text-[11px] uppercase tracking-wider h-8 bg-transparent">
                  <SelectValue placeholder="Phạm vi" />
                </SelectTrigger>
                <SelectContent className="rounded-md border-border shadow-xl p-1 bg-popover">
                  <SelectItem value="team-all" className="rounded-sm">Toàn bộ hồ sơ</SelectItem>
                  {teamBrands.map((b: Brand) => (
                    <SelectItem key={b.id} value={b.id} className="rounded-sm">{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center gap-3 px-4 py-2 bg-muted/30 rounded-md border border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Linh hoạt: {pageSize} / Mục
          </div>
        </div>
      </div>

      {/* Table Section */}
      {filteredProducts.length > 0 ? (
        <Card className="rounded-lg border border-border bg-card shadow-sm overflow-hidden relative group">
          <CustomTable
            columns={createColumns(handleViewProduct, handleEditProduct, setDeleteProductId, safeBrands)}
            data={filteredProducts}
            pageSize={pageSize}
            className="border-0 shadow-none bg-transparent"
            headerClassName="bg-muted/50 border-b border-border py-5 px-8 text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
          />
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center border border-dashed border-border rounded-lg bg-muted/5">
          <div className="size-16 rounded-full bg-card flex items-center justify-center mb-6 shadow-sm border border-border">
            <Layers className="size-8 text-muted-foreground/20" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2 italic">
            {searchTerm ? "Không có kết quả truy vấn" : "Kho hàng đang trống"}
          </h3>
          <p className="text-muted-foreground font-medium max-w-sm mb-8 italic text-sm">
            {searchTerm ? "Vui lòng điều chỉnh tham số lọc để quét lại cơ sở dữ liệu." : "Hãy khởi tạo thực thể sản phẩm đầu tiên để AI có thể bắt đầu quá trình trích xuất dữ liệu thông minh."}
          </p>
          {!searchTerm && (
            <ProductModal
              mode="create"
              defaultBrandId={scopeBrandId !== "team-all" ? scopeBrandId : (brandId || initialBrandId)}
              brands={teamId ? teamBrands : (brandId && !initialBrandId ? safeBrands.filter(b => b.id === brandId) : safeBrands)}
              teamId={teamId}
              onSuccess={handleRefresh}
            >
              <Button className="h-12 px-8 rounded-md font-bold text-sm shadow-md transition-all hover:scale-105">
                <Plus className="mr-2 h-4 w-4" />
                Khởi tạo dữ liệu
              </Button>
            </ProductModal>
          )}
        </div>
      )}

      {/* Dossier Modal */}
      {viewingProduct && (
        <AlertDialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <AlertDialogContent className="max-w-2xl p-0 overflow-hidden bg-card border-border shadow-2xl rounded-lg font-sans">
            <div className="relative h-72 w-full bg-muted">
              {viewingProduct.images?.[0] ? (
                <Image src={viewingProduct.images[0]} alt="" fill className="object-cover opacity-90" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground/10">
                  <Package className="size-32" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-10 right-10 flex items-end justify-between text-foreground">
                <div className="space-y-2">
                  <Badge className="bg-primary text-primary-foreground border-none font-bold uppercase text-[10px] tracking-wider mb-3 shadow-sm">
                    <Sparkles className="size-3 mr-2" /> TÀI SẢN CHIẾN LƯỢC
                  </Badge>
                  <h4 className="text-3xl font-bold tracking-tight leading-none italic">{viewingProduct.name}</h4>
                  <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wider italic">{safeBrands.find(b => b.id === viewingProduct.brandId)?.name || "Hồ sơ chính"}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Định giá niêm yết</p>
                  <p className="text-2xl font-bold text-foreground">
                    ₫{Number(viewingProduct.price || 0).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>
              <Button onClick={() => setIsViewOpen(false)} variant="ghost" size="icon" className="absolute top-8 right-8 h-10 w-10 rounded-md bg-card/10 hover:bg-card/20 text-foreground border border-border backdrop-blur-xl">
                <Plus className="rotate-45 size-6" />
              </Button>
            </div>

            <div className="p-10 space-y-10">
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="size-6 rounded-md bg-muted flex items-center justify-center text-primary border border-border">
                    <Search className="size-3" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Phân tích thuộc tính</span>
                </div>
                <p className="text-base font-medium text-muted-foreground leading-relaxed italic border-l-2 border-primary/40 pl-6">
                  {viewingProduct.description || "Thực thể này chưa có dữ liệu mô tả thuộc tính trong hồ sơ."}
                </p>
              </div>

              {Array.isArray(viewingProduct.images) && viewingProduct.images.length > 1 && (
                <div className="space-y-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Thư viện thị giác liên kết</span>
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {viewingProduct.images.slice(1).map((img, idx) => (
                      <div key={idx} className="relative h-20 w-20 rounded-lg overflow-hidden border border-border shrink-0 hover:border-primary transition-all cursor-pointer shadow-sm">
                        <Image src={img} alt="" fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-center pt-8 border-t border-border">
                <Button onClick={() => setIsViewOpen(false)} className="h-12 px-12 rounded-md font-bold text-xs shadow-md transition-all hover:scale-105">
                  Đóng hồ sơ sản phẩm
                </Button>
              </div>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
        <AlertDialogContent className="rounded-lg border-border p-8 max-w-md shadow-2xl bg-popover">
          <AlertDialogHeader className="space-y-4">
            <div className="size-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto border border-destructive/20 shadow-sm">
              <Trash2 className="size-8" />
            </div>
            <AlertDialogTitle className="text-2xl font-bold tracking-tight text-center text-foreground">Xác nhận gỡ bỏ?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium text-muted-foreground leading-relaxed text-center italic mt-2">
              Dữ liệu của tài sản này sẽ bị loại bỏ khỏi kho lưu trữ lõi của AI. Thao tác không thể khôi phục sau khi xác nhận.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 flex gap-3">
            <AlertDialogCancel className="flex-1 rounded-md h-11 font-bold text-xs">Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteProduct}
              className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md h-11 font-bold text-xs border-none shadow-lg"
              disabled={deleteProductMutation.isPending}
            >
              {deleteProductMutation.isPending ? "..." : "Xác nhận xóa"}
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
            setIsEditOpen(false)
            setEditingProduct(null)
            handleRefresh()
          }}
        />
      )}
    </div>
  )
}

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
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const createColumns = (
  handleViewProduct: (product: Product) => void,
  handleEditProduct: (product: Product) => void,
  handleDeleteRequest: (productId: string) => void,
  brands: Brand[],
  t: any
): ColumnDef<Product>[] => [
    {
      accessorKey: "name",
      header: t("products.productName"),
      cell: ({ row }) => (
        <div className="flex items-center gap-6 py-4">
          <div className="size-14 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200 shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-all">
            {row.original.images?.[0] ? (
              <Image src={row.original.images[0]} alt="" width={56} height={56} className="object-cover h-full w-full" />
            ) : (
              <Package className="size-6 text-slate-400 group-hover:text-white" />
            )}
          </div>
          <div className="space-y-1">
            <span className="font-black text-slate-900 text-lg truncate max-w-[300px] block leading-tight">{row.getValue("name")}</span>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-slate-50 text-slate-400 border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg">ID: {row.original.id.slice(0, 8)}</Badge>
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "price",
      header: t("products.productPrice"),
      cell: ({ row }) => {
        const price = row.getValue("price") as number
        return (
          <div className="space-y-0.5">
            <div className="text-sm font-black text-slate-900">
              ₫{(price || 0).toLocaleString('vi-VN')}
            </div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest opacity-60">Định giá niêm yết</div>
          </div>
        )
      },
    },
    {
      accessorKey: "brandId",
      header: t("products.productBrand"),
      cell: ({ row }) => {
        const brandId = row.getValue("brandId") as string
        const brand = brands.find(b => b.id === brandId)
        return (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">{brand?.name || 'Chưa gán'}</span>
          </div>
        )
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Thao tác</div>,
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

export function ProductsManagement({ initialBrandId, teamId }: ProductsManagementProps = {}) {
  const { t } = useTranslation("common")
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
    <div className="space-y-12 animate-pulse">
      <div className="h-12 w-64 bg-slate-50 rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[1, 2].map(i => <div key={i} className="h-40 bg-slate-50 rounded-[2rem] border border-slate-100" />)}
      </div>
      <div className="h-[600px] w-full bg-slate-50 rounded-[2.5rem] border border-slate-100" />
    </div>
  )

  if (!teamId && !brandId && !initialBrandId) {
    return (
      <div className="flex flex-col items-center justify-center py-40 px-6 text-center border border-dashed border-slate-200 rounded-[3rem] bg-slate-50/50">
        <div className="size-20 rounded-[2rem] bg-white flex items-center justify-center mb-8 shadow-sm border border-slate-100">
          <Box className="size-10 text-slate-200" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-3 uppercase tracking-widest">Chọn thương hiệu</h3>
        <p className="text-slate-500 font-medium max-w-sm mb-10 leading-relaxed uppercase tracking-tighter text-xs">Vui lòng chọn một thương hiệu từ danh sách để bắt đầu quản lý danh mục sản phẩm.</p>
        <Link href="/dashboard/brands">
          <Button className="h-14 px-10 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-slate-200 transition-all hover:-translate-y-1">Quay về Brands</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-12 pb-20 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-100 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
              <Box className="size-4" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Hệ thống quản trị tài sản</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-none">
            {currentBrand?.name || (teamId ? 'Team' : 'Brand')} • {t("products.title")}
          </h1>
          <p className="text-lg text-slate-500 font-medium max-w-xl leading-relaxed">
            Số hóa danh mục sản phẩm của bạn để AI có thể trích xuất dữ liệu sáng tạo nội dung quảng cáo.
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
            <Button className="h-14 px-8 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-slate-200 transition-all hover:-translate-y-1">
              <Plus className="mr-3 h-4 w-4" />
              Thêm sản phẩm mới
            </Button>
          </ProductModal>
        </div>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          { label: "Tổng số thực thể", value: filteredProducts.length, icon: Package, color: "text-slate-900", bg: "bg-slate-100" },
          { label: "Trạng thái kho dữ liệu", value: "Online", icon: Zap, color: "text-emerald-600", bg: "bg-emerald-50", ping: true },
        ].map((stat, i) => (
          <Card key={i} className="rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm group hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-8">
              <div className={cn("size-12 rounded-2xl flex items-center justify-center shadow-sm border border-white ring-4 ring-slate-50", stat.bg, stat.color)}>
                <stat.icon className="size-5 transition-transform group-hover:rotate-12" />
              </div>
              {stat.ping && (
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600">Đang hoạt động</span>
                </div>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="relative flex-1 group w-full lg:max-w-[400px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
          <Input
            placeholder={t("products.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 bg-white border-slate-100 rounded-2xl shadow-sm focus-visible:ring-slate-100 font-medium transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
          {teamId && (
            <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
              <div className="size-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                <Filter className="size-3.5" />
              </div>
              <Select value={scopeBrandId} onValueChange={(value) => setScopeBrandId(value as string | "team-all")}>
                <SelectTrigger className="w-[180px] border-none focus:ring-0 font-bold text-xs uppercase tracking-widest h-8">
                  <SelectValue placeholder="Thương hiệu" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-1">
                  <SelectItem value="team-all" className="rounded-xl">Mọi thương hiệu</SelectItem>
                  {teamBrands.map((b: Brand) => (
                    <SelectItem key={b.id} value={b.id} className="rounded-xl">{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Hiển thị: {pageSize} / trang
          </div>
        </div>
      </div>

      {/* Table Section */}
      {filteredProducts.length > 0 ? (
        <Card className="rounded-[2.5rem] border border-slate-100 bg-white shadow-xl shadow-slate-200/40 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-10 opacity-5 -rotate-12 group-hover:rotate-0 transition-transform duration-1000">
            <Package className="size-40 text-slate-900" />
          </div>
          <CustomTable
            columns={createColumns(handleViewProduct, handleEditProduct, setDeleteProductId, safeBrands, t)}
            data={filteredProducts}
            pageSize={pageSize}
            className="border-0 shadow-none bg-transparent"
            headerClassName="bg-slate-50/50 border-b border-slate-100 py-6 px-10 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400"
          />
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 px-6 text-center border border-dashed border-slate-200 rounded-[3rem] bg-slate-50/50">
          <div className="size-20 rounded-[2rem] bg-white flex items-center justify-center mb-8 shadow-sm border border-slate-100">
            <Layers className="size-10 text-slate-200" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-3 uppercase tracking-widest">
            {searchTerm ? "Không có sản phẩm nào" : "Kho hàng đang trống"}
          </h3>
          <p className="text-slate-500 font-medium max-w-sm mb-10 leading-relaxed uppercase tracking-tighter text-xs">
            {searchTerm ? "Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm của bạn." : "Hãy phác thảo sản phẩm đầu tiên của bạn để AI có thể bắt đầu quá trình trích xuất dữ liệu sáng tạo."}
          </p>
          {!searchTerm && (
            <ProductModal
              mode="create"
              defaultBrandId={scopeBrandId !== "team-all" ? scopeBrandId : (brandId || initialBrandId)}
              brands={teamId ? teamBrands : (brandId && !initialBrandId ? safeBrands.filter(b => b.id === brandId) : safeBrands)}
              teamId={teamId}
              onSuccess={handleRefresh}
            >
              <Button className="h-14 px-10 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-slate-200 transition-all hover:-translate-y-1">
                <Plus className="mr-3 h-5 w-5" />
                Triển khai sản phẩm
              </Button>
            </ProductModal>
          )}
        </div>
      )}

      {/* Dossier Modal */}
      {viewingProduct && (
        <AlertDialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <AlertDialogContent className="max-w-2xl p-0 overflow-hidden bg-white border-none shadow-2xl rounded-[2.5rem] font-sans">
            <div className="relative h-72 w-full bg-slate-900">
              {viewingProduct.images?.[0] ? (
                <Image src={viewingProduct.images[0]} alt="" fill className="object-cover opacity-80" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/5">
                  <Package className="size-32" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-10 right-10 flex items-end justify-between text-white">
                <div className="space-y-2">
                  <Badge className="bg-emerald-500 text-white border-none font-black uppercase text-[10px] tracking-widest mb-3">
                    <Sparkles className="size-3 mr-2" /> TÀI SẢN CHIẾN LƯỢC
                  </Badge>
                  <h4 className="text-3xl font-black tracking-tight leading-none uppercase">{viewingProduct.name}</h4>
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">{safeBrands.find(b => b.id === viewingProduct.brandId)?.name || "Global"}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Định giá</p>
                  <p className="text-2xl font-black text-white">
                    ₫{Number(viewingProduct.price || 0).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>
              <Button onClick={() => setIsViewOpen(false)} variant="ghost" size="icon" className="absolute top-8 right-8 h-10 w-10 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-xl">
                <Plus className="rotate-45 size-6" />
              </Button>
            </div>

            <div className="p-10 space-y-10">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="size-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-900 border border-slate-200">
                    <Search className="size-3" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Dữ liệu phân tích AI</span>
                </div>
                <p className="text-base font-medium text-slate-600 leading-relaxed italic border-l-4 border-slate-900 pl-8">
                  {viewingProduct.description || "Chưa có mô tả kỹ thuật cho thực thể này trong hồ sơ lưu trữ."}
                </p>
              </div>

              {Array.isArray(viewingProduct.images) && viewingProduct.images.length > 1 && (
                <div className="space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Thư viện thị giác liên kết</span>
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {viewingProduct.images.slice(1).map((img, idx) => (
                      <div key={idx} className="relative h-20 w-20 rounded-2xl overflow-hidden border-2 border-slate-50 shrink-0 hover:border-slate-900 transition-all cursor-pointer shadow-sm">
                        <Image src={img} alt="" fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-8 border-t border-slate-50">
                <Button onClick={() => setIsViewOpen(false)} className="h-12 px-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[10px]">
                  Đóng hồ sơ
                </Button>
              </div>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
        <AlertDialogContent className="rounded-[2.5rem] border-slate-100 p-10 max-w-md shadow-2xl">
          <AlertDialogHeader className="space-y-6">
            <div className="size-20 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto border border-rose-100 shadow-sm">
              <Trash2 className="size-10" />
            </div>
            <AlertDialogTitle className="text-3xl font-black tracking-tight text-center uppercase text-slate-900">Xóa sản phẩm?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium text-slate-500 leading-relaxed text-center italic mt-2">
              Dữ liệu của sản phẩm này sẽ bị loại bỏ khỏi kho dữ liệu tri thức của AI. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-12 grid grid-cols-2 gap-4">
            <AlertDialogCancel className="rounded-xl h-12 font-black uppercase tracking-widest text-[10px] bg-slate-50 border-none">Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteProduct}
              className="bg-rose-500 text-white hover:bg-rose-600 rounded-xl h-12 font-black uppercase tracking-widest text-[10px] border-none shadow-lg shadow-rose-100"
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

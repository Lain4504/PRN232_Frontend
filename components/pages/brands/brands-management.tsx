"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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
  Plus,
  Search,
  MoreVertical,
  Package,
  FileText,
  Trash2,
  Building2,
  Settings,
  Target,
  ChevronRight,
  Filter
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Brand } from "@/lib/types/omniadly-types"
import { toast } from "sonner"
import { useBrands, useDeleteBrand } from "@/hooks/use-brands"
import { useTeamsByVendor } from "@/hooks/use-teams"
import { useProfile } from "@/lib/contexts/profile-context"
import { getActiveTeamId, setActiveTeamId, clearActiveTeamId } from "@/lib/utils/profile-utils"
import { BrandModal } from "@/components/brands/brand-modal"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { enUS } from "date-fns/locale"
import { cn } from "@/lib/utils"

export function BrandsManagement() {

  const [searchTerm, setSearchTerm] = useState("")
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [deleteBrandId, setDeleteBrandId] = useState<string | null>(null)
  const { activeProfileId } = useProfile()
  const [selectedTeamId, setSelectedTeamId] = useState<string>(() => getActiveTeamId() || "all")

  React.useEffect(() => {
    if (selectedTeamId === "all") {
      clearActiveTeamId()
    } else {
      setActiveTeamId(selectedTeamId)
    }
  }, [selectedTeamId])

  const { data: brands = [], isLoading: loading, refetch: refetchBrands } = useBrands({
    teamId: selectedTeamId === "all" ? undefined : selectedTeamId
  })

  const { data: teams = [] } = useTeamsByVendor(activeProfileId || undefined)
  const deleteBrandMutation = useDeleteBrand()

  const safeBrands = Array.isArray(brands) ? brands : []
  const filteredBrands = safeBrands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brand.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEditBrand = (brand: Brand) => {
    setEditingBrand(brand)
    setIsEditModalOpen(true)
  }

  const confirmDeleteBrand = async () => {
    if (!deleteBrandId) return
    try {
      await deleteBrandMutation.mutateAsync(deleteBrandId)
      toast.success("Đã xóa thương hiệu thành công")
      setDeleteBrandId(null)
    } catch {
      toast.error("Lỗi khi xóa thương hiệu")
    }
  }

  if (loading) return (
    <div className="space-y-10 animate-pulse">
      <div className="h-10 w-64 bg-slate-50 dark:bg-slate-900 rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => <div key={i} className="h-48 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800" />)}
      </div>
    </div>
  )

  return (
    <div className="space-y-8 md:space-y-12 pb-10 md:pb-20 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 border-b border-slate-100 dark:border-slate-800 pb-8">
        <div className="space-y-3 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <div className="size-6 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
              <Target className="size-3.5" />
            </div>
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">Quản trị danh tính</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
            Quản lý Thương hiệu
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto md:mx-0">
            Thiết lập và quản lý hệ sinh thái thương hiệu của bạn.
          </p>
        </div>

        <div className="w-full md:w-auto">
          <BrandModal mode="create" onSuccess={refetchBrands}>
            <Button className="h-10 w-full md:px-6 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm transition-all">
              <Plus className="mr-2 h-4 w-4" />
              Thêm thương hiệu
            </Button>
          </BrandModal>
        </div>
      </div>


      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 dark:text-slate-600 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors" />
          <Input
            placeholder="Tìm kiếm thương hiệu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-10 bg-white dark:bg-slate-900 border-border rounded-md shadow-sm focus-visible:ring-primary font-medium transition-all text-slate-900 dark:text-white placeholder:text-muted-foreground"
          />
        </div>

        {teams.length > 0 && (
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-1.5 rounded-md border border-border shadow-sm w-full sm:w-auto">
            <div className="size-7 rounded bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
              <Filter className="size-3.5" />
            </div>
            <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
              <SelectTrigger className="w-full sm:w-[180px] border-none focus:ring-0 font-semibold text-xs h-7 bg-transparent text-slate-900 dark:text-white">
                <SelectValue placeholder="Tất cả đội nhóm" />
              </SelectTrigger>
              <SelectContent className="rounded-md border-border shadow-lg p-1 bg-white dark:bg-slate-900">
                <SelectItem value="all" className="rounded-sm">Tất cả đội nhóm</SelectItem>
                {teams.map(team => (
                  <SelectItem key={team.id} value={team.id} className="rounded-sm">
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Brands Grid */}
      {filteredBrands.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBrands.map((brand) => (
            <Card key={brand.id} className="group relative overflow-hidden rounded-lg border border-border bg-card hover:bg-accent/5 transition-all duration-300 shadow-sm hover:shadow-md">
              <CardHeader className="p-6 pb-4 flex flex-row items-start justify-between">
                <Avatar className="size-14 rounded-md border border-border bg-muted shadow-sm transition-transform group-hover:scale-105">
                  <AvatarImage src={brand.logo_url || brand.logoUrl} className="object-cover" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
                    {brand.name.substring(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-muted opacity-100 md:opacity-0 group-hover:opacity-100 transition-all text-muted-foreground hover:text-foreground">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[180px] rounded-md border-border p-1 shadow-md bg-popover">
                    <DropdownMenuItem onClick={() => window.location.href = `/dashboard/brands/${brand.id}/products`} className="rounded-sm py-2 px-3 font-medium text-sm cursor-pointer">
                      <Package className="mr-2 h-4 w-4 opacity-70" />
                      Sản phẩm
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.location.href = `/dashboard/brands/${brand.id}/contents`} className="rounded-sm py-2 px-3 font-medium text-sm cursor-pointer">
                      <FileText className="mr-2 h-4 w-4 opacity-70" />
                      Nội dung
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleEditBrand(brand)} className="rounded-sm py-2 px-3 font-medium text-sm cursor-pointer">
                      <Settings className="mr-2 h-4 w-4 opacity-70" />
                      Cấu hình
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDeleteBrandId(brand.id)} className="rounded-sm py-2 px-3 font-medium text-sm text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer">
                      <Trash2 className="mr-2 h-4 w-4 opacity-70" />
                      Xóa bỏ
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>

              <CardContent className="p-6 pt-0 space-y-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-lg text-foreground truncate" title={brand.name}>
                    {brand.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-muted text-muted-foreground text-[10px] font-semibold px-2 py-0.5 rounded-sm border-none">
                      {brand.productsCount || 0} SP
                    </Badge>
                    <Badge variant="secondary" className="bg-muted text-muted-foreground text-[10px] font-semibold px-2 py-0.5 rounded-sm border-none">
                      {brand.contentsCount || 0} NỘI DUNG
                    </Badge>
                  </div>
                </div>

                <p className="text-xs font-medium text-muted-foreground line-clamp-2 min-h-[2.5em] leading-relaxed">
                  {brand.description || "Chưa có mô tả cho thương hiệu này."}
                </p>

                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-[11px] font-medium text-muted-foreground/60">
                    ID: {brand.id.substring(0, 8)}
                  </span>
                  <Button variant="ghost" className="size-8 p-0 rounded-md text-muted-foreground hover:text-primary transition-colors">
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      ) : (
        <Card className="rounded-lg border-border border-dashed bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="size-16 rounded-md bg-card flex items-center justify-center mb-6 shadow-sm border border-border">
              <Building2 className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Chưa có thương hiệu</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium max-w-sm mb-8 leading-relaxed">
              {searchTerm ? "Không tìm thấy kết quả phù hợp với từ khóa của bạn." : "Bắt đầu bằng hành động khởi tạo thương hiệu đầu tiên trong ma trận hồ sơ của bạn."}
            </p>
            {!searchTerm && (
              <BrandModal mode="create" onSuccess={refetchBrands}>
                <Button className="h-10 px-8 rounded-md font-semibold text-sm transition-all">
                  <Plus className="mr-2 h-4 w-4" />
                  Triển khai thương hiệu
                </Button>
              </BrandModal>
            )}
          </CardContent>
        </Card>
      )}

      <BrandModal mode="edit" brand={editingBrand || undefined} open={isEditModalOpen} onOpenChange={setIsEditModalOpen} onSuccess={refetchBrands} />

      <AlertDialog open={!!deleteBrandId} onOpenChange={() => setDeleteBrandId(null)}>
        <AlertDialogContent className="rounded-lg p-8 border-border bg-popover">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-foreground">Xóa thương hiệu?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-sm font-medium leading-relaxed pt-2">
              Bạn có chắc chắn muốn xóa thương hiệu này? Hành động này không thể hoàn tác và tất cả dữ liệu liên quan sẽ bị mất.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-3">
            <AlertDialogCancel className="h-10 px-4 rounded-md font-semibold text-sm border-border bg-transparent text-foreground hover:bg-accent">Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteBrand}
              className="h-10 px-4 rounded-md font-semibold text-sm bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteBrandMutation.isPending}
            >
              {deleteBrandMutation.isPending ? "Đang xử lý..." : "Xác nhận xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

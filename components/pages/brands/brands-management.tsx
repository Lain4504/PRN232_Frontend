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
      <div className="h-12 w-64 bg-slate-50 dark:bg-slate-900 rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3].map(i => <div key={i} className="h-48 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800" />)}
      </div>
    </div>
  )

  return (
    <div className="space-y-8 md:space-y-12 pb-10 md:pb-20 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 border-b border-slate-100 dark:border-slate-800 pb-6 md:pb-12">
        <div className="space-y-3 md:space-y-4 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
              <Target className="size-4" />
            </div>
            <span className="text-[9px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Quản trị danh tính</span>
          </div>
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight md:leading-none uppercase">
            Quản lý Thương hiệu
          </h1>
          <p className="text-sm md:text-lg text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto md:mx-0">
            Thiết lập và quản lý hệ sinh thái thương hiệu của bạn.
          </p>
        </div>

        <div className="w-full md:w-auto">
          <BrandModal mode="create" onSuccess={refetchBrands}>
            <Button className="h-12 md:h-14 w-full md:px-8 rounded-xl md:rounded-2xl bg-slate-900 dark:bg-primary hover:bg-slate-800 dark:hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[9px] md:text-[10px] shadow-2xl shadow-slate-200 dark:shadow-primary/20 transition-all hover:-translate-y-1">
              <Plus className="mr-2 md:mr-3 h-4 w-4" />
              Thêm thương hiệu
            </Button>
          </BrandModal>
        </div>
      </div>


      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 dark:text-slate-600 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors" />
          <Input
            placeholder="Tìm kiếm thương hiệu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-10 md:h-12 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 rounded-xl md:rounded-2xl shadow-sm focus-visible:ring-slate-100 dark:focus-visible:ring-slate-800 font-medium transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
          />
        </div>

        {teams.length > 0 && (
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-1.5 md:p-2 rounded-xl md:rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all focus-within:ring-2 focus-within:ring-slate-100 dark:focus-within:ring-slate-800 w-full sm:w-auto">
            <div className="size-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
              <Filter className="size-3.5" />
            </div>
            <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
              <SelectTrigger className="w-full sm:w-[180px] border-none focus:ring-0 font-bold text-[10px] md:text-xs uppercase tracking-widest h-8 bg-transparent text-slate-900 dark:text-white">
                <SelectValue placeholder="Tất cả đội nhóm" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-2xl p-1 bg-white dark:bg-slate-900">
                <SelectItem value="all" className="rounded-xl">Tất cả đội nhóm</SelectItem>
                {teams.map(team => (
                  <SelectItem key={team.id} value={team.id} className="rounded-xl">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
          {filteredBrands.map((brand) => (
            <Card key={brand.id} className="group relative overflow-hidden rounded-2xl md:rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50/30 dark:hover:bg-slate-800 transition-all duration-300 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-black/50 hover:-translate-y-2">
              <CardHeader className="p-6 md:p-8 pb-3 md:pb-4 flex flex-row items-start justify-between">
                <div className="relative">
                  <div className="absolute -inset-2 bg-slate-100 dark:bg-slate-800 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Avatar className="size-12 md:size-16 rounded-xl md:rounded-[1.25rem] border-2 border-white dark:border-slate-800 bg-slate-50 dark:bg-slate-800 shadow-sm relative z-10 transition-transform group-hover:scale-110">
                    <AvatarImage src={brand.logo_url || (brand as Brand).logoUrl} className="object-cover" />
                    <AvatarFallback className="bg-slate-900 dark:bg-primary text-white text-lg font-black">
                      {brand.name.substring(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm opacity-100 md:opacity-0 group-hover:opacity-100 transition-all text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[180px] md:w-[200px] rounded-2xl border-slate-100 dark:border-slate-800 p-2 shadow-2xl bg-white dark:bg-slate-900">
                    <DropdownMenuItem onClick={() => window.location.href = `/dashboard/brands/${brand.id}/products`} className="rounded-xl py-2 md:py-3 font-bold text-[10px] md:text-xs uppercase tracking-widest text-slate-700 dark:text-slate-300">
                      <Package className="mr-3 h-4 w-4 opacity-40" />
                      Sản phẩm
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.location.href = `/dashboard/brands/${brand.id}/contents`} className="rounded-xl py-2 md:py-3 font-bold text-[10px] md:text-xs uppercase tracking-widest text-slate-700 dark:text-slate-300">
                      <FileText className="mr-3 h-4 w-4 opacity-40" />
                      Nội dung
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-50 dark:bg-slate-800 mx-2 my-2" />
                    <DropdownMenuItem onClick={() => handleEditBrand(brand)} className="rounded-xl py-2 md:py-3 font-bold text-[10px] md:text-xs uppercase tracking-widest text-slate-700 dark:text-slate-300">
                      <Settings className="mr-3 h-4 w-4 opacity-40" />
                      Cấu hình
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDeleteBrandId(brand.id)} className="rounded-xl py-2 md:py-3 font-bold text-[10px] md:text-xs uppercase tracking-widest text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10">
                      <Trash2 className="mr-3 h-4 w-4 opacity-40" />
                      Xóa bỏ
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>

              <CardContent className="p-6 md:p-8 pt-0 space-y-4 md:space-y-6">
                <div>
                  <h3 className="font-black text-lg md:text-xl text-slate-900 dark:text-white truncate" title={brand.name}>
                    {brand.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-none text-[8px] md:text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">
                      {brand.productsCount || 0} SP
                    </Badge>
                    <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-none text-[8px] md:text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">
                      {brand.contentsCount || 0} NỘI DUNG
                    </Badge>
                  </div>
                </div>

                <p className="text-xs md:text-sm font-medium text-slate-400 dark:text-slate-500 line-clamp-2 min-h-[3em] leading-relaxed">
                  {brand.description || "Chưa có mô tả cho thương hiệu này."}
                </p>

                <div className="pt-4 md:pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[9px] md:text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest">
                    ID: {brand.id.substring(0, 8)}...
                  </span>
                  <Button variant="ghost" className="size-7 md:size-8 p-0 rounded-lg text-slate-200 dark:text-slate-700 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    <ChevronRight className="size-4 md:size-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      ) : (
        <Card className="rounded-3xl border-slate-100 dark:border-slate-800 border-dashed bg-slate-50/50 dark:bg-slate-900/50">
          <CardContent className="flex flex-col items-center justify-center py-24 text-center">
            <div className="size-20 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center mb-8 shadow-sm border border-slate-100 dark:border-slate-800">
              <Building2 className="h-10 w-10 text-slate-200 dark:text-slate-700" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-widest">Chưa có thương hiệu</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mb-10 leading-relaxed">
              {searchTerm ? "Không tìm thấy kết quả phù hợp với từ khóa của bạn." : "Bắt đầu bằng hành động khởi tạo thương hiệu đầu tiên trong ma trận hồ sơ của bạn."}
            </p>
            {!searchTerm && (
              <BrandModal mode="create" onSuccess={refetchBrands}>
                <Button className="h-14 px-10 rounded-2xl bg-slate-900 dark:bg-primary hover:bg-slate-800 dark:hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-slate-200 dark:shadow-primary/20 transition-all hover:-translate-y-1">
                  <Plus className="mr-3 h-5 w-5" />
                  Triển khai thương hiệu
                </Button>
              </BrandModal>
            )}
          </CardContent>
        </Card>
      )}

      <BrandModal mode="edit" brand={editingBrand || undefined} open={isEditModalOpen} onOpenChange={setIsEditModalOpen} onSuccess={refetchBrands} />

      <AlertDialog open={!!deleteBrandId} onOpenChange={() => setDeleteBrandId(null)}>
        <AlertDialogContent className="rounded-3xl p-10 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-widest">Xóa thương hiệu?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed pt-2">
              Bạn có chắc chắn muốn xóa thương hiệu này? Hành động này không thể hoàn tác và tất cả dữ liệu liên quan sẽ bị mất.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-4">
            <AlertDialogCancel className="h-12 rounded-xl font-bold uppercase tracking-widest text-xs border-slate-100 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800">Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteBrand}
              className="h-12 rounded-xl font-bold uppercase tracking-widest text-xs bg-rose-500 hover:bg-rose-600 text-white"
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

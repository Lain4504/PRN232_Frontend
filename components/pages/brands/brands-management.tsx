"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTranslation } from "react-i18next"
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
import { enUS, vi as viLocale } from "date-fns/locale"
import { cn } from "@/lib/utils"

export function BrandsManagement() {
  const { t, i18n } = useTranslation("common")
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
      toast.success("Đã xóa thương hiệu")
      setDeleteBrandId(null)
    } catch {
      toast.error("Lễ khi xóa thương hiệu")
    }
  }

  if (loading) return (
    <div className="space-y-10 animate-pulse">
      <div className="h-12 w-64 bg-slate-50 rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3].map(i => <div key={i} className="h-48 bg-slate-50 rounded-[2rem] border border-slate-100" />)}
      </div>
    </div>
  )

  return (
    <div className="space-y-12 pb-20 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-100 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
              <Target className="size-4" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Quản trị danh tính</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-none">
            {t("brands.title")}
          </h1>
          <p className="text-lg text-slate-500 font-medium max-w-xl">
            Thiết lập và quản lý hệ sinh thái thương hiệu của bạn tại một nơi duy nhất.
          </p>
        </div>

        <BrandModal mode="create" onSuccess={refetchBrands}>
          <Button className="h-14 px-8 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-slate-200 transition-all hover:-translate-y-1">
            <Plus className="mr-3 h-4 w-4" />
            {t("brands.createBrand")}
          </Button>
        </BrandModal>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
          <Input
            placeholder={t("brands.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 bg-white border-slate-100 rounded-2xl shadow-sm focus-visible:ring-slate-100 font-medium transition-all"
          />
        </div>

        {teams.length > 0 && (
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm transition-all focus-within:ring-2 focus-within:ring-slate-100 w-full sm:w-auto">
            <div className="size-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
              <Filter className="size-3.5" />
            </div>
            <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
              <SelectTrigger className="w-[180px] border-none focus:ring-0 font-bold text-xs uppercase tracking-widest h-8">
                <SelectValue placeholder={t("brands.allTeams")} />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-1">
                <SelectItem value="all" className="rounded-xl">{t("brands.allTeams")}</SelectItem>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredBrands.map((brand) => (
            <Card key={brand.id} className="group relative overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white hover:bg-slate-50/30 transition-all duration-300 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-2">
              <CardHeader className="p-8 pb-4 flex flex-row items-start justify-between">
                <div className="relative">
                  <div className="absolute -inset-2 bg-slate-100 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Avatar className="size-16 rounded-[1.25rem] border-2 border-white bg-slate-50 shadow-sm relative z-10 transition-transform group-hover:scale-110">
                    <AvatarImage src={brand.logo_url || (brand as Brand).logoUrl} className="object-cover" />
                    <AvatarFallback className="bg-slate-900 text-white text-xl font-black">
                      {brand.name.substring(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white hover:shadow-sm opacity-0 group-hover:opacity-100 transition-all">
                      <MoreVertical className="h-4 w-4 text-slate-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px] rounded-2xl border-slate-100 p-2 shadow-2xl">
                    <DropdownMenuItem onClick={() => window.location.href = `/dashboard/brands/${brand.id}/products`} className="rounded-xl py-3 font-bold text-xs uppercase tracking-widest">
                      <Package className="mr-3 h-4 w-4 opacity-40" />
                      Sản phẩm
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.location.href = `/dashboard/brands/${brand.id}/contents`} className="rounded-xl py-3 font-bold text-xs uppercase tracking-widest">
                      <FileText className="mr-3 h-4 w-4 opacity-40" />
                      Nội dung
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-50 mx-2 my-2" />
                    <DropdownMenuItem onClick={() => handleEditBrand(brand)} className="rounded-xl py-3 font-bold text-xs uppercase tracking-widest">
                      <Settings className="mr-3 h-4 w-4 opacity-40" />
                      Cấu hình
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDeleteBrandId(brand.id)} className="rounded-xl py-3 font-bold text-xs uppercase tracking-widest text-rose-500 hover:text-rose-600 hover:bg-rose-50">
                      <Trash2 className="mr-3 h-4 w-4 opacity-40" />
                      Xóa bỏ
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>

              <CardContent className="p-8 pt-0 space-y-6">
                <div>
                  <h3 className="font-black text-xl text-slate-900 truncate" title={brand.name}>
                    {brand.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-none text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">
                      {brand.productsCount || 0} SP
                    </Badge>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-none text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">
                      {brand.contentsCount || 0} Content
                    </Badge>
                  </div>
                </div>

                <p className="text-sm font-medium text-slate-400 line-clamp-2 min-h-[3em] leading-relaxed">
                  {brand.description || "Chưa có mô tả cho thương hiệu này."}
                </p>

                <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                    ID: {brand.id.substring(0, 8)}...
                  </span>
                  <Button variant="ghost" className="size-8 p-0 rounded-lg text-slate-200 group-hover:text-slate-900 transition-colors">
                    <ChevronRight className="size-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="rounded-[3rem] border-slate-100 border-dashed bg-slate-50/50">
          <CardContent className="flex flex-col items-center justify-center py-24 text-center">
            <div className="size-20 rounded-[2rem] bg-white flex items-center justify-center mb-8 shadow-sm border border-slate-100">
              <Building2 className="h-10 w-10 text-slate-200" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3 uppercase tracking-widest">{t("brands.noBrands")}</h3>
            <p className="text-slate-500 font-medium max-w-sm mb-10 leading-relaxed">
              {searchTerm ? "Không tìm thấy kết quả phù hợp với từ khóa của bạn." : "Bắt đầu bằng hành động khởi tạo thương hiệu đầu tiên trong ma trận hồ sơ của bạn."}
            </p>
            {!searchTerm && (
              <BrandModal mode="create" onSuccess={refetchBrands}>
                <Button className="h-14 px-10 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-slate-200 transition-all hover:-translate-y-1">
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
        <AlertDialogContent className="rounded-3xl p-10 border-slate-100">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black text-slate-900 uppercase tracking-widest">{t("brands.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-medium leading-relaxed pt-2">
              {t("brands.deleteDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-4">
            <AlertDialogCancel className="h-12 rounded-xl font-bold uppercase tracking-widest text-xs border-slate-100">{t("brands.cancel")}</AlertDialogCancel>
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

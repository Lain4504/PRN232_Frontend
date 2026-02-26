"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
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
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-muted rounded" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => <div key={i} className="h-48 bg-muted rounded-lg" />)}
      </div>
    </div>
  )

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-border/50 pb-6">
        <div className="space-y-1.5">
          <Badge variant="outline" className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest bg-primary/5 text-primary border-primary/20">
            Hệ sinh thái • Core Assets
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight italic uppercase">Quản lý Thương hiệu</h2>
          <p className="text-sm text-muted-foreground italic font-medium">
            Quản lý các thương hiệu và tài nguyên nội dung của bạn.
          </p>
        </div>
        <BrandModal mode="create" onSuccess={refetchBrands}>
          <Button className="h-11 rounded-md px-6 font-bold text-xs uppercase tracking-wider shadow-md">
            <Plus className="mr-2 h-4 w-4" />
            Thêm thương hiệu
          </Button>
        </BrandModal>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Tìm kiếm thương hiệu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 rounded-md border-border bg-card shadow-sm font-medium italic"
          />
        </div>

        {teams.length > 0 && (
          <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
            <SelectTrigger className="w-full sm:w-[220px] h-11 rounded-md border-border bg-card font-bold text-xs uppercase tracking-wider">
              <SelectValue placeholder="Tất cả đội nhóm" />
            </SelectTrigger>
            <SelectContent className="rounded-md border-border">
              <SelectItem value="all" className="font-medium">Tất cả đội nhóm</SelectItem>
              {teams.map(team => (
                <SelectItem key={team.id} value={team.id} className="font-medium">
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {filteredBrands.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredBrands.map((brand) => (
            <Card key={brand.id} className="rounded-lg border border-border bg-card shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6 bg-muted/20 border-b border-border/50">
                <Avatar className="h-12 w-12 rounded-lg border-2 border-background shadow-sm">
                  <AvatarImage src={brand.logo_url || brand.logoUrl} alt={brand.name} className="object-cover" />
                  <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold">{brand.name.substring(0, 1).toUpperCase()}</AvatarFallback>
                </Avatar>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-background">
                      <MoreVertical className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-md border-border">
                    <DropdownMenuItem onClick={() => window.location.href = `/dashboard/brands/${brand.id}/products`} className="text-xs font-medium">
                      <Package className="mr-2 h-4 w-4" />
                      Danh mục sản phẩm
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.location.href = `/dashboard/brands/${brand.id}/contents`} className="text-xs font-medium">
                      <FileText className="mr-2 h-4 w-4" />
                      Kho nội dung
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleEditBrand(brand)} className="text-xs font-medium">
                      <Settings className="mr-2 h-4 w-4" />
                      Chỉnh sửa thương hiệu
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDeleteBrandId(brand.id)} className="text-xs font-medium text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Xóa thương hiệu
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-bold tracking-tight italic truncate" title={brand.name}>
                    {brand.name}
                  </CardTitle>
                  <CardDescription className="text-xs italic line-clamp-2 min-h-[3em] font-medium leading-relaxed">
                    {brand.description || "Chưa có mô tả cho thương hiệu này."}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Badge variant="outline" className="rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-emerald-500/5 text-emerald-600 border-emerald-500/20">{brand.productsCount || 0} Sản phẩm</Badge>
                  <Badge variant="outline" className="rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-blue-500/5 text-blue-600 border-blue-500/20">{brand.contentsCount || 0} Nội dung</Badge>
                </div>
              </CardContent>
              <CardFooter className="px-6 py-4 bg-muted/10 border-t border-border/50 flex justify-between items-center">
                <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest font-mono">ID: {brand.id.substring(0, 8)}</span>
                <Button variant="ghost" size="sm" onClick={() => window.location.href = `/dashboard/brands/${brand.id}/products`} className="h-7 px-2 text-[9px] font-bold uppercase tracking-widest text-primary hover:bg-primary/5 transition-colors">
                  Chi tiết
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center py-24 text-center border-dashed rounded-lg bg-muted/10 border-muted-foreground/20">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-6 shadow-inner">
            <Building2 className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <h3 className="text-lg font-bold italic uppercase tracking-tight">Chưa có thương hiệu</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-8 italic font-medium">
            {searchTerm ? "Không tìm thấy kết quả phù hợp với tìm kiếm của bạn." : "Bắt đầu bằng cách thêm thương hiệu đầu tiên của bạn để quản lý chiến dịch AI."}
          </p>
          {!searchTerm && (
            <BrandModal mode="create" onSuccess={refetchBrands}>
              <Button className="rounded-md font-bold px-8 shadow-lg">
                <Plus className="mr-2 h-4 w-4" />
                Thêm thương hiệu mới
              </Button>
            </BrandModal>
          )}
        </Card>
      )}

      <BrandModal mode="edit" brand={editingBrand || undefined} open={isEditModalOpen} onOpenChange={setIsEditModalOpen} onSuccess={refetchBrands} />

      <AlertDialog open={!!deleteBrandId} onOpenChange={() => setDeleteBrandId(null)}>
        <AlertDialogContent className="rounded-lg border-border bg-popover p-8 max-w-md shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold tracking-tight italic uppercase">Xác nhận xóa thương hiệu?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm italic font-medium leading-relaxed">
              Bạn có chắc chắn muốn xóa thương hiệu này? Hành động này sẽ <span className="text-destructive font-bold underline">xóa sạch</span> dữ liệu và tất cả nội dung liên quan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="rounded-md font-bold">Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteBrand}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md font-bold"
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

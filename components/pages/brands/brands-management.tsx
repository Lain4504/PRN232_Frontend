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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Quản lý Thương hiệu</h2>
          <p className="text-muted-foreground">
            Thiết lập và quản lý hệ sinh thái thương hiệu của bạn.
          </p>
        </div>
        <BrandModal mode="create" onSuccess={refetchBrands}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Thêm thương hiệu
          </Button>
        </BrandModal>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm thương hiệu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        {teams.length > 0 && (
           <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Tất cả đội nhóm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả đội nhóm</SelectItem>
              {teams.map(team => (
                <SelectItem key={team.id} value={team.id}>
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
            <Card key={brand.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <Avatar className="h-12 w-12 rounded-lg">
                  <AvatarImage src={brand.logo_url || brand.logoUrl} alt={brand.name} />
                  <AvatarFallback className="rounded-lg">{brand.name.substring(0, 1).toUpperCase()}</AvatarFallback>
                </Avatar>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => window.location.href = `/dashboard/brands/${brand.id}/products`}>
                      <Package className="mr-2 h-4 w-4" />
                      Sản phẩm
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.location.href = `/dashboard/brands/${brand.id}/contents`}>
                      <FileText className="mr-2 h-4 w-4" />
                      Nội dung
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleEditBrand(brand)}>
                      <Settings className="mr-2 h-4 w-4" />
                      Cấu hình
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDeleteBrandId(brand.id)} className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Xóa bỏ
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="space-y-2">
                <CardTitle className="truncate" title={brand.name}>
                  {brand.name}
                </CardTitle>
                <CardDescription className="line-clamp-2 min-h-[2.5em]">
                  {brand.description || "Chưa có mô tả cho thương hiệu này."}
                </CardDescription>
                <div className="flex gap-2 pt-2">
                  <Badge variant="secondary">{brand.productsCount || 0} SP</Badge>
                  <Badge variant="secondary">{brand.contentsCount || 0} Nội dung</Badge>
                </div>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground border-t pt-4 mt-2">
                ID: {brand.id.substring(0, 8)}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center py-12 text-center border-dashed">
          <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <Building2 className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">Chưa có thương hiệu</h3>
          <p className="text-muted-foreground max-w-sm mb-6">
            {searchTerm ? "Không tìm thấy kết quả phù hợp." : "Bắt đầu bằng hành động khởi tạo thương hiệu đầu tiên."}
          </p>
          {!searchTerm && (
            <BrandModal mode="create" onSuccess={refetchBrands}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Triển khai thương hiệu
              </Button>
            </BrandModal>
          )}
        </Card>
      )}

      <BrandModal mode="edit" brand={editingBrand || undefined} open={isEditModalOpen} onOpenChange={setIsEditModalOpen} onSuccess={refetchBrands} />

      <AlertDialog open={!!deleteBrandId} onOpenChange={() => setDeleteBrandId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa thương hiệu?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa thương hiệu này? Hành động này không thể hoàn tác và tất cả dữ liệu liên quan sẽ bị mất.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteBrand}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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

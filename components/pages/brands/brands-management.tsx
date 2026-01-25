"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "react-i18next";
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
  Plus,
  Search,
  MoreHorizontal,
  Package,
  FileText,
  Trash2,
  Building2,
  Settings,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Brand } from "@/lib/types/aisam-types";
import { toast } from "sonner";
import { useBrands, useDeleteBrand } from "@/hooks/use-brands";
import { useTeamsByVendor } from "@/hooks/use-teams";
import { useProfile } from "@/lib/contexts/profile-context";
import { getActiveTeamId, setActiveTeamId, clearActiveTeamId } from "@/lib/utils/profile-utils";
import { BrandModal } from "@/components/brands/brand-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export function BrandsManagement() {
  const { t } = useTranslation("common");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteBrandId, setDeleteBrandId] = useState<string | null>(null);
  const { activeProfileId } = useProfile();
  const [selectedTeamId, setSelectedTeamId] = useState<string>(() => getActiveTeamId() || "all");

  // Sync selectedTeamId to localStorage
  React.useEffect(() => {
    if (selectedTeamId === "all") {
      clearActiveTeamId();
    } else {
      setActiveTeamId(selectedTeamId);
    }
  }, [selectedTeamId]);

  const [pageSize, setPageSize] = useState(10);

  const { data: brands = [], isLoading: loading, refetch: refetchBrands } = useBrands({
    teamId: selectedTeamId === "all" ? undefined : selectedTeamId
  });

  const { data: teams = [] } = useTeamsByVendor(activeProfileId || undefined);
  const deleteBrandMutation = useDeleteBrand();

  const safeBrands = Array.isArray(brands) ? brands : [];
  const filteredBrands = safeBrands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brand.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditBrand = (brand: Brand) => {
    setEditingBrand(brand);
    setIsEditModalOpen(true);
  };

  const confirmDeleteBrand = async () => {
    if (!deleteBrandId) return;
    try {
      await deleteBrandMutation.mutateAsync(deleteBrandId);
      toast.success(t("brands.deleteSuccess", "Đã xóa thương hiệu"));
      setDeleteBrandId(null);
    } catch {
      toast.error(t("brands.deleteError", "Lỗi khi xóa thương hiệu"));
    }
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="h-8 w-48 bg-muted rounded animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 font-fira-sans animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t("brands.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("brands.description")}
          </p>
        </div>
        <BrandModal mode="create" onSuccess={refetchBrands}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t("brands.createBrand")}
          </Button>
        </BrandModal>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("brands.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        {teams.length > 0 && (
          <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
            <SelectTrigger className="w-full sm:w-[200px] h-9">
              <SelectValue placeholder="All Teams" />
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

      {/* Content */}
      {filteredBrands.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredBrands.map((brand) => (
            <Card key={brand.id} className="group hover:shadow-md transition-all duration-200">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 rounded-lg border bg-muted">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <AvatarImage src={brand.logo_url || (brand as any).logoUrl} className="object-cover" />
                    <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                      {brand.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid gap-0.5">
                    <h3 className="font-semibold text-sm leading-none truncate max-w-[150px]" title={brand.name}>
                      {brand.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {brand.productsCount || 0} {t("brands.manageProducts")} • {brand.contentsCount || 0} {t("brands.manageContents")}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[160px]">
                    <DropdownMenuItem onClick={() => window.open(`/dashboard/brands/${brand.id}/products`, '_self')}>
                      <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                      {t("brands.manageProducts")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.open(`/dashboard/brands/${brand.id}/contents`, '_self')}>
                      <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                      {t("brands.manageContents")}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleEditBrand(brand)}>
                      <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                      {t("brands.configure")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDeleteBrandId(brand.id)} className="text-destructive focus:text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t("brands.delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="p-4 pt-2 space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5em]">
                  {brand.description || t("brands.noDescription", "Không có mô tả")}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                  <span>{t("brands.created")}: {format(new Date(brand.createdAt || new Date()), 'dd/MM/yyyy')}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed rounded-lg bg-muted/5">
          <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-4">
            <Building2 className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">{t("brands.noBrands")}</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-6">
            {searchTerm ? t("brands.noResults", "Không tìm thấy kết quả phù hợp") : t("brands.noBrandsDescription")}
          </p>
          {!searchTerm && (
            <BrandModal mode="create" onSuccess={refetchBrands}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t("brands.createBrand")}
              </Button>
            </BrandModal>
          )}
        </div>
      )}

      <BrandModal mode="edit" brand={editingBrand || undefined} open={isEditModalOpen} onOpenChange={setIsEditModalOpen} onSuccess={refetchBrands} />

      <AlertDialog open={!!deleteBrandId} onOpenChange={() => setDeleteBrandId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("brands.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("brands.deleteDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("brands.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteBrand}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteBrandMutation.isPending}
            >
              {deleteBrandMutation.isPending ? t("common.processing", "Đang xử lý...") : t("brands.confirmDelete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

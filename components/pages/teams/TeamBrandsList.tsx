"use client";

import React, { useState } from "react";
import {
  MoreVertical,
  Trash2,
  ExternalLink,
  Plus,
  Search,
  AlertTriangle,
} from "lucide-react";
import { Brand } from "@/lib/types/omniadly-types";
import { useBrandsByTeam } from "@/hooks/use-brands";
import { useUnassignBrand } from "@/hooks/use-teams";
import { useRouter } from "next/navigation";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

interface TeamBrandsListProps {
  teamId: string;
  canManage?: boolean;
  onAddBrand?: () => void;
}

export function TeamBrandsList({
  teamId,
  canManage,
  onAddBrand,
}: TeamBrandsListProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [unassigningBrand, setUnassigningBrand] = useState<Brand | null>(null);

  const { data: brands = [], isLoading } = useBrandsByTeam(teamId);
  const unassignBrandMutation = useUnassignBrand(teamId);

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const confirmUnassignBrand = () => {
    if (!unassigningBrand) return;
    unassignBrandMutation.mutate(
      { brandId: unassigningBrand.id },
      {
        onSuccess: () => {
          setUnassigningBrand(null);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 rounded-lg bg-muted border border-border" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="relative flex-1 w-full sm:max-w-md group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
          <Input
            placeholder="Tìm kiếm thương hiệu nội bộ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 bg-card border-border rounded-md shadow-sm focus-visible:ring-primary font-medium transition-all text-foreground"
          />
        </div>
        {canManage && (
          <Button
            onClick={onAddBrand}
            className="h-10 px-6 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-sm transition-all shrink-0 w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Gán thương hiệu
          </Button>
        )}
      </div>

      {filteredBrands.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBrands.map((brand) => (
            <Card
              key={brand.id}
              className="group relative overflow-hidden border-border bg-card hover:border-primary/50 transition-all rounded-lg shadow-sm hover:shadow-md"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <Avatar className="size-14 rounded-md border border-border shadow-sm group-hover:scale-105 transition-transform duration-500">
                    <AvatarImage src={brand.logoUrl} alt={brand.name} />
                    <AvatarFallback className="bg-muted text-muted-foreground font-bold text-lg">
                      {brand.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  {canManage && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-md hover:bg-muted"
                        >
                          <MoreVertical className="size-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="rounded-lg border-border shadow-lg p-1 min-w-[160px]"
                      >
                        <DropdownMenuItem
                          onClick={() => router.push(`/dashboard/brands/${brand.id}`)}
                          className="rounded-md h-10 font-medium text-sm focus:bg-accent cursor-pointer"
                        >
                          <ExternalLink className="mr-2 size-3.5 text-muted-foreground" />
                          Chi tiết
                        </DropdownMenuItem>
                        political
                        <DropdownMenuItem
                          onClick={() => setUnassigningBrand(brand)}
                          className="rounded-md h-10 font-medium text-sm focus:bg-destructive/10 text-destructive focus:text-destructive cursor-pointer"
                        >
                          <Trash2 className="mr-2 size-3.5" />
                          Gỡ quyền
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">
                      {brand.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-muted text-muted-foreground border-none text-[10px] font-semibold px-2 py-0.5 rounded-sm">ID: {brand.id.slice(0, 8)}</Badge>
                    </div>
                  </div>

                  {brand.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-medium">
                      {brand.description}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center border border-dashed border-border rounded-lg bg-muted/30">
          <div className="size-16 rounded-md bg-card flex items-center justify-center mb-6 shadow-sm border border-border">
            <Search className="size-8 text-muted-foreground/30" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">
            {searchTerm ? 'Không tìm thấy kết quả' : 'Danh sách trống'}
          </h3>
          <p className="text-muted-foreground font-medium max-w-sm mb-8 leading-relaxed text-sm italic">
            {searchTerm ? 'Thử điều chỉnh từ khóa tìm kiếm của bạn.' : 'Bắt đầu gán thương hiệu đầu tiên cho đội ngũ này.'}
          </p>
          {canManage && !searchTerm && (
            <Button onClick={onAddBrand} variant="outline" className="h-10 px-8 rounded-md border-border font-semibold text-sm text-muted-foreground hover:bg-card">
              Gán ngay bây giờ
            </Button>
          )}
        </div>
      )}

      <AlertDialog open={!!unassigningBrand} onOpenChange={() => setUnassigningBrand(null)}>
        <AlertDialogContent className="rounded-md max-w-md border-border bg-popover">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold tracking-tight text-foreground">Gỡ thương hiệu?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium text-muted-foreground leading-relaxed mt-2">
              Bạn có chắc chắn muốn gỡ <strong>{unassigningBrand?.name}</strong> khỏi đội ngũ này không?
              Dữ liệu vẫn được bảo toàn nhưng nhóm sẽ mất quyền truy cập.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 flex items-center justify-end gap-3">
            <AlertDialogCancel className="rounded-md h-10 font-medium text-sm bg-muted border-none text-muted-foreground hover:bg-muted/80">Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmUnassignBrand}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md h-10 font-semibold text-sm border-none shadow-sm"
              disabled={unassignBrandMutation.isPending}
            >
              {unassignBrandMutation.isPending ? "Đang xử lý..." : "Xác nhận gỡ"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

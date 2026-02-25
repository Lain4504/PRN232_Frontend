"use client";

import React, { useState } from "react";
import {
  MoreVertical,
  Trash2,
  ExternalLink,
  Plus,
  Search,
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
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm thương hiệu nội bộ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        {canManage && (
          <Button onClick={onAddBrand} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Gán thương hiệu
          </Button>
        )}
      </div>

      {filteredBrands.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBrands.map((brand) => (
            <Card key={brand.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <Avatar className="h-12 w-12 rounded-lg border">
                    <AvatarImage src={brand.logoUrl} alt={brand.name} />
                    <AvatarFallback className="rounded-lg">
                      {brand.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  {canManage && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/brands/${brand.id}`)}>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setUnassigningBrand(brand)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Gỡ quyền
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="space-y-1">
                    <h3 className="font-semibold truncate" title={brand.name}>
                      {brand.name}
                    </h3>
                    <Badge variant="secondary" className="font-normal text-xs">
                      ID: {brand.id.slice(0, 8)}
                    </Badge>
                  </div>

                  {brand.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {brand.description}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center border-dashed rounded-lg border bg-muted/30">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">
            {searchTerm ? 'Không tìm thấy kết quả' : 'Danh sách trống'}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            {searchTerm ? 'Thử điều chỉnh từ khóa tìm kiếm của bạn.' : 'Bắt đầu gán thương hiệu đầu tiên cho đội ngũ này.'}
          </p>
          {canManage && !searchTerm && (
            <Button onClick={onAddBrand} variant="outline">
              Gán ngay bây giờ
            </Button>
          )}
        </div>
      )}

      <AlertDialog open={!!unassigningBrand} onOpenChange={() => setUnassigningBrand(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Gỡ thương hiệu?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn gỡ <strong>{unassigningBrand?.name}</strong> khỏi đội ngũ này không?
              Dữ liệu vẫn được bảo toàn nhưng nhóm sẽ mất quyền truy cập.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmUnassignBrand}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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

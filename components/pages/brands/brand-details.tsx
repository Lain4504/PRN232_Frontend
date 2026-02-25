"use client";

import React, { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  Target,
  ArrowLeft,
  Settings,
  Package,
  FileText,
  Users,
  Lightbulb,
  Clock,
} from "lucide-react";
import { Brand } from "@/lib/types/omniadly-types";
import { toast } from "sonner";
import { useBrand } from "@/hooks/use-brands";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandModal } from "@/components/brands/brand-modal";
import { format } from "date-fns";

interface BrandDetailsProps {
  brandId: string;
}

export function BrandDetails({ brandId }: BrandDetailsProps) {

  const router = useRouter();
  const { data: brand, isLoading: loading, error } = useBrand(brandId);

  useEffect(() => {
    if (error) {
      toast.error("Không tìm thấy thương hiệu");
      router.push("/dashboard/brands");
    }
  }, [error, router]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="h-8 w-32 bg-muted rounded animate-pulse" />
        <div className="h-48 bg-muted rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-muted rounded-xl animate-pulse" />
          <div className="h-64 bg-muted rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!brand) return null;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 font-fira-sans animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="h-8 w-8 p-0 rounded-md"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Quay lại</span>
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{brand.name}</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Chi tiết thương hiệu</p>
          </div>
        </div>
        <BrandModal mode="edit" brand={brand} onSuccess={() => window.location.reload()}>
          <Button variant="outline" size="sm" className="rounded-md font-bold uppercase tracking-widest text-[10px] h-9">
            <Settings className="mr-2 h-3.5 w-3.5" />
            Thiết lập
          </Button>
        </BrandModal>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Brand Overview */}
          <Card className="border shadow-sm rounded-lg">
            <CardHeader className="flex flex-row items-center gap-4 pb-4">
              <Avatar className="h-14 w-14 rounded-md border border-border bg-muted shadow-sm">
                <AvatarImage src={brand.logo_url || (brand as { logoUrl?: string }).logoUrl} alt={brand.name} className="object-cover" />
                <AvatarFallback className="rounded-md bg-primary text-primary-foreground">
                  <Target className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <CardTitle className="text-lg font-bold">{brand.name}</CardTitle>
                <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{format(new Date(brand.createdAt || new Date()), 'dd.MM.yyyy')}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              {brand.description && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/70">Mô tả</h3>
                  <p className="text-foreground leading-relaxed">{brand.description}</p>
                </div>
              )}

              {brand.slogan && (
                <div className="p-4 bg-muted/40 rounded-lg border border-dashed">
                  <h3 className="text-xs font-bold flex items-center gap-2 text-primary mb-2 uppercase tracking-widest">
                    <Lightbulb className="h-3 w-3" />
                    Slogan
                  </h3>
                  <p className="italic text-foreground/80">&ldquo;{brand.slogan}&rdquo;</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Brand Strategy */}
          {brand.target_audience && (
            <Card className="border shadow-sm">
              <CardHeader className="pb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground/70">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Chiến lược
                </div>
              </CardHeader>
              <CardContent className="space-y-6">

                {brand.target_audience && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold">Khách hàng mục tiêu</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{brand.target_audience}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-8">
          {/* Quick Actions */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Thao tác nhanh</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Button variant="outline" asChild className="h-auto p-4 justify-start text-left hover:bg-primary/5 hover:border-primary/20 transition-all">
                <Link href={`/dashboard/brands/${brand.id}/products`}>
                  <div className="flex items-start gap-3">
                    <div className="size-8 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center shrink-0">
                      <Package className="h-4 w-4" />
                    </div>
                    <div className="grid gap-0.5">
                      <span className="font-semibold text-sm">Sản phẩm</span>
                      <span className="text-xs text-muted-foreground">Quản lý danh sách sản phẩm và tư liệu hình ảnh</span>
                    </div>
                  </div>
                </Link>
              </Button>

              <Button variant="outline" asChild className="h-auto p-4 justify-start text-left hover:bg-primary/5 hover:border-primary/20 transition-all">
                <Link href={`/dashboard/brands/${brand.id}/contents`}>
                  <div className="flex items-start gap-3">
                    <div className="size-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="grid gap-0.5">
                      <span className="font-semibold text-sm">Nội dung</span>
                      <span className="text-xs text-muted-foreground">Xem và quản lý các bài nội dung đã tạo</span>
                    </div>
                  </div>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

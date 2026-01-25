"use client";

import React, { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "react-i18next";
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
import { Brand } from "@/lib/types/aisam-types";
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
  const { t } = useTranslation("common");
  const router = useRouter();
  const { data: brand, isLoading: loading, error } = useBrand(brandId);

  useEffect(() => {
    if (error) {
      toast.error(t("brands.noResults"));
      router.push("/dashboard/brands");
    }
  }, [error, router, t]);

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
            className="h-9 w-9 p-0 rounded-full"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">{t("brands.back")}</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{brand.name}</h1>
            <p className="text-sm text-muted-foreground">{t("brands.details")}</p>
          </div>
        </div>
        <BrandModal mode="edit" brand={brand} onSuccess={() => window.location.reload()}>
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            {t("brands.configure")}
          </Button>
        </BrandModal>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Brand Overview */}
          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center gap-4 pb-4">
              <Avatar className="h-16 w-16 rounded-xl border-2 border-background shadow-sm">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <AvatarImage src={brand.logo_url || (brand as any).logoUrl} alt={brand.name} className="object-cover" />
                <AvatarFallback className="rounded-xl bg-primary/10 text-primary">
                  <Target className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <CardTitle className="text-xl">{brand.name}</CardTitle>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{t("brands.created")}: {format(new Date(brand.createdAt || new Date()), 'dd/MM/yyyy')}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              {brand.description && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/70">{t("brands.brandDescription")}</h3>
                  <p className="text-foreground leading-relaxed">{brand.description}</p>
                </div>
              )}

              {brand.slogan && (
                <div className="p-4 bg-muted/40 rounded-lg border border-dashed">
                  <h3 className="text-xs font-bold flex items-center gap-2 text-primary mb-2 uppercase tracking-widest">
                    <Lightbulb className="h-3 w-3" />
                    {t("brands.slogan")}
                  </h3>
                  <p className="italic text-foreground/80">&ldquo;{brand.slogan}&rdquo;</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Brand Strategy */}
          {(brand.usp || brand.target_audience) && (
            <Card className="border shadow-sm">
              <CardHeader className="pb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground/70">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {t("brands.strategy")}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {brand.usp && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold">{t("brands.usp")}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{brand.usp}</p>
                  </div>
                )}

                {brand.target_audience && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold">{t("brands.targetAudience")}</h3>
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
              <CardTitle className="text-lg">{t("brands.quickActions")}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Button variant="outline" asChild className="h-auto p-4 justify-start text-left hover:bg-primary/5 hover:border-primary/20 transition-all">
                <Link href={`/dashboard/brands/${brand.id}/products`}>
                  <div className="flex items-start gap-3">
                    <div className="size-8 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center shrink-0">
                      <Package className="h-4 w-4" />
                    </div>
                    <div className="grid gap-0.5">
                      <span className="font-semibold text-sm">{t("brands.manageProducts")}</span>
                      <span className="text-xs text-muted-foreground">{t("products.description")}</span>
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
                      <span className="font-semibold text-sm">{t("brands.manageContents")}</span>
                      <span className="text-xs text-muted-foreground">{t("contents.description")}</span>
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
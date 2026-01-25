"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
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
  Target,
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  FileText,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { ActionsDropdown, ActionItem } from "@/components/ui/actions-dropdown";
import { Brand } from "@/lib/types/aisam-types";
import { toast } from "sonner";
import { useBrands, useDeleteBrand } from "@/hooks/use-brands";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { BrandModal } from "@/components/brands/brand-modal";
import { CustomTable } from "@/components/ui/custom-table";
import { ColumnDef } from "@tanstack/react-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


const createColumns = (
  handleEditBrand: (brand: Brand) => void,
  handleDeleteBrand: (brandId: string) => void,
  isDeleting: boolean
): ColumnDef<Brand>[] => [
    {
      accessorKey: "name",
      header: "Brand Architecture",
      cell: ({ row }) => {
        const brandData = row.original as Brand & { logo_url?: string; logoUrl?: string };
        const logo = brandData.logo_url || brandData.logoUrl;
        return (
          <div className="flex items-center gap-5 py-2">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-blue-500/50 rounded-2xl blur opacity-0 group-hover:opacity-25 transition duration-500" />
              <Avatar className="size-14 rounded-2xl border-2 bg-muted overflow-hidden shrink-0 relative">
                {logo ? (
                  <AvatarImage src={logo} className="object-cover" />
                ) : (
                  <AvatarFallback className="bg-primary/5 text-primary">
                    <Target className="size-6 opacity-30" />
                  </AvatarFallback>
                )}
              </Avatar>
            </div>
            <div>
              <div className="font-black text-foreground italic text-lg leading-tight uppercase tracking-tight">{row.getValue("name")}</div>
              <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-0.5">Primary Core Identity</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "description",
      header: "Strategic Directive",
      cell: ({ row }) => (
        <div className="max-w-[450px]">
          <p className="text-sm font-bold text-muted-foreground/80 line-clamp-2 leading-relaxed italic border-l-2 border-primary/20 pl-4">
            {row.getValue("description") || "No directive specified for this entity."}
          </p>
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right uppercase tracking-[0.2em] text-[10px]">Operations</div>,
      cell: ({ row }) => {
        const actions: ActionItem[] = [
          {
            label: "Product Matrix",
            icon: <Package className="size-4" />,
            onClick: () => window.open(`/dashboard/brands/${row.original.id}/products`, '_self'),
          },
          {
            label: "Content Forge",
            icon: <FileText className="size-4" />,
            onClick: () => window.open(`/dashboard/brands/${row.original.id}/contents`, '_self'),
          },
          {
            label: "Configure Identity",
            icon: <Edit className="size-4" />,
            onClick: () => handleEditBrand(row.original),
          },
          {
            label: "Purge Identity",
            icon: <Trash2 className="size-4" />,
            onClick: () => handleDeleteBrand(row.original.id),
            variant: "destructive",
            disabled: isDeleting,
          },
        ];

        return (
          <div className="flex justify-end pr-4">
            <ActionsDropdown actions={actions} disabled={isDeleting} />
          </div>
        );
      },
    },
  ];

export function BrandsManagement() {
  const { t } = useTranslation("common");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteBrandId, setDeleteBrandId] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState(10);

  const { data: brands = [], isLoading: loading, refetch: refetchBrands } = useBrands();
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
      toast.success("Brand purged from registry");
      setDeleteBrandId(null);
    } catch {
      toast.error("Purge sequence failed");
    }
  };

  const columns = createColumns(handleEditBrand, setDeleteBrandId, deleteBrandMutation.isPending);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-12 animate-pulse">
      <div className="h-8 w-64 bg-muted rounded-xl" />
      <div className="h-40 bg-muted rounded-3xl" />
      <div className="h-[600px] bg-muted rounded-3xl" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-12 font-fira-sans mb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div className="space-y-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink href="/dashboard" className="text-[10px] font-black uppercase">Dashboard</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage className="text-[10px] font-black uppercase text-primary">Identity Matrix</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="space-y-1">
            <h1 className="text-5xl font-black tracking-tighter text-foreground uppercase italic leading-none">
              {t("brands.title")}
            </h1>
            <p className="text-lg text-muted-foreground font-medium max-w-2xl leading-relaxed italic border-l-4 border-primary pl-6">
              {t("brands.description")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <BrandModal mode="create" onSuccess={refetchBrands}>
            <Button size="lg" className="rounded-xl h-16 px-10 font-black uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all bg-primary">
              <Plus className="mr-3 size-6" />
              {t("brands.createBrand")}
            </Button>
          </BrandModal>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 rounded-2xl border-2 bg-muted/10 backdrop-blur-md">
        <div className="relative w-full sm:w-[500px] group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder={t("brands.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background"
          />
        </div>

        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Visibility:</span>
          <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
            <SelectTrigger className="w-[140px] bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-2">
              {[10, 20, 50].map(s => <SelectItem key={s} value={String(s)} className="font-bold text-[10px] uppercase font-fira-sans">{s} Signals</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredBrands.length > 0 ? (
        <Card className="rounded-3xl border-2 bg-card/40 overflow-hidden shadow-2xl shadow-foreground/5 relative">
          <div className="absolute top-0 right-0 p-10 opacity-5 -rotate-12 transition-transform duration-1000">
            <Zap className="size-40 text-primary" />
          </div>
          <CustomTable
            columns={columns}
            data={filteredBrands}
            pageSize={pageSize}
            className="border-0 shadow-none bg-transparent"
            headerClassName="bg-muted/30 border-b py-6 px-10 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/70"
          />
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center py-40 px-6 text-center border-2 border-dashed rounded-3xl bg-muted/5 font-fira-sans">
          <div className="size-24 rounded-2xl bg-primary/5 flex items-center justify-center mb-10 text-primary border-2 border-primary/10 shadow-inner">
            <Target className="size-12" />
          </div>
          <div className="space-y-4 max-w-md">
            <h3 className="text-3xl font-black uppercase tracking-tight text-foreground italic underline decoration-primary decoration-4 underline-offset-8">
              {searchTerm ? 'Identity Not Found' : 'Pattern: NULL'}
            </h3>
            <p className="text-muted-foreground font-bold leading-relaxed italic opacity-80">
              {searchTerm
                ? "The specified descriptor does not match any known neural profiles in the current workspace."
                : "The identity matrix is empty. Deploy your first brand architecture to begin content synthesis."
              }
            </p>
          </div>
          {!searchTerm && (
            <div className="mt-12">
              <BrandModal mode="create" onSuccess={refetchBrands}>
                <Button size="lg" className="rounded-2xl h-16 px-10 font-black uppercase tracking-widest shadow-2xl shadow-primary/20">
                  <Plus className="mr-3 size-5" />
                  Launch Phase Alpha
                </Button>
              </BrandModal>
            </div>
          )}
        </div>
      )}

      <BrandModal mode="edit" brand={editingBrand || undefined} open={isEditModalOpen} onOpenChange={setIsEditModalOpen} onSuccess={refetchBrands} />

      <AlertDialog open={!!deleteBrandId} onOpenChange={() => setDeleteBrandId(null)}>
        <AlertDialogContent className="rounded-3xl border-2 bg-background/95 backdrop-blur-2xl p-10 max-w-md font-fira-sans border-destructive/20 shadow-2xl">
          <AlertDialogHeader className="space-y-6">
            <div className="size-20 rounded-3xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto border border-destructive/20 shadow-inner">
              <AlertTriangle className="size-10" />
            </div>
            <AlertDialogTitle className="text-3xl font-black tracking-tight text-center uppercase italic">Purge <span className="text-destructive">Identity</span>?</AlertDialogTitle>
            <AlertDialogDescription className="text-base font-bold text-muted-foreground/80 leading-relaxed text-center italic mt-2">
              This will permanently terminate the brand architecture and all associated neural patterns. This sequence is absolute.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-12 grid grid-cols-2 gap-6">
            <AlertDialogCancel className="rounded-2xl h-14 font-black uppercase tracking-widest text-[10px] border-2">Abort</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteBrand}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-2xl h-14 font-black uppercase tracking-widest text-[10px] border-none shadow-2xl shadow-destructive/30"
              disabled={deleteBrandMutation.isPending}
            >
              {deleteBrandMutation.isPending ? 'TERMINATING...' : 'CONFIRM PURGE'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

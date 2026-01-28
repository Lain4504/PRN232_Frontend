"use client"

import React, { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CustomTable } from '@/components/ui/custom-table'
import { ColumnDef } from '@tanstack/react-table'
import {
  Plus,
  Trash2,
  AlertTriangle,
  ExternalLink,
  Search,
  Target,
  Filter,
  Building2,
  ChevronRight
} from 'lucide-react'
import { ActionsDropdown, ActionItem } from '@/components/ui/actions-dropdown'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useBrandsByTeam } from '@/hooks/use-brands'
import { useUnassignBrand } from '@/hooks/use-teams'
import { toast } from 'sonner'
import { Brand } from '@/lib/types/omniadly-types'
import { cn } from "@/lib/utils"
import { useRouter } from 'next/navigation'

interface TeamBrandsListProps {
  teamId: string
  canManage?: boolean
  onAddBrand?: () => void
}

export function TeamBrandsList({ teamId, canManage = true, onAddBrand }: TeamBrandsListProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [unassigningBrand, setUnassigningBrand] = useState<Brand | null>(null);

  const { data: brands = [], isLoading } = useBrandsByTeam(teamId);
  const { mutateAsync: unassignBrand, isPending: unassigning } = useUnassignBrand(teamId);

  const columns = useMemo<ColumnDef<Brand>[]>(() => [
    {
      accessorKey: "name",
      header: "Thương hiệu",
      cell: ({ row }) => (
        <div
          className="flex items-center gap-6 py-4 cursor-pointer group/item"
          onClick={() => router.push(`/dashboard/brands/${row.original.id}`)}
        >
          <Avatar className="size-14 rounded-2xl border border-slate-200 shadow-sm ring-4 ring-slate-50 overflow-hidden transition-transform group-hover/item:scale-105">
            {row.original.logo_url ? (
              <AvatarImage src={row.original.logo_url} alt={row.getValue("name")} className="object-cover" />
            ) : (
              <AvatarFallback className="bg-slate-900 text-white font-black text-xl">
                {row.original.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="space-y-1">
            <div className="font-black text-slate-900 text-lg leading-none truncate max-w-[250px] group-hover/item:text-primary transition-colors">{row.getValue("name")}</div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-slate-50 text-slate-400 border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg">ID: {row.original.id.slice(0, 8)}</Badge>
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Ngày gán",
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as string;
        return (
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {date ? new Date(date).toLocaleDateString('vi-VN').replace(/\//g, '.') : '-'}
          </span>
        )
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Thao tác</div>,
      cell: ({ row }) => {
        const actions: ActionItem[] = [
          {
            label: "Xem chi tiết Brand",
            icon: <ExternalLink className="size-4" />,
            onClick: () => router.push(`/dashboard/brands/${row.original.id}`),
          },
        ];

        if (canManage) {
          actions.push({
            label: "Gỡ khỏi đội ngũ",
            icon: <Trash2 className="size-4" />,
            onClick: () => handleUnassignBrand(row.original),
            variant: "destructive" as const,
            disabled: unassigning,
          });
        }

        return (
          <div className="flex justify-end">
            <ActionsDropdown actions={actions} disabled={unassigning} />
          </div>
        )
      },
    },
  ], [canManage, unassigning, router]);

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brand.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUnassignBrand = (brand: Brand) => {
    setUnassigningBrand(brand);
  };

  const confirmUnassignBrand = async () => {
    if (!unassigningBrand) return;
    try {
      await unassignBrand({ brandId: unassigningBrand.id });
      toast.success(`Đã gỡ thương hiệu "${unassigningBrand.name}" khỏi đội ngũ thành công`);
      setUnassigningBrand(null);
    } catch (error) {
      toast.error('Lỗi khi gỡ thương hiệu');
    }
  };

  if (isLoading) return (
    <div className="space-y-8 animate-pulse">
      <div className="h-10 w-full bg-slate-50 rounded-xl" />
      <div className="h-64 w-full bg-slate-50 rounded-2xl border border-slate-100" />
    </div>
  )

  return (
    <div className="space-y-10">
      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
            <Input
              placeholder="Tìm kiếm thương hiệu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 bg-white border-slate-100 rounded-2xl shadow-sm focus-visible:ring-slate-100 font-medium transition-all"
            />
          </div>
          <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
            <div className="size-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
              <Filter className="size-3.5" />
            </div>
            <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
              <SelectTrigger className="w-[100px] border-none focus:ring-0 font-bold text-xs uppercase tracking-widest h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-1">
                {[5, 10, 20, 50].map((size) => (
                  <SelectItem key={size} value={String(size)} className="rounded-xl">Top {size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {canManage && (
          <Button onClick={onAddBrand} className="h-12 px-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-slate-200 transition-all hover:-translate-y-1">
            <Plus className="mr-3 h-4 w-4" />
            Gán thương hiệu mới
          </Button>
        )}
      </div>

      {/* Table Section */}
      {filteredBrands.length > 0 ? (
        <CustomTable
          columns={columns}
          data={filteredBrands}
          pageSize={pageSize}
          className="border-0 shadow-none bg-transparent"
          headerClassName="bg-slate-50/50 border-b border-slate-100 py-6 px-10 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400"
        />
      ) : (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center border border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
          <div className="size-16 rounded-2xl bg-white flex items-center justify-center mb-6 shadow-sm border border-slate-100">
            <Building2 className="size-8 text-slate-200" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-widest">
            {searchTerm ? 'Không tìm thấy kết quả' : 'Chưa có thương hiệu'}
          </h3>
          <p className="text-slate-500 font-medium max-w-sm mb-8 leading-relaxed text-xs italic">
            {searchTerm ? 'Thử điều chỉnh bộ lọc của bạn.' : 'Hãy gán thương hiệu đầu tiên cho nhóm này để bắt đầu cộng tác.'}
          </p>
        </div>
      )}

      {/* Unassign Confirmation */}
      <AlertDialog open={!!unassigningBrand} onOpenChange={() => setUnassigningBrand(null)}>
        <AlertDialogContent className="rounded-3xl border-slate-100 p-10 max-w-md shadow-2xl">
          <AlertDialogHeader className="space-y-6">
            <div className="size-20 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto border border-rose-100 shadow-sm">
              <AlertTriangle className="size-10" />
            </div>
            <AlertDialogTitle className="text-3xl font-black tracking-tight text-center uppercase text-slate-900">Gỡ thương hiệu?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium text-slate-500 leading-relaxed text-center italic mt-2">
              Bạn có chắc chắn muốn gỡ <strong>{unassigningBrand?.name}</strong> khỏi đội ngũ này?
              Thương hiệu dữ liệu vẫn tồn tại nhưng nhóm sẽ mất quyền truy cập.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-12 grid grid-cols-2 gap-4">
            <AlertDialogCancel className="rounded-xl h-12 font-black uppercase tracking-widest text-[10px] bg-slate-50 border-none">Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmUnassignBrand}
              className="bg-rose-500 text-white hover:bg-rose-600 rounded-xl h-12 font-black uppercase tracking-widest text-[10px] border-none shadow-lg shadow-rose-100"
              disabled={unassigning}
            >
              {unassigning ? "..." : "Xác nhận gỡ"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

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
    <div className="space-y-8 animate-pulse px-2">
      <div className="h-14 w-full bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl" />
      <div className="h-96 w-full bg-slate-50/50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800" />
    </div>
  )

  return (
    <div className="space-y-10">
      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 dark:text-slate-600 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors" />
            <Input
              placeholder="Tìm kiếm thương hiệu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm focus-visible:ring-slate-100 dark:focus-visible:ring-slate-800 font-medium transition-all text-slate-900 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="size-9 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
              <Filter className="size-4" />
            </div>
            <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
              <SelectTrigger className="w-[110px] border-none focus:ring-0 font-black text-[10px] uppercase tracking-widest h-9 text-slate-900 dark:text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-2xl p-1 bg-white dark:bg-slate-900">
                {[5, 10, 20, 50].map((size) => (
                  <SelectItem key={size} value={String(size)} className="rounded-xl font-black text-[10px] uppercase">TOP {size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {canManage && (
          <Button onClick={onAddBrand} className="h-12 px-8 rounded-2xl bg-slate-900 dark:bg-primary hover:bg-slate-800 dark:hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-slate-200 dark:shadow-primary/20 transition-all hover:-translate-y-1">
            <Plus className="mr-3 h-4 w-4" />
            Gắn thương hiệu mới
          </Button>
        )}
      </div>

      {/* Table Section */}
      {filteredBrands.length > 0 ? (
        <div className="rounded-3xl border border-slate-50 dark:border-slate-800 overflow-hidden shadow-xl shadow-slate-200/40 dark:shadow-black/40">
          <CustomTable
            columns={columns}
            data={filteredBrands}
            pageSize={pageSize}
            className="border-0 shadow-none bg-white dark:bg-slate-900"
            headerClassName="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 py-6 px-10 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500"
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 px-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] bg-slate-50/50 dark:bg-slate-900/30 transition-all duration-300">
          <div className="size-20 rounded-3xl bg-white dark:bg-slate-900 flex items-center justify-center mb-10 shadow-lg border border-slate-50 dark:border-slate-800">
            <Building2 className="size-10 text-slate-200 dark:text-slate-700" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tight">
            {searchTerm ? 'KHÔNG TÌM THẤY KẾT QUẢ' : 'CHƯA CÓ THƯƠNG HIỆU'}
          </h3>
          <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 max-w-sm mb-12 leading-relaxed uppercase tracking-tighter opacity-70">
            {searchTerm ? 'Thử điều chỉnh bộ lọc tìm kiếm của bạn để có kết quả chính xác hơn.' : 'Hãy bắt đầu bằng cách gán thương hiệu đầu tiên cho nhóm này để khai thác sức mạnh cộng tác.'}
          </p>
          {canManage && !searchTerm && (
            <Button onClick={onAddBrand} variant="outline" className="h-12 px-10 rounded-2xl border-slate-200 dark:border-slate-800 font-black uppercase tracking-widest text-[10px] text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800">
              Gán ngay bây giờ
            </Button>
          )}
        </div>
      )}

      {/* Unassign Confirmation */}
      <AlertDialog open={!!unassigningBrand} onOpenChange={() => setUnassigningBrand(null)}>
        <AlertDialogContent className="rounded-[2.5rem] border-slate-100 dark:border-slate-800 p-12 max-w-md shadow-3xl bg-white dark:bg-slate-900">
          <AlertDialogHeader className="space-y-8">
            <div className="size-24 rounded-[2rem] bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-rose-100 dark:border-rose-800 shadow-sm">
              <AlertTriangle className="size-12" />
            </div>
            <AlertDialogTitle className="text-3xl font-black tracking-tight text-center uppercase text-slate-900 dark:text-white leading-tight">Gỡ thương hiệu?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed text-center italic mt-4 px-2">
              Bạn có chắc chắn muốn gỡ <strong>{unassigningBrand?.name}</strong> khỏi đội ngũ này không?
              Dữ liệu vẫn được bảo toàn nhưng nhóm sẽ mất quyền truy cập.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-14 grid grid-cols-2 gap-4">
            <AlertDialogCancel className="rounded-2xl h-14 font-black uppercase tracking-widest text-[10px] bg-slate-50 dark:bg-slate-800 border-none text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmUnassignBrand}
              className="bg-rose-500 text-white hover:bg-rose-600 rounded-2xl h-14 font-black uppercase tracking-widest text-[10px] border-none shadow-2xl shadow-rose-200 dark:shadow-none"
              disabled={unassigning}
            >
              {unassigning ? "ĐANG XỬ LÝ..." : "XÁC NHẬN GỠ"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

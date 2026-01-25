"use client"

import React, { useState } from 'react'
import { useDeleteTeam } from '@/hooks/use-teams'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertTriangle, Trash2, X, AlertOctagon, ShieldAlert } from 'lucide-react'
import { cn } from "@/lib/utils"

interface TeamDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  teamId: string
  teamName: string
}

export function TeamDeleteDialog({
  open,
  onOpenChange,
  teamId,
  teamName
}: TeamDeleteDialogProps) {
  const [confirmText, setConfirmText] = useState('')
  const { mutateAsync: deleteTeam, isPending } = useDeleteTeam(teamId)

  const isConfirmValid = confirmText === teamName
  const isDisabled = !isConfirmValid || isPending

  const handleDelete = async () => {
    if (!isConfirmValid) return
    try {
      await deleteTeam()
      onOpenChange(false)
      setConfirmText('')
    } catch (error) { }
  }

  const handleClose = () => {
    if (!isPending) {
      onOpenChange(false)
      setConfirmText('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md rounded-[2.5rem] border-none p-0 shadow-2xl bg-white overflow-hidden">
        <DialogHeader className="p-10 pb-4">
          <div className="size-16 rounded-[2rem] bg-rose-50 flex items-center justify-center text-rose-500 mb-8 border border-rose-100 shadow-sm mx-auto">
            <ShieldAlert className="size-10" />
          </div>
          <DialogTitle className="text-3xl font-black uppercase tracking-tight text-slate-900 text-center leading-none">Phá hủy Đội ngữ</DialogTitle>
          <DialogDescription className="text-sm font-medium text-slate-500 mt-4 italic text-center leading-relaxed">
            Hành động này mang tính vĩnh viễn và không thể đảo ngược. Mọi dữ liệu liên quan sẽ bị xóa sạch khỏi hạ tầng.
          </DialogDescription>
        </DialogHeader>

        <div className="p-10 pt-4 space-y-8">
          <div className="p-6 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-4">
            <div className="flex items-center gap-3">
              <AlertOctagon className="size-4 text-rose-600" />
              <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest leading-none">Danh mục bị ảnh hưởng:</p>
            </div>
            <ul className="space-y-2">
              {['Tất cả thành viên & Quyền truy cập', 'Dữ liệu vận hành & Cấu hình nhóm', 'Liên kết thương hiệu & Chiến dịch'].map(item => (
                <li key={item} className="flex items-center gap-3 text-[10px] font-bold text-rose-800 uppercase tracking-tighter">
                  <div className="size-1.5 rounded-full bg-rose-300" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <Label htmlFor="confirm-text" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block px-1">
              Nhập mã định danh <strong className="text-slate-900">"{teamName}"</strong> để xác nhận:
            </Label>
            <Input
              id="confirm-text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={`Nhập chính xác "${teamName}"`}
              disabled={isPending}
              className="h-14 rounded-2xl border-2 border-slate-100 bg-white px-6 focus-visible:ring-slate-100 font-black text-slate-900 uppercase tracking-tight shadow-sm"
            />
          </div>
        </div>

        <DialogFooter className="p-10 pt-0 grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
            className="h-12 rounded-xl border-slate-100 bg-slate-50 text-slate-400 hover:bg-slate-100 font-black uppercase tracking-widest text-[9px]"
          >
            Hủy bỏ
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDisabled}
            className="h-12 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black uppercase tracking-widest text-[9px] shadow-xl shadow-rose-100 transition-all hover:-translate-y-1"
          >
            {isPending ? 'Đang phá hủy...' : 'Xác nhận xóa bỏ'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

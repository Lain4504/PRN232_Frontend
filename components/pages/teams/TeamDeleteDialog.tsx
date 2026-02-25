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
      <DialogContent className="sm:max-w-md rounded-lg border-border p-0 shadow-lg bg-popover overflow-hidden">
        <DialogHeader className="p-8 pb-4 text-left">
          <DialogTitle className="text-2xl font-bold tracking-tight text-foreground leading-none">Phá hủy Đội ngữ</DialogTitle>
          <DialogDescription className="text-sm font-medium text-muted-foreground mt-4 leading-relaxed">
            Hành động này mang tính vĩnh viễn và không thể đảo ngược. Mọi dữ liệu liên quan sẽ bị xóa sạch khỏi hạ tầng.
          </DialogDescription>
        </DialogHeader>

        <div className="p-8 pt-4 space-y-8">
          <div className="p-6 rounded-lg bg-destructive/5 border border-destructive/10 space-y-4">
            <div className="flex items-center gap-3">
              <AlertOctagon className="size-4 text-destructive" />
              <p className="text-xs font-semibold text-destructive leading-none">Danh mục bị ảnh hưởng:</p>
            </div>
            <ul className="space-y-2">
              {['Tất cả thành viên & Quyền truy cập', 'Dữ liệu vận hành & Cấu hình nhóm', 'Liên kết thương hiệu & Chiến dịch'].map(item => (
                <li key={item} className="flex items-center gap-3 text-xs font-medium text-destructive/80">
                  <div className="size-1.5 rounded-full bg-destructive/30" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <Label htmlFor="confirm-text" className="text-sm font-semibold text-muted-foreground block px-1">
              Nhập mã định danh <strong className="text-foreground">&quot;{teamName}&quot;</strong> để xác nhận:
            </Label>
            <Input
              id="confirm-text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={`Nhập chính xác "${teamName}"`}
              disabled={isPending}
              className="h-12 rounded-lg border-border bg-card px-6 focus-visible:ring-primary font-medium text-foreground shadow-sm"
            />
          </div>
        </div>

        <DialogFooter className="p-8 pt-0 grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
            className="h-10 rounded-md border-border font-semibold text-sm"
          >
            Hủy bỏ
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDisabled}
            className="h-10 rounded-md font-semibold text-sm shadow-sm transition-all"
          >
            {isPending ? 'Đang phá hủy...' : 'Xác nhận xóa bỏ'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

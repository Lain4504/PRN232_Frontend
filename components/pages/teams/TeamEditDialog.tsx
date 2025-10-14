"use client"

import { useEffect, useState } from 'react'
import { useUpdateTeam } from '@/hooks/use-teams'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useIsMobile } from '@/hooks/use-mobile'
import { AlertCircle } from 'lucide-react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  teamId: string
  initialName: string
  initialDescription?: string
  vendorId: string
}

export function TeamEditDialog({ open, onOpenChange, teamId, initialName, initialDescription, vendorId }: Props) {
  const { mutateAsync, isPending } = useUpdateTeam(teamId)
  const [name, setName] = useState(initialName)
  const [description, setDescription] = useState(initialDescription || '')
  const [error, setError] = useState<string | null>(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    if (open) {
      setName(initialName)
      setDescription(initialDescription || '')
      setError(null)
    }
  }, [open, initialName, initialDescription])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await mutateAsync({ name, description: description || undefined})
      onOpenChange(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Đã xảy ra lỗi'
      if (message.includes('401')) {
        window.location.href = '/login'
        return
      }
      setError('Không thể cập nhật team. Vui lòng thử lại.')
    }
  }

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh] flex flex-col">
          <DrawerHeader className="flex-shrink-0 text-left">
            <DrawerTitle>Chỉnh sửa team</DrawerTitle>
            <DrawerDescription>Cập nhật thông tin team.</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 overflow-y-auto flex-1">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Tên team</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nhập tên team" required />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Mô tả</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Mô tả ngắn (tuỳ chọn)" />
              </div>
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <div className="text-sm text-destructive">{error}</div>
                </div>
              )}
            </form>
          </div>
          <DrawerFooter className="flex-shrink-0 pt-2">
            <DrawerClose asChild>
              <Button variant="outline">Huỷ</Button>
            </DrawerClose>
            <Button onClick={handleSubmit as unknown as () => void} disabled={isPending}>
              {isPending ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Chỉnh sửa team</DialogTitle>
          <DialogDescription>Cập nhật thông tin team.</DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Tên team</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nhập tên team" required />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Mô tả</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Mô tả ngắn (tuỳ chọn)" />
            </div>
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <div className="text-sm text-destructive">{error}</div>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} size="sm" className="h-8 text-xs">Huỷ</Button>
              <Button type="submit" disabled={isPending} size="sm" className="h-8 text-xs">{isPending ? 'Đang lưu...' : 'Lưu'}</Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
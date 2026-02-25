"use client"

import { useEffect, useState } from 'react'
import { useCreateTeam } from '@/hooks/use-teams'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useIsMobile } from '@/hooks/use-mobile'
import { AlertCircle, Building2, ChevronRight, Target, Users } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { cn } from "@/lib/utils"

const teamFormSchema = z.object({
  name: z.string().min(1, 'Tên đội ngũ là bắt buộc').max(100, 'Tên không được quá 100 ký tự'),
  description: z.string().max(500, 'Mô tả không được quá 500 ký tự').optional(),
})

type TeamFormValues = z.infer<typeof teamFormSchema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  vendorId: string
  onCreated?: (teamId: string) => void
}

export function TeamCreateDialog({ open, onOpenChange, onCreated }: Props) {
  const { mutateAsync, isPending } = useCreateTeam()
  const [error, setError] = useState<string | null>(null)
  const isMobile = useIsMobile()

  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  })

  useEffect(() => {
    if (!open) {
      form.reset()
      setError(null)
    }
  }, [open, form])

  async function onSubmit(values: TeamFormValues) {
    setError(null)
    try {
      const created = await mutateAsync({
        name: values.name,
        description: values.description || undefined
      })
      onOpenChange(false)
      onCreated?.(created.id)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Đã xảy ra lỗi'
      setError('Không thể tạo nhóm: ' + message)
    }
  }

  const TeamFormContent = ({ onCancel }: { onCancel: () => void }) => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm font-semibold text-muted-foreground">Định danh Đội ngũ</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ví dụ: Growth Hub, Content Wizards..."
                  className="h-10 rounded-md border-border bg-card px-4 focus-visible:ring-primary font-medium text-foreground shadow-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-[11px]" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm font-semibold text-muted-foreground">Sứ mệnh / Mô tả (Tùy chọn)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ghi chú ngắn gọn về mục tiêu của đội ngũ này..."
                  rows={3}
                  className="rounded-md border-border bg-card p-4 focus-visible:ring-primary font-medium text-foreground shadow-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-[11px]" />
            </FormItem>
          )}
        />

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-md bg-destructive/10 border border-destructive/20 text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <div className="text-xs font-semibold leading-relaxed">{error}</div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="h-10 px-6 rounded-md font-semibold text-sm">
            Hủy bỏ
          </Button>
          <Button type="submit" disabled={isPending} className="h-10 px-6 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-sm transition-all">
            {isPending ? "Đang tạo..." : "Triển khai Đội ngũ"}
          </Button>
        </div>
      </form>
    </Form>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh] flex flex-col rounded-t-lg border-none shadow-2xl bg-popover">
          <DrawerHeader className="flex-shrink-0 text-left p-6 pb-2">
            <DrawerTitle className="text-xl font-bold tracking-tight text-foreground leading-none">Kiến tạo Đội ngũ</DrawerTitle>
            <DrawerDescription className="text-sm font-medium text-muted-foreground mt-2">Phác thảo thông tin cơ bản để bắt đầu quy trình cộng tác.</DrawerDescription>
          </DrawerHeader>
          <div className="px-6 overflow-y-auto flex-1 pb-6">
            <TeamFormContent onCancel={() => onOpenChange(false)} />
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-hidden flex flex-col rounded-lg border-border p-0 shadow-lg bg-popover">
        <DialogHeader className="flex-shrink-0 p-6 pb-2 text-left">
          <DialogTitle className="text-2xl font-bold tracking-tight text-foreground leading-none">Kiến tạo Đội ngũ</DialogTitle>
          <DialogDescription className="text-sm font-medium text-muted-foreground mt-2">Xây dựng cấu trúc cộng tác mới cho tổ chức truyền thông của bạn.</DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 px-6 pb-6">
          <TeamFormContent onCancel={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

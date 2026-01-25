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
            <FormItem className="space-y-3">
              <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Định danh Đội ngũ</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ví dụ: Growth Hub, Content Wizards..."
                  className="h-14 rounded-2xl border-2 border-slate-100 bg-white px-6 focus-visible:ring-slate-100 font-black text-slate-900 uppercase tracking-tight shadow-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-[10px] font-bold uppercase" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Sứ mệnh / Mô tả (Tùy chọn)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ghi chú ngắn gọn về mục tiêu của đội ngũ này..."
                  rows={4}
                  className="rounded-[1.5rem] border-2 border-slate-100 bg-white p-6 focus-visible:ring-slate-100 font-medium text-slate-900 shadow-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-[10px] font-bold uppercase" />
            </FormItem>
          )}
        />

        {error && (
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-500">
            <AlertCircle className="size-5 shrink-0" />
            <div className="text-[10px] font-black uppercase tracking-widest leading-relaxed">{error}</div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6">
          <Button type="button" variant="outline" onClick={onCancel} className="h-14 rounded-2xl border-slate-100 bg-slate-50 text-slate-400 hover:bg-slate-100 font-black uppercase tracking-widest text-[10px] order-2 sm:order-1 flex-1 sm:flex-none sm:px-10">
            Hủy bỏ
          </Button>
          <Button type="submit" disabled={isPending} className="h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-slate-200 transition-all hover:-translate-y-1 order-1 sm:order-2 flex-1 sm:flex-none sm:px-10">
            {isPending ? (
              <>
                <div className="mr-3 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Đang tạo...
              </>
            ) : (
              <>
                Triển khai Đội ngũ <ChevronRight className="ml-2 size-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh] flex flex-col rounded-t-[3rem] border-none shadow-2xl bg-white">
          <DrawerHeader className="flex-shrink-0 text-left p-10 pb-4">
            <div className="size-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-6 border border-slate-200">
              <Users className="size-6" />
            </div>
            <DrawerTitle className="text-2xl font-black uppercase tracking-tight text-slate-900 leading-none">Kiến tạo Đội ngũ</DrawerTitle>
            <DrawerDescription className="text-sm font-medium text-slate-400 mt-2 italic">Phác thảo thông tin cơ bản để bắt đầu quy trình cộng tác.</DrawerDescription>
          </DrawerHeader>
          <div className="px-10 overflow-y-auto flex-1 pb-10">
            <TeamFormContent onCancel={() => onOpenChange(false)} />
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-hidden flex flex-col rounded-[3rem] border-none p-0 shadow-2xl bg-white">
        <DialogHeader className="flex-shrink-0 p-12 pb-8">
          <div className="size-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-8 border border-slate-200 shadow-sm">
            <Users className="size-8" />
          </div>
          <DialogTitle className="text-4xl font-black uppercase tracking-tight text-slate-900 leading-none">Kiến tạo Đội ngũ</DialogTitle>
          <DialogDescription className="text-base font-medium text-slate-500 mt-2 italic">Xây dựng cấu trúc cộng tác mới cho tổ chức truyền thông của bạn.</DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 px-12 pb-12">
          <TeamFormContent onCancel={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

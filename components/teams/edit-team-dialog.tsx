"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/use-media-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useUpdateTeam } from '@/hooks/use-teams'
import { toast } from 'sonner'
import { TeamResponse, UpdateTeamRequest } from '@/lib/types/omniadly-types'
import { Edit3, CheckCircle2, X, ChevronRight, Settings2 } from 'lucide-react'

const editTeamSchema = z.object({
  name: z.string().min(1, 'Tên nhóm là bắt buộc').max(100, 'Tên nhóm không quá 100 ký tự'),
  description: z.string().max(500, 'Mô tả không quá 500 ký tự').optional(),
  status: z.enum(['Active', 'Inactive', 'Archived']).optional(),
})

type EditTeamFormData = z.infer<typeof editTeamSchema>

interface EditTeamFormProps extends React.ComponentProps<"form"> {
  team: TeamResponse
  onSuccess: () => void
  onCancel: () => void
  isSubmitting: boolean
}

interface EditTeamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  team: TeamResponse
}

function EditTeamForm({ team, onSuccess, onCancel, isSubmitting, className }: EditTeamFormProps) {
  const updateTeam = useUpdateTeam(team.id)

  const form = useForm<EditTeamFormData>({
    resolver: zodResolver(editTeamSchema),
    defaultValues: {
      name: team.name,
      description: team.description || '',
      status: team.status || 'Active',
    },
  })

  const onSubmit = async (data: EditTeamFormData) => {
    try {
      const updateData: UpdateTeamRequest = {
        name: data.name,
        description: data.description || undefined,
        status: data.status,
      }
      await updateTeam.mutateAsync(updateData)
      toast.success('Đã cập nhật cấu trúc đội ngũ!')
      onSuccess()
    } catch (error) {
      toast.error('Lỗi khi cập nhật thông tin')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn("space-y-8", className)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Định danh Đội ngũ</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nhập tên mới cho đội ngũ..."
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
              <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Sứ mệnh vận hành</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Mô tả mục tiêu chiến lược của nhóm..."
                  className="rounded-xl border-2 border-slate-100 bg-white p-6 focus-visible:ring-slate-100 font-medium text-slate-900 shadow-sm"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-[10px] font-bold uppercase" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Trạng thái Hệ thống</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-14 rounded-2xl border-2 border-slate-100 bg-slate-50 px-6 focus:ring-0 shadow-sm font-black text-slate-900 uppercase tracking-tight">
                    <SelectValue placeholder="Chọn trạng thái..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-1">
                  <SelectItem value="Active" className="rounded-xl font-black text-[10px] uppercase tracking-widest text-emerald-600 focus:bg-emerald-50 h-11">Hoạt động (Active)</SelectItem>
                  <SelectItem value="Inactive" className="rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-400 focus:bg-slate-100 h-11">Tạm dừng (Inactive)</SelectItem>
                  <SelectItem value="Archived" className="rounded-xl font-black text-[10px] uppercase tracking-widest text-rose-500 focus:bg-rose-50 h-11">Lưu trữ (Archived)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage className="text-[10px] font-bold uppercase" />
            </FormItem>
          )}
        />

        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="h-14 rounded-2xl border-slate-100 bg-slate-50 text-slate-400 hover:bg-slate-100 font-black uppercase tracking-widest text-[10px] order-2 sm:order-1 flex-1 sm:flex-none sm:px-10"
          >
            Hủy bỏ
          </Button>
          <Button type="submit" disabled={isSubmitting} className="h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-slate-200 transition-all hover:-translate-y-1 order-1 sm:order-2 flex-1 sm:flex-none sm:px-10">
            {isSubmitting ? (
              <>
                <div className="mr-3 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Đang lưu...
              </>
            ) : (
              <>
                Cập nhật Cấu trúc <ChevronRight className="ml-2 size-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export function EditTeamDialog({ open, onOpenChange, team }: EditTeamDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const handleSuccess = () => {
    setIsSubmitting(false)
    onOpenChange(false)
  }

  const handleCancel = () => {
    setIsSubmitting(false)
    onOpenChange(false)
  }

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-hidden flex flex-col rounded-3xl border-none p-0 shadow-2xl bg-white">
          <DialogHeader className="flex-shrink-0 p-8 pb-4 text-left">
            <div className="size-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-8 border border-slate-200 shadow-sm">
              <Settings2 className="size-8" />
            </div>
            <DialogTitle className="text-4xl font-black uppercase tracking-tight text-slate-900 leading-none">Cấu hình Nhóm</DialogTitle>
            <DialogDescription className="text-base font-medium text-slate-500 mt-2 italic">Hiệu chỉnh các tham số vận hành của đội ngũ chuyên gia.</DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 px-8 pb-8">
            <EditTeamForm
              team={team}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
              isSubmitting={isSubmitting}
            />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh] flex flex-col rounded-t-[3rem] border-none shadow-2xl bg-white">
        <DrawerHeader className="flex-shrink-0 text-left p-6 pb-2">
          <div className="size-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-6 border border-slate-200">
            <Settings2 className="size-6" />
          </div>
          <DrawerTitle className="text-2xl font-black uppercase tracking-tight text-slate-900 leading-none">Cấu hình Nhóm</DrawerTitle>
          <DrawerDescription className="text-sm font-medium text-slate-400 mt-2 italic">Cập nhật thông tin nhận diện đội ngũ.</DrawerDescription>
        </DrawerHeader>
        <EditTeamForm
          team={team}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          className="px-6 pb-6"
        />
      </DrawerContent>
    </Drawer>
  )
}

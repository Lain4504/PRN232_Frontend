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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
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
import { Loader2 } from 'lucide-react'

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
      toast.success('Đã cập nhật thông tin đội ngũ')
      onSuccess()
    } catch {
      toast.error('Lỗi khi cập nhật thông tin')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn("space-y-4", className)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm font-semibold text-muted-foreground">Định danh Đội ngũ</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nhập tên mới..."
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
              <FormLabel className="text-sm font-semibold text-muted-foreground">Sứ mệnh / Mô tả ngắn</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Nhập mô tả về mục tiêu của đội ngũ..."
                  rows={3}
                  className="rounded-md border-border bg-card p-4 focus-visible:ring-primary font-medium text-foreground shadow-sm resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-[11px]" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm font-semibold text-muted-foreground">Trạng thái vận hành</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-10 rounded-md border-border bg-card px-4 focus:ring-0 shadow-sm font-medium text-foreground">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-md border-border shadow-lg p-1">
                  <SelectItem value="Active" className="rounded-sm h-10 font-medium text-sm focus:bg-accent">Đang hoạt động</SelectItem>
                  <SelectItem value="Inactive" className="rounded-sm h-10 font-medium text-sm focus:bg-accent">Tạm dừng</SelectItem>
                  <SelectItem value="Archived" className="rounded-sm h-10 font-medium text-sm focus:bg-accent focus:text-destructive">Lưu trữ</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage className="text-[11px]" />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-end gap-3 pt-6 border-t border-border mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="h-10 px-6 rounded-md font-semibold text-sm"
          >
            Hủy bỏ
          </Button>
          <Button type="submit" disabled={isSubmitting} className="h-10 px-6 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-sm transition-all">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              "Lưu thay đổi"
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
        <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-lg border-border shadow-lg bg-popover">
          <DialogHeader className="p-8 pb-4">
            <DialogTitle className="text-2xl font-bold tracking-tight text-foreground leading-none">Thiết lập đội ngũ</DialogTitle>
            <DialogDescription className="text-sm font-medium text-muted-foreground mt-2 italic">Cập nhật thông tin chi tiết và trạng thái vận hành của nhóm.</DialogDescription>
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
      <DrawerContent className="max-h-[95vh] flex flex-col rounded-t-lg border-none bg-popover shadow-2xl">
        <DrawerHeader className="text-left p-6 pb-2">
          <DrawerTitle className="text-xl font-bold text-foreground focus:outline-none">Thiết lập đội ngũ</DrawerTitle>
          <DrawerDescription className="text-sm font-medium text-muted-foreground italic mt-1">Cập nhật thông tin nhóm vận hành.</DrawerDescription>
        </DrawerHeader>
        <div className="p-6 overflow-y-auto flex-1">
          <EditTeamForm
            team={team}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        </div>
      </DrawerContent>
    </Drawer>
  )
}

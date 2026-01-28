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
    } catch (error) {
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
            <FormItem className="space-y-1">
              <FormLabel>Tên đội ngũ</FormLabel>
              <FormControl>
                <Input placeholder="Nhập tên mới..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>Mô tả ngắn</FormLabel>
              <FormControl>
                <Textarea placeholder="Nhập mô tả về đội ngũ..." rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>Trạng thái</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Active">Đang hoạt động</SelectItem>
                  <SelectItem value="Inactive">Tạm dừng</SelectItem>
                  <SelectItem value="Archived">Lưu trữ</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-end gap-3 pt-6 border-t mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button type="submit" disabled={isSubmitting}>
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
        <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b">
            <DialogTitle>Thiết lập đội ngũ</DialogTitle>
            <DialogDescription>Cập nhật thông tin chi tiết và trạng thái của nhóm.</DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 p-6">
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
      <DrawerContent className="max-h-[95vh] flex flex-col">
        <DrawerHeader className="text-left border-b">
          <DrawerTitle>Thiết lập đội ngũ</DrawerTitle>
          <DrawerDescription>Cập nhật thông tin nhóm.</DrawerDescription>
        </DrawerHeader>
        <div className="p-4 overflow-y-auto flex-1">
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

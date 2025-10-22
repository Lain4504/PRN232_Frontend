'use client'

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
import { TeamResponse, UpdateTeamRequest } from '@/lib/types/aisam-types'

const editTeamSchema = z.object({
  name: z.string().min(1, 'Team name is required').max(100, 'Team name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
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
      
      toast.success('Team updated successfully!', {
        description: 'The team information has been updated.',
        duration: 3000,
      })
      
      onSuccess()
    } catch (error) {
      toast.error('Failed to update team', {
        description: error instanceof Error ? error.message : 'Please try again later.',
        duration: 4000,
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn("space-y-4", className)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter team name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter team description"
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="w-full"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Updating...' : 'Update Team'}
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
            <DialogDescription>
              Update the team information. You can modify the name, description, and status.
            </DialogDescription>
          </DialogHeader>
          <EditTeamForm
            team={team}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Edit Team</DrawerTitle>
          <DrawerDescription>
            Update the team information. You can modify the name, description, and status.
          </DrawerDescription>
        </DrawerHeader>
        <EditTeamForm
          team={team}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          className="px-4"
        />
      </DrawerContent>
    </Drawer>
  )
}

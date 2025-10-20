"use client"

import { useEffect, useState } from 'react'
import { useUpdateTeam } from '@/hooks/use-teams'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useIsMobile } from '@/hooks/use-mobile'
import { AlertCircle, Building2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

// Form validation schema
const teamFormSchema = z.object({
  name: z.string().min(1, 'Team name is required').max(100, 'Team name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
})

type TeamFormValues = z.infer<typeof teamFormSchema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  teamId: string
  initialName: string
  initialDescription?: string
  vendorId: string
}

export function TeamEditDialog({ open, onOpenChange, teamId, initialName, initialDescription }: Props) {
  const { mutateAsync, isPending } = useUpdateTeam(teamId)
  const [error, setError] = useState<string | null>(null)
  const isMobile = useIsMobile()

  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      name: initialName,
      description: initialDescription || '',
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        name: initialName,
        description: initialDescription || '',
      })
      setError(null)
    }
  }, [open, initialName, initialDescription, form])

  async function onSubmit(values: TeamFormValues) {
    setError(null)
    try {
      await mutateAsync({ 
        name: values.name, 
        description: values.description || undefined 
      })
      onOpenChange(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      if (message.includes('401')) {
        window.location.href = '/auth/login'
        return
      }
      setError('Could not update team. ' + message)
    }
  }

  // Shared form content component
  const TeamEditFormContent = ({ onCancel }: { onCancel: () => void }) => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                  placeholder="Short description (optional)"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <div className="text-sm text-destructive">{error}</div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} size="lg" className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button type="submit" disabled={isPending} size="lg" className="w-full sm:w-auto">
            {isPending ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <Building2 className="mr-2 h-4 w-4" />
                Save Changes
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
        <DrawerContent className="max-h-[90vh] flex flex-col">
          <DrawerHeader className="flex-shrink-0 text-left">
            <DrawerTitle>Edit Team</DrawerTitle>
            <DrawerDescription>Update team information.</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 overflow-y-auto flex-1">
            <TeamEditFormContent onCancel={() => onOpenChange(false)} />
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Edit Team</DialogTitle>
          <DialogDescription>Update team information.</DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto flex-1">
          <TeamEditFormContent onCancel={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
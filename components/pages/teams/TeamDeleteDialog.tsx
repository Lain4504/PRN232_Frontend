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
import { AlertTriangle } from 'lucide-react'

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
    } catch (error) {
      // Error is handled by the hook
    }
  }

  const handleClose = () => {
    if (!isPending) {
      onOpenChange(false)
      setConfirmText('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <DialogTitle>Delete Team</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete the team and all its data.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="rounded-md bg-destructive/5 p-3">
            <p className="text-sm text-destructive">
              <strong>Warning:</strong> This will permanently delete:
            </p>
            <ul className="mt-2 text-sm text-destructive/80 list-disc list-inside">
              <li>All team members and their access</li>
              <li>All team data and settings</li>
              <li>All associated brands and campaigns</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirm-text">
              Type <strong>{teamName}</strong> to confirm deletion:
            </Label>
            <Input
              id="confirm-text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={`Type "${teamName}" to confirm`}
              disabled={isPending}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDisabled}
          >
            {isPending ? 'Deleting...' : 'Delete Team'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

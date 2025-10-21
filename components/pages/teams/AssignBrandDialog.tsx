"use client"

import { useEffect, useState } from 'react'
import { useAssignBrands } from '@/hooks/use-teams'
import { api, endpoints } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useIsMobile } from '@/hooks/use-mobile'
import { AlertCircle, Target } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  teamId: string
  currentBrands?: { id: string; name: string }[]
}

export function AssignBrandDialog({ open, onOpenChange, teamId, currentBrands = [] }: Props) {
  const { mutateAsync, isPending } = useAssignBrands(teamId)
  const [selectedBrandIds, setSelectedBrandIds] = useState<string[]>([])
  const [availableBrands, setAvailableBrands] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    if (open) {
      loadAvailableBrands()
      setSelectedBrandIds(currentBrands.map(b => b.id))
      setError(null)
    }
  }, [open, currentBrands])

  const loadAvailableBrands = async () => {
    try {
      setLoading(true)
      const resp = await api.get<{ id: string; name: string }[]>(endpoints.brands())
      setAvailableBrands(Array.isArray(resp.data) ? resp.data : [])
    } catch (err) {
      console.error('Failed to load brands:', err)
      setError('Failed to load available brands')
    } finally {
      setLoading(false)
    }
  }

  const handleBrandToggle = (brandId: string, checked: boolean) => {
    if (checked) {
      setSelectedBrandIds(prev => [...prev, brandId])
    } else {
      setSelectedBrandIds(prev => prev.filter(id => id !== brandId))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await mutateAsync({ brandIds: selectedBrandIds })
      toast.success('Brands assigned successfully')
      onOpenChange(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      if (message.includes('401')) {
        window.location.href = '/auth/login'
        return
      }
      setError('Could not assign brands. ' + message)
      toast.error('Failed to assign brands')
    }
  }

  const renderBrandList = () => (
    <div className="space-y-3 max-h-60 overflow-y-auto">
      {availableBrands.map((brand) => {
        const isSelected = selectedBrandIds.includes(brand.id)
        return (
          <div key={brand.id} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50">
            <Checkbox
              id={brand.id}
              checked={isSelected}
              onCheckedChange={(checked) => handleBrandToggle(brand.id, checked as boolean)}
            />
            <Label htmlFor={brand.id} className="flex items-center gap-3 cursor-pointer flex-1">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{brand.name}</span>
            </Label>
          </div>
        )
      })}
      {availableBrands.length === 0 && !loading && (
        <div className="text-center py-8 text-muted-foreground">
          <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No brands available</p>
        </div>
      )}
    </div>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh] flex flex-col">
          <DrawerHeader className="flex-shrink-0 text-left">
            <DrawerTitle>Assign Brands to Team</DrawerTitle>
            <DrawerDescription>Select brands to assign to this team.</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 overflow-y-auto flex-1">
            <form onSubmit={handleSubmit} className="space-y-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Loading brands...</p>
                </div>
              ) : (
                renderBrandList()
              )}
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
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
            <Button onClick={handleSubmit as unknown as () => void} disabled={isPending || loading}>
              {isPending ? 'Assigning...' : 'Assign Brands'}
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
          <DialogTitle>Assign Brands to Team</DialogTitle>
          <DialogDescription>Select brands to assign to this team.</DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="space-y-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading brands...</p>
              </div>
            ) : (
              renderBrandList()
            )}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <div className="text-sm text-destructive">{error}</div>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} size="sm" className="h-8 text-xs">Cancel</Button>
              <Button type="submit" disabled={isPending || loading} size="sm" className="h-8 text-xs">{isPending ? 'Assigning...' : 'Assign Brands'}</Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Link, Building2, Users, AlertCircle } from 'lucide-react'
import { useGetAvailableTargets, useGetBrands, useLinkTargets } from '@/hooks/use-social-accounts'
import { Brand, AvailableTargetDto } from '@/lib/types/aisam-types'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { toast } from 'sonner'

interface LinkIntegrationModalProps {
  socialAccountId: string
  provider: string
  children?: React.ReactNode
}

export function LinkIntegrationModal({ socialAccountId, provider, children }: LinkIntegrationModalProps) {
  const [open, setOpen] = useState(false)
  const [selectedBrandId, setSelectedBrandId] = useState<string>('')
  const [selectedTargets, setSelectedTargets] = useState<string[]>([])
  const [isLinking, setIsLinking] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [userLoading, setUserLoading] = useState(true)

  const { data: brands = [], isLoading: brandsLoading } = useGetBrands()
  const { data: availableTargets = [], isLoading: targetsLoading, error: targetsError } = useGetAvailableTargets(socialAccountId)
  const linkTargetsMutation = useLinkTargets()
  const supabase = createClient()

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        console.error('Error getting user:', error)
        toast.error('Failed to get user information')
      } finally {
        setUserLoading(false)
      }
    }

    getUser()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setUserLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedBrandId('')
      setSelectedTargets([])
    }
  }, [open])

  const handleTargetToggle = (targetId: string) => {
    setSelectedTargets(prev => 
      prev.includes(targetId) 
        ? prev.filter(id => id !== targetId)
        : [...prev, targetId]
    )
  }

  const handleLink = async () => {
    if (!selectedBrandId) {
      toast.error('Please select a brand')
      return
    }

    if (selectedTargets.length === 0) {
      toast.error('Please select at least one page to link')
      return
    }

    if (!user?.id) {
      toast.error('User not authenticated')
      return
    }

    try {
      setIsLinking(true)
      await linkTargetsMutation.mutateAsync({
        socialAccountId,
        data: {
          userId: user.id,
          provider,
          providerTargetIds: selectedTargets,
          brandId: selectedBrandId
        }
      })
      
      toast.success('Successfully linked pages to brand')
      setOpen(false)
    } catch (error) {
      console.error('Link error:', error)
      toast.error('Failed to link pages to brand')
    } finally {
      setIsLinking(false)
    }
  }

  const selectedBrand = brands.find(b => b.id === selectedBrandId)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Link className="mr-2 h-4 w-4" />
            Link to Brand
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Link Pages to Brand</DialogTitle>
          <DialogDescription>
            Select a brand and choose which pages to link from your {provider} account.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Brand Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Brand</label>
            <Select value={selectedBrandId} onValueChange={setSelectedBrandId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a brand" />
              </SelectTrigger>
              <SelectContent>
                {brandsLoading ? (
                  <SelectItem value="" disabled>Loading brands...</SelectItem>
                ) : brands.length === 0 ? (
                  <SelectItem value="" disabled>No brands available</SelectItem>
                ) : (
                  brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {brand.name}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {brands.length === 0 && !brandsLoading && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                Create a brand first to link pages
              </p>
            )}
          </div>

          {/* Available Targets */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Available Pages</label>
            {targetsLoading ? (
              <div className="text-sm text-muted-foreground">Loading pages...</div>
            ) : targetsError ? (
              <div className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                Failed to load pages. Check your account permissions.
              </div>
            ) : availableTargets.length === 0 ? (
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                No pages found. Make sure you have pages on your {provider} account.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-2">
                {availableTargets.map((target) => (
                  <div
                    key={target.providerTargetId}
                    className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50"
                  >
                    <Checkbox
                      id={target.providerTargetId}
                      checked={selectedTargets.includes(target.providerTargetId)}
                      onCheckedChange={() => handleTargetToggle(target.providerTargetId)}
                    />
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={target.profilePictureUrl} alt={target.name} />
                      <AvatarFallback>
                        {target.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{target.name}</p>
                        {target.type && (
                          <Badge variant="secondary" className="text-xs">
                            {target.type}
                          </Badge>
                        )}
                      </div>
                      {target.category && (
                        <p className="text-xs text-muted-foreground">{target.category}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Summary */}
          {selectedBrand && selectedTargets.length > 0 && (
            <div className="rounded-lg border p-3 bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-4 w-4" />
                <span className="font-medium">{selectedBrand.name}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Will link {selectedTargets.length} page{selectedTargets.length !== 1 ? 's' : ''} to this brand
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleLink} 
              disabled={!selectedBrandId || selectedTargets.length === 0 || isLinking || brands.length === 0 || userLoading || !user?.id}
            >
              {isLinking ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Linking...
                </>
              ) : (
                <>
                  <Link className="mr-2 h-4 w-4" />
                  Link Pages
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

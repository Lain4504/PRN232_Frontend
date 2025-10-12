'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { useIsMobile } from '@/hooks/use-mobile'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Link, Building2, AlertCircle } from 'lucide-react'
import { useGetAvailableTargets, useGetBrands, useLinkTargets } from '@/hooks/use-social-accounts'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { toast } from 'sonner'

interface LinkIntegrationModalProps {
  socialAccountId: string
  provider: string
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function LinkIntegrationModal({ 
  socialAccountId, 
  provider, 
  children, 
  open: controlledOpen, 
  onOpenChange 
}: LinkIntegrationModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          {children || (
            <Button variant="outline" size="sm">
              <Link className="mr-2 h-4 w-4" />
              Link to Brand
            </Button>
          )}
        </DrawerTrigger>
        <DrawerContent className="max-h-[90vh] flex flex-col">
          <DrawerHeader className="flex-shrink-0 text-left">
            <DrawerTitle>Link Pages to Brand</DrawerTitle>
            <DrawerDescription>
              Select a brand and choose which pages to link from your {provider} account.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 overflow-y-auto flex-1">
            <LinkIntegrationForm 
              socialAccountId={socialAccountId}
              provider={provider}
              onSuccess={() => setOpen(false)}
            />
          </div>
          <DrawerFooter className="flex-shrink-0 pt-2">
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Link Pages to Brand</DialogTitle>
          <DialogDescription>
            Select a brand and choose which pages to link from your {provider} account.
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto flex-1">
          <LinkIntegrationForm 
            socialAccountId={socialAccountId}
            provider={provider}
            onSuccess={() => setOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

function LinkIntegrationForm({ 
  socialAccountId, 
  provider, 
  className, 
  onSuccess 
}: { 
  socialAccountId: string
  provider: string
  className?: string
  onSuccess: () => void 
}) {
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
    setSelectedBrandId('')
    setSelectedTargets([])
  }, [socialAccountId])

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
      onSuccess()
    } catch (error) {
      console.error('Link error:', error)
      toast.error('Failed to link pages to brand')
    } finally {
      setIsLinking(false)
    }
  }

  const selectedBrand = brands.find(b => b.id === selectedBrandId)

  return (
    <div className={`space-y-6 ${className || ''}`}>
      <div className="space-y-4">
        <label className="text-sm font-medium text-muted-foreground">Select Brand</label>
        <Select value={selectedBrandId} onValueChange={setSelectedBrandId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a brand" />
          </SelectTrigger>
          <SelectContent>
            {brandsLoading ? (
              <SelectItem value="loading" disabled>Loading brands...</SelectItem>
            ) : brands.length === 0 ? (
              <SelectItem value="no-brands" disabled>No brands available</SelectItem>
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
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border">
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Create a brand first to link pages
            </p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <label className="text-sm font-medium text-muted-foreground">Available Pages</label>
        {targetsLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-sm text-muted-foreground">Loading pages...</div>
          </div>
        ) : targetsError ? (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <div className="text-sm text-destructive">
              Failed to load pages. Check your account permissions.
            </div>
          </div>
        ) : availableTargets.length === 0 ? (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border">
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">
              No pages found. Make sure you have pages on your {provider} account.
            </div>
          </div>
        ) : (
          <div className="space-y-2 max-h-[40vh] overflow-y-auto border rounded-lg p-3 bg-muted/20">
            {availableTargets.map((target) => (
              <div key={target.providerTargetId} className="flex items-center gap-3 p-3 rounded-lg hover:bg-background/50 transition-colors">
                <Checkbox
                  id={target.providerTargetId}
                  checked={selectedTargets.includes(target.providerTargetId)}
                  onCheckedChange={() => handleTargetToggle(target.providerTargetId)}
                />
                <Avatar className="h-9 w-9 ring-2 ring-muted">
                  <AvatarImage src={target.profilePictureUrl} alt={target.name} />
                  <AvatarFallback className="text-sm font-semibold">
                    {target.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium truncate">{target.name}</p>
                    {target.type && (
                      <Badge variant="outline" className="text-xs">
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

      {selectedBrand && selectedTargets.length > 0 && (
        <div className="rounded-lg border p-4 bg-muted/50">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-4 w-4" />
            <span className="font-medium">{selectedBrand.name}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Will link {selectedTargets.length} page{selectedTargets.length !== 1 ? 's' : ''} to this brand
          </p>
        </div>
      )}

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4">
        <Button 
          onClick={handleLink} 
          disabled={!selectedBrandId || selectedTargets.length === 0 || isLinking || brands.length === 0 || userLoading || !user?.id} 
          className="w-full sm:w-auto"
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
  )
}
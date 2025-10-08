'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { useIsMobile } from '@/hooks/use-mobile'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Facebook, Twitter, Smartphone } from 'lucide-react'
import { useGetAuthUrl } from '@/hooks/use-social-accounts'
import { toast } from 'sonner'

interface ConnectModalProps {
  children?: React.ReactNode
}

const providers = [
  {
    value: 'facebook',
    label: 'Facebook',
    icon: Facebook,
    description: 'Connect your Facebook account to manage pages and posts'
  },
  {
    value: 'tiktok',
    label: 'TikTok',
    icon: Smartphone,
    description: 'Connect your TikTok account for video content management'
  },
  {
    value: 'twitter',
    label: 'Twitter',
    icon: Twitter,
    description: 'Connect your Twitter account for tweet management'
  }
] as const

export function ConnectModal({ children }: ConnectModalProps) {
  const [open, setOpen] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<string>('')
  const [isConnecting, setIsConnecting] = useState(false)
  const isMobile = useIsMobile()
  
  const { refetch: getAuthUrl } = useGetAuthUrl(selectedProvider as 'facebook' | 'tiktok' | 'twitter')

  const handleConnect = async () => {
    if (!selectedProvider) {
      toast.error('Please select a social media platform')
      return
    }

    try {
      setIsConnecting(true)
      const { data: authData, error } = await getAuthUrl()
      
      if (error) {
        throw new Error(error.message || 'Failed to get authentication URL')
      }
      
      if (authData?.authUrl) {
        // Redirect to OAuth URL
        window.location.href = authData.authUrl
      } else {
        throw new Error('No authentication URL received')
      }
    } catch (error) {
      console.error('Connect error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to start connection process'
      toast.error(errorMessage)
    } finally {
      setIsConnecting(false)
    }
  }

  const selectedProviderInfo = providers.find(p => p.value === selectedProvider)

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          {children || (
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Connect Account
            </Button>
          )}
        </DrawerTrigger>
        <DrawerContent className="max-h-[90vh] flex flex-col">
          <DrawerHeader className="flex-shrink-0">
            <DrawerTitle>Connect Social Account</DrawerTitle>
            <DrawerDescription>
              Choose a social media platform to connect your account and start managing your content.
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4 space-y-4 overflow-y-auto flex-1">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Platform</label>
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a platform" />
                </SelectTrigger>
                <SelectContent>
                  {providers.map((provider) => {
                    const Icon = provider.icon
                    return (
                      <SelectItem key={provider.value} value={provider.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {provider.label}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            {selectedProviderInfo && (
              <div className="rounded-lg border p-3 bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <selectedProviderInfo.icon className="h-4 w-4" />
                  <span className="font-medium">{selectedProviderInfo.label}</span>
                </div>
                <p className="text-sm text-muted-foreground">{selectedProviderInfo.description}</p>
              </div>
            )}
          </div>
          <DrawerFooter>
            <Button 
              onClick={handleConnect} 
              disabled={!selectedProvider || isConnecting}
            >
              {isConnecting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Connecting...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Connect
                </>
              )}
            </Button>
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
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Connect Account
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Connect Social Account</DialogTitle>
          <DialogDescription>
            Choose a social media platform to connect your account and start managing your content.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 overflow-y-auto flex-1">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Platform</label>
            <Select value={selectedProvider} onValueChange={setSelectedProvider}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a platform" />
              </SelectTrigger>
              <SelectContent>
                {providers.map((provider) => {
                  const Icon = provider.icon
                  return (
                    <SelectItem key={provider.value} value={provider.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {provider.label}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
          {selectedProviderInfo && (
            <div className="rounded-lg border p-3 bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <selectedProviderInfo.icon className="h-4 w-4" />
                <span className="font-medium">{selectedProviderInfo.label}</span>
              </div>
              <p className="text-sm text-muted-foreground">{selectedProviderInfo.description}</p>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4 flex-shrink-0">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConnect} disabled={!selectedProvider || isConnecting}>
              {isConnecting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Connecting...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Connect
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { useIsMobile } from '@/hooks/use-mobile'
import { Plus } from 'lucide-react'
import { useGetAuthUrl } from '@/hooks/use-social-accounts'
import { toast } from 'sonner'
import { SiFacebook, SiInstagram, SiTiktok, SiX } from "@icons-pack/react-simple-icons"

interface ConnectModalProps {
  children?: React.ReactNode
}

const providers = [
  {
    value: 'facebook',
    label: 'Facebook',
    icon: SiFacebook,
    description: 'Connect your Facebook account to manage pages and posts'
  },
  {
    value: 'tiktok',
    label: 'TikTok',
    icon: SiTiktok,
    description: 'Connect your TikTok account for video content management'
  },
  {
    value: 'instagram',
    label: 'Instagram',
    icon: SiInstagram,
    description: 'Connect your Instagram account to manage posts and stories'
  }
] as const

export function ConnectModal({ children }: ConnectModalProps) {
  const [open, setOpen] = useState(false)
  const isMobile = useIsMobile()

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
          <DrawerHeader className="flex-shrink-0 text-left">
            <DrawerTitle>Connect Social Account</DrawerTitle>
            <DrawerDescription>
              Choose a social media platform to connect your account and start managing your content.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 overflow-y-auto flex-1">
            <ConnectForm onConnect={() => setOpen(false)} />
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
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Connect Account
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Connect Social Account</DialogTitle>
          <DialogDescription>
            Choose a social media platform to connect your account and start managing your content.
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto flex-1">
          <ConnectForm onConnect={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ConnectForm({ className, onConnect }: { className?: string; onConnect: () => void }) {
  const [selectedProvider, setSelectedProvider] = useState<string>('')
  const [isConnecting, setIsConnecting] = useState(false)
  
  const { refetch: getAuthUrl } = useGetAuthUrl(selectedProvider as 'facebook' | 'tiktok' | 'instagram')

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

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'facebook': return 'bg-[#1877F2]'
      case 'instagram': return 'bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]'
      case 'tiktok': return 'bg-black'
      default: return 'bg-black'
    }
  }

  return (
    <div className={`space-y-6 ${className || ''}`}>
      <div className="space-y-4">
        <label className="text-sm font-medium text-muted-foreground">Select Platform</label>
        <div className="grid gap-3">
          {providers.map((provider) => {
            const Icon = provider.icon
            const isSelected = selectedProvider === provider.value
            return (
              <button
                key={provider.value}
                onClick={() => setSelectedProvider(provider.value)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                  isSelected 
                    ? 'border-primary bg-primary/5 shadow-sm' 
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getProviderColor(provider.value)}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">{provider.label}</div>
                    <div className="text-sm text-muted-foreground">{provider.description}</div>
                  </div>
                  {isSelected && (
                    <div className="ml-auto">
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      </div>
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>
      <div className="flex justify-end pt-4">
        <Button 
          onClick={handleConnect} 
          disabled={!selectedProvider || isConnecting}
          className="w-full sm:w-auto"
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
      </div>
    </div>
  )
}
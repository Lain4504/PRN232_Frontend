"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { useIsMobile } from '@/hooks/use-mobile'
import { Plus, ChevronRight, Check, Loader2 } from 'lucide-react'
import { useGetAuthUrl } from '@/hooks/use-social-accounts'
import { toast } from 'sonner'
import { SiFacebook, SiInstagram, SiTiktok } from "@icons-pack/react-simple-icons"
import { cn } from "@/lib/utils"

interface ConnectModalProps {
  children?: React.ReactNode
}

const providers = [
  {
    value: 'facebook',
    label: 'Facebook',
    icon: SiFacebook,
    description: 'Kết nối Fanpage để quản lý bài đăng.'
  },
  {
    value: 'tiktok',
    label: 'TikTok',
    icon: SiTiktok,
    description: 'Đồng bộ video và dữ liệu từ TikTok Business.'
  },
  {
    value: 'instagram',
    label: 'Instagram',
    icon: SiInstagram,
    description: 'Quản lý tài khoản Instagram Professional.'
  }
] as const

export function ConnectModal({ children }: ConnectModalProps) {
  const [open, setOpen] = useState(false)
  const isMobile = useIsMobile()

  const title = "Kết nối mạng xã hội";
  const description = "Chọn nền tảng bạn muốn liên kết với hệ thống.";

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          {children || (
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Kết nối
            </Button>
          )}
        </DrawerTrigger>
        <DrawerContent className="max-h-[95vh] flex flex-col">
          <DrawerHeader className="text-left border-b">
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 overflow-y-auto flex-1">
            <ConnectForm onConnect={() => setOpen(false)} />
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Kết nối tài khoản
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 p-6">
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
      toast.error('Vui lòng chọn một nền tảng')
      return
    }

    try {
      setIsConnecting(true)
      const { data: authData, error } = await getAuthUrl()
      if (error) throw new Error(error.message || 'Lỗi lấy URL xác thực')
      if (authData?.authUrl) {
        window.location.href = authData.authUrl
      } else {
        throw new Error('Không nhận được URL xác thực')
      }
    } catch (error) {
      toast.error('Không thể thực hiện kết nối')
    } finally {
      setIsConnecting(false)
    }
  }

  const getProviderIconColor = (provider: string) => {
    switch (provider) {
      case 'facebook': return 'text-[#1877F2]'
      case 'instagram': return 'text-[#E4405F]'
      case 'tiktok': return 'text-black'
      default: return 'text-slate-900'
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="grid gap-3">
        {providers.map((provider) => {
          const Icon = provider.icon
          const isSelected = selectedProvider === provider.value
          return (
            <button
              key={provider.value}
              onClick={() => setSelectedProvider(provider.value)}
              className={cn(
                "flex items-center gap-4 p-4 rounded-lg border text-left transition-all",
                isSelected
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'border-border bg-card hover:border-primary/50 hover:bg-muted/50'
              )}
            >
              <div className={cn("size-10 rounded-md flex items-center justify-center bg-background border border-border shadow-sm", getProviderIconColor(provider.value))}>
                <Icon className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-foreground">{provider.label}</div>
                <div className="text-[11px] text-muted-foreground truncate">{provider.description}</div>
              </div>
              {isSelected && (
                <div className="size-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="size-3 text-primary-foreground" />
                </div>
              )}
            </button>
          )
        })}
      </div>

      <div className="pt-4 border-t mt-6">
        <Button
          onClick={handleConnect}
          disabled={!selectedProvider || isConnecting}
          className="w-full h-11"
        >
          {isConnecting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Đang kết nối...
            </>
          ) : (
            "Tiếp tục kết nối"
          )}
        </Button>
      </div>
    </div>
  )
}

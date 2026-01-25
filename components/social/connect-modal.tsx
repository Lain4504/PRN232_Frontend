"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { useIsMobile } from '@/hooks/use-mobile'
import { Plus, Globe, ChevronRight, Check } from 'lucide-react'
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
    description: 'Kết nối trang Fanpage và quản lý nội dung tự động.'
  },
  {
    value: 'tiktok',
    label: 'TikTok',
    icon: SiTiktok,
    description: 'Đồng bộ video và phân tích dữ liệu từ kênh TikTok Business.'
  },
  {
    value: 'instagram',
    label: 'Instagram',
    icon: SiInstagram,
    description: 'Quản lý bài viết và story trên tài khoản Instagram Professional.'
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
            <Button className="rounded-xl h-12">
              <Plus className="mr-2 h-4 w-4" />
              Kết nối tài khoản
            </Button>
          )}
        </DrawerTrigger>
        <DrawerContent className="max-h-[90vh] flex flex-col rounded-t-[2.5rem] border-none">
          <DrawerHeader className="flex-shrink-0 text-left p-8">
            <div className="size-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
              <Globe className="size-6" />
            </div>
            <DrawerTitle className="text-2xl font-black uppercase tracking-tight">Kết nối Mạng xã hội</DrawerTitle>
            <DrawerDescription className="text-sm font-medium text-slate-500 mt-2">
              Chọn nền tảng bạn muốn tích hợp vào hệ sinh thái quản trị AI.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-8 overflow-y-auto flex-1 pb-10">
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
          <Button className="rounded-xl h-12">
            <Plus className="mr-2 h-4 w-4" />
            Kết nối tài khoản
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col rounded-[2.5rem] border-none p-0 shadow-2xl">
        <DialogHeader className="flex-shrink-0 p-10 pb-0">
          <div className="size-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-6 border border-slate-200 shadow-sm">
            <Globe className="size-6" />
          </div>
          <DialogTitle className="text-3xl font-black uppercase tracking-tight text-slate-900">Kết nối Mạng xã hội</DialogTitle>
          <DialogDescription className="text-sm font-medium text-slate-500 mt-2 italic">
            Mở rộng mạng lưới kênh truyền thông của bạn bằng cách tích hợp các nút OAuth.
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 p-10 pt-6">
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
      toast.error('Không thể khởi chạy quy trình kết nối')
    } finally {
      setIsConnecting(false)
    }
  }

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'facebook': return 'bg-[#1877F2]'
      case 'instagram': return 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]'
      case 'tiktok': return 'bg-black'
      default: return 'bg-black'
    }
  }

  return (
    <div className={cn("space-y-8", className)}>
      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Chọn nền tảng mục tiêu</label>
        <div className="grid gap-4">
          {providers.map((provider) => {
            const Icon = provider.icon
            const isSelected = selectedProvider === provider.value
            return (
              <button
                key={provider.value}
                onClick={() => setSelectedProvider(provider.value)}
                className={cn(
                  "p-6 rounded-[1.5rem] border-2 transition-all duration-300 text-left relative group overflow-hidden",
                  isSelected
                    ? 'border-slate-900 bg-slate-50 shadow-xl shadow-slate-100 ring-4 ring-slate-100'
                    : 'border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                )}
              >
                <div className="flex items-center gap-5 relative z-10">
                  <div className={cn("size-12 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform", getProviderColor(provider.value))}>
                    <Icon className="size-6 text-white" />
                  </div>
                  <div className="space-y-1 pr-6">
                    <div className="font-black text-slate-900 uppercase tracking-tight text-base leading-none">{provider.label}</div>
                    <div className="text-[10px] font-medium text-slate-400 leading-tight">{provider.description}</div>
                  </div>
                  {isSelected && (
                    <div className="ml-auto flex shrink-0">
                      <div className="size-6 rounded-full bg-slate-900 flex items-center justify-center">
                        <Check className="size-3.5 text-white" />
                      </div>
                    </div>
                  )}
                </div>
                {isSelected && (
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] scale-150 rotate-12">
                    <Icon className="size-24 text-slate-900" />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
      <div className="pt-4">
        <Button
          onClick={handleConnect}
          disabled={!selectedProvider || isConnecting}
          className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-slate-200 transition-all hover:-translate-y-1"
        >
          {isConnecting ? (
            <>
              <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Đang thiết lập...
            </>
          ) : (
            <>
              Bắt đầu kết nối <ChevronRight className="ml-2 size-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

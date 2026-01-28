"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Trash2,
  MoreHorizontal,
  Users,
  Building2,
  CheckCircle2,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { useIsMobile } from '@/hooks/use-mobile'
import { SocialAccountDto } from '@/lib/types/omniadly-types'
import { SiFacebook, SiTiktok, SiInstagram } from "@icons-pack/react-simple-icons"
import { cn } from "@/lib/utils"

interface IntegrationsModalProps {
  account: SocialAccountDto
  isOpen: boolean
  onClose: () => void
  onDeleteTarget: (targetId: string, accountId: string) => void
}

const providerIcons = {
  facebook: SiFacebook,
  tiktok: SiTiktok,
  instagram: SiInstagram,
} as const

const providerIconColor = {
  facebook: 'text-[#1877F2]',
  tiktok: 'text-black',
  instagram: 'text-[#E4405F]',
} as const

export function IntegrationsModal({ account, isOpen, onClose, onDeleteTarget }: IntegrationsModalProps) {
  const isMobile = useIsMobile()
  const Icon = providerIcons[account.provider]
  const iconColor = providerIconColor[account.provider]

  const modalContent = (
    <div className="space-y-6">
      {account.targets && account.targets.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <CheckCircle2 className="size-3" />
            <span>Kênh đã liên kết ({account.targets.length})</span>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {account.targets.map((target) => (
              <div
                key={target.id}
                className="flex items-center justify-between gap-4 p-4 rounded-lg border bg-white hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <Avatar className="size-10 rounded-md border flex-shrink-0">
                    <AvatarImage src={target.profilePictureUrl} alt={target.name} className="object-cover" />
                    <AvatarFallback className="bg-slate-100 text-slate-500 font-bold">
                      {target.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900 text-sm truncate">{target.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">
                        {target.type || 'PAGE'}
                      </Badge>
                      {target.brandName && (
                        <div className="flex items-center gap-1 text-[10px] text-slate-500">
                          <Building2 className="size-3" />
                          <span className="truncate max-w-[120px]">{target.brandName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => onDeleteTarget(target.id, account.id)}
                      className="text-rose-500 focus:text-rose-600 focus:bg-rose-50"
                    >
                      <Trash2 className="size-4 mr-2" />
                      Hủy liên kết
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-xl bg-slate-50/50">
          <Users className="size-10 text-slate-300 mb-4" />
          <h4 className="text-sm font-bold text-slate-900 mb-1">Chưa có kênh liên kết</h4>
          <p className="text-xs text-slate-500 max-w-[200px]">
            Tài khoản này hiện chưa có thực thể nào được đồng bộ.
          </p>
        </div>
      )}
    </div>
  )

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="max-h-[90vh] flex flex-col">
          <DrawerHeader className="text-left border-b mb-6">
            <div className="flex items-center gap-4">
              <div className={cn("size-10 rounded-lg flex items-center justify-center bg-white border shadow-sm", iconColor)}>
                <Icon className="size-5" />
              </div>
              <div>
                <DrawerTitle>Quản lý tích hợp</DrawerTitle>
                <DrawerDescription className="text-xs">Nền tảng: {account.provider}</DrawerDescription>
              </div>
            </div>
          </DrawerHeader>
          <div className="px-4 pb-6 overflow-y-auto flex-1">
            {modalContent}
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b">
          <div className="flex items-center gap-4">
            <div className={cn("size-10 rounded-lg flex items-center justify-center bg-white border shadow-sm", iconColor)}>
              <Icon className="size-5" />
            </div>
            <div>
              <DialogTitle>Quản lý tích hợp</DialogTitle>
              <DialogDescription className="text-xs">
                Danh sách các kênh {account.provider} đã đồng bộ.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 p-6">
          {modalContent}
        </div>
      </DialogContent>
    </Dialog>
  )
}

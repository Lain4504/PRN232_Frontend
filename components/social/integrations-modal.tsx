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
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  X
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

const providerColors = {
  facebook: 'bg-[#1877F2]',
  tiktok: 'bg-black',
  instagram: 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]',
} as const

export function IntegrationsModal({ account, isOpen, onClose, onDeleteTarget }: IntegrationsModalProps) {
  const isMobile = useIsMobile()
  const Icon = providerIcons[account.provider]
  const colorClass = providerColors[account.provider]

  const content = (
    <div className="space-y-8 pb-10">
      {account.targets && account.targets.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                <CheckCircle2 className="size-3.5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Thực thể đã đồng bộ ({account.targets.length})</span>
            </div>
          </div>

          <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 scrollbar-hide">
            {account.targets.map((target) => (
              <div
                key={target.id}
                className="flex items-center justify-between gap-5 p-5 rounded-xl border-2 border-slate-100 bg-white hover:border-slate-300 hover:shadow-xl hover:shadow-slate-100 transition-all group"
              >
                <div className="flex items-center gap-5 min-w-0 flex-1">
                  <Avatar className="size-14 rounded-2xl border border-white shadow-sm ring-4 ring-slate-50 flex-shrink-0">
                    <AvatarImage src={target.profilePictureUrl} alt={target.name} className="object-cover" />
                    <AvatarFallback className="text-xl font-black bg-slate-900 text-white">
                      {target.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="font-black text-slate-900 text-lg uppercase tracking-tight leading-none group-hover:text-slate-900 transition-colors">{target.name}</p>
                    <div className="flex items-center gap-2 flex-wrap mt-1">
                      <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest border-none px-2 rounded-lg">
                        {target.type || 'PAGE'}
                      </Badge>
                      {target.brandName && (
                        <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100/50 px-2 py-0.5 rounded-lg border border-slate-100">
                          <Building2 className="size-3" />
                          <span className="truncate">{target.brandName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="size-10 rounded-xl border-slate-100 hover:bg-slate-50 transition-all font-black text-slate-400 flex-shrink-0">
                      <MoreHorizontal className="size-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-2xl border-slate-100 shadow-2xl p-2 w-[200px]">
                    <DropdownMenuItem
                      onClick={() => onDeleteTarget(target.id, account.id)}
                      className="rounded-xl h-11 flex items-center gap-3 px-4 text-rose-500 font-bold uppercase tracking-widest text-[10px] focus:bg-rose-50 focus:text-rose-600 transition-colors"
                    >
                      <Trash2 className="size-4" />
                      Hủy tích hợp trang
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50">
          <div className="size-20 rounded-2xl bg-white flex items-center justify-center mb-8 shadow-sm border border-slate-100">
            <Users className="size-10 text-slate-200" />
          </div>
          <h4 className="text-xl font-black text-slate-900 mb-3 uppercase tracking-widest">Không có trang liên kết</h4>
          <p className="text-sm font-medium text-slate-400 max-w-[240px] leading-relaxed uppercase tracking-tighter text-xs">
            Tài khoản {account.provider} này hiện chưa có thực thể nào được đồng bộ vào hệ thống.
          </p>
        </div>
      )}
    </div>
  )

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="max-h-[90vh] flex flex-col rounded-t-[2.5rem] border-none shadow-2xl bg-white">
          <DrawerHeader className="flex-shrink-0 text-left p-10 pb-6">
            <div className="flex items-center gap-5">
              <div className={cn("size-14 rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200", colorClass)}>
                <Icon className="size-7 text-white" />
              </div>
              <div className="space-y-1">
                <DrawerTitle className="text-2xl font-black uppercase tracking-tight text-slate-900 leading-none">Cấu trúc Tích hợp</DrawerTitle>
                <DrawerDescription className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                  Nền tảng: {account.provider}
                </DrawerDescription>
              </div>
            </div>
          </DrawerHeader>
          <div className="px-10 overflow-y-auto flex-1">
            {content}
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-hidden flex flex-col rounded-3xl border-none p-0 shadow-2xl bg-white">
        <DialogHeader className="flex-shrink-0 p-10 pb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className={cn("size-14 rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200", colorClass)}>
                <Icon className="size-7 text-white" />
              </div>
              <div className="space-y-1">
                <DialogTitle className="text-3xl font-black uppercase tracking-tight text-slate-900 leading-none">Cấu trúc Tích hợp</DialogTitle>
                <DialogDescription className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                  Quản lý thực thể: {account.provider} Node
                </DialogDescription>
              </div>
            </div>
            <Button onClick={onClose} variant="ghost" className="size-10 rounded-xl bg-slate-50 hover:bg-slate-100 p-0 text-slate-400">
              <X className="size-5" />
            </Button>
          </div>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 px-10">
          {content}
        </div>
        <div className="p-10 pt-4 mt-auto border-t border-slate-50 bg-slate-50/30 flex items-center gap-4">
          <div className="size-10 rounded-xl bg-white flex items-center justify-center text-emerald-500 shadow-sm border border-slate-100">
            <ShieldCheck className="size-5" />
          </div>
          <div className="space-y-0.5">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Trạng thái Node</p>
            <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">XÁC THỰC THÀNH CÔNG • AN TOÀN</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

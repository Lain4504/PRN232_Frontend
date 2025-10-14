'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Trash2,
  MoreHorizontal,
  Users,
  Building2,
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
import { SocialAccountDto } from '@/lib/types/aisam-types'
import {SiFacebook, SiTiktok, SiInstagram} from "@icons-pack/react-simple-icons";

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
  facebook: 'bg-blue-500',
  tiktok: 'bg-black',
  instagram: 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600',
} as const

export function IntegrationsModal({ account, isOpen, onClose, onDeleteTarget }: IntegrationsModalProps) {
  const isMobile = useIsMobile()
  const Icon = providerIcons[account.provider]
  const colorClass = providerColors[account.provider]

  const content = (
    <div className="space-y-4">
        {account.targets && account.targets.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Linked Pages ({account.targets.length})</span>
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {account.targets.map((target) => (
                <div
                  key={target.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-background/50"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Avatar className="h-8 w-8 ring-1 ring-muted flex-shrink-0">
                      <AvatarImage src={target.profilePictureUrl} alt={target.name} />
                      <AvatarFallback className="text-sm font-semibold">
                        {target.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{target.name}</p>
                      <div className="flex items-center gap-2 flex-wrap mt-1">
                        <Badge variant="outline" className="text-xs">
                          {target.type}
                        </Badge>
                        {target.brandName && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Building2 className="h-3 w-3" />
                            <span className="truncate">{target.brandName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-muted flex-shrink-0">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => onDeleteTarget(target.id, account.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Unlink Page
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted mx-auto mb-3">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <h4 className="font-medium mb-2">No pages linked</h4>
            <p className="text-sm text-muted-foreground">
              This {account.provider} account has no linked pages yet.
            </p>
          </div>
        )}
    </div>
  )

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="max-h-[90vh] flex flex-col">
          <DrawerHeader className="flex-shrink-0 text-left">
            <DrawerTitle className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${colorClass} shadow-sm`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              {account.provider} Integrations
            </DrawerTitle>
            <DrawerDescription>
              View and manage pages linked to this {account.provider} account.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 overflow-y-auto flex-1">
            {content}
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${colorClass} shadow-sm`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            {account.provider} Integrations
          </DialogTitle>
          <DialogDescription>
            View and manage pages linked to this {account.provider} account.
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto flex-1">
          {content}
        </div>
      </DialogContent>
    </Dialog>
  )
}

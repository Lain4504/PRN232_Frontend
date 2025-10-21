'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { useIsMobile } from '@/hooks/use-mobile'
import { BrandForm } from '@/components/brands/brand-form'
import { Brand } from '@/lib/types/aisam-types'

interface BrandModalProps {
  children?: React.ReactNode
  mode: 'create' | 'edit'
  brand?: Brand
  onSuccess?: () => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function BrandModal({ children, mode, brand, onSuccess, open: controlledOpen, onOpenChange }: BrandModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isMobile = useIsMobile()
  
  // Use controlled open if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen

  const handleSuccess = () => {
    setOpen(false)
    onSuccess?.()
  }

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        {children && (
          <DrawerTrigger asChild>
            {children}
          </DrawerTrigger>
        )}
        <DrawerContent className="max-h-[90vh] flex flex-col">
          <DrawerHeader className="flex-shrink-0 text-left">
            <DrawerTitle>
              {mode === 'create' ? 'Create Brand' : 'Edit Brand'}
            </DrawerTitle>
            <DrawerDescription>
              {mode === 'create' 
                ? 'Set up a new brand for your business.'
                : 'Update your brand information.'
              }
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 overflow-y-auto flex-1">
            <BrandForm 
              mode={mode} 
              brand={brand} 
              onSuccess={handleSuccess}
              onCancel={() => setOpen(false)}
            />
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && (
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            {mode === 'create' ? 'Create Brand' : 'Edit Brand'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Set up a new brand for your business.'
              : 'Update your brand information.'
            }
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto flex-1">
          <BrandForm 
            mode={mode} 
            brand={brand} 
            onSuccess={handleSuccess}
            onCancel={() => setOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
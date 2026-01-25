'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { useIsMobile } from '@/hooks/use-mobile'
import { BrandForm } from '@/components/brands/brand-form'
import { Brand } from '@/lib/types/aisam-types'
import { useTranslation } from 'react-i18next'

interface BrandModalProps {
  children?: React.ReactNode
  mode: 'create' | 'edit'
  brand?: Brand
  onSuccess?: () => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function BrandModal({ children, mode, brand, onSuccess, open: controlledOpen, onOpenChange }: BrandModalProps) {
  const { t } = useTranslation("common");
  const [internalOpen, setInternalOpen] = useState(false)
  const isMobile = useIsMobile()

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen

  const handleSuccess = () => {
    setOpen(false)
    onSuccess?.()
  }

  const title = mode === 'create' ? t("brands.form.titleCreate") : t("brands.form.titleEdit");
  const description = mode === 'create' ? t("brands.form.descCreate") : t("brands.form.descEdit");

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        {children && (
          <DrawerTrigger asChild>
            {children}
          </DrawerTrigger>
        )}
        <DrawerContent className="max-h-[95vh] flex flex-col font-fira-sans">
          <DrawerHeader className="flex-shrink-0 text-left border-b pb-4">
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 py-4 overflow-y-auto flex-1">
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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col font-fira-sans">
        <DialogHeader className="flex-shrink-0 border-b pb-4">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 py-4">
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
"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { useIsMobile } from '@/hooks/use-mobile'
import { BrandForm } from '@/components/brands/brand-form'
import { Brand } from '@/lib/types/omniadly-types'

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

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen

  const handleSuccess = () => {
    setOpen(false)
    onSuccess?.()
  }

  const title = mode === 'create' ? "Tạo thương hiệu" : "Chỉnh sửa thương hiệu";
  const description = mode === 'create'
    ? "Điền thông tin để đăng ký thương hiệu mới."
    : "Cập nhật thông tin chi tiết của thương hiệu.";

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        {children && (
          <DrawerTrigger asChild>
            {children}
          </DrawerTrigger>
        )}
        <DrawerContent className="max-h-[95vh] flex flex-col">
          <DrawerHeader className="text-left border-b">
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 overflow-y-auto flex-1">
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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 p-6">
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

"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { useIsMobile } from '@/hooks/use-mobile'
import { BrandForm } from '@/components/brands/brand-form'
import { Brand } from '@/lib/types/omniadly-types'
import { Landmark, X, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'

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

  const title = mode === 'create' ? "Kiến tạo Thương hiệu" : "Cấu hình Thương hiệu";
  const description = mode === 'create'
    ? "Thiết lập nền tảng định danh và giá trị cốt lõi cho thương hiệu mới."
    : "Hiệu chỉnh các tham số chiến lược và nhận diện của thương hiệu.";

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        {children && (
          <DrawerTrigger asChild>
            {children}
          </DrawerTrigger>
        )}
        <DrawerContent className="max-h-[95vh] flex flex-col rounded-t-[3rem] border-none shadow-2xl bg-white dark:bg-slate-900">
          <DrawerHeader className="flex-shrink-0 text-left p-6 pb-2">
            <div className="size-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-6 border border-slate-200 dark:border-slate-700">
              <Target className="size-6" />
            </div>
            <DrawerTitle className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white leading-none">{title}</DrawerTitle>
            <DrawerDescription className="text-sm font-medium text-slate-400 dark:text-slate-500 mt-2 italic">{description}</DrawerDescription>
          </DrawerHeader>
          <div className="px-6 overflow-y-auto flex-1 pb-6 scrollbar-hide">
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
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col rounded-3xl border-none p-0 shadow-2xl bg-white dark:bg-slate-900 transition-all duration-300">
        <DialogHeader className="flex-shrink-0 p-8 pb-4">
          <div className="flex items-center justify-between">
            <div className="size-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-0 border border-slate-200 dark:border-slate-700 shadow-sm">
              <Landmark className="size-8" />
            </div>
            <Button onClick={() => setOpen(false)} variant="ghost" className="size-10 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 p-0 text-slate-400 dark:text-slate-500">
              <X className="size-5" />
            </Button>
          </div>
          <div className="mt-8">
            <DialogTitle className="text-4xl font-black uppercase tracking-tight text-slate-900 dark:text-white leading-none">{title}</DialogTitle>
            <DialogDescription className="text-base font-medium text-slate-500 dark:text-slate-400 mt-2 italic">{description}</DialogDescription>
          </div>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 px-8 pb-8 scrollbar-hide">
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

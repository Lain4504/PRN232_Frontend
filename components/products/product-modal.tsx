"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { useIsMobile } from '@/hooks/use-mobile'
import { Plus, Edit, Package, X, Boxes } from 'lucide-react'
import { ProductForm } from '@/components/products/product-form'
import { TeamProductForm } from '@/components/products/product-form-team'
import { Product, Brand } from '@/lib/types/omniadly-types'
import { cn } from "@/lib/utils"

interface ProductModalProps {
  children?: React.ReactNode
  mode: 'create' | 'edit'
  product?: Product
  defaultBrandId?: string
  brands?: Brand[]
  teamId?: string
  onSuccess?: () => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ProductModal({ children, mode, product, defaultBrandId, brands, teamId, onSuccess, open: controlledOpen, onOpenChange: setControlledOpen }: ProductModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = setControlledOpen || setInternalOpen
  const isMobile = useIsMobile()

  const handleSuccess = () => {
    setOpen(false)
    onSuccess?.()
  }

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        {mode === 'create' && (
          <DrawerTrigger asChild>
            {children || (
              <Button className="rounded-xl h-12">
                <Plus className="mr-2 h-4 w-4" />
                Thêm sản phẩm
              </Button>
            )}
          </DrawerTrigger>
        )}
        <DrawerContent className="max-h-[90vh] flex flex-col rounded-t-[3rem] border-none shadow-2xl bg-white">
          <DrawerHeader className="flex-shrink-0 text-left p-8 overflow-hidden">
            <div className="size-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4 border border-slate-200">
              <Package className="size-6" />
            </div>
            <DrawerTitle className="text-2xl font-black uppercase tracking-tight text-slate-900 leading-none">
              {mode === 'create' ? 'Tạo Sản phẩm Mới' : 'Hiệu chỉnh Sản phẩm'}
            </DrawerTitle>
            <DrawerDescription className="text-sm font-medium text-slate-400 mt-2 italic">
              {mode === 'create'
                ? 'Thiết lập thông số cho thực thể sản phẩm mới trong kho hàng.'
                : 'Cập nhật các thuộc tính và dữ liệu định danh của sản phẩm.'
              }
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-8 overflow-y-auto flex-1 pb-10 scrollbar-hide">
            {teamId ? (
              <TeamProductForm
                mode={mode}
                product={product}
                defaultBrandId={defaultBrandId}
                teamId={teamId}
                onSuccess={handleSuccess}
                onCancel={() => setOpen(false)}
              />
            ) : (
              <ProductForm
                mode={mode}
                product={product}
                defaultBrandId={defaultBrandId}
                brands={brands}
                onSuccess={handleSuccess}
                onCancel={() => setOpen(false)}
              />
            )}
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {mode === 'create' && (
        <DialogTrigger asChild>
          {children || (
            <Button className="rounded-xl h-12 shadow-md">
              <Plus className="mr-2 h-4 w-4" />
              Thêm sản phẩm
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col rounded-[3rem] border-none p-0 shadow-2xl bg-white">
        <DialogHeader className="flex-shrink-0 p-12 pb-6">
          <div className="flex items-center justify-between">
            <div className="size-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-0 border border-slate-200 shadow-sm">
              <Boxes className="size-8" />
            </div>
            <Button onClick={() => setOpen(false)} variant="ghost" className="size-10 rounded-xl bg-slate-50 hover:bg-slate-100 p-0 text-slate-400">
              <X className="size-5" />
            </Button>
          </div>
          <div className="mt-8">
            <DialogTitle className="text-4xl font-black uppercase tracking-tight text-slate-900 leading-none">
              {mode === 'create' ? 'Tạo Sản phẩm Mới' : 'Hiệu chỉnh Sản phẩm'}
            </DialogTitle>
            <DialogDescription className="text-base font-medium text-slate-500 mt-2 italic">
              {mode === 'create'
                ? 'Khai báo thông tin kỹ thuật và giá trị thị trường cho sản phẩm.'
                : 'Đồng bộ hóa các thay đổi mới nhất về sản phẩm vào hệ thống kho.'
              }
            </DialogDescription>
          </div>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 px-12 pb-12 scrollbar-hide">
          {teamId ? (
            <TeamProductForm
              mode={mode}
              product={product}
              defaultBrandId={defaultBrandId}
              teamId={teamId}
              onSuccess={handleSuccess}
              onCancel={() => setOpen(false)}
            />
          ) : (
            <ProductForm
              mode={mode}
              product={product}
              defaultBrandId={defaultBrandId}
              brands={brands}
              onSuccess={handleSuccess}
              onCancel={() => setOpen(false)}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

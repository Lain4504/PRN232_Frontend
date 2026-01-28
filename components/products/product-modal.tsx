"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { useIsMobile } from '@/hooks/use-mobile'
import { Plus } from 'lucide-react'
import { ProductForm } from '@/components/products/product-form'
import { TeamProductForm } from '@/components/products/product-form-team'
import { Product, Brand } from '@/lib/types/omniadly-types'

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

  const title = mode === 'create' ? 'Tạo sản phẩm' : 'Chỉnh sửa sản phẩm';
  const description = mode === 'create'
    ? 'Nhập thông tin để thêm sản phẩm mới vào thương hiệu.'
    : 'Cập nhật thông tin chi tiết của sản phẩm.';

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        {mode === 'create' && (
          <DrawerTrigger asChild>
            {children || (
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Thêm sản phẩm
              </Button>
            )}
          </DrawerTrigger>
        )}
        <DrawerContent className="max-h-[95vh] flex flex-col">
          <DrawerHeader className="text-left border-b">
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 overflow-y-auto flex-1">
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
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Thêm sản phẩm
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 p-6">
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

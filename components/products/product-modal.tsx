'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { useIsMobile } from '@/hooks/use-mobile'
import { Plus, Edit } from 'lucide-react'
import { ProductForm } from '@/components/products/product-form'
import { TeamProductForm } from '@/components/products/product-form-team'
import { Product, Brand } from '@/lib/types/omniadly-types'

interface ProductModalProps {
  children?: React.ReactNode
  mode: 'create' | 'edit'
  product?: Product
  defaultBrandId?: string
  brands?: Brand[] // Optional: pass brands from parent (e.g., team brands)
  teamId?: string // Optional: if provided, use TeamProductForm instead of ProductForm
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
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            )}
          </DrawerTrigger>
        )}
        <DrawerContent className="max-h-[90vh] flex flex-col">
          <DrawerHeader className="flex-shrink-0 text-left">
            <DrawerTitle>
              {mode === 'create' ? 'Add New Product' : 'Edit Product'}
            </DrawerTitle>
            <DrawerDescription>
              {mode === 'create' 
                ? 'Create a new product for your catalog.'
                : 'Update your product information.'
              }
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 overflow-y-auto flex-1">
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
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            {mode === 'create' ? 'Add New Product' : 'Edit Product'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Create a new product for your catalog.'
              : 'Update your product information.'
            }
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto flex-1">
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

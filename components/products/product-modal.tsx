'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { useIsMobile } from '@/hooks/use-mobile'
import { Plus, Edit } from 'lucide-react'
import { ProductForm } from '@/components/products/product-form'
import { Product } from '@/lib/types/aisam-types'

interface ProductModalProps {
  children?: React.ReactNode
  mode: 'create' | 'edit'
  product?: Product
  onSuccess?: () => void
}

export function ProductModal({ children, mode, product, onSuccess }: ProductModalProps) {
  const [open, setOpen] = useState(false)
  const isMobile = useIsMobile()

  const handleSuccess = () => {
    setOpen(false)
    onSuccess?.()
  }

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          {children || (
            <Button>
              {mode === 'create' ? (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </>
              ) : (
                <>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Product
                </>
              )}
            </Button>
          )}
        </DrawerTrigger>
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
            <ProductForm 
              mode={mode} 
              product={product} 
              onSuccess={handleSuccess}
              onCancel={() => setOpen(false)}
            />
          </div>
          <DrawerFooter className="flex-shrink-0 pt-2">
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            {mode === 'create' ? (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </>
            ) : (
              <>
                <Edit className="mr-2 h-4 w-4" />
                Edit Product
              </>
            )}
          </Button>
        )}
      </DialogTrigger>
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
          <ProductForm 
            mode={mode} 
            product={product} 
            onSuccess={handleSuccess}
            onCancel={() => setOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
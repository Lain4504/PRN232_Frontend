"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { useIsMobile } from '@/hooks/use-mobile'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Building2, AlertCircle, ChevronRight, CheckCircle2, Globe, Loader2, Users } from 'lucide-react'
import { useGetAvailableTargets, useGetBrands, useLinkTargets } from '@/hooks/use-social-accounts'
import { toast } from 'sonner'
import { useAuth } from '@/lib/contexts/auth-context'
import { cn } from "@/lib/utils"

interface LinkIntegrationModalProps {
  socialAccountId: string
  provider: string
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function LinkIntegrationModal({
  socialAccountId,
  provider,
  children,
  open: controlledOpen,
  onOpenChange
}: LinkIntegrationModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen
  const isMobile = useIsMobile()

  const title = "Liên kết với thương hiệu";
  const description = `Chọn thương hiệu để quản lý các trang từ tài khoản ${provider}.`;

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          {children || (
            <Button variant="outline" size="sm">
              Gán thương hiệu
            </Button>
          )}
        </DrawerTrigger>
        <DrawerContent className="max-h-[95vh] flex flex-col">
          <DrawerHeader className="text-left border-b">
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 overflow-y-auto flex-1">
            <LinkIntegrationForm
              socialAccountId={socialAccountId}
              provider={provider}
              onSuccess={() => setOpen(false)}
            />
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            Gán thương hiệu
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 p-6">
          <LinkIntegrationForm
            socialAccountId={socialAccountId}
            provider={provider}
            onSuccess={() => setOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

function LinkIntegrationForm({
  socialAccountId,
  provider,
  className,
  onSuccess
}: {
  socialAccountId: string
  provider: string
  className?: string
  onSuccess: () => void
}) {
  const [selectedBrandId, setSelectedBrandId] = useState<string>('')
  const [selectedTargets, setSelectedTargets] = useState<string[]>([])
  const [isLinking, setIsLinking] = useState(false)

  const { user, isLoading: userLoading } = useAuth()
  const { data: brands = [], isLoading: brandsLoading } = useGetBrands()
  const { data: availableTargets = [], isLoading: targetsLoading, error: targetsError } = useGetAvailableTargets(socialAccountId)
  const linkTargetsMutation = useLinkTargets()

  useEffect(() => {
    setSelectedBrandId('')
    setSelectedTargets([])
  }, [socialAccountId])

  const handleTargetToggle = (targetId: string) => {
    setSelectedTargets(prev =>
      prev.includes(targetId)
        ? prev.filter(id => id !== targetId)
        : [...prev, targetId]
    )
  }

  const handleLink = async () => {
    if (!selectedBrandId) {
      toast.error('Vui lòng chọn một thương hiệu')
      return
    }
    if (selectedTargets.length === 0) {
      toast.error('Vui lòng chọn ít nhất một trang')
      return
    }

    try {
      setIsLinking(true)
      const activeProfileId = localStorage.getItem('activeProfileId')
      if (!activeProfileId) throw new Error('Chưa chọn hồ sơ hoạt động')

      await linkTargetsMutation.mutateAsync({
        socialAccountId,
        data: {
          profileId: activeProfileId,
          provider,
          providerTargetIds: selectedTargets,
          brandId: selectedBrandId
        }
      })
      toast.success('Đã liên kết thành công')
      onSuccess()
    } catch (error) {
      toast.error('Lỗi khi thực hiện liên kết')
    } finally {
      setIsLinking(false)
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-foreground">Thương hiệu tiếp nhận</Label>
        <Select value={selectedBrandId} onValueChange={setSelectedBrandId}>
          <SelectTrigger>
            <SelectValue placeholder="Chọn thương hiệu..." />
          </SelectTrigger>
          <SelectContent>
            {brandsLoading ? (
              <SelectItem value="loading" disabled>Đang tải danh sách...</SelectItem>
            ) : brands.length === 0 ? (
              <SelectItem value="no-brands" disabled>Chưa có thương hiệu</SelectItem>
            ) : (
              brands.map((brand) => (
                <SelectItem key={brand.id} value={brand.id}>
                  {brand.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-semibold text-foreground">Các trang khả dụng</Label>
        {targetsLoading ? (
          <div className="space-y-2">
            <div className="h-12 w-full bg-muted animate-pulse rounded border border-border" />
            <div className="h-12 w-full bg-muted animate-pulse rounded border border-border" />
          </div>
        ) : targetsError ? (
          <div className="p-6 rounded-lg bg-destructive/10 border border-destructive/20 text-center">
            <AlertCircle className="size-8 text-destructive mx-auto mb-2" />
            <p className="text-xs text-destructive font-bold">Lỗi tải dữ liệu. Vui lòng thử lại.</p>
          </div>
        ) : availableTargets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border rounded-xl bg-muted/30">
            <Users className="size-10 text-muted-foreground/30 mb-4" />
            <h4 className="text-sm font-bold text-foreground mb-1">Chưa có kênh liên kết</h4>
            <p className="text-xs text-muted-foreground max-w-[200px] italic">
              Tài khoản này hiện chưa có thực thể nào được đồng bộ.
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {availableTargets.map((target) => (
              <div
                key={target.providerTargetId}
                onClick={() => handleTargetToggle(target.providerTargetId)}
                className={cn(
                  "flex items-center gap-4 p-3 rounded-lg border transition-all cursor-pointer",
                  selectedTargets.includes(target.providerTargetId)
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "bg-card border-border hover:border-primary/50"
                )}
              >
                <div className={cn("size-4 rounded border flex items-center justify-center",
                  selectedTargets.includes(target.providerTargetId) ? "bg-primary border-primary" : "border-border"
                )}>
                  {selectedTargets.includes(target.providerTargetId) && <CheckCircle2 className="size-3 text-primary-foreground" />}
                </div>
                <Avatar className="size-10 rounded border border-border bg-background">
                  <AvatarImage src={target.profilePictureUrl} alt={target.name} className="object-cover" />
                  <AvatarFallback className="bg-muted text-muted-foreground font-bold">
                    {target.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-foreground truncate">{target.name}</p>
                    {target.type && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-semibold bg-muted text-muted-foreground border-none">
                        {target.type}
                      </Badge>
                    )}
                  </div>
                  {target.category && (
                    <p className="text-[10px] text-muted-foreground truncate">{target.category}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-4 border-t mt-6">
        <Button
          onClick={handleLink}
          disabled={!selectedBrandId || selectedTargets.length === 0 || isLinking || brands.length === 0 || userLoading || !user?.id}
          className="w-full h-11"
        >
          {isLinking ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Đang thực hiện...
            </>
          ) : (
            `Xác nhận liên kết (${selectedTargets.length})`
          )}
        </Button>
      </div>
    </div>
  )
}

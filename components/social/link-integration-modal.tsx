"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { useIsMobile } from '@/hooks/use-mobile'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Link, Building2, AlertCircle, ChevronRight, CheckCircle2, Globe } from 'lucide-react'
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

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          {children || (
            <Button variant="outline" className="rounded-xl h-12">
              <Link className="mr-2 h-4 w-4" />
              Gán Thương hiệu
            </Button>
          )}
        </DrawerTrigger>
        <DrawerContent className="max-h-[90vh] flex flex-col rounded-t-[2.5rem] border-none shadow-2xl">
          <DrawerHeader className="flex-shrink-0 text-left p-8 pb-0">
            <div className="size-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
              <Building2 className="size-6" />
            </div>
            <DrawerTitle className="text-2xl font-black uppercase tracking-tight">Gán Trang vào Brand</DrawerTitle>
            <DrawerDescription className="text-sm font-medium text-slate-500 mt-2">
              Liên kết các thực thể {provider} vào hệ quản trị của từng thương hiệu.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-8 overflow-y-auto flex-1 mt-6 pb-10">
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
          <Button variant="outline" className="rounded-xl h-12 border-slate-200">
            <Link className="mr-2 h-4 w-4" />
            Gán Thương hiệu
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col rounded-[2.5rem] border-none p-0 shadow-2xl bg-white">
        <DialogHeader className="flex-shrink-0 p-10 pb-0">
          <div className="size-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-6 border border-slate-200 shadow-sm">
            <Building2 className="size-6" />
          </div>
          <DialogTitle className="text-3xl font-black uppercase tracking-tight text-slate-900 leading-none">Liên kết thực thể</DialogTitle>
          <DialogDescription className="text-sm font-medium text-slate-500 mt-2 italic">
            Xác định các trang Fanpage hoặc tài khoản Business thuộc về thương hiệu nào trong ma trận.
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 p-10 pt-8">
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
      toast.error('Vui lòng chọn ít nhất một trang để liên kết')
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
      toast.success('Đã liên kết các trang vào thương hiệu thành công')
      onSuccess()
    } catch (error) {
      toast.error('Lỗi khi thực hiện liên kết')
    } finally {
      setIsLinking(false)
    }
  }

  const selectedBrand = brands.find(b => b.id === selectedBrandId)

  return (
    <div className={cn("space-y-10", className)}>
      {/* Brand Selection */}
      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Thương hiệu đích</label>
        <div className="flex items-center gap-3 bg-white p-2 border-2 border-slate-100 rounded-2xl shadow-sm focus-within:border-slate-900 transition-all">
          <div className="size-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shrink-0">
            <Building2 className="size-5" />
          </div>
          <Select value={selectedBrandId} onValueChange={setSelectedBrandId}>
            <SelectTrigger className="border-none focus:ring-0 shadow-none font-bold text-slate-900 bg-transparent h-10 w-full">
              <SelectValue placeholder="Chọn một thương hiệu trong danh sách" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-1">
              {brandsLoading ? (
                <SelectItem value="loading" disabled className="rounded-xl">Đang tải danh sách...</SelectItem>
              ) : brands.length === 0 ? (
                <SelectItem value="no-brands" disabled className="rounded-xl">Chưa có thương hiệu khả dụng</SelectItem>
              ) : (
                brands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id} className="rounded-xl h-12 focus:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <span className="font-black text-slate-900 uppercase tracking-tight">{brand.name}</span>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Pages List */}
      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Danh sách thực thể khả dụng</label>
        {targetsLoading ? (
          <div className="space-y-3">
            <div className="h-16 w-full bg-slate-50 animate-pulse rounded-2xl" />
            <div className="h-16 w-full bg-slate-50 animate-pulse rounded-2xl" />
          </div>
        ) : targetsError ? (
          <div className="p-8 rounded-[2rem] bg-rose-50 border border-rose-100 text-center">
            <AlertCircle className="size-10 text-rose-500 mx-auto mb-4" />
            <p className="text-sm font-black text-rose-600 uppercase tracking-widest leading-relaxed">
              Lỗi tải dữ liệu thực thể. Vui lòng kiểm tra quyền truy cập tài khoản.
            </p>
          </div>
        ) : availableTargets.length === 0 ? (
          <div className="p-10 rounded-[2rem] bg-slate-50 border border-slate-100 text-center border-dashed">
            <Globe className="size-10 text-slate-200 mx-auto mb-4" />
            <p className="text-sm font-black text-slate-500 uppercase tracking-tighter">
              Không tìm thấy trang nào trên tài khoản {provider} này.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 scrollbar-hide">
            {availableTargets.map((target) => (
              <div
                key={target.providerTargetId}
                onClick={() => handleTargetToggle(target.providerTargetId)}
                className={cn(
                  "flex items-center gap-5 p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer group",
                  selectedTargets.includes(target.providerTargetId)
                    ? "border-slate-900 bg-slate-50 shadow-lg shadow-slate-100 ring-2 ring-slate-100"
                    : "border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                )}
              >
                <div className={cn("size-6 rounded-lg border-2 flex items-center justify-center transition-colors",
                  selectedTargets.includes(target.providerTargetId) ? "bg-slate-900 border-slate-900" : "border-slate-200"
                )}>
                  {selectedTargets.includes(target.providerTargetId) && <CheckCircle2 className="size-3.5 text-white" />}
                </div>
                <Avatar className="h-12 w-12 rounded-xl border border-white shadow-sm ring-2 ring-slate-100">
                  <AvatarImage src={target.profilePictureUrl} alt={target.name} className="object-cover" />
                  <AvatarFallback className="bg-slate-900 text-white font-black text-xs">
                    {target.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-black text-slate-900 uppercase tracking-tight text-sm leading-none">{target.name}</p>
                    {target.type && (
                      <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest border-none px-2 rounded-lg">
                        {target.type}
                      </Badge>
                    )}
                  </div>
                  {target.category && (
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{target.category}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-4">
        <Button
          onClick={handleLink}
          disabled={!selectedBrandId || selectedTargets.length === 0 || isLinking || brands.length === 0 || userLoading || !user?.id}
          className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-slate-200 transition-all hover:-translate-y-1"
        >
          {isLinking ? (
            <>
              <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Đang gán thực thể...
            </>
          ) : (
            <>
              Thiết lập liên kết ({selectedTargets.length}) <ChevronRight className="ml-2 size-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

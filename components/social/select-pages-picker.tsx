"use client"

import * as React from "react"
import { useMemo, useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Loader2, Search, CheckCircle2 } from "lucide-react"
import { fetchRest } from "@/lib/custom-api/rest-client"
import { endpoints } from "@/lib/custom-api/endpoints"
import { AvailableTargetsResponse, LinkSelectedResponse } from "@/lib/provider/social-types"
import { useAuthStore } from "@/lib/store/auth-store"
import { useIsMobile } from "@/hooks/use-mobile"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from "@/components/ui/drawer"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type Provider = 'facebook'

export function SelectPagesPicker({
  open,
  onOpenChange,
  provider = 'facebook',
  onLinked,
}: {
  open: boolean
  onOpenChange: (value: boolean) => void
  provider?: Provider
  onLinked?: () => void
}) {
  const isMobile = useIsMobile()
  const { user, isAuthenticated } = useAuthStore()

  const [targets, setTargets] = useState<AvailableTargetsResponse['data']['targets']>([])
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isLinking, setIsLinking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filteredTargets = useMemo(
    () => targets.filter((t) => filterFn(t, search)),
    [targets, search]
  )

  const allSelected = useMemo(
    () => filteredTargets.length > 0 && filteredTargets.every((t) => selected[t.providerTargetId]),
    [filteredTargets, selected]
  )

  const selectedCount = useMemo(
    () => Object.values(selected).filter(Boolean).length,
    [selected]
  )

  useEffect(() => {
    if (!open) return
    if (!isAuthenticated || !user) return
    const loadTargets = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const { data, error } = await fetchRest<AvailableTargetsResponse>(endpoints.availableTargets(provider), {
          method: 'GET',
          requireAuth: true,
        })
        if (error) throw new Error(error.message || 'Failed to load available targets')
        if (data?.success) {
          setTargets(data.data.targets || [])
        } else {
          throw new Error('Failed to load available targets')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }
    loadTargets()
  }, [open, provider, isAuthenticated, user])

  const toggleSelectAll = () => {
    const newSelected: Record<string, boolean> = { ...selected }
    if (allSelected) {
      filteredTargets.forEach((t) => {
        newSelected[t.providerTargetId] = false
      })
    } else {
      filteredTargets.forEach((t) => {
        newSelected[t.providerTargetId] = true
      })
    }
    setSelected(newSelected)
  }

  const toggleSelect = (providerTargetId: string) => {
    setSelected((prev) => ({ ...prev, [providerTargetId]: !prev[providerTargetId] }))
  }

  const handleLinkSelected = async () => {
    if (!user) return
    const providerTargetIds = Object.entries(selected)
      .filter(([, v]) => v)
      .map(([k]) => k)
    if (providerTargetIds.length === 0) {
      alert('Vui lòng chọn ít nhất một trang.')
      return
    }
    try {
      setIsLinking(true)
      const { data, error } = await fetchRest<LinkSelectedResponse>(endpoints.linkSelectedTargets(), {
        method: 'POST',
        body: {
          userId: user.id,
          provider,
          providerTargetIds,
        },
        requireAuth: true,
      })
      if (error) throw new Error(error.message || 'Liên kết thất bại')
      if (data?.success) {
        onLinked?.()
        onOpenChange(false)
      } else {
        throw new Error('Liên kết thất bại')
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Lỗi không xác định')
    } finally {
      setIsLinking(false)
    }
  }

  const content = (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Thử lại
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-col sm:flex-row sm:items-stretch">
            <div className="relative w-full sm:flex-1">
              <Input placeholder="Tìm trang..." value={search} onChange={(e) => setSearch(e.target.value)} />
              <Search className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <Button className="w-full sm:w-auto" variant="outline" onClick={toggleSelectAll}>
              {allSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </Button>
          </div>

          <Separator />

          <div className="space-y-2 max-h-[60vh] overflow-auto pr-1">
            {filteredTargets.map((t) => (
              <div key={t.providerTargetId} className="flex items-center gap-3 p-2 rounded border bg-white">
                <Checkbox checked={!!selected[t.providerTargetId]} onCheckedChange={() => toggleSelect(t.providerTargetId)} />
                <Avatar className="h-8 w-8">
                  <AvatarImage src={t.profilePictureUrl} />
                  <AvatarFallback>{t.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{t.name}</div>
                  <div className="text-xs text-gray-500 capitalize truncate">
                    {t.type} • {t.category || 'Không có danh mục'}
                  </div>
                </div>
                {selected[t.providerTargetId] && <CheckCircle2 className="h-4 w-4 text-green-600" />}
              </div>
            ))}
            {filteredTargets.length === 0 && (
              <div className="text-center text-gray-500 text-sm py-6">Không tìm thấy trang nào.</div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 flex-col-reverse sm:flex-row gap-3">
            <div className="text-sm text-gray-600 w-full sm:w-auto">Đã chọn: {selectedCount}</div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button className="flex-1 sm:flex-none" variant="outline" onClick={() => onOpenChange(false)} disabled={isLinking}>
                Hủy
              </Button>
              <Button className="flex-1 sm:flex-none" onClick={handleLinkSelected} disabled={isLinking || selectedCount === 0}>
                {isLinking ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Đang liên kết...
                  </span>
                ) : (
                  'Liên kết đã chọn'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="px-2 py-1 sm:px-4 sm:py-2">
          <DrawerHeader className="text-left p-2 sm:p-4">
            <DrawerTitle className="text-base sm:text-lg">Chọn Trang để liên kết</DrawerTitle>
          </DrawerHeader>
          <div className="px-1 sm:px-4 pb-1 sm:pb-2">{content}</div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-2xl p-4 sm:p-6">
        <DialogHeader className="mb-2 sm:mb-0">
          <DialogTitle className="text-base sm:text-lg">Chọn Trang để liên kết</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  )
}

function filterFn(t: AvailableTargetsResponse['data']['targets'][number], q: string) {
  if (!q) return true
  const s = q.toLowerCase().trim()
  return t.name.toLowerCase().includes(s) || (t.category || '').toLowerCase().includes(s)
}



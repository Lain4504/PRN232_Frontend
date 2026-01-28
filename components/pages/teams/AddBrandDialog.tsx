"use client"

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { useIsMobile } from '@/hooks/use-mobile'
import { Building2, Search, Plus, Target, ChevronRight, CheckCircle2, X, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { api, endpoints } from '@/lib/api'
import { useBrands } from '@/hooks/use-brands'
import { useAssignBrands } from '@/hooks/use-teams'
import type { Brand } from '@/lib/types/omniadly-types'
import { cn } from "@/lib/utils"

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    teamId: string
    onSuccess?: () => void
}

export function AddBrandDialog({ open, onOpenChange, teamId, onSuccess }: Props) {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedBrands, setSelectedBrands] = useState<string[]>([])

    const { data: brands = [], isLoading: brandsLoading } = useBrands()
    const { mutateAsync: assignBrands, isPending: assigning } = useAssignBrands(teamId)
    const isMobile = useIsMobile()

    const filteredBrands = useMemo(() => {
        if (!searchQuery.trim()) return brands
        return brands.filter(brand =>
            brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            brand.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [brands, searchQuery])

    const handleBrandToggle = (brandId: string) => {
        setSelectedBrands(prev =>
            prev.includes(brandId)
                ? prev.filter(id => id !== brandId)
                : [...prev, brandId]
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (selectedBrands.length === 0) {
            toast.error('Vui lòng chọn ít nhất một thương hiệu')
            return
        }

        try {
            await assignBrands({ brandIds: selectedBrands })
            toast.success('Đã gán thương hiệu thành công!')
            resetForm()
            onOpenChange(false)
            onSuccess?.()
        } catch (error) {
            toast.error('Lỗi khi thực hiện gán thương hiệu')
        }
    }

    const resetForm = () => {
        setSearchQuery('')
        setSelectedBrands([])
    }

    useEffect(() => {
        if (!open) resetForm()
    }, [open])

    const AddBrandFormContent = ({ onCancel }: { onCancel: () => void }) => (
        <form onSubmit={handleSubmit} className="space-y-10">
            {/* Search Section */}
            <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Tìm kiếm thực thể</Label>
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                    <Input
                        type="text"
                        placeholder="Nhập tên thương hiệu muốn gán..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 h-14 bg-white border-2 border-slate-100 rounded-2xl shadow-sm focus-visible:ring-slate-100 font-medium transition-all"
                    />
                </div>
            </div>

            {/* Brands List */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Danh sách Thương hiệu khả dụng</Label>
                    {selectedBrands.length > 0 && (
                        <Badge variant="secondary" className="bg-slate-900 text-white border-none text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-lg">
                            Đã chọn {selectedBrands.length}
                        </Badge>
                    )}
                </div>

                {brandsLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => <div key={i} className="h-16 w-full bg-slate-50 animate-pulse rounded-2xl" />)}
                    </div>
                ) : filteredBrands.length === 0 ? (
                    <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50">
                        <Building2 className="size-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-xs font-black text-slate-400 uppercase tracking-tighter italic">
                            {searchQuery ? 'Không tìm thấy kết quả phù hợp.' : 'Chưa có dữ liệu thương hiệu khả dụng.'}
                        </p>
                    </div>
                ) : (
                    <div className="max-h-[350px] overflow-y-auto space-y-3 pr-2 scrollbar-hide">
                        {filteredBrands.map((brand) => (
                            <div
                                key={brand.id}
                                onClick={() => handleBrandToggle(brand.id)}
                                className={cn(
                                    "flex items-center gap-5 p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer group",
                                    selectedBrands.includes(brand.id)
                                        ? "border-slate-900 bg-slate-50 shadow-lg shadow-slate-100 ring-2 ring-slate-100"
                                        : "border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                                )}
                            >
                                <Checkbox
                                    checked={selectedBrands.includes(brand.id)}
                                    onCheckedChange={() => handleBrandToggle(brand.id)}
                                    className="size-5 rounded-lg border-slate-300 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                                            <Target className="size-5" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="font-black text-slate-900 text-sm uppercase tracking-tight truncate leading-none">{brand.name}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{brand.description?.slice(0, 50) || 'DỮ LIỆU THƯƠNG HIỆU'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6">
                <Button type="button" variant="outline" onClick={onCancel} className="h-14 rounded-2xl border-slate-100 bg-slate-50 text-slate-400 hover:bg-slate-100 font-black uppercase tracking-widest text-[10px] order-2 sm:order-1 flex-1 sm:flex-none sm:px-10">
                    Hủy bỏ
                </Button>
                <Button type="submit" disabled={assigning || selectedBrands.length === 0} className="h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-slate-200 transition-all hover:-translate-y-1 order-1 sm:order-2 flex-1 sm:flex-none sm:px-10">
                    {assigning ? (
                        <>
                            <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Đang xử lý...
                        </>
                    ) : (
                        <>
                            Gán Thực thể ({selectedBrands.length}) <ChevronRight className="ml-2 size-4" />
                        </>
                    )}
                </Button>
            </div>
        </form>
    )

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerContent className="max-h-[90vh] flex flex-col rounded-t-[3rem] border-none shadow-2xl bg-white">
                    <DrawerHeader className="flex-shrink-0 text-left p-6 pb-2">
                        <div className="size-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-6 border border-slate-200">
                            <Target className="size-6" />
                        </div>
                        <DrawerTitle className="text-2xl font-black uppercase tracking-tight text-slate-900 leading-none">Gán Thương hiệu</DrawerTitle>
                        <DrawerDescription className="text-sm font-medium text-slate-400 mt-2 italic">Kết nối các thực thể thương hiệu vào quyền quản lý của Đội ngũ.</DrawerDescription>
                    </DrawerHeader>
                    <div className="px-6 overflow-y-auto flex-1 pb-6">
                        <AddBrandFormContent onCancel={() => onOpenChange(false)} />
                    </div>
                </DrawerContent>
            </Drawer>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col rounded-3xl border-none p-0 shadow-2xl bg-white">
                <DialogHeader className="flex-shrink-0 p-8 pb-4">
                    <div className="size-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-8 border border-slate-200 shadow-sm">
                        <Target className="size-8" />
                    </div>
                    <DialogTitle className="text-4xl font-black uppercase tracking-tight text-slate-900 leading-none">Gán Thương hiệu</DialogTitle>
                    <DialogDescription className="text-base font-medium text-slate-500 mt-2 italic">Lựa chọn các thương hiệu con sẽ chịu sự quản lý trực tiếp từ đội ngũ chuyên gia này.</DialogDescription>
                </DialogHeader>
                <div className="overflow-y-auto flex-1 px-8 pb-8">
                    <AddBrandFormContent onCancel={() => onOpenChange(false)} />
                </div>
            </DialogContent>
        </Dialog>
    )
}

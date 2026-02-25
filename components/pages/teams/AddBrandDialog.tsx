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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

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
            // This catch block will handle errors if onError is not defined in useAssignBrands options
            // If onError is defined, it will be called first, and this catch block might not be reached depending on the hook's implementation.
            // For consistency, we'll keep the toast here as a fallback or if the user intends to handle it this way.
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
        <form onSubmit={handleSubmit} className="space-y-6"> {/* Adjusted spacing */}
            {/* Search Section */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative flex-1 w-full sm:max-w-xs group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                    <Input
                        placeholder="Tìm kiếm thương hiệu..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-10 bg-card border-border rounded-md shadow-sm focus-visible:ring-primary font-medium transition-all text-foreground"
                    />
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onCancel}
                    className="h-10 px-4 rounded-md font-semibold text-sm"
                >
                    Hủy bỏ
                </Button>
            </div>

            {/* Brands List */}
            <div className="space-y-4"> {/* Adjusted spacing */}
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold text-muted-foreground">Danh sách Thương hiệu khả dụng</Label>
                    {selectedBrands.length > 0 && (
                        <Badge variant="secondary" className="bg-primary text-primary-foreground border-none text-[10px] font-semibold px-3 py-1 rounded-md">
                            Đã chọn {selectedBrands.length}
                        </Badge>
                    )}
                </div>

                {brandsLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => <div key={i} className="h-12 w-full bg-muted animate-pulse rounded-lg" />)} {/* Adjusted height, bg-slate-50 to bg-muted, rounded-2xl to rounded-lg */}
                    </div>
                ) : filteredBrands.length === 0 ? (
                    <div className="py-16 text-center border-2 border-dashed border-border rounded-lg bg-muted/50"> {/* Adjusted padding, border-slate-100 to border-border, rounded-3xl to rounded-lg, bg-slate-50/50 to bg-muted/50 */}
                        <Building2 className="size-10 text-muted-foreground mx-auto mb-3" /> {/* Adjusted size, text-slate-200 to text-muted-foreground, mb-4 to mb-3 */}
                        <p className="text-sm font-medium text-muted-foreground italic">
                            {searchQuery ? 'Không tìm thấy kết quả phù hợp.' : 'Chưa có dữ liệu thương hiệu khả dụng.'}
                        </p>
                    </div>
                ) : (
                    <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2 scrollbar-hide"> {/* Adjusted max-height */}
                        {filteredBrands.map((brand) => (
                            <div
                                key={brand.id}
                                onClick={() => handleBrandToggle(brand.id)}
                                className={cn(
                                    "flex items-center gap-4 p-3 rounded-lg border transition-all duration-300 cursor-pointer group", // Adjusted gap, padding, rounded-2xl to rounded-lg, border-2 to border
                                    selectedBrands.includes(brand.id)
                                        ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary" // Adjusted border, bg, shadow, ring
                                        : "border-border bg-card hover:border-muted-foreground/50 hover:bg-muted/50" // Adjusted border, bg, hover styles
                                )}
                            >
                                <Checkbox
                                    checked={selectedBrands.includes(brand.id)}
                                    onCheckedChange={() => handleBrandToggle(brand.id)}
                                    className="size-5 rounded-md border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary" // Adjusted rounded-lg to rounded-md, border-slate-300 to border-border, bg-slate-900 to bg-primary
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-4 py-1 group/item"> {/* Adjusted gap, removed py-3 */}
                                        <Avatar className="size-10 rounded-md border border-border bg-muted shadow-sm transition-transform group-hover/item:scale-105">
                                            {brand.logo_url ? (
                                                <AvatarImage src={brand.logo_url || (brand as { logoUrl?: string }).logoUrl} alt={brand.name} className="object-cover" />
                                            ) : (
                                                <AvatarFallback className="bg-primary text-primary-foreground font-bold text-sm">
                                                    {brand.name.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            )}
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-foreground text-sm leading-none truncate group-hover/item:text-primary transition-colors">{brand.name}</p>
                                            <p className="text-[11px] font-medium text-muted-foreground mt-1">{brand.description?.slice(0, 50) || 'Dữ liệu thương hiệu'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex justify-end pt-4"> {/* Adjusted spacing */}
                <Button type="submit" disabled={assigning || selectedBrands.length === 0} className="h-10 px-6 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-sm transition-all">
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
                <DrawerContent className="max-h-[90vh] flex flex-col rounded-t-lg border-none shadow-2xl bg-popover">
                    <DrawerHeader className="flex-shrink-0 text-left p-6 pb-2">
                        <DrawerTitle className="text-xl font-bold tracking-tight text-foreground leading-none">Gán Thương hiệu</DrawerTitle>
                        <DrawerDescription className="text-sm font-medium text-muted-foreground mt-2">Lựa chọn các thương hiệu sẽ chịu sự quản lý trực tiếp từ đội ngũ này.</DrawerDescription>
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
            <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-hidden flex flex-col rounded-lg border-border p-0 shadow-lg bg-popover">
                <DialogHeader className="flex-shrink-0 p-8 pb-4">
                    <DialogTitle className="text-2xl font-bold tracking-tight text-foreground leading-none">Gán Thương hiệu</DialogTitle>
                    <DialogDescription className="text-sm font-medium text-muted-foreground mt-2">Lựa chọn các thương hiệu sẽ chịu sự quản lý trực tiếp từ đội ngũ này.</DialogDescription>
                </DialogHeader>
                <div className="overflow-y-auto flex-1 px-8 pb-8">
                    <AddBrandFormContent onCancel={() => onOpenChange(false)} />
                </div>
            </DialogContent>
        </Dialog>
    )
}

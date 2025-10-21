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
import { Building2, Search, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { api, endpoints } from '@/lib/api'
import { useBrands } from '@/hooks/use-brands'
import { useAssignBrands } from '@/hooks/use-teams'
import type { Brand } from '@/lib/types/aisam-types'

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

    // Filter brands based on search query
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
            toast.error('Please select at least one brand')
            return
        }

        try {
            await assignBrands({ brandIds: selectedBrands })

            toast.success('Brands added successfully!', {
                description: `${selectedBrands.length} brand(s) have been added to the team.`,
                duration: 3000,
            })

            resetForm()
            onOpenChange(false)
            onSuccess?.()
        } catch (error) {
            toast.error('Could not add brands', {
                description: error instanceof Error ? error.message : 'Please try again later.',
                duration: 4000,
            })
        }
    }

    const resetForm = () => {
        setSearchQuery('')
        setSelectedBrands([])
    }

    // Reset form when dialog closes
    useEffect(() => {
        if (!open) {
            resetForm()
        }
    }, [open])

    // Shared form content component
    const AddBrandFormContent = ({ onCancel }: { onCancel: () => void }) => (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Search Brands</Label>
                <div className="relative">
                    <Input
                        type="text"
                        placeholder="Search brands by name or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pr-8"
                    />
                    <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">
                    Select one or more brands to add to this team
                </p>
            </div>

            {/* Brands List */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Available Brands</Label>
                    {selectedBrands.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                            {selectedBrands.length} selected
                        </Badge>
                    )}
                </div>

                {brandsLoading ? (
                    <div className="text-sm text-muted-foreground">Loading brands...</div>
                ) : filteredBrands.length === 0 ? (
                    <div className="text-center py-8">
                        <Building2 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                            {searchQuery ? 'No brands found matching your search.' : 'No brands available.'}
                        </p>
                    </div>
                ) : (
                    <div className="max-h-64 overflow-y-auto space-y-2 border rounded-lg p-3">
                        {filteredBrands.map((brand) => (
                            <div key={brand.id} className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded-md">
                                <Checkbox
                                    id={brand.id}
                                    checked={selectedBrands.includes(brand.id)}
                                    onCheckedChange={() => handleBrandToggle(brand.id)}
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                        <span className="font-medium text-sm truncate">{brand.name}</span>
                                    </div>
                                    {brand.description && (
                                        <p className="text-xs text-muted-foreground truncate mt-1">
                                            {brand.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel} size="lg" className="w-full sm:w-auto">
                    Cancel
                </Button>
                <Button type="submit" disabled={assigning || selectedBrands.length === 0} size="lg" className="w-full sm:w-auto">
                    {assigning ? (
                        <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Adding...
                        </>
                    ) : (
                        <>
                            <Plus className="mr-2 h-4 w-4" />
                            Add {selectedBrands.length > 0 ? `${selectedBrands.length} Brand${selectedBrands.length > 1 ? 's' : ''}` : 'Brands'}
                        </>
                    )}
                </Button>
            </div>
        </form>
    )

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerContent className="max-h-[90vh] flex flex-col">
                    <DrawerHeader className="flex-shrink-0 text-left">
                        <DrawerTitle>Add Brands to Team</DrawerTitle>
                        <DrawerDescription>Select brands to manage with this team.</DrawerDescription>
                    </DrawerHeader>
                    <div className="px-4 overflow-y-auto flex-1">
                        <AddBrandFormContent onCancel={() => onOpenChange(false)} />
                    </div>
                </DrawerContent>
            </Drawer>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle>Add Brands to Team</DialogTitle>
                    <DialogDescription>Select brands to manage with this team.</DialogDescription>
                </DialogHeader>
                <div className="overflow-y-auto flex-1">
                    <AddBrandFormContent onCancel={() => onOpenChange(false)} />
                </div>
            </DialogContent>
        </Dialog>
    )
}

"use client"

import React, { useState, useEffect } from 'react'
import { useBrands } from '@/hooks/use-brands'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Building2, ChevronDown, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ProfileBrand {
  id: string
  name: string
  description?: string
  logoUrl?: string
  status?: string
}

interface ProfileBrandSelectorProps {
  selectedBrandId?: string
  onBrandChange?: (brandId: string) => void
  placeholder?: string
  disabled?: boolean
  showAllOption?: boolean
}

export function ProfileBrandSelector({
  selectedBrandId,
  onBrandChange,
  placeholder = "Select a brand",
  disabled = false,
  showAllOption = false
}: ProfileBrandSelectorProps) {
  const [selectedBrand, setSelectedBrand] = useState<string>(selectedBrandId || '')

  // Fetch profile brands
  const { data: profileBrands = [], isLoading, error } = useBrands()

  useEffect(() => {
    if (selectedBrandId) {
      setSelectedBrand(selectedBrandId)
    }
  }, [selectedBrandId])

  const handleBrandChange = (brandId: string) => {
    setSelectedBrand(brandId)
    onBrandChange?.(brandId)
  }

  if (error) {
    return (
      <Alert className="border-destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error loading brands. Please try again.
        </AlertDescription>
      </Alert>
    )
  }

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Loading brands..." />
        </SelectTrigger>
      </Select>
    )
  }

  if (profileBrands.length === 0) {
    return (
      <Alert>
        <Building2 className="h-4 w-4" />
        <AlertDescription>
          No brands are available. Create a brand to get started.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-2">
      <Select
        value={selectedBrand}
        onValueChange={handleBrandChange}
        disabled={disabled}
      >
        <SelectTrigger className="h-10 w-full rounded-md border-border bg-card font-medium text-sm shadow-sm transition-all text-foreground">
          <SelectValue placeholder={placeholder}>
            {selectedBrand && (selectedBrand === 'all' ? (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>Tất cả thương hiệu</span>
              </div>
            ) : profileBrands.find(brand => brand.id === selectedBrand) && (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{profileBrands.find(brand => brand.id === selectedBrand)?.name}</span>
              </div>
            ))}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {showAllOption && (
            <SelectItem value="all" className="rounded-md h-10">
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div className="font-bold text-sm">Tất cả thương hiệu</div>
              </div>
            </SelectItem>
          )}
          {profileBrands.map((brand) => (
            <SelectItem key={brand.id} value={brand.id} className="rounded-md h-10">
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate">{brand.name}</div>
                </div>
                {brand.status && (
                  <Badge variant="secondary" className="text-[10px] font-semibold px-2 py-0 border-none bg-muted text-muted-foreground">
                    {brand.status}
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>


    </div>
  )
}

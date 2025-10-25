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
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder}>
            {selectedBrand && profileBrands.find(brand => brand.id === selectedBrand) && (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span>{profileBrands.find(brand => brand.id === selectedBrand)?.name}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {showAllOption && (
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span>All Brands</span>
              </div>
            </SelectItem>
          )}
          {profileBrands.map((brand) => (
            <SelectItem key={brand.id} value={brand.id}>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{brand.name}</div>
                  {brand.description && (
                    <div className="text-xs text-muted-foreground truncate">
                      {brand.description}
                    </div>
                  )}
                </div>
                {brand.status && (
                  <Badge variant={brand.status === 'Active' ? 'default' : 'secondary'} className="text-xs">
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

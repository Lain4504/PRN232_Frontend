"use client"

import React, { useState, use } from 'react'
import { useTeam } from '@/lib/contexts/team-context'
import { useTeamBrands } from '@/hooks/use-team-brands'
import { useProducts } from '@/hooks/use-products'
import { TeamPermissionGate } from '@/components/teams/team-permission-gate'
import { TeamBrandSelector } from '@/components/teams/team-brand-selector'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Package, Search, Filter, Plus, Edit, Eye, Star, DollarSign } from 'lucide-react'

export default function TeamProductsPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { hasPermission } = useTeam()
  const resolvedParams = use(params)
  const teamId = resolvedParams.teamId
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('')

  const { data: brands, isLoading: isBrandsLoading } = useTeamBrands(teamId)
  const [selectedBrandId, setSelectedBrandId] = useState<string | undefined>()
  
  // Get products for selected brand or all team brands
  const { data: products = [], isLoading: isProductsLoading } = useProducts(selectedBrandId)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800'
      case 'Inactive':
        return 'bg-gray-100 text-gray-800'
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <TeamPermissionGate permission="VIEW_PRODUCTS">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-6 lg:space-y-8 p-4 lg:p-6 xl:p-8 bg-background">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Team Products</h1>
            <p className="text-muted-foreground">
              Products assigned to your team brands
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Product Catalog</CardTitle>
            <CardDescription>
              Browse products available to your team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <TeamBrandSelector 
                  selectedBrandId={selectedBrandId}
                  onBrandChange={setSelectedBrandId}
                  placeholder="Filter by brand"
                  showAllOption={true}
                />
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            {/* Products Grid */}
            {isProductsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-5 w-5" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-6 w-16" />
                      </div>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4 mb-3" />
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-24" />
                        <div className="flex items-center gap-1">
                          <Skeleton className="h-8 w-8" />
                          <Skeleton className="h-8 w-8" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No products available</h3>
                <p className="mb-4">No products are currently assigned to your team brands</p>
                <p className="text-sm">Contact your team administrator to assign products</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <Card key={product.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Package className="h-5 w-5 text-muted-foreground" />
                          <h3 className="font-medium">{product.name}</h3>
                        </div>
                        <Badge variant="secondary">
                          Active
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {product.description || 'No description available'}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          {product.price && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              <span>${product.price}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <TeamPermissionGate permission="EDIT_PRODUCTS">
                            <Button variant="outline" size="sm">
                              <Edit className="h-3 w-3" />
                            </Button>
                          </TeamPermissionGate>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </TeamPermissionGate>
  )
}

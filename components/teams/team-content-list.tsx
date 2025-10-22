"use client"

import React, { useState } from 'react'
import { useTeam } from '@/lib/contexts/team-context'
import { useTeamContents } from '@/hooks/use-team-content'
import { TeamBrandSelector } from '@/components/teams/team-brand-selector'
import { TeamPermissionGate } from '@/components/teams/team-permission-gate'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, Plus, Search, Filter, Calendar, User, Edit, Eye, Building2 } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface TeamContentListProps {
  showCreateButton?: boolean
  showFilters?: boolean
  maxItems?: number
  onEdit?: (content: any) => void
  onView?: (content: any) => void
}

export function TeamContentList({ 
  showCreateButton = true, 
  showFilters = true,
  maxItems = 10,
  onEdit,
  onView
}: TeamContentListProps) {
  const { hasPermission } = useTeam()
  const params = useParams()
  const teamId = params.teamId as string
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBrand, setSelectedBrand] = useState<string>('')
  const [filters, setFilters] = useState({
    page: 1,
    pageSize: maxItems,
    searchTerm: '',
    status: undefined as any,
  })

  // Use real API data
  const { data: contentsData, isLoading, error } = useTeamContents(teamId, filters)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setFilters(prev => ({ ...prev, searchTerm: searchQuery, page: 1 }))
  }

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({ 
      ...prev, 
      status: status === 'all' ? undefined : status, 
      page: 1 
    }))
  }

  const contentItems = contentsData?.data || []

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'bg-gray-100 text-gray-800'
      case 'PendingApproval':
        return 'bg-orange-100 text-orange-800'
      case 'Approved':
        return 'bg-green-100 text-green-800'
      case 'Published':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48 mt-2" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          {/* Filter Skeleton */}
          <div className="space-y-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Skeleton className="h-10 flex-1" />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Skeleton className="h-10 w-full sm:flex-1" />
              <Skeleton className="h-10 w-full sm:flex-1 sm:max-w-xs" />
            </div>
          </div>
          
          {/* Table Skeleton */}
          <div className="border rounded-lg">
            <div className="p-4 border-b">
              <div className="grid grid-cols-6 gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
            <div className="p-4 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="grid grid-cols-6 gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                  <div className="flex items-center justify-end gap-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="text-destructive mb-4">
            <FileText className="h-12 w-12 mx-auto mb-2" />
            <h3 className="text-lg font-semibold">Error Loading Content</h3>
            <p className="text-muted-foreground">Failed to load team content. Please try again.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Team Content</CardTitle>
            <CardDescription>
              Content created by your team members
            </CardDescription>
          </div>
          {/* Create button removed - handled in parent component */}
        </div>
      </CardHeader>
      <CardContent>
        {showFilters && (
          <div className="space-y-4 mb-6">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </form>
            </div>
            
            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:flex-1">
                <TeamBrandSelector 
                  selectedBrandId={selectedBrand}
                  onBrandChange={setSelectedBrand}
                  placeholder="Filter by brand"
                  showAllOption={true}
                />
              </div>
              <div className="w-full sm:flex-1 sm:max-w-xs">
                <Select 
                  value={filters.status || 'all'} 
                  onValueChange={(value) => handleStatusFilter(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="PendingApproval">Pending Approval</SelectItem>
                    <SelectItem value="Published">Published</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Content Table */}
        {contentItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No content found</h3>
            <p className="mb-4">
              {filters.searchTerm || filters.status ? 
                'Try adjusting your search criteria' : 
                'No content has been created yet'
              }
            </p>
            {!filters.searchTerm && !filters.status && (
              <TeamPermissionGate permission="SUBMIT_AI_GENERATION">
                <Button asChild>
                  <Link href={`/team/${teamId}/contents/new`}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Content
                  </Link>
                </Button>
              </TeamPermissionGate>
            )}
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contentItems.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{item.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {item.textContent || 'No content available'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {item.adType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{item.brandName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="outline"
                          size="sm"
                          className="h-8 px-3 text-blue-600 border-blue-600 hover:bg-blue-50 hover:text-blue-700"
                          onClick={() => onView?.(item)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <TeamPermissionGate permission="EDIT_CONTENT">
                          <Button 
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 text-orange-600 border-orange-600 hover:bg-orange-50 hover:text-orange-700"
                            onClick={() => onEdit?.(item)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </TeamPermissionGate>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {contentsData && contentsData.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}
              disabled={!contentsData.hasPreviousPage}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {contentsData.page} of {contentsData.totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
              disabled={!contentsData.hasNextPage}
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

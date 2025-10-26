"use client"

import React, { useState, useMemo } from 'react'
import { useTeam } from '@/lib/contexts/team-context'
import { useTeamContents } from '@/hooks/use-team-content'
import { TeamBrandSelector } from '@/components/teams/team-brand-selector'
import { TeamPermissionGate } from '@/components/teams/team-permission-gate'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { CustomTable } from '@/components/ui/custom-table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, Plus, Search, Filter, Calendar, User, Edit, Eye, Building2 } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
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

  // Define table columns
  const columns: ColumnDef<any>[] = useMemo(() => [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <div className="font-medium text-center">
          <div className="font-medium">{row.original.title}</div>
          <div className="text-sm text-muted-foreground line-clamp-1">
            {row.original.textContent || 'No content available'}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <div className="text-center">
          <Badge className={getStatusColor(row.getValue('status'))}>
            {row.getValue('status')}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: 'adType',
      header: 'Type',
      cell: ({ row }) => (
        <div className="text-center">
          <Badge variant="outline">
            {row.getValue('adType')}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: 'brandName',
      header: 'Brand',
      cell: ({ row }) => (
        <div className="text-center text-sm">
          {row.getValue('brandName')}
        </div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => {
        const date = row.getValue('createdAt') as string
        return (
          <div className="text-center text-sm">
            {new Date(date).toLocaleDateString()}
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onView?.(row.original)}
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          <TeamPermissionGate permission="EDIT_CONTENT">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onEdit?.(row.original)}
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
          </TeamPermissionGate>
        </div>
      ),
    },
  ], [])

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Filters Skeleton */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-48" />
        </div>
        
        {/* Table Skeleton */}
        <CustomTable
          columns={columns}
          data={[]}
          isLoading={true}
          loadingRows={3}
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-destructive mb-4">
          <FileText className="h-12 w-12 mx-auto mb-2" />
          <h3 className="text-lg font-semibold">Error Loading Content</h3>
          <p className="text-muted-foreground">Failed to load team content. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {showFilters && (
        <div className="space-y-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch}>
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
            <div className="w-full sm:w-48">
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
        <div className="text-center py-12 text-muted-foreground">
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
        <>
          <CustomTable
            columns={columns}
            data={contentItems}
            isLoading={false}
            emptyMessage="No content found"
            pageSize={filters.pageSize}
          />

          {/* Pagination */}
          {contentsData && contentsData.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
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
        </>
      )}
    </div>
  )
}

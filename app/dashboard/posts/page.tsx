"use client"

import React, { useState, useEffect } from 'react'
import { useProfilePosts } from '@/hooks/use-profile-posts'
import { ProfileBrandSelector } from '@/components/profiles/profile-brand-selector'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { CustomTable } from '@/components/ui/custom-table'
import { ColumnDef } from '@tanstack/react-table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Mail, Edit, Eye, Calendar, Search } from 'lucide-react'
import { ActionsDropdown, ActionItem } from '@/components/ui/actions-dropdown'
import type { Post } from '@/lib/types/aisam-types'

export default function PostsPage() {
  const [pageSize, setPageSize] = useState(10)
  const [filters, setFilters] = useState({
    page: 1,
    pageSize: 10,
    searchTerm: '',
    status: undefined as string | undefined,
    brandId: undefined as string | undefined,
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [profileId, setProfileId] = useState<string | null>(null)

  // Get profileId from localStorage (same as API headers)
  useEffect(() => {
    const activeProfileId = localStorage.getItem('activeProfileId')
    setProfileId(activeProfileId)
  }, [])

  const { data: postsData, isLoading, error } = useProfilePosts(profileId || undefined, filters)

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

  const handleBrandChange = (brandId: string) => {
    setFilters(prev => ({ 
      ...prev, 
      brandId: brandId === 'all' ? undefined : brandId, 
      page: 1 
    }))
  }

  const handleViewPost = (post: Post) => {
    setSelectedPost(post)
    setIsViewModalOpen(true)
  }

  const getStatusColor = (status: string) => {
    const s = (status || '').toLowerCase()
    switch (s) {
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'deleted':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Define table columns
  const columns: ColumnDef<Post>[] = [
    {
      accessorKey: 'brandName',
      header: 'Brand',
      cell: ({ row }) => (
        <span className="text-sm text-foreground">{row.original.brandName || '-'}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <div className="text-center">
          <Badge className={getStatusColor(row.getValue('status'))}>
            {String(row.getValue('status') || '-').charAt(0).toUpperCase() + 
             String(row.getValue('status') || '-').slice(1)}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: 'contentTitle',
      header: 'Content',
      cell: ({ row }) => {
        const title = row.original.contentTitle
        const id = row.original.contentId
        return (
          <span className="text-sm text-foreground text-center block">
            {title || id}
          </span>
        )
      },
    },
    {
      accessorKey: 'integrationPlatform',
      header: 'Integration',
      cell: ({ row }) => {
        const platform = row.original.integrationPlatform
        const account = row.original.integrationAccountName
        return (
          <span className="text-sm text-muted-foreground text-center block">
            {platform ? platform : '-'}{platform ? ' • ' : ''}{account || ''}
          </span>
        )
      },
    },
    {
      accessorKey: 'publishedAt',
      header: 'Published Date',
      cell: ({ row }) => {
        const date = row.getValue('publishedAt') as string
        return (
          <div className="flex items-center justify-center gap-1 text-sm">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span>{date ? new Date(date).toLocaleDateString() : 'N/A'}</span>
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: '',
      size: 50,
      maxSize: 50,
      cell: ({ row }) => {
        const actions: ActionItem[] = [
          {
            label: "View Details",
            icon: <Eye className="h-4 w-4" />,
            onClick: () => handleViewPost(row.original),
          },
        ];

        return (
          <div className="flex justify-center">
            <ActionsDropdown actions={actions} />
          </div>
        );
      },
    },
  ]

  if (!profileId) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="space-y-6 lg:space-y-8 p-4 lg:p-6 xl:p-8 bg-background">
          <div className="text-center">
            <h1 className="text-2xl font-bold">No Active Profile</h1>
            <p className="text-muted-foreground">Please select an active profile to view posts.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="space-y-6 lg:space-y-8 p-4 lg:p-6 xl:p-8 bg-background">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold tracking-tight text-foreground">
          Social Media Posts Log
        </h1>
        <p className="text-sm lg:text-base xl:text-lg text-muted-foreground mt-2 max-w-2xl">
          View published posts and their status across social media platforms
        </p>
      </div>

      {/* Two Row Layout - Filters on top row, Search on bottom row */}
      <div className="space-y-3">
        {/* Row 1: Status Filter, Brand Selector, Page Size */}
        <div className="flex items-center gap-4">
          {/* Status Filter Dropdown */}
          <Select
            value={filters.status || 'all'}
            onValueChange={handleStatusFilter}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="deleted">Deleted</SelectItem>
            </SelectContent>
          </Select>

          {/* Brand Selector */}
          <div className="w-64">
            <ProfileBrandSelector
              selectedBrandId={filters.brandId}
              onBrandChange={handleBrandChange}
              placeholder="Select a brand"
              showAllOption={true}
            />
          </div>

          {/* Page Size Selector */}
          <Select
            value={String(pageSize)}
            onValueChange={(value) => setPageSize(Number(value))}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Rows" />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size} rows
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Row 2: Search Input - Full Width */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                setFilters(prev => ({ ...prev, searchTerm: searchQuery, page: 1 }));
              }
            }}
            className="pl-10 h-10 w-full"
          />
        </div>
      </div>

      {/* Posts Table */}
      <CustomTable
        columns={columns}
        data={postsData?.data || []}
        isLoading={isLoading}
        emptyMessage="No posts found"
        emptyDescription="No social media posts have been published yet."
        pageSize={pageSize}
      />

      {/* Post Details Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Post Details
            </DialogTitle>
            <DialogDescription>
              View detailed information about this social media post
            </DialogDescription>
          </DialogHeader>
          
          {selectedPost && (
            <div className="space-y-5">
              {/* Header: IDs and Status */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">External Post ID</div>
                  <div className="text-base font-semibold break-all">{selectedPost.externalPostId || '-'}</div>
                  <div className="text-xs text-muted-foreground">Internal ID: {selectedPost.id}</div>
                </div>
                <Badge className={getStatusColor(selectedPost.status)}>
                  {String(selectedPost.status || '-').charAt(0).toUpperCase() + String(selectedPost.status || '-').slice(1)}
                </Badge>
              </div>

              {/* Main details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Brand</div>
                  <div className="text-sm font-medium">{selectedPost.brandName || '-'}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Content</div>
                  <div className="text-sm font-medium">{selectedPost.contentTitle || selectedPost.contentId || '-'}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Integration</div>
                  <div className="text-sm font-medium">{selectedPost.integrationPlatform || '-'}{selectedPost.integrationAccountName ? ` • ${selectedPost.integrationAccountName}` : ''}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Published</div>
                  <div className="text-sm font-medium">
                    {selectedPost.publishedAt ? new Date(selectedPost.publishedAt).toLocaleString() : 'N/A'}
                  </div>
                </div>
                <div className="md:col-span-2 space-y-1">
                  <div className="text-sm text-muted-foreground">Link</div>
                  {selectedPost.link ? (
                    <a href={selectedPost.link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline break-all">
                      {selectedPost.link}
                    </a>
                  ) : (
                    <div className="text-sm text-muted-foreground">-</div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      </div>
    </div>
  )
}

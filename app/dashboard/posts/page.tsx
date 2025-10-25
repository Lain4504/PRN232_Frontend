"use client"

import React, { useState, useEffect } from 'react'
import { useProfilePosts } from '@/hooks/use-profile-posts'
import { ProfileBrandSelector } from '@/components/profiles/profile-brand-selector'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Mail, Edit, Eye, Calendar, User, ExternalLink, Clock, CheckCircle, XCircle } from 'lucide-react'
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
    switch (status) {
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
      accessorKey: 'external_post_id',
      header: 'Post ID',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.getValue('external_post_id')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge className={getStatusColor(row.getValue('status'))}>
          {(row.getValue('status') as string).charAt(0).toUpperCase() + 
           (row.getValue('status') as string).slice(1)}
        </Badge>
      ),
    },
    {
      accessorKey: 'content_id',
      header: 'Content ID',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.getValue('content_id')}
        </span>
      ),
    },
    {
      accessorKey: 'social_integration_id',
      header: 'Integration',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.getValue('social_integration_id')}
        </span>
      ),
    },
    {
      accessorKey: 'published_at',
      header: 'Published Date',
      cell: ({ row }) => {
        const date = row.getValue('published_at') as string
        return (
          <div className="flex items-center gap-1 text-sm">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span>{date ? new Date(date).toLocaleDateString() : 'N/A'}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Created Date',
      cell: ({ row }) => {
        const date = row.getValue('created_at') as string
        return (
          <div className="flex items-center gap-1 text-sm">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span>{new Date(date).toLocaleDateString()}</span>
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleViewPost(row.original)}
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleViewPost(row.original)}
          >
            <Edit className="h-3 w-3 mr-1" />
            Details
          </Button>
        </div>
      ),
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

      {/* Single Row Layout - Brand Selector, Page Size, Search, Posts Count */}
      <div className="flex items-center gap-4">
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

        {/* Posts Count */}
        <Badge variant="secondary" className="whitespace-nowrap">
          {postsData?.data?.length || 0} post{(postsData?.data?.length || 0) !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Status Filter Buttons */}
      <div className="flex gap-2">
        <Button 
          variant={filters.status === undefined ? "default" : "outline"} 
          size="sm"
          onClick={() => handleStatusFilter('all')}
        >
          All
        </Button>
        <Button 
          variant={filters.status === 'published' ? "default" : "outline"} 
          size="sm"
          onClick={() => handleStatusFilter('published')}
        >
          Published
        </Button>
        <Button 
          variant={filters.status === 'failed' ? "default" : "outline"} 
          size="sm"
          onClick={() => handleStatusFilter('failed')}
        >
          Failed
        </Button>
        <Button 
          variant={filters.status === 'deleted' ? "default" : "outline"} 
          size="sm"
          onClick={() => handleStatusFilter('deleted')}
        >
          Deleted
        </Button>
      </div>

      {/* Posts Table */}
      <DataTable
        columns={columns}
        data={postsData?.data || []}
        loading={isLoading}
        emptyMessage="No posts found"
        emptyDescription="No social media posts have been published yet."
        searchPlaceholder="Search posts by ID, content, or integration..."
        filterColumn="external_post_id"
        pageSize={pageSize}
        showPageSize={false}
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
            <div className="space-y-4">
              {/* Post ID and Status */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Post ID: {selectedPost.external_post_id}</h3>
                  <p className="text-sm text-muted-foreground">Internal ID: {selectedPost.id}</p>
                </div>
                <Badge className={getStatusColor(selectedPost.status)}>
                  {selectedPost.status.charAt(0).toUpperCase() + selectedPost.status.slice(1)}
                </Badge>
              </div>

              {/* Content Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Content ID</label>
                  <p className="text-sm">{selectedPost.content_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Social Integration ID</label>
                  <p className="text-sm">{selectedPost.social_integration_id}</p>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Created Date
                  </label>
                  <p className="text-sm">{new Date(selectedPost.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Published Date
                  </label>
                  <p className="text-sm">
                    {selectedPost.published_at ? new Date(selectedPost.published_at).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Last Updated */}
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Last Updated
                </label>
                <p className="text-sm">{new Date(selectedPost.updated_at).toLocaleString()}</p>
              </div>

              {/* Metrics if available */}
              {selectedPost.metrics && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Post Metrics</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                    {selectedPost.metrics.likes && (
                      <div className="text-center p-2 bg-muted rounded">
                        <CheckCircle className="h-4 w-4 mx-auto mb-1 text-green-600" />
                        <p className="text-xs text-muted-foreground">Likes</p>
                        <p className="font-medium">{selectedPost.metrics.likes}</p>
                      </div>
                    )}
                    {selectedPost.metrics.shares && (
                      <div className="text-center p-2 bg-muted rounded">
                        <ExternalLink className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                        <p className="text-xs text-muted-foreground">Shares</p>
                        <p className="font-medium">{selectedPost.metrics.shares}</p>
                      </div>
                    )}
                    {selectedPost.metrics.comments && (
                      <div className="text-center p-2 bg-muted rounded">
                        <User className="h-4 w-4 mx-auto mb-1 text-purple-600" />
                        <p className="text-xs text-muted-foreground">Comments</p>
                        <p className="font-medium">{selectedPost.metrics.comments}</p>
                      </div>
                    )}
                    {selectedPost.metrics.views && (
                      <div className="text-center p-2 bg-muted rounded">
                        <Eye className="h-4 w-4 mx-auto mb-1 text-orange-600" />
                        <p className="text-xs text-muted-foreground">Views</p>
                        <p className="font-medium">{selectedPost.metrics.views}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

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

"use client"

import React, { useState, use } from 'react'
import { useTeam } from '@/lib/contexts/team-context'
import { useTeamPosts } from '@/hooks/use-team-posts'
import { TeamPermissionGate } from '@/components/teams/team-permission-gate'
import { TeamBrandSelector } from '@/components/teams/team-brand-selector'
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

export default function TeamPostsPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  // const { hasPermission } = useTeam() // Removed unused variable
  const resolvedParams = use(params)
  const teamId = resolvedParams.teamId
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

  const { data: postsData, isLoading, error } = useTeamPosts(teamId, filters)

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
      accessorKey: 'externalPostId',
      header: 'Post ID',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.getValue('externalPostId')}</span>
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
      accessorKey: 'contentId',
      header: 'Content ID',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.getValue('contentId')}
        </span>
      ),
    },
    {
      accessorKey: 'integrationId',
      header: 'Integration',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.getValue('integrationId')}
        </span>
      ),
    },
    {
      accessorKey: 'publishedAt',
      header: 'Published Date',
      cell: ({ row }) => {
        const date = row.getValue('publishedAt') as string
        return (
          <div className="flex items-center gap-1 text-sm">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span>{date ? new Date(date).toLocaleDateString() : 'N/A'}</span>
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
            onClick={() => window.open(row.original.link, '_blank')}
            disabled={!row.original.link}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            View
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleViewPost(row.original)}
          >
            <Eye className="h-3 w-3 mr-1" />
            Details
          </Button>
        </div>
      ),
    },
  ]

  return (
    <TeamPermissionGate permission="VIEW_POSTS">
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

        {/* Single Row Layout - Brand Selector, Page Size, Posts Count */}
        <div className="flex items-center gap-4">
          {/* Brand Selector */}
          <div className="w-64">
            <TeamBrandSelector
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

        {/* Posts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Posts Log</CardTitle>
            <CardDescription>
              View all published posts and their status across social media platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Status Filter Buttons */}
            <div className="flex gap-2 mb-6">
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

            {/* Data Table */}
            <DataTable
              columns={columns}
              data={postsData?.data || []}
              loading={isLoading}
              emptyMessage="No posts found"
              emptyDescription="No social media posts have been published yet."
              searchPlaceholder="Search posts by ID, content, or integration..."
              filterColumn="externalPostId"
            />
          </CardContent>
        </Card>

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
                    <h3 className="font-medium">Post ID: {selectedPost.externalPostId}</h3>
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
                    <p className="text-sm">{selectedPost.contentId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Social Integration ID</label>
                    <p className="text-sm">{selectedPost.integrationId}</p>
                  </div>
                </div>

                {/* Published Date */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Published Date
                  </label>
                  <p className="text-sm">
                    {selectedPost.publishedAt ? new Date(selectedPost.publishedAt).toLocaleString() : 'N/A'}
                  </p>
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
    </TeamPermissionGate>
  )
}

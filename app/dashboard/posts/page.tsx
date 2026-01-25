"use client"

import React, { useState, useEffect } from 'react'
import { useProfilePosts } from '@/hooks/use-profile-posts'
import { ProfileBrandSelector } from '@/components/profiles/profile-brand-selector'
import { Card, CardContent } from '@/components/ui/card'
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
import { Mail, Edit, Eye, Calendar, Search, Activity, Share2, Globe, ExternalLink } from 'lucide-react'
import { ActionsDropdown, ActionItem } from '@/components/ui/actions-dropdown'
import type { Post } from '@/lib/types/aisam-types'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Skeleton } from "@/components/ui/skeleton"

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

  const getStatusStyle = (status: string) => {
    const s = (status || '').toLowerCase()
    switch (s) {
      case 'published':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
      case 'failed':
        return 'bg-destructive/10 text-destructive border-destructive/20'
      case 'deleted':
        return 'bg-muted/50 text-muted-foreground border-border/50'
      default:
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20'
    }
  }

  // Define table columns
  const columns: ColumnDef<Post>[] = [
    {
      accessorKey: 'brandName',
      header: 'Brand',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-1 bg-primary/40 rounded-full" />
          <div className="font-bold uppercase tracking-tight text-sm">
            {row.original.brandName || 'Unknown Brand'}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant="outline" className={`rounded-md px-2.5 py-0.5 font-bold uppercase tracking-wider text-[10px] border ${getStatusStyle(row.getValue('status'))}`}>
          {String(row.getValue('status') || 'Unknown')}
        </Badge>
      ),
    },
    {
      accessorKey: 'contentTitle',
      header: 'Content',
      cell: ({ row }) => {
        const title = row.original.contentTitle
        const id = row.original.contentId
        return (
          <div className="max-w-[200px] truncate font-medium text-xs text-muted-foreground">
            {title || id || 'No content data'}
          </div>
        )
      },
    },
    {
      accessorKey: 'integrationPlatform',
      header: 'Platform',
      cell: ({ row }) => {
        const platform = row.original.integrationPlatform
        const account = row.original.integrationAccountName
        return (
          <div className="flex items-center gap-2">
            <Globe className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-bold uppercase tracking-wide text-foreground">
              {platform || 'N/A'}
            </span>
            {account && <span className="text-[10px] text-muted-foreground ml-1">({account})</span>}
          </div>
        )
      },
    },
    {
      accessorKey: 'publishedAt',
      header: 'Date',
      cell: ({ row }) => {
        const date = row.getValue('publishedAt') as string
        return (
          <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
            <Calendar className="h-3 w-3" />
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
          <div className="flex justify-end">
            <ActionsDropdown actions={actions} />
          </div>
        );
      },
    },
  ]

  const PageSkeleton = () => (
    <div className="w-full max-w-full overflow-x-hidden font-fira-sans">
      <div className="space-y-10 p-6 lg:p-10 bg-background">
        <Skeleton className="h-4 w-48 mb-6 rounded-xl" />
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-12 w-64 rounded-xl" />
            <Skeleton className="h-12 w-32 rounded-xl" />
          </div>
          <Skeleton className="h-16 w-full rounded-[2rem] mb-10" />
          <div className="rounded-[2.5rem] bg-card border border-border/40 overflow-hidden h-[500px]" />
        </div>
      </div>
    </div>
  )

  if (!profileId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center font-fira-sans">
        <Activity className="h-16 w-16 text-muted-foreground mb-4 animate-pulse" />
        <h1 className="text-2xl font-bold uppercase tracking-tight text-foreground">No Active Profile</h1>
        <p className="text-muted-foreground mt-2 max-w-md">Please select an active profile to access the social posts.</p>
      </div>
    )
  }

  if (isLoading) return <PageSkeleton />

  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-10 lg:py-14 bg-background font-fira-sans min-h-screen">
      <div className="space-y-12">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-4">
          <BreadcrumbList className="gap-2">
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard" className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60 hover:text-primary transition-colors">Workspace</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-muted-foreground/30 scale-75" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-[11px] font-bold uppercase tracking-[0.15em] text-foreground/80">Social Media Posts</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="h-2 w-8 bg-primary rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">Activity Monitor</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-[1.1]">
              Post <span className="text-primary italic">History</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed font-medium">
              Monitor transmission status and content delivery metrics across all connected networks.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Stats Badge */}
            <div className="px-8 py-5 bg-card/40 backdrop-blur-xl rounded-[2rem] border border-border/40 shadow-xl flex items-center gap-10">
              <div className="space-y-1">
                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Total Posts</div>
                <div className="text-2xl font-black font-fira-mono tracking-tighter tabular-nums text-foreground">
                  {(postsData && typeof postsData === 'object' && 'total' in postsData) ? (postsData as { total?: number }).total :
                    (postsData && typeof postsData === 'object' && 'totalCount' in postsData) ? (postsData as { totalCount?: number }).totalCount :
                      (postsData && typeof postsData === 'object' && 'data' in postsData) ? (postsData as { data?: unknown[] }).data?.length || 0 : 0}
                </div>
              </div>
              <div className="h-10 w-px bg-border/20" />
              <div className="space-y-1">
                <div className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">System Status</div>
                <div className="text-2xl font-black font-fira-mono tracking-tighter tabular-nums text-primary uppercase leading-none italic">ACTIVE</div>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="sticky top-20 z-40 flex flex-col xl:flex-row items-center justify-between gap-6 p-5 bg-background/60 backdrop-blur-xl border border-border/40 rounded-[2rem] shadow-xl shadow-foreground/[0.02]">
          <div className="relative w-full xl:w-96 group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
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
              className="pl-11 h-12 border-none bg-muted/30 focus-visible:ring-primary/20 rounded-2xl font-medium transition-all duration-300 placeholder:text-muted-foreground/40 text-[11px] font-bold uppercase tracking-wider"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
            <Select
              value={filters.status || 'all'}
              onValueChange={handleStatusFilter}
            >
              <SelectTrigger className="w-full sm:w-[160px] h-12 rounded-2xl border-border/40 bg-muted/30 font-bold text-[10px] uppercase tracking-widest">
                <SelectValue placeholder="STATUS" />
              </SelectTrigger>
              <SelectContent className="rounded-xl font-bold uppercase tracking-wider text-xs">
                <SelectItem value="all">ALL STATUS</SelectItem>
                <SelectItem value="published">PUBLISHED</SelectItem>
                <SelectItem value="failed">FAILED</SelectItem>
                <SelectItem value="deleted">DELETED</SelectItem>
              </SelectContent>
            </Select>

            <div className="w-full sm:w-64">
              <ProfileBrandSelector
                selectedBrandId={filters.brandId}
                onBrandChange={handleBrandChange}
                placeholder="Select Brand"
                showAllOption={true}
              />
            </div>

            <Select
              value={String(pageSize)}
              onValueChange={(value) => setPageSize(Number(value))}
            >
              <SelectTrigger className="w-full sm:w-[120px] h-12 rounded-2xl border-border/40 bg-muted/30 font-bold text-[10px] uppercase tracking-widest">
                <SelectValue placeholder="ROWS" />
              </SelectTrigger>
              <SelectContent className="rounded-xl font-bold uppercase tracking-wider text-xs">
                {[5, 10, 20, 30, 40, 50].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size} / PAGE
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Posts Table */}
        <div className="group relative min-h-[500px]">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition duration-1000" />
          <Card className="relative border-border/40 bg-card/60 backdrop-blur-md rounded-[2.5rem] overflow-hidden shadow-2xl h-full">
            <CustomTable
              columns={columns}
              data={postsData?.data || []}
              isLoading={isLoading}
              emptyMessage="NO POSTS FOUND"
              emptyDescription="No social media posts have been published yet."
              pageSize={pageSize}
              className="border-0 shadow-none bg-transparent"
              headerClassName="bg-muted/20 hover:bg-muted/20 border-b border-border/40 py-6"
            />
          </Card>
        </div>

        {/* Post Details Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-2xl rounded-[2.5rem] border-border/40 bg-background/95 backdrop-blur-xl p-0 overflow-hidden">
            <DialogHeader className="px-8 py-6 border-b border-border/40 bg-muted/20">
              <DialogTitle className="flex items-center gap-3 text-xl font-black uppercase tracking-tight">
                <Mail className="h-5 w-5 text-primary" />
                Post Details
              </DialogTitle>
              <DialogDescription className="font-medium text-muted-foreground">
                View detailed information about this post
              </DialogDescription>
            </DialogHeader>

            {selectedPost && (
              <div className="p-8 space-y-8 font-fira-sans">
                {/* Header: IDs and Status */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-border/40">
                  <div className="space-y-2">
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">External ID</div>
                    <div className="text-lg font-mono font-bold break-all bg-muted/30 p-2 rounded-lg border border-border/40">{selectedPost.externalPostId || 'PENDING'}</div>
                    <div className="text-[10px] font-mono text-muted-foreground/60">Internal ID: {selectedPost.id}</div>
                  </div>
                  <Badge variant="outline" className={`rounded-lg px-4 py-2 self-start font-bold uppercase tracking-widest text-xs border ${getStatusStyle(selectedPost.status)}`}>
                    {String(selectedPost.status || 'Unknown')}
                  </Badge>
                </div>

                {/* Main details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Brand</div>
                    <div className="font-bold text-base flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      {selectedPost.brandName || 'N/A'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Content</div>
                    <div className="font-medium text-sm text-foreground/80 leading-relaxed bg-muted/10 p-3 rounded-xl border border-border/30">
                      {selectedPost.contentTitle || selectedPost.contentId || 'No content available'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Platform</div>
                    <div className="font-bold flex items-center gap-2">
                      <Globe className="h-4 w-4 text-primary" />
                      {selectedPost.integrationPlatform || 'N/A'}{selectedPost.integrationAccountName ? ` • ${selectedPost.integrationAccountName}` : ''}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Timestamp</div>
                    <div className="font-mono text-sm">
                      {selectedPost.publishedAt ? new Date(selectedPost.publishedAt).toLocaleString() : 'Pending'}
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Post Link</div>
                    {selectedPost.link ? (
                      <a href={selectedPost.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors break-all bg-primary/5 p-3 rounded-xl border border-primary/10 hover:border-primary/30 group">
                        <ExternalLink className="h-4 w-4 shrink-0" />
                        {selectedPost.link}
                      </a>
                    ) : (
                      <div className="text-sm text-muted-foreground italic">Link not available</div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsViewModalOpen(false)} className="rounded-xl border-border/40 font-bold hover:bg-muted/50">
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

"use client"

import React, { useState, useEffect } from 'react'
import { useProfilePosts } from '@/hooks/use-profile-posts'
import { ProfileBrandSelector } from '@/components/profiles/profile-brand-selector'
import { Card } from '@/components/ui/card'
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

import { Eye, Calendar, Search, Activity, Globe, Share2, Layout, ArrowRight } from 'lucide-react'
import { ActionsDropdown, ActionItem } from '@/components/ui/actions-dropdown'
import type { Post } from '@/lib/types/omniadly-types'

import { Label } from "@/components/ui/label"
import Link from 'next/link'
import { cn } from "@/lib/utils"

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

  useEffect(() => {
    const activeProfileId = localStorage.getItem('activeProfileId')
    setProfileId(activeProfileId)
  }, [])

  const { data: postsData, isLoading } = useProfilePosts(profileId || undefined, filters)

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
        return 'bg-muted text-muted-foreground border-border'
      default:
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20'
    }
  }

  const columns: ColumnDef<Post>[] = [
    {
      accessorKey: 'brandName',
      header: "Thương hiệu",
      cell: ({ row }) => (
        <div className="flex items-center gap-4">
          <div className="size-10 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
            <Share2 className="size-5" />
          </div>
          <div>
            <div className="font-bold text-foreground text-sm italic">
              {row.original.brandName || "Dữ liệu trống"}
            </div>
            <div className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest italic leading-none mt-1">
              {row.original.integrationPlatform || 'XÁC ĐỊNH...'}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: "Trạng thái",
      cell: ({ row }) => (
        <Badge variant="outline" className={cn(
          "text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider",
          getStatusStyle(row.getValue('status'))
        )}>
          {(() => {
            const s = String(row.getValue('status') || '').toLowerCase();
            if (s === 'published') return 'Đã xuất bản';
            if (s === 'failed') return 'Thất bại';
            if (s === 'deleted') return 'Đã xóa';
            return row.getValue('status') || "Không xác định";
          })()}
        </Badge>
      ),
    },
    {
      accessorKey: 'contentTitle',
      header: 'Nội dung',
      cell: ({ row }) => {
        const title = row.original.contentTitle
        const id = row.original.contentId
        return (
          <div className="space-y-1">
            <div className="text-sm font-bold text-foreground/80 truncate max-w-[250px] italic">
              {title || "Bản ghi hệ thống"}
            </div>
            <div className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-tighter">
              NODE_ID: {id?.substring(0, 8) || 'N/A'}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'publishedAt',
      header: "Thời điểm",
      cell: ({ row }) => {
        const date = row.getValue('publishedAt') as string
        return (
          <div className="space-y-1 leading-none">
            <div className="text-xs font-bold text-foreground italic">
              {date ? new Date(date).toLocaleDateString('vi-VN') : '---'}
            </div>
            <div className="text-[10px] font-bold text-muted-foreground/40 italic uppercase tracking-tighter">
              {date ? new Date(date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Chờ đăng'}
            </div>
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: () => <div className="text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 italic">Chi tiết</div>,
      cell: ({ row }) => {
        const actions: ActionItem[] = [
          {
            label: "Xem chi tiết",
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

  if (!profileId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center font-sans">
        <Activity className="h-16 w-16 text-primary mb-6 opacity-20" />
        <h1 className="text-2xl font-bold tracking-tight text-foreground italic">Thiếu hồ sơ định danh</h1>
        <p className="text-muted-foreground mt-3 max-w-md font-medium italic border-l-2 border-primary/50 pl-4">Vui lòng chọn hồ sơ vận hành để truy xuất dữ liệu phản hồi.</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10 font-sans mb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border/50 pb-10 transition-all duration-300">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-primary/5 text-primary border border-primary/10">
              <Share2 className="size-4" />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest italic">Nhật ký truyền tin • Post Analytics</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight italic uppercase">
            Quản lý Bài đăng
          </h1>
          <p className="text-sm text-muted-foreground font-medium max-w-xl italic leading-relaxed">
            Theo dõi và quản trị trạng thái xuất bản nội dung trên các nền tảng định danh trong mạng lưới Node.
          </p>
        </div>

        <div className="flex items-center gap-6 p-6 bg-card border border-border shadow-sm rounded-lg group transition-all hover:shadow-md">
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest leading-none italic">Tổng phân phối</div>
            <div className="text-3xl font-bold tracking-tight text-foreground italic">
              {postsData?.totalCount || postsData?.data?.length || 0}
            </div>
          </div>
          <div className="h-10 w-px bg-border/50" />
          <div className="space-y-1 text-right">
            <div className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest leading-none italic">Trạng thái</div>
            <div className="text-3xl font-bold tracking-tight text-emerald-500 italic flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              LIVE
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 p-1.5 rounded-lg border border-border bg-card shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
              <Input
                className="pl-12 h-11 bg-muted/10 border-border/50 rounded-md shadow-inner font-bold text-xs italic uppercase tracking-wider placeholder:text-muted-foreground/20"
                placeholder="Truy vết tên bài biết..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setFilters(prev => ({ ...prev, searchTerm: searchQuery, page: 1 }));
                  }
                }}
              />
            </div>
            <Select
              value={filters.status || 'all'}
              onValueChange={handleStatusFilter}
            >
              <SelectTrigger className="h-11 w-full sm:w-[180px] rounded-md border-border/50 bg-muted/10 font-bold uppercase text-[10px] tracking-widest italic">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent className="rounded-md border-border font-bold uppercase tracking-widest text-[10px] p-1 italic">
                <SelectItem value="all" className="rounded-sm">Toàn bộ</SelectItem>
                <SelectItem value="published" className="rounded-sm">Đã xuất bản</SelectItem>
                <SelectItem value="failed" className="rounded-sm">Thất bại</SelectItem>
                <SelectItem value="deleted" className="rounded-sm">Đã xóa</SelectItem>
              </SelectContent>
            </Select>

            <div className="w-full sm:w-64">
              <ProfileBrandSelector
                selectedBrandId={filters.brandId}
                onBrandChange={handleBrandChange}
                placeholder="THƯƠNG HIỆU"
                showAllOption={true}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <Select
              value={String(pageSize)}
              onValueChange={(value) => setPageSize(Number(value))}
            >
              <SelectTrigger className="h-11 w-full sm:w-[150px] rounded-md border-border/50 bg-muted/10 font-bold uppercase text-[10px] tracking-widest italic">
                <SelectValue placeholder="Phân trang" />
              </SelectTrigger>
              <SelectContent className="rounded-md border-border font-bold uppercase tracking-widest text-[10px] p-1 italic">
                {[10, 20, 50, 100].map((size) => (
                  <SelectItem key={size} value={String(size)} className="rounded-sm">
                    Hiển thị {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="rounded-lg border border-border bg-card overflow-hidden shadow-sm relative group">
          <CustomTable
            columns={columns}
            data={postsData?.data || []}
            pageSize={pageSize}
            isLoading={isLoading}
            emptyMessage="Không tìm thấy dữ liệu nhật ký truyền tin."
            className="border-0 shadow-none bg-transparent"
            headerClassName="bg-muted/30 border-b border-border/50 py-5 px-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 italic"
          />
        </Card>
      </div>

      {/* Post Details Modal - Redesigned */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl w-[95vw] p-0 border-border bg-popover rounded-lg overflow-hidden shadow-2xl">
          <DialogHeader className="p-10 border-b border-border/50 bg-muted/20">
            <div className="flex items-center gap-5 mb-2">
              <div className="size-12 rounded-md bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                <Activity className="size-6" />
              </div>
              <div className="space-y-1">
                <DialogTitle className="text-3xl font-bold tracking-tight italic uppercase">
                  Chi tiết Bản ghi
                </DialogTitle>
                <DialogDescription className="font-bold text-muted-foreground/40 uppercase tracking-widest text-[10px] italic leading-none">
                  Truy vấn thông số định danh và trạng thái truyền tải thực thể
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedPost && (
            <div className="p-10 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pb-10 border-b border-border/50">
                <div className="space-y-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest italic">Định danh Ngoại vi</Label>
                    <div className="font-mono text-xs font-bold p-5 rounded-md bg-muted/30 border border-border/50 break-all text-foreground/80 shadow-inner">
                      {selectedPost.externalPostId || "ĐANG TRUY VẤN..."}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest italic">Định danh Thực thể</Label>
                    <div className="text-xs font-bold text-muted-foreground/30 font-mono italic tracking-tighter">
                      NODE_V4::{selectedPost.id}
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-3 text-right md:text-left">
                    <Label className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest block italic">Tình trạng Phân phối</Label>
                    <Badge variant="outline" className={cn(
                      "text-[10px] font-bold px-5 py-2 rounded-md border uppercase tracking-widest shadow-sm italic",
                      getStatusStyle(selectedPost.status)
                    )}>
                      {(() => {
                        const s = (selectedPost.status || '').toLowerCase();
                        if (s === 'published') return 'Thành công';
                        if (s === 'failed') return 'Lỗi hệ thống';
                        if (s === 'deleted') return 'Đã gỡ bỏ';
                        return selectedPost.status || 'Chờ xác nhận';
                      })()}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest italic">Thương hiệu</Label>
                  <div className="font-bold text-xl flex items-center gap-4 text-foreground italic">
                    <div className="size-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
                    {selectedPost.brandName || "Vô danh"}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest italic">Tiêu đề Nội dung</Label>
                  <div className="font-bold text-sm text-foreground/80 bg-muted/10 p-5 rounded-md border border-border/50 italic leading-relaxed">
                    &quot;{selectedPost.contentTitle || "Chiến dịch chưa đặt tên"}&quot;
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest italic">Kênh Truyền dẫn</Label>
                  <div className="font-bold flex items-center gap-3 text-foreground uppercase tracking-widest text-xs italic">
                    <div className="size-9 rounded-md bg-muted/50 flex items-center justify-center text-primary border border-border/50 shadow-sm">
                      <Globe className="size-4" />
                    </div>
                    <span>
                      {selectedPost.integrationPlatform || "Hệ thống Mạng"}
                      {selectedPost.integrationAccountName && (
                        <span className="text-muted-foreground/40 ml-2 font-medium">/{selectedPost.integrationAccountName}</span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest italic">Mốc thời gian</Label>
                  <div className="font-bold text-sm tracking-widest text-foreground/80 flex items-center gap-3 italic">
                    <Calendar className="size-4 text-primary/40" />
                    {selectedPost.publishedAt
                      ? new Date(selectedPost.publishedAt).toLocaleString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })
                      : "CHƯA XÁC LẬP"}
                  </div>
                </div>

                <div className="md:col-span-2 space-y-5 pt-6">
                  <Label className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest italic">Liên kết Hiện diện</Label>
                  {selectedPost.link ? (
                    <Link
                      href={selectedPost.link}
                      target="_blank"
                      className="group flex items-center justify-between p-6 rounded-lg bg-primary/5 hover:bg-primary/10 border border-primary/20 transition-all duration-300 shadow-sm"
                    >
                      <div className="flex items-center gap-5 min-w-0">
                        <div className="size-11 rounded-md bg-card flex items-center justify-center text-primary shadow-sm border border-border/50 group-hover:scale-110 transition-transform">
                          <Layout className="size-5" />
                        </div>
                        <span className="text-xs font-bold text-primary truncate tracking-tight italic">
                          {selectedPost.link}
                        </span>
                      </div>
                      <div className="size-9 rounded-full flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-white group-hover:translate-x-1 transition-all">
                        <ArrowRight className="size-4" />
                      </div>
                    </Link>
                  ) : (
                    <div className="p-6 rounded-lg border border-dashed border-border/50 bg-muted/5 text-muted-foreground/30 text-xs font-bold italic text-center uppercase tracking-widest">
                      Liên kết đích chưa được hệ thống đồng bộ hóa dữ liệu.
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-center pt-10">
                <Button
                  onClick={() => setIsViewModalOpen(false)}
                  className="rounded-md h-12 px-14 font-bold text-[11px] uppercase tracking-widest shadow-lg transition-all hover:-translate-y-0.5 italic"
                >
                  Đóng thông tin
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

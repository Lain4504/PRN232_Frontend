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

import { Mail, Eye, Calendar, Search, Activity, Globe, Share2, Sparkles, Zap, Layout, ArrowRight } from 'lucide-react'
import { ActionsDropdown, ActionItem } from '@/components/ui/actions-dropdown'
import type { Post } from '@/lib/types/omniadly-types'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Skeleton } from "@/components/ui/skeleton"
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
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
      case 'failed':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20'
      case 'deleted':
        return 'bg-slate-500/10 text-slate-500 border-slate-500/20'
      default:
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
    }
  }

  const columns: ColumnDef<Post>[] = [
    {
      accessorKey: 'brandName',
      header: "Thương hiệu",
      cell: ({ row }) => (
        <div className="flex items-center gap-4">
          <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <Share2 className="size-5" />
          </div>
          <div>
            <div className="font-black text-foreground uppercase tracking-tight text-sm">
              {row.original.brandName || "Không xác định"}
            </div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mt-1">
              {row.original.integrationPlatform || 'Đang xác định'}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: "Trạng thái",
      cell: ({ row }) => (
        <Badge variant="secondary" className={cn(
          "text-[10px] font-black uppercase py-1 px-3 rounded-lg border",
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
            <div className="text-sm font-black text-foreground truncate max-w-[250px] uppercase tracking-tight">
              {title || "Nội dung hệ thống"}
            </div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
              ID: {id?.substring(0, 8) || 'N/A'}...
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
            <div className="text-xs font-black text-foreground">
              {date ? new Date(date).toLocaleDateString('vi-VN') : '---'}
            </div>
            <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">
              {date ? new Date(date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Chờ đăng'}
            </div>
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Thao tác</div>,
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center font-fira-sans animate-in fade-in duration-700">
        <Activity className="h-20 w-20 text-primary mb-6 animate-pulse opacity-20" />
        <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground italic">Bộ truyền nhận tín hiệu bị ngắt</h1>
        <p className="text-muted-foreground mt-4 max-w-md font-bold italic border-l-4 border-primary pl-4">Vui lòng chọn một hồ sơ hoạt động để truy nhập luồng dữ liệu truyền tin.</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-12 font-fira-sans mb-20 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink href="/dashboard">Bảng điều khiển</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage>Nhật ký bài đăng</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="space-y-2">
            <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-tight">
              Quản lý <span className="text-slate-400 dark:text-slate-600">bài đăng</span>
            </h1>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-tighter leading-relaxed max-w-xl border-l-4 border-primary pl-4 pr-10">
              Theo dõi trạng thái xuất bản và hiệu quả phân phối nội dung trên các nền tảng mạng xã hội đã kết nối.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-10 p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-black/20">
            <div className="space-y-1">
              <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Tổng số bài đăng</div>
              <div className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">
                {postsData?.totalCount || postsData?.data?.length || 0}
              </div>
            </div>
            <div className="h-10 w-px bg-slate-100 dark:bg-slate-800" />
            <div className="space-y-1 text-right">
              <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none">Hệ thống</div>
              <div className="text-3xl font-black tracking-tighter text-emerald-500 uppercase leading-none italic animate-pulse">LIVE</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Station */}
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            <div className="relative w-full sm:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 dark:text-slate-600 group-focus-within:text-primary transition-colors" />
              <Input
                className="pl-12 h-12 bg-white dark:bg-slate-950 rounded-2xl border-slate-100 dark:border-slate-800 shadow-sm font-bold text-sm"
                placeholder="Tìm tên bài viết..."
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
              <SelectTrigger className="h-12 w-full sm:w-[180px] rounded-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 font-black uppercase text-[10px] tracking-widest">
                <SelectValue placeholder="TRẠNG THÁI" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100 dark:border-slate-800 font-bold uppercase tracking-wider text-[10px] p-1">
                <SelectItem value="all" className="rounded-xl">TẤT CẢ TRẠNG THÁI</SelectItem>
                <SelectItem value="published" className="rounded-xl">ĐÃ XUẤT BẢN</SelectItem>
                <SelectItem value="failed" className="rounded-xl">THẤT BẠI</SelectItem>
                <SelectItem value="deleted" className="rounded-xl">ĐÃ XÓA</SelectItem>
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
              <SelectTrigger className="h-12 w-full sm:w-[140px] rounded-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 font-black uppercase text-[10px] tracking-widest">
                <SelectValue placeholder="PHÂN TRANG" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100 dark:border-slate-800 font-bold uppercase tracking-wider text-[10px] p-1">
                {[10, 20, 50, 100].map((size) => (
                  <SelectItem key={size} value={String(size)} className="rounded-xl">
                    HIỆN {size} DÒNG
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="rounded-[2.5rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-black/40 relative">
          <CustomTable
            columns={columns}
            data={postsData?.data || []}
            pageSize={pageSize}
            isLoading={isLoading}
            emptyMessage="Chưa có dữ liệu bài đăng nào được ghi nhận."
            className="border-0 shadow-none bg-transparent"
            headerClassName="bg-slate-50/50 dark:bg-slate-800/30 border-b py-6 px-8 font-black uppercase text-[10px] tracking-widest text-slate-400 dark:text-slate-600"
          />
        </Card>
      </div>

      {/* Post Details Modal - Redesigned */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl w-[95vw] p-0 border-none bg-white dark:bg-slate-950 rounded-[2.5rem] overflow-hidden shadow-3xl">
          <DialogHeader className="p-10 border-b border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-4 mb-2">
              <div className="size-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <Activity className="size-6" />
              </div>
              <DialogTitle className="text-3xl font-black tracking-tight uppercase leading-none">
                Chi tiết <span className="text-slate-400 dark:text-slate-600">bài đăng</span>
              </DialogTitle>
            </div>
            <DialogDescription className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[10px]">
              Phân tích chi tiết mã định danh và thông tin truyền tải
            </DialogDescription>
          </DialogHeader>

          {selectedPost && (
            <div className="p-10 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10 border-b border-slate-100 dark:border-slate-900">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Mã định danh bên ngoài</Label>
                    <div className="font-mono text-xs font-black p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 break-all text-slate-900 dark:text-white">
                      {selectedPost.externalPostId || "ĐANG CẬP NHẬT..."}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Mã định danh nội bộ</Label>
                    <div className="text-xs font-bold text-slate-500 font-mono italic">
                      {selectedPost.id}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2 text-right md:text-left">
                    <Label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Trạng thái xuất bản</Label>
                    <Badge variant="secondary" className={cn(
                      "text-[10px] font-black uppercase py-2 px-6 rounded-xl border-2 ring-4 ring-slate-50 dark:ring-slate-900/50",
                      getStatusStyle(selectedPost.status)
                    )}>
                      {(() => {
                        const s = (selectedPost.status || '').toLowerCase();
                        if (s === 'published') return 'Đã xuất bản';
                        if (s === 'failed') return 'Thất bại';
                        if (s === 'deleted') return 'Đã xóa';
                        return selectedPost.status || 'Chờ xử lý';
                      })()}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Thương hiệu</Label>
                  <div className="font-black text-xl flex items-center gap-3 uppercase tracking-tighter text-slate-900 dark:text-white">
                    <div className="size-3 rounded-full bg-primary shadow-lg shadow-primary/40 ring-4 ring-primary/10" />
                    {selectedPost.brandName || "Dữ liệu trống"}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Định danh nội dung</Label>
                  <div className="font-black text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 tracking-tight">
                    {selectedPost.contentTitle || "Chiến dịch không tên"}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Kênh truyền tải</Label>
                  <div className="font-black flex items-center gap-3 text-slate-900 dark:text-white uppercase tracking-tighter">
                    <div className="size-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Globe className="size-4" />
                    </div>
                    <span>
                      {selectedPost.integrationPlatform || "Mạng xã hội"}
                      {selectedPost.integrationAccountName && (
                        <>
                          <span className="mx-2 opacity-20">|</span>
                          <span className="text-slate-500">{selectedPost.integrationAccountName}</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Mốc thời gian</Label>
                  <div className="font-black text-base tracking-tighter text-slate-900 dark:text-white flex items-center gap-3">
                    <Calendar className="size-4 text-primary opacity-50" />
                    {selectedPost.publishedAt
                      ? new Date(selectedPost.publishedAt).toLocaleString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })
                      : "CHƯA XÁC ĐỊNH"}
                  </div>
                </div>

                <div className="md:col-span-2 space-y-4 pt-4">
                  <Label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Liên kết phân phối</Label>
                  {selectedPost.link ? (
                    <Link
                      href={selectedPost.link}
                      target="_blank"
                      className="group flex items-center justify-between p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-500/5 hover:bg-emerald-100 dark:hover:bg-emerald-500/10 border-2 border-emerald-100/50 dark:border-emerald-500/10 transition-all duration-300"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="size-10 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-100 dark:border-emerald-500/20">
                          <Layout className="size-5" />
                        </div>
                        <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 truncate tracking-tight">
                          {selectedPost.link}
                        </span>
                      </div>
                      <div className="size-10 rounded-full flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all transform group-hover:rotate-45">
                        <ArrowRight className="size-5" />
                      </div>
                    </Link>
                  ) : (
                    <div className="p-5 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-600 text-xs font-bold italic text-center">
                      Liên kết bài đăng chưa được hệ thống đồng bộ hóa.
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-8">
                <Button
                  onClick={() => setIsViewModalOpen(false)}
                  className="rounded-2xl h-14 px-12 font-black uppercase tracking-widest text-xs bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-200 dark:shadow-none"
                >
                  Đóng chi tiết
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

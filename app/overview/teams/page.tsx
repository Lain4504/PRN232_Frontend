"use client"

import { useState } from 'react'
import Image from 'next/image'
import { useUser } from '@/hooks/use-user'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Users, Building2, Search, Filter, AlertCircle, Shield, ArrowLeft, MoreVertical, ExternalLink, User } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Team {
  id: string
  name: string
  description?: string
  userRole: 'Owner' | 'Admin' | 'Member' | 'Vendor'
  membersCount: number
  createdAt: string
  avatarUrl?: string
  status?: 'Active' | 'Inactive' | 'Archived'
}

export default function TeamsPage() {
  const { data: user, isLoading: userLoading } = useUser()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const { data: teams = [], isLoading: teamsLoading, error: teamsError } = useQuery({
    queryKey: ['user-teams', user?.id],
    queryFn: async (): Promise<Team[]> => {
      if (!user?.id) return []
      try {
        const response = await api.get('/team/user-teams')
        return Array.isArray(response.data) ? response.data : []
      } catch (error) {
        console.error('Error loading teams:', error)
        return []
      }
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  })

  const handleTeamSelect = (team: Team) => {
    localStorage.setItem('activeTeamId', team.id)
    window.location.href = `/dashboard`
  }

  const getRoleStyle = (role: string) => {
    switch (role) {
      case 'Owner': return 'bg-slate-900 text-white border-transparent'
      case 'Admin': return 'bg-blue-50 text-blue-600 border-blue-100'
      case 'Member': return 'bg-slate-100 text-slate-600 border-slate-200'
      default: return 'bg-slate-50 text-slate-400 border-slate-100'
    }
  }

  if (userLoading || teamsLoading) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-8 space-y-12">
        <div className="space-y-4">
          <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 animate-pulse rounded" />
          <div className="h-10 w-64 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" />
          <div className="h-6 w-96 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" />
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 pt-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 w-full bg-slate-50 dark:bg-slate-900 animate-pulse rounded-3xl border border-slate-100 dark:border-slate-800" />
          ))}
        </div>
      </div>
    )
  }

  const filteredTeams = teams.filter(team => {
    // Exclude teams that belong to user's personal profiles (Role Vendor/Owner)
    if (team.userRole === 'Vendor' || team.userRole === 'Owner') return false;

    const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || team.status === statusFilter || (!team.status && statusFilter === 'Active')
    return matchesSearch && matchesStatus
  })

  return (
    <div className="max-w-6xl mx-auto py-6 md:py-12 px-4 md:px-8 space-y-8 md:space-y-12 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-10 border-b border-slate-100 dark:border-slate-800 pb-6 md:pb-12">
        <div className="space-y-4 md:space-y-6 text-center md:text-left">
          <Link href="/overview" className="inline-flex items-center gap-2 text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-colors mx-auto md:mx-0">
            <ArrowLeft className="h-3.5 w-3.5" />
            Quay lại tổng quan
          </Link>
          <div className="space-y-2">
            <h1 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Nhóm của tôi
            </h1>
            <p className="text-sm md:text-lg text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto md:mx-0">
              Quản lý và truy cập các đội nhóm mà bạn đang tham gia.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center md:justify-end gap-8 md:gap-12">
          <div className="text-center md:text-right">
            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Tổng số nhóm</p>
            <p className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-none">{teams.length}</p>
          </div>
          <div className="text-center md:text-right hidden sm:block">
            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Trạng thái</p>
            <p className="text-2xl md:text-3xl font-black text-emerald-500 dark:text-emerald-400 leading-none">Hoạt động</p>
          </div>
        </div>
      </div>


      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full max-w-md group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors" />
          <Input
            placeholder="Tìm kiếm đội nhóm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-slate-50 dark:bg-slate-900 border-none rounded-xl font-medium focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-slate-100 dark:focus:ring-slate-800 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
          />
        </div>
        <div className="w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px] h-11 rounded-xl bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm font-bold text-slate-600 dark:text-slate-400">
              <div className="flex items-center">
                <Filter className="h-4 w-4 mr-2 opacity-50" />
                <SelectValue placeholder="Trạng thái" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 dark:border-slate-800 p-1 bg-white dark:bg-slate-900">
              <SelectItem value="all" className="rounded-lg font-bold">Tất cả</SelectItem>
              <SelectItem value="Active" className="rounded-lg font-bold">Hoạt động</SelectItem>
              <SelectItem value="Inactive" className="rounded-lg font-bold">Ngưng hoạt động</SelectItem>
              <SelectItem value="Archived" className="rounded-lg font-bold">Lưu trữ</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content Area */}
      <div className="pt-4">
        {teamsError ? (
          <div className="flex flex-col items-center justify-center py-24 px-8 text-center rounded-3xl bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20">
            <div className="size-16 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center mb-6 shadow-sm border border-rose-100 dark:border-rose-800">
              <AlertCircle className="h-8 w-8 text-rose-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-rose-900 dark:text-rose-400">Lỗi kết nối</h3>
              <p className="text-rose-600 dark:text-rose-500 font-medium max-w-md">
                Không thể tải dữ liệu đội nhóm. Vui lòng thử lại sau.
              </p>
              <Button onClick={() => window.location.reload()} variant="outline" className="mt-8 rounded-xl font-bold border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-white dark:hover:bg-slate-800 transition-all">
                Thử lại ngay
              </Button>
            </div>
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-8 text-center rounded-3xl bg-slate-50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800 border-dashed">
            <div className="size-16 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center mb-6 shadow-sm border border-slate-100 dark:border-slate-800">
              <Shield className="h-8 w-8 text-slate-200 dark:text-slate-700" />
            </div>
            <div className="space-y-4 text-center">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Không tìm thấy nhóm nào</h3>
              <p className="text-slate-400 dark:text-slate-500 font-medium max-w-md">
                {searchQuery || statusFilter !== 'all' ? 'Dường như không có nhóm nào khớp với bộ lọc của bạn.' : 'Bạn chưa tham gia vào bất kỳ đội nhóm nào từ hồ sơ khác.'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <div className="pt-4">
                  <Link href="/overview">
                    <Button variant="outline" className="rounded-xl font-bold border-slate-200 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800">
                      <User className="h-4 w-4 mr-2" />
                      Xem hồ sơ cá nhân của tôi
                    </Button>
                  </Link>
                </div>
              )}
            </div>
            {(searchQuery || statusFilter !== 'all') && (
              <Button onClick={() => { setSearchQuery(''); setStatusFilter('all'); }} variant="ghost" className="mt-8 font-bold text-slate-900 dark:text-white hover:bg-white dark:hover:bg-slate-800 transition-all">
                Xóa bộ lọc
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 pb-10 md:pb-20">
            {filteredTeams.map((team) => (
              <Card
                key={team.id}
                onClick={() => handleTeamSelect(team)}
                className="group relative rounded-2xl md:rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all duration-300 cursor-pointer overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-black/50 hover:-translate-y-1"
              >
                <CardContent className="p-6 md:p-10">
                  <div className="flex justify-between items-start mb-6 md:mb-8">
                    <div className="size-12 md:size-14 rounded-xl md:rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center transition-colors overflow-hidden group-hover:bg-white dark:group-hover:bg-slate-700 shadow-sm ring-4 ring-white dark:ring-slate-900">
                      {team.avatarUrl ? (
                        <Image
                          src={team.avatarUrl}
                          alt={team.name}
                          width={56}
                          height={56}
                          className="size-full object-cover rounded-xl md:rounded-2xl"
                        />
                      ) : (
                        <Building2 className="h-6 w-6 md:h-7 md:w-7 text-slate-400 dark:text-slate-500" />
                      )}
                    </div>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest px-2 md:px-3 py-0.5 md:py-1",
                        (team.status === 'Active' || !team.status)
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                      )}
                    >
                      {team.status === 'Active' ? 'Hoạt động' : team.status === 'Inactive' ? 'Ngưng hoạt động' : team.status === 'Archived' ? 'Lưu trữ' : 'Hoạt động'}
                    </Badge>
                  </div>

                  <div className="space-y-2 md:space-y-3 mb-6 md:mb-10">
                    <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white group-hover:text-slate-900 dark:group-hover:text-primary transition-colors line-clamp-1 leading-tight">
                      {team.name}
                    </h3>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={cn("rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 border dark:border-slate-800", getRoleStyle(team.userRole))}>
                        {team.userRole === 'Owner' ? 'Chủ sở hữu' : team.userRole === 'Admin' ? 'Quản trị viên' : team.userRole === 'Member' ? 'Thành viên' : team.userRole}
                      </Badge>
                      <span className="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500">
                        Từ {new Date(team.createdAt).getFullYear()}
                      </span>
                    </div>
                  </div>

                  <div className="pt-6 md:pt-8 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                      <Users className="size-4" />
                      <span className="text-[10px] md:text-xs font-extrabold uppercase tracking-widest">{team.membersCount} Thành viên</span>
                    </div>
                    <div className="size-8 rounded-full flex items-center justify-center group-hover:bg-slate-900 dark:group-hover:bg-primary transition-all duration-500">
                      <ExternalLink className="size-3.5 md:size-4 text-slate-200 dark:text-slate-700 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

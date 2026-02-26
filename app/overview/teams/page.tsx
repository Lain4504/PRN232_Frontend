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
      case 'Owner': return 'bg-primary/10 text-primary border-primary/20'
      case 'Admin': return 'bg-blue-500/10 text-blue-600 border-blue-500/20'
      case 'Member': return 'bg-muted text-muted-foreground border-border'
      default: return 'bg-muted/50 text-muted-foreground border-border'
    }
  }

  if (userLoading || teamsLoading) {
    return (
      <div className="max-w-5xl mx-auto py-10 px-6 space-y-10">
        <div className="space-y-4">
          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
          <div className="h-10 w-64 bg-muted animate-pulse rounded-md" />
          <div className="h-6 w-96 bg-muted animate-pulse rounded-md" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 w-full bg-card animate-pulse rounded-lg border border-border" />
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
    <div className="max-w-5xl mx-auto py-10 px-6 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border pb-10">
        <div className="space-y-4 text-center md:text-left">
          <Link href="/overview" className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mx-auto md:mx-0">
            <ArrowLeft className="h-3.5 w-3.5" />
            Quay lại tổng quan
          </Link>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground leading-tight">
              Nhóm của tôi
            </h1>
            <p className="text-sm text-muted-foreground font-medium max-w-xl mx-auto md:mx-0 italic">
              Quản lý và tiếp cận các tổ chức cộng tác mà bạn đã tham gia.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center md:justify-end gap-10">
          <div className="text-center md:text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Cấu trúc nhóm</p>
            <p className="text-3xl font-bold text-foreground leading-none">{teams.length}</p>
          </div>
          <div className="text-center md:text-right hidden sm:block">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Tình thái</p>
            <p className="text-3xl font-bold text-emerald-500 leading-none">Hoạt động</p>
          </div>
        </div>
      </div>


      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="relative w-full max-w-md group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Tìm kiếm đội nhóm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 bg-muted/20 border-border rounded-md font-medium focus-visible:ring-primary shadow-sm"
          />
        </div>
        <div className="w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[200px] h-10 rounded-md bg-card border-border shadow-sm font-semibold">
              <div className="flex items-center">
                <Filter className="h-4 w-4 mr-2 opacity-50" />
                <SelectValue placeholder="Toàn bộ trạng thái" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-md border-border p-1 bg-popover">
              <SelectItem value="all" className="rounded-sm font-bold">Toàn bộ</SelectItem>
              <SelectItem value="Active" className="rounded-sm font-bold">Hoạt động</SelectItem>
              <SelectItem value="Inactive" className="rounded-sm font-bold">Vô hiệu</SelectItem>
              <SelectItem value="Archived" className="rounded-sm font-bold">Lưu trữ</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content Area */}
      <div className="pt-4">
        {teamsError ? (
          <div className="flex flex-col items-center justify-center py-20 px-8 text-center rounded-lg bg-destructive/5 border border-destructive/10">
            <div className="size-16 rounded-full bg-card flex items-center justify-center mb-6 shadow-sm border border-destructive/20">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-destructive">Lỗi truy xuất dữ liệu</h3>
              <p className="text-muted-foreground font-medium max-w-md italic">
                Cấu hình kết nối gặp sự cố. Vui lòng thử lại sau giây lát.
              </p>
              <Button onClick={() => window.location.reload()} variant="outline" className="mt-8 rounded-md font-bold transition-all shadow-sm">
                Xác thực lại
              </Button>
            </div>
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-8 text-center rounded-lg bg-muted/10 border border-border border-dashed">
            <div className="size-16 rounded-full bg-card flex items-center justify-center mb-6 shadow-sm border border-border">
              <Shield className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <div className="space-y-4 text-center">
              <h3 className="text-lg font-bold text-foreground">Không tìm nhận diện thực thể</h3>
              <p className="text-muted-foreground font-medium max-w-md italic">
                {searchQuery || statusFilter !== 'all' ? 'Dữ liệu không tồn tại trong tập bộ lọc hiện thời.' : 'Tài khoản chưa thực hiện liên kết với bất kỳ tổ chức định danh nào.'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <div className="pt-4">
                  <Link href="/overview">
                    <Button variant="outline" className="rounded-md font-bold shadow-sm">
                      <User className="h-4 w-4 mr-2" />
                      Trở về quản trị hồ sơ
                    </Button>
                  </Link>
                </div>
              )}
            </div>
            {(searchQuery || statusFilter !== 'all') && (
              <Button onClick={() => { setSearchQuery(''); setStatusFilter('all'); }} variant="ghost" className="mt-8 font-bold text-muted-foreground hover:text-foreground">
                Hoàn tác bộ lọc
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
            {filteredTeams.map((team) => (
              <Card
                key={team.id}
                onClick={() => handleTeamSelect(team)}
                className="group relative rounded-lg border border-border bg-card hover:border-primary/50 transition-all duration-300 cursor-pointer overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1"
              >
                <CardContent className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className="size-12 rounded-md bg-muted flex items-center justify-center transition-colors overflow-hidden group-hover:bg-primary/5 shadow-sm border border-border">
                      {team.avatarUrl ? (
                        <Image
                          src={team.avatarUrl}
                          alt={team.name}
                          width={48}
                          height={48}
                          className="size-full object-cover rounded-sm"
                        />
                      ) : (
                        <Building2 className="h-6 w-6 text-muted-foreground/50" />
                      )}
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-md text-[10px] font-bold px-2.5 py-0.5",
                        (team.status === 'Active' || !team.status)
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                          : 'bg-muted text-muted-foreground border-border'
                      )}
                    >
                      {team.status === 'Active' ? 'Hoạt động' : team.status === 'Inactive' ? 'Vô hiệu' : team.status === 'Archived' ? 'Lưu trữ' : 'Hoạt động'}
                    </Badge>
                  </div>

                  <div className="space-y-3 mb-8">
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 leading-tight">
                      {team.name}
                    </h3>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={cn("rounded-md text-[10px] font-bold px-2 py-0.5 border shadow-sm", getRoleStyle(team.userRole))}>
                        {team.userRole === 'Owner' ? 'Sở hữu' : team.userRole === 'Admin' ? 'Quản trị' : team.userRole === 'Member' ? 'Thành viên' : team.userRole}
                      </Badge>
                      <span className="text-[10px] font-semibold text-muted-foreground italic">
                        Từ {new Date(team.createdAt).getFullYear()}
                      </span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                      <Users className="size-4" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">{team.membersCount} Nhân sự</span>
                    </div>
                    <div className="size-8 rounded-full flex items-center justify-center bg-muted/50 group-hover:bg-primary transition-all duration-300">
                      <ExternalLink className="size-3.5 text-muted-foreground group-hover:text-white transition-colors" />
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

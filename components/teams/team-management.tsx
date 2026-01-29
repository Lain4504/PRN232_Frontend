"use client"

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CustomTabs, CustomTabItem } from '@/components/ui/custom-tabs'
import { ArrowLeft, Users, UserPlus, Activity, Shield, Mail, MoreVertical, Building2, Plus, Target, ChevronRight, MoreHorizontal } from 'lucide-react'
import Link from 'next/link'
import { TeamMembersTable } from '@/components/pages/teams/TeamMembersTable'
import { AddMemberDialog } from '@/components/pages/teams/AddMemberDialog'
import { AddBrandDialog } from '@/components/pages/teams/AddBrandDialog'
import { TeamBrandsList } from '@/components/pages/teams/TeamBrandsList'
import { EditMemberDialog } from './edit-member-dialog'
import { useTeam, useTeamMembers } from '@/hooks/use-teams'
import { TeamMemberResponseDto } from '@/lib/types/omniadly-types'
import { cn } from "@/lib/utils"

interface TeamManagementProps {
  teamId: string
  canManage?: boolean
}

export function TeamManagement({ teamId, canManage = true }: TeamManagementProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [addMemberOpen, setAddMemberOpen] = useState(false)
  const [addBrandOpen, setAddBrandOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMemberResponseDto | null>(null)

  const { data: team, isLoading: teamLoading } = useTeam(teamId)
  const { data: members, isLoading: membersLoading } = useTeamMembers(teamId)

  const handleEditMember = (member: TeamMemberResponseDto) => {
    setEditingMember(member)
  }

  const handleCloseEditMember = () => {
    setEditingMember(null)
  }

  if (teamLoading) return (
    <div className="space-y-12 animate-pulse">
      <div className="h-12 w-64 bg-slate-100 dark:bg-slate-800 rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800" />)}
      </div>
    </div>
  )

  if (!team) return (
    <div className="flex flex-col items-center justify-center py-32 text-center bg-slate-50/50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
      <Shield className="size-16 text-slate-300 dark:text-slate-700 mb-8" />
      <h3 className="text-3xl font-black uppercase tracking-tight mb-3 text-slate-900 dark:text-white leading-none">Không tìm thấy đội nhóm</h3>
      <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto mb-10 leading-relaxed italic border-l-4 border-slate-100 dark:border-slate-800 pl-6">Dữ liệu đội nhóm không tồn tại hoặc bạn không có quyền truy cập phối hợp.</p>
      <Link href="/dashboard/teams">
        <Button variant="outline" className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800">Quay lại danh sách</Button>
      </Link>
    </div>
  )

  const totalMembers = team.membersCount || 0
  const activeMembers = members?.filter(m => m.isActive).length || 0
  const pendingInvitations = 0

  const tabItems: CustomTabItem[] = [
    { value: 'overview', label: 'Tổng quan' },
    { value: 'members', label: 'Thành viên' },
    { value: 'brands', label: 'Thương hiệu' },
  ]

  return (
    <div className="space-y-12 pb-20 font-sans">
      {/* Navigation */}
      <Link href="/dashboard/teams" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
        <ArrowLeft className="size-3.5" />
        Quay lại danh sách đội ngũ
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-100 dark:border-slate-800 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
              <Target className="size-4" />
            </div>
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Hồ sơ định danh nhóm</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-none truncate max-w-[800px]">
            {team.name}
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-xl leading-relaxed">
            {team.description || 'Quản lý cấu trúc thành viên, thương hiệu và quyền hạn cộng tác trong tổ chức của bạn.'}
          </p>
        </div>

        {canManage && (
          <Button variant="outline" className="h-14 w-14 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white shadow-sm transition-all hover:-translate-y-1">
            <MoreHorizontal className="size-5" />
          </Button>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: "Tổng nhân sự", value: totalMembers, icon: Users, color: "text-slate-900 dark:text-white", bg: "bg-slate-100 dark:bg-slate-800" },
          { label: "Đang hoạt động", value: activeMembers, icon: Activity, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
          { label: "Lời mời chờ", value: pendingInvitations, icon: Mail, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10" },
          { label: "Trạng thái nhóm", value: team.status, icon: Shield, color: team.status === 'Active' ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400", bg: team.status === 'Active' ? "bg-emerald-50 dark:bg-emerald-500/10" : "bg-amber-50 dark:bg-amber-500/10" },
        ].map((stat, i) => (
          <Card key={i} className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm group hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/50 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-8">
              <div className={cn("size-12 rounded-2xl flex items-center justify-center shadow-sm border border-white dark:border-slate-800 ring-4 ring-slate-50 dark:ring-slate-800/10", stat.bg, stat.color)}>
                <stat.icon className="size-5 transition-transform group-hover:rotate-12" />
              </div>
              <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-600 border-slate-100 dark:border-slate-800 p-1 px-2">Thời gian thực</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Content Tabs */}
      <div className="space-y-10">
        <CustomTabs
          items={tabItems}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          className="bg-transparent border-b border-slate-100 dark:border-slate-800 rounded-none p-0 inline-flex gap-8"
        />

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Quick Actions */}
            <Card className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-10 space-y-8">
              <div className="space-y-2">
                <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest leading-none">Thao tác nhanh</h4>
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500">Các quy trình quản trị đội ngũ được tối ưu hóa</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Mời nhân sự", desc: "Thêm thành viên mới", icon: UserPlus, onClick: () => setAddMemberOpen(true) },
                  { label: "Gán thương hiệu", desc: "Liên kết Brand với Team", icon: Building2, onClick: () => setAddBrandOpen(true) },
                  { label: "Xem thành viên", desc: "Danh sách chi tiết", icon: Users, onClick: () => setActiveTab('members') },
                  { label: "Xem thương hiệu", desc: "Danh sách sở hữu", icon: Building2, onClick: () => setActiveTab('brands') },
                ].map((action, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="h-auto p-6 flex flex-col items-start gap-4 rounded-2xl border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all text-left group bg-white dark:bg-slate-900"
                    onClick={action.onClick}
                    disabled={!canManage}
                  >
                    <div className="size-10 rounded-xl bg-slate-900 dark:bg-primary flex items-center justify-center text-white ring-4 ring-slate-50 dark:ring-slate-800 group-hover:scale-110 transition-transform">
                      <action.icon className="size-5" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight block">{action.label}</span>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{action.desc}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </Card>

            {/* Strategy Banner */}
            <Card className="p-10 rounded-3xl bg-slate-900 dark:bg-primary text-white relative overflow-hidden group border-none flex flex-col justify-center shadow-xl shadow-slate-200 dark:shadow-primary/20">
              <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                <Target className="size-48" />
              </div>
              <div className="space-y-6 relative z-10">
                <div className="size-14 rounded-2xl bg-white/10 flex items-center justify-center text-white shrink-0 shadow-2xl border border-white/5">
                  <Shield className="size-7" />
                </div>
                <div className="space-y-4">
                  <h4 className="text-xl font-black tracking-tight uppercase tracking-widest">Bảng điều khiển tác chiến</h4>
                  <p className="text-sm text-slate-400 dark:text-slate-100/70 leading-relaxed font-bold">
                    Tất cả các thành viên trong nhóm này sẽ có quyền truy cập phối hợp dựa trên vai trò được gán.
                    Sử dụng các thao tác nhanh để duy trì luồng vận hành của tổ chức.
                  </p>
                  <Button variant="ghost" className="p-0 text-white hover:text-emerald-400 dark:hover:text-white font-black text-[10px] uppercase tracking-widest hover:bg-transparent flex items-center gap-2">
                    Hướng dẫn phân quyền <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-8 rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/40 dark:shadow-black/40">
              <TeamMembersTable
                teamId={teamId}
                canManage={canManage}
                onEditMember={handleEditMember}
                onInviteMember={() => setAddMemberOpen(true)}
              />
            </div>
          </div>
        )}

        {activeTab === 'brands' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-8 rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/40 dark:shadow-black/40">
              <TeamBrandsList
                teamId={teamId}
                canManage={canManage}
                onAddBrand={() => setAddBrandOpen(true)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <AddMemberDialog open={addMemberOpen} onOpenChange={setAddMemberOpen} teamId={teamId} />
      <EditMemberDialog open={!!editingMember} onOpenChange={(open) => !open && handleCloseEditMember()} teamId={teamId} member={editingMember} />
      <AddBrandDialog open={addBrandOpen} onOpenChange={setAddBrandOpen} teamId={teamId} onSuccess={() => { }} />
    </div>
  )
}

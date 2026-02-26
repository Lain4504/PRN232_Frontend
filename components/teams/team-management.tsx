"use client"

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import { CustomTabs, CustomTabItem } from '@/components/ui/custom-tabs'
import { ArrowLeft, Users, UserPlus, Activity, Shield, Mail, Building2, Target, ChevronRight, MoreHorizontal } from 'lucide-react'
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
  const { data: members, isLoading: _membersLoading } = useTeamMembers(teamId)

  const handleEditMember = (member: TeamMemberResponseDto) => {
    setEditingMember(member)
  }

  const handleCloseEditMember = () => {
    setEditingMember(null)
  }

  if (teamLoading) return (
    <div className="space-y-12 animate-pulse">
      <div className="h-10 w-64 bg-muted rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-card rounded-lg border" />)}
      </div>
    </div>
  )

  if (!team) return (
    <div className="flex flex-col items-center justify-center py-24 text-center bg-muted/30 rounded-lg border border-dashed">
      <Shield className="size-12 text-muted-foreground/30 mb-6" />
      <h3 className="text-2xl font-bold tracking-tight mb-2 text-foreground">Không tìm thấy đội nhóm</h3>
      <p className="text-sm text-muted-foreground font-medium max-w-sm mx-auto mb-8 leading-relaxed italic border-l-2 pl-4">Dữ liệu đội nhóm không tồn tại hoặc bạn không có quyền truy cập phối hợp.</p>
      <Link href="/dashboard/teams">
        <Button variant="outline" className="h-10 px-6 rounded-md font-semibold text-sm">Quay lại danh sách</Button>
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
    <div className="space-y-10 pb-20 font-sans">
      {/* Navigation */}
      <Link href="/dashboard/teams" className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="size-3.5" />
        Quay lại danh sách đội ngũ
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded bg-muted flex items-center justify-center text-muted-foreground">
              <Target className="size-3" />
            </div>
            <span className="text-[11px] font-semibold text-muted-foreground">Hồ sơ định danh nhóm</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground truncate max-w-[800px]">
            {team.name}
          </h1>
          <p className="text-sm text-muted-foreground font-medium max-w-xl leading-relaxed">
            {team.description || 'Quản lý cấu trúc thành viên, thương hiệu và quyền hạn cộng tác trong tổ chức của bạn.'}
          </p>
        </div>

        {canManage && (
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-md">
            <MoreHorizontal className="size-4" />
          </Button>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Tổng nhân sự", value: totalMembers, icon: Users, color: "text-foreground", bg: "bg-muted" },
          { label: "Đang hoạt động", value: activeMembers, icon: Activity, color: "text-emerald-600", bg: "bg-emerald-500/10" },
          { label: "Lời mời chờ", value: pendingInvitations, icon: Mail, color: "text-blue-600", bg: "bg-blue-500/10" },
          { label: "Trạng thái", value: team.status, icon: Shield, color: team.status === 'Active' ? "text-emerald-600" : "text-amber-600", bg: team.status === 'Active' ? "bg-emerald-500/10" : "bg-amber-500/10" },
        ].map((stat, i) => (
          <Card key={i} className="rounded-lg border bg-card p-6 shadow-sm transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("size-10 rounded flex items-center justify-center border", stat.bg, stat.color)}>
                <stat.icon className="size-4" />
              </div>
            </div>
            <div className="space-y-0.5">
              <p className="text-2xl font-bold text-foreground tracking-tight">{stat.value}</p>
              <p className="text-[11px] font-semibold text-muted-foreground">{stat.label}</p>
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
            <Card className="rounded-lg border bg-card shadow-sm p-8 space-y-6">
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-foreground leading-none">Thao tác nhanh</h4>
                <p className="text-xs font-medium text-muted-foreground">Các quy trình quản trị đội ngũ được tối ưu hóa</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Mời nhân sự", desc: "Thêm thành viên mới", icon: UserPlus, onClick: () => setAddMemberOpen(true) },
                  { label: "Gán thương hiệu", desc: "Liên kết Brand với Team", icon: Building2, onClick: () => setAddBrandOpen(true) },
                  { label: "Thành viên", desc: "Danh sách chi tiết", icon: Users, onClick: () => setActiveTab('members') },
                  { label: "Thương hiệu", desc: "Danh sách sở hữu", icon: Building2, onClick: () => setActiveTab('brands') },
                ].map((action, i) => (
                  <Button
                    key={i}
                    variant="ghost"
                    className="h-auto p-4 flex flex-col items-start gap-4 rounded-lg border border-transparent hover:border-border hover:bg-muted transition-all text-left"
                    onClick={action.onClick}
                    disabled={!canManage}
                  >
                    <div className="size-8 rounded bg-primary flex items-center justify-center text-primary-foreground">
                      <action.icon className="size-4" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[12px] font-bold text-foreground block">{action.label}</span>
                      <span className="text-[10px] font-medium text-muted-foreground leading-relaxed">{action.desc}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </Card>

            {/* Strategy Banner */}
            <Card className="p-8 rounded-lg bg-primary text-primary-foreground relative overflow-hidden group border-none flex flex-col justify-center shadow-md">
              <div className="absolute top-0 right-0 p-8 opacity-5 scale-150 rotate-12 transition-transform duration-1000">
                <Target className="size-48" />
              </div>
              <div className="space-y-4 relative z-10">
                <div className="size-10 rounded bg-white/10 flex items-center justify-center text-white shrink-0 border border-white/10">
                  <Shield className="size-5" />
                </div>
                <div className="space-y-3">
                  <h4 className="text-lg font-bold tracking-tight">Bảng điều khiển tác chiến</h4>
                  <p className="text-xs text-primary-foreground/80 leading-relaxed font-medium">
                    Tất cả các thành viên trong nhóm này sẽ có quyền truy cập phối hợp dựa trên vai trò được gán.
                    Sử dụng các thao tác nhanh để duy trì luồng vận hành của tổ chức.
                  </p>
                  <Button variant="ghost" className="p-0 h-auto text-[11px] font-bold hover:bg-transparent text-primary-foreground hover:text-primary-foreground hover:underline">
                    Hướng dẫn phân quyền <ChevronRight className="size-3 ml-1" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="p-6 rounded-lg border bg-card shadow-sm">
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
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="p-6 rounded-lg border bg-card shadow-sm">
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

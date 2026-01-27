"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/use-user'
import { useGetProfiles } from '@/hooks/use-profiles'
import { useProfile } from '@/lib/contexts/profile-context'
import { PROFILE_TYPE_LABELS, PROFILE_TYPE_COLORS, ProfileTypeEnum } from '@/lib/utils/profile-utils'
import { Profile } from '@/lib/types/omniadly-types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Building2, Search, User, ArrowRight, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function OverviewPage() {
  const router = useRouter()
  const { data: user, status: userStatus } = useUser()
  const {
    data: profiles = [],
    status: profilesStatus
  } = useGetProfiles(user?.id || '')

  const { setActiveProfile, activeProfileId, isLoading: isProfileLoading } = useProfile()
  const [searchQuery, setSearchQuery] = useState('')

  const userLoading = userStatus === 'pending'
  const profilesLoading = profilesStatus === 'pending'

  const handleProfileSelect = (profile: Profile) => {
    setActiveProfile(profile.id, {
      id: profile.id,
      name: profile.name || profile.company_name || `${profile.profileType} Profile`,
      type: profile.profileType as unknown as ProfileTypeEnum,
      avatarUrl: profile.avatarUrl,
      companyName: profile.company_name,
      isOwner: profile.isOwner ?? false,
      memberRole: profile.memberRole,
      status: profile.status as number
    })
    router.push('/dashboard')
  }

  useEffect(() => {
    if (userStatus === 'success' && profilesStatus === 'success' && !isProfileLoading) {
      if (profiles.length === 0) {
        router.replace('/onboarding');
        return;
      }
      if (profiles.length === 1 && !activeProfileId && !searchQuery) {
        const profile = profiles[0];
        setActiveProfile(profile.id, {
          id: profile.id,
          name: profile.name || profile.company_name || `${profile.profileType} Profile`,
          type: profile.profileType as unknown as ProfileTypeEnum,
          avatarUrl: profile.avatarUrl,
          companyName: profile.company_name,
          isOwner: profile.isOwner ?? false,
          memberRole: profile.memberRole,
          status: profile.status as number
        });
        router.push('/dashboard');
      }
    }
  }, [userStatus, profilesStatus, profiles, router, setActiveProfile, activeProfileId, isProfileLoading, searchQuery]);

  if (userLoading || profilesLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
        <div className="flex flex-col space-y-4 w-full max-w-md px-6">
          <div className="h-8 w-1/3 bg-slate-100 animate-pulse rounded-lg" />
          <div className="h-12 w-full bg-slate-100 animate-pulse rounded-xl" />
          <div className="grid gap-4 pt-8">
            <div className="h-32 w-full bg-slate-50 animate-pulse rounded-2xl border border-slate-100/50" />
            <div className="h-32 w-full bg-slate-50 animate-pulse rounded-2xl border border-slate-100/50" />
          </div>
        </div>
      </div>
    )
  }

  const filteredProfiles = Array.isArray(profiles) ? profiles.filter(profile => {
    const name = profile.name || profile.company_name || `${profile.profileType} Profile`
    return name.toLowerCase().includes(searchQuery.toLowerCase())
  }) : []

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 lg:px-8 space-y-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-slate-100 pb-12">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Hồ sơ làm việc
          </h1>
          <p className="text-lg text-slate-500 font-medium max-w-xl">
            Chọn một hồ sơ để bắt đầu quản lý các chiến dịch quảng cáo và nội dung AI của bạn.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group hidden sm:block">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
            <Input
              placeholder="Tìm kiếm hồ sơ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 w-64 bg-slate-50 border-transparent focus:bg-white focus:border-slate-200 rounded-xl font-medium transition-all"
            />
          </div>
          <Link href="/overview/profile/new">
            <Button className="h-11 px-6 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-200 transition-all hover:-translate-y-0.5">
              <Plus className="h-4 w-4 mr-2" />
              Tạo hồ sơ mới
            </Button>
          </Link>
        </div>
      </div>

      {/* Profiles List */}
      <div className="space-y-16">
        {filteredProfiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-8 text-center rounded-[2rem] bg-slate-50/50 border border-slate-100 border-dashed">
            <div className="size-16 rounded-2xl bg-white flex items-center justify-center mb-6 shadow-sm border border-slate-100">
              <Building2 className="h-8 w-8 text-slate-300" />
            </div>
            <div className="space-y-2 mb-8">
              <h3 className="text-xl font-bold text-slate-900">Không tìm thấy hồ sơ nào</h3>
              <p className="text-slate-500 font-medium max-w-sm mx-auto">
                {searchQuery ? "Thử tìm kiếm với từ khóa khác xem sao." : "Bắt đầu bằng cách tạo hồ sơ làm việc đầu tiên của bạn."}
              </p>
            </div>
            {!searchQuery && (
              <Link href="/overview/profile/new">
                <Button variant="outline" className="h-11 px-8 rounded-xl font-bold border-slate-200 hover:bg-white hover:border-slate-300">
                  <Plus className="h-4 w-4 mr-2" />
                  Bắt đầu ngay
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-8">
            {/* My Workspaces */}
            {filteredProfiles.some(p => p.isOwner) && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                    <User className="h-4 w-4" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 uppercase tracking-widest">Hồ sơ của tôi</h2>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredProfiles.filter(p => p.isOwner).map((profile) => (
                    <ProfileCard key={profile.id} profile={profile} onSelect={handleProfileSelect} />
                  ))}
                </div>
              </div>
            )}

            {/* Shared Workspaces */}
            {filteredProfiles.some(p => !p.isOwner) && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 pt-8">
                  <div className="size-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                    <Users className="h-4 w-4" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 uppercase tracking-widest">Đội nhóm chia sẻ</h2>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredProfiles.filter(p => !p.isOwner).map((profile) => (
                    <ProfileCard key={profile.id} profile={profile} onSelect={handleProfileSelect} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileCard({ profile, onSelect }: { profile: Profile; onSelect: (p: Profile) => void }) {
  const isAgency = profile.profileType !== ProfileTypeEnum.Free
  const isOwner = profile.isOwner

  const getStatusBadge = (status?: number) => {
    switch (status) {
      case 1: // Active
        return <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">Hoạt động</Badge>
      case 0: // Pending
        return <Badge className="bg-amber-50 text-amber-600 border-amber-100 rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">Đang chờ</Badge>
      case 2: // Suspended
        return <Badge className="bg-rose-50 text-rose-600 border-rose-100 rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">Tạm ngưng</Badge>
      case 3: // Cancelled
        return <Badge className="bg-slate-50 text-slate-500 border-slate-100 rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">Đã hủy</Badge>
      default:
        return null
    }
  }

  return (
    <Card
      className="group relative rounded-[2rem] border border-slate-100 bg-white hover:bg-slate-50/50 transition-all duration-300 cursor-pointer overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1"
      onClick={() => onSelect(profile)}
    >
      <CardContent className="p-8">
        <div className="flex items-start justify-between mb-8">
          <div className={cn(
            "size-14 rounded-2xl flex items-center justify-center border transition-colors",
            isAgency ? 'bg-purple-50 border-purple-100 text-purple-600' : 'bg-blue-50 border-blue-100 text-blue-600'
          )}>
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt=""
                className="size-full rounded-2xl object-cover"
              />
            ) : (
              isAgency ? <Building2 className="h-7 w-7" /> : <User className="h-7 w-7" />
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge
              variant="secondary"
              className={cn(
                "rounded-full text-[10px] font-black uppercase tracking-widest px-3 py-1",
                profile.profileType === ProfileTypeEnum.Pro ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"
              )}
            >
              {profile.profileType === ProfileTypeEnum.Pro ? "PRO" :
                profile.profileType === ProfileTypeEnum.Basic ? "BASIC" : "FREE"}
            </Badge>
            {getStatusBadge(profile.status as number)}
          </div>
        </div>

        <div className="space-y-2 mb-8">
          <h3 className="text-xl font-bold text-slate-900 group-hover:text-slate-900 transition-colors truncate">
            {profile.name || profile.company_name || "Hồ sơ chưa đặt tên"}
          </h3>
          <div className="flex items-center gap-3 text-sm font-medium text-slate-400">
            {profile.company_name && (
              <span className="flex items-center gap-1.5 border-r border-slate-200 pr-3">
                <Building2 className="size-3.5" />
                {profile.company_name}
              </span>
            )}
            <span className="flex items-center gap-1.5 uppercase text-[10px] tracking-widest font-bold">
              {isOwner ? "Chủ sở hữu" : (profile.memberRole || "Thành viên")}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-slate-50">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 group-hover:text-slate-900 transition-colors uppercase tracking-widest">
            Truy cập hồ sơ
            <ArrowRight className="size-4 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
          </div>
          <ExternalLink className="size-4 text-slate-200 group-hover:text-slate-400 transition-colors" />
        </div>
      </CardContent>
    </Card>
  )
}

function Users(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

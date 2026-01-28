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

  const ownedProfiles = Array.isArray(profiles) ? profiles.filter(p => p.isOwner) : []
  const sharedProfiles = Array.isArray(profiles) ? profiles.filter(p => !p.isOwner) : []

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

      // Remove auto-redirect to teams page to allow manual profile creation

      if (ownedProfiles.length === 1 && !activeProfileId && !searchQuery) {
        const profile = ownedProfiles[0];
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
  }, [userStatus, profilesStatus, profiles, router, setActiveProfile, activeProfileId, isProfileLoading, searchQuery, ownedProfiles, sharedProfiles]);

  if (userLoading || profilesLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
        <div className="flex flex-col space-y-4 w-full max-w-md px-6">
          <div className="h-8 w-1/3 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" />
          <div className="h-12 w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />
          <div className="grid gap-4 pt-8">
            <div className="h-32 w-full bg-slate-50 dark:bg-slate-900 animate-pulse rounded-2xl border border-slate-100/50 dark:border-slate-800/50" />
            <div className="h-32 w-full bg-slate-50 dark:bg-slate-900 animate-pulse rounded-2xl border border-slate-100/50 dark:border-slate-800/50" />
          </div>
        </div>
      </div>
    )
  }

  const filteredProfiles = ownedProfiles.filter(profile => {
    const name = profile.name || profile.company_name || `${profile.profileType} Profile`
    return name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <div className="max-w-6xl mx-auto py-6 md:py-12 px-4 md:px-6 lg:px-8 space-y-8 md:space-y-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8 border-b border-slate-100 dark:border-slate-800 pb-6 md:pb-12">
        <div className="space-y-2 md:space-y-4 text-center md:text-left">
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Hồ sơ làm việc
          </h1>
          <p className="text-sm md:text-lg text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto md:mx-0">
            Chọn một hồ sơ để bắt đầu quản lý các chiến dịch quảng cáo và nội dung AI của bạn.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 w-full md:w-auto">
          <div className="relative group w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors" />
            <Input
              placeholder="Tìm kiếm hồ sơ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 md:h-11 w-full bg-slate-50 dark:bg-slate-900 border-transparent dark:border-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:border-slate-200 dark:focus:border-slate-700 rounded-xl font-medium transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
            />
          </div>
          <Link href="/overview/profile/new" className="w-full sm:w-auto">
            <Button className="h-10 md:h-11 px-6 w-full rounded-xl font-bold bg-slate-900 dark:bg-primary hover:bg-slate-800 dark:hover:bg-primary/90 text-white shadow-xl shadow-slate-200 dark:shadow-primary/20 transition-all hover:-translate-y-0.5">
              <Plus className="h-4 w-4 mr-2" />
              Tạo hồ sơ mới
            </Button>
          </Link>
        </div>
      </div>

      {/* Profiles List */}
      <div className="space-y-8 md:space-y-16">
        {filteredProfiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 md:py-24 px-6 text-center rounded-2xl md:rounded-2xl bg-slate-50/50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800 border-dashed">
            <div className="size-12 md:size-16 rounded-xl md:rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center mb-4 md:mb-6 shadow-sm border border-slate-100 dark:border-slate-800">
              <Building2 className="h-6 w-6 md:h-8 md:w-8 text-slate-300 dark:text-slate-700" />
            </div>
            <div className="space-y-2 mb-6 md:mb-8">
              <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">Không tìm thấy hồ sơ nào</h3>
              <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto">
                {searchQuery ? "Thử tìm kiếm với từ khóa khác xem sao." : "Bắt đầu bằng cách tạo hồ sơ làm việc đầu tiên của bạn."}
              </p>
              {sharedProfiles.length > 0 && !searchQuery && (
                <p className="text-slate-400 dark:text-slate-500 text-xs md:text-sm mt-4">
                  Bạn có <b>{sharedProfiles.length}</b> hồ sơ đội nhóm chia sẻ. <Link href="/overview/teams" className="text-slate-900 dark:text-white underline font-bold">Xem tại đây</Link>
                </p>
              )}
            </div>
            {!searchQuery && (
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full sm:w-auto">
                <Link href="/overview/profile/new" className="w-full sm:w-auto">
                  <Button className="h-10 md:h-11 px-8 w-full rounded-xl font-bold bg-slate-900 dark:bg-primary text-white hover:bg-slate-800 dark:hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Tạo hồ sơ mới
                  </Button>
                </Link>
                {sharedProfiles.length > 0 && (
                  <Link href="/overview/teams" className="w-full sm:w-auto">
                    <Button variant="outline" className="h-10 md:h-11 px-8 w-full rounded-xl font-bold dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800">
                      <Users className="h-4 w-4 mr-2" />
                      Xem nhóm của tôi
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <User className="h-4 w-4" />
              </div>
              <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-widest">Hồ sơ của tôi</h2>
            </div>
            <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProfiles.map((profile) => (
                <ProfileCard key={profile.id} profile={profile} onSelect={handleProfileSelect} />
              ))}
            </div>
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
        return <Badge className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20 rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">Hoạt động</Badge>
      case 0: // Pending
        return <Badge className="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20 rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">Đang chờ</Badge>
      case 2: // Suspended
        return <Badge className="bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20 rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">Tạm ngưng</Badge>
      case 3: // Cancelled
        return <Badge className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-800 rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">Đã hủy</Badge>
      default:
        return null
    }
  }

  return (
    <Card
      className="group relative rounded-2xl md:rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all duration-300 cursor-pointer overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-black/50 hover:-translate-y-1"
      onClick={() => onSelect(profile)}
    >
      <CardContent className="p-5 md:p-8">
        <div className="flex items-start justify-between mb-4 md:mb-8">
          <div className={cn(
            "size-10 md:size-14 rounded-xl md:rounded-2xl flex items-center justify-center border transition-colors",
            isAgency
              ? 'bg-purple-50 dark:bg-purple-500/10 border-purple-100 dark:border-purple-500/20 text-purple-600 dark:text-purple-400'
              : 'bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400'
          )}>
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt=""
                className="size-full rounded-xl md:rounded-2xl object-cover"
              />
            ) : (
              isAgency ? <Building2 className="h-5 w-5 md:h-7 md:w-7" /> : <User className="h-5 w-5 md:h-7 md:w-7" />
            )}
          </div>
          <div className="flex flex-col items-end gap-1.5 md:gap-2">
            <Badge
              variant="secondary"
              className={cn(
                "rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest px-2 md:px-3 py-0.5 md:py-1",
                profile.profileType === ProfileTypeEnum.Pro
                  ? "bg-slate-900 dark:bg-primary text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
              )}
            >
              {profile.profileType === ProfileTypeEnum.Pro ? "PRO" :
                profile.profileType === ProfileTypeEnum.Basic ? "PLUS" : "FREE"}
            </Badge>
            {getStatusBadge(profile.status as number)}
          </div>
        </div>

        <div className="space-y-1 md:space-y-2 mb-4 md:mb-8">
          <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white group-hover:text-slate-900 dark:group-hover:text-primary transition-colors truncate">
            {profile.name || profile.company_name || "Hồ sơ chưa đặt tên"}
          </h3>
          <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs md:sm font-medium text-slate-400 dark:text-slate-500">
            {profile.company_name && (
              <span className="flex items-center gap-1.5 border-r border-slate-200 dark:border-slate-800 pr-2 md:pr-3">
                <Building2 className="size-3 md:size-3.5" />
                {profile.company_name}
              </span>
            )}
            <span className="flex items-center gap-1.5 uppercase text-[9px] md:text-[10px] tracking-widest font-bold">
              {isOwner ? "Chủ sở hữu" : (profile.memberRole || "Thành viên")}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 md:pt-6 border-t border-slate-50 dark:border-slate-800">
          <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors uppercase tracking-widest">
            Truy cập hồ sơ
            <ArrowRight className="size-3.5 md:size-4 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
          </div>
          <ExternalLink className="size-3.5 md:size-4 text-slate-200 dark:text-slate-700 group-hover:text-slate-400 dark:group-hover:text-slate-500 transition-colors" />
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

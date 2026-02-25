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
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Item, ItemContent, ItemMedia, ItemTitle, ItemDescription, ItemGroup } from '@/components/ui/item'

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
          <div className="h-8 w-1/3 bg-muted animate-pulse rounded-md" />
          <div className="h-12 w-full bg-muted animate-pulse rounded-md" />
          <div className="grid gap-4 pt-8">
            <div className="h-32 w-full bg-muted/50 animate-pulse rounded-lg border border-border" />
            <div className="h-32 w-full bg-muted/50 animate-pulse rounded-lg border border-border" />
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8 border-b border-border pb-6 md:pb-12">
        <div className="space-y-2 md:space-y-4 text-center md:text-left">
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-foreground">
            Hồ sơ làm việc
          </h1>
          <p className="text-sm md:text-lg text-muted-foreground font-medium max-w-xl mx-auto md:mx-0">
            Chọn một hồ sơ để bắt đầu quản lý các chiến dịch quảng cáo và nội dung AI của bạn.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 w-full md:w-auto">
          <div className="relative group w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
            <Input
              placeholder="Tìm kiếm hồ sơ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 w-full"
            />
          </div>
          <Link href="/overview/profile/new" className="w-full sm:w-auto">
            <Button className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Tạo hồ sơ mới
            </Button>
          </Link>
        </div>
      </div>

      {/* Profiles List */}
      <div className="space-y-8 md:space-y-16">
        {filteredProfiles.length === 0 ? (
          <Empty className="py-12 md:py-24">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Building2 className="h-8 w-8 text-muted-foreground/50" />
              </EmptyMedia>
              <EmptyTitle>Không tìm thấy hồ sơ nào</EmptyTitle>
              <EmptyDescription>
                {searchQuery ? "Thử tìm kiếm với từ khóa khác xem sao." : "Bắt đầu bằng cách tạo hồ sơ làm việc đầu tiên của bạn."}
              </EmptyDescription>
            </EmptyHeader>

            {sharedProfiles.length > 0 && !searchQuery && (
              <p className="text-muted-foreground text-sm">
                Bạn có <b>{sharedProfiles.length}</b> hồ sơ đội nhóm chia sẻ. <Link href="/overview/teams" className="text-foreground underline font-medium">Xem tại đây</Link>
              </p>
            )}

            {!searchQuery && (
              <EmptyContent className="flex-row gap-4">
                <Link href="/overview/profile/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-1" />
                    Tạo hồ sơ mới
                  </Button>
                </Link>
                {sharedProfiles.length > 0 && (
                  <Link href="/overview/teams">
                    <Button variant="outline">
                      <Users className="h-4 w-4 mr-1" />
                      Xem nhóm của tôi
                    </Button>
                  </Link>
                )}
              </EmptyContent>
            )}
          </Empty>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Hồ sơ của tôi</h2>
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
        return <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 rounded-md px-2 py-0.5 text-[10px] font-semibold">Hoạt động</Badge>
      case 0: // Pending
        return <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 rounded-md px-2 py-0.5 text-[10px] font-semibold">Đang chờ</Badge>
      case 2: // Suspended
        return <Badge variant="secondary" className="bg-destructive/10 text-destructive border-destructive/20 rounded-md px-2 py-0.5 text-[10px] font-semibold">Tạm ngưng</Badge>
      case 3: // Cancelled
        return <Badge variant="secondary" className="bg-muted text-muted-foreground border-border rounded-md px-2 py-0.5 text-[10px] font-semibold">Đã hủy</Badge>
      default:
        return null
    }
  }

  return (
    <Card
      className="group relative cursor-pointer overflow-hidden transition-colors hover:bg-accent/50"
      onClick={() => onSelect(profile)}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className={cn(
            "size-12 rounded-lg flex items-center justify-center border bg-muted/50",
            isAgency && "border-primary/20 text-primary"
          )}>
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt=""
                className="size-full rounded-lg object-cover"
              />
            ) : (
              isAgency ? <Building2 className="h-6 w-6" /> : <User className="h-6 w-6" />
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge
              variant={profile.profileType === ProfileTypeEnum.Pro ? "default" : "secondary"}
              className="text-[10px] font-semibold"
            >
              {profile.profileType === ProfileTypeEnum.Pro ? "PRO" :
                profile.profileType === ProfileTypeEnum.Basic ? "PLUS" : "FREE"}
            </Badge>
            {profile.profileType !== ProfileTypeEnum.Free && getStatusBadge(profile.status as number)}
          </div>
        </div>

        <div className="space-y-1 mb-6">
          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors truncate">
            {profile.name || profile.company_name || "Hồ sơ chưa đặt tên"}
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {profile.company_name && (
              <span className="flex items-center gap-1.5">
                <Building2 className="size-3.5" />
                {profile.company_name}
              </span>
            )}
            {profile.company_name && <span className="text-muted-foreground/30">•</span>}
            <span className="text-xs">
              {isOwner ? "Chủ sở hữu" : (profile.memberRole || "Thành viên")}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t transition-opacity group-hover:opacity-100">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">
            Truy cập hồ sơ
            <ArrowRight className="size-4" />
          </div>
          <ExternalLink className="size-4 text-muted-foreground/20" />
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

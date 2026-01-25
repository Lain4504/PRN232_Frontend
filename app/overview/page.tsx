"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/use-user'
import { useGetProfiles } from '@/hooks/use-profiles'
import { useProfile } from '@/lib/contexts/profile-context'
import { PROFILE_TYPE_LABELS, PROFILE_TYPE_COLORS, ProfileTypeEnum } from '@/lib/utils/profile-utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Building2, Search, ChevronRight, User, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'

export default function OverviewPage() {
  const { t } = useTranslation("common")
  const router = useRouter()
  const { data: user, isLoading: userLoading } = useUser()
  const { data: profiles = [], isLoading: profilesLoading, error: profilesError } = useGetProfiles(user?.id || '')
  const { setActiveProfile } = useProfile()
  const [searchQuery, setSearchQuery] = useState('')

  const handleProfileSelect = (profile: any) => {
    setActiveProfile(profile.id, {
      id: profile.id,
      name: profile.name || profile.company_name || `${profile.profileType} Profile`,
      type: profile.profileType as unknown as ProfileTypeEnum,
      avatarUrl: profile.avatarUrl,
      companyName: profile.company_name,
      isOwner: profile.isOwner ?? false,
      memberRole: profile.memberRole
    })

    // Navigate to dashboard after selecting profile
    router.push('/dashboard')
  }

  // Debug info
  console.log('Profiles page debug:', {
    userLoading,
    profilesLoading,
    user: user?.id,
    profiles: profiles?.length,
    profilesError
  })

  // Handle redirection for new users or single profile users
  useState(() => {
    if (!userLoading && !profilesLoading && Array.isArray(profiles)) {
      if (profiles.length === 0) {
        router.replace('/onboarding')
      } else if (profiles.length === 1) {
        const profile = profiles[0]
        setActiveProfile(profile.id, {
          id: profile.id,
          name: profile.name || profile.company_name || `${profile.profileType} Profile`,
          type: profile.profileType as unknown as ProfileTypeEnum,
          avatarUrl: profile.avatarUrl,
          companyName: profile.company_name,
          isOwner: profile.isOwner ?? false,
          memberRole: profile.memberRole
        })
        router.push('/dashboard')
      }
    }
  })

  if (userLoading || profilesLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <div className="flex flex-col space-y-3 w-full max-w-sm">
          <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
          <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
          <div className="space-y-2 pt-4">
            <div className="h-24 w-full bg-muted animate-pulse rounded-lg" />
            <div className="h-24 w-full bg-muted animate-pulse rounded-lg" />
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
    <div className="min-h-screen bg-background font-fira-sans">
      <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {t("overview.myProfiles", "Hồ Sơ Của Tôi")}
            </h1>
            <p className="text-muted-foreground font-medium text-lg">
              {t("overview.description", "Quản lý và truy cập các không gian làm việc của bạn.")}
            </p>
          </div>
          <Link href="/overview/profile/new">
            <Button className="h-10 px-6 font-semibold shadow-sm hover:shadow-md transition-all">
              <Plus className="h-4 w-4 mr-2" />
              {t("overview.createProfile", "Tạo Hồ Sơ Mới")}
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm hồ sơ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 bg-background border-input font-medium transition-colors focus-visible:ring-primary"
          />
        </div>

        {/* Profiles Sections */}
        {filteredProfiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center border border-dashed rounded-xl bg-muted/5">
            <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-6 border border-white/5">
              <Building2 className="h-8 w-8 text-muted-foreground/60" />
            </div>
            <div className="space-y-2 mb-8">
              <h3 className="text-lg font-bold">{t("overview.noProfiles", "Không tìm thấy hồ sơ")}</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                {searchQuery ? 'Thử tìm kiếm với từ khóa khác.' : 'Bạn chưa có hồ sơ nào. Hãy tạo mới để bắt đầu.'}
              </p>
            </div>
            {!searchQuery && (
              <Link href="/overview/profile/new">
                <Button className="h-10 px-8 font-semibold shadow-sm">
                  <Plus className="h-4 w-4 mr-2" />
                  {t("overview.createProfile", "Tạo Hồ Sơ Ngay")}
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-12">
            {/* My Workspaces */}
            {filteredProfiles.some(p => p.isOwner) && (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold">{t("overview.myWorkspaces", "Không gian làm việc của tôi")}</h2>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredProfiles.filter(p => p.isOwner).map((profile) => (
                    <ProfileCard key={profile.id} profile={profile} onSelect={handleProfileSelect} t={t} />
                  ))}
                </div>
              </div>
            )}

            {/* Shared Workspaces */}
            {filteredProfiles.some(p => !p.isOwner) && (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold">{t("overview.sharedWorkspaces", "Được chia sẻ với tôi")}</h2>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredProfiles.filter(p => !p.isOwner).map((profile) => (
                    <ProfileCard key={profile.id} profile={profile} onSelect={handleProfileSelect} t={t} />
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

function ProfileCard({ profile, onSelect, t }: { profile: any; onSelect: (p: any) => void; t: any }) {
  return (
    <Card
      className="group rounded-xl border border-border/50 shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer overflow-hidden bg-card"
      onClick={() => onSelect(profile)}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/10 shrink-0">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt=""
                className="h-12 w-12 rounded-lg object-cover"
              />
            ) : (
              <User className="h-6 w-6 text-primary" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors truncate">
              {profile.name || profile.company_name || 'Hồ Sơ Chưa Đặt Tên'}
            </h3>
            <div className="flex items-center gap-2 mt-1.5">
              <Badge
                variant="secondary"
                className={`rounded-md text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 ${PROFILE_TYPE_COLORS[profile.profileType as unknown as ProfileTypeEnum] || 'bg-muted text-muted-foreground'}`}
              >
                {PROFILE_TYPE_LABELS[profile.profileType as unknown as ProfileTypeEnum]}
              </Badge>
              {!profile.isOwner && (
                <Badge variant="outline" className="rounded-md text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 border-primary/30 text-primary">
                  {profile.memberRole || t("overview.member", "Member")}
                </Badge>
              )}
              {profile.company_name && (
                <span className="text-xs text-muted-foreground truncate border-l pl-2 border-border">
                  {profile.company_name}
                </span>
              )}
            </div>
          </div>
        </div>

        {profile.bio && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-6 min-h-[3em]">
            {profile.bio}
          </p>
        )}

        <div className="pt-4 border-t border-border/50 flex items-center justify-between">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider group-hover:text-primary transition-colors">
            {profile.isOwner ? t("overview.accessWorkspace", "Truy Cập Workspace") : t("overview.accessSharedWorkspace", "Truy Cập Workspace Chia Sẻ")}
          </span>
          <ArrowRight className="h-4 w-4 text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
        </div>
      </CardContent>
    </Card>
  )
}

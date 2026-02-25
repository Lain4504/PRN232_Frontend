"use client"

import { useProfile } from '@/lib/contexts/profile-context'
import { useGetProfiles } from '@/hooks/use-profiles'
import { useUser } from '@/hooks/use-user'
import { Profile } from '@/lib/types/omniadly-types'
import { PROFILE_TYPE_LABELS, ProfileTypeEnum } from '@/lib/utils/profile-utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Building2, Plus, ChevronsUpDown, Layout, Check, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ProfileSwitcher() {
  const { data: user } = useUser()
  const { activeProfile, setActiveProfile } = useProfile()
  const { data: profiles = [] } = useGetProfiles(user?.id || '')

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
  }

  const handleSwitchToOverview = () => {
    window.location.href = '/overview'
  }

  if (!activeProfile) {
    return (
      <Button variant="outline" size="sm" onClick={handleSwitchToOverview} className="w-[200px] justify-start">
        <Building2 className="mr-2 h-4 w-4" />
        Chọn hồ sơ
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="w-[200px] justify-between px-3">
          <div className="flex items-center gap-2 truncate">
            <Avatar className="h-5 w-5">
              <AvatarImage src={activeProfile.avatarUrl} alt={activeProfile.name} />
              <AvatarFallback className="text-[10px]">
                {activeProfile.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="truncate text-sm font-medium">
              {activeProfile.name}
            </span>
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-[200px]" align="start">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Hồ sơ của bạn
        </DropdownMenuLabel>
        
        <div className="max-h-[300px] overflow-y-auto">
          {profiles.map((profile) => {
            const isActive = profile.id === activeProfile.id
            return (
              <DropdownMenuItem
                key={profile.id}
                onSelect={() => handleProfileSelect(profile)}
                className="gap-2"
              >
                <Avatar className="h-5 w-5">
                  <AvatarImage src={profile.avatarUrl} alt={profile.name} />
                  <AvatarFallback className="text-[10px]">
                    {profile.name?.charAt(0).toUpperCase() || <User className="h-3 w-3" />}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col flex-1 truncate">
                  <span className="font-medium truncate text-sm">
                    {profile.name || profile.company_name || "Hồ sơ không tên"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {PROFILE_TYPE_LABELS[profile.profileType as keyof typeof PROFILE_TYPE_LABELS]}
                  </span>
                </div>
                {isActive && (
                  <Check className="h-4 w-4 ml-auto" />
                )}
              </DropdownMenuItem>
            )
          })}
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem onSelect={() => window.location.href = '/overview/profile/new'}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo hồ sơ mới
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleSwitchToOverview}>
          <Layout className="mr-2 h-4 w-4" />
          Quản lý tất cả
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

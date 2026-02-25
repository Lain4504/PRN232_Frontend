"use client"

import { useProfile } from '@/lib/contexts/profile-context'
import { useGetProfiles } from '@/hooks/use-profiles'
import { useUser } from '@/hooks/use-user'
import { Profile } from '@/lib/types/omniadly-types'
import { PROFILE_TYPE_LABELS, PROFILE_TYPE_COLORS, ProfileTypeEnum } from '@/lib/utils/profile-utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { Building2, Plus, ChevronsUpDown, Layout, Check } from 'lucide-react'
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
      <Button variant="outline" size="sm" onClick={handleSwitchToOverview} className="rounded-md font-bold bg-muted/50 border-border text-foreground hover:bg-muted transition-colors">
        <Building2 className="h-3.5 w-3.5 mr-2 opacity-70" />
        CHỌN HỒ SƠ
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-10 px-3 gap-3 hover:bg-accent rounded-md transition-all">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded bg-muted flex items-center justify-center border border-border overflow-hidden">
              {activeProfile.avatarUrl ? (
                <img src={activeProfile.avatarUrl} alt="" className="size-full object-cover" />
              ) : (
                <Building2 className="size-3.5 text-muted-foreground" />
              )}
            </div>
            <div className="flex flex-col items-start leading-none space-y-1">
              <span className="text-[10px] font-bold text-foreground truncate max-w-[120px] uppercase tracking-widest">
                {activeProfile.name}
              </span>
              <div className="flex items-center gap-2">
                <div className="size-1.5 rounded-full bg-emerald-500" />
                <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">
                  {PROFILE_TYPE_LABELS[activeProfile.type]}
                </span>
              </div>
            </div>
          </div>
          <ChevronsUpDown className="h-3 w-3 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64 rounded-lg bg-popover border border-border p-1 shadow-md" align="start">
        <DropdownMenuLabel className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground px-3 py-2">
          DANH SÁCH HỒ SƠ
        </DropdownMenuLabel>

        <div className="max-h-[300px] overflow-y-auto p-1 space-y-1">
          {profiles.map((profile) => {
            const isActive = profile.id === activeProfile.id
            return (
              <DropdownMenuItem
                key={profile.id}
                onClick={() => handleProfileSelect(profile)}
                className={cn(
                  "rounded-md cursor-pointer p-3 transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "hover:bg-accent text-foreground"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "size-9 rounded flex items-center justify-center shrink-0 border transition-all",
                      isActive
                        ? "bg-white/10 border-white/20"
                        : "bg-muted border-border"
                    )}>
                      {profile.avatarUrl ? (
                        <img src={profile.avatarUrl} alt="" className="size-full object-cover rounded" />
                      ) : (
                        <Building2 className={cn("size-5", isActive ? "text-white" : "text-muted-foreground")} />
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <div className={cn("font-bold text-xs truncate max-w-[130px] uppercase tracking-tight", isActive ? "text-white" : "text-foreground")}>
                        {profile.name || profile.company_name || "Hồ sơ không tên"}
                      </div>
                      <div className={cn("text-[8px] font-bold uppercase tracking-widest", isActive ? "text-white/70" : "text-muted-foreground")}>
                        {PROFILE_TYPE_LABELS[profile.profileType as keyof typeof PROFILE_TYPE_LABELS]}
                      </div>
                    </div>
                  </div>
                  {isActive && (
                    <Check className="size-3.5 text-white" />
                  )}
                </div>
              </DropdownMenuItem>
            )
          })}
        </div>

        <div className="grid grid-cols-2 gap-2 p-1 pt-2 border-t mt-1">
          <Button
            variant="ghost"
            onClick={() => window.location.href = '/overview/profile/new'}
            className="rounded-md h-9 text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <Plus className="size-3.5 mr-2 opacity-70" />
            Tạo mới
          </Button>
          <Button
            variant="ghost"
            onClick={handleSwitchToOverview}
            className="rounded-md h-9 text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <Layout className="size-3.5 mr-2 opacity-70" />
            Quản lý
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

"use client"

import { useProfile } from '@/lib/contexts/profile-context'
import { useGetProfiles } from '@/hooks/use-profiles'
import { useUser } from '@/hooks/use-user'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Building2, Plus, ChevronsUpDown } from 'lucide-react'

export function ProfileSwitcher() {
  const { data: user } = useUser()
  const { activeProfile, setActiveProfile } = useProfile()
  const { data: profiles = [] } = useGetProfiles(user?.id || '')

  const handleProfileSelect = (profile: { id: string; name?: string; company_name?: string; profileType: string; avatarUrl?: string }) => {
    setActiveProfile(profile.id, {
      id: profile.id,
      name: profile.name || profile.company_name || `${profile.profileType} Profile`,
      type: profile.profileType as unknown as ProfileTypeEnum,
      avatarUrl: profile.avatarUrl,
      companyName: profile.company_name
    })
  }


  const handleSwitchProfile = () => {
    window.location.href = '/overview/profile/new'
  }

  const handleManageProfiles = () => {
    window.location.href = '/overview'
  }

  if (!activeProfile) {
    return (
      <Button variant="outline" onClick={handleSwitchProfile}>
        <Building2 className="h-4 w-4 mr-2" />
        Select Profile
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-9 px-3 gap-2 hover:bg-muted/50 rounded-xl border border-white/5 bg-background/40 transition-all duration-300">
          <div className="flex items-center gap-2">
            <div className="size-5 rounded-md bg-primary/10 flex items-center justify-center">
              <Building2 className="size-3 text-primary" />
            </div>
            <span className="text-sm font-bold tracking-tight">
              {activeProfile.name}
            </span>
            <Badge
              variant="secondary"
              className={`text-[9px] h-5 px-1.5 font-bold uppercase tracking-widest border-none ${PROFILE_TYPE_COLORS[activeProfile.type]}`}
            >
              {PROFILE_TYPE_LABELS[activeProfile.type]}
            </Badge>
          </div>
          <ChevronsUpDown className="h-3 w-3 text-muted-foreground opacity-50" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80 rounded-xl bg-background/95 backdrop-blur-xl border border-white/10 p-2 shadow-2xl" align="start" sideOffset={8}>
        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-2 py-2">Identity Selector</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/5" />

        {/* Current Profile */}
        <DropdownMenuItem disabled className="mb-1 focus:bg-transparent">
          <div className="flex items-center gap-3 w-full p-1">
            <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 shadow-inner">
              {activeProfile.avatarUrl ? (
                <AvatarImage src={activeProfile.avatarUrl} className="rounded-xl" />
              ) : (
                <Building2 className="size-4 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm truncate">{activeProfile.name}</div>
              <div className="text-[10px] items-center flex gap-1.5 mt-0.5">
                <span className="text-primary font-bold uppercase tracking-wider">Active Session</span>
                <div className="size-1 rounded-full bg-primary animate-pulse" />
              </div>
            </div>
          </div>
        </DropdownMenuItem>

        <div className="px-2 pb-2">
          <Badge
            variant="outline"
            className={`w-full justify-center text-[10px] py-0.5 font-bold uppercase tracking-widest border-white/10 bg-white/5 ${PROFILE_TYPE_COLORS[activeProfile.type]}`}
          >
            {PROFILE_TYPE_LABELS[activeProfile.type]} Tier
          </Badge>
        </div>

        <DropdownMenuSeparator className="bg-white/5" />

        {/* Other Profiles */}
        <div className="max-h-[200px] overflow-y-auto px-1 py-1 space-y-1">
          {profiles.filter(p => p.id !== activeProfile.id).length > 0 && (
            <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 px-2 mb-1 mt-1">Available Profiles</div>
          )}
          {profiles.filter(p => p.id !== activeProfile.id).map((profile) => (
            <DropdownMenuItem
              key={profile.id}
              onClick={() => handleProfileSelect(profile)}
              className="rounded-xl cursor-pointer focus:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3 w-full">
                <div className="size-8 rounded-lg bg-muted/30 flex items-center justify-center shrink-0 border border-white/5">
                  {profile.avatarUrl ? (
                    <AvatarImage src={profile.avatarUrl} className="rounded-lg" />
                  ) : (
                    <Building2 className="size-3.5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs truncate">
                    {profile.name || profile.company_name || `${profile.profileType} Profile`}
                  </div>
                  <Badge
                    variant="secondary"
                    className={`mt-1 text-[9px] h-4 px-1.5 font-bold uppercase tracking-widest border-none bg-transparent p-0 ${PROFILE_TYPE_COLORS[profile.profileType]}`}
                  >
                    {PROFILE_TYPE_LABELS[profile.profileType]}
                  </Badge>
                </div>
              </div>
            </DropdownMenuItem>
          ))}
        </div>

        {profiles.filter(p => p.id !== activeProfile.id).length > 0 && <DropdownMenuSeparator className="bg-white/5" />}

        {/* Actions */}
        <div className="p-1 gap-1 flex flex-col">
          <DropdownMenuItem onClick={handleSwitchProfile} className="rounded-xl cursor-pointer font-bold text-xs text-primary focus:text-primary focus:bg-primary/10">
            <Plus className="size-3.5 mr-2" />
            Initialize New Identity
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleManageProfiles} className="rounded-xl cursor-pointer font-bold text-xs text-muted-foreground focus:text-foreground focus:bg-muted/50">
            <Building2 className="size-3.5 mr-2" />
            Manage Matrix
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

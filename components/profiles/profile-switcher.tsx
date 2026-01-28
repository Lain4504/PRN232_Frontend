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
import { Building2, Plus, ChevronsUpDown, Layout } from 'lucide-react'
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
      <Button variant="outline" size="sm" onClick={handleSwitchToOverview} className="rounded-xl font-bold bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300">
        <Building2 className="h-3.5 w-3.5 mr-2 opacity-70" />
        CHỌN HỒ SƠ
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-12 px-4 gap-4 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 rounded-2xl transition-all duration-300 group">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden group-hover:scale-105 transition-transform duration-300">
              {activeProfile.avatarUrl ? (
                <img src={activeProfile.avatarUrl} alt="" className="size-full object-cover" />
              ) : (
                <Building2 className="size-4 text-slate-400 dark:text-slate-500" />
              )}
            </div>
            <div className="flex flex-col items-start leading-none space-y-1">
              <span className="text-xs font-black text-slate-900 dark:text-white truncate max-w-[140px] uppercase tracking-tight">
                {activeProfile.name}
              </span>
              <div className="flex items-center gap-2">
                <div className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
                  {PROFILE_TYPE_LABELS[activeProfile.type]} TIER
                </span>
              </div>
            </div>
          </div>
          <ChevronsUpDown className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80 rounded-3xl bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 p-3 shadow-2xl shadow-slate-200/50 dark:shadow-black/60 animate-in fade-in zoom-in-95 duration-200" align="start" sideOffset={12}>
        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 px-4 py-4">
          MA TRẬN HỒ SƠ
        </DropdownMenuLabel>

        <div className="max-h-[360px] overflow-y-auto px-1 py-1 space-y-1 scrollbar-hide">
          {profiles.map((profile) => {
            const isActive = profile.id === activeProfile.id
            return (
              <DropdownMenuItem
                key={profile.id}
                onClick={() => handleProfileSelect(profile)}
                className={cn(
                  "rounded-2xl cursor-pointer p-4 transition-all duration-300",
                  isActive
                    ? "bg-slate-900 dark:bg-primary text-white shadow-xl shadow-slate-200 dark:shadow-primary/20"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-900 dark:text-slate-400"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "size-11 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300",
                      isActive
                        ? "bg-white/10 border-white/10"
                        : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    )}>
                      {profile.avatarUrl ? (
                        <img src={profile.avatarUrl} alt="" className="size-full object-cover rounded-xl" />
                      ) : (
                        <Building2 className={cn("size-6", isActive ? "text-white" : "text-slate-400 dark:text-slate-500")} />
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className={cn("font-black text-sm truncate max-w-[150px] uppercase tracking-tight", isActive ? "text-white" : "text-slate-900 dark:text-white")}>
                        {profile.name || profile.company_name || "Hồ sơ không tên"}
                      </div>
                      <div className={cn("text-[9px] font-black uppercase tracking-widest", isActive ? "text-white/60" : "text-slate-400 dark:text-slate-500")}>
                        {PROFILE_TYPE_LABELS[profile.profileType as keyof typeof PROFILE_TYPE_LABELS]}
                      </div>
                    </div>
                  </div>
                  {isActive && (
                    <div className="flex items-center justify-center size-5 rounded-full bg-white/20">
                      <div className="size-1.5 rounded-full bg-white animate-pulse" />
                    </div>
                  )}
                </div>
              </DropdownMenuItem>
            )
          })}
        </div>

        <DropdownMenuSeparator className="bg-slate-50 dark:bg-slate-800/50 my-3 mx-4" />

        <div className="grid grid-cols-2 gap-2 p-1">
          <Button
            variant="ghost"
            onClick={() => window.location.href = '/overview/profile/new'}
            className="rounded-xl h-12 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all"
          >
            <Plus className="size-4 mr-2 opacity-70" />
            Tạo mới
          </Button>
          <Button
            variant="ghost"
            onClick={handleSwitchToOverview}
            className="rounded-xl h-12 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all"
          >
            <Layout className="size-4 mr-2 opacity-70" />
            Quản lý
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

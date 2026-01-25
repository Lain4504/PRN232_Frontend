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
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { Building2, Plus, ChevronsUpDown, Layout } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ProfileSwitcher() {
  const { data: user } = useUser()
  const { activeProfile, setActiveProfile } = useProfile()
  const { data: profiles = [] } = useGetProfiles(user?.id || '')

  const handleProfileSelect = (profile: any) => {
    setActiveProfile(profile.id, {
      id: profile.id,
      name: profile.name || profile.company_name || profile.companyName || `${profile.profileType} Profile`,
      type: profile.profileType as unknown as ProfileTypeEnum,
      avatarUrl: profile.avatarUrl,
      companyName: profile.company_name || profile.companyName,
      isOwner: profile.isOwner ?? false,
      memberRole: profile.memberRole
    })
  }

  const handleSwitchToOverview = () => {
    window.location.href = '/overview'
  }

  if (!activeProfile) {
    return (
      <Button variant="outline" size="sm" onClick={handleSwitchToOverview} className="rounded-xl font-bold bg-slate-50 border-slate-100">
        <Building2 className="h-3.5 w-3.5 mr-2" />
        Chọn hồ sơ
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-10 px-3 gap-3 hover:bg-slate-50 rounded-xl transition-all duration-200">
          <div className="flex items-center gap-3">
            <div className="size-7 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200 shadow-sm overflow-hidden">
              {activeProfile.avatarUrl ? (
                <img src={activeProfile.avatarUrl} alt="" className="size-full object-cover" />
              ) : (
                <Building2 className="size-4 text-slate-400" />
              )}
            </div>
            <div className="flex flex-col items-start leading-none group">
              <span className="text-xs font-black text-slate-900 truncate max-w-[120px]">
                {activeProfile.name}
              </span>
              <div className="flex items-center gap-1 mt-1">
                <div className="size-1 rounded-full bg-emerald-500" />
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                  {PROFILE_TYPE_LABELS[activeProfile.type]}
                </span>
              </div>
            </div>
          </div>
          <ChevronsUpDown className="h-3 w-3 text-slate-300" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80 rounded-[2rem] bg-white border-slate-100 p-3 shadow-2xl shadow-slate-200" align="start" sideOffset={12}>
        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-4 py-3">Ma trận hồ sơ</DropdownMenuLabel>

        <div className="max-h-[300px] overflow-y-auto px-1 py-1 space-y-1">
          {profiles.map((profile) => {
            const isActive = profile.id === activeProfile.id
            return (
              <DropdownMenuItem
                key={profile.id}
                onClick={() => handleProfileSelect(profile)}
                className={cn(
                  "rounded-2xl cursor-pointer p-4 transition-all duration-200",
                  isActive ? "bg-slate-900 text-white" : "hover:bg-slate-50"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "size-10 rounded-xl flex items-center justify-center shrink-0 border",
                      isActive ? "bg-white/10 border-white/10" : "bg-slate-100 border-slate-200"
                    )}>
                      {profile.avatarUrl ? (
                        <img src={profile.avatarUrl} alt="" className="size-full object-cover rounded-xl" />
                      ) : (
                        <Building2 className={cn("size-5", isActive ? "text-white" : "text-slate-400")} />
                      )}
                    </div>
                    <div>
                      <div className={cn("font-black text-sm truncate max-w-[140px]", isActive ? "text-white" : "text-slate-900")}>
                        {profile.name || profile.company_name || "Hồ sơ không tên"}
                      </div>
                      <div className={cn("text-[9px] font-bold uppercase tracking-widest mt-0.5", isActive ? "text-slate-400" : "text-slate-400")}>
                        {PROFILE_TYPE_LABELS[profile.profileType]} Tier
                      </div>
                    </div>
                  </div>
                  {isActive && <div className="size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />}
                </div>
              </DropdownMenuItem>
            )
          })}
        </div>

        <DropdownMenuSeparator className="bg-slate-50 my-2 mx-4" />

        <div className="grid grid-cols-2 gap-2 p-1">
          <Button
            variant="ghost"
            onClick={() => window.location.href = '/overview/profile/new'}
            className="rounded-xl h-11 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          >
            <Plus className="size-3.5 mr-2" />
            Tạo mới
          </Button>
          <Button
            variant="ghost"
            onClick={handleSwitchToOverview}
            className="rounded-xl h-11 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          >
            <Layout className="size-3.5 mr-2" />
            Quản lý
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

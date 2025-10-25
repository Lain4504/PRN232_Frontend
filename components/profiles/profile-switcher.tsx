"use client"

import { useProfile } from '@/lib/contexts/profile-context'
import { useGetProfiles } from '@/hooks/use-profiles'
import { useUser } from '@/hooks/use-user'
import {  PROFILE_TYPE_LABELS, PROFILE_TYPE_COLORS, ProfileTypeEnum } from '@/lib/utils/profile-utils'
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
        <Button variant="ghost" className="h-8 px-3 gap-2 hover:bg-accent">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {activeProfile.name}
            </span>
            <Badge 
              variant="secondary" 
              className="text-xs bg-muted text-muted-foreground"
            >
              {PROFILE_TYPE_LABELS[activeProfile.type]}
            </Badge>
          </div>
          <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80" align="start" sideOffset={8}>
        <DropdownMenuLabel>Switch Context</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Current Profile */}
        <DropdownMenuItem disabled>
          <div className="flex items-center gap-2 w-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={activeProfile.avatarUrl} />
              <AvatarFallback>
                <Building2 className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{activeProfile.name}</div>
              <div className="text-xs text-muted-foreground">Current</div>
            </div>
            <Badge 
              variant="secondary" 
              className={`text-xs ${PROFILE_TYPE_COLORS[activeProfile.type]}`}
            >
              {PROFILE_TYPE_LABELS[activeProfile.type]}
            </Badge>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Other Profiles */}
        {profiles.filter(p => p.id !== activeProfile.id).map((profile) => (
          <DropdownMenuItem 
            key={profile.id}
            onClick={() => handleProfileSelect(profile)}
          >
            <div className="flex items-center gap-2 w-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile.avatarUrl} />
                <AvatarFallback>
                  <Building2 className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">
                  {profile.name || profile.company_name || `${profile.profileType} Profile`}
                </div>
              </div>
              <Badge 
                variant="outline" 
                className={`text-xs ${PROFILE_TYPE_COLORS[profile.profileType]}`}
              >
                {PROFILE_TYPE_LABELS[profile.profileType]}
              </Badge>
            </div>
          </DropdownMenuItem>
        ))}
        
        
        <DropdownMenuSeparator />
        
        {/* Actions */}
        <DropdownMenuItem onClick={handleSwitchProfile}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Profile
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleSwitchProfile}>
          <Building2 className="h-4 w-4 mr-2" />
          Manage Profiles
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

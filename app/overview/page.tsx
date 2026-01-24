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

export default function OverviewPage() {
  const router = useRouter()
  const { data: user, isLoading: userLoading } = useUser()
  const { data: profiles = [], isLoading: profilesLoading, error: profilesError } = useGetProfiles(user?.id || '')
  const { setActiveProfile } = useProfile()
  const [searchQuery, setSearchQuery] = useState('')

  const handleProfileSelect = (profile: { id: string; name?: string; company_name?: string; profileType: string; avatarUrl?: string }) => {
    setActiveProfile(profile.id, {
      id: profile.id,
      name: profile.name || profile.company_name || `${profile.profileType} Profile`,
      type: profile.profileType as unknown as ProfileTypeEnum,
      avatarUrl: profile.avatarUrl,
      companyName: profile.company_name
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

  if (userLoading || profilesLoading) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="h-10 w-64 bg-muted animate-pulse rounded mb-3 mx-auto"></div>
            <div className="h-5 w-80 bg-muted animate-pulse rounded mx-auto"></div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse shadow-none border border-neutral-200/40 dark:border-neutral-800/40 bg-gradient-to-br from-background to-muted/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-muted ring-1 ring-muted/50"></div>
                      <div className="space-y-1 flex-1">
                        <div className="h-4 w-3/4 bg-muted rounded"></div>
                        <div className="h-3 w-1/2 bg-muted rounded"></div>
                      </div>
                    </div>
                    <div className="h-4 w-12 bg-muted rounded"></div>
                  </div>
                  <div className="mb-2">
                    <div className="h-3 w-full bg-muted rounded"></div>
                  </div>
                  <div className="flex justify-end">
                    <div className="h-3 w-12 bg-muted rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Filter profiles based on search query
  const filteredProfiles = Array.isArray(profiles) ? profiles.filter(profile => {
    const name = profile.name || profile.company_name || `${profile.profileType} Profile`
    return name.toLowerCase().includes(searchQuery.toLowerCase())
  }) : []

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-foreground">Profiles</h1>
            <p className="text-muted-foreground font-medium">
              Manage and switch between your workspace identities.
            </p>
          </div>
          <Link href="/overview/profile/new">
            <Button
              className="h-11 px-6 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="h-4 w-4 mr-2" />
              CREATE PROFILE
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <Input
            placeholder="SEARCH PROFILES..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-12 rounded-xl bg-muted/20 border-border/40 font-medium tracking-wide focus:bg-background transition-all"
          />
        </div>

        {/* Profiles Grid */}
        {filteredProfiles.length === 0 ? (
          <Card className="shadow-none border border-dashed border-border/60 rounded-[2rem] bg-muted/5">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-6">
                <Building2 className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-bold mb-2">No profiles found</h3>
              <p className="text-muted-foreground font-medium mb-8 max-w-xs mx-auto">
                {searchQuery ? 'Try a different search term.' : 'Initialize your first brand profile to access the dashboard capabilities.'}
              </p>
              {!searchQuery && (
                <Link href="/overview/profile/new">
                  <Button
                    className="h-11 px-8 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    CREATE PROFILE
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {filteredProfiles.map((profile) => (
              <Card
                key={profile.id}
                className="cursor-pointer transition-all duration-300 shadow-sm border border-border/40 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 rounded-[1.5rem] group bg-card/50 backdrop-blur-sm"
                onClick={() => handleProfileSelect(profile)}
              >
                <CardContent className="p-6">
                  {/* Header with Avatar and Name */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                      {profile.avatarUrl ? (
                        <img
                          src={profile.avatarUrl}
                          alt=""
                          className="h-12 w-12 rounded-xl object-cover shadow-sm"
                        />
                      ) : profile.profileType === 'Basic' || profile.profileType === 'Pro' ? (
                        <Building2 className="h-6 w-6 text-primary" />
                      ) : (
                        <User className="h-6 w-6 text-primary" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 pt-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-base text-foreground truncate group-hover:text-primary transition-colors">
                          {profile.name || profile.company_name || 'Unnamed Profile'}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`shrink-0 text-[9px] px-2 py-0.5 h-5 font-black uppercase tracking-wider border-0 ${PROFILE_TYPE_COLORS[profile.profileType] || 'bg-muted text-muted-foreground'}`}
                        >
                          {PROFILE_TYPE_LABELS[profile.profileType]}
                        </Badge>
                        {profile.company_name && profile.name && (
                          <span className="text-xs text-muted-foreground truncate border-l border-border/60 pl-2">
                            {profile.company_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bio Section */}
                  {profile.bio && (
                    <p className="text-xs text-muted-foreground font-medium line-clamp-2 leading-relaxed mb-5 min-h-[2.5em]">
                      {profile.bio}
                    </p>
                  )}

                  {/* Divider */}
                  <div className="flex items-center justify-end pt-2 mt-2 border-t border-border/30">
                    <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 group-hover:text-primary transition-colors">
                      <span>Access Console</span>
                      <ArrowRight className="h-3 w-3 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

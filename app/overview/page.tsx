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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Profiles</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage and switch between profiles
              </p>
            </div>
            <Link href="/overview/profile/new">
              <Button 
                size="sm" 
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                New Profile
              </Button>
            </Link>
          </div>

          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Search profiles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
            />
          </div>

          {/* Profiles Grid */}
          {filteredProfiles.length === 0 ? (
              <Card className="shadow-none border border-neutral-200/60 dark:border-neutral-800/60 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Building2 className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium mb-1">No profiles found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {searchQuery ? 'Try a different search term' : 'Create your first profile to get started'}
                  </p>
                  {!searchQuery && (
                      <Link href="/overview/profile/new">
                        <Button 
                          size="sm" 
                          className="gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Create Profile
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
                    className="cursor-pointer transition-colors duration-200 shadow-none border border-neutral-200/60 dark:border-neutral-800/60 rounded-md group"
                    onClick={() => handleProfileSelect(profile)}
                >
                  <CardContent className="p-4">
                    {/* Header with Avatar and Name */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                        {profile.avatarUrl ? (
                            <img
                                src={profile.avatarUrl}
                                alt=""
                                className="h-10 w-10 rounded-full object-cover"
                            />
                        ) : profile.profileType === 'Basic' || profile.profileType === 'Pro' ? (
                            <Building2 className="h-5 w-5 text-primary/70" />
                        ) : (
                            <User className="h-5 w-5 text-primary/70" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-semibold text-sm text-foreground truncate">
                            {profile.name || profile.company_name || 'Unnamed Profile'}
                          </h3>
                          <Badge
                              variant="secondary"
                              className="shrink-0 text-[10px] px-1.5 py-0 h-4 font-medium"
                          >
                            {PROFILE_TYPE_LABELS[profile.profileType]}
                          </Badge>
                        </div>

                        {profile.company_name && profile.name && (
                            <p className="text-xs text-muted-foreground/80 truncate">
                              {profile.company_name}
                            </p>
                        )}
                      </div>
                    </div>

                    {/* Bio Section */}
                    {profile.bio && (
                        <p className="text-xs text-muted-foreground/70 line-clamp-2 leading-relaxed mb-3">
                          {profile.bio}
                        </p>
                    )}

                    {/* Divider */}
                    <div className="border-t border-neutral-200/60 dark:border-neutral-800/60 pt-2">
                      <div className="flex items-center justify-end text-xs text-muted-foreground/60 group-hover:text-primary transition-colors">
                        <span className="font-medium">View details</span>
                        <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
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

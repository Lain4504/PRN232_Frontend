"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/use-user'
import { useProfiles } from '@/hooks/use-profile'
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
  const { data: profiles = [], isLoading: profilesLoading, error: profilesError } = useProfiles(user?.id)
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
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse bg-gradient-to-br from-background to-muted/20">
                <CardContent className="p-3">
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
              <Card className="border-dashed">
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
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProfiles.map((profile) => (
                <Card
                    key={profile.id}
                    className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 group bg-gradient-to-br from-background to-muted/20"
                    onClick={() => handleProfileSelect(profile)}
                >
                  <CardContent className="p-3 relative">
                    {/* Header with Avatar and Badge */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center shrink-0 ring-1 ring-primary/10 group-hover:ring-primary/20 transition-all">
                          {profile.avatarUrl ? (
                              <img
                                  src={profile.avatarUrl}
                                  alt=""
                                  className="h-8 w-8 rounded-full object-cover"
                              />
                          ) : profile.profileType === 'Basic' || profile.profileType === 'Pro' ? (
                              <Building2 className="h-4 w-4 text-primary" />
                          ) : (
                              <User className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-sm truncate text-foreground group-hover:text-primary transition-colors">
                            {profile.name || profile.company_name || 'Unnamed Profile'}
                          </h3>
                          {profile.company_name && profile.name && (
                              <p className="text-xs text-muted-foreground truncate">
                                {profile.company_name}
                              </p>
                          )}
                        </div>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className="shrink-0 text-xs px-1.5 py-0.5 bg-primary/10 text-primary border-primary/20 group-hover:bg-primary/20 transition-colors"
                      >
                        {PROFILE_TYPE_LABELS[profile.profileType]}
                      </Badge>
                    </div>

                    {/* Bio Section */}
                    {profile.bio && (
                        <div className="mb-2">
                          <p className="text-xs text-muted-foreground line-clamp-1 leading-relaxed">
                            {profile.bio}
                          </p>
                        </div>
                    )}

                    {/* Footer with Arrow */}
                    <div className="flex items-center justify-end">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary transition-colors">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">Select</span>
                        <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
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

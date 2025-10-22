"use client"

import { useSearchParams } from 'next/navigation'
import { useProfile } from '@/lib/contexts/profile-context'
import { SubscriptionManagement } from '@/components/subscription/subscription-management'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Building2 } from 'lucide-react'
import Link from 'next/link'

export default function SubscriptionPage() {
  const searchParams = useSearchParams()
  const profileId = searchParams.get('profileId')
  const { activeProfile, profileType } = useProfile()

  // If no profileId in URL and no active profile, redirect to profiles
  if (!profileId && !activeProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Profile Selected</h1>
          <p className="text-muted-foreground mb-6">
            Please select a profile to manage its subscription.
          </p>
          <Button asChild>
            <Link href="/overview">
              <Building2 className="h-4 w-4 mr-2" />
              Select Profile
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/overview">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Profiles
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Subscription Management</h1>
              <p className="text-muted-foreground">
                Manage your profile subscription and billing
              </p>
            </div>
          </div>

          {/* Current Profile Info */}
          {activeProfile && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {activeProfile.name}
                </CardTitle>
                <CardDescription>
                  Current subscription details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="secondary"
                    className={
                      profileType === 0 ? 'bg-gray-100 text-gray-800' :
                      profileType === 1 ? 'bg-blue-100 text-blue-800' :
                      'bg-purple-100 text-purple-800'
                    }
                  >
                    {profileType === 0 ? 'Free' : profileType === 1 ? 'Basic' : 'Pro'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Profile ID: {activeProfile.id}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Subscription Management Component */}
        <SubscriptionManagement profileId={profileId || activeProfile?.id} />
      </div>
    </div>
  )
}

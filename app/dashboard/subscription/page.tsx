"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useProfile } from "@/lib/contexts/profile-context"
import { SubscriptionManagement } from "@/components/subscription/subscription-management"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Plus } from "lucide-react"

export default function DashboardSubscriptionPage() {
  const { activeProfile } = useProfile()

  if (!activeProfile) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="space-y-6 lg:space-y-8 p-4 lg:p-6 xl:p-8 bg-background">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">No active profile selected</CardTitle>
              <CardDescription className="text-xs">Please select or create a profile to manage its subscription.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-3">
              <Alert className="bg-amber-50 border-amber-200 text-amber-800">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  You need an active profile to view and manage subscription.
                </AlertDescription>
              </Alert>
              <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/overview">Select Profile</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/overview/profile/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Profile
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="space-y-6 lg:space-y-8 p-4 lg:p-6 xl:p-8 bg-background">
        <SubscriptionManagement profileId={activeProfile.id} />
      </div>
    </div>
  )
}

"use client"

import { useEffect, use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTeam, TeamProvider } from '@/lib/contexts/team-context'
import TeamLayout from "@/components/layout/team-layout";

function TeamLayoutContent({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ teamId: string }>;
}) {
  const { activeTeamId, activeTeam, isLoading, loadTeamData } = useTeam()
  const router = useRouter()
  const resolvedParams = use(params)
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false)
  const [hasRedirected, setHasRedirected] = useState(false)

  useEffect(() => {
    const initializeTeam = async () => {
      if (!isLoading && resolvedParams.teamId && !hasRedirected) {
        if (!activeTeamId || activeTeamId !== resolvedParams.teamId) {
          // Load the team data for the current teamId
          setHasAttemptedLoad(true)
          try {
            await loadTeamData(resolvedParams.teamId)
            // After loading, check if we successfully loaded the team
            // This check happens in the next useEffect
          } catch (error) {
            // Load failed, this will be handled by the redirect effect
            console.error('Failed to load team:', error)
          }
        }
      }
    }

    initializeTeam()
  }, [resolvedParams.teamId, isLoading, activeTeamId, loadTeamData, hasRedirected])

  useEffect(() => {
    // Only redirect if:
    // 1. Not loading
    // 2. We've attempted to load
    // 3. No active team (neither activeTeamId nor activeTeam)
    // 4. We have a teamId in the URL (meaning we're on a team route)
    // 5. We haven't redirected yet (prevent infinite loop)
    if (
      !isLoading && 
      hasAttemptedLoad && 
      !activeTeamId && 
      !activeTeam && 
      resolvedParams.teamId &&
      !hasRedirected
    ) {
      setHasRedirected(true)
      router.replace('/overview/teams')
    }
  }, [activeTeamId, activeTeam, isLoading, router, hasAttemptedLoad, resolvedParams.teamId, hasRedirected])

  // Show loading while checking team context
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading team context...</p>
        </div>
      </div>
    )
  }

  // If no active team, don't render dashboard
  if (!activeTeamId) {
    return null
  }

  return <TeamLayout>{children}</TeamLayout>;
}

export default function TeamLayoutWrapper({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ teamId: string }>;
}) {
  return (
    <TeamProvider>
      <TeamLayoutContent params={params}>
        {children}
      </TeamLayoutContent>
    </TeamProvider>
  )
}

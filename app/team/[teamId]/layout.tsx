"use client"

import { useEffect, use } from 'react'
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
  const { activeTeamId, isLoading, loadTeamData } = useTeam()
  const router = useRouter()
  const resolvedParams = use(params)

  useEffect(() => {
    const initializeTeam = async () => {
      if (!isLoading && resolvedParams.teamId) {
        if (!activeTeamId || activeTeamId !== resolvedParams.teamId) {
          // Load the team data for the current teamId
          await loadTeamData(resolvedParams.teamId)
        }
      }
    }

    initializeTeam()
  }, [resolvedParams.teamId, isLoading, activeTeamId, loadTeamData])

  useEffect(() => {
    if (!isLoading && !activeTeamId) {
      // No active team, redirect to profile selection
      router.replace('/overview/teams')
    }
  }, [activeTeamId, isLoading, router])

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

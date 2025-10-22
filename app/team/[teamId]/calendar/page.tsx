"use client"

import React, { useState, use } from 'react'
import { TeamPermissionGate } from '@/components/teams/team-permission-gate'
import { UnifiedContentCalendar } from '@/components/content-calendar/unified-content-calendar'
import { ScheduleContentModal } from '@/components/content-calendar/schedule-content-modal'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import type { ContentCalendar } from '@/lib/types/aisam-types'

export default function TeamCalendarPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const resolvedParams = use(params)
  const teamId = resolvedParams.teamId
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState<ContentCalendar | null>(null)

  const handleScheduleClick = () => {
    setShowScheduleModal(true)
  }

  const handleEventClick = (schedule: ContentCalendar) => {
    setSelectedSchedule(schedule)
  }

  return (
    <TeamPermissionGate permission="SCHEDULE_POST">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-6 lg:space-y-8 p-4 lg:p-6 xl:p-8 bg-background">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Content Calendar</h1>
              <p className="text-muted-foreground">
                Schedule and manage content for your team
              </p>
            </div>
            <Button 
              className="flex items-center justify-center gap-2 w-full sm:w-auto"
              onClick={handleScheduleClick}
            >
              <Plus className="h-4 w-4" />
              Schedule Content
            </Button>
          </div>

          {/* Calendar View */}
          <UnifiedContentCalendar
            teamId={teamId}
            onEventClick={handleEventClick}
            onCreateSchedule={handleScheduleClick}
          />

          {/* Schedule Modal */}
          <ScheduleContentModal
            isOpen={showScheduleModal}
            onClose={() => setShowScheduleModal(false)}
            teamId={teamId}
            selectedBrandId={undefined} // Brand filtering is now handled internally
          />
        </div>
      </div>
    </TeamPermissionGate>
  )
}

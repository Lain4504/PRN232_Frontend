"use client";

import React, { useState } from "react";
import { UnifiedContentCalendar } from "@/components/content-calendar/unified-content-calendar";
import { ScheduleContentModal } from "@/components/content-calendar/schedule-content-modal";
import type { ContentCalendar } from "@/lib/types/aisam-types";

export function CalendarManagement() {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ContentCalendar | null>(null);

  const handleScheduleClick = () => {
    setShowScheduleModal(true);
  };

  const handleEventClick = (schedule: ContentCalendar) => {
    setSelectedSchedule(schedule);
  };

  return (
    <div className="flex-1 space-y-6 p-6 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Content Calendar</h1>
            <p className="text-muted-foreground">
              Schedule and manage your content publishing
            </p>
          </div>
        </div>

        <UnifiedContentCalendar
          teamId="dashboard" // Use a default teamId for dashboard context
          onEventClick={handleEventClick}
          onCreateSchedule={handleScheduleClick}
        />

        {/* Schedule Modal */}
        <ScheduleContentModal
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          teamId="dashboard"
        />
      </div>
    </div>
  );
}

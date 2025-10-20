"use client";

import React, { useState } from "react";
import { ContentCalendarView } from "@/components/content-calendar/content-calendar-view";
import { UpcomingSchedulesList } from "@/components/content-calendar/upcoming-schedules-list";
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Calendar</h1>
          <p className="text-muted-foreground">
            Schedule and manage your content publishing
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <ContentCalendarView 
            onScheduleClick={handleScheduleClick}
            onEventClick={handleEventClick}
          />
        </div>

        {/* Sidebar */}
        <div>
          <UpcomingSchedulesList 
            limit={10}
            onScheduleClick={handleEventClick}
          />
        </div>
      </div>

      {/* Schedule Modal */}
      <ScheduleContentModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
      />
    </div>
  );
}

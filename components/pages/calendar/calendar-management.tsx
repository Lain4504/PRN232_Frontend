"use client";

import React, { useState } from "react";
import { UnifiedContentCalendar } from "@/components/content-calendar/unified-content-calendar";
import { ScheduleContentModal } from "@/components/content-calendar/schedule-content-modal";
import type { ContentCalendar } from "@/lib/types/aisam-types";
import { Calendar, Clock, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";

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
    <div className="max-w-[1440px] mx-auto font-fira-sans">
      <div className="space-y-8 p-6 lg:p-10 bg-background min-h-screen">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Calendar
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Plan and organize your content schedule across all platforms.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowScheduleModal(true)}
              className="rounded-lg h-10 px-6 font-semibold"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Schedule
            </Button>
          </div>
        </div>

        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <UnifiedContentCalendar
            onEventClick={handleEventClick}
            onCreateSchedule={handleScheduleClick}
          />
        </div>

        {/* Schedule Modal */}
        <ScheduleContentModal
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
        />
      </div>
    </div>
  );
}

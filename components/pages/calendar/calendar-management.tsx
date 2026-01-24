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
      <div className="space-y-10 p-6 lg:p-10 bg-background min-h-screen">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-2 w-8 bg-primary rounded-full" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/70">Schedule Management</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-none">
              Content <span className="text-primary italic">Calendar</span>
            </h1>
            <p className="text-lg text-muted-foreground font-medium max-w-2xl tracking-tight leading-relaxed">
              Plan, schedule, and organize your content across all platforms. Visualise your timeline and ensure consistent posting.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-6 py-4 bg-card/40 backdrop-blur-xl rounded-2xl border border-border/40 shadow-xl flex items-center gap-6">
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none">Schedule Status</div>
                <div className="text-xl font-bold font-mono tracking-tight text-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  ACTIVE
                </div>
              </div>
            </div>
            <Button
              onClick={() => setShowScheduleModal(true)}
              className="rounded-xl h-14 px-8 bg-primary hover:bg-primary/95 text-primary-foreground font-bold uppercase tracking-wider shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
            >
              <Plus className="mr-2 h-5 w-5 stroke-[3]" />
              New Schedule
            </Button>
          </div>
        </div>

        <div className="bg-card/40 backdrop-blur-3xl rounded-[2rem] border border-border/40 p-1.5 shadow-2xl overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
          <div className="bg-background/40 rounded-[1.8rem] overflow-hidden">
            <UnifiedContentCalendar
              onEventClick={handleEventClick}
              onCreateSchedule={handleScheduleClick}
            />
          </div>
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

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
    <div className="max-w-[1440px] mx-auto font-fira-sans">
      <div className="space-y-10 p-6 lg:p-10 bg-background">

        {/* Tactical Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-2 w-8 bg-primary rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">Temporal Coordination Axis</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-foreground uppercase leading-none">
              Chronos <span className="text-primary italic">Matrix</span>
            </h1>
            <p className="text-lg text-muted-foreground font-medium max-w-2xl tracking-tight leading-relaxed">
              Synchronize your multi-channel deployment timeline. Monitor asset flow and scheduling clearance across all active nodes.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-6 py-4 bg-card/40 backdrop-blur-xl rounded-2xl border border-border/40 shadow-xl flex items-center gap-6">
              <div className="space-y-1">
                <div className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">Timeline</div>
                <div className="text-2xl font-black font-fira-mono tracking-tighter tabular-nums text-primary uppercase leading-none italic">CALIBRATED</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card/40 backdrop-blur-3xl rounded-[3rem] border border-border/40 p-2 shadow-2xl overflow-hidden">
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

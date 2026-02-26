"use client";

import React, { useState } from "react";
import { UnifiedContentCalendar } from "@/components/content-calendar/unified-content-calendar";
import { ScheduleContentModal } from "@/components/content-calendar/schedule-content-modal";
import { ScheduleDetailModal } from "@/components/content-calendar/schedule-detail-modal";
import type { ContentCalendar } from "@/lib/types/omniadly-types";
import { Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { getActiveTeamId } from "@/lib/utils/profile-utils";

export function CalendarManagement() {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ContentCalendar | null>(null);
  const teamId = getActiveTeamId() || undefined;

  const handleScheduleClick = () => {
    setShowScheduleModal(true);
  };

  const handleEventClick = (schedule: ContentCalendar) => {
    setSelectedSchedule(schedule);
  };

  return (
    <div className="mx-auto">
      <div className="space-y-8 p-4 lg:p-8 min-h-screen bg-background text-foreground">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/50 pb-8 transition-all duration-300">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-primary/5 text-primary border border-primary/10">
                <Plus className="size-4" />
              </div>
              <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest italic">Lập lịch & Điều phối • Content Timeline</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight italic uppercase">
              Lịch Nội dung
            </h1>
            <p className="text-sm text-muted-foreground font-medium max-w-xl italic leading-relaxed">
              Quản lý và lập lịch đăng bài đa kênh thông minh trong một giao diện thời gian thực duy nhất.
            </p>
          </div>

          <Button
            onClick={() => setShowScheduleModal(true)}
            className="h-12 px-8 rounded-md font-bold uppercase tracking-wider text-xs shadow-lg transition-all hover:-translate-y-0.5"
          >
            <Plus className="mr-2 h-4 w-4" />
            Lên lịch đăng bài
          </Button>
        </div>

        {/* Main Content */}
        <div className="mt-6">
          <UnifiedContentCalendar
            teamId={teamId}
            onEventClick={handleEventClick}
            onCreateSchedule={handleScheduleClick}
          />
        </div>

        {/* Modals */}
        <ScheduleContentModal
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          teamId={teamId}
        />

        <ScheduleDetailModal
          schedule={selectedSchedule}
          isOpen={!!selectedSchedule}
          onClose={() => setSelectedSchedule(null)}
        />
      </div>
    </div>
  );
}

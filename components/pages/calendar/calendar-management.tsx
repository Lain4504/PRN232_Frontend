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
    <div className="max-w-[1400px] mx-auto">
      <div className="space-y-6 p-4 lg:p-8 min-h-screen bg-background text-foreground">

        {/* Breadcrumb */}
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard" className="text-xs font-medium text-slate-500 hover:text-slate-900">Tổng quan</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-xs font-semibold">Lịch nội dung</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Lịch nội dung</h1>
            <p className="text-sm text-slate-500">
              Quản lý và lập lịch đăng bài cho các kênh mạng xã hội của bạn.
            </p>
          </div>

          <Button
            onClick={() => setShowScheduleModal(true)}
            size="sm"
            className="w-full sm:w-auto"
          >
            <Plus className="mr-2 size-4" />
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

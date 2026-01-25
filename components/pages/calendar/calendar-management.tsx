"use client";

import React, { useState } from "react";
import { UnifiedContentCalendar } from "@/components/content-calendar/unified-content-calendar";
import { ScheduleContentModal } from "@/components/content-calendar/schedule-content-modal";
import type { ContentCalendar } from "@/lib/types/aisam-types";
import { Plus, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useTranslation } from "react-i18next";

export function CalendarManagement() {
  const { t } = useTranslation("common");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ContentCalendar | null>(null);

  const handleScheduleClick = () => {
    setShowScheduleModal(true);
  };

  const handleEventClick = (schedule: ContentCalendar) => {
    setSelectedSchedule(schedule);
  };

  return (
    <div className="max-w-[1600px] mx-auto font-fira-sans">
      <div className="space-y-8 p-6 lg:p-10 min-h-screen bg-background text-foreground">

        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard" className="text-[10px] uppercase font-bold tracking-widest opacity-60 hover:opacity-100 transition-opacity">{t("dashboard.title")}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="opacity-40" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-[10px] uppercase font-bold tracking-widest text-primary">{t("calendar.title")}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_20px_-5px_rgba(var(--primary),0.3)]">
                <Clock className="size-6 text-primary animate-pulse-slow" />
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tighter text-foreground italic uppercase">
                  {t("calendar.title")}
                </h1>
              </div>
            </div>
            <p className="text-muted-foreground font-medium text-lg max-w-2xl pl-1">
              {t("calendar.description")}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowScheduleModal(true)}
              className="rounded-xl h-12 px-8 font-black uppercase tracking-widest text-[10px] bg-primary hover:bg-primary/90 shadow-[0_0_25px_-5px_rgba(var(--primary),0.4)] hover:scale-105 transition-all border border-white/10"
            >
              <Plus className="mr-2 size-4" />
              {t("calendar.addEvent")}
            </Button>
          </div>
        </div>

        {/* Main Content Area with faint background glow */}
        <div className="relative">
          <div className="absolute -top-20 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10">
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

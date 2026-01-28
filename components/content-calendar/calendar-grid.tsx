"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2
} from "lucide-react";
import type { ContentCalendar } from "@/lib/types/omniadly-types";
import { cn } from "@/lib/utils";

interface CalendarGridProps {
  currentDate: Date;
  onMonthChange: (direction: 'prev' | 'next') => void;
  schedules: ContentCalendar[];
  onEventClick?: (event: ContentCalendar) => void;
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date | null;
  isLoading?: boolean;
}

export function CalendarGrid({
  currentDate,
  onMonthChange,
  schedules,
  onEventClick,
  onDateSelect,
  selectedDate,
  isLoading = false
}: CalendarGridProps) {
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.scheduledDate).toISOString().split('T')[0];
      return scheduleDate === dateStr;
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 bg-slate-50/50 rounded-lg">
        <Loader2 className="size-8 animate-spin text-slate-400" />
        <p className="text-xs font-semibold text-slate-400">Đang đồng bộ dữ liệu...</p>
      </div>
    );
  }

  const days = getDaysInMonth(currentDate);
  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];
  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-slate-900">{monthNames[currentDate.getMonth()]}</span>
          <span className="text-sm font-medium text-slate-400">{currentDate.getFullYear()}</span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMonthChange('prev')}
            className="size-8 rounded-md hover:bg-slate-100"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMonthChange('next')}
            className="size-8 rounded-md hover:bg-slate-100"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {dayNames.map((day, i) => (
          <div
            key={day}
            className={cn(
              "text-center text-[10px] sm:text-xs font-bold py-2",
              i === 0 ? "text-rose-500" : "text-slate-400"
            )}
          >
            {day}
          </div>
        ))}

        {days.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="aspect-square rounded-lg bg-slate-50/30" />;
          }

          const dayEvents = getEventsForDate(day);
          const hasEvents = dayEvents.length > 0;
          const isToday = day.toDateString() === new Date().toDateString();
          const isSelected = selectedDate?.toDateString() === day.toDateString();

          return (
            <div
              key={day.toISOString()}
              className={cn(
                "relative aspect-square p-1.5 sm:p-2 rounded-lg cursor-pointer transition-all border",
                isToday ? "border-slate-900 bg-slate-900 text-white" : "border-slate-100 bg-white hover:border-slate-300",
                isSelected && !isToday ? "ring-2 ring-slate-900" : "",
                hasEvents && !isToday && "bg-slate-50"
              )}
              onClick={() => onDateSelect?.(day)}
            >
              <span className={cn(
                "text-xs sm:text-sm font-bold",
                isToday ? "text-white" : "text-slate-900"
              )}>
                {day.getDate()}
              </span>

              {hasEvents && (
                <div className="absolute bottom-1.5 sm:bottom-2 right-1.5 sm:right-2 flex gap-0.5">
                  {isToday ? (
                    <div className="size-1 rounded-full bg-white opacity-80" />
                  ) : (
                    <div className="size-1 rounded-full bg-blue-500" />
                  )}
                  {dayEvents.length > 1 && (
                    <div className={cn("size-1 rounded-full", isToday ? "bg-white/60" : "bg-blue-300")} />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

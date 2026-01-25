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
import type { ContentCalendar } from "@/lib/types/aisam-types";
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

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
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
      <Card className="rounded-2xl border border-white/5 bg-background/40 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
        <CardContent className="flex items-center justify-center py-32">
          <div className="text-center relative z-10">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
              <Loader2 className="size-12 animate-spin text-primary relative z-10 mx-auto" />
            </div>
            <p className="text-sm font-medium uppercase tracking-widest text-primary/80">Syncing Matrix...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const days = getDaysInMonth(currentDate);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card className="rounded-2xl border border-white/5 bg-background/40 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

      <CardHeader className="border-b border-white/5 p-6 relative z-10 flex flex-row items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]">
            <Calendar className="size-5" />
          </div>
          <CardTitle className="text-xl font-bold font-fira-sans tracking-tight">
            <span className="text-primary">{monthNames[currentDate.getMonth()]}</span>
            <span className="text-muted-foreground ml-2 font-light">{currentDate.getFullYear()}</span>
          </CardTitle>
        </div>

        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMonthChange('prev')}
            className="h-8 w-8 hover:bg-white/10 hover:text-primary transition-colors rounded-md"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <div className="w-px h-4 bg-white/10 mx-1" />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMonthChange('next')}
            className="h-8 w-8 hover:bg-white/10 hover:text-primary transition-colors rounded-md"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6 relative z-10">
        {/* Day Names */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {dayNames.map((day, i) => (
            <div
              key={day}
              className={cn(
                "text-center text-xs font-bold uppercase tracking-widest py-2 rounded-md",
                i === 0 || i === 6 ? "text-primary/70 bg-primary/5" : "text-muted-foreground/70"
              )}
            >
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.charAt(0)}</span>
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="aspect-[4/5] sm:aspect-square rounded-xl bg-white/[0.02] border border-transparent" />;
            }

            const dayEvents = getEventsForDate(day);
            const hasEvents = dayEvents.length > 0;
            const isToday = day.toDateString() === new Date().toDateString();
            const isSelected = selectedDate?.toDateString() === day.toDateString();

            return (
              <div
                key={day.toISOString().split('T')[0]}
                className={cn(
                  "relative aspect-[4/5] sm:aspect-square p-2 rounded-xl cursor-pointer transition-all duration-300 group/day flex flex-col justify-between overflow-hidden",
                  "border border-white/5 hover:border-primary/30 hover:shadow-[0_0_15px_rgba(var(--primary),0.15)]",
                  isToday ? "bg-primary/10 border-primary/40 shadow-[0_0_20px_rgba(var(--primary),0.2)]" : "bg-white/[0.02]",
                  isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background bg-primary/5" : "",
                  hasEvents && !isToday && "bg-gradient-to-br from-white/[0.07] to-white/[0.02]"
                )}
                onClick={() => onDateSelect?.(day)}
              >
                <div className="flex justify-between items-start">
                  <span className={cn(
                    "text-sm font-bold font-fira-sans transition-colors",
                    isToday ? "text-primary" : "text-muted-foreground group-hover/day:text-foreground",
                    isSelected && "text-primary"
                  )}>
                    {day.getDate()}
                  </span>

                  {isToday && (
                    <span className="block w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_5px_var(--primary)]" />
                  )}
                </div>

                {/* Event Indicators */}
                <div className="mt-auto space-y-1">
                  {hasEvents && (
                    <div className="flex flex-col gap-1">
                      {/* Show dots for small view / many events */}
                      <div className="flex gap-0.5 justify-end flex-wrap">
                        {dayEvents.slice(0, 4).map((_, i) => (
                          <div key={i} className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            isToday ? "bg-primary" : "bg-sky-400"
                          )} />
                        ))}
                        {dayEvents.length > 4 && (
                          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                        )}
                      </div>

                      {/* Label for larger screens/emphasis */}
                      <div className="hidden sm:block text-[10px] font-medium text-right text-muted-foreground group-hover/day:text-primary transition-colors">
                        {dayEvents.length} Item{dayEvents.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  )}
                </div>

                {/* Active glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-0 group-hover/day:opacity-100 transition-opacity pointer-events-none" />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

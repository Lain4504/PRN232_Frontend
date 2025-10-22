"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { ContentCalendar } from "@/lib/types/aisam-types";

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

  const getEventBadgeColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-chart-1/15 text-chart-1 border-chart-1/20';
      case 'published':
        return 'bg-chart-2/15 text-chart-2 border-chart-2/20';
      case 'failed':
        return 'bg-destructive/15 text-destructive border-destructive/20';
      case 'cancelled':
        return 'bg-muted text-muted-foreground border-border';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg overflow-hidden">
        <CardHeader className="border-b bg-gradient-to-r from-primary/5 via-primary/3 to-transparent">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Calendar className="h-5 w-5 text-primary" />
            Content Calendar
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">Loading calendar...</p>
            </div>
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
    <Card className="shadow-lg overflow-hidden">
      <CardHeader className="border-b bg-gradient-to-r from-primary/5 via-primary/3 to-transparent">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Calendar className="h-5 w-5 text-primary" />
            <span className="font-semibold">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
          </CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMonthChange('prev')}
              className="hover:bg-primary/10 hover:border-primary/30 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMonthChange('next')}
              className="hover:bg-primary/10 hover:border-primary/30 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {/* Day Names */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
          {dayNames.map(day => (
            <div
              key={day}
              className="p-2 text-center text-xs sm:text-sm font-semibold text-muted-foreground"
            >
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.charAt(0)}</span>
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {days.map((day, index) => {
            if (!day) {
              return <div key={index} className="p-1 sm:p-2 h-16 sm:h-24"></div>;
            }

            const dayEvents = getEventsForDate(day);
            const isToday = day.toDateString() === new Date().toDateString();
            const isSelected = selectedDate?.toDateString() === day.toDateString();

            return (
              <div
                key={day.toISOString().split('T')[0]}
                className={`
                  p-1 sm:p-2 h-16 sm:h-24 border-2 rounded-xl cursor-pointer 
                  transition-all duration-200 hover:shadow-md hover:scale-[1.02]
                  ${isToday
                    ? 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary shadow-sm'
                    : 'hover:bg-muted/50 border-border'
                  }
                  ${isSelected
                    ? 'bg-accent/50 border-accent-foreground ring-2 ring-primary/20'
                    : ''
                  }
                `}
                onClick={() => onDateSelect?.(day)}
              >
                <div className={`
                  text-xs sm:text-sm font-semibold mb-1 
                  ${isToday ? 'text-primary' : 'text-foreground'}
                `}>
                  {day.getDate()}
                </div>
                <div className="space-y-0.5 sm:space-y-1 overflow-hidden">
                  {dayEvents.slice(0, 2).map(event => (
                    <div
                      key={event.id}
                      className={`
                        text-[10px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded-md 
                        cursor-pointer border transition-all duration-200
                        hover:scale-105 hover:shadow-sm
                        ${getEventBadgeColor(event.status)}
                      `}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick?.(event);
                      }}
                      title={`${event.contentTitle} - ${event.brandName}`}
                    >
                      <div className="truncate font-medium">{event.contentTitle}</div>
                      <div className="text-[9px] sm:text-xs opacity-75 truncate hidden sm:block">
                        {event.brandName}
                      </div>
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-[10px] sm:text-xs text-muted-foreground font-medium">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

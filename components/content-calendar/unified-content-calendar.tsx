"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Plus,
  Filter,
  Menu,
  X,
  Clock,
  Layers
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UpcomingSchedulesList } from "./upcoming-schedules-list";
import { CalendarGrid } from "./calendar-grid";
import { useCalendarData } from "@/hooks/use-calendar-data";
import type { ContentCalendar } from "@/lib/types/aisam-types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface UnifiedContentCalendarProps {
  teamId?: string; // Optional: undefined for profile context, string for team context
  onEventClick?: (event: ContentCalendar) => void;
  onCreateSchedule?: () => void;
}

export function UnifiedContentCalendar({
  teamId,
  onEventClick,
  onCreateSchedule
}: UnifiedContentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);

  // Use the new hook to manage data fetching and brand filtering
  const {
    schedules,
    isLoading,
    error,
    brandFilter,
    setBrandFilter,
    availableBrands,
    teamContext
  } = useCalendarData({ teamId });

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleBrandFilterChange = (brandId: string) => {
    console.log('[Calendar] Brand filter changed to:', brandId);
    setBrandFilter(brandId === "all" ? undefined : brandId);
  };

  const schedulesForSelectedDate = useMemo(() => {
    if (!selectedDate) return [] as ContentCalendar[];
    const dateStr = selectedDate.toISOString().split('T')[0];
    return schedules.filter(s => new Date(s.scheduledDate).toISOString().split('T')[0] === dateStr);
  }, [selectedDate, schedules]);

  if (error) {
    return (
      <Card className="shadow-lg border-destructive/20 bg-destructive/5 backdrop-blur-sm">
        <CardContent className="text-center py-12 text-destructive">
          <div className="size-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <X className="size-6" />
          </div>
          <h3 className="text-xl font-bold mb-2 uppercase tracking-wide">Error Loading Calendar</h3>
          <p className="text-muted-foreground font-medium">Failed to synchronize content matrix. Please retry connection.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative font-fira-sans">
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <div className="space-y-6">
            {/* Header with Brand Filter */}
            <Card className="rounded-2xl border border-white/5 bg-background/40 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-50" />
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Calendar className="size-32 -rotate-12 text-primary" />
              </div>

              <CardHeader className="border-b border-white/5 p-6 relative z-10">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_15px_-3px_rgba(var(--primary),0.3)]">
                      <Calendar className="size-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-black uppercase tracking-tight leading-none mb-1">
                        Content Schedule
                      </CardTitle>
                      <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">
                        {teamContext ? `${teamContext.teamName} Schedule` : 'Master Schedule'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Brand Filter */}
                    <div className="flex items-center gap-2 bg-background/50 rounded-xl p-1 border border-white/5">
                      <div className="px-2 text-muted-foreground">
                        <Filter className="size-4" />
                      </div>
                      <Select value={brandFilter || "all"} onValueChange={handleBrandFilterChange}>
                        <SelectTrigger className="w-[180px] h-9 border-none bg-transparent shadow-none focus:ring-0 text-xs font-bold uppercase tracking-wide">
                          <SelectValue placeholder="Filter Brand" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-white/10 bg-background/95 backdrop-blur-xl">
                          <SelectItem value="all" className="text-xs font-bold uppercase">All Brands</SelectItem>
                          {availableBrands.map(brand => (
                            <SelectItem key={brand.id} value={brand.id} className="text-xs font-medium">
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      className="lg:hidden h-11 w-11 p-0 rounded-xl border-white/10"
                      variant="outline"
                      onClick={() => setShowSidebar(!showSidebar)}
                    >
                      {showSidebar ? <X className="size-5" /> : <Menu className="size-5" />}
                    </Button>

                    {onCreateSchedule && (
                      <Button
                        size="sm"
                        onClick={onCreateSchedule}
                        className="h-11 px-6 rounded-xl bg-primary hover:bg-primary/90 shadow-[0_4px_12px_rgba(var(--primary),0.25)] font-black uppercase tracking-widest text-[10px] transition-all hover:scale-105 active:scale-95 border border-white/10"
                      >
                        <Plus className="mr-2 size-4" />
                        <span className="hidden sm:inline">New Schedule</span>
                        <span className="sm:hidden">New</span>
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Calendar Grid */}
            <div className="rounded-2xl border border-white/5 bg-background/20 backdrop-blur-md shadow-xl overflow-hidden p-1">
              <CalendarGrid
                currentDate={currentDate}
                onMonthChange={navigateMonth}
                schedules={schedules}
                onEventClick={onEventClick}
                onDateSelect={setSelectedDate}
                selectedDate={selectedDate}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <div className="sticky top-6">
            <UpcomingSchedulesList
              schedules={schedules}
              limit={10}
              onScheduleClick={onEventClick}
            />
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {showSidebar && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-md transition-all duration-300">
          <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-background border-l border-white/10 shadow-2xl overflow-y-auto">
            <div className="p-6 font-fira-sans">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Clock className="size-4 text-primary" />
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-tight">Timeline</h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-muted"
                  onClick={() => setShowSidebar(false)}
                >
                  <X className="size-5" />
                </Button>
              </div>
              <UpcomingSchedulesList
                schedules={schedules}
                limit={10}
                onScheduleClick={(event) => {
                  onEventClick?.(event);
                  setShowSidebar(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Day Schedules Modal */}
      <Dialog open={!!selectedDate} onOpenChange={(open) => !open && setSelectedDate(null)}>
        <DialogContent className="max-w-md rounded-2xl bg-background/95 backdrop-blur-2xl border border-white/10 p-0 overflow-hidden font-fira-sans shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]">
          <DialogHeader className="p-6 pb-2 border-b border-white/5 bg-muted/20">
            <DialogTitle className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-background border border-white/10 flex flex-col items-center justify-center shadow-sm">
                <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none">{selectedDate?.toLocaleDateString('en-US', { month: 'short' })}</span>
                <span className="text-lg font-black text-foreground leading-none">{selectedDate?.getDate()}</span>
              </div>
              <span className="text-xl font-bold tracking-tight">Daily Schedule</span>
            </DialogTitle>
          </DialogHeader>

          <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
            {schedulesForSelectedDate.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center opacity-50">
                <Layers className="size-12 text-muted-foreground mb-3" />
                <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">No content scheduled</p>
              </div>
            ) : (
              <div className="space-y-3">
                {schedulesForSelectedDate.map((event, idx) => {
                  const eventTime = event.scheduledTime
                    ? new Date(`${event.scheduledDate}T${event.scheduledTime}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
                    : new Date(event.scheduledDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

                  return (
                    <button
                      key={event.id}
                      className="w-full text-left p-4 rounded-xl border border-white/5 bg-card/50 hover:bg-muted/50 transition-all flex items-start gap-4 group hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
                      onClick={() => {
                        onEventClick?.(event);
                        setSelectedDate(null);
                      }}
                    >
                      <div className="flex flex-col items-center justify-center min-w-[60px] pt-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-md mb-1">{eventTime}</span>
                        <div className={`h-full w-0.5 bg-gradient-to-b from-primary/50 to-transparent rounded-full min-h-[20px]`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm truncate group-hover:text-primary transition-colors">{event.contentTitle || 'Untitled Content'}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-white/10 bg-black/20 text-muted-foreground uppercase tracking-wider">
                            {event.brandName || 'Unknown Brand'}
                          </Badge>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-white/5 bg-muted/20 flex justify-end">
            <Button variant="ghost" size="sm" onClick={() => setSelectedDate(null)} className="font-bold text-xs uppercase tracking-wide text-muted-foreground hover:text-foreground">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

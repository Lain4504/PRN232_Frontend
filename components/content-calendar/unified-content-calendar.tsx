"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Plus,
  Filter,
  Menu,
  X
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UpcomingSchedulesList } from "./upcoming-schedules-list";
import { CalendarGrid } from "./calendar-grid";
import { useCalendarData } from "@/hooks/use-calendar-data";
import type { ContentCalendar } from "@/lib/types/aisam-types";

interface UnifiedContentCalendarProps {
  teamId: string;
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

  if (error) {
    return (
      <Card className="shadow-lg">
        <CardContent className="text-center py-8 text-destructive">
          <h3 className="text-lg font-semibold mb-2">Error Loading Calendar</h3>
          <p className="text-muted-foreground">Failed to load scheduled content. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative">
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <div className="space-y-4">
            {/* Header with Brand Filter */}
            <Card className="shadow-lg">
              <CardHeader className="border-b bg-gradient-to-r from-primary/5 via-primary/3 to-transparent">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Calendar className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Content Calendar</span>
                    </CardTitle>
                    {teamContext && (
                      <Badge variant="outline" className="border-primary/20 bg-primary/5">
                        {teamContext.teamName}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      className="lg:hidden"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSidebar(!showSidebar)}
                    >
                      {showSidebar ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                    </Button>
                    {onCreateSchedule && (
                      <Button
                        size="sm"
                        onClick={onCreateSchedule}
                        className="bg-primary hover:bg-primary/90 shadow-sm"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Schedule</span>
                        <span className="sm:hidden">New</span>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Brand Filter */}
                <div className="flex items-center gap-2 mt-4">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={brandFilter || "all"} onValueChange={handleBrandFilterChange}>
                    <SelectTrigger className="w-full sm:w-48 transition-all hover:border-primary/30">
                      <SelectValue placeholder="Filter by brand" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Brands</SelectItem>
                      {availableBrands.map(brand => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
            </Card>

            {/* Calendar Grid */}
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

        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <UpcomingSchedulesList
            schedules={schedules}
            limit={10}
            onScheduleClick={onEventClick}
          />
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {showSidebar && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-background border-l shadow-2xl overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Upcoming Schedules</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSidebar(false)}
                >
                  <X className="h-4 w-4" />
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
    </div>
  );
}

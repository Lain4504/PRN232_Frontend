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
import type { ContentCalendar } from "@/lib/types/omniadly-types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface UnifiedContentCalendarProps {
  teamId?: string;
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
    setBrandFilter(brandId === "all" ? undefined : brandId);
  };

  const schedulesForSelectedDate = useMemo(() => {
    if (!selectedDate) return [] as ContentCalendar[];
    const dateStr = selectedDate.toISOString().split('T')[0];
    return schedules.filter(s => new Date(s.scheduledDate).toISOString().split('T')[0] === dateStr);
  }, [selectedDate, schedules]);

  if (error) {
    return (
      <Card className="border-rose-200 bg-rose-50/50">
        <CardContent className="text-center py-12 text-rose-500">
          <div className="size-10 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
            <X className="size-5" />
          </div>
          <h3 className="text-lg font-bold mb-1">Lỗi tải dữ liệu lịch</h3>
          <p className="text-sm text-slate-500">Không thể đồng bộ nội dung từ máy chủ. Vui lòng thử lại sau.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative">
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Calendar Main */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="rounded-xl border shadow-sm">
            <CardHeader className="p-4 sm:p-6 border-b">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-md bg-slate-100 flex items-center justify-center text-slate-600 border">
                    <Calendar className="size-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">
                      Kế hoạch đăng bài
                    </CardTitle>
                    <p className="text-[11px] font-medium text-slate-500">
                      {teamContext ? `Lịch của nhóm: ${teamContext.teamName}` : 'Lịch cá nhân'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-2 py-1 rounded-md border bg-slate-50/50">
                    <Filter className="size-3.5 text-slate-400" />
                    <Select value={brandFilter || "all"} onValueChange={handleBrandFilterChange}>
                      <SelectTrigger className="w-[140px] h-8 border-none bg-transparent shadow-none focus:ring-0 text-xs font-semibold">
                        <SelectValue placeholder="Lọc thương hiệu" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className="text-xs">Tất cả thương hiệu</SelectItem>
                        {availableBrands.map(brand => (
                          <SelectItem key={brand.id} value={brand.id} className="text-xs">
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    size="icon"
                    variant="outline"
                    className="lg:hidden h-8 w-8"
                    onClick={() => setShowSidebar(!showSidebar)}
                  >
                    <Menu className="size-4" />
                  </Button>

                  {onCreateSchedule && (
                    <Button
                      size="sm"
                      onClick={onCreateSchedule}
                      className="h-8 px-4"
                    >
                      <Plus className="mr-1.5 size-4" />
                      <span className="hidden sm:inline">Lập lịch mới</span>
                      <span className="sm:hidden">Lập lịch</span>
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-2">
              <CalendarGrid
                currentDate={currentDate}
                onMonthChange={navigateMonth}
                schedules={schedules}
                onEventClick={onEventClick}
                onDateSelect={setSelectedDate}
                selectedDate={selectedDate}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block">
          <UpcomingSchedulesList
            schedules={schedules}
            limit={10}
            onScheduleClick={onEventClick}
          />
        </div>
      </div>

      {/* Mobile Sidebar */}
      {showSidebar && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowSidebar(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-xs bg-white shadow-xl animate-in slide-in-from-right duration-300">
            <div className="h-full flex flex-col p-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-slate-500" />
                  <span className="font-bold text-sm">Sắp tới</span>
                </div>
                <Button variant="ghost" size="icon" className="size-8" onClick={() => setShowSidebar(false)}>
                  <X className="size-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <UpcomingSchedulesList
                  schedules={schedules}
                  limit={10}
                  onScheduleClick={(e) => {
                    onEventClick?.(e);
                    setShowSidebar(false);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Day Events Modal */}
      <Dialog open={!!selectedDate} onOpenChange={(open) => !open && setSelectedDate(null)}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b bg-slate-50/50">
            <DialogTitle className="flex items-center gap-3">
              <div className="size-10 rounded border bg-white flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase leading-none">{selectedDate?.toLocaleDateString('vi-VN', { month: 'short' })}</span>
                <span className="text-base font-bold text-slate-900 leading-none">{selectedDate?.getDate()}</span>
              </div>
              <span className="text-lg font-bold">Lịch trình ngày</span>
            </DialogTitle>
          </DialogHeader>

          <div className="p-4 max-h-[50vh] overflow-y-auto">
            {schedulesForSelectedDate.length === 0 ? (
              <div className="text-center py-10 opacity-50">
                <Layers className="size-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-500">Chưa có nội dung lên lịch</p>
              </div>
            ) : (
              <div className="space-y-2">
                {schedulesForSelectedDate.map((event) => {
                  const eventTime = event.scheduledTime ? event.scheduledTime.substring(0, 5) : "--:--";
                  return (
                    <button
                      key={event.id}
                      className="w-full text-left p-3 rounded-lg border bg-white hover:bg-slate-50 transition-colors flex items-start gap-4"
                      onClick={() => {
                        onEventClick?.(event);
                        setSelectedDate(null);
                      }}
                    >
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded shrink-0">{eventTime}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs truncate text-slate-900">{event.contentTitle || 'Không tiêu đề'}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{event.brandName || 'Thương hiệu chưa xác định'}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="p-3 border-t bg-slate-50/50 flex justify-end">
            <Button variant="ghost" size="sm" onClick={() => setSelectedDate(null)}>
              Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

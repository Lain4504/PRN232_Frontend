import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import type { ContentCalendar } from "@/lib/types/omniadly-types";
import { format, parseISO, isToday, isTomorrow, isPast } from "date-fns";
import { cn } from "@/lib/utils";

interface UpcomingSchedulesListProps {
  schedules: ContentCalendar[];
  limit?: number;
  onScheduleClick?: (schedule: ContentCalendar) => void;
}

export function UpcomingSchedulesList({
  schedules,
  limit = 10,
  onScheduleClick
}: UpcomingSchedulesListProps) {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published': return 'Đã đăng';
      case 'failed': return 'Thất bại';
      case 'cancelled': return 'Đã hủy';
      default: return 'Đang chờ';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'failed': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'cancelled': return 'bg-slate-100 text-slate-500 border-slate-200';
      default: return 'bg-blue-50 text-blue-600 border-blue-100';
    }
  };

  const getDateLabel = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return "HÔM NAY";
    if (isTomorrow(date)) return "NÀY MAI";
    return format(date, "dd/MM");
  };

  const sortedSchedules = [...schedules]
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
    .slice(0, limit);

  return (
    <Card className="rounded-xl border shadow-sm h-full flex flex-col overflow-hidden">
      <CardHeader className="p-4 border-b bg-slate-50/50">
        <CardTitle className="flex items-center gap-2 text-sm font-bold">
          <Clock className="size-4 text-slate-500" />
          <span>Sắp tới</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0 flex-1 overflow-y-auto">
        {sortedSchedules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <Calendar className="size-8 text-slate-200 mb-2" />
            <p className="text-xs font-semibold text-slate-400">Không có lịch trình sắp tới</p>
          </div>
        ) : (
          <div className="divide-y">
            {sortedSchedules.map((schedule) => {
              const timeStr = schedule.scheduledTime ? schedule.scheduledTime.substring(0, 5) : "--:--";
              return (
                <div
                  key={schedule.id}
                  className="p-4 hover:bg-slate-50 cursor-pointer transition-colors group"
                  onClick={() => onScheduleClick?.(schedule)}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h4 className="font-bold text-xs line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {schedule.contentTitle || 'Không tiêu đề'}
                    </h4>
                    <Badge
                      variant="outline"
                      className={cn("text-[9px] px-1.5 py-0 h-4 border-none font-bold", getStatusColor(schedule.status))}
                    >
                      {getStatusLabel(schedule.status)}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">
                      {schedule.brandName || 'Thương hiệu'}
                    </span>

                    <div className="flex items-center gap-2 text-[10px]">
                      <span className={cn(
                        "font-bold",
                        isToday(parseISO(schedule.scheduledDate)) ? "text-blue-600" : "text-slate-500"
                      )}>
                        {getDateLabel(schedule.scheduledDate)}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="font-semibold text-slate-600">
                        {timeStr}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

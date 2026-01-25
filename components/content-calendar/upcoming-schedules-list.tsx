import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Activity } from "lucide-react";
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
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'scheduled':
        return {
          color: 'bg-primary/10 text-primary border-primary/20',
          icon: Clock
        };
      case 'published':
        return {
          color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
          icon: Activity
        };
      case 'failed':
        return {
          color: 'bg-destructive/10 text-destructive border-destructive/20',
          icon: Activity
        };
      case 'cancelled':
        return {
          color: 'bg-muted text-muted-foreground border-border',
          icon: Activity
        };
      default:
        return {
          color: 'bg-muted text-muted-foreground border-border',
          icon: Activity
        };
    }
  };

  const getDateLabel = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return "TODAY";
    if (isTomorrow(date)) return "TOMORROW";
    if (isPast(date)) return format(date, "MMM d").toUpperCase();
    return format(date, "MMM d").toUpperCase();
  };

  const formatLocalTime = (dateString: string, timeString: string | undefined, timezone: string) => {
    try {
      const date = parseISO(dateString);
      let hh: string, mm: string, ss: string;
      if (timeString) {
        [hh = "00", mm = "00", ss = "00"] = timeString.split(":");
      } else {
        // Derive time from scheduledDate (treated as UTC instant)
        hh = String(date.getUTCHours()).padStart(2, '0');
        mm = String(date.getUTCMinutes()).padStart(2, '0');
        ss = String(date.getUTCSeconds()).padStart(2, '0');
      }
      const local = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), Number(hh), Number(mm), Number(ss)));
      return `${format(local, "HH:mm")} ${timezone}`;
    } catch {
      return "--:--";
    }
  };

  const sortedSchedules = [...schedules]
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
    .slice(0, limit);

  return (
    <Card className="rounded-2xl border border-white/5 bg-background/40 backdrop-blur-xl shadow-2xl h-full flex flex-col overflow-hidden group">
      <CardHeader className="border-b border-white/5 p-6 bg-gradient-to-br from-white/5 to-transparent relative z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <CardTitle className="flex items-center gap-3 text-lg font-bold tracking-tight font-fira-sans uppercase relative z-10">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]">
            <Clock className="size-4" />
          </div>
          <span>Upcoming Events</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0 flex-1 overflow-y-auto custom-scrollbar">
        {sortedSchedules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/50">
            <div className="size-20 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/5">
              <Calendar className="size-10 opacity-30" />
            </div>
            <p className="text-sm font-medium uppercase tracking-widest text-center">No upcoming events</p>
            <p className="text-xs mt-2 text-center max-w-[200px] opacity-60">Your schedule is clear. Create a new event to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {sortedSchedules.map((schedule) => {
              const statusInfo = getStatusInfo(schedule.status);
              const StatusIcon = statusInfo.icon;

              return (
                <div
                  key={schedule.id}
                  className="p-4 hover:bg-white/5 cursor-pointer transition-all duration-300 group/item relative border-l-2 border-transparent hover:border-primary"
                  onClick={() => onScheduleClick?.(schedule)}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h4 className="font-semibold text-sm line-clamp-1 font-fira-sans group-hover/item:text-primary transition-colors">
                      {schedule.contentTitle}
                    </h4>
                    <Badge
                      variant="outline"
                      className={cn("text-[10px] uppercase tracking-wider shrink-0 font-bold", statusInfo.color)}
                    >
                      {schedule.status}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <Badge variant="secondary" className="text-[10px] bg-white/5 hover:bg-white/10 text-muted-foreground border-white/5 font-normal">
                      {schedule.brandName}
                    </Badge>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground/70 font-fira-code">
                      <span className={cn(
                        "font-medium",
                        isToday(parseISO(schedule.scheduledDate)) && "text-primary font-bold"
                      )}>
                        {getDateLabel(schedule.scheduledDate)}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-white/20" />
                      <span>
                        {formatLocalTime(schedule.scheduledDate, schedule.scheduledTime, schedule.timezone)}
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

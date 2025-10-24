import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar } from "lucide-react";
import type { ContentCalendar } from "@/lib/types/aisam-types";
import { format, parseISO, isToday, isTomorrow, isPast } from "date-fns";

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
  const getStatusColor = (status: string) => {
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

  const getDateLabel = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    if (isPast(date)) return format(date, "MMM d");
    return format(date, "MMM d");
  };

  const sortedSchedules = [...schedules]
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
      .slice(0, limit);

  return (
      <Card className="shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-primary/5 via-primary/3 to-transparent">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-primary" />
            Upcoming Schedules
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {sortedSchedules.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No upcoming schedules</p>
              </div>
          ) : (
              <div className="space-y-3">
                {sortedSchedules.map((schedule) => (
                    <div
                        key={schedule.id}
                        className="p-3 rounded-lg border-2 bg-card hover:bg-muted/50 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
                        onClick={() => onScheduleClick?.(schedule)}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-semibold text-sm line-clamp-2">{schedule.contentTitle}</h4>
                        <Badge
                            variant="outline"
                            className={`text-xs border ${getStatusColor(schedule.status)} shrink-0`}
                        >
                          {schedule.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-medium">{schedule.brandName}</span>
                        <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                          {getDateLabel(schedule.scheduledDate)}
                  </span>
                      </div>
                    </div>
                ))}
              </div>
          )}
        </CardContent>
      </Card>
  );
}

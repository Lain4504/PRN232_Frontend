"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MoreHorizontal, X } from "lucide-react";
import { useUpcomingSchedules } from "@/hooks/use-content-calendar";
import { useCancelSchedule } from "@/hooks/use-content-calendar";
import type { ContentCalendar } from "@/lib/types/aisam-types";
import { toast } from "sonner";

interface UpcomingSchedulesListProps {
  limit?: number;
  onScheduleClick?: (schedule: ContentCalendar) => void;
}

export function UpcomingSchedulesList({ limit = 10, onScheduleClick }: UpcomingSchedulesListProps) {
  const { data: schedules = [], isLoading } = useUpcomingSchedules(limit);
  const cancelMutation = useCancelSchedule('');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="secondary" className="bg-chart-1/10 text-chart-1">Scheduled</Badge>;
      case 'published':
        return <Badge variant="default" className="bg-chart-2">Published</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleCancelSchedule = async (scheduleId: string) => {
    try {
      await cancelMutation.mutateAsync();
      toast.success('Schedule cancelled successfully');
    } catch (error) {
      toast.error('Failed to cancel schedule');
    }
  };

  const formatDateTime = (dateString: string, timeString?: string) => {
    const date = new Date(dateString);
    const time = timeString ? new Date(`${dateString}T${timeString}`) : date;
    
    return {
      date: date.toLocaleDateString(),
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upcoming Schedules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Upcoming Schedules</CardTitle>
        <CardDescription>
          {schedules.length} scheduled posts
        </CardDescription>
      </CardHeader>
      <CardContent>
        {schedules.length === 0 ? (
          <div className="text-center py-6">
            <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No upcoming schedules</p>
          </div>
        ) : (
          <div className="space-y-3">
            {schedules.map((schedule) => {
              const { date, time } = formatDateTime(schedule.scheduledDate, schedule.scheduledTime);
              
              return (
                <div
                  key={schedule.id}
                  className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-medium">{date}</span>
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {schedule.integrationIds.length} platform{schedule.integrationIds.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {getStatusBadge(schedule.status)}
                      {schedule.status === 'scheduled' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelSchedule(schedule.id)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {onScheduleClick && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onScheduleClick(schedule)}
                      className="w-full justify-start text-xs"
                    >
                      <MoreHorizontal className="h-3 w-3 mr-1" />
                      View Details
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

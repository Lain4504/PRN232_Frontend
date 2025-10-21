"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Plus } from "lucide-react";
import { ScheduleContentModal } from "@/components/content-calendar/schedule-content-modal";
import { useUpcomingSchedules } from "@/hooks/use-content-calendar";
import type { ContentResponseDto } from "@/lib/types/aisam-types";

interface ContentScheduleActionsProps {
  content: ContentResponseDto;
  onScheduleClick?: () => void;
}

export function ContentScheduleActions({ content, onScheduleClick }: ContentScheduleActionsProps) {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const { data: schedules = [] } = useUpcomingSchedules(100);

  // Find schedules for this content
  const contentSchedules = schedules.filter(schedule => schedule.contentId === content.id);
  const scheduledCount = contentSchedules.length;
  const hasScheduled = scheduledCount > 0;

  const handleScheduleClick = () => {
    setShowScheduleModal(true);
    onScheduleClick?.();
  };

  const handleScheduleClose = () => {
    setShowScheduleModal(false);
  };

  if (content.status !== 'Approved') {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-muted-foreground">
          <Clock className="h-3 w-3 mr-1" />
          Not Approved
        </Badge>
        <span className="text-xs text-muted-foreground">
          Content must be approved before scheduling
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {hasScheduled && (
        <Badge variant="secondary" className="bg-chart-1/10 text-chart-1">
          <Calendar className="h-3 w-3 mr-1" />
          {scheduledCount} scheduled
        </Badge>
      )}
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleScheduleClick}
        className="flex items-center gap-1"
      >
        <Plus className="h-3 w-3" />
        {hasScheduled ? 'Schedule More' : 'Schedule'}
      </Button>

      <ScheduleContentModal
        isOpen={showScheduleModal}
        onClose={handleScheduleClose}
        contentId={content.id}
      />
    </div>
  );
}

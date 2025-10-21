"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";

interface ScheduleStatusBadgeProps {
  status: 'scheduled' | 'published' | 'failed' | 'cancelled';
  showIcon?: boolean;
}

export function ScheduleStatusBadge({ status, showIcon = false }: ScheduleStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'scheduled':
        return {
          variant: 'secondary' as const,
          className: 'bg-chart-1/10 text-chart-1 border-chart-1/20',
          icon: Clock,
          label: 'Scheduled'
        };
      case 'published':
        return {
          variant: 'default' as const,
          className: 'bg-chart-2 text-white border-chart-2',
          icon: CheckCircle,
          label: 'Published'
        };
      case 'failed':
        return {
          variant: 'destructive' as const,
          className: 'bg-destructive text-destructive-foreground border-destructive',
          icon: XCircle,
          label: 'Failed'
        };
      case 'cancelled':
        return {
          variant: 'outline' as const,
          className: 'bg-muted text-muted-foreground border-muted-foreground/20',
          icon: AlertCircle,
          label: 'Cancelled'
        };
      default:
        return {
          variant: 'secondary' as const,
          className: 'bg-muted text-muted-foreground',
          icon: Clock,
          label: status
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={config.className}>
      {showIcon && <Icon className="h-3 w-3 mr-1" />}
      {config.label}
    </Badge>
  );
}

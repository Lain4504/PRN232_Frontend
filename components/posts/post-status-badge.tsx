"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Trash2 } from "lucide-react";

interface PostStatusBadgeProps {
  status: 'published' | 'failed' | 'deleted';
  showIcon?: boolean;
}

export function PostStatusBadge({ status, showIcon = false }: PostStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
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
      case 'deleted':
        return {
          variant: 'secondary' as const,
          className: 'bg-muted text-muted-foreground border-muted-foreground/20',
          icon: Trash2,
          label: 'Deleted'
        };
      default:
        return {
          variant: 'secondary' as const,
          className: 'bg-muted text-muted-foreground',
          icon: CheckCircle,
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

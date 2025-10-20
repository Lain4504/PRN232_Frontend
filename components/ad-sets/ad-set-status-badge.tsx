import { Badge } from "@/components/ui/badge";
import { getAdSetStatusColor } from "@/lib/types/ad-sets";
import type { AdSetResponse } from "@/lib/types/ad-sets";

interface AdSetStatusBadgeProps {
  adSet: AdSetResponse;
  className?: string;
}

export function AdSetStatusBadge({ adSet, className }: AdSetStatusBadgeProps) {
  const status = adSet.isActive ? 'active' : 'paused';
  const statusColor = getAdSetStatusColor(status);

  return (
    <Badge variant="secondary" className={`${statusColor} ${className || ''}`}>
      {status}
    </Badge>
  );
}

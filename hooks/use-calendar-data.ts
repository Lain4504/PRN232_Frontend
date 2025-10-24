import { useState } from 'react';
import { useUpcomingSchedules, useTeamSchedules } from '@/hooks/use-content-calendar';
import { useTeamBrands } from '@/hooks/use-team-brands';
import { useBrands } from '@/hooks/use-brands';
import type { ContentCalendar } from '@/lib/types/aisam-types';

interface UseCalendarDataProps {
  teamId: string;
  limit?: number;
}

interface UseCalendarDataReturn {
  schedules: ContentCalendar[];
  isLoading: boolean;
  error: Error | null;
  brandFilter: string | undefined;
  setBrandFilter: (brandId: string | undefined) => void;
  availableBrands: { id: string; name: string }[];
  teamContext: {
    teamId: string;
    teamName: string;
  };
}

export function useCalendarData({ 
  teamId, 
  limit = 50 
}: UseCalendarDataProps): UseCalendarDataReturn {
  const [brandFilter, setBrandFilter] = useState<string | undefined>(undefined);
  
  // For dashboard context, use a different approach
  const isDashboardContext = teamId === "dashboard";
  
  // Load team brands (for team context) or all brands (for dashboard context)
  const { data: teamBrands = [] } = useTeamBrands(isDashboardContext ? "" : teamId);
  const { data: allBrands = [] } = useBrands();
  
  // Use appropriate brands based on context
  const availableBrands = isDashboardContext ? allBrands : teamBrands;
  
  // Use brand-specific API when a brand is selected, otherwise use team schedules
  const { data: teamSchedules = [], isLoading: teamLoading, error: teamError } = useTeamSchedules(isDashboardContext ? "" : teamId, limit);
  const { data: brandSchedules = [], isLoading: brandLoading, error: brandError } = useUpcomingSchedules(limit, brandFilter);
  
  // For dashboard context, use upcoming schedules directly
  const { data: dashboardSchedules = [], isLoading: dashboardLoading, error: dashboardError } = useUpcomingSchedules(limit);
  
  // Use brand-specific schedules if a brand is selected, otherwise use team schedules
  const isBrandSelected = !!brandFilter && brandFilter !== "all" && brandFilter !== "";
  
  let schedules, isLoading, error;
  
  if (isDashboardContext) {
    // For dashboard, use upcoming schedules directly
    schedules = isBrandSelected ? brandSchedules : dashboardSchedules;
    isLoading = isBrandSelected ? brandLoading : dashboardLoading;
    error = isBrandSelected ? brandError : dashboardError;
  } else {
    // For team context, use team schedules or brand schedules
    schedules = isBrandSelected ? brandSchedules : teamSchedules;
    isLoading = isBrandSelected ? brandLoading : teamLoading;
    error = isBrandSelected ? brandError : teamError;
  }

  const formattedBrands = availableBrands.map((brand: any) => ({
    id: brand.id,
    name: brand.name
  }));

  const teamContext = {
    teamId,
    teamName: isDashboardContext ? "Dashboard" : `Team ${teamId.slice(0, 8)}`
  };

  return {
    schedules,
    isLoading,
    error,
    brandFilter,
    setBrandFilter,
    availableBrands: formattedBrands,
    teamContext
  };
}

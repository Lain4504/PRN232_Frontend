import { useState } from 'react';
import { useUpcomingSchedules, useTeamSchedules } from '@/hooks/use-content-calendar';
import { useTeamBrands } from '@/hooks/use-team-brands';
import { useBrands } from '@/hooks/use-brands';
import { useTeam } from '@/hooks/use-teams';
import type { ContentCalendar } from '@/lib/types/omniadly-types';

interface UseCalendarDataProps {
  teamId?: string; // Optional: undefined for profile context, string for team context
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

  // For profile/dashboard context, teamId is undefined
  const isProfileContext = !teamId;

  // Get team info to get team name (only for team context)
  const { data: team } = useTeam(teamId || undefined);

  // Load team brands (for team context) or all brands (for profile context)
  const { data: teamBrands = [] } = useTeamBrands(teamId || undefined);
  const { data: allBrands = [] } = useBrands();

  // Use appropriate brands based on context
  const availableBrands = isProfileContext ? allBrands : teamBrands;

  // Use brand-specific API when a brand is selected, otherwise use team schedules
  const { data: teamSchedules = [], isLoading: teamLoading, error: teamError } = useTeamSchedules(teamId || "", limit);
  const { data: brandSchedules = [], isLoading: brandLoading, error: brandError } = useUpcomingSchedules(limit, brandFilter);

  // For profile context, use upcoming schedules directly
  const { data: profileSchedules = [], isLoading: profileLoading, error: profileError } = useUpcomingSchedules(limit);

  // Use brand-specific schedules if a brand is selected, otherwise use team/profile schedules
  const isBrandSelected = !!brandFilter && brandFilter !== "all" && brandFilter !== "";

  let schedules, isLoading, error;

  if (isProfileContext) {
    // For profile context, use upcoming schedules directly
    schedules = isBrandSelected ? brandSchedules : profileSchedules;
    isLoading = isBrandSelected ? brandLoading : profileLoading;
    error = isBrandSelected ? brandError : profileError;
  } else {
    // For team context, use team schedules or brand schedules
    schedules = isBrandSelected ? brandSchedules : teamSchedules;
    isLoading = isBrandSelected ? brandLoading : teamLoading;
    error = isBrandSelected ? brandError : teamError;
  }

  const formattedBrands = availableBrands.map((brand: { id: string; name: string }) => ({
    id: brand.id,
    name: brand.name
  }));

  const teamContext = {
    teamId: teamId || "",
    teamName: isProfileContext ? "Dashboard" : (team?.name || `Team ${teamId?.slice(0, 8) || ""}`)
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

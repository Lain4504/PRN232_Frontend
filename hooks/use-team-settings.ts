// Team Settings Hooks
// Based on Story 3.3 requirements

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, endpoints } from '@/lib/api';
import { Team, TeamSettings, UpdateTeamFormData, UpdateTeamSettingsFormData } from '@/lib/types/teams';
import { toast } from 'sonner';

// Query Keys
export const teamSettingsKeys = {
  all: ['team-settings'] as const,
  details: () => [...teamSettingsKeys.all, 'detail'] as const,
  detail: (teamId: string) => [...teamSettingsKeys.details(), teamId] as const,
};

// Get team settings
export function useTeamSettings(teamId?: string) {
  return useQuery({
    queryKey: teamId ? teamSettingsKeys.detail(teamId) : teamSettingsKeys.details(),
    queryFn: async (): Promise<TeamSettings> => {
      const resp = await api.get<TeamSettings>(endpoints.teamSettings(teamId!));
      return resp.data;
    },
    enabled: !!teamId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Update team information
export function useUpdateTeam(teamId: string) {
  const qc = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UpdateTeamFormData): Promise<Team> => {
      const resp = await api.put<Team>(endpoints.updateTeam(teamId), data);
      return resp.data;
    },
    onSuccess: (updatedTeam) => {
      qc.invalidateQueries({ queryKey: teamSettingsKeys.detail(teamId) });
      qc.invalidateQueries({ queryKey: ['teams', 'detail', teamId] });
      toast.success('Team updated successfully!', {
        description: 'Your team information has been updated.',
        duration: 3000,
      });
    },
    onError: (error) => {
      toast.error('Failed to update team', {
        description: error instanceof Error ? error.message : 'Please try again later.',
        duration: 4000,
      });
    },
  });
}

// Update team settings
export function useUpdateTeamSettings(teamId: string) {
  const qc = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UpdateTeamSettingsFormData): Promise<TeamSettings> => {
      const resp = await api.put<TeamSettings>(endpoints.updateTeamSettings(teamId), data);
      return resp.data;
    },
    onSuccess: (updatedSettings) => {
      qc.invalidateQueries({ queryKey: teamSettingsKeys.detail(teamId) });
      qc.invalidateQueries({ queryKey: ['teams', 'detail', teamId] });
      toast.success('Team settings updated successfully!', {
        description: 'Your team settings have been updated.',
        duration: 3000,
      });
    },
    onError: (error) => {
      toast.error('Failed to update team settings', {
        description: error instanceof Error ? error.message : 'Please try again later.',
        duration: 4000,
      });
    },
  });
}

// Delete team
export function useDeleteTeam(teamId: string) {
  const qc = useQueryClient();
  
  return useMutation({
    mutationFn: async (): Promise<boolean> => {
      const resp = await api.delete<boolean>(endpoints.deleteTeam(teamId));
      return resp.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: teamSettingsKeys.detail(teamId) });
      qc.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Team deleted successfully!', {
        description: 'The team has been permanently removed.',
        duration: 3000,
      });
    },
    onError: (error) => {
      toast.error('Failed to delete team', {
        description: error instanceof Error ? error.message : 'Please try again later.',
        duration: 4000,
      });
    },
  });
}

// Archive team
export function useArchiveTeam(teamId: string) {
  const qc = useQueryClient();
  
  return useMutation({
    mutationFn: async (): Promise<boolean> => {
      const resp = await api.post<boolean>(endpoints.archiveTeam(teamId));
      return resp.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: teamSettingsKeys.detail(teamId) });
      qc.invalidateQueries({ queryKey: ['teams', 'detail', teamId] });
      toast.success('Team archived successfully!', {
        description: 'The team has been archived.',
        duration: 3000,
      });
    },
    onError: (error) => {
      toast.error('Failed to archive team', {
        description: error instanceof Error ? error.message : 'Please try again later.',
        duration: 4000,
      });
    },
  });
}

// Restore team
export function useRestoreTeam(teamId: string) {
  const qc = useQueryClient();
  
  return useMutation({
    mutationFn: async (): Promise<boolean> => {
      const resp = await api.post<boolean>(endpoints.restoreTeam(teamId));
      return resp.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: teamSettingsKeys.detail(teamId) });
      qc.invalidateQueries({ queryKey: ['teams', 'detail', teamId] });
      toast.success('Team restored successfully!', {
        description: 'The team has been restored.',
        duration: 3000,
      });
    },
    onError: (error) => {
      toast.error('Failed to restore team', {
        description: error instanceof Error ? error.message : 'Please try again later.',
        duration: 4000,
      });
    },
  });
}

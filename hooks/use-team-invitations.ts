// Team Invitation Hooks
// Based on Story 3.3 requirements

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, endpoints } from '@/lib/api';
import { TeamInvitation, TeamInvitationListResponse, InviteMemberForm } from '@/lib/types/teams';
import { toast } from 'sonner';

// Query Keys
export const teamInvitationKeys = {
  all: ['team-invitations'] as const,
  lists: () => [...teamInvitationKeys.all, 'list'] as const,
  listByTeam: (teamId: string) => [...teamInvitationKeys.lists(), 'team', teamId] as const,
  details: () => [...teamInvitationKeys.all, 'detail'] as const,
  detail: (invitationId: string) => [...teamInvitationKeys.details(), invitationId] as const,
};

// Get team invitations
export function useTeamInvitations(teamId?: string) {
  return useQuery({
    queryKey: teamId ? teamInvitationKeys.listByTeam(teamId) : teamInvitationKeys.lists(),
    queryFn: async (): Promise<TeamInvitation[]> => {
      if (!teamId) return [];
      const resp = await api.get<TeamInvitationListResponse>(endpoints.teamInvitations(teamId));
      return resp.data.invitations;
    },
    enabled: !!teamId,
  });
}

// Get single invitation
export function useTeamInvitation(invitationId?: string) {
  return useQuery({
    queryKey: invitationId ? teamInvitationKeys.detail(invitationId) : teamInvitationKeys.details(),
    queryFn: async (): Promise<TeamInvitation> => {
      const resp = await api.get<TeamInvitation>(endpoints.teamInvitationById(invitationId!));
      return resp.data;
    },
    enabled: !!invitationId,
  });
}

// Send team invitation
export function useSendTeamInvitation(teamId: string) {
  const qc = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: InviteMemberForm): Promise<TeamInvitation> => {
      const resp = await api.post<TeamInvitation>(endpoints.sendTeamInvitation(teamId), data);
      return resp.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: teamInvitationKeys.listByTeam(teamId) });
      toast.success('Invitation sent successfully!', {
        description: 'The invitation has been sent to the recipient.',
        duration: 3000,
      });
    },
    onError: (error) => {
      toast.error('Failed to send invitation', {
        description: error instanceof Error ? error.message : 'Please try again later.',
        duration: 4000,
      });
    },
  });
}

// Resend team invitation
export function useResendTeamInvitation(teamId: string, invitationId: string) {
  const qc = useQueryClient();
  
  return useMutation({
    mutationFn: async (): Promise<TeamInvitation> => {
      const resp = await api.post<TeamInvitation>(endpoints.resendTeamInvitation(invitationId));
      return resp.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: teamInvitationKeys.listByTeam(teamId) });
      qc.invalidateQueries({ queryKey: teamInvitationKeys.detail(invitationId) });
      toast.success('Invitation resent successfully!', {
        description: 'The invitation has been resent with a new expiration date.',
        duration: 3000,
      });
    },
    onError: (error) => {
      toast.error('Failed to resend invitation', {
        description: error instanceof Error ? error.message : 'Please try again later.',
        duration: 4000,
      });
    },
  });
}

// Cancel team invitation
export function useCancelTeamInvitation(teamId: string, invitationId: string) {
  const qc = useQueryClient();
  
  return useMutation({
    mutationFn: async (): Promise<boolean> => {
      const resp = await api.delete<boolean>(endpoints.cancelTeamInvitation(invitationId));
      return resp.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: teamInvitationKeys.listByTeam(teamId) });
      qc.invalidateQueries({ queryKey: teamInvitationKeys.detail(invitationId) });
      toast.success('Invitation canceled successfully!', {
        description: 'The invitation has been canceled.',
        duration: 3000,
      });
    },
    onError: (error) => {
      toast.error('Failed to cancel invitation', {
        description: error instanceof Error ? error.message : 'Please try again later.',
        duration: 4000,
      });
    },
  });
}

// Accept team invitation
export function useAcceptTeamInvitation() {
  const qc = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { invitationId: string; token: string }): Promise<boolean> => {
      const resp = await api.post<boolean>(endpoints.acceptTeamInvitation(data.invitationId), {
        token: data.token,
      });
      return resp.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: teamInvitationKeys.all });
      toast.success('Invitation accepted successfully!', {
        description: 'You have joined the team.',
        duration: 3000,
      });
    },
    onError: (error) => {
      toast.error('Failed to accept invitation', {
        description: error instanceof Error ? error.message : 'Please try again later.',
        duration: 4000,
      });
    },
  });
}

// Reject team invitation
export function useRejectTeamInvitation() {
  const qc = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { invitationId: string }): Promise<boolean> => {
      const resp = await api.post<boolean>(endpoints.rejectTeamInvitation(data.invitationId));
      return resp.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: teamInvitationKeys.all });
      toast.success('Invitation rejected', {
        description: 'You have declined the team invitation.',
        duration: 3000,
      });
    },
    onError: (error) => {
      toast.error('Failed to reject invitation', {
        description: error instanceof Error ? error.message : 'Please try again later.',
        duration: 4000,
      });
    },
  });
}

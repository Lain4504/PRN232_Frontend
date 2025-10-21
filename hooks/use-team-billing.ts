// Team Billing Hooks
// Based on Story 3.3 requirements

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, endpoints } from '@/lib/api';
import { TeamBilling, UpdateTeamBillingFormData } from '@/lib/types/teams';
import { toast } from 'sonner';

// Query Keys
export const teamBillingKeys = {
  all: ['team-billing'] as const,
  details: () => [...teamBillingKeys.all, 'detail'] as const,
  detail: (teamId: string) => [...teamBillingKeys.details(), teamId] as const,
  invoices: (teamId: string) => [...teamBillingKeys.detail(teamId), 'invoices'] as const,
};

// Get team billing information
export function useTeamBilling(teamId?: string) {
  return useQuery({
    queryKey: teamId ? teamBillingKeys.detail(teamId) : teamBillingKeys.details(),
    queryFn: async (): Promise<TeamBilling> => {
      const resp = await api.get<TeamBilling>(endpoints.teamBilling(teamId!));
      return resp.data;
    },
    enabled: !!teamId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get team invoices
export function useTeamInvoices(teamId?: string) {
  return useQuery({
    queryKey: teamId ? teamBillingKeys.invoices(teamId) : teamBillingKeys.details(),
    queryFn: async (): Promise<any[]> => {
      if (!teamId) return [];
      const resp = await api.get<any[]>(endpoints.teamInvoices(teamId));
      return resp.data;
    },
    enabled: !!teamId,
  });
}

// Update team billing plan
export function useUpdateTeamBilling(teamId: string) {
  const qc = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UpdateTeamBillingFormData): Promise<TeamBilling> => {
      const resp = await api.put<TeamBilling>(endpoints.updateTeamBilling(teamId), data);
      return resp.data;
    },
    onSuccess: (updatedBilling) => {
      qc.invalidateQueries({ queryKey: teamBillingKeys.detail(teamId) });
      qc.invalidateQueries({ queryKey: teamBillingKeys.invoices(teamId) });
      toast.success('Billing plan updated successfully!', {
        description: 'Your team billing has been updated.',
        duration: 3000,
      });
    },
    onError: (error) => {
      toast.error('Failed to update billing plan', {
        description: error instanceof Error ? error.message : 'Please try again later.',
        duration: 4000,
      });
    },
  });
}

// Cancel team subscription
export function useCancelTeamSubscription(teamId: string) {
  const qc = useQueryClient();
  
  return useMutation({
    mutationFn: async (): Promise<boolean> => {
      const resp = await api.post<boolean>(endpoints.cancelTeamSubscription(teamId));
      return resp.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: teamBillingKeys.detail(teamId) });
      qc.invalidateQueries({ queryKey: teamBillingKeys.invoices(teamId) });
      toast.success('Subscription canceled successfully!', {
        description: 'Your team subscription has been canceled.',
        duration: 3000,
      });
    },
    onError: (error) => {
      toast.error('Failed to cancel subscription', {
        description: error instanceof Error ? error.message : 'Please try again later.',
        duration: 4000,
      });
    },
  });
}

// Reactivate team subscription
export function useReactivateTeamSubscription(teamId: string) {
  const qc = useQueryClient();
  
  return useMutation({
    mutationFn: async (): Promise<boolean> => {
      const resp = await api.post<boolean>(endpoints.reactivateTeamSubscription(teamId));
      return resp.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: teamBillingKeys.detail(teamId) });
      qc.invalidateQueries({ queryKey: teamBillingKeys.invoices(teamId) });
      toast.success('Subscription reactivated successfully!', {
        description: 'Your team subscription has been reactivated.',
        duration: 3000,
      });
    },
    onError: (error) => {
      toast.error('Failed to reactivate subscription', {
        description: error instanceof Error ? error.message : 'Please try again later.',
        duration: 4000,
      });
    },
  });
}

// Download team invoice
export function useDownloadTeamInvoice() {
  return useMutation({
    mutationFn: async (invoiceId: string): Promise<Blob> => {
      const resp = await api.get<Blob>(endpoints.downloadTeamInvoice(invoiceId), {
        responseType: 'blob',
      });
      return resp.data;
    },
    onSuccess: (blob, invoiceId) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Invoice downloaded successfully!', {
        description: 'Your invoice has been downloaded.',
        duration: 2000,
      });
    },
    onError: (error) => {
      toast.error('Failed to download invoice', {
        description: error instanceof Error ? error.message : 'Please try again later.',
        duration: 4000,
      });
    },
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, endpoints } from '@/lib/api';
import { AdCampaignResponse, CreateAdCampaignRequest, UpdateAdCampaignRequest, CampaignListParams } from '@/lib/types/campaigns';
import { PaginatedResponse } from '@/lib/api';
import { toast } from 'sonner';

// Query keys
export const campaignKeys = {
  all: ['campaigns'] as const,
  lists: () => [...campaignKeys.all, 'list'] as const,
  list: (params: CampaignListParams) => [...campaignKeys.lists(), params] as const,
  details: () => [...campaignKeys.all, 'detail'] as const,
  detail: (id: string) => [...campaignKeys.details(), id] as const,
};

// Get campaigns list
export function useCampaigns(params: CampaignListParams = {}) {
  return useQuery({
    queryKey: campaignKeys.list(params),
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<AdCampaignResponse>>(
        endpoints.campaigns({
          brandId: params.brandId,
          page: params.page || 1,
          pageSize: params.pageSize || 20,
        })
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get single campaign
export function useCampaign(campaignId: string) {
  return useQuery({
    queryKey: campaignKeys.detail(campaignId),
    queryFn: async () => {
      const response = await api.get<AdCampaignResponse>(
        endpoints.campaignById(campaignId)
      );
      return response.data;
    },
    enabled: !!campaignId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Create campaign mutation
export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAdCampaignRequest) => {
      const response = await api.post<AdCampaignResponse>(
        endpoints.createCampaign(),
        data
      );
      return response.data;
    },
    onSuccess: (newCampaign) => {
      // Invalidate and refetch campaigns list
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
      
      // Add the new campaign to the cache
      queryClient.setQueryData(
        campaignKeys.detail(newCampaign.id),
        newCampaign
      );

      toast.success('Campaign created successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to create campaign:', error);
      toast.error('Failed to create campaign');
    },
  });
}

// Update campaign mutation
export function useUpdateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateAdCampaignRequest) => {
      const response = await api.put<AdCampaignResponse>(
        endpoints.updateCampaign(id),
        data
      );
      return response.data;
    },
    onSuccess: (updatedCampaign) => {
      // Update the campaign in the cache
      queryClient.setQueryData(
        campaignKeys.detail(updatedCampaign.id),
        updatedCampaign
      );

      // Invalidate campaigns list to refetch
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });

      toast.success('Campaign updated successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to update campaign:', error);
      toast.error('Failed to update campaign');
    },
  });
}

// Delete campaign mutation
export function useDeleteCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignId: string) => {
      await api.delete(endpoints.deleteCampaign(campaignId));
      return campaignId;
    },
    onSuccess: (deletedCampaignId) => {
      // Remove the campaign from the cache
      queryClient.removeQueries({ queryKey: campaignKeys.detail(deletedCampaignId) });

      // Invalidate campaigns list to refetch
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });

      toast.success('Campaign deleted successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to delete campaign:', error);
      toast.error('Failed to delete campaign');
    },
  });
}

// Prefetch campaign
export function usePrefetchCampaign() {
  const queryClient = useQueryClient();

  return (campaignId: string) => {
    queryClient.prefetchQuery({
      queryKey: campaignKeys.detail(campaignId),
      queryFn: async () => {
        const response = await api.get<AdCampaignResponse>(
          endpoints.campaignById(campaignId)
        );
        return response.data;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };
}

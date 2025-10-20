import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, endpoints } from '@/lib/api';
import type { 
  AdSetResponse, 
  CreateAdSetRequest, 
  UpdateAdSetRequest, 
  AdSetListParams 
} from '@/lib/types/ad-sets';
import type { PaginatedResponse } from '@/lib/api';

// Query keys
export const adSetKeys = {
  all: ['ad-sets'] as const,
  lists: () => [...adSetKeys.all, 'list'] as const,
  list: (params: AdSetListParams) => [...adSetKeys.lists(), params] as const,
  details: () => [...adSetKeys.all, 'detail'] as const,
  detail: (id: string) => [...adSetKeys.details(), id] as const,
};

// Get ad sets list
export function useAdSets(params: AdSetListParams) {
  return useQuery({
    queryKey: adSetKeys.list(params),
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<AdSetResponse>>(
        endpoints.adSets(params)
      );
      return response.data;
    },
    enabled: !!params.campaignId,
  });
}

// Get single ad set
export function useAdSet(adSetId: string) {
  return useQuery({
    queryKey: adSetKeys.detail(adSetId),
    queryFn: async () => {
      const response = await api.get<AdSetResponse>(
        endpoints.adSetById(adSetId)
      );
      return response.data;
    },
    enabled: !!adSetId,
  });
}

// Create ad set mutation
export function useCreateAdSet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAdSetRequest) => {
      const response = await api.post<AdSetResponse>(
        endpoints.createAdSet(),
        data
      );
      return response.data;
    },
    onSuccess: (newAdSet) => {
      // Invalidate and refetch ad sets lists
      queryClient.invalidateQueries({ queryKey: adSetKeys.lists() });
      
      // Add the new ad set to the cache
      queryClient.setQueryData(
        adSetKeys.detail(newAdSet.id),
        newAdSet
      );
    },
  });
}

// Update ad set mutation
export function useUpdateAdSet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateAdSetRequest) => {
      const response = await api.put<AdSetResponse>(
        endpoints.updateAdSet(data.id),
        data
      );
      return response.data;
    },
    onSuccess: (updatedAdSet) => {
      // Update the ad set in cache
      queryClient.setQueryData(
        adSetKeys.detail(updatedAdSet.id),
        updatedAdSet
      );
      
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: adSetKeys.lists() });
    },
  });
}

// Delete ad set mutation
export function useDeleteAdSet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (adSetId: string) => {
      const response = await api.delete<{ success: boolean }>(
        endpoints.deleteAdSet(adSetId)
      );
      return response.data;
    },
    onSuccess: (_, adSetId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: adSetKeys.detail(adSetId) });
      
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: adSetKeys.lists() });
    },
  });
}

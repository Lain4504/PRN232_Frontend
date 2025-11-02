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
      // Backend returns array (no pagination) for campaign listing
      const response = await api.get<AdSetResponse[]>(
        endpoints.adSetsByCampaign(params.campaignId as string)
      );
      const items = response.data || [];
      // Simulate pagination client-side for consistent UI
      const page = params.page ?? 1;
      const pageSize = params.pageSize ?? items.length;
      const start = (page - 1) * pageSize;
      const slice = items.slice(start, start + pageSize);
      return {
        data: slice,
        totalCount: items.length,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(items.length / pageSize)),
        hasNextPage: start + pageSize < items.length,
        hasPreviousPage: page > 1,
      } as unknown as PaginatedResponse<AdSetResponse>;
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
      // Transform frontend shape -> backend DTO
      const targetingPayload: Record<string, unknown> = {};
      const ageMin = data.targeting?.ageRange?.min;
      const ageMax = data.targeting?.ageRange?.max;
      if (typeof ageMin === 'number') targetingPayload["age_min"] = ageMin;
      if (typeof ageMax === 'number') targetingPayload["age_max"] = Math.max(ageMax, 18);

      // genders: 1=male, 2=female
      const genders: number[] = [];
      if (data.targeting?.gender?.male) genders.push(1);
      if (data.targeting?.gender?.female) genders.push(2);
      if (genders.length > 0) targetingPayload["genders"] = genders;

      // locations -> geo_locations.countries (expect ISO-2 if provided)
      const countries = (data.targeting?.locations || [])
        .map(l => (l.country || '').trim())
        .filter(Boolean);
      if (countries.length > 0) {
        targetingPayload["geo_locations"] = { countries };
      }

      const backendBody = {
        campaignId: data.campaignId,
        name: data.name,
        targeting: JSON.stringify(targetingPayload),
        dailyBudget: data.budget,
        startDate: data.schedule?.startDate && data.schedule.startDate.length > 0 ? new Date(data.schedule.startDate) : null,
        endDate: data.schedule?.endDate && data.schedule.endDate.length > 0 ? new Date(data.schedule.endDate) : null,
      } as unknown as Record<string, unknown>;

      const response = await api.post<AdSetResponse>(
        endpoints.createAdSet(),
        backendBody
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
      // Transform only fields provided
      const targetingPayload: Record<string, unknown> = {};
      if (data.targeting?.ageRange?.min !== undefined) targetingPayload["age_min"] = data.targeting.ageRange.min;
      if (data.targeting?.ageRange?.max !== undefined) targetingPayload["age_max"] = Math.max(data.targeting.ageRange.max, 18);
      const genders: number[] = [];
      if (data.targeting?.gender?.male) genders.push(1);
      if (data.targeting?.gender?.female) genders.push(2);
      if (genders.length > 0) targetingPayload["genders"] = genders;
      if (data.targeting?.locations) {
        const countries = data.targeting.locations.map(l => (l.country || '').trim()).filter(Boolean);
        if (countries.length > 0) targetingPayload["geo_locations"] = { countries };
      }

      const backendBody: Record<string, unknown> = {
        ...(data.campaignId ? { campaignId: data.campaignId } : {}),
        ...(data.name ? { name: data.name } : {}),
        ...(Object.keys(targetingPayload).length > 0 ? { targeting: JSON.stringify(targetingPayload) } : {}),
        ...(data.budget !== undefined ? { dailyBudget: data.budget } : {}),
        ...(data.schedule?.startDate ? { startDate: new Date(data.schedule.startDate) } : {}),
        ...(data.schedule?.endDate ? { endDate: new Date(data.schedule.endDate) } : {}),
      };

      const response = await api.put<AdSetResponse>(
        endpoints.updateAdSet(data.id),
        backendBody
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

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, endpoints, type PaginatedResponse } from "@/lib/api";
import type { AdResponse, CreateAdRequest, UpdateAdRequest, UpdateAdStatusRequest } from "@/lib/types/ads";

export function useAds(params: { campaignId?: string; brandId?: string; page?: number; pageSize?: number; status?: string }) {
  return useQuery({
    queryKey: ["ads", params],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<AdResponse>>(endpoints.ads({
        campaignId: params.campaignId,
        brandId: params.brandId,
        status: params.status,
        page: params.page,
        pageSize: params.pageSize,
      }));
      return res.data;
    },
  });
}

export function useAd(adId: string) {
  return useQuery({
    queryKey: ["ad", adId],
    queryFn: async () => {
      const res = await api.get<AdResponse>(endpoints.adById(adId));
      return res.data;
    },
    enabled: !!adId,
  });
}

export function useCreateAd() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateAdRequest) => {
      const res = await api.post<AdResponse>(endpoints.createAd(), payload);
      return res.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["ads", { adSetId: variables.adSetId }] });
    },
  });
}

export function useUpdateAd(adId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateAdRequest) => {
      const res = await api.put<AdResponse>(endpoints.updateAd(adId), payload);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ad", adId] });
    },
  });
}

export function useDeleteAd(adId: string, adSetId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.delete<boolean>(endpoints.deleteAd(adId));
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ads"] });
    },
  });
}

export function useUpdateAdStatus(adId: string, adSetId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateAdStatusRequest) => {
      const res = await api.put<AdResponse>(endpoints.adStatus(adId), payload);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ad", adId] });
      qc.invalidateQueries({ queryKey: ["ads"] });
    },
  });
}

export function useBulkUpdateAdStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { adIds: string[]; status: string }) => {
      // Backend has no bulk endpoint; perform fan-out updates
      const results = await Promise.allSettled(
        payload.adIds.map((id) => api.put<AdResponse>(endpoints.adStatus(id), { adId: id, status: payload.status }))
      );
      const allOk = results.every(r => r.status === 'fulfilled');
      if (!allOk) throw new Error('Some ads failed to update');
      return true as unknown as boolean;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["ads"] });
    },
  });
}

// Ad preview hook
export function useAdPreview(adId: string, adFormat: string = 'DESKTOP_FEED_STANDARD') {
  return useQuery({
    queryKey: ["ad-preview", adId, adFormat],
    queryFn: async () => {
      const res = await api.get<string>(endpoints.adPreview(adId, adFormat));
      return res.data; // iframe HTML
    },
    enabled: !!adId,
  });
}



import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, endpoints, type PaginatedResponse } from "@/lib/api";
import type { AdResponse, CreateAdRequest, UpdateAdRequest, UpdateAdStatusRequest, BulkUpdateAdStatusRequest } from "@/lib/types/ads";

export function useAds(params: { adSetId: string; page?: number; pageSize?: number; status?: string }) {
  return useQuery({
    queryKey: ["ads", params],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<AdResponse>>(endpoints.ads({
        adSetId: params.adSetId,
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
      qc.invalidateQueries({ queryKey: ["ads", { adSetId }] });
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
      if (adSetId) qc.invalidateQueries({ queryKey: ["ads", { adSetId }] });
    },
  });
}

export function useBulkUpdateAdStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: BulkUpdateAdStatusRequest) => {
      const res = await api.put<boolean>(endpoints.bulkAdStatus(), payload);
      return res.data;
    },
    onSuccess: (_data, variables) => {
      // invalidate any list keyed by this adSetId
      const adSetId = variables.adIds[0];
      qc.invalidateQueries({ queryKey: ["ads"] });
    },
  });
}



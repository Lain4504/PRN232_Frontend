import { useQuery } from '@tanstack/react-query';
import { api, endpoints } from '@/lib/api';
import type { AdCreativeResponse } from '@/lib/types/creatives';
import { creativeKeys } from './use-creatives';

// Get single creative with detailed information
export function useCreative(creativeId: string) {
  return useQuery({
    queryKey: creativeKeys.detail(creativeId),
    queryFn: async () => {
      const response = await api.get<AdCreativeResponse>(
        endpoints.creativeById(creativeId)
      );
      return response.data;
    },
    enabled: !!creativeId,
  });
}

// Get creative with usage information
export function useCreativeWithUsage(creativeId: string) {
  return useQuery({
    queryKey: [...creativeKeys.detail(creativeId), 'usage'],
    queryFn: async () => {
      const response = await api.get<AdCreativeResponse & { usage: Record<string, unknown> }>(
        `${endpoints.creativeById(creativeId)}?includeUsage=true`
      );
      return response.data;
    },
    enabled: !!creativeId,
  });
}

// Get preview iframe HTML for a creative
export function useCreativePreview(creativeId: string, adFormat: string = 'DESKTOP_FEED_STANDARD') {
  return useQuery({
    queryKey: [...creativeKeys.detail(creativeId), 'preview', adFormat],
    queryFn: async () => {
      const resp = await api.get<string>(endpoints.creativePreview(creativeId, adFormat));
      return resp.data; // HTML string containing <iframe ...>
    },
    enabled: !!creativeId,
  });
}

// Get creative by contentId
export function useCreativeByContent(contentId?: string) {
  return useQuery({
    queryKey: ['creative-by-content', contentId],
    queryFn: async () => {
      const resp = await api.get<AdCreativeResponse>(endpoints.creativeByContent(contentId!));
      return resp.data;
    },
    enabled: !!contentId,
  });
}
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
      const response = await api.get<AdCreativeResponse & { usage: any }>(
        `${endpoints.creativeById(creativeId)}?includeUsage=true`
      );
      return response.data;
    },
    enabled: !!creativeId,
  });
}

import { useMemo } from 'react';
import { useContents } from './use-contents';
import type { ContentFilters, ContentStatusEnum, AdTypeEnum } from '@/lib/types/aisam-types';

interface UseContentsByBrandOptions {
  brandId?: string;
  searchTerm?: string;
  status?: ContentStatusEnum;
  adType?: AdTypeEnum;
  page?: number;
  pageSize?: number;
}

export function useContentsByBrandFilter(options: UseContentsByBrandOptions = {}) {
  const {
    brandId,
    searchTerm,
    status,
    adType,
    page = 1,
    pageSize = 50
  } = options;

  const filters: ContentFilters = useMemo(() => ({
    brandId: brandId || undefined,
    searchTerm: searchTerm || undefined,
    status: status || undefined,
    adType: adType || undefined,
    page,
    pageSize,
    sortBy: "createdAt",
    sortDescending: true,
  }), [brandId, searchTerm, status, adType, page, pageSize]);

  const result = useContents(filters);

  return {
    ...result,
    filters,
    // Helper to check if brand filter is active
    isBrandFiltered: !!brandId,
    // Helper to get the current query string for debugging
    queryString: useMemo(() => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.set(key, String(value));
        }
      });
      return params.toString();
    }, [filters])
  };
}
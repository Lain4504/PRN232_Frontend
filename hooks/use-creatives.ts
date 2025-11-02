import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, endpoints } from '@/lib/api';
import type {
  AdCreativeResponse,
  CreateAdCreativeRequest,
  UpdateAdCreativeRequest,
  CreativeListParams,
  CreateAdCreativeFromContentRequest,
  CreateAdCreativeFromFacebookPostRequest,
  FacebookPostDetails,
} from '@/lib/types/creatives';
import type { PaginatedResponse } from '@/lib/api';

// Query keys
export const creativeKeys = {
  all: ['creatives'] as const,
  lists: () => [...creativeKeys.all, 'list'] as const,
  list: (params: CreativeListParams) => [...creativeKeys.lists(), params] as const,
  details: () => [...creativeKeys.all, 'detail'] as const,
  detail: (id: string) => [...creativeKeys.details(), id] as const,
};

// Get creatives list
export function useCreatives(params: CreativeListParams) {
  return useQuery({
    queryKey: creativeKeys.list(params),
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<AdCreativeResponse>>(
        endpoints.creatives(params)
      );
      return response.data;
    },
    enabled: !!params.adSetId,
  });
}

// Get single creative
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

// Create creative mutation
export function useCreateCreative() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAdCreativeFromContentRequest) => {
      const response = await api.post<AdCreativeResponse>(
        endpoints.createCreativeFromContent(),
        data
      );
      return response.data;
    },
    onSuccess: (newCreative) => {
      // Invalidate and refetch creatives lists
      queryClient.invalidateQueries({ queryKey: creativeKeys.lists() });
      
      // Add the new creative to the cache
      queryClient.setQueryData(
        creativeKeys.detail(newCreative.id),
        newCreative
      );
    },
  });
}

// Create creative from Facebook Post
export function useCreateCreativeFromFacebookPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateAdCreativeFromFacebookPostRequest) => {
      const response = await api.post<AdCreativeResponse>(
        endpoints.createCreativeFromFacebookPost(),
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: creativeKeys.lists() });
    },
  });
}

// Update creative mutation
export function useUpdateCreative() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateAdCreativeRequest) => {
      const formData = new FormData();
      formData.append('id', data.id);
      
      if (data.name) {
        formData.append('name', data.name);
      }
      
      if (data.type) {
        formData.append('type', data.type);
      }
      
      if (data.content !== undefined) {
        formData.append('content', data.content || '');
      }
      
      if (data.mediaFile) {
        formData.append('mediaFile', data.mediaFile);
      }
      
      if (data.tags) {
        formData.append('tags', JSON.stringify(data.tags));
      }
      
      if (data.isActive !== undefined) {
        formData.append('isActive', data.isActive.toString());
      }

      const response = await api.putMultipart<AdCreativeResponse>(
        endpoints.updateCreative(data.id),
        formData
      );
      return response.data;
    },
    onSuccess: (updatedCreative) => {
      // Update the creative in cache
      queryClient.setQueryData(
        creativeKeys.detail(updatedCreative.id),
        updatedCreative
      );
      
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: creativeKeys.lists() });
    },
  });
}

// Delete creative mutation
export function useDeleteCreative() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (creativeId: string) => {
      const response = await api.delete<{ success: boolean }>(
        endpoints.deleteCreative(creativeId)
      );
      return response.data;
    },
    onSuccess: (_, creativeId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: creativeKeys.detail(creativeId) });
      
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: creativeKeys.lists() });
    },
  });
}

// Toggle creative active status
export function useToggleCreativeStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ creativeId, isActive }: { creativeId: string; isActive: boolean }) => {
      const response = await api.put<AdCreativeResponse>(
        endpoints.updateCreative(creativeId),
        { isActive }
      );
      return response.data;
    },
    onSuccess: (updatedCreative) => {
      // Update the creative in cache
      queryClient.setQueryData(
        creativeKeys.detail(updatedCreative.id),
        updatedCreative
      );
      
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: creativeKeys.lists() });
    },
  });
}

// Get Facebook posts
export function useFacebookPosts(brandId?: string, pageId?: string, limit: number = 50) {
  return useQuery({
    queryKey: ['facebook-posts', brandId, pageId, limit],
    queryFn: async () => {
      const response = await api.get<FacebookPostDetails[]>(
        endpoints.facebookPosts({ brandId, pageId, limit })
      );
      return response.data;
    },
    enabled: !!brandId,
  });
}

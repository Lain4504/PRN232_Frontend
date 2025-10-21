import { useMutation } from '@tanstack/react-query';
import { api, endpoints } from '@/lib/api';
import { AIChatRequest, AIChatResponse, AIChatError, AdTypes } from '@/lib/types/aisam-types';

export { AdTypes };
export type { AIChatRequest, AIChatResponse, AIChatError };

export function useAIChat() {
  return useMutation<AIChatResponse, AIChatError, AIChatRequest>({
    mutationFn: async (requestData: AIChatRequest): Promise<AIChatResponse> => {
      const response = await api.post<AIChatResponse['data']>(endpoints.aiChat(), requestData);
      return {
        success: response.success,
        message: response.message,
        statusCode: response.statusCode,
        data: response.data,
        timestamp: response.timestamp,
        error: response.error ? {
          errorCode: 'API_ERROR',
          errorMessage: response.error,
        } : undefined,
      };
    },
    onError: (error) => {
      console.error('AI Chat error:', error);
    },
  });
}
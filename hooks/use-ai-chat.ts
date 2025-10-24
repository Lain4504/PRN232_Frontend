import { useMutation } from '@tanstack/react-query';
import { api, endpoints } from '@/lib/api';
import { AIChatRequest, AIChatResponse, AIChatError, AdTypes } from '@/lib/types/aisam-types';
import { useCanUseAI } from './use-subscription';

export { AdTypes };
export type { AIChatRequest, AIChatResponse, AIChatError };

export function useAIChat() {
  const canUseAI = useCanUseAI();

  return useMutation<AIChatResponse, AIChatError, AIChatRequest>({
    mutationFn: async (requestData: AIChatRequest): Promise<AIChatResponse> => {
      // Check subscription status before making API call
      if (!canUseAI) {
        throw new Error('SUBSCRIPTION_REQUIRED');
      }

      const response = await api.post<AIChatResponse['data']>(endpoints.aiChat(), requestData);

      // Handle subscription-related errors from backend
      if (response.statusCode === 403 && response.error?.includes('subscription')) {
        throw new Error('SUBSCRIPTION_REQUIRED');
      }

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

      // Handle subscription errors specifically
      if (error instanceof Error && error.message === 'SUBSCRIPTION_REQUIRED') {
        // Error will be handled by the component using this hook
        return;
      }
    },
  });
}
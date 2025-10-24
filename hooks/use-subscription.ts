import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import {
  CreatePaymentIntentRequest,
  CreatePaymentIntentResponse,
  CreateSubscriptionRequest,
  SubscriptionResponseDto,
  PaymentResponseDto,
  UserSubscriptionStatus,
  ApiResponse
} from '@/lib/types/aisam-types';

const supabase = createClient();

// Get user subscription status
export function useSubscriptionStatus() {
  return useQuery({
    queryKey: ['subscription-status'],
    queryFn: async (): Promise<UserSubscriptionStatus> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No authentication token');
      }

      const response = await fetch('/api/payment/subscription-status', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subscription status');
      }

      const result: ApiResponse<UserSubscriptionStatus> = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch subscription status');
      }

      return result.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get user subscriptions history
export function useUserSubscriptions() {
  return useQuery({
    queryKey: ['user-subscriptions'],
    queryFn: async (): Promise<SubscriptionResponseDto[]> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No authentication token');
      }

      const response = await fetch('/api/payment/subscriptions', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subscriptions');
      }

      const result: ApiResponse<SubscriptionResponseDto[]> = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch subscriptions');
      }

      return result.data;
    },
  });
}

// Create payment intent
export function useCreatePaymentIntent() {
  return useMutation({
    mutationFn: async (request: CreatePaymentIntentRequest): Promise<CreatePaymentIntentResponse> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No authentication token');
      }

      const response = await fetch('/api/payment/create-payment-intent', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const result: ApiResponse<CreatePaymentIntentResponse> = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to create payment intent');
      }

      return result.data;
    },
  });
}

// Create subscription
export function useCreateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateSubscriptionRequest): Promise<SubscriptionResponseDto> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No authentication token');
      }

      const response = await fetch('/api/payment/subscription', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Failed to create subscription');
      }

      const result: ApiResponse<SubscriptionResponseDto> = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to create subscription');
      }

      return result.data;
    },
    onSuccess: () => {
      // Invalidate subscription-related queries
      queryClient.invalidateQueries({ queryKey: ['subscription-status'] });
      queryClient.invalidateQueries({ queryKey: ['user-subscriptions'] });
    },
  });
}

// Cancel subscription
export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subscriptionId: string): Promise<boolean> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`/api/payment/subscription/${subscriptionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      const result: ApiResponse<boolean> = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to cancel subscription');
      }

      return result.data;
    },
    onSuccess: () => {
      // Invalidate subscription-related queries
      queryClient.invalidateQueries({ queryKey: ['subscription-status'] });
      queryClient.invalidateQueries({ queryKey: ['user-subscriptions'] });
    },
  });
}

// Check if user can use AI features
export function useCanUseAI() {
  const { data: subscriptionStatus } = useSubscriptionStatus();
  return subscriptionStatus?.canUseAI ?? false;
}

// Get AI usage stats
export function useAIUsageStats() {
  const { data: subscriptionStatus } = useSubscriptionStatus();
  return {
    used: subscriptionStatus?.aiGenerationsUsed ?? 0,
    limit: subscriptionStatus?.aiGenerationsLimit ?? 0,
    remaining: (subscriptionStatus?.aiGenerationsLimit ?? 0) - (subscriptionStatus?.aiGenerationsUsed ?? 0),
  };
}
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { 
  Payment, 
  PaymentFormData, 
  PaymentMethod, 
  PaymentProcessingResult,
  PaymentError 
} from '@/lib/types/payments';
import { 
  simulatePaymentProcessing, 
  getPaymentErrorMessage,
  createPaymentError,
  PAYMENT_ERROR_CODES 
} from '@/lib/utils/payments';
import { api } from '@/lib/api';

// Mock data for development
const mockPayments: Payment[] = [
  {
    id: 'pay_1',
    amount: 29.99,
    currency: 'USD',
    status: 'succeeded',
    method: {
      id: 'pm_1',
      type: 'card',
      last4: '4242',
      brand: 'visa',
      expiry: '12/25',
      isDefault: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    date: '2024-01-15T10:30:00Z',
    description: 'Monthly subscription',
    reference: 'sub_123',
    invoiceId: 'inv_1',
  },
  {
    id: 'pay_2',
    amount: 15.00,
    currency: 'USD',
    status: 'failed',
    method: {
      id: 'pm_1',
      type: 'card',
      last4: '4242',
      brand: 'visa',
      expiry: '12/25',
      isDefault: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    date: '2024-01-10T14:20:00Z',
    description: 'Failed payment attempt',
    reference: 'sub_124',
  },
];

const mockPaymentMethods: PaymentMethod[] = [
  {
    id: 'pm_1',
    type: 'card',
    last4: '4242',
    brand: 'visa',
    expiry: '12/25',
    isDefault: true,
    billingAddress: {
      line1: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94105',
      country: 'US',
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'pm_2',
    type: 'card',
    last4: '5555',
    brand: 'mastercard',
    expiry: '06/26',
    isDefault: false,
    billingAddress: {
      line1: '456 Oak Ave',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'US',
    },
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
];

// Query keys
const paymentKeys = {
  all: ['payments'] as const,
  lists: () => [...paymentKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...paymentKeys.lists(), { filters }] as const,
  details: () => [...paymentKeys.all, 'detail'] as const,
  detail: (id: string) => [...paymentKeys.details(), id] as const,
  methods: () => [...paymentKeys.all, 'methods'] as const,
  method: (id: string) => [...paymentKeys.methods(), id] as const,
};

// Payment queries
export function usePayments(filters?: Record<string, any>) {
  return useQuery({
    queryKey: paymentKeys.list(filters || {}),
    queryFn: async () => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockPayments;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePayment(id: string) {
  return useQuery({
    queryKey: paymentKeys.detail(id),
    queryFn: async () => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockPayments.find(payment => payment.id === id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePaymentMethods() {
  return useQuery({
    queryKey: paymentKeys.methods(),
    queryFn: async () => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockPaymentMethods;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function usePaymentMethod(id: string) {
  return useQuery({
    queryKey: paymentKeys.method(id),
    queryFn: async () => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockPaymentMethods.find(method => method.id === id);
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
}

// Payment mutations
export function useCreatePayment() {
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  return useMutation({
    mutationFn: async (data: PaymentFormData): Promise<PaymentProcessingResult> => {
      setIsProcessing(true);
      
      try {
        // Simulate payment processing
        const result = await simulatePaymentProcessing();
        
        if (result.success) {
          // Mock successful payment creation
          const newPayment: Payment = {
            id: result.paymentId!,
            amount: data.amount,
            currency: data.currency,
            status: 'succeeded',
            method: mockPaymentMethods.find(m => m.id === data.paymentMethodId) || mockPaymentMethods[0],
            date: new Date().toISOString(),
            description: data.description || 'Payment',
            reference: `ref_${Date.now()}`,
            metadata: data.metadata,
          };
          
          // Update cache
          queryClient.setQueryData(paymentKeys.lists(), (old: Payment[] = []) => [newPayment, ...old]);
          
          toast.success('Payment processed successfully');
        } else {
          toast.error(getPaymentErrorMessage(result.error!));
        }
        
        return result;
      } catch (error) {
        const paymentError = createPaymentError(
          PAYMENT_ERROR_CODES.PROCESSING_ERROR,
          'An unexpected error occurred'
        );
        toast.error(getPaymentErrorMessage(paymentError));
        return { success: false, error: paymentError };
      } finally {
        setIsProcessing(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
    },
  });
}

export function useRetryPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ paymentId, paymentMethodId }: { paymentId: string; paymentMethodId?: string }) => {
      // Mock retry logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = await simulatePaymentProcessing();
      
      if (result.success) {
        // Update payment status in cache
        queryClient.setQueryData(paymentKeys.lists(), (old: Payment[] = []) => 
          old.map(payment => 
            payment.id === paymentId 
              ? { ...payment, status: 'succeeded' as const }
              : payment
          )
        );
        
        toast.success('Payment retry successful');
      } else {
        toast.error(getPaymentErrorMessage(result.error!));
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
    },
  });
}

export function useAddPaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<PaymentMethod>) => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newMethod: PaymentMethod = {
        id: `pm_${Date.now()}`,
        type: data.type || 'card',
        last4: data.last4 || '0000',
        brand: data.brand || 'visa',
        expiry: data.expiry || '12/25',
        isDefault: data.isDefault || false,
        billingAddress: data.billingAddress,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Update cache
      queryClient.setQueryData(paymentKeys.methods(), (old: PaymentMethod[] = []) => [newMethod, ...old]);
      
      toast.success('Payment method added successfully');
      return newMethod;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.methods() });
    },
  });
}

export function useRemovePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update cache
      queryClient.setQueryData(paymentKeys.methods(), (old: PaymentMethod[] = []) => 
        old.filter(method => method.id !== id)
      );
      
      toast.success('Payment method removed successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.methods() });
    },
  });
}

export function useSetDefaultPaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update cache
      queryClient.setQueryData(paymentKeys.methods(), (old: PaymentMethod[] = []) => 
        old.map(method => ({
          ...method,
          isDefault: method.id === id
        }))
      );
      
      toast.success('Default payment method updated');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.methods() });
    },
  });
}

// Utility hooks
export function usePaymentProcessing() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');

  const startProcessing = (step: string) => {
    setIsProcessing(true);
    setProcessingStep(step);
  };

  const stopProcessing = () => {
    setIsProcessing(false);
    setProcessingStep('');
  };

  return {
    isProcessing,
    processingStep,
    startProcessing,
    stopProcessing,
  };
}

export function usePaymentFilters() {
  const [filters, setFilters] = useState<Record<string, any>>({});

  const updateFilter = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return {
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
  };
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { 
  BillingInfo, 
  BillingInfoFormData, 
  Invoice, 
  Transaction,
  PaymentNotification 
} from '@/lib/types/payments';
import { api } from '@/lib/api';

// Mock data for development
const mockBillingInfo: BillingInfo = {
  address: {
    line1: '123 Main St',
    line2: 'Suite 100',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94105',
    country: 'US',
  },
  taxId: '12-3456789',
  company: 'Acme Corp',
  contactInfo: {
    email: 'billing@acme.com',
    phone: '+1 (555) 123-4567',
    name: 'John Doe',
  },
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockInvoices: Invoice[] = [
  {
    id: 'inv_1',
    number: 'INV-2024-001',
    amount: 29.99,
    currency: 'USD',
    status: 'paid',
    date: '2024-01-01T00:00:00Z',
    dueDate: '2024-01-31T00:00:00Z',
    items: [
      {
        id: 'item_1',
        description: 'Monthly subscription',
        quantity: 1,
        unitPrice: 29.99,
        total: 29.99,
        type: 'subscription',
      },
    ],
    downloadUrl: '/api/invoices/inv_1/download',
    paymentId: 'pay_1',
  },
  {
    id: 'inv_2',
    number: 'INV-2024-002',
    amount: 15.00,
    currency: 'USD',
    status: 'open',
    date: '2024-02-01T00:00:00Z',
    dueDate: '2024-02-28T00:00:00Z',
    items: [
      {
        id: 'item_2',
        description: 'Additional usage',
        quantity: 1,
        unitPrice: 15.00,
        total: 15.00,
        type: 'usage',
      },
    ],
    downloadUrl: '/api/invoices/inv_2/download',
  },
];

const mockTransactions: Transaction[] = [
  {
    id: 'txn_1',
    type: 'payment',
    amount: 29.99,
    currency: 'USD',
    status: 'completed',
    date: '2024-01-15T10:30:00Z',
    description: 'Payment for invoice INV-2024-001',
    reference: 'pay_1',
    paymentId: 'pay_1',
  },
  {
    id: 'txn_2',
    type: 'refund',
    amount: -5.00,
    currency: 'USD',
    status: 'completed',
    date: '2024-01-20T14:20:00Z',
    description: 'Partial refund for overpayment',
    reference: 'ref_1',
    paymentId: 'pay_1',
  },
];

const mockNotifications: PaymentNotification[] = [
  {
    id: 'notif_1',
    type: 'payment_succeeded',
    title: 'Payment Successful',
    message: 'Your payment of $29.99 has been processed successfully.',
    paymentId: 'pay_1',
    isRead: false,
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 'notif_2',
    type: 'invoice_generated',
    title: 'New Invoice Available',
    message: 'Invoice INV-2024-002 is now available for download.',
    invoiceId: 'inv_2',
    isRead: false,
    createdAt: '2024-02-01T00:00:00Z',
  },
];

// Query keys
const billingKeys = {
  all: ['billing'] as const,
  info: () => [...billingKeys.all, 'info'] as const,
  invoices: () => [...billingKeys.all, 'invoices'] as const,
  invoice: (id: string) => [...billingKeys.invoices(), id] as const,
  transactions: () => [...billingKeys.all, 'transactions'] as const,
  transaction: (id: string) => [...billingKeys.transactions(), id] as const,
  notifications: () => [...billingKeys.all, 'notifications'] as const,
  notification: (id: string) => [...billingKeys.notifications(), id] as const,
};

// Billing queries
export function useBillingInfo() {
  return useQuery({
    queryKey: billingKeys.info(),
    queryFn: async () => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockBillingInfo;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useInvoices(filters?: Record<string, any>) {
  return useQuery({
    queryKey: [...billingKeys.invoices(), { filters }],
    queryFn: async () => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockInvoices;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: billingKeys.invoice(id),
    queryFn: async () => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockInvoices.find(invoice => invoice.id === id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTransactions(filters?: Record<string, any>) {
  return useQuery({
    queryKey: [...billingKeys.transactions(), { filters }],
    queryFn: async () => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockTransactions;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: billingKeys.transaction(id),
    queryFn: async () => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockTransactions.find(transaction => transaction.id === id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePaymentNotifications() {
  return useQuery({
    queryKey: billingKeys.notifications(),
    queryFn: async () => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockNotifications;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Billing mutations
export function useUpdateBillingInfo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BillingInfoFormData) => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedInfo: BillingInfo = {
        ...data,
        updatedAt: new Date().toISOString(),
      };
      
      // Update cache
      queryClient.setQueryData(billingKeys.info(), updatedInfo);
      
      toast.success('Billing information updated successfully');
      return updatedInfo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.info() });
    },
  });
}

export function useDownloadInvoice() {
  return useMutation({
    mutationFn: async (invoiceId: string) => {
      // Mock download
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would trigger a file download
      const invoice = mockInvoices.find(inv => inv.id === invoiceId);
      if (invoice) {
        toast.success(`Downloading invoice ${invoice.number}`);
        return invoice.downloadUrl;
      }
      
      throw new Error('Invoice not found');
    },
    onError: (error) => {
      toast.error('Failed to download invoice');
      console.error('Download error:', error);
    },
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Update cache
      queryClient.setQueryData(billingKeys.notifications(), (old: PaymentNotification[] = []) => 
        old.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.notifications() });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update cache
      queryClient.setQueryData(billingKeys.notifications(), (old: PaymentNotification[] = []) => 
        old.map(notification => ({ ...notification, isRead: true }))
      );
      
      toast.success('All notifications marked as read');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.notifications() });
    },
  });
}

// Utility hooks
export function useBillingFilters() {
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

export function useBillingStats() {
  const { data: invoices } = useInvoices();
  const { data: transactions } = useTransactions();
  const { data: notifications } = usePaymentNotifications();

  const stats = {
    totalInvoices: invoices?.length || 0,
    paidInvoices: invoices?.filter(inv => inv.status === 'paid').length || 0,
    openInvoices: invoices?.filter(inv => inv.status === 'open').length || 0,
    overdueInvoices: invoices?.filter(inv => 
      inv.status === 'open' && new Date(inv.dueDate) < new Date()
    ).length || 0,
    totalTransactions: transactions?.length || 0,
    totalAmount: transactions?.reduce((sum, txn) => sum + txn.amount, 0) || 0,
    unreadNotifications: notifications?.filter(notif => !notif.isRead).length || 0,
  };

  return stats;
}

export function useBillingAlerts() {
  const { data: invoices } = useInvoices();
  const { data: notifications } = usePaymentNotifications();

  const alerts = [];

  // Check for overdue invoices
  const overdueInvoices = invoices?.filter(inv => 
    inv.status === 'open' && new Date(inv.dueDate) < new Date()
  ) || [];
  
  if (overdueInvoices.length > 0) {
    alerts.push({
      type: 'warning',
      title: 'Overdue Invoices',
      message: `You have ${overdueInvoices.length} overdue invoice(s) that require immediate attention.`,
      action: 'View Invoices',
    });
  }

  // Check for unread notifications
  const unreadNotifications = notifications?.filter(notif => !notif.isRead) || [];
  
  if (unreadNotifications.length > 0) {
    alerts.push({
      type: 'info',
      title: 'New Notifications',
      message: `You have ${unreadNotifications.length} unread payment notification(s).`,
      action: 'View Notifications',
    });
  }

  return alerts;
}

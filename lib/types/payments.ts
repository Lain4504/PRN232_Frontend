export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  date: string;
  description: string;
  reference?: string;
  invoiceId?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  last4: string;
  brand: string;
  expiry: string;
  isDefault: boolean;
  billingAddress?: BillingAddress;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  number: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  downloadUrl?: string;
  paymentId?: string;
  metadata?: Record<string, unknown>;
}

export interface BillingInfo {
  address: BillingAddress;
  taxId?: string;
  company?: string;
  contactInfo: ContactInfo;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  date: string;
  description: string;
  reference?: string;
  paymentId?: string;
  metadata?: Record<string, unknown>;
}

export interface BillingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface ContactInfo {
  email: string;
  phone?: string;
  name: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  type: InvoiceItemType;
}

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'partially_refunded';

export type PaymentMethodType = 
  | 'card'
  | 'bank_account'
  | 'digital_wallet'
  | 'crypto';

export type InvoiceStatus = 
  | 'draft'
  | 'open'
  | 'paid'
  | 'void'
  | 'uncollectible';

export type TransactionType = 
  | 'payment'
  | 'refund'
  | 'chargeback'
  | 'adjustment'
  | 'fee';

export type TransactionStatus = 
  | 'pending'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type InvoiceItemType = 
  | 'subscription'
  | 'usage'
  | 'one_time'
  | 'discount'
  | 'tax'
  | 'fee';

export interface PaymentFormData {
  amount: number;
  currency: string;
  paymentMethodId?: string;
  billingAddress: BillingAddress;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentMethodFormData {
  type: PaymentMethodType;
  cardNumber?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvv?: string;
  cardholderName?: string;
  billingAddress: BillingAddress;
  isDefault?: boolean;
}

export interface BillingInfoFormData {
  address: BillingAddress;
  taxId?: string;
  company?: string;
  contactInfo: ContactInfo;
}

export interface PaymentNotification {
  id: string;
  type: PaymentNotificationType;
  title: string;
  message: string;
  paymentId?: string;
  invoiceId?: string;
  isRead: boolean;
  createdAt: string;
}

export type PaymentNotificationType = 
  | 'payment_succeeded'
  | 'payment_failed'
  | 'payment_reminder'
  | 'invoice_generated'
  | 'invoice_overdue'
  | 'refund_processed'
  | 'chargeback_received';

export interface PaymentError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, unknown>;
}

export interface PaymentProcessingResult {
  success: boolean;
  paymentId?: string;
  error?: PaymentError;
  requiresAction?: boolean;
  actionUrl?: string;
}

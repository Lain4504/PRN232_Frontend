import { z } from 'zod';

// Base schemas
const billingAddressSchema = z.object({
  line1: z.string().min(1, 'Address line 1 is required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
});

const contactInfoSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
});

// Payment form validation
export const paymentFormSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().min(3, 'Currency code is required'),
  paymentMethodId: z.string().optional(),
  billingAddress: billingAddressSchema,
  description: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

// Payment method form validation
export const paymentMethodFormSchema = z.object({
  type: z.enum(['card', 'bank_account', 'digital_wallet', 'crypto']),
  cardNumber: z.string().optional(),
  expiryMonth: z.string().optional(),
  expiryYear: z.string().optional(),
  cvv: z.string().optional(),
  cardholderName: z.string().optional(),
  billingAddress: billingAddressSchema,
  isDefault: z.boolean().optional(),
}).refine((data) => {
  if (data.type === 'card') {
    return data.cardNumber && data.expiryMonth && data.expiryYear && data.cvv && data.cardholderName;
  }
  return true;
}, {
  message: 'Card details are required for card payment methods',
  path: ['cardNumber'],
});

// Billing info form validation
export const billingInfoFormSchema = z.object({
  address: billingAddressSchema,
  taxId: z.string().optional(),
  company: z.string().optional(),
  contactInfo: contactInfoSchema,
});

// Card number validation
export const cardNumberSchema = z.string()
  .min(13, 'Card number must be at least 13 digits')
  .max(19, 'Card number must be at most 19 digits')
  .regex(/^\d+$/, 'Card number must contain only digits');

// CVV validation
export const cvvSchema = z.string()
  .min(3, 'CVV must be at least 3 digits')
  .max(4, 'CVV must be at most 4 digits')
  .regex(/^\d+$/, 'CVV must contain only digits');

// Expiry date validation
export const expiryDateSchema = z.object({
  month: z.string()
    .min(1, 'Month is required')
    .max(2, 'Month must be 1-2 digits')
    .regex(/^(0?[1-9]|1[0-2])$/, 'Month must be 01-12'),
  year: z.string()
    .min(2, 'Year is required')
    .max(4, 'Year must be 2-4 digits')
    .regex(/^\d{2,4}$/, 'Year must contain only digits'),
}).refine((data) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  
  const expiryYear = parseInt(data.year.length === 2 ? `20${data.year}` : data.year);
  const expiryMonth = parseInt(data.month);
  
  if (expiryYear < currentYear) return false;
  if (expiryYear === currentYear && expiryMonth < currentMonth) return false;
  
  return true;
}, {
  message: 'Card has expired',
  path: ['year'],
});

// Payment method selection validation
export const paymentMethodSelectionSchema = z.object({
  paymentMethodId: z.string().min(1, 'Payment method is required'),
  billingAddress: billingAddressSchema.optional(),
});

// Invoice search validation
export const invoiceSearchSchema = z.object({
  query: z.string().optional(),
  status: z.enum(['draft', 'open', 'paid', 'void', 'uncollectible']).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  amountMin: z.number().optional(),
  amountMax: z.number().optional(),
});

// Payment history search validation
export const paymentHistorySearchSchema = z.object({
  query: z.string().optional(),
  status: z.enum(['pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded', 'partially_refunded']).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  amountMin: z.number().optional(),
  amountMax: z.number().optional(),
  paymentMethodId: z.string().optional(),
});

// Payment retry validation
export const paymentRetrySchema = z.object({
  paymentId: z.string().min(1, 'Payment ID is required'),
  paymentMethodId: z.string().optional(),
  billingAddress: billingAddressSchema.optional(),
});

// Notification preferences validation
export const notificationPreferencesSchema = z.object({
  paymentSucceeded: z.boolean(),
  paymentFailed: z.boolean(),
  paymentReminder: z.boolean(),
  invoiceGenerated: z.boolean(),
  invoiceOverdue: z.boolean(),
  refundProcessed: z.boolean(),
  chargebackReceived: z.boolean(),
});

// Type exports
export type PaymentFormData = z.infer<typeof paymentFormSchema>;
export type PaymentMethodFormData = z.infer<typeof paymentMethodFormSchema>;
export type BillingInfoFormData = z.infer<typeof billingInfoFormSchema>;
export type PaymentMethodSelectionData = z.infer<typeof paymentMethodSelectionSchema>;
export type InvoiceSearchData = z.infer<typeof invoiceSearchSchema>;
export type PaymentHistorySearchData = z.infer<typeof paymentHistorySearchSchema>;
export type PaymentRetryData = z.infer<typeof paymentRetrySchema>;
export type NotificationPreferencesData = z.infer<typeof notificationPreferencesSchema>;

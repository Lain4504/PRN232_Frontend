import { 
  Payment, 
  PaymentMethod, 
  PaymentStatus,
  InvoiceStatus,
  TransactionType,
  PaymentError,
  PaymentProcessingResult
} from '@/lib/types/payments';
import { 
  PAYMENT_ERROR_CODES, 
  CARD_BRANDS, 
  CURRENCIES,
  PAYMENT_FORM_CONFIG,
  MOCK_PAYMENT_CONFIG
} from '@/lib/constants/payment-methods';

// Re-export constants for external use
export { PAYMENT_ERROR_CODES };

// Card number utilities
export function formatCardNumber(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\D/g, '');
  const match = cleaned.match(/(\d{0,4})(\d{0,4})(\d{0,4})(\d{0,4})/);
  if (!match) return cardNumber;
  
  const [, part1, part2, part3, part4] = match;
  return [part1, part2, part3, part4].filter(Boolean).join(' ');
}

export function getCardBrand(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\D/g, '');
  
  if (/^4/.test(cleaned)) return CARD_BRANDS.VISA;
  if (/^5[1-5]/.test(cleaned)) return CARD_BRANDS.MASTERCARD;
  if (/^3[47]/.test(cleaned)) return CARD_BRANDS.AMERICAN_EXPRESS;
  if (/^6(?:011|5)/.test(cleaned)) return CARD_BRANDS.DISCOVER;
  if (/^3[0689]/.test(cleaned)) return CARD_BRANDS.DINERS_CLUB;
  if (/^(?:2131|1800|35)/.test(cleaned)) return CARD_BRANDS.JCB;
  if (/^62/.test(cleaned)) return CARD_BRANDS.UNIONPAY;
  
  return 'unknown';
}

export function validateCardNumber(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\D/g, '');
  if (cleaned.length < 13 || cleaned.length > 19) return false;
  
  // Luhn algorithm
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

// CVV utilities
export function validateCVV(cvv: string, cardBrand: string): boolean {
  const cleaned = cvv.replace(/\D/g, '');
  
  if (cardBrand === CARD_BRANDS.AMERICAN_EXPRESS) {
    return cleaned.length === 4;
  }
  
  return cleaned.length === 3;
}

// Expiry date utilities
export function formatExpiryDate(month: string, year: string): string {
  const cleanMonth = month.replace(/\D/g, '');
  const cleanYear = year.replace(/\D/g, '');
  
  if (cleanMonth && cleanYear) {
    return `${cleanMonth.padStart(2, '0')}/${cleanYear.slice(-2)}`;
  }
  
  return '';
}

export function isExpiryDateValid(month: string, year: string): boolean {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  
  const expiryYear = parseInt(year.length === 2 ? `20${year}` : year);
  const expiryMonth = parseInt(month);
  
  if (expiryYear < currentYear) return false;
  if (expiryYear === currentYear && expiryMonth < currentMonth) return false;
  
  return true;
}

// Amount utilities
export function formatCurrency(amount: number, currency: string = CURRENCIES.USD): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function parseAmount(amountString: string): number {
  const cleaned = amountString.replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

// Payment status utilities
export function getPaymentStatusColor(status: PaymentStatus): string {
  switch (status) {
    case 'succeeded':
      return 'text-green-600 bg-green-50';
    case 'failed':
      return 'text-red-600 bg-red-50';
    case 'pending':
    case 'processing':
      return 'text-yellow-600 bg-yellow-50';
    case 'cancelled':
      return 'text-gray-600 bg-gray-50';
    case 'refunded':
    case 'partially_refunded':
      return 'text-blue-600 bg-blue-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

export function getPaymentStatusIcon(status: PaymentStatus): string {
  switch (status) {
    case 'succeeded':
      return 'check-circle';
    case 'failed':
      return 'x-circle';
    case 'pending':
      return 'clock';
    case 'processing':
      return 'loader';
    case 'cancelled':
      return 'x';
    case 'refunded':
    case 'partially_refunded':
      return 'rotate-ccw';
    default:
      return 'help-circle';
  }
}

// Invoice status utilities
export function getInvoiceStatusColor(status: InvoiceStatus): string {
  switch (status) {
    case 'paid':
      return 'text-green-600 bg-green-50';
    case 'open':
      return 'text-yellow-600 bg-yellow-50';
    case 'overdue':
      return 'text-red-600 bg-red-50';
    case 'draft':
      return 'text-gray-600 bg-gray-50';
    case 'void':
      return 'text-gray-600 bg-gray-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

// Transaction utilities
export function getTransactionTypeIcon(type: TransactionType): string {
  switch (type) {
    case 'payment':
      return 'credit-card';
    case 'refund':
      return 'rotate-ccw';
    case 'chargeback':
      return 'alert-triangle';
    case 'adjustment':
      return 'edit';
    case 'fee':
      return 'dollar-sign';
    default:
      return 'help-circle';
  }
}

// Payment method utilities
export function maskCardNumber(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\D/g, '');
  if (cleaned.length < 8) return cardNumber;
  
  const last4 = cleaned.slice(-4);
  const masked = '*'.repeat(cleaned.length - 4);
  return `${masked}${last4}`;
}

export function formatPaymentMethod(paymentMethod: PaymentMethod): string {
  switch (paymentMethod.type) {
    case 'card':
      return `${paymentMethod.brand.toUpperCase()} •••• ${paymentMethod.last4}`;
    case 'bank_account':
      return `Bank Account •••• ${paymentMethod.last4}`;
    case 'digital_wallet':
      return `Digital Wallet •••• ${paymentMethod.last4}`;
    case 'crypto':
      return `Crypto Wallet •••• ${paymentMethod.last4}`;
    default:
      return 'Unknown Payment Method';
  }
}

// Error handling utilities
export function createPaymentError(code: string, message: string, field?: string): PaymentError {
  return {
    code,
    message,
    field,
    details: {},
  };
}

export function getPaymentErrorMessage(error: PaymentError): string {
  switch (error.code) {
    case PAYMENT_ERROR_CODES.CARD_DECLINED:
      return 'Your card was declined. Please try a different payment method.';
    case PAYMENT_ERROR_CODES.INSUFFICIENT_FUNDS:
      return 'Insufficient funds. Please check your account balance.';
    case PAYMENT_ERROR_CODES.EXPIRED_CARD:
      return 'Your card has expired. Please use a different card.';
    case PAYMENT_ERROR_CODES.INCORRECT_CVC:
      return 'The security code is incorrect. Please check and try again.';
    case PAYMENT_ERROR_CODES.PROCESSING_ERROR:
      return 'There was an error processing your payment. Please try again.';
    case PAYMENT_ERROR_CODES.INVALID_AMOUNT:
      return 'The payment amount is invalid.';
    case PAYMENT_ERROR_CODES.NETWORK_ERROR:
      return 'Network error. Please check your connection and try again.';
    case PAYMENT_ERROR_CODES.TIMEOUT:
      return 'Payment request timed out. Please try again.';
    default:
      return error.message || 'An unexpected error occurred. Please try again.';
  }
}

// Mock payment processing
export function simulatePaymentProcessing(): Promise<PaymentProcessingResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const random = Math.random();
      
      if (random < MOCK_PAYMENT_CONFIG.SUCCESS_RATE) {
        resolve({
          success: true,
          paymentId: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        });
      } else if (random < MOCK_PAYMENT_CONFIG.SUCCESS_RATE + MOCK_PAYMENT_CONFIG.FAILURE_RATE) {
        resolve({
          success: false,
          error: createPaymentError(
            PAYMENT_ERROR_CODES.CARD_DECLINED,
            'Your card was declined'
          ),
        });
      } else {
        resolve({
          success: false,
          error: createPaymentError(
            PAYMENT_ERROR_CODES.NETWORK_ERROR,
            'Network error occurred'
          ),
        });
      }
    }, MOCK_PAYMENT_CONFIG.PROCESSING_DELAY_MS);
  });
}

// Validation utilities
export function validatePaymentAmount(amount: number): boolean {
  return amount >= PAYMENT_FORM_CONFIG.MIN_AMOUNT && 
         amount <= PAYMENT_FORM_CONFIG.MAX_AMOUNT;
}

export function validateCurrency(currency: string): boolean {
  return Object.values(CURRENCIES).includes(currency as 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD');
}

// Date utilities
export function formatPaymentDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function isPaymentOverdue(dueDate: string): boolean {
  return new Date(dueDate) < new Date();
}

// Search and filter utilities
export function filterPaymentsByStatus(payments: Payment[], status: PaymentStatus): Payment[] {
  return payments.filter(payment => payment.status === status);
}

export function filterPaymentsByDateRange(payments: Payment[], startDate: string, endDate: string): Payment[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return payments.filter(payment => {
    const paymentDate = new Date(payment.date);
    return paymentDate >= start && paymentDate <= end;
  });
}

export function searchPayments(payments: Payment[], query: string): Payment[] {
  const lowercaseQuery = query.toLowerCase();
  
  return payments.filter(payment => 
    payment.description.toLowerCase().includes(lowercaseQuery) ||
    payment.reference?.toLowerCase().includes(lowercaseQuery) ||
    payment.id.toLowerCase().includes(lowercaseQuery)
  );
}

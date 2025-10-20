export const PAYMENT_METHOD_TYPES = {
  CARD: 'card',
  BANK_ACCOUNT: 'bank_account',
  DIGITAL_WALLET: 'digital_wallet',
  CRYPTO: 'crypto',
} as const;

export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
  PARTIALLY_REFUNDED: 'partially_refunded',
} as const;

export const INVOICE_STATUSES = {
  DRAFT: 'draft',
  OPEN: 'open',
  PAID: 'paid',
  VOID: 'void',
  UNCOLLECTIBLE: 'uncollectible',
} as const;

export const TRANSACTION_TYPES = {
  PAYMENT: 'payment',
  REFUND: 'refund',
  CHARGEBACK: 'chargeback',
  ADJUSTMENT: 'adjustment',
  FEE: 'fee',
} as const;

export const TRANSACTION_STATUSES = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

export const PAYMENT_NOTIFICATION_TYPES = {
  PAYMENT_SUCCEEDED: 'payment_succeeded',
  PAYMENT_FAILED: 'payment_failed',
  PAYMENT_REMINDER: 'payment_reminder',
  INVOICE_GENERATED: 'invoice_generated',
  INVOICE_OVERDUE: 'invoice_overdue',
  REFUND_PROCESSED: 'refund_processed',
  CHARGEBACK_RECEIVED: 'chargeback_received',
} as const;

export const CARD_BRANDS = {
  VISA: 'visa',
  MASTERCARD: 'mastercard',
  AMERICAN_EXPRESS: 'amex',
  DISCOVER: 'discover',
  DINERS_CLUB: 'diners',
  JCB: 'jcb',
  UNIONPAY: 'unionpay',
} as const;

export const CURRENCIES = {
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
  CAD: 'CAD',
  AUD: 'AUD',
  JPY: 'JPY',
  CHF: 'CHF',
  SEK: 'SEK',
  NOK: 'NOK',
  DKK: 'DKK',
} as const;

export const PAYMENT_ERROR_CODES = {
  CARD_DECLINED: 'card_declined',
  INSUFFICIENT_FUNDS: 'insufficient_funds',
  EXPIRED_CARD: 'expired_card',
  INCORRECT_CVC: 'incorrect_cvc',
  PROCESSING_ERROR: 'processing_error',
  INVALID_AMOUNT: 'invalid_amount',
  INVALID_CURRENCY: 'invalid_currency',
  PAYMENT_METHOD_REQUIRED: 'payment_method_required',
  BILLING_ADDRESS_REQUIRED: 'billing_address_required',
  NETWORK_ERROR: 'network_error',
  TIMEOUT: 'timeout',
  UNAUTHORIZED: 'unauthorized',
  FORBIDDEN: 'forbidden',
  NOT_FOUND: 'not_found',
  RATE_LIMITED: 'rate_limited',
} as const;

export const PAYMENT_FORM_CONFIG = {
  CARD_NUMBER_MAX_LENGTH: 19,
  CVV_MAX_LENGTH: 4,
  CARDHOLDER_NAME_MAX_LENGTH: 100,
  BILLING_ADDRESS_MAX_LENGTH: 200,
  DESCRIPTION_MAX_LENGTH: 500,
  MIN_AMOUNT: 0.01,
  MAX_AMOUNT: 999999.99,
} as const;

export const PAYMENT_UI_CONFIG = {
  CARD_NUMBER_MASK: '#### #### #### ####',
  CVV_MASK: '###',
  EXPIRY_MASK: '##/##',
  POSTAL_CODE_MASK: '#####',
  PHONE_MASK: '(###) ###-####',
} as const;

export const PAYMENT_SECURITY_CONFIG = {
  CVV_REQUIRED: true,
  BILLING_ADDRESS_REQUIRED: true,
  CARDHOLDER_NAME_REQUIRED: true,
  POSTAL_CODE_VERIFICATION: true,
  AVS_CHECK: true,
  CVC_CHECK: true,
} as const;

export const PAYMENT_NOTIFICATION_CONFIG = {
  PAYMENT_REMINDER_DAYS: [7, 3, 1],
  INVOICE_OVERDUE_DAYS: [7, 14, 30],
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 5000,
} as const;

export const MOCK_PAYMENT_CONFIG = {
  PROCESSING_DELAY_MS: 2000,
  SUCCESS_RATE: 0.85,
  FAILURE_RATE: 0.15,
  NETWORK_ERROR_RATE: 0.05,
  TIMEOUT_DELAY_MS: 10000,
} as const;

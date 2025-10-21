import { toast } from 'sonner'
import type { SubscriptionError } from '@/lib/types/subscription'

export interface ErrorHandlerOptions {
  showToast?: boolean
  logError?: boolean
  retryable?: boolean
  context?: string
}

export class SubscriptionErrorHandler {
  private static instance: SubscriptionErrorHandler
  private errorLog: Array<{ error: Error; timestamp: string; context?: string }> = []

  static getInstance(): SubscriptionErrorHandler {
    if (!SubscriptionErrorHandler.instance) {
      SubscriptionErrorHandler.instance = new SubscriptionErrorHandler()
    }
    return SubscriptionErrorHandler.instance
  }

  handleError(
    error: Error | SubscriptionError,
    options: ErrorHandlerOptions = {}
  ): void {
    const {
      showToast = true,
      logError = true,
      retryable = false,
      context
    } = options

    // Log error
    if (logError) {
      this.logError(error, context)
    }

    // Show user-friendly toast
    if (showToast) {
      this.showErrorToast(error, retryable)
    }
  }

  handleApiError(
    error: Error | {response?: {data?: {message?: string}}; message?: string},
    operation: string,
    options: ErrorHandlerOptions = {}
  ): void {
    const errorMessage = this.extractApiErrorMessage(error)
    const subscriptionError = new Error(`${operation} failed: ${errorMessage}`)
    
    this.handleError(subscriptionError, {
      ...options,
      context: operation
    })
  }

  handlePlanChangeError(
    error: Error | {response?: {data?: {message?: string}}; message?: string},
    targetPlan: string,
    options: ErrorHandlerOptions = {}
  ): void {
    const errorMessage = this.extractApiErrorMessage(error)
    
    // Specific handling for plan change errors
    if (errorMessage.includes('payment')) {
      this.handleError(new Error('Payment failed. Please check your payment method.'), {
        ...options,
        context: 'plan-change-payment'
      })
    } else if (errorMessage.includes('limit')) {
      this.handleError(new Error('Cannot change plan due to usage limits. Please contact support.'), {
        ...options,
        context: 'plan-change-limit'
      })
    } else {
      this.handleError(new Error(`Failed to change to ${targetPlan} plan: ${errorMessage}`), {
        ...options,
        context: 'plan-change'
      })
    }
  }

  handleBillingError(
    error: Error | {response?: {data?: {message?: string}}; message?: string},
    operation: string,
    options: ErrorHandlerOptions = {}
  ): void {
    const errorMessage = this.extractApiErrorMessage(error)
    
    // Specific handling for billing errors
    if (errorMessage.includes('card')) {
      this.handleError(new Error('Payment method issue. Please update your card information.'), {
        ...options,
        context: 'billing-card'
      })
    } else if (errorMessage.includes('insufficient')) {
      this.handleError(new Error('Insufficient funds. Please check your payment method.'), {
        ...options,
        context: 'billing-funds'
      })
    } else {
      this.handleError(new Error(`Billing ${operation} failed: ${errorMessage}`), {
        ...options,
        context: `billing-${operation}`
      })
    }
  }

  private extractApiErrorMessage(error: Error | {response?: {data?: {message?: string}}; message?: string}): string {
    if (error?.response?.data?.message) {
      return error.response.data.message
    }
    if (error?.response?.data?.error) {
      return error.response.data.error
    }
    if (error?.message) {
      return error.message
    }
    return 'An unexpected error occurred'
  }

  private logError(error: Error, context?: string): void {
    const errorEntry = {
      error,
      timestamp: new Date().toISOString(),
      context
    }
    
    this.errorLog.push(errorEntry)
    
    // Keep only last 100 errors
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100)
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Subscription Error:', errorEntry)
    }
    
    // You could integrate with error reporting services here
    // Example: Sentry.captureException(error, { tags: { context } })
  }

  private showErrorToast(error: Error, retryable: boolean): void {
    const message = error.message
    
    if (retryable) {
      toast.error(message, {
        action: {
          label: 'Retry',
          onClick: () => {
            // Retry logic would be implemented by the calling component
            toast.info('Retrying...')
          }
        }
      })
    } else {
      toast.error(message)
    }
  }

  getErrorLog(): Array<{ error: Error; timestamp: string; context?: string }> {
    return [...this.errorLog]
  }

  clearErrorLog(): void {
    this.errorLog = []
  }
}

// Convenience functions
export const subscriptionErrorHandler = SubscriptionErrorHandler.getInstance()

export const handleSubscriptionError = (
  error: Error | SubscriptionError,
  options?: ErrorHandlerOptions
) => {
  subscriptionErrorHandler.handleError(error, options)
}

export const handleSubscriptionApiError = (
  error: Error | {response?: {data?: {message?: string}}; message?: string},
  operation: string,
  options?: ErrorHandlerOptions
) => {
  subscriptionErrorHandler.handleApiError(error, operation, options)
}

export const handlePlanChangeError = (
  error: Error | {response?: {data?: {message?: string}}; message?: string},
  targetPlan: string,
  options?: ErrorHandlerOptions
) => {
  subscriptionErrorHandler.handlePlanChangeError(error, targetPlan, options)
}

export const handleBillingError = (
  error: Error | {response?: {data?: {message?: string}}; message?: string},
  operation: string,
  options?: ErrorHandlerOptions
) => {
  subscriptionErrorHandler.handleBillingError(error, operation, options)
}

// Error recovery utilities
export const isRetryableError = (error: Error | {code?: string; message?: string; response?: {status?: number}}): boolean => {
  // Network errors are usually retryable
  if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('network')) {
    return true
  }
  
  // Server errors (5xx) are usually retryable
  if (error?.response?.status >= 500) {
    return true
  }
  
  // Rate limiting errors are retryable
  if (error?.response?.status === 429) {
    return true
  }
  
  return false
}

export const getRetryDelay = (attempt: number): number => {
  // Exponential backoff: 1s, 2s, 4s, 8s, 16s, max 30s
  return Math.min(1000 * Math.pow(2, attempt), 30000)
}

export const createRetryableOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  context?: string
): Promise<T> => {
  let lastError: Error | {response?: {data?: {message?: string}}; message?: string}
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      
      if (attempt === maxRetries || !isRetryableError(error)) {
        break
      }
      
      const delay = getRetryDelay(attempt)
      console.log(`Retrying ${context || 'operation'} in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`)
      
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError
}

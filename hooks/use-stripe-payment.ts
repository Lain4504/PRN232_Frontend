import { useState } from 'react'
import { useStripe, useElements } from '@stripe/react-stripe-js'
import { createPaymentIntent, confirmPayment, createSubscription } from '@/lib/api/subscription'
import { CreateSubscriptionRequest } from '@/lib/types/subscription'
import { toast } from 'sonner'

export function useStripePayment() {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const processPayment = async (
    profileId: string,
    planId: number,
    amount: number,
    billingDetails: {
      name: string
      email: string
    }
  ) => {
    if (!stripe || !elements) {
      throw new Error('Stripe not initialized')
    }

    setIsLoading(true)
    setError(null)

    try {
      // Create payment intent
      const paymentIntent = await createPaymentIntent(profileId, planId, amount)
      
      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent: confirmedPayment } = await stripe.confirmCardPayment(
        paymentIntent.clientSecret,
        {
          payment_method: {
            card: elements.getElement('card')!,
            billing_details: {
              name: billingDetails.name,
              email: billingDetails.email,
            },
          },
        }
      )

      if (stripeError) {
        throw new Error(stripeError.message || 'Payment failed')
      }

      if (confirmedPayment?.status === 'succeeded') {
        // Confirm payment in our backend
        await confirmPayment(confirmedPayment.id)
        
        return confirmedPayment
      }

      throw new Error('Payment was not successful')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const createSubscriptionFromPayment = async (
    request: CreateSubscriptionRequest
  ) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const subscription = await createSubscription(request)
      toast.success('Subscription created successfully!')
      
      return subscription
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create subscription'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  return {
    processPayment,
    createSubscriptionFromPayment,
    isLoading,
    error,
    clearError
  }
}

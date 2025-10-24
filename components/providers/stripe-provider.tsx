'use client'

import { Elements } from '@stripe/react-stripe-js'
import { getStripe, stripeOptions } from '@/lib/stripe'

interface StripeProviderProps {
  children: React.ReactNode
}

export function StripeProvider({ children }: StripeProviderProps) {
  return (
    <Elements stripe={getStripe()} options={stripeOptions}>
      {children}
    </Elements>
  )
}

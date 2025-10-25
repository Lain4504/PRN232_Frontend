'use client'

import { useState } from 'react'
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CreditCard, Lock } from 'lucide-react'
import { createSubscription } from '@/lib/api/subscription'
import { formatCurrency } from '@/lib/stripe'
import { toast } from 'sonner'

interface PaymentFormProps {
  planId: number
  planName: string
  price: number
  profileId: string
  onSuccess?: (subscriptionId: string) => void
  onError?: (error: string) => void
}

export function PaymentForm({ 
  planId, 
  planName, 
  price, 
  profileId, 
  onSuccess, 
  onError 
}: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [billingDetails, setBillingDetails] = useState({
    name: '',
    email: ''
  })

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    // Handle free plan
    if (price === 0) {
      try {
        setIsLoading(true)
        setError(null)

        // Create free subscription directly
        const subscription = await createSubscription({
          profileId,
          plan: planId,
          isRecurring: false
        })

        toast.success('Free profile created successfully!')
        onSuccess?.(subscription.id)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
        setError(errorMessage)
        onError?.(errorMessage)
        toast.error(errorMessage)
      } finally {
        setIsLoading(false)
      }
      return
    }

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Create payment method using the same Stripe instance from Elements
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement)!,
        billing_details: {
          name: billingDetails.name,
          email: billingDetails.email,
        },
      })

      if (error) {
        throw new Error(error.message || 'Failed to create payment method')
      }

      if (!paymentMethod?.id) {
        throw new Error('Failed to create payment method')
      }

      // Create subscription with payment method
      const subscription = await createSubscription({
        profileId,
        plan: planId,
        paymentMethodId: paymentMethod.id,
        isRecurring: true
      })

      toast.success('Payment successful! Your subscription is now active.')
      onSuccess?.(subscription.id)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      onError?.(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Details
        </CardTitle>
        <CardDescription>
          Complete your subscription to {planName} plan
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Plan Summary */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">{planName} Plan</span>
              <span className="text-lg font-bold">{formatCurrency(price)}/month</span>
            </div>
          </div>

          {/* Billing Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={billingDetails.name}
                onChange={(e) => setBillingDetails(prev => ({ ...prev, name: e.target.value }))}
                placeholder="John Doe"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={billingDetails.email}
                onChange={(e) => setBillingDetails(prev => ({ ...prev, email: e.target.value }))}
                placeholder="john@example.com"
                required
              />
            </div>
          </div>

          {/* Card Element */}
          <div className="space-y-2">
            <Label>Card Details</Label>
            <div className="p-3 border rounded-md">
              <CardElement options={cardElementOptions} />
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Security Notice */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span>Your payment information is secure and encrypted</span>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={!stripe || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing Payment...
              </>
            ) : (
              `Subscribe for ${formatCurrency(price)}/month`
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

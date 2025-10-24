import { loadStripe, Stripe } from '@stripe/stripe-js'

// Initialize Stripe with publishable key
let stripePromise: Promise<Stripe | null>

export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    if (!publishableKey) {
      throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set')
    }
    stripePromise = loadStripe(publishableKey)
  }
  return stripePromise
}

// Stripe Elements options
export const stripeOptions = {
  mode: 'payment' as const,
  currency: 'usd',
  appearance: {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#2563eb',
      colorBackground: '#ffffff',
      colorText: '#1f2937',
      colorDanger: '#dc2626',
      fontFamily: 'Inter, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  },
}

// Helper function to format currency
export const formatCurrency = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

// Helper function to get plan display name
export const getPlanDisplayName = (plan: number) => {
  const names = {
    0: 'Free',
    1: 'Basic',
    2: 'Pro'
  }
  return names[plan as keyof typeof names] || 'Unknown'
}

// Helper function to get plan color
export const getPlanColor = (plan: number) => {
  const colors = {
    0: 'bg-gray-100 text-gray-800',
    1: 'bg-blue-100 text-blue-800',
    2: 'bg-purple-100 text-purple-800'
  }
  return colors[plan as keyof typeof colors] || colors[0]
}

// Helper function to get plan pricing
export const getPlanPricing = (plan: number) => {
  const pricing = {
    0: { price: 0, period: 'forever', name: 'Free' },
    1: { price: 29, period: 'month', name: 'Basic' },
    2: { price: 99, period: 'month', name: 'Pro' }
  }
  return pricing[plan as keyof typeof pricing] || pricing[0]
}

// Helper function to get plan features
export const getPlanFeatures = (plan: number) => {
  const features = {
    0: {
      posts: 100,
      storage: 5,
      campaigns: 5,
      teamMembers: 1,
      features: ['Basic content creation', 'Facebook posting', 'Basic analytics']
    },
    1: {
      posts: 300,
      storage: 25,
      campaigns: 15,
      teamMembers: 5,
      features: ['All Free features', 'AI content generation', 'Advanced analytics', 'Team collaboration']
    },
    2: {
      posts: -1, // unlimited
      storage: 100,
      campaigns: -1, // unlimited
      teamMembers: 20,
      features: ['All Basic features', 'Unlimited posts', 'Priority support', 'Advanced reporting', 'API access']
    }
  }
  return features[plan as keyof typeof features] || features[0]
}

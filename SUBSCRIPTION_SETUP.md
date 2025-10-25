# Subscription & Payment Setup Guide

This guide explains how to set up the subscription and payment system with Stripe integration.

## Environment Configuration

Create a `.env.local` file in the `PRN232_Frontend` directory with the following variables:

```env
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# API Configuration  
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

## Stripe Setup

1. **Create a Stripe Account**: Go to [stripe.com](https://stripe.com) and create an account
2. **Get API Keys**: 
   - Go to Stripe Dashboard > Developers > API Keys
   - Copy your Publishable Key (starts with `pk_test_`)
   - Add it to your `.env.local` file
3. **Webhook Configuration** (for production):
   - Set up webhooks in Stripe Dashboard
   - Point to your backend webhook endpoint: `/api/payment/webhook`

## Features Implemented

### Frontend Components

1. **Subscription Plans Display** (`components/subscription/subscription-plans-page.tsx`)
   - Shows Free, Basic, and Pro plans
   - Displays pricing and features
   - Handles plan selection

2. **Payment Form** (`components/subscription/payment-form.tsx`)
   - Stripe CardElement integration
   - Billing details collection
   - Payment processing

3. **Checkout Page** (`app/subscription/checkout/page.tsx`)
   - Complete payment flow
   - Plan summary
   - Stripe Elements integration

4. **Success Page** (`app/subscription/success/page.tsx`)
   - Payment confirmation
   - Subscription details
   - Next steps guidance

5. **Subscription Management** (`app/subscription/page.tsx`)
   - View all subscriptions
   - Cancel subscriptions
   - Usage information

6. **Cancel Page** (`app/subscription/cancel/page.tsx`)
   - Cancellation confirmation
   - Warning messages
   - What happens next

### API Integration

1. **Subscription API** (`lib/api/subscription.ts`)
   - Create payment intent
   - Confirm payment
   - Create subscription
   - Get subscriptions
   - Cancel subscription

2. **Stripe Configuration** (`lib/stripe.ts`)
   - Stripe initialization
   - Helper functions
   - Currency formatting

### Hooks

1. **useSubscription** (`hooks/use-subscription.ts`)
   - Fetch user subscriptions
   - Get active subscription for profile
   - Refresh data

2. **useStripePayment** (`hooks/use-stripe-payment.ts`)
   - Process payments
   - Handle errors
   - Create subscriptions

## Usage Flow

1. **Profile Creation**: User creates profile and selects subscription plan
2. **Checkout**: Redirected to checkout page with Stripe payment form
3. **Payment**: User enters card details and completes payment
4. **Success**: Redirected to success page with subscription details
5. **Management**: User can view and manage subscriptions

## Backend Requirements

The frontend expects the following backend endpoints:

- `POST /api/payment/create-payment-intent` - Create Stripe payment intent
- `POST /api/payment/confirm/{paymentIntentId}` - Confirm payment
- `POST /api/payment/subscription` - Create subscription
- `GET /api/payment/subscription/{id}` - Get subscription by ID
- `GET /api/payment/subscriptions` - Get user subscriptions
- `DELETE /api/payment/subscription/{id}` - Cancel subscription

## Testing

1. **Test Mode**: Use Stripe test keys (starts with `pk_test_`)
2. **Test Cards**: Use Stripe test card numbers:
   - Success: `4242424242424242`
   - Decline: `4000000000000002`
   - 3D Secure: `4000002500003155`

## Security Notes

- Never expose Stripe secret keys in frontend code
- Always validate payments on the backend
- Use HTTPS in production
- Implement proper error handling

## Troubleshooting

1. **Stripe not loading**: Check your publishable key
2. **Payment fails**: Check backend API endpoints
3. **Webhook issues**: Check Stripe webhook configuration
4. **CORS errors**: Ensure backend allows frontend domain

## Production Deployment

1. Replace test keys with live keys
2. Set up webhooks in Stripe Dashboard
3. Configure proper error handling
4. Test payment flow thoroughly
5. Set up monitoring and logging

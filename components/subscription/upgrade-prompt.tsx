"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Crown, Zap, ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { PricingPlans } from './pricing-plans';
import { StripeProvider } from './stripe-provider';
import { StripePaymentForm } from './stripe-payment-form';
import { useCreatePaymentIntent, useCreateSubscription } from '@/hooks/use-subscription';
import { SubscriptionPlan } from '@/lib/types/aisam-types';
import { toast } from 'sonner';

interface UpgradePromptProps {
  title?: string;
  description?: string;
  feature?: string;
  compact?: boolean;
}

export function UpgradePrompt({
  title = "Upgrade to Access AI Features",
  description = "Unlock powerful AI content generation and advanced analytics",
  feature,
  compact = false
}: UpgradePromptProps) {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [clientSecret, setClientSecret] = useState<string>('');

  const createPaymentIntent = useCreatePaymentIntent();
  const createSubscription = useCreateSubscription();

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);

    try {
      const result = await createPaymentIntent.mutateAsync({
        amount: plan.price,
        currency: plan.currency,
        description: `${plan.name} Plan Subscription`,
        subscriptionPlanId: plan.id,
      });

      setClientSecret(result.clientSecret);
      setShowPaymentDialog(true);
    } catch (error) {
      toast.error('Failed to initialize payment');
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    if (!selectedPlan) return;

    try {
      await createSubscription.mutateAsync({
        plan: selectedPlan.name,
        isRecurring: true,
      });

      toast.success('Subscription created successfully!');
      setShowPaymentDialog(false);
      setSelectedPlan(null);
    } catch (error) {
      toast.error('Failed to create subscription');
    }
  };

  const handlePaymentError = (error: string) => {
    toast.error(`Payment failed: ${error}`);
  };

  if (compact) {
    return (
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Crown className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{title}</h3>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Zap className="w-4 h-4" />
                  Upgrade
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Choose Your Plan</DialogTitle>
                  <DialogDescription>
                    Select a subscription plan to unlock all AI features
                  </DialogDescription>
                </DialogHeader>
                <PricingPlans
                  onSelectPlan={handleSelectPlan}
                  loading={createPaymentIntent.isPending}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-primary/5 to-primary/10">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Crown className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription className="text-base">
            {description}
          </CardDescription>
          {feature && (
            <Badge variant="secondary" className="mt-2">
              <Zap className="w-3 h-3 mr-1" />
              {feature}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium text-primary">What you'll get:</h4>
              <ul className="space-y-1">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Unlimited AI content generation</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Advanced customization options</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Priority support</span>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-primary">Popular plans:</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <span>Basic Plan</span>
                  <span className="font-medium">$9.99/mo</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-primary/10 rounded border border-primary/20">
                  <span className="font-medium">Pro Plan</span>
                  <span className="font-medium">$29.99/mo</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2">
                  <Crown className="w-5 h-5" />
                  View Plans
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Choose Your Plan</DialogTitle>
                  <DialogDescription>
                    Select a subscription plan to unlock all AI features
                  </DialogDescription>
                </DialogHeader>
                <PricingPlans
                  onSelectPlan={handleSelectPlan}
                  loading={createPaymentIntent.isPending}
                />
              </DialogContent>
            </Dialog>

            <Button variant="outline" size="lg" asChild>
              <Link href="/subscription">
                Manage Subscription
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
            <DialogDescription>
              Enter your payment details to subscribe to the {selectedPlan?.name} plan
            </DialogDescription>
          </DialogHeader>
          {clientSecret && selectedPlan && (
            <StripeProvider>
              <StripePaymentForm
                clientSecret={clientSecret}
                plan={selectedPlan}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </StripeProvider>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
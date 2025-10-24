"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, Calendar, Zap, AlertCircle, CheckCircle, Crown } from 'lucide-react';
import { PricingPlans } from '@/components/subscription/pricing-plans';
import { StripeProvider } from '@/components/subscription/stripe-provider';
import { StripePaymentForm } from '@/components/subscription/stripe-payment-form';
import { useSubscriptionStatus, useUserSubscriptions, useCreatePaymentIntent, useCreateSubscription, useCancelSubscription } from '@/hooks/use-subscription';
import { SubscriptionPlan, SubscriptionResponseDto } from '@/lib/types/aisam-types';
import { toast } from 'sonner';

export function SubscriptionManagement() {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [clientSecret, setClientSecret] = useState<string>('');

  const { data: subscriptionStatus, isLoading: statusLoading } = useSubscriptionStatus();
  const { data: subscriptions, isLoading: subscriptionsLoading } = useUserSubscriptions();
  const createPaymentIntent = useCreatePaymentIntent();
  const createSubscription = useCreateSubscription();
  const cancelSubscription = useCancelSubscription();

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

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (!confirm('Are you sure you want to cancel this subscription?')) return;

    try {
      await cancelSubscription.mutateAsync(subscriptionId);
      toast.success('Subscription cancelled successfully');
    } catch (error) {
      toast.error('Failed to cancel subscription');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'Cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'Expired':
        return <Badge variant="secondary">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (statusLoading || subscriptionsLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading subscription details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscription Management</h1>
          <p className="text-muted-foreground">
            Manage your subscription and billing information
          </p>
        </div>
      </div>

      <Tabs defaultValue="current" className="space-y-6">
        <TabsList>
          <TabsTrigger value="current">Current Plan</TabsTrigger>
          <TabsTrigger value="plans">Available Plans</TabsTrigger>
          <TabsTrigger value="history">Billing History</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5" />
                Current Subscription
              </CardTitle>
              <CardDescription>
                Your current subscription status and usage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscriptionStatus?.hasActiveSubscription ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Plan:</span>
                      <Badge variant="outline">{subscriptionStatus.currentPlan}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Status:</span>
                      {getStatusBadge('Active')}
                    </div>
                    {subscriptionStatus.subscriptionEndDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Renews on {new Date(subscriptionStatus.subscriptionEndDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary" />
                      <span className="font-medium">AI Generations:</span>
                      <span>{subscriptionStatus.aiGenerationsUsed} / {subscriptionStatus.aiGenerationsLimit}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${(subscriptionStatus.aiGenerationsUsed / subscriptionStatus.aiGenerationsLimit) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You don't have an active subscription. Upgrade to access AI features.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Choose Your Plan</CardTitle>
              <CardDescription>
                Select a plan that fits your needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PricingPlans
                onSelectPlan={handleSelectPlan}
                currentPlan={subscriptionStatus?.currentPlan}
                loading={createPaymentIntent.isPending}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>
                Your subscription and payment history
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subscriptions && subscriptions.length > 0 ? (
                <div className="space-y-4">
                  {subscriptions.map((subscription) => (
                    <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{subscription.plan} Plan</span>
                          {getStatusBadge(subscription.status)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Started {new Date(subscription.startDate).toLocaleDateString()}
                          {subscription.endDate && ` • Ends ${new Date(subscription.endDate).toLocaleDateString()}`}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {subscription.status === 'Active' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelSubscription(subscription.id)}
                            disabled={cancelSubscription.isPending}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No subscription history found
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
    </div>
  );
}
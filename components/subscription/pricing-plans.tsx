"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap } from "lucide-react";
import { SubscriptionPlan } from "@/lib/types/aisam-types";

interface PricingPlansProps {
  onSelectPlan: (plan: SubscriptionPlan) => void;
  currentPlan?: string;
  loading?: boolean;
}

const plans: SubscriptionPlan[] = [
  {
    id: 1,
    name: 'Basic',
    price: 9.99,
    currency: 'USD',
    interval: 'month',
    aiGenerationsPerMonth: 100,
    description: 'Perfect for small businesses getting started with AI marketing',
    features: [
      '100 AI content generations/month',
      'Basic content templates',
      'Social media scheduling',
      'Performance analytics',
      'Email support',
      '1 brand account'
    ]
  },
  {
    id: 2,
    name: 'Pro',
    price: 29.99,
    currency: 'USD',
    interval: 'month',
    aiGenerationsPerMonth: 1000,
    description: 'Advanced features for growing businesses and agencies',
    features: [
      '1000 AI content generations/month',
      'Advanced AI customization',
      'Multi-platform scheduling',
      'Advanced analytics & reporting',
      'Priority support',
      'Unlimited brands',
      'Team collaboration',
      'Custom branding',
      'API access'
    ]
  }
];

export function PricingPlans({ onSelectPlan, currentPlan, loading }: PricingPlansProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
      {plans.map((plan) => (
        <Card
          key={plan.id}
          className={`relative ${plan.name === 'Pro' ? 'border-primary shadow-lg' : ''}`}
        >
          {plan.name === 'Pro' && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground px-3 py-1">
                <Star className="w-3 h-3 mr-1" />
                Most Popular
              </Badge>
            </div>
          )}

          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{plan.name}</CardTitle>
            <CardDescription>{plan.description}</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">${plan.price}</span>
              <span className="text-muted-foreground">/{plan.interval}</span>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="w-4 h-4 text-primary" />
                <span>{plan.aiGenerationsPerMonth} AI generations per month</span>
              </div>

              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>

          <CardFooter>
            <Button
              className="w-full"
              variant={plan.name === 'Pro' ? 'default' : 'outline'}
              onClick={() => onSelectPlan(plan)}
              disabled={loading || currentPlan === plan.name}
            >
              {currentPlan === plan.name ? 'Current Plan' : `Choose ${plan.name}`}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  CreditCard, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  Download,
  Settings,
} from 'lucide-react';
import { formatDate } from '@/lib/utils/teams';
import { TeamUsageAnalytics } from './team-usage-analytics';
import { TeamBillingHistory } from './team-billing-history';
import { toast } from 'sonner';

interface TeamBillingManagementProps {
  teamId: string;
  canManage?: boolean;
}

// Mock data - replace with actual API calls
const mockBillingData = {
  subscriptionId: 'sub_123456789',
  planId: 'pro',
  status: 'active' as const,
  currentPeriodStart: '2024-12-01T00:00:00Z',
  currentPeriodEnd: '2025-01-01T00:00:00Z',
  usage: {
    members: 8,
    storage: 2048, // MB
    apiCalls: 15420,
    contentGenerations: 89
  },
  limits: {
    maxMembers: 25,
    maxStorage: 10240, // MB
    maxApiCalls: 50000,
    maxContentGenerations: 500
  }
};

const mockInvoices = [
  {
    id: 'inv_001',
    amount: 99.00,
    status: 'paid' as const,
    date: '2024-12-01T00:00:00Z',
    period: 'December 2024',
    downloadUrl: '#'
  },
  {
    id: 'inv_002',
    amount: 99.00,
    status: 'paid' as const,
    date: '2024-11-01T00:00:00Z',
    period: 'November 2024',
    downloadUrl: '#'
  },
  {
    id: 'inv_003',
    amount: 99.00,
    status: 'paid' as const,
    date: '2024-10-01T00:00:00Z',
    period: 'October 2024',
    downloadUrl: '#'
  }
];

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 29,
    interval: 'month',
    features: [
      'Up to 5 team members',
      '10GB storage',
      '10,000 API calls/month',
      '100 content generations/month',
      'Basic support'
    ],
    limits: {
      maxMembers: 5,
      maxStorage: 10240,
      maxApiCalls: 10000,
      maxContentGenerations: 100
    }
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 99,
    interval: 'month',
    features: [
      'Up to 25 team members',
      '50GB storage',
      '50,000 API calls/month',
      '500 content generations/month',
      'Priority support',
      'Advanced analytics'
    ],
    limits: {
      maxMembers: 25,
      maxStorage: 51200,
      maxApiCalls: 50000,
      maxContentGenerations: 500
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 299,
    interval: 'month',
    features: [
      'Unlimited team members',
      'Unlimited storage',
      'Unlimited API calls',
      'Unlimited content generations',
      '24/7 support',
      'Custom integrations',
      'Advanced security'
    ],
    limits: {
      maxMembers: -1,
      maxStorage: -1,
      maxApiCalls: -1,
      maxContentGenerations: -1
    }
  }
];

export function TeamBillingManagement({ teamId, canManage = true }: TeamBillingManagementProps) {
  const [billingData, setBillingData] = useState(mockBillingData);
  const [invoices] = useState(mockInvoices);
  const [changePlanDialogOpen, setChangePlanDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');

  const currentPlan = plans.find(plan => plan.id === billingData.planId) || plans[1];

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'past_due':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'canceled':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleChangePlan = async () => {
    if (!selectedPlan) return;

    try {
      // TODO: Replace with actual API call
      const newPlan = plans.find(plan => plan.id === selectedPlan);
      if (newPlan) {
        setBillingData(prev => ({
          ...prev,
          planId: newPlan.id,
          limits: newPlan.limits
        }));
        setChangePlanDialogOpen(false);
        setSelectedPlan('');
        
        toast.success('Plan changed successfully!', {
          description: `Your team is now on the ${newPlan.name} plan.`,
          duration: 3000,
        });
      }
    } catch (error) {
      toast.error('Failed to change plan', {
        description: 'Please try again later.',
        duration: 4000,
      });
    }
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    // TODO: Implement actual download
    toast.success('Invoice downloaded', {
      description: 'Your invoice has been downloaded.',
      duration: 2000,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Billing & Usage</h2>
          <p className="text-muted-foreground">
            Manage your team&#39;s subscription and monitor usage
          </p>
        </div>
        {canManage && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setChangePlanDialogOpen(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Change Plan
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download Invoices
            </Button>
          </div>
        )}
      </div>

      {/* Current Plan & Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">{currentPlan.name}</h3>
                  <p className="text-muted-foreground">
                    ${currentPlan.price}/{currentPlan.interval}
                  </p>
                </div>
                <Badge className={getStatusColor(billingData.status)}>
                  {getStatusIcon(billingData.status)}
                  <span className="ml-1 capitalize">{billingData.status}</span>
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Next billing date: {formatDate(billingData.currentPeriodEnd)}</p>
                <p>Subscription ID: {billingData.subscriptionId}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Billing Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current Period</span>
                <span className="font-medium">
                  {formatDate(billingData.currentPeriodStart)} - {formatDate(billingData.currentPeriodEnd)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Monthly Cost</span>
                <span className="font-medium">${currentPlan.price}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Invoices</span>
                <span className="font-medium">{invoices.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Analytics */}
      <TeamUsageAnalytics 
        teamId={teamId}
        billing={billingData}
        canView={canManage}
      />

      {/* Billing History */}
      <TeamBillingHistory 
        teamId={teamId}
        invoices={invoices.map(invoice => ({
          id: invoice.id,
          invoiceNumber: invoice.id,
          amount: invoice.amount,
          currency: 'USD',
          status: invoice.status,
          description: `Subscription for ${invoice.period}`,
          period: invoice.period,
          createdAt: invoice.date,
          paymentMethod: 'credit_card'
        }))}
        canView={canManage}
        onViewInvoice={(invoice) => console.log('View invoice:', invoice)}
        onDownloadInvoice={(invoice) => handleDownloadInvoice(invoice.id)}
      />

      {/* Change Plan Dialog */}
      <Dialog open={changePlanDialogOpen} onOpenChange={setChangePlanDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Change Plan</DialogTitle>
            <DialogDescription>
              Select a new plan for your team. Changes will take effect immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <Card 
                  key={plan.id} 
                  className={`cursor-pointer transition-colors ${
                    selectedPlan === plan.id ? 'ring-2 ring-primary' : ''
                  } ${plan.id === billingData.planId ? 'opacity-50' : ''}`}
                  onClick={() => plan.id !== billingData.planId && setSelectedPlan(plan.id)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <div className="text-2xl font-bold">
                      ${plan.price}
                      <span className="text-sm font-normal text-muted-foreground">/{plan.interval}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setChangePlanDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleChangePlan}
                disabled={!selectedPlan}
              >
                Change Plan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

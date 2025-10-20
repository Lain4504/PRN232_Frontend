'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Settings, 
  CreditCard, 
  MapPin, 
  Bell, 
  Plus,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  useBillingInfo, 
  useBillingStats, 
  useBillingAlerts 
} from '@/hooks/use-billing';
import { PaymentMethodSelector } from './payment-method-selector';
import { BillingAddressForm } from './billing-address-form';
import { PaymentNotifications } from './payment-notifications';

interface BillingSettingsProps {
  className?: string;
}

export function BillingSettings({ className }: BillingSettingsProps) {
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const { data: billingInfo, isLoading: billingLoading } = useBillingInfo();
  const stats = useBillingStats();
  const alerts = useBillingAlerts();

  const handleAddressUpdateSuccess = () => {
    setIsAddressDialogOpen(false);
    toast.success('Billing address updated successfully');
  };

  if (billingLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-muted-foreground">Loading billing settings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Billing Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Billing Overview
            </CardTitle>
            <CardDescription>
              Manage your billing information and payment methods
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-primary">{stats.totalInvoices}</p>
                <p className="text-sm text-muted-foreground">Total Invoices</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{stats.paidInvoices}</p>
                <p className="text-sm text-muted-foreground">Paid</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{stats.openInvoices}</p>
                <p className="text-sm text-muted-foreground">Open</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{stats.overdueInvoices}</p>
                <p className="text-sm text-muted-foreground">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing Alerts */}
        {alerts.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <AlertTriangle className="h-5 w-5" />
                Billing Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.map((alert, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border">
                    <div className="p-1 rounded-full bg-orange-100">
                      {alert.type === 'warning' ? (
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-orange-800">{alert.title}</p>
                      <p className="text-sm text-orange-700">{alert.message}</p>
                    </div>
                    <Button size="sm" variant="outline">
                      {alert.action}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Billing Settings Tabs */}
        <Tabs defaultValue="payment-methods" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="payment-methods" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payment Methods
            </TabsTrigger>
            <TabsTrigger value="billing-address" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Billing Address
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* Payment Methods Tab */}
          <TabsContent value="payment-methods" className="space-y-6">
            <PaymentMethodSelector
              selectedMethodId=""
              onMethodSelect={() => {}}
              showAddButton={true}
            />
          </TabsContent>

          {/* Billing Address Tab */}
          <TabsContent value="billing-address" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Billing Address
                    </CardTitle>
                    <CardDescription>
                      Your current billing address and contact information
                    </CardDescription>
                  </div>
                  <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Update Address
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle>Update Billing Address</DialogTitle>
                        <DialogDescription>
                          Update your billing address and contact information
                        </DialogDescription>
                      </DialogHeader>
                      <BillingAddressForm onSuccess={handleAddressUpdateSuccess} />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {billingInfo ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-2">Contact Information</h4>
                        <div className="space-y-2 text-sm">
                          <p><strong>Name:</strong> {billingInfo.contactInfo.name}</p>
                          <p><strong>Email:</strong> {billingInfo.contactInfo.email}</p>
                          {billingInfo.contactInfo.phone && (
                            <p><strong>Phone:</strong> {billingInfo.contactInfo.phone}</p>
                          )}
                          {billingInfo.company && (
                            <p><strong>Company:</strong> {billingInfo.company}</p>
                          )}
                          {billingInfo.taxId && (
                            <p><strong>Tax ID:</strong> {billingInfo.taxId}</p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Billing Address</h4>
                        <div className="text-sm space-y-1">
                          <p>{billingInfo.address.line1}</p>
                          {billingInfo.address.line2 && <p>{billingInfo.address.line2}</p>}
                          <p>
                            {billingInfo.address.city}, {billingInfo.address.state} {billingInfo.address.postalCode}
                          </p>
                          <p>{billingInfo.address.country}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      Last updated: {new Date(billingInfo.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Billing Address</h3>
                    <p className="text-muted-foreground mb-4">
                      Add your billing address to get started
                    </p>
                    <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Billing Address
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>Add Billing Address</DialogTitle>
                          <DialogDescription>
                            Add your billing address and contact information
                          </DialogDescription>
                        </DialogHeader>
                        <BillingAddressForm onSuccess={handleAddressUpdateSuccess} />
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <PaymentNotifications />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

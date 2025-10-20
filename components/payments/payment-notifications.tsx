'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  BellOff, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  CreditCard,
  FileText,
  RefreshCw,
  Trash2,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { PaymentNotification } from '@/lib/types/payments';
import { 
  usePaymentNotifications, 
  useMarkNotificationAsRead, 
  useMarkAllNotificationsAsRead 
} from '@/hooks/use-billing';
import { PAYMENT_NOTIFICATION_TYPES } from '@/lib/constants/payment-methods';

interface PaymentNotificationsProps {
  className?: string;
}

export function PaymentNotifications({ className }: PaymentNotificationsProps) {
  const [notificationPreferences, setNotificationPreferences] = useState({
    paymentSucceeded: true,
    paymentFailed: true,
    paymentReminder: true,
    invoiceGenerated: true,
    invoiceOverdue: true,
    refundProcessed: true,
    chargebackReceived: true,
  });

  const { data: notifications, isLoading } = usePaymentNotifications();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead.mutateAsync(notificationId);
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead.mutateAsync();
    } catch (error) {
      toast.error('Failed to mark all notifications as read');
    }
  };

  const handlePreferenceChange = (key: string, value: boolean) => {
    setNotificationPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
    toast.success('Notification preferences updated');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case PAYMENT_NOTIFICATION_TYPES.PAYMENT_SUCCEEDED:
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case PAYMENT_NOTIFICATION_TYPES.PAYMENT_FAILED:
        return <XCircle className="h-5 w-5 text-red-600" />;
      case PAYMENT_NOTIFICATION_TYPES.PAYMENT_REMINDER:
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case PAYMENT_NOTIFICATION_TYPES.INVOICE_GENERATED:
        return <FileText className="h-5 w-5 text-blue-600" />;
      case PAYMENT_NOTIFICATION_TYPES.INVOICE_OVERDUE:
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case PAYMENT_NOTIFICATION_TYPES.REFUND_PROCESSED:
        return <RefreshCw className="h-5 w-5 text-blue-600" />;
      case PAYMENT_NOTIFICATION_TYPES.CHARGEBACK_RECEIVED:
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case PAYMENT_NOTIFICATION_TYPES.PAYMENT_SUCCEEDED:
        return 'Payment Succeeded';
      case PAYMENT_NOTIFICATION_TYPES.PAYMENT_FAILED:
        return 'Payment Failed';
      case PAYMENT_NOTIFICATION_TYPES.PAYMENT_REMINDER:
        return 'Payment Reminder';
      case PAYMENT_NOTIFICATION_TYPES.INVOICE_GENERATED:
        return 'Invoice Generated';
      case PAYMENT_NOTIFICATION_TYPES.INVOICE_OVERDUE:
        return 'Invoice Overdue';
      case PAYMENT_NOTIFICATION_TYPES.REFUND_PROCESSED:
        return 'Refund Processed';
      case PAYMENT_NOTIFICATION_TYPES.CHARGEBACK_RECEIVED:
        return 'Chargeback Received';
      default:
        return 'Notification';
    }
  };

  const unreadCount = notifications?.filter(notif => !notif.isRead).length || 0;

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Choose which payment notifications you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="font-medium">Payment Succeeded</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified when payments are successful
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notificationPreferences.paymentSucceeded}
                  onCheckedChange={(value) => handlePreferenceChange('paymentSucceeded', value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <div>
                    <p className="font-medium">Payment Failed</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified when payments fail
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notificationPreferences.paymentFailed}
                  onCheckedChange={(value) => handlePreferenceChange('paymentFailed', value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <div>
                    <p className="font-medium">Payment Reminders</p>
                    <p className="text-sm text-muted-foreground">
                      Get reminded about upcoming payments
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notificationPreferences.paymentReminder}
                  onCheckedChange={(value) => handlePreferenceChange('paymentReminder', value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-medium">Invoice Generated</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified when new invoices are created
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notificationPreferences.invoiceGenerated}
                  onCheckedChange={(value) => handlePreferenceChange('invoiceGenerated', value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <div>
                    <p className="font-medium">Invoice Overdue</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified when invoices become overdue
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notificationPreferences.invoiceOverdue}
                  onCheckedChange={(value) => handlePreferenceChange('invoiceOverdue', value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <RefreshCw className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-medium">Refund Processed</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified when refunds are processed
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notificationPreferences.refundProcessed}
                  onCheckedChange={(value) => handlePreferenceChange('refundProcessed', value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <div>
                    <p className="font-medium">Chargeback Received</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified when chargebacks are received
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notificationPreferences.chargebackReceived}
                  onCheckedChange={(value) => handlePreferenceChange('chargebackReceived', value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Recent Notifications
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {unreadCount} unread
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Your recent payment notifications
                </CardDescription>
              </div>
              {unreadCount > 0 && (
                <Button
                  onClick={handleMarkAllAsRead}
                  variant="outline"
                  size="sm"
                  disabled={markAllAsRead.isPending}
                >
                  {markAllAsRead.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Marking...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark All Read
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="ml-2 text-sm text-muted-foreground">Loading notifications...</span>
              </div>
            ) : notifications && notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border rounded-lg transition-colors ${
                      notification.isRead 
                        ? 'bg-muted/30 border-border' 
                        : 'bg-primary/5 border-primary/20'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-1 rounded-full bg-background">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{notification.title}</p>
                          {!notification.isRead && (
                            <Badge variant="secondary" className="text-xs">
                              New
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {getNotificationTypeLabel(notification.type)}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            {new Date(notification.createdAt).toLocaleDateString()} at{' '}
                            {new Date(notification.createdAt).toLocaleTimeString()}
                          </p>
                          
                          {!notification.isRead && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleMarkAsRead(notification.id)}
                              disabled={markAsRead.isPending}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Mark Read
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BellOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Notifications</h3>
                <p className="text-muted-foreground">
                  You don&apos;t have any payment notifications yet.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

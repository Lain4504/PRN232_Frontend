'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bell, 
  BellOff, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  CreditCard,
  FileText,
  Settings,
  RefreshCw,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  useBillingAlerts, 
  useBillingStats 
} from '@/hooks/use-billing';
import { 
  mockPaymentProcessing 
} from '@/lib/utils/mock-payment-processing';
import { PAYMENT_NOTIFICATION_TYPES } from '@/lib/constants/payment-methods';

interface PaymentAlertSystemProps {
  className?: string;
}

interface AlertRule {
  id: string;
  name: string;
  description: string;
  type: 'payment' | 'invoice' | 'billing';
  condition: string;
  threshold?: number;
  enabled: boolean;
  lastTriggered?: string;
}

export function PaymentAlertSystem({ className }: PaymentAlertSystemProps) {
  const [alertRules, setAlertRules] = useState<AlertRule[]>([
    {
      id: 'overdue-invoices',
      name: 'Overdue Invoices',
      description: 'Alert when invoices are overdue',
      type: 'invoice',
      condition: 'overdue',
      enabled: true,
    },
    {
      id: 'failed-payments',
      name: 'Failed Payments',
      description: 'Alert when payments fail',
      type: 'payment',
      condition: 'failed',
      enabled: true,
    },
    {
      id: 'high-amount-payments',
      name: 'High Amount Payments',
      description: 'Alert for payments over $1000',
      type: 'payment',
      condition: 'amount_above',
      threshold: 1000,
      enabled: false,
    },
    {
      id: 'payment-reminders',
      name: 'Payment Reminders',
      description: 'Remind users about upcoming payments',
      type: 'payment',
      condition: 'reminder',
      enabled: true,
    },
    {
      id: 'billing-changes',
      name: 'Billing Changes',
      description: 'Alert when billing information changes',
      type: 'billing',
      condition: 'changed',
      enabled: true,
    },
  ]);

  const [isMonitoring, setIsMonitoring] = useState(false);
  const [alertHistory, setAlertHistory] = useState<Array<{id: string; type: string; message: string; timestamp: string}>>([]);
  
  const billingAlerts = useBillingAlerts();
  const stats = useBillingStats();

  // Toggle alert rule
  const toggleAlertRule = (ruleId: string) => {
    setAlertRules(prev => 
      prev.map(rule => 
        rule.id === ruleId 
          ? { ...rule, enabled: !rule.enabled }
          : rule
      )
    );
    
    toast.success('Alert rule updated');
  };

  // Start monitoring
  const startMonitoring = () => {
    setIsMonitoring(true);
    toast.success('Payment monitoring started');
  };

  // Stop monitoring
  const stopMonitoring = () => {
    setIsMonitoring(false);
    toast.info('Payment monitoring stopped');
  };

  // Test alert
  const testAlert = (ruleId: string) => {
    const rule = alertRules.find(r => r.id === ruleId);
    if (!rule) return;

    const alert = {
      id: `test_${Date.now()}`,
      ruleId,
      type: rule.type,
      message: `Test alert for ${rule.name}`,
      timestamp: new Date().toISOString(),
      severity: 'info',
    };

    setAlertHistory(prev => [alert, ...prev]);
    toast.success(`Test alert sent for ${rule.name}`);
  };

  // Get alert icon
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <CreditCard className="h-4 w-4" />;
      case 'invoice':
        return <FileText className="h-4 w-4" />;
      case 'billing':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  // Get alert severity color
  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'info':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Alert System Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Payment Alert System
                </CardTitle>
                <CardDescription>
                  Monitor and manage payment-related alerts
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={isMonitoring ? 'default' : 'secondary'}>
                  {isMonitoring ? 'Monitoring' : 'Stopped'}
                </Badge>
                {isMonitoring ? (
                  <Button onClick={stopMonitoring} variant="outline" size="sm">
                    <BellOff className="h-4 w-4 mr-2" />
                    Stop
                  </Button>
                ) : (
                  <Button onClick={startMonitoring} size="sm">
                    <Bell className="h-4 w-4 mr-2" />
                    Start
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-primary">{alertRules.length}</p>
                <p className="text-sm text-muted-foreground">Alert Rules</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {alertRules.filter(r => r.enabled).length}
                </p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{alertHistory.length}</p>
                <p className="text-sm text-muted-foreground">Alerts Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Billing Alerts */}
        {billingAlerts.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <AlertTriangle className="h-5 w-5" />
                Active Billing Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {billingAlerts.map((alert, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border">
                    <div className="p-1 rounded-full bg-orange-100">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
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

        {/* Alert Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Alert Rules
            </CardTitle>
            <CardDescription>
              Configure which alerts you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alertRules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      {getAlertIcon(rule.type)}
                    </div>
                    <div>
                      <p className="font-medium">{rule.name}</p>
                      <p className="text-sm text-muted-foreground">{rule.description}</p>
                      {rule.threshold && (
                        <p className="text-xs text-muted-foreground">
                          Threshold: ${rule.threshold}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testAlert(rule.id)}
                    >
                      Test
                    </Button>
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={() => toggleAlertRule(rule.id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alert History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Alert History
                </CardTitle>
                <CardDescription>
                  Recent alerts and notifications
                </CardDescription>
              </div>
              <Button
                onClick={() => setAlertHistory([])}
                variant="outline"
                size="sm"
              >
                Clear History
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {alertHistory.length > 0 ? (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {alertHistory.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 border rounded-lg ${getAlertSeverityColor(alert.severity)}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-1 rounded-full bg-background">
                        {getAlertIcon(alert.type)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{alert.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {alert.severity}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Alerts</h3>
                <p className="text-muted-foreground">
                  No alerts have been triggered yet.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Monitoring Status</p>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <p className="text-sm font-medium">
                    {isMonitoring ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Last Check</p>
                <p className="text-sm font-medium">
                  {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

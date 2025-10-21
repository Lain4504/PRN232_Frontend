'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Loader2, 
  CreditCard, 
  Download, 
  RefreshCw,
  AlertTriangle 
} from 'lucide-react';
import { toast } from 'sonner';
import { Payment, PaymentError, PaymentProcessingResult } from '@/lib/types/payments';
import { 
  formatCurrency, 
  formatPaymentDate, 
  getPaymentStatusColor, 
  getPaymentStatusIcon,
  getPaymentErrorMessage 
} from '@/lib/utils/payments';
import { useRetryPayment } from '@/hooks/use-payments';

interface PaymentConfirmationProps {
  payment?: Payment;
  result?: PaymentProcessingResult;
  onRetry?: () => void;
  onClose?: () => void;
  className?: string;
}

export function PaymentConfirmation({
  payment,
  result,
  onRetry,
  onClose,
  className,
}: PaymentConfirmationProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const retryPayment = useRetryPayment();

  const handleRetry = async () => {
    if (!payment) return;
    
    setIsRetrying(true);
    try {
      await retryPayment.mutateAsync({ paymentId: payment.id });
      onRetry?.();
    } catch (error) {
      toast.error('Failed to retry payment');
    } finally {
      setIsRetrying(false);
    }
  };

  const getStatusIcon = () => {
    if (result?.success) {
      return <CheckCircle className="h-8 w-8 text-green-600" />;
    }
    
    if (result?.error) {
      return <XCircle className="h-8 w-8 text-red-600" />;
    }
    
    if (payment?.status === 'processing') {
      return <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />;
    }
    
    if (payment?.status === 'pending') {
      return <Clock className="h-8 w-8 text-yellow-600" />;
    }
    
    return <CheckCircle className="h-8 w-8 text-green-600" />;
  };

  const getStatusMessage = () => {
    if (result?.success) {
      return {
        title: 'Payment Successful',
        description: 'Your payment has been processed successfully.',
        variant: 'success' as const,
      };
    }
    
    if (result?.error) {
      return {
        title: 'Payment Failed',
        description: getPaymentErrorMessage(result.error),
        variant: 'error' as const,
      };
    }
    
    if (payment?.status === 'processing') {
      return {
        title: 'Processing Payment',
        description: 'Your payment is being processed. Please wait...',
        variant: 'info' as const,
      };
    }
    
    if (payment?.status === 'pending') {
      return {
        title: 'Payment Pending',
        description: 'Your payment is pending confirmation.',
        variant: 'warning' as const,
      };
    }
    
    return {
      title: 'Payment Complete',
      description: 'Your payment has been processed.',
      variant: 'success' as const,
    };
  };

  const statusMessage = getStatusMessage();

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-center mb-4">
          {getStatusIcon()}
        </div>
        <CardTitle className="text-center">{statusMessage.title}</CardTitle>
        <CardDescription className="text-center">
          {statusMessage.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Payment Details */}
        {payment && (
          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Payment ID</p>
                  <p className="font-mono text-xs">{payment.id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Amount</p>
                  <p className="font-semibold">
                    {formatCurrency(payment.amount, payment.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p>{formatPaymentDate(payment.date)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge 
                    variant="secondary" 
                    className={getPaymentStatusColor(payment.status)}
                  >
                    {payment.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {payment.method.brand.toUpperCase()} •••• {payment.method.last4}
                </p>
                <p className="text-sm text-muted-foreground">
                  Expires {payment.method.expiry}
                </p>
              </div>
            </div>

            {/* Description */}
            {payment.description && (
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="text-sm">{payment.description}</p>
              </div>
            )}
          </div>
        )}

        {/* Error Details */}
        {result?.error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Error Details:</p>
                <p className="text-sm">Code: {result.error.code}</p>
                {result.error.field && (
                  <p className="text-sm">Field: {result.error.field}</p>
                )}
                {result.error.details && Object.keys(result.error.details).length > 0 && (
                  <div className="text-sm">
                    <p>Additional Details:</p>
                    <pre className="text-xs mt-1">
                      {JSON.stringify(result.error.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Action Required */}
        {result?.requiresAction && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Action Required</p>
                <p className="text-sm">
                  Additional authentication is required to complete this payment.
                </p>
                {result.actionUrl && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => window.open(result.actionUrl, '_blank')}
                  >
                    Complete Authentication
                  </Button>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Separator />

        {/* Actions */}
        <div className="flex gap-3">
          {result?.error && payment && (
            <Button
              onClick={handleRetry}
              disabled={isRetrying}
              variant="outline"
              className="flex-1"
            >
              {isRetrying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry Payment
                </>
              )}
            </Button>
          )}
          
          {result?.success && payment?.invoiceId && (
            <Button
              onClick={() => {
                // In a real app, this would download the invoice
                toast.success('Invoice download started');
              }}
              variant="outline"
              className="flex-1"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Receipt
            </Button>
          )}
          
          <Button
            onClick={onClose}
            className="flex-1"
          >
            {result?.error ? 'Try Again' : 'Close'}
          </Button>
        </div>

        {/* Additional Information */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Need help? Contact our support team for assistance with your payment.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

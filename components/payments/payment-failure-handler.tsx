'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  RefreshCw, 
  CreditCard, 
  Clock, 
  CheckCircle,
  XCircle,
  Loader2,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { Payment, PaymentError } from '@/lib/types/payments';
import { 
  useRetryPayment, 
  usePaymentMethods 
} from '@/hooks/use-payments';
import { 
  getPaymentErrorMessage, 
  formatCurrency, 
  formatPaymentDate 
} from '@/lib/utils/payments';
import { PAYMENT_ERROR_CODES } from '@/lib/constants/payment-methods';
import { PaymentMethodSelector } from './payment-method-selector';

interface PaymentFailureHandlerProps {
  payment: Payment;
  error: PaymentError;
  onRetrySuccess?: () => void;
  onRetryFailure?: (error: PaymentError) => void;
  className?: string;
}

export function PaymentFailureHandler({
  payment,
  error,
  onRetrySuccess,
  onRetryFailure,
  className,
}: PaymentFailureHandlerProps) {
  const [selectedMethodId, setSelectedMethodId] = useState(payment.method.id);
  const [isRetrying, setIsRetrying] = useState(false);
  
  const retryPayment = useRetryPayment();
  const { data: paymentMethods } = usePaymentMethods();

  const handleRetryPayment = async () => {
    setIsRetrying(true);
    
    try {
      const result = await retryPayment.mutateAsync({
        paymentId: payment.id,
        paymentMethodId: selectedMethodId !== payment.method.id ? selectedMethodId : undefined,
      });
      
      if (result.success) {
        toast.success('Payment retry successful');
        onRetrySuccess?.();
      } else {
        toast.error(getPaymentErrorMessage(result.error!));
        onRetryFailure?.(result.error!);
      }
    } catch (error) {
      const paymentError: PaymentError = {
        code: PAYMENT_ERROR_CODES.PROCESSING_ERROR,
        message: 'An unexpected error occurred during retry',
      };
      toast.error(getPaymentErrorMessage(paymentError));
      onRetryFailure?.(paymentError);
    } finally {
      setIsRetrying(false);
    }
  };

  const getErrorSeverity = (errorCode: string) => {
    switch (errorCode) {
      case PAYMENT_ERROR_CODES.CARD_DECLINED:
      case PAYMENT_ERROR_CODES.INSUFFICIENT_FUNDS:
        return 'warning';
      case PAYMENT_ERROR_CODES.EXPIRED_CARD:
      case PAYMENT_ERROR_CODES.INCORRECT_CVC:
        return 'error';
      case PAYMENT_ERROR_CODES.NETWORK_ERROR:
      case PAYMENT_ERROR_CODES.TIMEOUT:
        return 'info';
      default:
        return 'error';
    }
  };

  const getRetryRecommendation = (errorCode: string) => {
    switch (errorCode) {
      case PAYMENT_ERROR_CODES.CARD_DECLINED:
        return 'Try using a different payment method or contact your bank.';
      case PAYMENT_ERROR_CODES.INSUFFICIENT_FUNDS:
        return 'Check your account balance or use a different payment method.';
      case PAYMENT_ERROR_CODES.EXPIRED_CARD:
        return 'Update your card information with a valid expiry date.';
      case PAYMENT_ERROR_CODES.INCORRECT_CVC:
        return 'Double-check the security code on the back of your card.';
      case PAYMENT_ERROR_CODES.NETWORK_ERROR:
        return 'Check your internet connection and try again.';
      case PAYMENT_ERROR_CODES.TIMEOUT:
        return 'The request timed out. Please try again.';
      default:
        return 'Please try again or contact support if the problem persists.';
    }
  };

  const canRetry = [
    PAYMENT_ERROR_CODES.CARD_DECLINED,
    PAYMENT_ERROR_CODES.INSUFFICIENT_FUNDS,
    PAYMENT_ERROR_CODES.NETWORK_ERROR,
    PAYMENT_ERROR_CODES.TIMEOUT,
    PAYMENT_ERROR_CODES.PROCESSING_ERROR,
  ].includes(error.code);

  const needsNewPaymentMethod = [
    PAYMENT_ERROR_CODES.EXPIRED_CARD,
    PAYMENT_ERROR_CODES.INCORRECT_CVC,
  ].includes(error.code);

  const errorSeverity = getErrorSeverity(error.code);
  const retryRecommendation = getRetryRecommendation(error.code);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-red-100">
            <XCircle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <CardTitle className="text-red-800">Payment Failed</CardTitle>
            <CardDescription>
              Your payment could not be processed
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Payment Details */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
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
          </div>
        </div>

        {/* Error Details */}
        <Alert variant={errorSeverity === 'error' ? 'destructive' : 'default'}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Error: {error.message}</p>
              <p className="text-sm">Code: {error.code}</p>
              {error.field && (
                <p className="text-sm">Field: {error.field}</p>
              )}
              <p className="text-sm">{retryRecommendation}</p>
            </div>
          </AlertDescription>
        </Alert>

        {/* Payment Method Selection */}
        {needsNewPaymentMethod && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <h3 className="text-lg font-medium">Select Payment Method</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              The current payment method has an issue. Please select a different one.
            </p>
            <PaymentMethodSelector
              selectedMethodId={selectedMethodId}
              onMethodSelect={setSelectedMethodId}
              showAddButton={true}
            />
          </div>
        )}

        {/* Retry Information */}
        {canRetry && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              <h3 className="text-lg font-medium">Retry Payment</h3>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800">Retry Information</p>
                  <p className="text-blue-700 mt-1">
                    {needsNewPaymentMethod 
                      ? 'Please select a different payment method and try again.'
                      : 'You can retry this payment with the same or a different payment method.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {canRetry && (
            <Button
              onClick={handleRetryPayment}
              disabled={isRetrying || (needsNewPaymentMethod && !selectedMethodId)}
              className="flex-1"
            >
              {isRetrying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Retrying Payment...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry Payment
                </>
              )}
            </Button>
          )}
          
          <Button
            onClick={() => {
              // In a real app, this would contact support
              toast.success('Opening support chat...');
            }}
            variant="outline"
            className="flex-1"
          >
            Contact Support
          </Button>
        </div>

        {/* Additional Help */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Need immediate assistance? Our support team is available 24/7 to help resolve payment issues.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

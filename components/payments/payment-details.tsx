'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  FileText, 
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { Payment } from '@/lib/types/payments';
import { 
  formatCurrency, 
  formatPaymentDate, 
  getPaymentStatusColor, 
  getPaymentStatusIcon 
} from '@/lib/utils/payments';
import { useRetryPayment } from '@/hooks/use-payments';

interface PaymentDetailsProps {
  payment: Payment;
  className?: string;
}

export function PaymentDetails({ payment, className }: PaymentDetailsProps) {
  const retryPayment = useRetryPayment();

  const handleRetryPayment = async () => {
    try {
      await retryPayment.mutateAsync({ paymentId: payment.id });
      toast.success('Payment retry initiated');
    } catch (error) {
      toast.error('Failed to retry payment');
    }
  };

  const handleDownloadReceipt = () => {
    // In a real app, this would download the receipt
    toast.success('Receipt download started');
  };

  const getStatusIcon = () => {
    switch (payment.status) {
      case 'succeeded':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'processing':
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-gray-600" />;
      case 'refunded':
      case 'partially_refunded':
        return <RefreshCw className="h-5 w-5 text-blue-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Payment Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon()}
                <div>
                  <CardTitle className="text-lg">Payment Status</CardTitle>
                  <CardDescription>
                    Current status of your payment
                  </CardDescription>
                </div>
              </div>
              <Badge 
                variant="secondary" 
                className={getPaymentStatusColor(payment.status)}
              >
                {payment.status}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Payment ID</p>
                  <p className="font-mono text-sm">{payment.id}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(payment.amount, payment.currency)}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="font-medium">{payment.description}</p>
                </div>
                
                {payment.reference && (
                  <div>
                    <p className="text-sm text-muted-foreground">Reference</p>
                    <p className="font-mono text-sm">{payment.reference}</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">
                      {formatPaymentDate(payment.date)}
                    </p>
                  </div>
                </div>
                
                {payment.invoiceId && (
                  <div>
                    <p className="text-sm text-muted-foreground">Invoice ID</p>
                    <p className="font-mono text-sm">{payment.invoiceId}</p>
                  </div>
                )}
                
                {payment.metadata && Object.keys(payment.metadata).length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground">Metadata</p>
                    <div className="bg-muted p-3 rounded-lg">
                      <pre className="text-xs overflow-auto">
                        {JSON.stringify(payment.metadata, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="p-3 bg-muted rounded-lg">
                <CreditCard className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">
                    {payment.method.brand.toUpperCase()} •••• {payment.method.last4}
                  </p>
                  {payment.method.isDefault && (
                    <Badge variant="secondary" className="text-xs">
                      Default
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Expires {payment.method.expiry}
                </p>
                {payment.method.billingAddress && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {payment.method.billingAddress.city}, {payment.method.billingAddress.state} {payment.method.billingAddress.postalCode}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              {payment.status === 'succeeded' && (
                <Button
                  onClick={handleDownloadReceipt}
                  variant="outline"
                  className="flex-1"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Receipt
                </Button>
              )}
              
              {payment.status === 'failed' && (
                <Button
                  onClick={handleRetryPayment}
                  disabled={retryPayment.isPending}
                  className="flex-1"
                >
                  {retryPayment.isPending ? (
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
              
              {payment.invoiceId && (
                <Button
                  onClick={() => {
                    // In a real app, this would open the invoice
                    toast.success('Opening invoice...');
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  View Invoice
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Status-specific Information */}
        {payment.status === 'failed' && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="h-5 w-5" />
                Payment Failed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700">
                This payment could not be processed. You can retry the payment or contact support for assistance.
              </p>
            </CardContent>
          </Card>
        )}

        {payment.status === 'processing' && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Loader2 className="h-5 w-5 animate-spin" />
                Processing Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-700">
                Your payment is being processed. This may take a few minutes. You will receive a notification once it&apos;s complete.
              </p>
            </CardContent>
          </Card>
        )}

        {payment.status === 'pending' && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-800">
                <Clock className="h-5 w-5" />
                Payment Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-yellow-700">
                Your payment is pending confirmation. This usually happens with bank transfers or other payment methods that require additional verification.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  FileText, 
  Calendar, 
  DollarSign, 
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  User,
  Building
} from 'lucide-react';
import { toast } from 'sonner';
import { Invoice } from '@/lib/types/payments';
import { 
  formatCurrency, 
  formatPaymentDate, 
  getInvoiceStatusColor,
  isPaymentOverdue
} from '@/lib/utils/payments';
import { useDownloadInvoice } from '@/hooks/use-billing';

interface InvoiceDetailsProps {
  invoice: Invoice;
  className?: string;
}

export function InvoiceDetails({ invoice, className }: InvoiceDetailsProps) {
  const downloadInvoice = useDownloadInvoice();

  const handleDownloadInvoice = async () => {
    try {
      await downloadInvoice.mutateAsync(invoice.id);
    } catch (error) {
      toast.error('Failed to download invoice');
    }
  };

  const getStatusIcon = () => {
    const isOverdue = invoice.status === 'open' && isPaymentOverdue(invoice.dueDate);
    const displayStatus = isOverdue ? 'overdue' : invoice.status;
    
    switch (displayStatus) {
      case 'paid':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'open':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'overdue':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'draft':
        return <FileText className="h-5 w-5 text-gray-600" />;
      case 'void':
        return <XCircle className="h-5 w-5 text-gray-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusMessage = () => {
    const isOverdue = invoice.status === 'open' && isPaymentOverdue(invoice.dueDate);
    
    if (isOverdue) {
      return {
        title: 'Invoice Overdue',
        description: 'This invoice is past its due date and requires immediate payment.',
        variant: 'error' as const,
      };
    }
    
    switch (invoice.status) {
      case 'paid':
        return {
          title: 'Invoice Paid',
          description: 'This invoice has been paid in full.',
          variant: 'success' as const,
        };
      case 'open':
        return {
          title: 'Invoice Open',
          description: 'This invoice is awaiting payment.',
          variant: 'warning' as const,
        };
      case 'draft':
        return {
          title: 'Draft Invoice',
          description: 'This is a draft invoice and has not been finalized.',
          variant: 'info' as const,
        };
      case 'void':
        return {
          title: 'Invoice Void',
          description: 'This invoice has been voided and is no longer valid.',
          variant: 'error' as const,
        };
      default:
        return {
          title: 'Invoice Status',
          description: 'Current status of this invoice.',
          variant: 'info' as const,
        };
    }
  };

  const statusMessage = getStatusMessage();
  const isOverdue = invoice.status === 'open' && isPaymentOverdue(invoice.dueDate);
  const displayStatus = isOverdue ? 'overdue' : invoice.status;

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Invoice Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon()}
                <div>
                  <CardTitle className="text-lg">{invoice.number}</CardTitle>
                  <CardDescription>
                    Invoice ID: {invoice.id}
                  </CardDescription>
                </div>
              </div>
              <div className="text-right">
                <Badge 
                  variant="secondary" 
                  className={getInvoiceStatusColor(displayStatus as 'draft' | 'open' | 'paid' | 'void' | 'uncollectible')}
                >
                  {displayStatus}
                </Badge>
                <p className="text-2xl font-bold mt-2">
                  {formatCurrency(invoice.amount, invoice.currency)}
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Invoice Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Invoice Dates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Invoice Date</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">
                      {formatPaymentDate(invoice.date)}
                    </p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                      {formatPaymentDate(invoice.dueDate)}
                    </p>
                  </div>
                </div>
                
                {invoice.paymentId && (
                  <div>
                    <p className="text-sm text-muted-foreground">Payment ID</p>
                    <p className="font-mono text-sm">{invoice.paymentId}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Amount Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Subtotal</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(invoice.amount, invoice.currency)}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Currency</p>
                  <p className="font-medium">{invoice.currency}</p>
                </div>
                
                {invoice.metadata && Object.keys(invoice.metadata).length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground">Additional Information</p>
                    <div className="bg-muted p-3 rounded-lg">
                      <pre className="text-xs overflow-auto">
                        {JSON.stringify(invoice.metadata, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoice Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Invoice Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <p className="font-medium">{item.description}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {item.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.unitPrice, invoice.currency)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.total, invoice.currency)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            <Separator className="my-4" />
            
            <div className="flex justify-end">
              <div className="text-right">
                <div className="flex items-center gap-4 text-lg font-semibold">
                  <span>Total:</span>
                  <span>{formatCurrency(invoice.amount, invoice.currency)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status-specific Information */}
        {isOverdue && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="h-5 w-5" />
                Overdue Invoice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700">
                This invoice is past its due date. Please make payment immediately to avoid any service interruptions.
              </p>
            </CardContent>
          </Card>
        )}

        {invoice.status === 'open' && !isOverdue && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-800">
                <Clock className="h-5 w-5" />
                Payment Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-yellow-700">
                This invoice is awaiting payment. Please make payment by the due date to avoid any late fees.
              </p>
            </CardContent>
          </Card>
        )}

        {invoice.status === 'paid' && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                Invoice Paid
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-700">
                This invoice has been paid in full. Thank you for your payment.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button
                onClick={handleDownloadInvoice}
                disabled={downloadInvoice.isPending}
                className="flex-1"
              >
                {downloadInvoice.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </>
                )}
              </Button>
              
              {invoice.status === 'open' && (
                <Button
                  onClick={() => {
                    // In a real app, this would initiate payment
                    toast.success('Redirecting to payment...');
                  }}
                  className="flex-1"
                >
                  <DollarSign className="mr-2 h-4 w-4" />
                  Pay Now
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

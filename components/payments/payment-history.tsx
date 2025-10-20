'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  RefreshCw, 
  CreditCard,
  Calendar,
  DollarSign,
  MoreHorizontal
} from 'lucide-react';
import { toast } from 'sonner';
import { Payment } from '@/lib/types/payments';
import { 
  usePayments, 
  usePaymentFilters, 
  useRetryPayment 
} from '@/hooks/use-payments';
import { 
  formatCurrency, 
  formatPaymentDate, 
  getPaymentStatusColor, 
  getPaymentStatusIcon,
  searchPayments,
  filterPaymentsByStatus,
  filterPaymentsByDateRange
} from '@/lib/utils/payments';
import { PAYMENT_STATUSES } from '@/lib/constants/payment-methods';
import { PaymentDetails } from './payment-details';

interface PaymentHistoryProps {
  className?: string;
}

export function PaymentHistory({ className }: PaymentHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const { filters, updateFilter, clearFilters, hasActiveFilters } = usePaymentFilters();
  const { data: payments, isLoading, refetch } = usePayments(filters);
  const retryPayment = useRetryPayment();

  // Apply filters to payments
  const filteredPayments = React.useMemo(() => {
    if (!payments) return [];
    
    let filtered = [...payments];
    
    // Search filter
    if (searchQuery) {
      filtered = searchPayments(filtered, searchQuery);
    }
    
    // Status filter
    if (statusFilter) {
      filtered = filterPaymentsByStatus(filtered, statusFilter as 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled' | 'refunded' | 'partially_refunded');
    }
    
    // Date range filter
    if (dateFrom && dateTo) {
      filtered = filterPaymentsByDateRange(filtered, dateFrom, dateTo);
    }
    
    return filtered;
  }, [payments, searchQuery, statusFilter, dateFrom, dateTo]);

  const handleRetryPayment = async (paymentId: string) => {
    try {
      await retryPayment.mutateAsync({ paymentId });
      toast.success('Payment retry initiated');
    } catch (error) {
      toast.error('Failed to retry payment');
    }
  };

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsDetailsOpen(true);
  };

  const handleDownloadReceipt = (payment: Payment) => {
    // In a real app, this would download the receipt
    toast.success('Receipt download started');
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setDateFrom('');
    setDateTo('');
    clearFilters();
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment History
            </CardTitle>
            <CardDescription>
              View and manage your payment history
            </CardDescription>
          </div>
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Filters */}
        <div className="space-y-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search payments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value={PAYMENT_STATUSES.SUCCEEDED}>Succeeded</SelectItem>
                <SelectItem value={PAYMENT_STATUSES.FAILED}>Failed</SelectItem>
                <SelectItem value={PAYMENT_STATUSES.PENDING}>Pending</SelectItem>
                <SelectItem value={PAYMENT_STATUSES.PROCESSING}>Processing</SelectItem>
                <SelectItem value={PAYMENT_STATUSES.CANCELLED}>Cancelled</SelectItem>
                <SelectItem value={PAYMENT_STATUSES.REFUNDED}>Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="date"
                placeholder="From date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Input
                type="date"
                placeholder="To date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            {hasActiveFilters && (
              <Button
                onClick={clearAllFilters}
                variant="outline"
                size="sm"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Payment Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-muted-foreground">Loading payments...</span>
          </div>
        ) : filteredPayments.length > 0 ? (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {formatPaymentDate(payment.date)}
                        </span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div>
                        <p className="font-medium">{payment.description}</p>
                        {payment.reference && (
                          <p className="text-sm text-muted-foreground">
                            Ref: {payment.reference}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {formatCurrency(payment.amount, payment.currency)}
                        </span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className={getPaymentStatusColor(payment.status)}
                      >
                        {payment.status}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {payment.method.brand.toUpperCase()} •••• {payment.method.last4}
                        </span>
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewDetails(payment)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {payment.status === 'succeeded' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDownloadReceipt(payment)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {payment.status === 'failed' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRetryPayment(payment.id)}
                            disabled={retryPayment.isPending}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Payments Found</h3>
            <p className="text-muted-foreground">
              {hasActiveFilters 
                ? 'No payments match your current filters.' 
                : 'You haven\'t made any payments yet.'
              }
            </p>
            {hasActiveFilters && (
              <Button
                onClick={clearAllFilters}
                variant="outline"
                className="mt-4"
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}

        {/* Payment Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Payment Details</DialogTitle>
              <DialogDescription>
                Detailed information about this payment
              </DialogDescription>
            </DialogHeader>
            {selectedPayment && (
              <PaymentDetails payment={selectedPayment} />
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

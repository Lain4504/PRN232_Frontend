'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getUserPaymentHistory } from '@/lib/api/subscription'
import { formatCurrency } from '@/lib/stripe'
import { toast } from 'sonner'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { PaymentResponseDto } from '@/lib/types/subscription'
import { 
  CreditCard, 
  History, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Download,
  ArrowLeft,
  RefreshCw,
  ExternalLink,
  MoreHorizontal
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState<PaymentResponseDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPaymentHistory()
  }, [])

  const loadPaymentHistory = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getUserPaymentHistory()
      setPayments(data)
    } catch (error) {
      console.error('Error loading payment history:', error)
      setError('Failed to load payment history')
      toast.error('Failed to load payment history')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: number) => {
    switch (status) {
      case 1: // Success
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 2: // Failed
        return <XCircle className="h-5 w-5 text-red-500" />
      case 3: // Refunded
        return <RefreshCw className="h-5 w-5 text-orange-500" />
      case 0: // Pending
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1: // Success
        return <Badge className="bg-green-100 text-green-800">Success</Badge>
      case 2: // Failed
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      case 3: // Refunded
        return <Badge className="bg-orange-100 text-orange-800">Refunded</Badge>
      case 0: // Pending
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const truncateId = (id: string | undefined | null, length = 12) => {
    if (!id) return 'N/A'
    return id.length > length ? `${id.substring(0, length)}...` : id
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Payment History</h1>
              <p className="text-muted-foreground mt-2">
                View all your past transactions and invoices
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/account">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
          </div>

          {/* Summary Card */}
          {payments.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Summary</CardTitle>
                <CardDescription>Your payment overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Total Payments</div>
                    <div className="text-2xl font-bold mt-1">{payments.length}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Total Amount</div>
                    <div className="text-2xl font-bold mt-1">
                      {formatCurrency(
                        payments.reduce((sum, p) => sum + p.amount, 0)
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Successful Payments</div>
                    <div className="text-2xl font-bold mt-1">
                      {payments.filter(p => p.status === 1).length}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payments Table */}
          {payments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="mb-4">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Payment History</h3>
                <p className="text-muted-foreground mb-4">
                  You don&apos;t have any payment transactions yet.
                </p>
                <Button asChild>
                  <Link href="/dashboard/subscription">
                    View Subscriptions
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>All your payment transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Subscription</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(payment.status)}
                            {getStatusBadge(payment.status)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatShortDate(payment.createdAt)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(payment.createdAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {formatCurrency(payment.amount)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {payment.currency}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-mono text-sm">
                            {truncateId(payment.transactionId)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="capitalize">
                            {payment.paymentMethod || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          {payment.subscriptionId ? (
                            <div className="font-mono text-xs">
                              {truncateId(payment.subscriptionId)}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {payment.invoiceUrl ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <a 
                                    href={payment.invoiceUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center"
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download Invoice
                                  </a>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}


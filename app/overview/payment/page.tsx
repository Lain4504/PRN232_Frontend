'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
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
import { formatCurrency, cn } from '@/lib/utils'
import { toast } from 'sonner'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PaymentResponseDto, PaymentStatusEnum } from '@/lib/types/subscription'
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  ArrowLeft,
  RefreshCw,
  MoreVertical,
  History,
  TrendingUp,
  Receipt
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
      setError('Không thể tải lịch sử thanh toán')
      toast.error('Không thể tải lịch sử thanh toán')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string | number | null | undefined) => {
    if (typeof status === 'number') {
      switch (status) {
        case PaymentStatusEnum.Success:
          return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 rounded-md px-2 py-0.5 text-[10px] font-bold">Thành công</Badge>
        case PaymentStatusEnum.Failed:
          return <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20 rounded-md px-2 py-0.5 text-[10px] font-bold">Thất bại</Badge>
        case PaymentStatusEnum.Refunded:
          return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 rounded-md px-2 py-0.5 text-[10px] font-bold">Hoàn tiền</Badge>
        case PaymentStatusEnum.Pending:
        default:
          return <Badge variant="outline" className="rounded-md px-2 py-0.5 text-[10px] font-bold">Đang xử lý</Badge>
      }
    }

    const s = String(status || '').toLowerCase()
    switch (s) {
      case 'succeeded':
      case 'success':
      case 'paid':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 rounded-md px-2 py-0.5 text-[10px] font-bold">Thành công</Badge>
      case 'failed':
      case 'failure':
        return <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20 rounded-md px-2 py-0.5 text-[10px] font-bold">Thất bại</Badge>
      case 'refunded':
      case 'refund':
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 rounded-md px-2 py-0.5 text-[10px] font-bold">Hoàn tiền</Badge>
      default:
        return <Badge variant="outline" className="rounded-md px-2 py-0.5 text-[10px] font-bold">Đang xử lý</Badge>
    }
  }

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-8 space-y-12">
        <div className="space-y-4">
          <div className="h-4 w-32 bg-slate-50 dark:bg-slate-800 animate-pulse rounded" />
          <div className="h-10 w-64 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" />
        </div>
        <div className="h-32 w-full bg-slate-50 dark:bg-slate-900 animate-pulse rounded-2xl border border-slate-100 dark:border-slate-800" />
        <div className="h-96 w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-6 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border pb-10">
        <div className="space-y-4">
          <Link href="/overview" className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            Quay lại tổng quan
          </Link>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Lịch sử giao dịch
            </h1>
            <p className="text-sm text-muted-foreground font-medium max-w-xl italic">
              Theo dõi lộ trình đầu tư tài chính và đối soát hóa đơn định kỳ.
            </p>
          </div>
        </div>
        <div className="flex items-center">
          <div className="text-right">
            <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Tổng chi tiêu</p>
            <p className="text-3xl font-bold text-foreground leading-none">
              {formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}
            </p>
          </div>
        </div>
      </div>

      {payments.length === 0 ? (
        <Card className="rounded-lg border-border border-dashed bg-muted/20">
          <CardContent className="text-center py-20">
            <div className="size-16 rounded-full bg-card flex items-center justify-center mb-6 shadow-sm border border-border mx-auto">
              <CreditCard className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Chưa có giao dịch phát sinh</h3>
            <p className="text-muted-foreground font-medium mb-8 max-w-sm mx-auto italic">
              Hệ thống hiện chưa ghi nhận bất kỳ chứng từ thanh toán nào từ phía bạn.
            </p>
            <Button asChild className="rounded-md font-bold px-8 shadow-lg">
              <Link href="/dashboard/subscription">
                Khám phá dịch vụ
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="rounded-lg border-border shadow-sm bg-card p-6 flex items-center gap-4 border">
              <div className="size-12 rounded-md bg-muted flex items-center justify-center text-foreground">
                <History className="size-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tổng giao dịch</p>
                <p className="text-xl font-bold text-foreground">{payments.length}</p>
              </div>
            </Card>
            <Card className="rounded-lg border-border shadow-sm bg-card p-6 flex items-center gap-4 border">
              <div className="size-12 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <TrendingUp className="size-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Thành công</p>
                <p className="text-xl font-bold text-foreground">
                  {payments.filter(p =>
                    p.status === PaymentStatusEnum.Success ||
                    ['succeeded', 'success', 'paid'].includes(String(p.status).toLowerCase())
                  ).length}
                </p>
              </div>
            </Card>
            <Card className="rounded-lg border-border shadow-sm bg-card p-6 flex items-center gap-4 border">
              <div className="size-12 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                <Receipt className="size-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Hóa đơn</p>
                <p className="text-xl font-bold text-foreground">Hợp lệ</p>
              </div>
            </Card>
          </div>

          {/* Table */}
          <Card className="rounded-lg border-border shadow-sm overflow-hidden bg-card border">
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="py-5 px-6 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Trạng thái</TableHead>
                    <TableHead className="py-5 px-6 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Thời điểm</TableHead>
                    <TableHead className="py-5 px-6 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Giá trị</TableHead>
                    <TableHead className="py-5 px-6 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Định danh</TableHead>
                    <TableHead className="py-5 px-6 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Hình thức</TableHead>
                    <TableHead className="py-5 px-6 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id} className="border-border hover:bg-muted/10 transition-colors group">
                      <TableCell className="py-5 px-6">
                        {getStatusBadge(payment.status)}
                      </TableCell>
                      <TableCell className="py-5 px-6">
                        <div className="text-sm font-bold text-foreground">
                          {formatShortDate(payment.createdAt)}
                        </div>
                        <div className="text-[10px] font-medium text-muted-foreground mt-0.5">
                          {new Date(payment.createdAt).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </TableCell>
                      <TableCell className="py-5 px-6">
                        <div className="text-sm font-bold text-foreground">
                          {formatCurrency(payment.amount)}
                        </div>
                        <div className="text-[10px] font-bold text-primary uppercase tracking-widest mt-0.5">
                          {payment.currency}
                        </div>
                      </TableCell>
                      <TableCell className="py-5 px-6">
                        <div className="font-mono text-[11px] text-muted-foreground">
                          {payment.transactionId ? `${payment.transactionId.substring(0, 12)}...` : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell className="py-5 px-6">
                        <div className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                          <CreditCard className="size-3.5 opacity-40" />
                          {payment.paymentMethod || 'Cổng PayOS'}
                        </div>
                      </TableCell>
                      <TableCell className="py-5 px-6 text-right">
                        {payment.invoiceUrl ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-md hover:bg-muted">
                                <MoreVertical className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-md border-border p-1 shadow-xl bg-popover">
                              <DropdownMenuItem asChild>
                                <a
                                  href={payment.invoiceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-3 p-2 font-bold text-xs uppercase tracking-wide cursor-pointer rounded-md focus:bg-accent focus:text-accent-foreground"
                                >
                                  <Download className="h-4 w-4 opacity-50" />
                                  Tải hóa đơn (PDF)
                                </a>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <span className="text-muted-foreground/20">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

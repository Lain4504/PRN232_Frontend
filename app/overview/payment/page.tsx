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
          return <Badge className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20 rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">Thành công</Badge>
        case PaymentStatusEnum.Failed:
          return <Badge className="bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20 rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">Thất bại</Badge>
        case PaymentStatusEnum.Refunded:
          return <Badge className="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20 rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">Hoàn tiền</Badge>
        case PaymentStatusEnum.Pending:
        default:
          return <Badge className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-800 rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">Đang xử lý</Badge>
      }
    }

    const s = String(status || '').toLowerCase()
    switch (s) {
      case 'succeeded':
      case 'success':
      case 'paid':
        return <Badge className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20 rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">Thành công</Badge>
      case 'failed':
      case 'failure':
        return <Badge className="bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20 rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">Thất bại</Badge>
      case 'refunded':
      case 'refund':
        return <Badge className="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20 rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">Hoàn tiền</Badge>
      default:
        return <Badge className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-800 rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">Đang xử lý</Badge>
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
    <div className="max-w-6xl mx-auto py-12 px-8 space-y-12 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-slate-100 dark:border-slate-800 pb-12">
        <div className="space-y-6">
          <Link href="/overview" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            Quay lại tổng quan
          </Link>
          <div className="space-y-2">
            <h1 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Lịch sử giao dịch
            </h1>
            <p className="text-sm md:text-lg text-slate-500 dark:text-slate-400 font-medium max-w-xl">
              Theo dõi toàn bộ quá trình thanh toán và tải xuống hóa đơn của bạn.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-12">
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Tổng chi tiêu</p>
            <p className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-none">
              {formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}
            </p>
          </div>
        </div>
      </div>

      {payments.length === 0 ? (
        <Card className="rounded-3xl border-slate-100 dark:border-slate-800 border-dashed bg-slate-50/50 dark:bg-slate-900/20">
          <CardContent className="text-center py-24">
            <div className="size-16 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center mb-6 shadow-sm border border-slate-100 dark:border-slate-800 mx-auto">
              <CreditCard className="h-8 w-8 text-slate-200 dark:text-slate-700" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Chưa có giao dịch nào</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 max-w-sm mx-auto">
              Bạn chưa thực hiện bất kỳ giao dịch thanh toán nào trên hệ thống.
            </p>
            <Button asChild className="rounded-xl font-bold bg-slate-900 dark:bg-primary hover:bg-slate-800 dark:hover:bg-primary/90 text-white px-8">
              <Link href="/dashboard/subscription">
                Xem các gói dịch vụ
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 p-6 flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white">
                <History className="size-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Giao dịch</p>
                <p className="text-xl font-black text-slate-900 dark:text-white">{payments.length}</p>
              </div>
            </Card>
            <Card className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 p-6 flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="size-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Thành công</p>
                <p className="text-xl font-black text-slate-900 dark:text-white">
                  {payments.filter(p =>
                    p.status === PaymentStatusEnum.Success ||
                    ['succeeded', 'success', 'paid'].includes(String(p.status).toLowerCase())
                  ).length}
                </p>
              </div>
            </Card>
            <Card className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 p-6 flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Receipt className="size-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Hóa đơn</p>
                <p className="text-xl font-black text-slate-900 dark:text-white">Sẵn sàng</p>
              </div>
            </Card>
          </div>

          {/* Table */}
          <Card className="rounded-3xl border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                  <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                    <TableHead className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Trạng thái</TableHead>
                    <TableHead className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Ngày giao dịch</TableHead>
                    <TableHead className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Số tiền</TableHead>
                    <TableHead className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Mã giao dịch</TableHead>
                    <TableHead className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Phương thức</TableHead>
                    <TableHead className="py-6 px-8 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Tác vụ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id} className="border-slate-50 dark:border-slate-800 hover:bg-slate-50/30 dark:hover:bg-slate-800 transition-colors group">
                      <TableCell className="py-6 px-8">
                        {getStatusBadge(payment.status)}
                      </TableCell>
                      <TableCell className="py-6 px-8">
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                          {formatShortDate(payment.createdAt)}
                        </div>
                        <div className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                          {new Date(payment.createdAt).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </TableCell>
                      <TableCell className="py-6 px-8">
                        <div className="text-sm font-black text-slate-900 dark:text-white">
                          {formatCurrency(payment.amount)}
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                          {payment.currency}
                        </div>
                      </TableCell>
                      <TableCell className="py-6 px-8">
                        <div className="font-mono text-xs text-slate-400 dark:text-slate-500">
                          {payment.transactionId ? `${payment.transactionId.substring(0, 12)}...` : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell className="py-6 px-8">
                        <div className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <CreditCard className="size-3 opacity-40 dark:opacity-20" />
                          {payment.paymentMethod || 'PayOS'}
                        </div>
                      </TableCell>
                      <TableCell className="py-6 px-8 text-right">
                        {payment.invoiceUrl ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm">
                                <MoreVertical className="h-4 w-4 text-slate-400 dark:text-slate-600" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl border-slate-100 dark:border-slate-800 p-1 shadow-xl bg-white dark:bg-slate-900">
                              <DropdownMenuItem asChild>
                                <a
                                  href={payment.invoiceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-3 p-2 font-bold text-xs uppercase tracking-wide cursor-pointer rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white"
                                >
                                  <Download className="h-4 w-4 opacity-50" />
                                  Tải hóa đơn (PDF)
                                </a>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <span className="text-slate-200 dark:text-slate-800">-</span>
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

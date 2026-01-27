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
import { formatCurrency } from '@/lib/stripe'
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
import { cn } from '@/lib/utils'

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
          return <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">Thành công</Badge>
        case PaymentStatusEnum.Failed:
          return <Badge className="bg-rose-50 text-rose-600 border-rose-100 rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">Thất bại</Badge>
        case PaymentStatusEnum.Refunded:
          return <Badge className="bg-amber-50 text-amber-600 border-amber-100 rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">Hoàn tiền</Badge>
        case PaymentStatusEnum.Pending:
        default:
          return <Badge className="bg-slate-50 text-slate-500 border-slate-100 rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">Đang xử lý</Badge>
      }
    }

    const s = String(status || '').toLowerCase()
    switch (s) {
      case 'succeeded':
      case 'success':
      case 'paid':
        return <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">Thành công</Badge>
      case 'failed':
      case 'failure':
        return <Badge className="bg-rose-50 text-rose-600 border-rose-100 rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">Thất bại</Badge>
      case 'refunded':
      case 'refund':
        return <Badge className="bg-amber-50 text-amber-600 border-amber-100 rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">Hoàn tiền</Badge>
      default:
        return <Badge className="bg-slate-50 text-slate-500 border-slate-100 rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">Đang xử lý</Badge>
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
          <div className="h-4 w-32 bg-slate-50 animate-pulse rounded" />
          <div className="h-10 w-64 bg-slate-100 animate-pulse rounded-lg" />
        </div>
        <div className="h-32 w-full bg-slate-50 animate-pulse rounded-[2rem] border border-slate-100" />
        <div className="h-96 w-full bg-slate-100 animate-pulse rounded-[2rem]" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-8 space-y-12 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-slate-100 pb-12">
        <div className="space-y-6">
          <Link href="/overview" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            Quay lại tổng quan
          </Link>
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight text-slate-900">
              Lịch sử giao dịch
            </h1>
            <p className="text-lg text-slate-500 font-medium max-w-xl">
              Theo dõi toàn bộ quá trình thanh toán và tải xuống hóa đơn của bạn.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-12">
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Tổng chi tiêu</p>
            <p className="text-3xl font-black text-slate-900 leading-none">
              {formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}
            </p>
          </div>
        </div>
      </div>

      {payments.length === 0 ? (
        <Card className="rounded-[2.5rem] border-slate-100 border-dashed bg-slate-50/50">
          <CardContent className="text-center py-24">
            <div className="size-16 rounded-2xl bg-white flex items-center justify-center mb-6 shadow-sm border border-slate-100 mx-auto">
              <CreditCard className="h-8 w-8 text-slate-200" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Chưa có giao dịch nào</h3>
            <p className="text-slate-500 font-medium mb-8 max-w-sm mx-auto">
              Bạn chưa thực hiện bất kỳ giao dịch thanh toán nào trên hệ thống.
            </p>
            <Button asChild className="rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white px-8">
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
            <Card className="rounded-[2rem] border-slate-100 shadow-sm bg-white p-6 flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-900">
                <History className="size-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Giao dịch</p>
                <p className="text-xl font-black text-slate-900">{payments.length}</p>
              </div>
            </Card>
            <Card className="rounded-[2rem] border-slate-100 shadow-sm bg-white p-6 flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <TrendingUp className="size-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Thành công</p>
                <p className="text-xl font-black text-slate-900">
                  {payments.filter(p =>
                    p.status === PaymentStatusEnum.Success ||
                    ['succeeded', 'success', 'paid'].includes(String(p.status).toLowerCase())
                  ).length}
                </p>
              </div>
            </Card>
            <Card className="rounded-[2rem] border-slate-100 shadow-sm bg-white p-6 flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Receipt className="size-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hóa đơn</p>
                <p className="text-xl font-black text-slate-900">Sẵn sàng</p>
              </div>
            </Card>
          </div>

          {/* Table */}
          <Card className="rounded-[2.5rem] border-slate-100 shadow-sm overflow-hidden bg-white">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="border-slate-100 hover:bg-transparent">
                    <TableHead className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Trạng thái</TableHead>
                    <TableHead className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Ngày giao dịch</TableHead>
                    <TableHead className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Số tiền</TableHead>
                    <TableHead className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Mã giao dịch</TableHead>
                    <TableHead className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Phương thức</TableHead>
                    <TableHead className="py-6 px-8 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Tác vụ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id} className="border-slate-50 hover:bg-slate-50/30 transition-colors group">
                      <TableCell className="py-6 px-8">
                        {getStatusBadge(payment.status)}
                      </TableCell>
                      <TableCell className="py-6 px-8">
                        <div className="text-sm font-bold text-slate-900">
                          {formatShortDate(payment.createdAt)}
                        </div>
                        <div className="text-[10px] font-medium text-slate-400">
                          {new Date(payment.createdAt).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </TableCell>
                      <TableCell className="py-6 px-8">
                        <div className="text-sm font-black text-slate-900">
                          {formatCurrency(payment.amount)}
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {payment.currency}
                        </div>
                      </TableCell>
                      <TableCell className="py-6 px-8">
                        <div className="font-mono text-xs text-slate-400">
                          {payment.transactionId ? `${payment.transactionId.substring(0, 12)}...` : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell className="py-6 px-8">
                        <div className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                          <CreditCard className="size-3 opacity-40" />
                          {payment.paymentMethod || 'Stripe'}
                        </div>
                      </TableCell>
                      <TableCell className="py-6 px-8 text-right">
                        {payment.invoiceUrl ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-white hover:shadow-sm">
                                <MoreVertical className="h-4 w-4 text-slate-400" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl border-slate-100 p-1 shadow-xl">
                              <DropdownMenuItem asChild>
                                <a
                                  href={payment.invoiceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-3 p-2 font-bold text-xs uppercase tracking-wide cursor-pointer rounded-lg hover:bg-slate-50"
                                >
                                  <Download className="h-4 w-4 opacity-50" />
                                  Tải hóa đơn (PDF)
                                </a>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <span className="text-slate-200">-</span>
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

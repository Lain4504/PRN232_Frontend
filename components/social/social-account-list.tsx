"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Trash2,
  MoreHorizontal,
  Eye,
  RefreshCw,
  AlertTriangle,
  Link,
  Shield,
  Zap,
  Clock,
  ExternalLink
} from 'lucide-react'
import { ActionsDropdown, ActionItem } from '@/components/ui/actions-dropdown'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { SocialAccountDto, SocialAuthUrlResponse } from '@/lib/types/omniadly-types'
import { LinkIntegrationModal } from './link-integration-modal'
import { IntegrationsModal } from './integrations-modal'
import { useUnlinkAccount, useUnlinkTarget } from '@/hooks/use-social-accounts'
import { toast } from 'sonner'
import { SiFacebook, SiInstagram, SiTiktok } from "@icons-pack/react-simple-icons"
import { api, endpoints } from '@/lib/api'
import { cn } from "@/lib/utils"

interface SocialAccountListProps {
  accounts: SocialAccountDto[]
  userId: string
  onRefresh?: () => void
}

const providerIcons = {
  facebook: SiFacebook,
  tiktok: SiTiktok,
  instagram: SiInstagram,
} as const

const providerColors = {
  facebook: 'bg-[#1877F2]',
  tiktok: 'bg-black',
  instagram: 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]',
} as const

export function SocialAccountList({ accounts, userId, onRefresh }: SocialAccountListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<{ accountId: string; targetId?: string } | null>(null)
  const [integrationsModalOpen, setIntegrationsModalOpen] = useState<{ accountId: string; account: SocialAccountDto } | null>(null)
  const [linkModalOpen, setLinkModalOpen] = useState<{ accountId: string; provider: string } | null>(null)
  const [isReAuthing, setIsReAuthing] = useState<string | null>(null)

  const unlinkAccountMutation = useUnlinkAccount()
  const unlinkTargetMutation = useUnlinkTarget()

  const handleDeleteAccount = async (accountId: string) => {
    try {
      await unlinkAccountMutation.mutateAsync({ socialAccountId: accountId })
      toast.success('Đã hủy kết nối tài khoản')
      onRefresh?.()
    } catch (error) {
      toast.error('Lỗi khi hủy kết nối')
    } finally {
      setDeleteDialogOpen(null)
    }
  }

  const handleDeleteTarget = async (targetId: string) => {
    try {
      await unlinkTargetMutation.mutateAsync({ socialIntegrationId: targetId })
      toast.success('Đã hủy tích hợp trang')
      onRefresh?.()
      setIntegrationsModalOpen(null)
    } catch (error) {
      toast.error('Lỗi khi hủy tích hợp')
    } finally {
      setDeleteDialogOpen(null)
    }
  }

  const handleReAuth = async (provider: 'facebook' | 'tiktok' | 'instagram', accountId: string) => {
    try {
      setIsReAuthing(accountId)
      const response = await api.get<SocialAuthUrlResponse>(endpoints.socialAuth(provider))
      if (response.data?.authUrl) {
        window.location.href = response.data.authUrl
      } else {
        toast.error('Không thể lấy URL xác thực')
      }
    } catch (error) {
      toast.error('Lỗi khởi tạo xác thực')
    } finally {
      setIsReAuthing(null)
    }
  }

  if (accounts.length === 0) return null

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <Table className="w-full border-separate border-spacing-0">
          <TableHeader>
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="py-6 px-8 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-50">Tài khoản & Nền tảng</TableHead>
              <TableHead className="py-6 px-8 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-50">Trạng thái</TableHead>
              <TableHead className="hidden md:table-cell py-6 px-8 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-50">Đăng ký lúc</TableHead>
              <TableHead className="hidden lg:table-cell py-6 px-8 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-50">Thời hạn mã</TableHead>
              <TableHead className="py-6 px-8 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-50">Tích hợp</TableHead>
              <TableHead className="w-16 py-6 px-8 border-b border-slate-50"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => {
              const Icon = providerIcons[account.provider]
              const colorClass = providerColors[account.provider]
              const isExpired = account.expiresAt ? new Date(account.expiresAt) < new Date() : false

              return (
                <TableRow key={account.id} className="group hover:bg-slate-50/50 transition-colors border-none">
                  <TableCell className="py-6 px-8 border-b border-slate-50">
                    <div className="flex items-center gap-4">
                      <div className={cn("size-12 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200 group-hover:scale-110 transition-transform", colorClass)}>
                        <Icon className="size-6 text-white" />
                      </div>
                      <div className="space-y-1">
                        <div className="font-black text-slate-900 text-lg leading-none capitalize">
                          {account.provider} <span className="text-slate-300 font-medium">Node</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-slate-100/50 text-slate-400 border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg">PROT: OAUTH 2.0</Badge>
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-6 px-8 border-b border-slate-50">
                    <div className="flex items-center gap-2">
                      <div className={cn("size-2 rounded-full", account.isActive && !isExpired ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-rose-500")} />
                      <span className={cn("text-[9px] font-black uppercase tracking-widest", account.isActive && !isExpired ? "text-emerald-600" : "text-rose-500")}>
                        {account.isActive && !isExpired ? 'Đang hoạt động' : (isExpired ? 'Hết hạn mã' : 'Ngắt kết nối')}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="hidden md:table-cell py-6 px-8 border-b border-slate-50">
                    <div className="text-[10px] font-black text-slate-900 flex items-center gap-2">
                      <Clock className="size-3 text-slate-300" />
                      {new Date(account.createdAt).toLocaleDateString('vi-VN').replace(/\//g, '.')}
                    </div>
                  </TableCell>

                  <TableCell className="hidden lg:table-cell py-6 px-8 border-b border-slate-50">
                    <div className={cn("text-[10px] font-black uppercase tracking-widest", isExpired ? "text-rose-500" : "text-slate-400")}>
                      {account.expiresAt ? new Date(account.expiresAt).toLocaleDateString('vi-VN').replace(/\//g, '.') : 'Vô thời hạn'}
                    </div>
                  </TableCell>

                  <TableCell className="py-6 px-8 border-b border-slate-50">
                    <Badge variant="secondary" className="bg-slate-900 text-white border-none text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                      {account.targets?.length || 0} Trang đã gán
                    </Badge>
                  </TableCell>

                  <TableCell className="py-6 px-8 border-b border-slate-50 text-right">
                    <ActionsDropdown
                      actions={[
                        ...(account.targets?.length ? [{
                          label: "Xem tích hợp trang",
                          icon: <Eye className="size-4" />,
                          onClick: () => setIntegrationsModalOpen({ accountId: account.id, account }),
                        }] : []),
                        {
                          label: "Gia hạn quyền truy cập",
                          icon: isReAuthing === account.id ? <RefreshCw className="size-4 animate-spin" /> : <RefreshCw className="size-4" />,
                          onClick: () => handleReAuth(account.provider, account.id),
                          disabled: isReAuthing === account.id,
                        },
                        {
                          label: "Gán thương hiệu",
                          icon: <ExternalLink className="size-4" />,
                          onClick: () => setLinkModalOpen({ accountId: account.id, provider: account.provider }),
                        },
                        {
                          label: "Gỡ bỏ tài khoản",
                          icon: <Trash2 className="size-4" />,
                          onClick: () => setDeleteDialogOpen({ accountId: account.id }),
                          variant: "destructive" as const,
                        },
                      ] as ActionItem[]}
                      disabled={isReAuthing === account.id}
                    />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Link Integration Modal */}
      {linkModalOpen && (
        <LinkIntegrationModal
          socialAccountId={linkModalOpen.accountId}
          provider={linkModalOpen.provider}
          open={!!linkModalOpen}
          onOpenChange={(open) => !open && setLinkModalOpen(null)}
        />
      )}

      {/* Integrations Modal */}
      {integrationsModalOpen && (
        <IntegrationsModal
          account={integrationsModalOpen.account}
          isOpen={!!integrationsModalOpen}
          onClose={() => setIntegrationsModalOpen(null)}
          onDeleteTarget={(targetId, accountId) => setDeleteDialogOpen({ accountId, targetId })}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteDialogOpen} onOpenChange={() => setDeleteDialogOpen(null)}>
        <AlertDialogContent className="rounded-3xl border-slate-100 p-10 max-w-md shadow-2xl">
          <AlertDialogHeader className="space-y-6">
            <div className="size-20 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto border border-rose-100 shadow-sm">
              <Trash2 className="size-10" />
            </div>
            <AlertDialogTitle className="text-3xl font-black tracking-tight text-center uppercase text-slate-900">
              {deleteDialogOpen?.targetId ? 'Hủy tích hợp?' : 'Gỡ tài khoản?'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium text-slate-500 leading-relaxed text-center italic mt-2">
              {deleteDialogOpen?.targetId
                ? 'Bạn có chắc chắn muốn hủy liên kết trang này khỏi thương hiệu? Hành động này sẽ dừng mọi hoạt động đăng bài.'
                : 'Thoát khỏi mạng lưới tài khoản? Tất cả các trang và chiến dịch liên kết sẽ bị dừng hoạt động ngay lập tức.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-12 grid grid-cols-2 gap-4">
            <AlertDialogCancel className="rounded-xl h-12 font-black uppercase tracking-widest text-[10px] bg-slate-50 border-none">Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteDialogOpen?.targetId) {
                  handleDeleteTarget(deleteDialogOpen.targetId)
                } else if (deleteDialogOpen?.accountId) {
                  handleDeleteAccount(deleteDialogOpen.accountId)
                }
              }}
              className="bg-rose-500 text-white hover:bg-rose-600 rounded-xl h-12 font-black uppercase tracking-widest text-[10px] border-none shadow-lg shadow-rose-100"
            >
              {deleteDialogOpen?.targetId ? 'Xác nhận hủy' : 'Xác nhận gỡ'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

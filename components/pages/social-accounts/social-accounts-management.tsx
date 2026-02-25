"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, AlertCircle, Plus, Shield, Check, Globe } from "lucide-react"
import { useGetAccountsWithTargets } from "@/hooks/use-social-accounts"
import { SocialAccountList } from "@/components/social/social-account-list"
import { ConnectModal } from "@/components/social/connect-modal"
import { useAuth } from "@/lib/contexts/auth-context"
import { Badge } from "@/components/ui/badge"

export function SocialAccountsManagement() {
  const { user, isLoading: userLoading } = useAuth()
  const { data: accountsWithTargets = [], isLoading, error, refetch } = useGetAccountsWithTargets()

  const handleRefresh = () => {
    refetch()
  }

  if (isLoading || userLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-40 bg-muted rounded-lg" />)}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4 border border-dashed rounded-lg">
        <div className="p-4 bg-muted rounded-full">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Lỗi kết nối</h3>
          <p className="text-sm text-muted-foreground">
            Không thể tải danh sách tài khoản. Vui lòng thử lại.
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          Thử lại
        </Button>
      </div>
    )
  }

  const socialAccounts = accountsWithTargets.map(item => item.socialAccount)

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tài khoản Mạng xã hội</h2>
          <p className="text-muted-foreground">
            Kết nối và đồng bộ hóa các tài khoản social media của bạn.
          </p>
        </div>

        <ConnectModal>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Kết nối tài khoản
          </Button>
        </ConnectModal>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Tài khoản đã kết nối</h3>
            <p className="text-sm text-muted-foreground">Quản lý các kết nối mạng xã hội của bạn.</p>
          </div>
          <Badge variant="outline" className="gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            {socialAccounts.length} Đang hoạt động
          </Badge>
        </div>

        {socialAccounts.length > 0 ? (
          <Card className="overflow-hidden">
            <SocialAccountList
              accounts={socialAccounts}
              userId={user?.id || ""}
              onRefresh={handleRefresh}
            />
          </Card>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed rounded-lg bg-muted/30">
            <div className="p-4 bg-muted rounded-full mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">Chưa có kết nối nào</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
              Kết nối tài khoản mạng xã hội đầu tiên của bạn để bắt đầu.
            </p>
            <ConnectModal>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Kết nối ngay
              </Button>
            </ConnectModal>
          </div>
        )}

        {/* Security Info */}
        <Card className="bg-muted/50 border-none shadow-none">
          <div className="p-6 flex items-start gap-4">
            <Shield className="h-6 w-6 text-primary shrink-0" />
            <div className="space-y-1">
              <h4 className="font-semibold">Bảo mật & Quyền riêng tư</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Chúng tôi sử dụng giao thức OAuth 2.0 tiêu chuẩn để kết nối. 
                Thông tin đăng nhập của bạn không bao giờ được lưu trữ trên máy chủ của chúng tôi.
                Bạn có thể hủy kết nối bất kỳ lúc nào.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

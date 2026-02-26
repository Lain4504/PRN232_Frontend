"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, AlertCircle, Plus, Shield, Globe } from "lucide-react"
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border/50 pb-10 transition-all duration-300">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-primary/5 text-primary border border-primary/10">
              <Globe className="size-4" />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest italic">Cấu hình liên kết • Social Connectivity</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight italic uppercase">
            Mạng xã hội
          </h1>
          <p className="text-sm text-muted-foreground font-medium max-w-xl italic leading-relaxed">
            Kết nối và quản lý các tài khoản mạng xã hội của bạn để bắt đầu đăng bài hiệu quả.
          </p>
        </div>

        <ConnectModal>
          <Button className="h-11 px-8 rounded-md font-bold text-xs uppercase tracking-wider shadow-lg transition-all hover:-translate-y-0.5">
            <Plus className="mr-2 h-4 w-4" />
            Kết nối tài khoản
          </Button>
        </ConnectModal>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="size-2 rounded-full bg-primary" />
              <h3 className="text-lg font-bold italic uppercase tracking-tight text-foreground/80">Tài khoản đang liên kết</h3>
            </div>
            <p className="text-sm font-medium italic text-muted-foreground/60">Quản lý các tài khoản mạng xã hội của bạn trên hệ thống.</p>
          </div>
          <Badge variant="outline" className="gap-2 h-9 px-4 rounded-md border-border/50 bg-muted/20 text-[10px] font-bold uppercase tracking-widest italic text-muted-foreground">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            {socialAccounts.length} Tài khoản
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
          <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-border rounded-lg bg-muted/5 group">
            <div className="size-20 rounded-full bg-card flex items-center justify-center mb-8 shadow-sm border border-border group-hover:scale-110 transition-transform duration-500">
              <Users className="size-10 text-muted-foreground/20" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3 italic">Chưa có kết nối tài khoản</h3>
            <p className="text-sm font-medium text-muted-foreground/60 max-w-sm mb-10 italic">
              Kết nối tài khoản mạng xã hội đầu tiên để bắt đầu quản lý và đăng bài viết tự động.
            </p>
            <ConnectModal>
              <Button className="h-12 px-10 rounded-md font-bold text-xs uppercase tracking-wider shadow-md transition-all hover:px-12">
                <Plus className="mr-2 h-4 w-4" />
                Kết nối ngay
              </Button>
            </ConnectModal>
          </div>
        )}

        {/* Security Info */}
        <Card className="bg-primary/5 border border-primary/10 rounded-lg overflow-hidden group">
          <div className="p-8 flex items-start gap-6 relative">
            <div className="size-12 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20 shadow-inner group-hover:rotate-6 transition-transform">
              <Shield className="size-6" />
            </div>
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-widest italic text-primary">Bảo mật & Quyền riêng tư</h4>
              <p className="text-sm text-foreground/70 leading-relaxed italic font-medium">
                Chúng tôi sử dụng giao thức OAuth 2.0 tiêu chuẩn để kết nối an toàn.
                Thông tin của bạn được bảo vệ bởi lớp mã hoá cao cấp.
                Bạn có thể ngắt kết nối bất cứ lúc nào từ hệ thống hoặc từ mạng xã hội.
              </p>
            </div>
            <div className="absolute right-8 top-8 opacity-5">
              <Shield className="size-32" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

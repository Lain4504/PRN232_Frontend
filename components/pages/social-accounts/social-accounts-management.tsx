"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, AlertCircle, Plus, Shield, Globe, ChevronRight } from "lucide-react"
import { useGetAccountsWithTargets } from "@/hooks/use-social-accounts"
import { SocialAccountList } from "@/components/social/social-account-list"
import { ConnectModal } from "@/components/social/connect-modal"
import { toast } from "sonner"
import { useAuth } from "@/lib/contexts/auth-context"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function SocialAccountsManagement() {
  const { user, isLoading: userLoading } = useAuth()
  const { data: accountsWithTargets = [], isLoading, error, refetch } = useGetAccountsWithTargets()

  const handleRefresh = () => {
    refetch()
  }

  if (isLoading || userLoading) {
    return (
      <div className="space-y-10 animate-pulse">
        <div className="h-10 w-64 bg-muted rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-40 bg-card rounded-lg border border-border" />)}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6 bg-muted/30 rounded-lg border border-dashed border-border">
        <div className="size-16 rounded-md bg-card flex items-center justify-center shadow-sm border border-border">
          <AlertCircle className="size-8 text-destructive" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-foreground leading-none">Lỗi kết nối</h3>
          <p className="text-sm text-muted-foreground font-medium max-w-sm leading-relaxed">
            Không thể thiết lập kết nối với các nút tích hợp. Vui lòng thử đồng bộ lại ma trận.
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" className="h-10 px-6 rounded-md font-semibold text-sm">
          Thử lại ngay
        </Button>
      </div>
    )
  }

  const socialAccounts = accountsWithTargets.map(item => item.socialAccount)
  const totalIntegrations = accountsWithTargets.reduce((sum, item) => sum + item.targets.length, 0)

  return (
    <div className="space-y-10 pb-20 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded bg-muted flex items-center justify-center text-muted-foreground">
              <Globe className="size-3.5" />
            </div>
            <span className="text-[11px] font-semibold text-muted-foreground">Cổng kết nối đa nền tảng</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground leading-tight">
            Tài khoản Mạng xã hội
          </h1>
          <p className="text-sm text-muted-foreground font-medium max-w-xl leading-relaxed">
            Kết nối và đồng bộ hóa các tài khoản social media của bạn vào hệ sinh thái quản trị AI.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="p-2 px-4 rounded-md bg-card border border-border shadow-sm flex items-center gap-4">
            <div className="size-8 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <Shield className="size-4" />
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-semibold text-muted-foreground">Trạng thái bảo mật</p>
              <p className="text-xs font-bold text-foreground">Đã mã hóa</p>
            </div>
          </div>
          <ConnectModal>
            <Button className="h-10 px-6 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-sm transition-all">
              <Plus className="mr-2 h-4 w-4" />
              Kết nối tài khoản
            </Button>
          </ConnectModal>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-lg font-bold text-foreground">Tích hợp đang hoạt động</h2>
            <p className="text-xs text-muted-foreground">Tất cả các tài khoản được kết nối thông qua giao thức OAuth 2.0</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md border border-border text-[11px] font-semibold text-muted-foreground">
            <div className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            {socialAccounts.length} Tài khoản đã kết nối
          </div>
        </div>

        {socialAccounts.length > 0 ? (
          <Card className="rounded-lg border border-border bg-card shadow-sm overflow-hidden relative group">
            <div className="p-1">
              <SocialAccountList
                accounts={socialAccounts}
                userId={user?.id || ""}
                onRefresh={handleRefresh}
              />
            </div>
          </Card>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 px-6 text-center border border-dashed border-border rounded-lg bg-muted/30">
            <div className="size-16 rounded-md bg-card flex items-center justify-center mb-6 shadow-sm border border-border">
              <Users className="size-8 text-muted-foreground/30" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Chưa có kết nối nào</h3>
            <p className="text-muted-foreground font-medium max-w-sm mb-8 leading-relaxed text-sm italic">
              Mở khóa sức mạnh AI bằng cách kết nối tài khoản mạng xã hội đầu tiên của bạn ngay hôm nay.
            </p>
            <ConnectModal>
              <Button className="h-10 px-8 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-sm transition-all">
                <Plus className="mr-2 h-4 w-4" />
                Thiết lập ngay
              </Button>
            </ConnectModal>
          </div>
        )}

        {/* Security Info Card */}
        <Card className="p-8 rounded-lg bg-primary text-primary-foreground relative overflow-hidden group border-none shadow-sm">
          <div className="absolute top-0 right-0 p-8 opacity-10 scale-150 rotate-12 group-hover:rotate-0 transition-transform duration-1000 pointer-events-none">
            <Shield className="size-48" />
          </div>
          <div className="flex items-start gap-6 relative z-10">
            <div className="size-12 rounded-md bg-white/10 flex items-center justify-center text-white shrink-0 shadow-2xl border border-white/5">
              <AlertCircle className="size-6" />
            </div>
            <div className="space-y-3">
              <h4 className="text-lg font-bold tracking-tight">Nghị định thức Bảo mật Hệ thống</h4>
              <p className="text-sm opacity-90 leading-relaxed font-medium max-w-4xl">
                Chúng tôi sử dụng tiêu chuẩn OAuth 1.0/2.0 để bắc cầu các tài khoản của bạn.
                Thông tin đăng nhập của bạn <span className="font-bold underline">không bao giờ</span> được lưu trữ trực tiếp trên máy chủ của chúng tôi và luôn ở trạng thái phi tập trung.
                Bạn có thể chấm dứt bất kỳ tích hợp nào ngay lập tức từ bảng điều khiển này.
              </p>
              <div className="pt-2">
                <Button variant="ghost" className="h-auto p-0 text-white hover:text-white/80 hover:bg-transparent font-semibold text-xs flex items-center gap-2">
                  Tìm hiểu chính sách bảo mật đa lớp
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

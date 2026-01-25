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
      <div className="space-y-12 animate-pulse">
        <div className="h-12 w-64 bg-slate-50 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => <div key={i} className="h-48 bg-slate-50 rounded-[2rem] border border-slate-100" />)}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center space-y-8 bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
        <div className="size-20 rounded-[2rem] bg-white flex items-center justify-center shadow-sm border border-slate-100">
          <AlertCircle className="size-10 text-rose-500" />
        </div>
        <div className="space-y-3">
          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-widest leading-none">Lỗi kết nối</h3>
          <p className="text-slate-500 font-medium max-w-sm leading-relaxed text-xs uppercase tracking-tighter">
            Không thể thiết lập kết nối với các nút tích hợp. Vui lòng thử đồng bộ lại ma trận.
          </p>
        </div>
        <Button onClick={handleRefresh} className="h-12 px-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[10px]">
          Thử lại ngay
        </Button>
      </div>
    )
  }

  const socialAccounts = accountsWithTargets.map(item => item.socialAccount)
  const totalIntegrations = accountsWithTargets.reduce((sum, item) => sum + item.targets.length, 0)

  return (
    <div className="space-y-12 pb-20 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-100 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
              <Globe className="size-4" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Cổng kết nối đa nền tảng</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-none">
            Tài khoản Mạng xã hội
          </h1>
          <p className="text-lg text-slate-500 font-medium max-w-xl leading-relaxed">
            Kết nối và đồng bộ hóa các tài khoản social media của bạn vào hệ sinh thái quản trị AI.
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="size-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Shield className="size-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Trạng thái bảo mật</p>
              <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Đã mã hóa</p>
            </div>
          </div>
          <ConnectModal>
            <Button className="h-14 px-8 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-slate-200 transition-all hover:-translate-y-1">
              <Plus className="mr-3 h-4 w-4" />
              Kết nối tài khoản
            </Button>
          </ConnectModal>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="space-y-10">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest">Tích hợp đang hoạt động</h2>
            <p className="text-xs font-medium text-slate-400">Tất cả các tài khoản được kết nối thông qua giao thức OAuth 2.0</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <div className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            {socialAccounts.length} Tài khoản đã kết nối
          </div>
        </div>

        {socialAccounts.length > 0 ? (
          <Card className="rounded-[2.5rem] border border-slate-100 bg-white shadow-xl shadow-slate-200/40 overflow-hidden relative group">
            <div className="p-2">
              <SocialAccountList
                accounts={socialAccounts}
                userId={user?.id || ""}
                onRefresh={handleRefresh}
              />
            </div>
          </Card>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 px-6 text-center border border-dashed border-slate-200 rounded-[3rem] bg-slate-50/50">
            <div className="size-20 rounded-[2rem] bg-white flex items-center justify-center mb-8 shadow-sm border border-slate-100">
              <Users className="size-10 text-slate-200" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3 uppercase tracking-widest">Chưa có kết nối nào</h3>
            <p className="text-slate-500 font-medium max-w-sm mb-10 leading-relaxed uppercase tracking-tighter text-xs">
              Mở khóa sức mạnh AI bằng cách kết nối tài khoản mạng xã hội đầu tiên của bạn ngay hôm nay.
            </p>
            <ConnectModal>
              <Button className="h-14 px-10 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-slate-200 transition-all hover:-translate-y-1">
                <Plus className="mr-3 h-5 w-5" />
                Thiết lập ngay
              </Button>
            </ConnectModal>
          </div>
        )}

        {/* Security Info Card */}
        <Card className="p-10 rounded-[2.5rem] bg-slate-900 text-white relative overflow-hidden group border-none">
          <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
            <Shield className="size-48" />
          </div>
          <div className="flex items-start gap-8 relative z-10">
            <div className="size-14 rounded-2xl bg-white/10 flex items-center justify-center text-white shrink-0 shadow-2xl border border-white/5">
              <AlertCircle className="size-7" />
            </div>
            <div className="space-y-4">
              <h4 className="text-xl font-black tracking-tight uppercase tracking-widest">Nghị định thức Bảo mật Hệ thống</h4>
              <p className="text-sm text-slate-400 leading-relaxed font-bold max-w-4xl">
                Chúng tôi sử dụng tiêu chuẩn OAuth 1.0/2.0 để bắc cầu các tài khoản của bạn.
                Thông tin đăng nhập của bạn <span className="text-emerald-400">không bao giờ</span> được lưu trữ trực tiếp trên máy chủ của chúng tôi và luôn ở trạng thái phi tập trung.
                Bạn có thể chấm dứt bất kỳ tích hợp nào ngay lập tức từ bảng điều khiển này.
              </p>
              <div className="pt-4">
                <Button variant="ghost" className="p-0 text-white hover:text-emerald-400 font-black text-[10px] uppercase tracking-widest hover:bg-transparent flex items-center gap-2">
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

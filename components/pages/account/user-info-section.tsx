"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/lib/contexts/auth-context"
import { Mail, Shield, Calendar, Fingerprint, CheckCircle2, Clock } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export function UserInfoSection() {
  const { user, isLoading: loading } = useAuth()

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-48 bg-slate-100 dark:bg-slate-800 rounded" />
        <Card className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-none">
          <CardContent className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-4 w-24 dark:bg-slate-800" />
                  <Skeleton className="h-6 w-full dark:bg-slate-800" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-3">
        <div className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
          <Fingerprint className="size-4" />
        </div>
        Thông tin định danh
      </h2>

      <Card className="rounded-3xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <CardContent className="p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Email */}
            <div className="space-y-3 group">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                <Mail className="h-3.5 w-3.5" />
                Địa chỉ Email
              </div>
              <p className="text-base font-bold text-slate-900 dark:text-white">{user.email}</p>
            </div>

            {/* User ID */}
            <div className="space-y-3 group">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                <Shield className="h-3.5 w-3.5" />
                Mã định danh (ID)
              </div>
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700 w-fit">
                {user.id}
              </p>
            </div>

            {/* Created At */}
            <div className="space-y-3 group">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                <Calendar className="h-3.5 w-3.5" />
                Tham gia từ
              </div>
              <p className="text-base font-bold text-slate-900 dark:text-white">
                {formatDate(user.createdAt)}
              </p>
            </div>

            {/* Status */}
            <div className="space-y-3 group">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Trạng thái xác thực
              </div>
              <div className="flex items-center">
                <span className={cn(
                  "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest",
                  user.isEmailVerified
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20'
                    : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20'
                )}>
                  {user.isEmailVerified ? (
                    <>
                      <CheckCircle2 className="size-3.5" />
                      Đã xác thực
                    </>
                  ) : (
                    <>
                      <Clock className="size-3.5" />
                      Chờ xác thực
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

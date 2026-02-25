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
        <Skeleton className="h-6 w-48 bg-muted rounded" />
        <Card className="rounded-lg border border-border shadow-none">
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-4 w-24 bg-muted" />
                  <Skeleton className="h-6 w-full bg-muted" />
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
      <h2 className="text-xl font-bold text-foreground uppercase tracking-widest flex items-center gap-3">
        <div className="size-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
          <Fingerprint className="size-4" />
        </div>
        Thông tin định danh
      </h2>

      <Card className="rounded-lg border-border bg-card shadow-sm overflow-hidden">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Email */}
            <div className="space-y-2 group">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
                <Mail className="h-3.5 w-3.5" />
                Địa chỉ Email
              </div>
              <p className="text-sm font-semibold text-foreground">{user.email}</p>
            </div>

            {/* User ID */}
            <div className="space-y-2 group">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
                <Shield className="h-3.5 w-3.5" />
                Mã định danh (ID)
              </div>
              <p className="text-xs font-mono text-muted-foreground bg-muted px-2.5 py-1 rounded border border-border w-fit">
                {user.id}
              </p>
            </div>

            {/* Created At */}
            <div className="space-y-2 group">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
                <Calendar className="h-3.5 w-3.5" />
                Tham gia từ
              </div>
              <p className="text-sm font-semibold text-foreground">
                {formatDate(user.createdAt)}
              </p>
            </div>

            {/* Status */}
            <div className="space-y-2 group">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Trạng thái xác thực
              </div>
              <div className="flex items-center">
                <span className={cn(
                  "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                  user.isEmailVerified
                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                )}>
                  {user.isEmailVerified ? (
                    <>
                      <CheckCircle2 className="size-3" />
                      Đã xác thực
                    </>
                  ) : (
                    <>
                      <Clock className="size-3" />
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

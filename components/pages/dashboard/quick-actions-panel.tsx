"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

import {
  Target,
  FileText,
  Calendar,
  Sparkles,
  Zap,
  TrendingUp,
  Users,
  BarChart3,
  ArrowRight,
  Plus
} from "lucide-react"
import { cn } from "@/lib/utils"

interface QuickAction {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  isPopular?: boolean
  bgColor: string
  textColor: string
}

export function QuickActionsPanel({ className }: { className?: string }) {


  const quickActions: QuickAction[] = [
    {
      title: "Tạo thương hiệu",
      description: "Thiết lập hồ sơ thương hiệu mới",
      icon: Target,
      href: "/dashboard/brands/new",
      isPopular: true,
      bgColor: "bg-blue-50 dark:bg-blue-500/10",
      textColor: "text-blue-600 dark:text-blue-400"
    },
    {
      title: "Sáng tạo AI",
      description: "Tạo hình ảnh & video bằng AI",
      icon: Sparkles,
      href: "/dashboard/contents/new",
      isPopular: true,
      bgColor: "bg-purple-50 dark:bg-purple-500/10",
      textColor: "text-purple-600 dark:text-purple-400"
    },
    {
      title: "Lên lịch bài đăng",
      description: "Lên lịch đăng bài tự động",
      icon: Calendar,
      href: "/dashboard/calendar",
      bgColor: "bg-emerald-50 dark:bg-emerald-500/10",
      textColor: "text-emerald-600 dark:text-emerald-400"
    },
    {
      title: "Xem Thống kê",
      description: "Phân tích hiệu quả chiến dịch",
      icon: BarChart3,
      href: "/dashboard/reports",
      bgColor: "bg-amber-50 dark:bg-amber-500/10",
      textColor: "text-amber-600 dark:text-amber-400"
    },
    {
      title: "Quản lý Đội ngũ",
      description: "Mời và phân quyền thành viên",
      icon: Users,
      href: "/dashboard/teams",
      bgColor: "bg-slate-50 dark:bg-slate-800",
      textColor: "text-slate-600 dark:text-slate-400"
    }
  ]

  return (
    <Card className={cn("overflow-hidden flex flex-col transition-all duration-300 rounded-lg border border-border bg-card shadow-sm", className)}>
      <CardHeader className="p-6 md:p-8 border-b border-border/50 bg-muted/20 flex flex-row items-center justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-lg font-bold tracking-tight italic uppercase">
            Hành động nhanh
          </CardTitle>
          <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest italic">Phím tắt điều hành</p>
        </div>
        <div className="size-9 rounded-md bg-primary text-primary-foreground flex items-center justify-center shadow-md">
          <Zap className="size-4" />
        </div>
      </CardHeader>

      <CardContent className="p-6 flex-1">
        <div className="space-y-4">
          <div className="grid gap-3">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                asChild
                variant="ghost"
                className="w-full justify-start h-auto p-3 rounded-md border border-transparent hover:border-border/30 hover:bg-muted/50 group transition-all"
              >
                <Link href={action.href}>
                  <div className="flex items-center gap-4 w-full">
                    <div className={cn(
                      "flex-shrink-0 size-10 rounded-md flex items-center justify-center transition-all group-hover:bg-primary group-hover:text-primary-foreground shadow-sm",
                      action.bgColor, action.textColor
                    )}>
                      <action.icon className="size-4" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-sm italic">{action.title}</span>
                        {action.isPopular && (
                          <div className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[8px] font-bold uppercase tracking-wider">PHỔ BIẾN</div>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 italic">{action.description}</p>
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              </Button>
            ))}
          </div>
        </div>

        {/* Mini CTA or Insight */}
        <div className="mt-8 p-4 rounded-md border border-border/50 bg-muted/20 flex items-center justify-between group/shortcuts cursor-pointer hover:bg-muted/40 transition-all">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-md bg-card flex items-center justify-center text-muted-foreground shadow-sm border border-border group-hover:border-primary/20">
              <TrendingUp className="size-3.5 group-hover:text-primary transition-colors" />
            </div>
            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest italic">Toàn bộ Phím tắt</p>
          </div>
          <Button variant="ghost" size="icon" className="size-8 rounded-full hover:bg-card">
            <Plus className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>

  )
}

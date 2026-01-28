"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
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
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      title: "Sáng tạo AI",
      description: "Tạo hình ảnh & video bằng AI",
      icon: Sparkles,
      href: "/dashboard/contents/new",
      isPopular: true,
      bgColor: "bg-purple-50",
      textColor: "text-purple-600"
    },
    {
      title: "Lên lịch bài đăng",
      description: "Lên lịch đăng bài tự động",
      icon: Calendar,
      href: "/dashboard/calendar",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600"
    },
    {
      title: "Xem Thống kê",
      description: "Phân tích hiệu quả chiến dịch",
      icon: BarChart3,
      href: "/dashboard/reports",
      bgColor: "bg-amber-50",
      textColor: "text-amber-600"
    },
    {
      title: "Quản lý Đội ngũ",
      description: "Mời và phân quyền thành viên",
      icon: Users,
      href: "/dashboard/teams",
      bgColor: "bg-slate-50",
      textColor: "text-slate-600"
    }
  ]

  return (
    <Card className={cn("rounded-2xl md:rounded-3xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm flex flex-col transition-all duration-300", className)}>
      <div className="p-6 md:p-10 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/10 flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3 uppercase tracking-widest leading-none">
            Hành động nhanh
          </h3>
          <p className="text-[9px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Phím tắt điều hành</p>
        </div>
        <div className="size-8 md:size-10 rounded-lg md:rounded-xl bg-slate-900 dark:bg-primary flex items-center justify-center text-white">
          <Zap className="size-4 md:size-5" />
        </div>
      </div>

      <CardContent className="p-5 md:p-8 space-y-6 md:space-y-8 flex-1">
        <div className="space-y-4">
          <div className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 dark:text-slate-600 px-2">Hoạt động trọng tâm</div>
          <div className="grid gap-2 md:gap-3">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                asChild
                variant="ghost"
                className="w-full justify-start h-auto p-3 md:p-4 rounded-xl md:rounded-2xl border border-transparent hover:border-slate-100 dark:hover:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 group transition-all duration-300 active:scale-[0.98]"
              >
                <Link href={action.href}>
                  <div className="flex items-center gap-4 md:gap-5 w-full">
                    <div className={cn(
                      "flex-shrink-0 size-10 md:size-11 rounded-lg md:rounded-xl flex items-center justify-center transition-all duration-500 group-hover:bg-slate-900 dark:group-hover:bg-primary group-hover:text-white group-hover:rotate-12 shadow-sm",
                      action.bgColor, action.textColor
                    )}>
                      <action.icon className="size-4 md:size-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-xs md:text-sm">{action.title}</span>
                        {action.isPopular && (
                          <div className="px-1 py-0.5 rounded bg-slate-900 dark:bg-primary text-white text-[7px] md:text-[8px] font-black uppercase tracking-tighter">PHỔ BIẾN</div>
                        )}
                      </div>
                      <p className="text-[10px] md:text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5">{action.description}</p>
                    </div>
                    <ArrowRight className="size-3.5 md:size-4 text-slate-200 dark:text-slate-700 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              </Button>
            ))}
          </div>
        </div>

        {/* Mini CTA or Insight */}
        <div className="mt-auto p-4 md:p-6 rounded-2xl md:rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="size-8 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 dark:text-slate-500 shadow-sm border border-slate-100 dark:border-slate-800">
              <TrendingUp className="size-4" />
            </div>
            <p className="text-[9px] md:text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Xem tất cả phím tắt</p>
          </div>
          <Button variant="ghost" size="sm" className="size-7 md:size-8 rounded-full p-0 hover:bg-white dark:hover:bg-slate-700 text-slate-900 dark:text-white">
            <Plus className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>

  )
}

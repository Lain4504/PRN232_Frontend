"use client"

import { UserInfoSection } from "@/components/pages/account/user-info-section"
import { ThemeToggleSection } from "@/components/pages/account/theme-toggle-section"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AccountPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-8 space-y-12">
      {/* Header */}
      <div className="space-y-6 border-b border-slate-100 pb-12">
        <Link href="/overview" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          Quay lại tổng quan
        </Link>
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">
            Tùy chỉnh tài khoản
          </h1>
          <p className="text-lg text-slate-500 font-medium max-w-xl">
            Quản lý thông tin cá nhân, cài đặt giao diện và các tùy chọn bảo mật của bạn.
          </p>
        </div>
      </div>

      {/* Content Container */}
      <div className="space-y-12">
        <UserInfoSection />
        <ThemeToggleSection />
      </div>
    </div>
  )
}

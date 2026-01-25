"use client"

import { SessionManagementSection } from "@/components/pages/account/session-management-section"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AuditLogsPage() {
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
            Quản lý phiên đăng nhập
          </h1>
          <p className="text-lg text-slate-500 font-medium max-w-xl">
            Theo dõi và quản lý các thiết bị đang truy cập vào tài khoản omniadly của bạn.
          </p>
        </div>
      </div>

      {/* Content Container */}
      <div className="w-full space-y-12">
        <SessionManagementSection />
      </div>
    </div>
  )
}

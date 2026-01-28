"use client";

import React from "react";
import { Zap, Shield, Star, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function AuthSplitLayout({
  children,
  title,
  subtitle,
  quote = "omniadly đã thay đổi hoàn toàn cách chúng tôi quản lý quảng cáo. Chúng tôi tiết kiệm được 70% thời gian và hiệu quả tăng gấp 3 lần.",
  author = "Minh Trần, Giám đốc Marketing",
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  quote?: string;
  author?: string;
}) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-slate-950 text-slate-900 dark:text-slate-50 overflow-hidden relative selection:bg-rose-100 selection:text-rose-600 dark:selection:bg-primary/20 dark:selection:text-primary">
      {/* Background Decorations */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 dark:opacity-20">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-rose-200/30 dark:bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-blue-100/30 dark:bg-blue-500/10 blur-[100px]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen relative z-10">
        {/* Left: Auth Area */}
        <div className="lg:col-span-5 flex items-center justify-center p-8 sm:p-12 xl:p-24 bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border-r border-white/20 dark:border-slate-800/50">
          <div className="w-full max-w-md space-y-10 animate-in fade-in slide-in-from-left-4 duration-700">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 w-fit group">
              <div className="size-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:scale-105 font-black">
                <Zap className="size-6 text-white fill-current" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-sans">omniadly</span>
            </Link>

            <div className="space-y-4">
              <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">{title}</h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed">{subtitle}</p>
            </div>

            <div className="space-y-8">
              <div className="relative z-10">
                {children}
              </div>
            </div>

            <div className="flex items-center justify-between pt-8 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Shield className="size-3.5 text-slate-400 dark:text-slate-600" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600">Kết nối bảo mật</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600">Hệ thống đang hoạt động</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Illustration/Info Area */}
        <div className="hidden lg:col-span-7 lg:flex flex-col justify-center p-24 bg-slate-50/50 dark:bg-slate-900/10 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-16 animate-in fade-in slide-in-from-right-8 duration-1000">
            {/* Benefits Card */}
            <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-black/50 relative overflow-hidden border border-slate-100 dark:border-slate-800">
              <div className="space-y-10 relative z-10">
                <div className="space-y-4">
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">
                    Tối ưu quảng cáo <br /> <span className="text-primary italic font-serif">chưa bao giờ dễ dàng</span> đến thế.
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    omniadly mang đến quy trình làm việc tinh gọn, giúp bạn tập trung vào những chiến lược quan trọng nhất.
                  </p>
                </div>

                <div className="space-y-6">
                  {[
                    { title: "Tiết kiệm 70% thời gian", desc: "Tự động hóa các quy trình thủ công lặp đi lặp lại." },
                    { title: "Tăng hiệu quả X3", desc: "AI giúp lựa chọn nội dung và thời điểm đăng bài tối ưu." },
                    { title: "Quản lý tập trung", desc: "Mọi kênh quảng cáo nằm gọn trong một màn hình duy nhất." }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-1">
                        <CheckCircle2 className="size-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white leading-none mb-1">{item.title}</h4>
                        <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-12 px-6">
              {[
                { label: "Tốc độ xử lý", value: "0.4s", icon: Zap, color: "text-blue-500" },
                { label: "Bảo mật", value: "256-bit", icon: Shield, color: "text-rose-500" },
              ].map((stat) => (
                <div key={stat.label} className="space-y-3">
                  <div className="flex items-center gap-2 opacity-40">
                    <stat.icon className={cn("size-4", stat.color)} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-slate-400">{stat.label}</span>
                  </div>
                  <div className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white">{stat.value}</div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-6 px-6 opacity-30 dark:opacity-20 invert dark:invert-0 grayscale">
              <CheckCircle2 className="size-6" />
              <span className="font-bold tracking-tighter text-xl text-slate-500">TRUSTED PARTNER</span>
            </div>
          </div>

          {/* Abstract background shapes for the right area */}
          <div className="absolute top-0 right-0 p-20 opacity-5 dark:opacity-10">
            <div className="size-96 bg-primary rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </div>
  );
}



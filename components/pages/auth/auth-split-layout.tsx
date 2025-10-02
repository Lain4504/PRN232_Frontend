"use client";

import React from "react";

export function AuthSplitLayout({
  children,
  title = "Welcome back",
  subtitle = "Sign in to your account",
  quote = "AISAM giúp tối ưu hiệu suất và bảo mật cho chiến dịch quảng cáo, tăng sự tự tin khi triển khai ở mọi quy mô.",
  author = "@AISAM Team",
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  quote?: string;
  author?: string;
}) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-5">
      {/* Left: Form area */}
      <div className="bg-muted/40 dark:bg-muted/20 lg:col-span-2">
        <div className="px-6 py-10 sm:px-10 flex flex-col max-w-xl w-full mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded bg-primary" />
            <span className="font-semibold">AISAM</span>
          </div>
        </div>
        <h1 className="text-3xl font-semibold mb-1">{title}</h1>
        <p className="text-muted-foreground mb-8">{subtitle}</p>
        <div className="w-full max-w-md">{children}</div>
        </div>
      </div>

      {/* Right: Quote/Testimonial */}
      <div className="hidden lg:flex lg:col-span-3 items-center justify-center p-10 bg-background">
        <div className="max-w-2xl">
          <div className="text-[64px] leading-none text-muted-foreground/30 select-none">“</div>
          <p className="text-3xl font-medium leading-snug tracking-tight mb-6">
            {quote}
          </p>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-muted" />
            <span className="text-muted-foreground">{author}</span>
          </div>
        </div>
      </div>
    </div>
  );
}



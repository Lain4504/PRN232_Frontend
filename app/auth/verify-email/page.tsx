import type { Metadata } from "next";
import { VerifyEmailStatus } from "@/components/pages/verify-email/verify-email-status";
import { Zap, Loader2 } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Identity Verification | omniadly",
  description: "Securely verify your email address to activate your omniadly deployment.",
};

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-background font-fira-sans overflow-hidden relative flex flex-col items-center justify-center p-6 sm:p-12">
      {/* Background shards for consistency */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-primary/20 blur-[150px] -rotate-12 translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-blue-600/10 blur-[120px] translate-x-[20%] translate-y-[20%]" />
      </div>

      <div className="relative z-10 w-full max-w-xl space-y-12">
        {/* Branding */}
        <div className="flex justify-center">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="size-12 rounded-xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/30 group-hover:rotate-[15deg] transition-all duration-500">
              <Zap className="size-7 text-primary-foreground fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-foreground tracking-[0.2em] uppercase leading-none">omniadly</span>
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] italic leading-none">AI Platform</span>
            </div>
          </Link>
        </div>

        <Suspense fallback={
          <div className="flex flex-col items-center justify-center p-12 space-y-4">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Đang chuẩn bị xác thực...</p>
          </div>
        }>
          <VerifyEmailStatus />
        </Suspense>

        {/* System Footer */}
        <div className="flex items-center justify-center gap-8 opacity-30">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest leading-none">Systems Operational</span>
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest leading-none">© 2026 omniadly Intelligence</span>
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { Zap, Shield, Star } from "lucide-react";
import Link from "next/link";

export function AuthSplitLayout({
  children,
  title = "Welcome Back",
  subtitle = "Sign in to manage your AI marketing campaigns",
  quote = "AISAM has completely transformed how we handle our social media creative. We've seen a 4x increase in engagement while spending 70% less time on production.",
  author = "Sarah Chen, Marketing Director",
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  quote?: string;
  author?: string;
}) {
  return (
    <div className="min-h-screen bg-background font-fira-sans overflow-hidden relative">
      {/* Structural Background Shards */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-primary/20 blur-[150px] -rotate-12 translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-blue-600/10 blur-[120px] translate-x-[20%] translate-y-[20%]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen relative z-10">

        {/* Left: Login Area */}
        <div className="lg:col-span-5 flex items-center justify-center p-6 sm:p-12 xl:p-24 relative overflow-hidden bg-background/80 backdrop-blur-xl border-r border-border/40">
          <div className="w-full max-w-sm space-y-12">

            {/* Header Identity */}
            <div className="space-y-10">
              <Link href="/" className="flex items-center gap-3 w-fit group">
                <div className="size-10 rounded-xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/30 group-hover:rotate-[15deg] transition-all duration-500">
                  <Zap className="size-6 text-primary-foreground fill-current" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black text-foreground tracking-[0.2em] uppercase leading-none">AISAM</span>
                  <span className="text-[9px] font-black text-primary uppercase tracking-[0.4em] italic leading-none">AI Platform</span>
                </div>
              </Link>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-1 w-6 bg-primary rounded-full" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">Secure Access</span>
                </div>
                <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase leading-[0.9]">{title}</h1>
                <p className="text-muted-foreground font-medium text-lg tracking-tight">{subtitle}</p>
              </div>
            </div>

            {/* Content Core */}
            <div className="bg-card/40 border border-border/40 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl shadow-black/5 relative group overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:rotate-12 transition-transform duration-1000">
                <Shield className="size-32" />
              </div>
              <div className="relative z-10">
                {children}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-10 border-t border-border/10 opacity-40">
              <span className="text-[9px] font-black uppercase tracking-widest leading-none">Verified Security 2.0</span>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest leading-none">Systems Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Info Area */}
        <div className="hidden lg:col-span-7 lg:flex flex-col justify-center p-24 bg-muted/20 relative overflow-hidden group">
          {/* Decorative Background */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50" />

          <div className="relative z-10 max-w-2xl space-y-20">

            {/* Testimonial Card */}
            <div className="bg-card/40 backdrop-blur-3xl border border-white/10 rounded-[4rem] p-16 shadow-[0_0_80px_-20px_rgba(0,0,0,0.1)] relative overflow-hidden group/card hover:scale-[1.02] transition-all duration-700">
              <div className="absolute top-0 right-0 p-16 font-fira-mono font-black text-[12rem] opacity-[0.03] italic leading-none select-none group-hover/card:scale-110 transition-transform duration-1000">AI</div>

              <div className="space-y-12 relative z-10">
                <div className="flex gap-1.5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="size-4 fill-primary text-primary stroke-0" />)}
                </div>

                <div className="space-y-6">
                  <p className="text-3xl font-black text-foreground leading-[1.2] tracking-tight uppercase">
                    &ldquo;{quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-6">
                    <div className="size-16 rounded-[1.5rem] bg-primary flex items-center justify-center shadow-2xl shadow-primary/30">
                      <span className="text-white font-black text-2xl uppercase italic">SC</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xl font-black uppercase tracking-tight">{author}</p>
                      <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] opacity-70">AISAM Core User</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Platform Stats */}
            <div className="grid grid-cols-2 gap-8">
              {[
                { label: "GENERATE SPEED", value: "0.4s", icon: Zap },
                { label: "SYSTEM UPTIME", value: "99.9%", icon: Shield },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 text-primary">
                    <stat.icon className="size-4 stroke-[2.5]" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{stat.label}</span>
                  </div>
                  <div className="text-5xl font-black font-fira-mono tracking-tighter tabular-nums">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



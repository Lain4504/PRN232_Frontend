"use client";

import React from "react";
import { Zap, Shield, Star } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";


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
  const { t } = useTranslation("auth");
  const actualTitle = title === "Welcome Back" ? t('welcomeBack') : (title === "Create a new account" ? t('createAccountTitle') : title);
  const actualSubtitle = subtitle === "Sign in to manage your AI marketing campaigns" ? t('signInSubtitle') : (subtitle === "Get started for free today" ? t('getStartedFreeToday') : subtitle);
  const actualQuote = quote === "AISAM has completely transformed how we handle our social media creative. We've seen a 4x increase in engagement while spending 70% less time on production." ? t('quote') : quote;
  const actualAuthor = author === "Sarah Chen, Marketing Director" ? "Sarah Chen, " + t('authorRole') : author;

  return (
    <div className="min-h-screen bg-background font-fira-sans overflow-hidden relative">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-blue-500/5 blur-[100px]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen relative z-10">
        {/* Left: Login Area */}
        <div className="lg:col-span-5 flex items-center justify-center p-6 sm:p-12 xl:p-24 bg-background/50 backdrop-blur-md border-r">
          <div className="w-full max-w-md space-y-12">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 w-fit group">
              <div className="size-10 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
                <Zap className="size-6 text-primary-foreground fill-current" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-foreground tracking-tight">AISAM</span>
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">AI Platform</span>
              </div>
            </Link>

            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{actualTitle}</h1>
              <p className="text-muted-foreground font-medium text-lg">{actualSubtitle}</p>
            </div>

            <div className="space-y-10">
              <div className="relative z-10">
                {children}
              </div>
            </div>

            <div className="flex items-center justify-between pt-10 border-t opacity-60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('secureConnection')}</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 ml-1" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('systemsActive')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Info Area */}
        <div className="hidden lg:col-span-7 lg:flex flex-col justify-center p-24 bg-muted/5 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-16">
            {/* Testimonial Card */}
            <div className="bg-card border rounded-2xl p-12 shadow-sm relative overflow-hidden group">
              <div className="space-y-10 relative z-10">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="size-4 fill-primary text-primary stroke-0" />)}
                </div>

                <div className="space-y-8">
                  <p className="text-2xl font-bold text-foreground leading-relaxed">
                    &ldquo;{actualQuote}&rdquo;
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-lg">
                      SC
                    </div>
                    <div>
                      <p className="text-lg font-bold text-foreground">{actualAuthor}</p>
                      <p className="text-xs font-semibold text-primary uppercase tracking-wider">AISAM Core User</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-12 px-4">
              {[
                { label: t('generationSpeed'), value: "0.4s", icon: Zap },
                { label: t('stabilityRate'), value: "99.9%", icon: Shield },
              ].map((stat) => (
                <div key={stat.label} className="space-y-2">
                  <div className="flex items-center gap-2 text-primary">
                    <stat.icon className="size-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">{stat.label}</span>
                  </div>
                  <div className="text-5xl font-bold tracking-tight font-fira-mono">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



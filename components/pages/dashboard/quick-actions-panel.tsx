"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useTranslation } from "react-i18next"
import {
  Target,
  Package,
  FileText,
  Calendar,
  Plus,
  Zap,
  TrendingUp,
  Users,
  Settings,
  BarChart3,
  ArrowRight,
  Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"

interface QuickAction {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  variant?: "default" | "outline" | "secondary"
  badge?: string
  badgeVariant?: "default" | "secondary" | "destructive" | "outline"
  isNew?: boolean
  isPopular?: boolean
}

const quickActions: QuickAction[] = [
  {
    title: "Create Brand",
    description: "Set up a new brand profile",
    icon: Target,
    href: "/dashboard/brands/new",
    variant: "default",
    isNew: true
  },
  {
    title: "Generate Content",
    description: "Create AI-powered content",
    icon: Sparkles,
    href: "/dashboard/contents/new",
    variant: "default",
    isPopular: true
  },
  {
    title: "Schedule Posts",
    description: "Plan your social media posts",
    icon: Calendar,
    href: "/dashboard/calendar",
    variant: "outline"
  },
  {
    title: "View Analytics",
    description: "Check campaign performance",
    icon: BarChart3,
    href: "/dashboard/reports",
    variant: "outline"
  },
  {
    title: "Manage Team",
    description: "Invite and manage team members",
    icon: Users,
    href: "/teams",
    variant: "outline"
  }
]

const secondaryActions: QuickAction[] = [
  {
    title: "Quick Setup",
    description: "Complete your profile setup",
    icon: Zap,
    href: "/dashboard/setup",
    variant: "secondary",
    badge: "Recommended"
  },
  {
    title: "Performance Insights",
    description: "View trending metrics",
    icon: TrendingUp,
    href: "/dashboard/insights",
    variant: "secondary"
  }
]

interface QuickActionsPanelProps {
  className?: string
}

export function QuickActionsPanel({ className }: QuickActionsPanelProps) {
  const { t } = useTranslation("common")

  const quickActions: QuickAction[] = [
    {
      title: t("dashboard.quickActions.createBrand"),
      description: t("brands.createBrand"),
      icon: Target,
      href: "/dashboard/brands/new",
      variant: "default",
      isNew: true
    },
    {
      title: t("contents.aiGenerate"),
      description: t("contents.createContent"),
      icon: Sparkles,
      href: "/dashboard/contents/new",
      variant: "default",
      isPopular: true
    },
    {
      title: t("dashboard.quickActions.schedulePost"),
      description: t("calendar.description"),
      icon: Calendar,
      href: "/dashboard/calendar",
      variant: "outline"
    },
    {
      title: t("dashboard.quickActions.viewReports"),
      description: t("analytics.description"),
      icon: BarChart3,
      href: "/dashboard/reports",
      variant: "outline"
    },
    {
      title: t("teams.title"),
      description: t("teams.description"),
      icon: Users,
      href: "/teams",
      variant: "outline"
    }
  ]

  const secondaryActions: QuickAction[] = [
    {
      title: t("common.setup"),
      description: t("overview.description"),
      icon: Zap,
      href: "/dashboard/setup",
      variant: "secondary",
      badge: t("common.recommended")
    },
    {
      title: t("analytics.title"),
      description: t("analytics.overview"),
      icon: TrendingUp,
      href: "/dashboard/insights",
      variant: "secondary"
    }
  ]

  return (
    <Card className={cn("overflow-hidden flex flex-col p-8", className)}>
      <CardHeader className="p-0 mb-10">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              {t("dashboard.quickActions.title")}
            </h3>
            <p className="text-muted-foreground text-sm">
              {t("common.quickAccess")}
            </p>
          </div>
          <Button asChild variant="ghost" size="sm" className="rounded-xl hover:bg-muted/50 translate-x-2">
            <Link href="/dashboard/actions">
              {t("common.viewAll")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0 space-y-10 flex-1">
        {/* Primary Actions */}
        <div className="space-y-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-1">
            {t("common.coreOperations")}
          </div>
          <div className="grid gap-3">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                asChild
                variant="ghost"
                className={cn(
                  "w-full justify-start h-auto p-3 rounded-2xl border border-border/40 bg-background/40 transition-all duration-300 hover:bg-muted hover:border-primary/20 group relative overflow-hidden",
                  action.isPopular && "bg-primary/[0.03] border-primary/10"
                )}
              >
                <Link href={action.href}>
                  <div className="flex items-center gap-4 w-full relative z-10">
                    <div className={cn(
                      "flex-shrink-0 p-2.5 rounded-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
                      action.variant === "default" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                    )}>
                      <action.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-sm md:text-base leading-none">
                          {action.title}
                        </span>
                        {action.isPopular && (
                          <Badge className="bg-primary/10 text-primary border-none text-[9px] font-black h-4 px-1.5 rounded-sm">
                            HOT
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        {action.description}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              </Button>
            ))}
          </div>
        </div>

        {/* Recommended / Secondary */}
        <div className="space-y-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-1">
            {t("common.suggested")}
          </div>
          <div className="grid gap-3">
            {secondaryActions.map((action, index) => (
              <Button
                key={index}
                asChild
                variant="ghost"
                className="w-full justify-start h-auto p-3 rounded-2xl border border-transparent bg-muted/30 transition-all hover:bg-muted/60 group"
              >
                <Link href={action.href}>
                  <div className="flex items-center gap-4 w-full">
                    <div className="flex-shrink-0 p-2 rounded-lg bg-background border border-border/50 text-muted-foreground group-hover:text-primary transition-colors">
                      <action.icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground text-sm leading-none">
                          {action.title}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5 opacity-70">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

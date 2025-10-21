"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
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
  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Jump into your most common tasks
            </CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/actions">
              View All
              <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primary Actions */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Primary Actions</h4>
          <div className="grid gap-2">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                asChild
                variant={action.variant}
                className={cn(
                  "w-full justify-start h-auto p-3 relative",
                  action.isNew && "ring-2 ring-primary/20",
                  action.isPopular && "bg-gradient-to-r from-primary/10 to-primary/5"
                )}
              >
                <Link href={action.href}>
                  <div className="flex items-center gap-3 w-full">
                    <div className={cn(
                      "flex-shrink-0 p-2 rounded-md",
                      action.variant === "default" ? "bg-primary/10" : "bg-muted"
                    )}>
                      <action.icon className={cn(
                        "h-4 w-4",
                        action.variant === "default" ? "text-primary" : "text-muted-foreground"
                      )} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{action.title}</span>
                        {action.isNew && (
                          <Badge variant="secondary" className="text-xs">
                            New
                          </Badge>
                        )}
                        {action.isPopular && (
                          <Badge variant="default" className="text-xs">
                            Popular
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {action.description}
                      </p>
                    </div>
                    {action.badge && (
                      <Badge variant={action.badgeVariant || "secondary"} className="text-xs">
                        {action.badge}
                      </Badge>
                    )}
                  </div>
                </Link>
              </Button>
            ))}
          </div>
        </div>

        {/* Secondary Actions */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Recommended</h4>
          <div className="grid gap-2">
            {secondaryActions.map((action, index) => (
              <Button
                key={index}
                asChild
                variant={action.variant}
                className="w-full justify-start h-auto p-3"
              >
                <Link href={action.href}>
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex-shrink-0 p-2 rounded-md bg-muted">
                      <action.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{action.title}</span>
                        {action.badge && (
                          <Badge variant={action.badgeVariant || "secondary"} className="text-xs">
                            {action.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
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

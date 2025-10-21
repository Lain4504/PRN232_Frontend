"use client"

import React from "react"
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface BreadcrumbItem {
  label: string
  href?: string
  isCurrentPage?: boolean
}

interface StatItem {
  label: string
  value: string | number
  icon?: LucideIcon
  variant?: "default" | "secondary" | "destructive" | "outline"
}

interface ActionButton {
  label: string
  href?: string
  onClick?: () => void
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  icon?: LucideIcon
  disabled?: boolean
}

interface PageLayoutProps {
  children: React.ReactNode
  title: string
  description?: string
  breadcrumbs?: BreadcrumbItem[]
  stats?: StatItem[]
  actions?: ActionButton[]
  className?: string
  loading?: boolean
  loadingComponent?: React.ReactNode
}

const defaultLoadingComponent = (
  <div className="flex-1 space-y-8 p-6 lg:p-8 bg-background">
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <div className="h-10 w-64 mb-3 bg-muted animate-pulse rounded" />
          <div className="h-5 w-80 bg-muted animate-pulse rounded" />
        </div>
        <div className="flex items-center gap-4">
          <div className="h-8 w-32 bg-muted animate-pulse rounded" />
          <div className="h-8 w-28 bg-muted animate-pulse rounded" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-40 bg-muted animate-pulse rounded" />
        ))}
      </div>
    </div>
  </div>
)

export function PageLayout({
  children,
  title,
  description,
  breadcrumbs = [],
  stats = [],
  actions = [],
  className,
  loading = false,
  loadingComponent = defaultLoadingComponent
}: PageLayoutProps) {
  if (loading) {
    return <>{loadingComponent}</>
  }

  return (
    <div className={cn("w-full max-w-full overflow-x-hidden", className)}>
      <div className="space-y-6 lg:space-y-8 p-4 lg:p-6 xl:p-8 bg-background">
        {/* Breadcrumb */}
        {breadcrumbs.length > 0 && (
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((item, index) => (
                <React.Fragment key={index}>
                  <BreadcrumbItem>
                    {item.isCurrentPage ? (
                      <BreadcrumbPage>{item.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={item.href || "#"}>
                        {item.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}

        {/* Header */}
        <div className="space-y-3 lg:space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold tracking-tight text-foreground">
                {title}
              </h1>
              {description && (
                <p className="text-sm lg:text-base xl:text-lg text-muted-foreground max-w-2xl">
                  {description}
                </p>
              )}
            </div>
            
            {/* Action Buttons */}
            {actions.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {actions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant || "default"}
                    size={action.size || "default"}
                    disabled={action.disabled}
                    onClick={action.onClick}
                    asChild={!!action.href}
                    className="flex items-center gap-2"
                  >
                    {action.href ? (
                      <a href={action.href}>
                        {action.icon && <action.icon className="h-4 w-4" />}
                        {action.label}
                      </a>
                    ) : (
                      <>
                        {action.icon && <action.icon className="h-4 w-4" />}
                        {action.label}
                      </>
                    )}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Stats */}
          {stats.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 lg:gap-4">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border text-xs lg:text-sm"
                >
                  {stat.icon && (
                    <stat.icon className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className="font-medium">{stat.value}</span>
                  <span className="text-muted-foreground">{stat.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {children}
        </div>
      </div>
    </div>
  )
}

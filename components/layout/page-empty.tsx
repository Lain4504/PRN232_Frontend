"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon, Plus, Search, FileX } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface PageEmptyProps {
  title: string
  description: string
  icon?: LucideIcon
  action?: {
    label: string
    href?: string
    onClick?: () => void
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  }
  secondaryAction?: {
    label: string
    href?: string
    onClick?: () => void
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  }
  className?: string
}

export function PageEmpty({
  title,
  description,
  icon: Icon = FileX,
  action,
  secondaryAction,
  className
}: PageEmptyProps) {
  return (
    <div className={cn("w-full max-w-full overflow-x-hidden", className)}>
      <div className="space-y-6 lg:space-y-8 p-4 lg:p-6 xl:p-8 bg-background">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Icon className="h-6 w-6 text-muted-foreground" />
              </div>
              <CardTitle className="text-xl">{title}</CardTitle>
              <CardDescription className="text-center">
                {description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                {action && (
                  <Button
                    variant={action.variant || "default"}
                    onClick={action.onClick}
                    asChild={!!action.href}
                    className="w-full"
                  >
                    {action.href ? (
                      <Link href={action.href}>
                        <Plus className="mr-2 h-4 w-4" />
                        {action.label}
                      </Link>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        {action.label}
                      </>
                    )}
                  </Button>
                )}
                
                {secondaryAction && (
                  <Button
                    variant={secondaryAction.variant || "outline"}
                    onClick={secondaryAction.onClick}
                    asChild={!!secondaryAction.href}
                    className="w-full"
                  >
                    {secondaryAction.href ? (
                      <Link href={secondaryAction.href}>
                        <Search className="mr-2 h-4 w-4" />
                        {secondaryAction.label}
                      </Link>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        {secondaryAction.label}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

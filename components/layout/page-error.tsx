"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface PageErrorProps {
  title?: string
  description?: string
  error?: Error | string
  onRetry?: () => void
  showHomeButton?: boolean
  showBackButton?: boolean
  className?: string
}

export function PageError({
  title = "Something went wrong",
  description = "An unexpected error occurred. Please try again or contact support if the problem persists.",
  error,
  onRetry,
  showHomeButton = true,
  showBackButton = true,
  className
}: PageErrorProps) {
  const errorMessage = error instanceof Error ? error.message : error

  return (
    <div className={cn("w-full max-w-full overflow-x-hidden", className)}>
      <div className="space-y-6 lg:space-y-8 p-4 lg:p-6 xl:p-8 bg-background">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-xl">{title}</CardTitle>
              <CardDescription className="text-center">
                {description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <p className="text-sm text-muted-foreground font-mono">
                    {errorMessage}
                  </p>
                </div>
              )}
              
              <div className="flex flex-col gap-2">
                {onRetry && (
                  <Button onClick={onRetry} className="w-full">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                )}
                
                <div className="flex gap-2">
                  {showBackButton && (
                    <Button variant="outline" onClick={() => window.history.back()} className="flex-1">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Go Back
                    </Button>
                  )}
                  
                  {showHomeButton && (
                    <Button variant="outline" asChild className="flex-1">
                      <Link href="/dashboard">
                        <Home className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

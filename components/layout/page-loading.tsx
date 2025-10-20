"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface PageLoadingProps {
  className?: string
  showHeader?: boolean
  showStats?: boolean
  showContent?: boolean
  contentRows?: number
}

export function PageLoading({
  className,
  showHeader = true,
  showStats = true,
  showContent = true,
  contentRows = 3
}: PageLoadingProps) {
  return (
    <div className={cn("w-full max-w-full overflow-x-hidden", className)}>
      <div className="space-y-6 lg:space-y-8 p-4 lg:p-6 xl:p-8 bg-background">
        {/* Breadcrumb Loading */}
        <div className="flex items-center gap-2">
          <div className="h-4 w-20 bg-muted animate-pulse rounded" />
          <div className="h-4 w-1 bg-muted animate-pulse rounded" />
          <div className="h-4 w-16 bg-muted animate-pulse rounded" />
        </div>

        {/* Header Loading */}
        {showHeader && (
          <div className="space-y-3 lg:space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <div className="h-8 lg:h-10 xl:h-12 w-64 bg-muted animate-pulse rounded" />
                <div className="h-4 lg:h-5 xl:h-6 w-80 bg-muted animate-pulse rounded" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                <div className="h-8 w-28 bg-muted animate-pulse rounded" />
              </div>
            </div>

            {/* Stats Loading */}
            {showStats && (
              <div className="flex flex-wrap items-center gap-2 lg:gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-8 w-20 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Content Loading */}
        {showContent && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(contentRows)].map((_, i) => (
                <div key={i} className="h-40 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

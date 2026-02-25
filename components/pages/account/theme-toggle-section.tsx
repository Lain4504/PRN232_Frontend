"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useTheme } from "next-themes"
import { Sun, Moon, Monitor, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ThemeToggleSection() {
  const { theme, setTheme } = useTheme()

  const themes = [
    { value: "light", label: "Sáng", icon: Sun, desc: "Tối ưu cho ban ngày" },
    { value: "dark", label: "Tối", icon: Moon, desc: "Dịu mắt vào ban đêm" },
    { value: "system", label: "Hệ thống", icon: Monitor, desc: "Tự động điều chỉnh" },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground uppercase tracking-widest flex items-center gap-3">
        <div className="size-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
          <Palette className="size-4" />
        </div>
        Giao diện hệ thống
      </h2>

      <Card className="rounded-lg border-border bg-card shadow-sm overflow-hidden">
        <CardContent className="p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {themes.map((themeOption) => {
              const Icon = themeOption.icon
              const isActive = theme === themeOption.value

              return (
                <Button
                  key={themeOption.value}
                  variant="outline"
                  className={cn(
                    "h-auto p-6 flex flex-col items-center gap-3 rounded-lg border transition-all duration-300",
                    isActive
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/50 border-input text-muted-foreground hover:bg-accent"
                  )}
                  onClick={() => setTheme(themeOption.value)}
                >
                  <Icon className={cn("size-5", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                  <div className="text-center">
                    <span className="block text-xs font-bold uppercase tracking-widest leading-none mb-1">{themeOption.label}</span>
                    <span className={cn("text-[9px] font-medium", isActive ? "text-primary-foreground/70" : "text-muted-foreground/50")}>
                      {themeOption.desc}
                    </span>
                  </div>
                </Button>
              )
            })}
          </div>

          <p className="text-xs font-medium text-muted-foreground/50 text-center">
            Chế độ hệ thống sẽ tự động đồng bộ theo cài đặt của thiết bị bạn đang sử dụng.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

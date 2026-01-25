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
      <h2 className="text-xl font-bold text-slate-900 uppercase tracking-widest flex items-center gap-3">
        <div className="size-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
          <Palette className="size-4" />
        </div>
        Giao diện hệ thống
      </h2>

      <Card className="rounded-[2.5rem] border-slate-100 bg-white shadow-sm overflow-hidden">
        <CardContent className="p-10 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {themes.map((themeOption) => {
              const Icon = themeOption.icon
              const isActive = theme === themeOption.value

              return (
                <Button
                  key={themeOption.value}
                  variant="ghost"
                  className={cn(
                    "h-auto p-8 flex flex-col items-center gap-4 rounded-[2rem] border-2 transition-all duration-300",
                    isActive
                      ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-200"
                      : "bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100"
                  )}
                  onClick={() => setTheme(themeOption.value)}
                >
                  <Icon className={cn("size-6", isActive ? "text-white" : "text-slate-400")} />
                  <div className="text-center">
                    <span className="block text-sm font-bold uppercase tracking-widest leading-none mb-1">{themeOption.label}</span>
                    <span className={cn("text-[10px] font-medium opacity-60", isActive ? "text-slate-300" : "text-slate-400")}>
                      {themeOption.desc}
                    </span>
                  </div>
                </Button>
              )
            })}
          </div>

          <p className="text-xs font-medium text-slate-400 text-center">
            Chế độ hệ thống sẽ tự động đồng bộ theo cài đặt của thiết bị bạn đang sử dụng.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

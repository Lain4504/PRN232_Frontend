"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "next-themes";

export function AppearanceSection() {
  const { theme, setTheme } = useTheme();
  const [sidebarBehavior, setSidebarBehavior] = useState("hover");

  // Load sidebar behavior from localStorage on mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sidebarMode') as 'expanded' | 'collapsed' | 'hover' | null;
      if (stored === 'expanded' || stored === 'collapsed' || stored === 'hover') {
        setSidebarBehavior(stored);
      }
    }
  }, []);

  const handleSidebarBehaviorChange = (value: string) => {
    setSidebarBehavior(value);
    // Save to localStorage
    localStorage.setItem('sidebarMode', value);

    // Dispatch custom event to notify dashboard sidebar
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sidebar-mode-change', { detail: value }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Chủ đề hệ thống</h2>
        <Card className="rounded-lg border shadow-sm">
          <CardContent className="p-6">
            <RadioGroup
              value={theme}
              onValueChange={(v) => setTheme(v)}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {/* Light Theme */}
              <div>
                <RadioGroupItem value="light" id="theme-light" className="sr-only" />
                <Label
                  htmlFor="theme-light"
                  className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                >
                  <div className="relative aspect-video w-full rounded bg-white border overflow-hidden mb-3 shadow-inner">
                    <div className="absolute inset-0 p-2">
                      <div className="flex gap-1.5 mb-2">
                        <div className="size-2 rounded-full bg-red-400" />
                        <div className="size-2 rounded-full bg-amber-400" />
                        <div className="size-2 rounded-full bg-emerald-400" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="h-1.5 w-full bg-slate-100 rounded-px" />
                        <div className="h-1.5 w-3/4 bg-slate-100 rounded-px" />
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest">Sáng</span>
                </Label>
              </div>

              {/* Dark Theme */}
              <div>
                <RadioGroupItem value="dark" id="theme-dark" className="sr-only" />
                <Label
                  htmlFor="theme-dark"
                  className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                >
                  <div className="relative aspect-video w-full rounded bg-[#020617] border border-white/10 overflow-hidden mb-3 shadow-inner">
                    <div className="absolute inset-0 p-2">
                      <div className="flex gap-1.5 mb-2">
                        <div className="size-2 rounded-full bg-red-400" />
                        <div className="size-2 rounded-full bg-amber-400" />
                        <div className="size-2 rounded-full bg-emerald-400" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="h-1.5 w-full bg-slate-800 rounded-px" />
                        <div className="h-1.5 w-3/4 bg-slate-800 rounded-px" />
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest">Tối</span>
                </Label>
              </div>

              {/* System Theme */}
              <div>
                <RadioGroupItem value="system" id="theme-system" className="sr-only" />
                <Label
                  htmlFor="theme-system"
                  className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                >
                  <div className="relative aspect-video w-full rounded border overflow-hidden mb-3 shadow-inner">
                    <div className="flex h-full">
                      <div className="w-1/2 bg-[#020617] p-2">
                        <div className="flex gap-1.5 mb-2">
                          <div className="size-2 rounded-full bg-red-400" />
                          <div className="size-2 rounded-full bg-amber-400" />
                          <div className="size-2 rounded-full bg-emerald-400" />
                        </div>
                        <div className="space-y-1.5">
                          <div className="h-1.5 w-full bg-slate-800 rounded-px" />
                        </div>
                      </div>
                      <div className="w-1/2 bg-white p-2">
                        <div className="flex gap-1.5 mb-2">
                          <div className="size-2 rounded-full bg-red-400" />
                        </div>
                        <div className="space-y-1.5">
                          <div className="h-1.5 w-full bg-slate-100 rounded-px" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest">Hệ thống</span>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      </div>

      <div className="pt-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Hành vi sidebar</h2>
        <Card className="rounded-lg border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold uppercase tracking-tight">Trạng thái mặc định</Label>
                <p className="text-[11px] text-muted-foreground font-medium">Chọn cách sidebar hiển thị khi bạn truy cập hệ thống.</p>
              </div>
              <Select value={sidebarBehavior} onValueChange={handleSidebarBehaviorChange}>
                <SelectTrigger className="w-[200px] rounded-md h-10 font-bold text-xs uppercase tracking-widest">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent className="rounded-md">
                  <SelectItem value="expanded" className="text-xs font-bold uppercase tracking-widest">Mở rộng</SelectItem>
                  <SelectItem value="collapsed" className="text-xs font-bold uppercase tracking-widest">Thu gọn</SelectItem>
                  <SelectItem value="hover" className="text-xs font-bold uppercase tracking-widest">Mở rộng khi di chuột</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

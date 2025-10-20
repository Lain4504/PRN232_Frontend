"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "next-themes";
import { Zap } from "lucide-react";

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

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
  };

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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Appearance</CardTitle>
        <Separator />
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Theme Mode Section */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Theme mode</h3>
            <p className="text-sm text-muted-foreground">
              Choose how AISAM looks to you. Select a single theme, or sync with your system.
            </p>
          </div>
          
          <p className="text-sm text-muted-foreground">
            AISAM will use your selected theme
          </p>

          <RadioGroup value={theme} onValueChange={handleThemeChange} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Dark Theme */}
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="dark" id="dark" />
              <Label htmlFor="dark" className="flex items-center space-x-2 cursor-pointer flex-1">
                <div className="flex-1">
                  <div className="w-full h-16 bg-slate-900 rounded border p-2">
                    <div className="flex h-full">
                      <div className="w-8 bg-slate-800 rounded mr-2 flex items-center justify-center">
                        <Zap className="h-4 w-4 text-orange-500" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="h-2 bg-slate-700 rounded w-3/4"></div>
                        <div className="h-1.5 bg-slate-700 rounded w-1/2"></div>
                        <div className="h-1.5 bg-orange-500 rounded w-1/3"></div>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm font-medium mt-2">Dark</p>
                </div>
              </Label>
            </div>

            {/* Light Theme */}
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="light" id="light" />
              <Label htmlFor="light" className="flex items-center space-x-2 cursor-pointer flex-1">
                <div className="flex-1">
                  <div className="w-full h-16 bg-white border rounded p-2">
                    <div className="flex h-full">
                      <div className="w-8 bg-gray-100 rounded mr-2 flex items-center justify-center">
                        <Zap className="h-4 w-4 text-orange-500" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-1.5 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-1.5 bg-orange-500 rounded w-1/3"></div>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm font-medium mt-2">Light</p>
                </div>
              </Label>
            </div>

            {/* System Theme */}
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="system" id="system" />
              <Label htmlFor="system" className="flex items-center space-x-2 cursor-pointer flex-1">
                <div className="flex-1">
                  <div className="w-full h-16 rounded border overflow-hidden">
                    <div className="flex h-full">
                      <div className="w-1/2 bg-slate-900 p-1">
                        <div className="flex h-full">
                          <div className="w-6 bg-slate-800 rounded mr-1 flex items-center justify-center">
                            <Zap className="h-3 w-3 text-orange-500" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="h-1.5 bg-slate-700 rounded w-3/4"></div>
                            <div className="h-1 bg-slate-700 rounded w-1/2"></div>
                            <div className="h-1 bg-orange-500 rounded w-1/3"></div>
                          </div>
                        </div>
                      </div>
                      <div className="w-1/2 bg-white p-1">
                        <div className="flex h-full">
                          <div className="w-6 bg-gray-100 rounded mr-1 flex items-center justify-center">
                            <Zap className="h-3 w-3 text-orange-500" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="h-1.5 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-1 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-1 bg-orange-500 rounded w-1/3"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm font-medium mt-2">System</p>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Sidebar Behavior Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-medium">Sidebar behavior</h3>
              <p className="text-sm text-muted-foreground">
                Choose your preferred sidebar behavior: open, closed, or expand on hover.
              </p>
            </div>
            <div className="w-full sm:w-48">
              <Select value={sidebarBehavior} onValueChange={handleSidebarBehaviorChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select behavior" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expanded">Expanded</SelectItem>
                  <SelectItem value="collapsed">Collapsed</SelectItem>
                  <SelectItem value="hover">Expand on hover</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

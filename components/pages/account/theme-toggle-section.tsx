"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggleSection() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Theme Preference</CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose your preferred theme mode
        </p>
        <Separator />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {themes.map((themeOption) => {
            const Icon = themeOption.icon;
            const isActive = theme === themeOption.value;
            
            return (
              <Button
                key={themeOption.value}
                variant={isActive ? "default" : "outline"}
                 className={`h-auto p-4 flex flex-col items-center gap-3 transition-all duration-200 ${
                   isActive 
                     ? "bg-primary hover:bg-primary/90 text-primary-foreground border-primary" 
                     : "hover:bg-accent"
                 }`}
                onClick={() => setTheme(themeOption.value)}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{themeOption.label}</span>
              </Button>
            );
          })}
        </div>
        
        <div className="text-xs text-muted-foreground text-center">
          System theme will automatically switch based on your device settings
        </div>
      </CardContent>
    </Card>
  );
}

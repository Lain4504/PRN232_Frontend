"use client";

import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, ChevronDown } from "lucide-react";

import i18nConfig from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    const currentLanguage = i18n.resolvedLanguage || i18n.language || "en";
    const isVietnamese = currentLanguage.startsWith("vi");
    const isEnglish = currentLanguage.startsWith("en");

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-auto px-3 gap-2 font-medium">
                    <Globe className="h-4 w-4" />
                    <span className="hidden sm:inline-block">
                        {isVietnamese ? "Tiếng Việt" : "English"}
                    </span>
                    <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                    onClick={() => changeLanguage("en")}
                    className={cn(
                        "gap-2 font-medium cursor-pointer flex justify-between items-center",
                        isEnglish && "bg-muted"
                    )}
                >
                    <div className="flex items-center gap-2">
                        <span className="text-base">🇺🇸</span>
                        English
                    </div>
                    {isEnglish && <span className="text-primary text-sm font-bold">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => changeLanguage("vi")}
                    className={cn(
                        "gap-2 font-medium cursor-pointer flex justify-between items-center",
                        isVietnamese && "bg-muted"
                    )}
                >
                    <div className="flex items-center gap-2">
                        <span className="text-base">🇻🇳</span>
                        Tiếng Việt
                    </div>
                    {isVietnamese && <span className="text-primary text-sm font-bold">✓</span>}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

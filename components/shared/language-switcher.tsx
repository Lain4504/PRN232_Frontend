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

export function LanguageSwitcher() {
    const { i18n: i18nContext } = useTranslation();
    const i18n = i18nContext || i18nConfig;

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    const currentLanguage = i18n.language || "en";

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-auto px-3 gap-2 font-medium">
                    <Globe className="h-4 w-4" />
                    <span className="hidden sm:inline-block">
                        {currentLanguage === "vi" ? "Tiếng Việt" : "English"}
                    </span>
                    <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => changeLanguage("en")} className="gap-2 font-medium cursor-pointer">
                    <span className="w-4 text-center">{currentLanguage === "en" ? "✓" : ""}</span>
                    English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage("vi")} className="gap-2 font-medium cursor-pointer">
                    <span className="w-4 text-center">{currentLanguage === "vi" ? "✓" : ""}</span>
                    Tiếng Việt
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

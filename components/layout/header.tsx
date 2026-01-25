"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/lib/contexts/auth-context"
import { useState, useRef } from "react"
import {
    Zap,
    Brain,
    Target,
    Calendar,
    BarChart3,
    Menu,
    ChevronDown,
    Book,
    Code,
    FileText,
    Layout,
} from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { UserDropdown } from "@/components/layout/user-dropdown"
import { cn } from "@/lib/utils"
import { LanguageSwitcher } from "@/components/shared/language-switcher"
import { useTranslation } from "react-i18next"

export function Header() {
    const { user } = useAuth()
    const { t } = useTranslation("common")
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [activeMenu, setActiveMenu] = useState<string | null>(null)
    const menuTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const handleMouseEnter = (menu: string) => {
        if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current)
        setActiveMenu(menu)
    }

    const handleMouseLeave = () => {
        menuTimeoutRef.current = setTimeout(() => {
            setActiveMenu(null)
        }, 150)
    }

    const features = [
        { href: "/features/ai-content", icon: Brain, title: t("features.aiContent.title") || "Neural Synthesis", desc: t("features.aiContent.description") || "Generate high-fidelity creative content.", color: "text-blue-500", bg: "bg-blue-500/10" },
        { href: "/features/brand-management", icon: Target, title: t("features.brandManagement.title") || "Identity Matrix", desc: t("features.brandManagement.description") || "Keep your brand voice and look consistent.", color: "text-rose-500", bg: "bg-rose-500/10" },
        { href: "/features/scheduling", icon: Calendar, title: t("features.scheduling.title") || "Temporal Sync", desc: t("features.scheduling.description") || "Automate deployment and publishing schedules.", color: "text-amber-500", bg: "bg-amber-500/10" },
        { href: "/features/analytics", icon: BarChart3, title: t("features.analytics.title") || "Data Velocity", desc: t("features.analytics.description") || "Real-time growth numbers at a glance.", color: "text-emerald-500", bg: "bg-emerald-500/10" },
    ]

    const resources = [
        { href: "/docs", icon: Book, title: t("header.knowledgeItems.docs.title"), desc: t("header.knowledgeItems.docs.desc") },
        { href: "/api", icon: Code, title: t("header.knowledgeItems.api.title"), desc: t("header.knowledgeItems.api.desc") },
        { href: "/blog", icon: FileText, title: t("header.knowledgeItems.blog.title"), desc: t("header.knowledgeItems.blog.desc") },
    ]

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                            <Zap className="size-5 fill-current" />
                        </div>
                        <span className="text-lg font-bold tracking-tight text-foreground">
                            {t("header.brand.name")}
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-6">
                        <div
                            className="relative group py-4"
                            onMouseEnter={() => handleMouseEnter('features')}
                            onMouseLeave={handleMouseLeave}
                        >
                            <button className={cn(
                                "flex items-center gap-1 text-sm font-medium transition-colors",
                                activeMenu === 'features' ? "text-primary" : "text-muted-foreground hover:text-foreground"
                            )}>
                                {t("header.menu.capabilities")}
                                <ChevronDown className={cn("size-3 transition-transform duration-200", activeMenu === 'features' && "rotate-180")} />
                            </button>

                            {/* Features Dropdown */}
                            <div className={cn(
                                "absolute top-full left-0 w-[600px] pt-2 transition-all duration-200",
                                activeMenu === 'features' ? "opacity-100 translate-y-0 visible" : "opacity-0 translate-y-2 invisible"
                            )}>
                                <div className="bg-popover border rounded-xl shadow-lg p-4 grid grid-cols-2 gap-4">
                                    {features.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className="flex gap-4 p-3 rounded-lg hover:bg-muted transition-colors"
                                        >
                                            <div className={cn("size-10 rounded-lg flex items-center justify-center shrink-0", item.bg, item.color)}>
                                                <item.icon className="size-5" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-foreground">
                                                    {item.title}
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                    {item.desc}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div
                            className="relative group py-4"
                            onMouseEnter={() => handleMouseEnter('resources')}
                            onMouseLeave={handleMouseLeave}
                        >
                            <button className={cn(
                                "flex items-center gap-1 text-sm font-medium transition-colors",
                                activeMenu === 'resources' ? "text-primary" : "text-muted-foreground hover:text-foreground"
                            )}>
                                {t("header.menu.knowledge")}
                                <ChevronDown className={cn("size-3 transition-transform duration-200", activeMenu === 'resources' && "rotate-180")} />
                            </button>

                            {/* Resources Dropdown */}
                            <div className={cn(
                                "absolute top-full left-0 w-[400px] pt-2 transition-all duration-200",
                                activeMenu === 'resources' ? "opacity-100 translate-y-0 visible" : "opacity-0 translate-y-2 invisible"
                            )}>
                                <div className="bg-popover border rounded-xl shadow-lg p-2">
                                    {resources.map((item) => (
                                        <Link
                                            key={item.title}
                                            href={item.href}
                                            className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors"
                                        >
                                            <div className="size-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                                                <item.icon className="size-4 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-foreground">{item.title}</div>
                                                <div className="text-xs text-muted-foreground">{item.desc}</div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <Link
                            href="/pricing"
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {t("header.menu.accessPlans")}
                        </Link>
                    </nav>
                </div>

                {/* Authentication */}
                <div className="flex items-center gap-4">
                    <div className="hidden sm:block">
                        <LanguageSwitcher />
                    </div>

                    {user ? (
                        <div className="flex items-center gap-4">
                            <Button asChild variant="default" size="sm" className="hidden lg:flex">
                                <Link href="/overview">
                                    <Layout className="size-4 mr-2" />
                                    {t("header.buttons.enterConsole")}
                                </Link>
                            </Button>
                            <UserDropdown user={user} />
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Button asChild variant="ghost" size="sm" className="hidden lg:flex">
                                <Link href="/auth/login">{t("header.buttons.initializeSession")}</Link>
                            </Button>
                            <Button asChild size="sm">
                                <Link href="/auth/sign-up">
                                    {t("header.buttons.deployMatrix")}
                                </Link>
                            </Button>
                        </div>
                    )}

                    {/* Mobile Navigation */}
                    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="lg:hidden">
                                <Menu className="size-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                            <SheetTitle className="sr-only">Menu</SheetTitle>

                            <div className="flex flex-col gap-6 mt-6">
                                <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                                    <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                                        <Zap className="size-5 fill-current" />
                                    </div>
                                    <span className="text-lg font-bold tracking-tight">
                                        {t("header.brand.name")}
                                    </span>
                                </Link>

                                <nav className="flex flex-col gap-4">
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-medium text-muted-foreground">{t("header.menu.capabilities")}</h4>
                                        {features.map((item) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                                            >
                                                <div className={cn("size-8 rounded-md flex items-center justify-center shrink-0", item.bg, item.color)}>
                                                    <item.icon className="size-4" />
                                                </div>
                                                <span className="text-sm font-medium">{item.title}</span>
                                            </Link>
                                        ))}
                                    </div>

                                    <div className="space-y-3">
                                        <h4 className="text-sm font-medium text-muted-foreground">{t("header.menu.knowledge")}</h4>
                                        {resources.map((item) => (
                                            <Link
                                                key={item.href}
                                                href={item.href || '#'}
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                                            >
                                                <div className="size-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                                                    <item.icon className="size-4 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium">{item.title}</div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>

                                    <Link
                                        href="/pricing"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="text-sm font-medium text-foreground p-2"
                                    >
                                        {t("header.menu.accessPlans")}
                                    </Link>
                                </nav>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    )
}

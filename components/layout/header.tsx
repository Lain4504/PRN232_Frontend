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
    Sparkles,
    Layout,
    ChevronRight,
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
        { href: "/features/ai-content", icon: Brain, title: t("header.featureItems.aiContent.title"), desc: t("header.featureItems.aiContent.desc"), color: "text-blue-500", bg: "bg-blue-500/10" },
        { href: "/features/brand-management", icon: Target, title: t("header.featureItems.brandManagement.title"), desc: t("header.featureItems.brandManagement.desc"), color: "text-rose-500", bg: "bg-rose-500/10" },
        { href: "/features/scheduling", icon: Calendar, title: t("header.featureItems.scheduling.title"), desc: t("header.featureItems.scheduling.desc"), color: "text-amber-500", bg: "bg-amber-500/10" },
        { href: "/features/analytics", icon: BarChart3, title: t("header.featureItems.analytics.title"), desc: t("header.featureItems.analytics.desc"), color: "text-emerald-500", bg: "bg-emerald-500/10" },
    ]

    const resources = [
        { href: "/docs", icon: Book, title: t("header.knowledgeItems.docs.title"), desc: t("header.knowledgeItems.docs.desc") },
        { href: "/api", icon: Code, title: t("header.knowledgeItems.api.title"), desc: t("header.knowledgeItems.api.desc") },
        { href: "/blog", icon: FileText, title: t("header.knowledgeItems.blog.title"), desc: t("header.knowledgeItems.blog.desc") },
    ]

    const navMenuItems = [
        ...features,
        { href: "/pricing", icon: Target, title: t("header.menu.accessPlans") },
        ...resources,
    ]

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-xl border-b border-white/5 supports-[backdrop-filter]:bg-background/60 font-fira-sans">
            <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-12">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="size-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-primary/40 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent translate-y-full group-hover:translate-y-[-100%] transition-transform duration-700" />
                            <Zap className="size-6 text-primary-foreground fill-current" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black text-foreground tracking-tighter leading-none mb-0.5 italic">
                                AISAM
                            </span>
                            <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] leading-none">Intelligence Grid</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-1">
                        <div
                            className="relative group px-4"
                            onMouseEnter={() => handleMouseEnter('features')}
                            onMouseLeave={handleMouseLeave}
                        >
                            <button className={cn(
                                "flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-wide transition-all py-8",
                                activeMenu === 'features' ? "text-primary" : "text-muted-foreground/80 hover:text-foreground"
                            )}>
                                {t("header.menu.capabilities")}
                                <ChevronDown className={cn("size-3 transition-transform duration-300", activeMenu === 'features' && "rotate-180 text-primary")} />
                            </button>

                            {/* Features Dropdown */}
                            <div className={cn(
                                "fixed top-[70px] left-1/2 -translate-x-1/2 w-full max-w-5xl px-6 pt-4 transition-all duration-300 pointer-events-none perspective-[2000px]",
                                activeMenu === 'features' ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-4"
                            )}>
                                <div className="bg-background/95 backdrop-blur-2xl border border-white/10 rounded-[32px] shadow-2xl p-2 grid grid-cols-2 gap-2 transform-style-3d origin-top">
                                    {features.map((item) => (
                                        <Link
                                            key={item.title}
                                            href={item.href}
                                            className="group flex gap-5 p-5 rounded-[24px] hover:bg-muted/30 border border-transparent hover:border-white/5 transition-all duration-300"
                                        >
                                            <div className={cn("size-14 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500 shadow-inner", item.bg, item.color)}>
                                                <item.icon className="size-7" />
                                            </div>
                                            <div className="space-y-1 my-auto">
                                                <div className="text-sm font-black text-foreground uppercase tracking-tight flex items-center gap-2">
                                                    {item.title}
                                                    <ChevronRight className="size-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 text-primary" />
                                                </div>
                                                <p className="text-xs text-muted-foreground font-medium leading-relaxed max-w-[280px]">
                                                    {item.desc}
                                                </p>
                                            </div>
                                            <div className="ml-auto my-auto opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                                <Sparkles className={cn("size-4 animate-pulse", item.color)} />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div
                            className="relative px-4"
                            onMouseEnter={() => handleMouseEnter('resources')}
                            onMouseLeave={handleMouseLeave}
                        >
                            <button className={cn(
                                "flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-wide transition-all py-8",
                                activeMenu === 'resources' ? "text-primary" : "text-muted-foreground/80 hover:text-foreground"
                            )}>
                                {t("header.menu.knowledge")}
                                <ChevronDown className={cn("size-3 transition-transform duration-300", activeMenu === 'resources' && "rotate-180 text-primary")} />
                            </button>

                            {/* Resources Dropdown */}
                            <div className={cn(
                                "fixed top-[70px] left-1/2 -translate-x-1/2 w-full max-w-[1000px] flex justify-center pt-4 transition-all duration-300 pointer-events-none",
                                activeMenu === 'resources' ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-4"
                            )}>
                                <div className="w-[800px] bg-background/95 backdrop-blur-2xl border border-white/10 rounded-[32px] shadow-2xl p-2 flex gap-2">
                                    {resources.map((item) => (
                                        <Link
                                            key={item.title}
                                            href={item.href}
                                            className="group flex-1 flex flex-col items-center justify-center p-6 rounded-[24px] hover:bg-muted/30 border border-transparent hover:border-white/5 transition-all duration-300 text-center gap-4"
                                        >
                                            <div className="size-12 rounded-xl bg-muted/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-inner">
                                                <item.icon className="size-6 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-sm font-black text-foreground uppercase tracking-tight">{item.title}</div>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.desc}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <Link
                            href="/pricing"
                            className="px-4 text-[13px] font-bold text-muted-foreground/80 hover:text-foreground transition-all py-8 uppercase tracking-wide hover:tracking-widest duration-300"
                        >
                            {t("header.menu.accessPlans")}
                        </Link>
                    </nav>
                </div>

                {/* Authentication */}
                <div className="flex items-center gap-4 sm:gap-6">
                    <div className="hidden sm:block">
                        <LanguageSwitcher />
                    </div>

                    {user ? (
                        <div className="flex items-center gap-4 sm:gap-6">
                            <UserDropdown user={user} />
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Button asChild variant="ghost" className="hidden lg:flex text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-transparent hover:text-primary transition-colors">
                                <Link href="/auth/login">{t("header.buttons.initializeSession")}</Link>
                            </Button>
                            <Button asChild className="hidden sm:flex rounded-2xl font-black uppercase tracking-widest text-[10px] h-10 px-6 shadow-xl shadow-primary/25 bg-primary hover:bg-primary/90 transition-all hover:scale-105 active:scale-95">
                                <Link href="/auth/sign-up">
                                    {t("header.buttons.deployMatrix")}
                                </Link>
                            </Button>
                        </div>
                    )}

                    {/* Mobile Navigation */}
                    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="lg:hidden rounded-xl h-10 w-10 hover:bg-muted/30 transition-all border border-transparent hover:border-white/5 bg-muted/10">
                                <Menu className="size-6 text-foreground" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-full max-w-sm p-0 flex flex-col bg-background/95 backdrop-blur-xl border-l border-white/10 dark:bg-background/90">
                            <SheetTitle className="sr-only">Menu</SheetTitle>

                            {/* Mobile Menu Header */}
                            <div className="flex items-center justify-between p-6 border-b border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                                        <Zap className="size-6 text-primary-foreground fill-current" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xl font-black text-foreground tracking-tighter italic leading-none">AISAM</span>
                                        <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em] leading-none mt-1">Intelligence Grid</span>
                                    </div>
                                </div>
                            </div>

                            <nav className="flex-1 overflow-y-auto py-6 px-4">
                                <div className="space-y-6">
                                    {/* Submenu: Capabilities */}
                                    <div className="space-y-3">
                                        <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{t("header.menu.capabilities")}</h3>
                                        <div className="grid gap-1">
                                            {features.map((item) => (
                                                <Link
                                                    key={item.title}
                                                    href={item.href}
                                                    onClick={() => setMobileMenuOpen(false)}
                                                    className="flex items-center gap-4 p-4 rounded-2xl hover:bg-muted/30 transition-all group"
                                                >
                                                    <div className={cn("size-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm", item.bg, item.color)}>
                                                        <item.icon className="size-5" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[13px] font-bold text-foreground uppercase tracking-tight">{item.title}</span>
                                                        <span className="text-[10px] text-muted-foreground font-medium line-clamp-1">{item.desc}</span>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Submenu: Knowledge */}
                                    <div className="space-y-3">
                                        <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{t("header.menu.knowledge")}</h3>
                                        <div className="grid gap-1">
                                            {resources.map((item) => (
                                                <Link
                                                    key={item.title}
                                                    href={item.href}
                                                    onClick={() => setMobileMenuOpen(false)}
                                                    className="flex items-center gap-4 p-4 rounded-2xl hover:bg-muted/30 transition-all group"
                                                >
                                                    <div className="size-10 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
                                                        <item.icon className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[13px] font-bold text-foreground uppercase tracking-tight">{item.title}</span>
                                                        <span className="text-[10px] text-muted-foreground font-medium line-clamp-1">{item.desc}</span>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Direct Link: Pricing */}
                                    <Link
                                        href="/pricing"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center gap-4 p-4 rounded-2xl hover:bg-muted/30 transition-all group border border-primary/10 bg-primary/5"
                                    >
                                        <div className="size-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                                            <Target className="size-5 text-primary" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[13px] font-bold text-primary uppercase tracking-tight">{t("header.menu.accessPlans")}</span>
                                            <span className="text-[10px] text-primary/60 font-medium">{t("header.menu.viewAffordableTiers")}</span>
                                        </div>
                                    </Link>
                                </div>
                            </nav>

                            {/* Mobile Menu Footer */}
                            <div className="p-6 border-t border-white/5 bg-muted/5 space-y-4">
                                <div className="flex items-center justify-between px-2 mb-2">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("header.menu.systemLanguage")}</span>
                                    <LanguageSwitcher />
                                </div>

                                {user ? (
                                    <Button asChild className="w-full rounded-2xl font-black uppercase tracking-widest h-14 text-xs shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90">
                                        <Link href="/overview" onClick={() => setMobileMenuOpen(false)}>
                                            <Layout className="size-4 mr-2" />
                                            {t("header.buttons.enterConsole")}
                                        </Link>
                                    </Button>
                                ) : (
                                    <div className="grid grid-cols-2 gap-4">
                                        <Button asChild variant="outline" className="rounded-2xl font-black uppercase tracking-widest h-14 text-[10px] border-2 border-border">
                                            <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>{t("header.buttons.login")}</Link>
                                        </Button>
                                        <Button asChild className="rounded-2xl font-black uppercase tracking-widest h-14 text-[10px] shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
                                            <Link href="/auth/sign-up" onClick={() => setMobileMenuOpen(false)}>{t("header.buttons.signUp")}</Link>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    )
}

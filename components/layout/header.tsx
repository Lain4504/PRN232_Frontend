"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/lib/contexts/auth-context"
import { useEffect, useState, useRef } from "react"
import {
    Zap,
    Brain,
    Target,
    Calendar,
    BarChart3,
    Menu,
    ChevronDown,
    ChevronRight,
    Book,
    Code,
    FileText,
} from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { UserDropdown } from "@/components/layout/user-dropdown"
import { cn } from "@/lib/utils"

export function Header() {
    const { user } = useAuth()
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
        { href: "/features/ai-content", icon: Brain, title: "AI CONTENT", desc: "Generate high-quality social media content.", color: "text-blue-500", bg: "bg-blue-500/10" },
        { href: "/features/brand-management", icon: Target, title: "BRAND HUB", desc: "Maintain brand consistency across all posts.", color: "text-rose-500", bg: "bg-rose-500/10" },
        { href: "/features/scheduling", icon: Calendar, title: "SCHEDULING", desc: "Plan and automate your social media posting.", color: "text-amber-500", bg: "bg-amber-500/10" },
        { href: "/features/analytics", icon: BarChart3, title: "ANALYTICS", desc: "Track performance and campaign growth.", color: "text-emerald-500", bg: "bg-emerald-500/10" },
    ]

    const resources = [
        { href: "/docs", icon: Book, title: "DOCUMENTATION", desc: "Guides and technical manuals." },
        { href: "/api", icon: Code, title: "API REFERENCE", desc: "Integration and developer tools." },
        { href: "/blog", icon: FileText, title: "BLOG", desc: "Latest updates and marketing insights." },
    ]

    return (
        <header className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-[1440px] font-fira-sans">
            <div className="relative bg-card/40 backdrop-blur-3xl border border-border/40 rounded-[2rem] shadow-2xl px-6 lg:px-10">
                <div className="flex justify-between items-center h-22">
                    <div className="flex items-center gap-12">
                        {/* Logo */}
                        <Link href="/" className="flex items-center space-x-3 group mr-4">
                            <div className="relative">
                                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center group-hover:rotate-[10deg] transition-all duration-500 shadow-xl shadow-primary/20">
                                    <Zap className="h-5 w-5 text-primary-foreground fill-current" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background animate-pulse" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-black text-foreground tracking-[0.2em] uppercase leading-none mb-0.5">
                                    AISAM
                                </span>
                                <span className="text-[8px] font-black text-primary uppercase tracking-[0.4em] leading-none italic">AI Platform</span>
                            </div>
                        </Link>

                        {/* Navigation Menu */}
                        <nav className="hidden xl:flex items-center gap-8">
                            <div
                                className="relative py-8"
                                onMouseEnter={() => handleMouseEnter('features')}
                                onMouseLeave={handleMouseLeave}
                            >
                                <button className={cn(
                                    "flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                                    activeMenu === 'features' ? "text-primary" : "text-muted-foreground/80 hover:text-foreground"
                                )}>
                                    Features
                                    <ChevronDown className={cn("w-3 h-3 transition-transform duration-300", activeMenu === 'features' && "rotate-180")} />
                                </button>

                                {/* Features Dropdown */}
                                <div className={cn(
                                    "absolute top-full left-[-20px] pt-4 transition-all duration-300 pointer-events-none",
                                    activeMenu === 'features' ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4"
                                )}>
                                    <div className="w-[640px] bg-card/95 backdrop-blur-2xl border border-border/40 rounded-[2rem] shadow-[0_32px_128px_-32px_rgba(0,0,0,0.5)] p-8 grid grid-cols-2 gap-6">
                                        {features.map((item) => (
                                            <Link
                                                key={item.title}
                                                href={item.href}
                                                className="group relative flex gap-5 p-6 rounded-[1.5rem] hover:bg-primary/5 border border-transparent hover:border-primary/10 transition-all"
                                            >
                                                <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform", item.bg, item.color)}>
                                                    <item.icon className="h-6 w-6 stroke-[2.5]" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <div className="text-[11px] font-black uppercase tracking-widest text-foreground group-hover:text-primary transition-colors">{item.title}</div>
                                                    <p className="text-[10px] font-medium text-muted-foreground/70 leading-relaxed font-fira-sans">
                                                        {item.desc}
                                                    </p>
                                                </div>
                                                <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                                                    <ChevronRight className="w-4 h-4 text-primary" />
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div
                                className="relative py-8"
                                onMouseEnter={() => handleMouseEnter('resources')}
                                onMouseLeave={handleMouseLeave}
                            >
                                <button className={cn(
                                    "flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                                    activeMenu === 'resources' ? "text-primary" : "text-muted-foreground/80 hover:text-foreground"
                                )}>
                                    Resources
                                    <ChevronDown className={cn("w-3 h-3 transition-transform duration-300", activeMenu === 'resources' && "rotate-180")} />
                                </button>

                                {/* Resources Dropdown */}
                                <div className={cn(
                                    "absolute top-full left-[-20px] pt-4 transition-all duration-300 pointer-events-none",
                                    activeMenu === 'resources' ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4"
                                )}>
                                    <div className="w-[320px] bg-card/95 backdrop-blur-2xl border border-border/40 rounded-[2rem] shadow-[0_32px_128px_-32px_rgba(0,0,0,0.5)] p-4 flex flex-col gap-2">
                                        {resources.map((item) => (
                                            <Link
                                                key={item.title}
                                                href={item.href}
                                                className="group p-5 rounded-[1.2rem] hover:bg-primary/5 border border-transparent hover:border-primary/10 transition-all flex items-center justify-between"
                                            >
                                                <div className="flex flex-col gap-1">
                                                    <div className="text-[11px] font-black uppercase tracking-widest text-foreground group-hover:text-primary transition-colors">{item.title}</div>
                                                    <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest leading-none">{item.desc}</p>
                                                </div>
                                                <item.icon className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <Link
                                href="/pricing"
                                className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 hover:text-foreground transition-all py-8"
                            >
                                Pricing
                            </Link>
                        </nav>
                    </div>

                    {/* Authentication */}
                    <div className="flex items-center gap-6">
                        {user ? (
                            <div className="flex items-center gap-6">
                                <Button asChild className="hidden sm:flex h-11 px-8 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                                    <Link href="/overview">
                                        LAUNCH DASHBOARD
                                    </Link>
                                </Button>
                                <div className="h-8 w-px bg-border/40" />
                                <UserDropdown user={user} />
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Button asChild variant="ghost" className="hidden sm:flex h-11 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted/10 rounded-xl transition-all">
                                    <Link href="/auth/login">LOG IN</Link>
                                </Button>
                                <Button asChild className="h-11 px-8 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                                    <Link href="/auth/sign-up">
                                        GET STARTED
                                    </Link>
                                </Button>
                            </div>
                        )}

                        {/* Mobile Navigation */}
                        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                            <SheetTrigger asChild className="xl:hidden">
                                <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl hover:bg-muted/10 transition-all">
                                    <Menu className="h-6 w-6 text-foreground" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-full sm:w-[400px] p-0 bg-background/95 backdrop-blur-2xl border-l border-border/40">
                                <SheetTitle className="sr-only">Mobile Navigation</SheetTitle>
                                <div className="flex flex-col h-full font-fira-sans">
                                    <div className="flex items-center p-8 border-b border-border/20">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                                                <Zap className="h-6 w-6 text-primary-foreground fill-current" />
                                            </div>
                                            <span className="text-xl font-black text-foreground tracking-widest uppercase mb-0.5">AISAM</span>
                                        </div>
                                    </div>

                                    <nav className="flex-1 p-8 space-y-3 overflow-y-auto">
                                        <div className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4 block italic opacity-50 px-2">Operational Hub</div>
                                        {[
                                            { href: "/features/ai-content", title: "AI CONTENT" },
                                            { href: "/features/brand-management", title: "BRAND HUB" },
                                            { href: "/features/scheduling", title: "SCHEDULING" },
                                            { href: "/features/analytics", title: "ANALYTICS" },
                                            { href: "/pricing", title: "PRICING" },
                                            { href: "/docs", title: "DOCUMENTATION" },
                                            { href: "/blog", title: "BLOG" },
                                        ].map((item) => (
                                            <Link key={item.title} href={item.href} onClick={() => setMobileMenuOpen(false)} className="flex items-center h-16 px-8 rounded-3xl bg-card/40 border border-border/20 text-[11px] font-black uppercase tracking-[0.2em] text-foreground hover:border-primary/50 transition-all">
                                                {item.title}
                                            </Link>
                                        ))}
                                    </nav>

                                    <div className="p-8 border-t border-border/20">
                                        {user ? (
                                            <Button asChild className="w-full h-16 bg-primary text-primary-foreground font-black uppercase tracking-widest rounded-3xl shadow-xl shadow-primary/20">
                                                <Link href="/overview" onClick={() => setMobileMenuOpen(false)}>
                                                    OPEN CONSOLE
                                                </Link>
                                            </Button>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-4">
                                                <Button asChild variant="outline" className="h-16 bg-muted/20 border-border/40 font-black uppercase tracking-widest rounded-3xl">
                                                    <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>LOGIN</Link>
                                                </Button>
                                                <Button asChild className="h-16 bg-primary text-primary-foreground font-black uppercase tracking-widest rounded-3xl shadow-xl shadow-primary/20">
                                                    <Link href="/auth/sign-up" onClick={() => setMobileMenuOpen(false)}>SIGN UP</Link>
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </header>
    )
}

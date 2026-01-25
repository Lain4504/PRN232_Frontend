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
        { href: "/features/ai-content", icon: Brain, title: "Neural Synthesis", desc: "Generate high-fidelity creative content.", color: "text-blue-500", bg: "bg-blue-500/10" },
        { href: "/features/brand-management", icon: Target, title: "Identity Matrix", desc: "Maintain absolute brand coherence.", color: "text-rose-500", bg: "bg-rose-500/10" },
        { href: "/features/scheduling", icon: Calendar, title: "Temporal Sync", desc: "Automated deployment sequencing.", color: "text-amber-500", bg: "bg-amber-500/10" },
        { href: "/features/analytics", icon: BarChart3, title: "Data Velocity", desc: "Real-time growth performance metrics.", color: "text-emerald-500", bg: "bg-emerald-500/10" },
    ]

    const resources = [
        { href: "/docs", icon: Book, title: "Archives", desc: "Technical Manuals" },
        { href: "/api", icon: Code, title: "API Nexus", desc: "Developer Tools" },
        { href: "/blog", icon: FileText, title: "Signals", desc: "Market Insights" },
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
                                Capabilities
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
                                Knowledge
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
                            Access Plans
                        </Link>
                    </nav>
                </div>

                {/* Authentication */}
                <div className="flex items-center gap-6">
                    {user ? (
                        <div className="flex items-center gap-6">
                            <Button asChild className="hidden sm:flex rounded-2xl font-black uppercase tracking-widest text-[10px] h-10 px-6 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98]">
                                <Link href="/overview">
                                    <Layout className="size-3 mr-2" />
                                    Launch Console
                                </Link>
                            </Button>
                            <div className="h-4 w-px bg-border/50" />
                            <UserDropdown user={user} />
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Button asChild variant="ghost" className="hidden sm:flex text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-transparent hover:text-primary transition-colors">
                                <Link href="/auth/login">Initialize Session</Link>
                            </Button>
                            <Button asChild className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-11 px-8 shadow-xl shadow-primary/25 bg-primary hover:bg-primary/90 transition-all hover:scale-105 active:scale-95">
                                <Link href="/auth/sign-up">
                                    Deploy Matrix
                                </Link>
                            </Button>
                        </div>
                    )}

                    {/* Mobile Navigation */}
                    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="lg:hidden rounded-xl">
                                <Menu className="size-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-full max-w-sm p-0 flex flex-col bg-background/95 backdrop-blur-xl border-l border-white/10">
                            <SheetTitle className="sr-only">Menu</SheetTitle>
                            <div className="flex items-center p-8 border-b border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                                        <Zap className="size-6 text-primary-foreground fill-current" />
                                    </div>
                                    <span className="text-xl font-black text-foreground tracking-tighter italic">AISAM</span>
                                </div>
                            </div>

                            <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
                                {[...features, { href: "/pricing", title: "Access Plans", icon: Target }, ...resources].map((item: any) => (
                                    <Link
                                        key={item.title}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center gap-4 p-4 rounded-2xl border border-transparent hover:bg-muted/30 hover:border-white/5 transition-all group"
                                    >
                                        <div className="size-10 rounded-xl bg-muted/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            {item.icon && <item.icon className="size-5 text-muted-foreground group-hover:text-foreground transition-colors" />}
                                        </div>
                                        <span className="text-sm font-bold text-foreground uppercase tracking-tight">{item.title}</span>
                                    </Link>
                                ))}
                            </nav>

                            <div className="p-8 border-t border-white/5 space-y-4 bg-muted/5">
                                {user ? (
                                    <Button asChild className="w-full rounded-2xl font-black uppercase tracking-widest h-14 text-xs shadow-xl shadow-primary/20">
                                        <Link href="/overview" onClick={() => setMobileMenuOpen(false)}>
                                            Enter Console
                                        </Link>
                                    </Button>
                                ) : (
                                    <div className="grid grid-cols-2 gap-4">
                                        <Button asChild variant="outline" className="rounded-2xl font-black uppercase tracking-widest h-14 text-[10px] border-2">
                                            <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                                        </Button>
                                        <Button asChild className="rounded-2xl font-black uppercase tracking-widest h-14 text-[10px] shadow-lg shadow-primary/20">
                                            <Link href="/auth/sign-up" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
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

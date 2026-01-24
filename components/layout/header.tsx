"use client"

import { Button } from "@/components/ui/button"
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { User } from "@supabase/supabase-js"
import {
    Zap,
    Brain,
    Target,
    Calendar,
    BarChart3,
    Menu,
} from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { UserDropdown } from "@/components/layout/user-dropdown"

export function Header() {
    const [user, setUser] = useState<User | null>(null)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        getUser()
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                setUser(session?.user ?? null)
            }
        )
        return () => subscription.unsubscribe()
    }, [supabase.auth])

    return (
        <header className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-[1440px] font-fira-sans">
            <div className="bg-card/40 backdrop-blur-3xl border border-border/40 rounded-[2rem] shadow-2xl overflow-hidden px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <div className="flex items-center gap-10">
                        {/* Logo */}
                        <Link href="/" className="flex items-center space-x-3 group">
                            <div className="relative">
                                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center group-hover:rotate-[10deg] transition-all duration-500 shadow-xl shadow-primary/20">
                                    <Zap className="h-6 w-6 text-primary-foreground fill-current" />
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
                        <NavigationMenu className="hidden xl:flex">
                            <NavigationMenuList className="gap-2">
                                <NavigationMenuItem>
                                    <NavigationMenuTrigger className="bg-transparent text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all">
                                        Features
                                    </NavigationMenuTrigger>
                                    <NavigationMenuContent>
                                        <div className="grid gap-4 p-8 w-[600px] bg-card/95 backdrop-blur-2xl border border-border/40 rounded-3xl shadow-2xl">
                                            <div className="grid grid-cols-2 gap-4">
                                                {[
                                                    { href: "/features/ai-content", icon: Brain, title: "AI CONTENT", desc: "Generate high-quality social media content.", color: "text-blue-500" },
                                                    { href: "/features/brand-management", icon: Target, title: "BRANDING", desc: "Maintain brand consistency across all posts.", color: "text-rose-500" },
                                                    { href: "/features/scheduling", icon: Calendar, title: "SCHEDULING", desc: "Plan and automate your social media posting.", color: "text-amber-500" },
                                                    { href: "/features/analytics", icon: BarChart3, title: "ANALYTICS", desc: "Track performance and campaign growth.", color: "text-emerald-500" },
                                                ].map((item) => (
                                                    <NavigationMenuLink key={item.title} asChild>
                                                        <Link href={item.href} className="group p-5 rounded-2xl hover:bg-primary/5 border border-transparent hover:border-primary/20 transition-all">
                                                            <div className="flex items-center gap-4 mb-2">
                                                                <div className={`h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center ${item.color}`}>
                                                                    <item.icon className="h-5 w-5 stroke-[2.5]" />
                                                                </div>
                                                                <div className="text-xs font-black uppercase tracking-widest group-hover:text-primary transition-colors">{item.title}</div>
                                                            </div>
                                                            <p className="text-[10px] font-medium text-muted-foreground leading-relaxed pl-14">
                                                                {item.desc}
                                                            </p>
                                                        </Link>
                                                    </NavigationMenuLink>
                                                ))}
                                            </div>
                                        </div>
                                    </NavigationMenuContent>
                                </NavigationMenuItem>

                                <NavigationMenuItem>
                                    <NavigationMenuTrigger className="bg-transparent text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all">
                                        Resources
                                    </NavigationMenuTrigger>
                                    <NavigationMenuContent>
                                        <div className="grid gap-2 p-6 w-[400px] bg-card/95 backdrop-blur-2xl border border-border/40 rounded-3xl shadow-2xl">
                                            {[
                                                { href: "/docs", title: "DOCUMENTATION", desc: "Guides and technical manuals." },
                                                { href: "/api", title: "API REFERENCE", desc: "Integration and developer tools." },
                                                { href: "/blog", title: "BLOG", desc: "Latest updates and marketing tips." },
                                            ].map((item) => (
                                                <NavigationMenuLink key={item.title} asChild>
                                                    <Link href={item.href} className="group p-4 rounded-xl hover:bg-primary/5 border border-transparent hover:border-primary/20 transition-all">
                                                        <div className="text-xs font-black uppercase tracking-widest group-hover:text-primary mb-1">{item.title}</div>
                                                        <p className="text-[10px] font-medium text-muted-foreground leading-none">{item.desc}</p>
                                                    </Link>
                                                </NavigationMenuLink>
                                            ))}
                                        </div>
                                    </NavigationMenuContent>
                                </NavigationMenuItem>

                                <NavigationMenuItem>
                                    <Link href="/pricing" legacyBehavior passHref>
                                        <NavigationMenuLink className="px-5 py-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all">
                                            Pricing
                                        </NavigationMenuLink>
                                    </Link>
                                </NavigationMenuItem>
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>

                    {/* Authentication */}
                    <div className="flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-6">
                                <Button asChild className="hidden sm:flex h-12 px-8 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                                    <Link href="/overview">
                                        DASHBOARD
                                    </Link>
                                </Button>
                                <div className="h-8 w-px bg-border/40" />
                                <UserDropdown user={user} />
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Button asChild variant="ghost" className="hidden sm:flex h-11 px-6 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all">
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
                                <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl hover:bg-muted/50 transition-all">
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

                                    <nav className="flex-1 p-8 space-y-2 overflow-y-auto">
                                        <div className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-6 block italic opacity-50">Features & Resources</div>
                                        {[
                                            { href: "/features/ai-content", title: "AI CONTENT" },
                                            { href: "/features/brand-management", title: "BRAND HUB" },
                                            { href: "/features/scheduling", title: "SCHEDULING" },
                                            { href: "/features/analytics", title: "ANALYTICS" },
                                            { href: "/pricing", title: "PRICING" },
                                            { href: "/docs", title: "DOCUMENTATION" },
                                            { href: "/blog", title: "BLOG" },
                                        ].map((item) => (
                                            <Link key={item.title} href={item.href} onClick={() => setMobileMenuOpen(false)} className="flex items-center h-14 px-6 rounded-2xl bg-card/40 border border-border/20 text-xs font-black uppercase tracking-[0.2em] text-foreground hover:border-primary/50 transition-all">
                                                {item.title}
                                            </Link>
                                        ))}
                                    </nav>

                                    <div className="p-8 border-t border-border/20">
                                        {user ? (
                                            <Button asChild className="w-full h-14 bg-primary text-primary-foreground font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20">
                                                <Link href="/overview" onClick={() => setMobileMenuOpen(false)}>
                                                    GO TO DASHBOARD
                                                </Link>
                                            </Button>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-4">
                                                <Button asChild variant="outline" className="h-14 bg-muted/20 border-border/40 font-black uppercase tracking-widest rounded-2xl">
                                                    <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>LOGIN</Link>
                                                </Button>
                                                <Button asChild className="h-14 bg-primary text-primary-foreground font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20">
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

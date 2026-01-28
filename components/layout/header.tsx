"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/lib/contexts/auth-context"
import { useState } from "react"
import {
    Zap,
    Brain,
    Target,
    Calendar,
    BarChart3,
    Menu,
    Layout,
    Globe,
    Lock
} from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { UserDropdown } from "@/components/layout/user-dropdown"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"

export function Header() {
    const { user } = useAuth()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [activeMenu, setActiveMenu] = useState<string | null>(null)

    const features = [
        { href: "/features/ai-content", icon: Brain, title: "Sáng tạo nội dung AI", desc: "Tạo hình ảnh, video và văn bản quảng cáo tự động bằng AI.", color: "text-blue-500", bg: "bg-blue-500/10" },
        { href: "/features/brand-management", icon: Target, title: "Quản lý thương hiệu", desc: "Đảm bảo tính nhất quán về hình ảnh và phong cách thương hiệu.", color: "text-rose-500", bg: "bg-rose-500/10" },
        { href: "/features/scheduling", icon: Calendar, title: "Lập lịch thông minh", desc: "Tự động đăng bài và quản lý lịch trình trên đa nền tảng.", color: "text-amber-500", bg: "bg-amber-500/10" },
        { href: "/features/analytics", icon: BarChart3, title: "Phân tích hiệu quả", desc: "Theo dõi chỉ số thời gian thực và tối ưu hóa chiến dịch.", color: "text-emerald-500", bg: "bg-emerald-500/10" },
    ]

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-white/20 dark:border-slate-800/50">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-10">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="size-9 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
                            <Zap className="size-5 fill-current" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                            OmniAdly
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-8">

                    </nav>
                </div>

                {/* Authentication & Toggle */}
                <div className="flex items-center gap-4">
                    <ThemeToggle />

                    {user ? (
                        <div className="flex items-center gap-4">
                            <Button asChild variant="default" size="sm" className="hidden lg:flex rounded-full px-5 font-semibold bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100">
                                <Link href="/overview">
                                    <Layout className="size-4 mr-2" />
                                    Bảng điều khiển
                                </Link>
                            </Button>
                            <UserDropdown user={user} />
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Button asChild variant="ghost" size="sm" className="hidden lg:flex text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold px-4">
                                <Link href="/auth/login">Đăng nhập</Link>
                            </Button>
                            <Button asChild size="sm" className="rounded-full px-6 font-semibold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                                <Link href="/auth/sign-up">
                                    Bắt đầu ngay
                                </Link>
                            </Button>
                        </div>
                    )}

                    {/* Mobile Navigation */}
                    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="lg:hidden rounded-lg dark:text-slate-400">
                                <Menu className="size-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] border-l border-slate-100">
                            <SheetTitle className="sr-only">Menu</SheetTitle>

                            <div className="flex flex-col gap-8 mt-8">
                                <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                                    <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground shadow-md shadow-primary/10">
                                        <Zap className="size-4 fill-current" />
                                    </div>
                                    <span className="text-xl font-bold tracking-tight">
                                        OmniAdly
                                    </span>
                                </Link>

                                <nav className="flex flex-col gap-6">
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Tính năng</h4>
                                        <div className="grid gap-2">
                                            {features.map((item) => (
                                                <Link
                                                    key={item.href}
                                                    href={item.href}
                                                    onClick={() => setMobileMenuOpen(false)}
                                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                                                >
                                                    <div className={cn("size-8 rounded-lg flex items-center justify-center shrink-0", item.bg, item.color)}>
                                                        <item.icon className="size-4" />
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-700">{item.title}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>


                                    {!user && (
                                        <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
                                            <Button asChild variant="outline" className="w-full rounded-xl border-slate-200 font-bold">
                                                <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>Đăng nhập</Link>
                                            </Button>
                                            <Button asChild className="w-full rounded-xl bg-primary hover:bg-primary/90 font-bold shadow-lg shadow-primary/10">
                                                <Link href="/auth/sign-up" onClick={() => setMobileMenuOpen(false)}>Bắt đầu ngay</Link>
                                            </Button>
                                        </div>
                                    )}
                                </nav>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    )
}

"use client"

import { Button } from "@/components/ui/button"
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu"
import { useRouter } from "next/navigation"
import { LogoutButton } from "@/components/auth/logout-button"
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
  Users, 
  Menu,
  X,
  ArrowRight
} from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"

export function Header() {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        // Lấy user hiện tại
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }

        getUser()

        // Lắng nghe thay đổi auth state
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                setUser(session?.user ?? null)
            }
        )

        return () => subscription.unsubscribe()
    }, [supabase.auth])

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="flex items-center space-x-2 group">
                            <div className="relative">
                                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                    <Zap className="h-5 w-5 text-primary-foreground" />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/70 rounded-lg blur opacity-30 group-hover:opacity-50 transition-opacity duration-200"></div>
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                AISAM
                            </span>
                        </Link>
                    </div>

                    {/* Navigation Menu */}
                    <NavigationMenu className="hidden md:flex">
                        <NavigationMenuList>
                            <NavigationMenuItem>
                                <NavigationMenuTrigger className="text-sm font-medium">
                                    Tính năng
                                </NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <div className="grid gap-3 p-6 w-[500px]">
                                        <div className="grid grid-cols-2 gap-3">
                                        <NavigationMenuLink asChild>
                                                <Link href="/features/ai-content" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground group">
                                                    <div className="flex items-center space-x-2">
                                                        <Brain className="h-4 w-4 text-primary" />
                                                <div className="text-sm font-medium leading-none">Tạo nội dung AI</div>
                                                    </div>
                                                <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                                    Sinh ảnh, video và văn bản tự động bằng AI
                                                </p>
                                                </Link>
                                        </NavigationMenuLink>
                                            
                                        <NavigationMenuLink asChild>
                                                <Link href="/features/brand-management" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground group">
                                                    <div className="flex items-center space-x-2">
                                                        <Target className="h-4 w-4 text-primary" />
                                                <div className="text-sm font-medium leading-none">Quản lý thương hiệu</div>
                                                    </div>
                                                <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                                    Duy trì nhận diện thương hiệu nhất quán
                                                </p>
                                                </Link>
                                        </NavigationMenuLink>
                                            
                                        <NavigationMenuLink asChild>
                                                <Link href="/features/scheduling" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground group">
                                                    <div className="flex items-center space-x-2">
                                                        <Calendar className="h-4 w-4 text-primary" />
                                                <div className="text-sm font-medium leading-none">Lập lịch đăng</div>
                                                    </div>
                                                <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                                    Đăng tự động đa nền tảng
                                                </p>
                                                </Link>
                                            </NavigationMenuLink>
                                            
                                            <NavigationMenuLink asChild>
                                                <Link href="/features/analytics" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground group">
                                                    <div className="flex items-center space-x-2">
                                                        <BarChart3 className="h-4 w-4 text-primary" />
                                                        <div className="text-sm font-medium leading-none">Phân tích thông minh</div>
                                                    </div>
                                                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                                        Báo cáo chi tiết và dự đoán xu hướng
                                                    </p>
                                                </Link>
                                            </NavigationMenuLink>
                                        </div>
                                        
                                        <div className="border-t pt-3">
                                            <NavigationMenuLink asChild>
                                                <Link href="/features" className="flex items-center justify-between w-full p-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors group">
                                                    <span className="text-sm font-medium">Xem tất cả tính năng</span>
                                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                                </Link>
                                        </NavigationMenuLink>
                                        </div>
                                    </div>
                                </NavigationMenuContent>
                            </NavigationMenuItem>

                            <NavigationMenuItem>
                                <NavigationMenuLink asChild>
                                    <Link href="/pricing" className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                                        Bảng giá
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>

                            <NavigationMenuItem>
                                <NavigationMenuLink asChild>
                                    <Link href="/about" className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                                        Về chúng tôi
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>

                            <NavigationMenuItem>
                                <NavigationMenuLink asChild>
                                    <Link href="/contact" className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                                        Liên hệ
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>

                    {/* Auth Buttons */}
                    <div className="flex items-center space-x-4">
                        {user ? (
                            <div className="flex items-center space-x-3">
                                <Button asChild variant="outline" className="hidden sm:flex">
                                    <Link href="/dashboard">
                                        <Users className="h-4 w-4 mr-2" />
                                    Dashboard
                                    </Link>
                                </Button>
                                <LogoutButton />
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Button asChild variant="ghost" className="hidden sm:flex">
                                    <Link href="/auth/login">Đăng nhập</Link>
                                </Button>
                                <Button asChild className="relative overflow-hidden group">
                                    <Link href="/auth/sign-up">
                                        <span className="relative z-10">Bắt đầu ngay</span>
                                        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu */}
                    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                        <SheetTrigger asChild className="md:hidden">
                            <Button variant="ghost" size="sm" className="relative">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                            <div className="flex flex-col space-y-6 mt-6">
                                {/* Mobile Logo */}
                                <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
                                        <Zap className="h-5 w-5 text-primary-foreground" />
                                    </div>
                                    <span className="text-xl font-bold">AISAM</span>
                                </div>

                                {/* Mobile Navigation */}
                                <nav className="flex flex-col space-y-4">
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tính năng</h3>
                                        <div className="space-y-1">
                                            <Link 
                                                href="/features/ai-content" 
                                                className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent transition-colors"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                <Brain className="h-4 w-4 text-primary" />
                                                <span className="text-sm">Tạo nội dung AI</span>
                                            </Link>
                                            <Link 
                                                href="/features/brand-management" 
                                                className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent transition-colors"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                <Target className="h-4 w-4 text-primary" />
                                                <span className="text-sm">Quản lý thương hiệu</span>
                                            </Link>
                                            <Link 
                                                href="/features/scheduling" 
                                                className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent transition-colors"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                <Calendar className="h-4 w-4 text-primary" />
                                                <span className="text-sm">Lập lịch đăng</span>
                                            </Link>
                                            <Link 
                                                href="/features/analytics" 
                                                className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent transition-colors"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                <BarChart3 className="h-4 w-4 text-primary" />
                                                <span className="text-sm">Phân tích thông minh</span>
                                            </Link>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <Link 
                                            href="/pricing" 
                                            className="block p-2 text-sm hover:bg-accent rounded-md transition-colors"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Bảng giá
                                        </Link>
                                        <Link 
                                            href="/about" 
                                            className="block p-2 text-sm hover:bg-accent rounded-md transition-colors"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Về chúng tôi
                                        </Link>
                                        <Link 
                                            href="/contact" 
                                            className="block p-2 text-sm hover:bg-accent rounded-md transition-colors"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Liên hệ
                                        </Link>
                                    </div>
                                </nav>

                                {/* Mobile Auth */}
                                <div className="pt-6 border-t">
                                    {user ? (
                                        <div className="space-y-3">
                                            <Button asChild variant="outline" className="w-full">
                                                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                                                    <Users className="h-4 w-4 mr-2" />
                                                    Dashboard
                                                </Link>
                                            </Button>
                                            <LogoutButton />
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <Button asChild variant="ghost" className="w-full">
                                                <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                                                    Đăng nhập
                                                </Link>
                                            </Button>
                                            <Button asChild className="w-full">
                                                <Link href="/auth/sign-up" onClick={() => setMobileMenuOpen(false)}>
                                                    Bắt đầu ngay
                                                </Link>
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    )
}
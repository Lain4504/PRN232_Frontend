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
    ChevronDown,
} from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { UserDropdown } from "@/components/layout/user-dropdown"

export function Header() {
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
            <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                            <Link href="/" className="flex items-center space-x-2 group">
                                <div className="relative">
                                    <div className="w-8 h-8 bg-primary rounded flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                        <Zap className="h-5 w-5 text-primary-foreground" />
                                    </div>
                                </div>
                                <span className="text-xl font-bold text-foreground">
                                    AISAM
                                </span>
                            </Link>
                        </div>

                        {/* Navigation Menu */}
                        <NavigationMenu className="hidden md:flex ml-8">
                            <NavigationMenuList>
                                <NavigationMenuItem>
                                    <NavigationMenuTrigger className="text-sm font-medium text-muted-foreground hover:text-foreground">
                                        Product
                                    </NavigationMenuTrigger>
                                    <NavigationMenuContent>
                                        <div className="grid gap-3 p-6 w-[500px]">
                                            <div className="grid grid-cols-2 gap-3">
                                                <NavigationMenuLink asChild>
                                                    <Link href="/features/ai-content" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground group">
                                                        <div className="flex items-center space-x-2">
                                                            <Brain className="h-4 w-4 text-primary" />
                                                            <div className="text-sm font-medium leading-none">AI Content</div>
                                                        </div>
                                                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                                            Generate content with AI
                                                        </p>
                                                    </Link>
                                                </NavigationMenuLink>

                                                <NavigationMenuLink asChild>
                                                    <Link href="/features/brand-management" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground group">
                                                        <div className="flex items-center space-x-2">
                                                            <Target className="h-4 w-4 text-primary" />
                                                            <div className="text-sm font-medium leading-none">Brand Management</div>
                                                        </div>
                                                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                                            Manage brand consistency
                                                        </p>
                                                    </Link>
                                                </NavigationMenuLink>

                                                <NavigationMenuLink asChild>
                                                    <Link href="/features/scheduling" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground group">
                                                        <div className="flex items-center space-x-2">
                                                            <Calendar className="h-4 w-4 text-primary" />
                                                            <div className="text-sm font-medium leading-none">Scheduling</div>
                                                        </div>
                                                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                                            Auto-posting across platforms
                                                        </p>
                                                    </Link>
                                                </NavigationMenuLink>

                                                <NavigationMenuLink asChild>
                                                    <Link href="/features/analytics" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground group">
                                                        <div className="flex items-center space-x-2">
                                                            <BarChart3 className="h-4 w-4 text-primary" />
                                                            <div className="text-sm font-medium leading-none">Analytics</div>
                                                        </div>
                                                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                                            Detailed reports and insights
                                                        </p>
                                                    </Link>
                                                </NavigationMenuLink>
                                            </div>
                                        </div>
                                    </NavigationMenuContent>
                                </NavigationMenuItem>

                                <NavigationMenuItem>
                                    <NavigationMenuTrigger className="text-sm font-medium text-muted-foreground hover:text-foreground">
                                        Developers
                                    </NavigationMenuTrigger>
                                    <NavigationMenuContent>
                                        <div className="grid gap-3 p-6 w-[400px]">
                                            <NavigationMenuLink asChild>
                                                <Link href="/docs" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                                                    <div className="text-sm font-medium leading-none">Documentation</div>
                                                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                                        API docs and guides
                                                    </p>
                                                </Link>
                                            </NavigationMenuLink>
                                            <NavigationMenuLink asChild>
                                                <Link href="/api" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                                                    <div className="text-sm font-medium leading-none">API Reference</div>
                                                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                                        Complete API documentation
                                                    </p>
                                                </Link>
                                            </NavigationMenuLink>
                                        </div>
                                    </NavigationMenuContent>
                                </NavigationMenuItem>

                                <NavigationMenuItem>
                                    <NavigationMenuTrigger className="text-sm font-medium text-muted-foreground hover:text-foreground">
                                        Solutions
                                    </NavigationMenuTrigger>
                                    <NavigationMenuContent>
                                        <div className="grid gap-3 p-6 w-[400px]">
                                            <NavigationMenuLink asChild>
                                                <Link href="/solutions/enterprise" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                                                    <div className="text-sm font-medium leading-none">Enterprise</div>
                                                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                                        For large organizations
                                                    </p>
                                                </Link>
                                            </NavigationMenuLink>
                                            <NavigationMenuLink asChild>
                                                <Link href="/solutions/startup" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                                                    <div className="text-sm font-medium leading-none">Startups</div>
                                                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                                        Perfect for growing businesses
                                                    </p>
                                                </Link>
                                            </NavigationMenuLink>
                                        </div>
                                    </NavigationMenuContent>
                                </NavigationMenuItem>

                                <NavigationMenuItem>
                                    <NavigationMenuLink asChild>
                                        <Link href="/pricing" className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                                            Pricing
                                        </Link>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>

                                <NavigationMenuItem>
                                    <NavigationMenuLink asChild>
                                        <Link href="/docs" className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                                            Docs
                                        </Link>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>

                                <NavigationMenuItem>
                                    <NavigationMenuLink asChild>
                                        <Link href="/blog" className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                                            Blog
                                        </Link>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>

                     {/* Right Side Elements */}
                     <div className="flex items-center space-x-4">
                         {user ? (
                            <div className="flex items-center space-x-3">
                                <Button asChild className="hidden sm:flex bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md text-sm font-medium">
                                    <Link href="/dashboard">
                                        Dashboard
                                    </Link>
                                </Button>

                                <UserDropdown user={user} />
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Button asChild variant="ghost" className="hidden sm:flex text-muted-foreground hover:text-foreground">
                                    <Link href="/auth/login">Sign In</Link>
                                </Button>
                                <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md text-sm font-medium">
                                    <Link href="/auth/sign-up">
                                        Get Started
                                    </Link>
                                </Button>
                            </div>
                        )}

                        {/* Mobile menu */}
                        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                            <SheetTrigger asChild className="md:hidden">
                                <Button variant="ghost" size="sm" className="relative">
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">Toggle menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[300px] sm:w-[400px] p-0">
                                <div className="flex flex-col h-full">
                                    {/* Mobile Header */}
                                    <div className="flex items-center p-6 border-b">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                                                <Zap className="h-5 w-5 text-primary-foreground" />
                                            </div>
                                            <span className="text-xl font-bold text-foreground">AISAM</span>
                                        </div>
                                    </div>

                                    {/* Mobile Navigation */}
                                    <nav className="flex-1 px-6 py-4">
                                        <div className="space-y-0">
                                            {/* Product */}
                                            <div className="flex items-center justify-between py-3 border-b border-border">
                                                <span className="text-sm font-medium text-foreground">Product</span>
                                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                            </div>

                                            {/* Developers */}
                                            <div className="flex items-center justify-between py-3 border-b border-border">
                                                <span className="text-sm font-medium text-foreground">Developers</span>
                                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                            </div>

                                            {/* Solutions */}
                                            <div className="flex items-center justify-between py-3 border-b border-border">
                                                <span className="text-sm font-medium text-foreground">Solutions</span>
                                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                            </div>

                                            {/* Pricing */}
                                            <div className="py-3 border-b border-border">
                                                <span className="text-sm font-medium text-foreground">Pricing</span>
                                            </div>

                                            {/* Docs */}
                                            <div className="py-3 border-b border-border">
                                                <span className="text-sm font-medium text-foreground">Docs</span>
                                            </div>

                                            {/* Blog */}
                                            <div className="py-3 border-b border-border">
                                                <span className="text-sm font-medium text-foreground">Blog</span>
                                            </div>
                                        </div>
                                    </nav>

                                    {/* Mobile Bottom Section */}
                                    <div className="p-6 border-t">
                                        {user ? (
                                            <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-md font-medium">
                                                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                                                    Dashboard
                                                </Link>
                                            </Button>
                                        ) : (
                                            <div className="space-y-3">
                                                <Button asChild variant="ghost" className="w-full">
                                                    <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                                                        Sign In
                                                    </Link>
                                                </Button>
                                                <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-md font-medium">
                                                    <Link href="/auth/sign-up" onClick={() => setMobileMenuOpen(false)}>
                                                        Get Started
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
            </div>
        </header>
    )
}
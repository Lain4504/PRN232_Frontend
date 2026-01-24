import { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Book, Code, Search, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export const metadata: Metadata = {
    title: "AISAM | Documentation",
    description: "Comprehensive guides and specialized tutorials for the AISAM platform.",
};

export default function DocsPage() {
    const sections = [
        { title: "Getting Started", items: ["Quick Start", "Authentication", "Setup Guide"] },
        { title: "Content Creation", items: ["AI Generator", "Asset Quality", "Prompt Tips"] },
        { title: "Brand Settings", items: ["Brand Profiles", "Style Rules", "User Roles"] },
        { title: "Automation", items: ["Post Scheduling", "Social Channels", "Webhooks"] }
    ];

    return (
        <div className="min-h-screen bg-background font-fira-sans">
            <Header />

            <main className="pt-40 pb-20 px-6">
                <div className="max-w-[1440px] mx-auto grid lg:grid-cols-12 gap-16">

                    {/* Sidebar Nav */}
                    <aside className="hidden lg:block lg:col-span-3 space-y-12">
                        {sections.map((section) => (
                            <div key={section.title} className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic px-2">{section.title}</h4>
                                <nav className="flex flex-col">
                                    {section.items.map((item) => (
                                        <Link key={item} href="#" className="h-10 flex items-center px-4 rounded-xl text-sm font-bold text-muted-foreground hover:bg-muted/30 hover:text-foreground transition-all">
                                            {item}
                                        </Link>
                                    ))}
                                </nav>
                            </div>
                        ))}
                    </aside>

                    {/* Content Main */}
                    <div className="lg:col-span-9 space-y-20">
                        <section className="space-y-10">
                            <div className="flex items-center justify-between">
                                <div className="space-y-4">
                                    <Badge variant="outline" className="px-4 py-1 rounded-full border-primary/20 bg-primary/5 text-primary font-black uppercase tracking-[0.3em] text-[10px]">
                                        User Guides
                                    </Badge>
                                    <h1 className="text-5xl md:text-7xl font-black tracking-tight uppercase leading-none">
                                        Documentation <span className="text-primary italic">Hub</span>.
                                    </h1>
                                </div>
                                <div className="hidden sm:block relative w-64 group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                                    <Input placeholder="SEARCH HELP..." className="pl-10 h-12 rounded-xl bg-muted/20 border-border/40 font-fira-mono text-[10px] tracking-widest focus:bg-background" />
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-6">
                                <Link href="#" className="p-10 rounded-[2.5rem] bg-card/40 border border-border/40 backdrop-blur-3xl hover:bg-card/60 transition-all group border-l-4 border-l-primary">
                                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                                        <Book className="w-6 h-6 stroke-[2.5]" />
                                    </div>
                                    <h3 className="text-2xl font-black uppercase tracking-tight mb-2">QUICK START</h3>
                                    <p className="text-muted-foreground font-medium text-sm">Set up your brand and create your first post in minutes.</p>
                                </Link>
                                <Link href="/api" className="p-10 rounded-[2.5rem] bg-card/40 border border-border/40 backdrop-blur-3xl hover:bg-card/60 transition-all group border-l-4 border-l-blue-500">
                                    <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform">
                                        <Code className="w-6 h-6 stroke-[2.5]" />
                                    </div>
                                    <h3 className="text-2xl font-black uppercase tracking-tight mb-2">API REFERENCE</h3>
                                    <p className="text-muted-foreground font-medium text-sm">Full developer guide for custom platform integrations.</p>
                                </Link>
                            </div>
                        </section>

                        <section className="prose prose-invert max-w-none space-y-12">
                            <div className="p-12 rounded-[3.5rem] bg-muted/20 border border-border/10 space-y-6">
                                <h2 className="text-3xl font-black uppercase tracking-tight text-foreground m-0">Platform Overview</h2>
                                <p className="text-muted-foreground font-medium text-lg leading-relaxed">
                                    AISAM provides a unified workspace for high-speed content generation and automated social media distribution.
                                    Manage all your brands in one place with AI-driven consistency and performance analytics.
                                </p>
                                <div className="h-[2px] w-20 bg-primary/40 rounded-full" />
                                <p className="text-sm text-muted-foreground/60 italic font-medium">
                                    Note: Advanced automation features require a Strategic or Enterprise subscription tier.
                                </p>
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            <footer className="py-20 px-6 border-t border-border/40 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40">
                    © 2026 AISAM Platform. All documentation is kept current.
                </p>
            </footer>
        </div>
    );
}

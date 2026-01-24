import { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Zap, Globe, Share2, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
    title: "AISAM | Post Scheduling",
    description: "Automated distribution and post management for social media channels.",
};

export default function SchedulingPage() {
    return (
        <div className="min-h-screen bg-background font-fira-sans">
            <Header />

            <main className="pt-40 pb-20 px-6">
                <div className="max-w-[1440px] mx-auto space-y-32">

                    <section className="text-center space-y-8 max-w-4xl mx-auto">
                        <Badge variant="outline" className="px-6 py-2 rounded-full border-amber-500/20 bg-amber-500/5 text-amber-500 font-black uppercase tracking-[0.3em] text-[10px]">
                            Automation Feature
                        </Badge>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight uppercase leading-[0.85] text-foreground">
                            Post <br />
                            <span className="text-amber-500 italic">Scheduling</span>.
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed tracking-tight">
                            Precise automated posting. Schedule your creative content for the exact moments your audience is online.
                        </p>
                    </section>

                    {/* Scheduling Features */}
                    <section className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {[
                            { icon: Calendar, title: "Social Calendar", desc: "A unified view of every upcoming post across all your social channels.", color: "text-amber-500" },
                            { icon: Clock, title: "Peak Time Posting", desc: "Automatically post during high-engagement windows optimized for each platform.", color: "text-rose-500" },
                            { icon: Globe, title: "Global Planning", desc: "Coordinate multi-region launches with instant time-zone normalization.", color: "text-blue-500" },
                            { icon: Share2, title: "Multi-Platform Push", desc: "One-click publishing to TikTok, Instagram, Meta, and X infrastructure.", color: "text-emerald-500" },
                            { icon: Repeat, title: "Automated Loops", desc: "Easily set up recurring posts and evergreen content sequences.", color: "text-indigo-500" },
                            { icon: Zap, title: "Pause All Posts", desc: "Instantly halt all upcoming posts across your entire account in one click.", color: "text-orange-500" },
                        ].map((mod) => (
                            <div key={mod.title} className="p-8 rounded-[2rem] bg-card/40 border border-border/40 backdrop-blur-3xl hover:bg-card/60 transition-all group">
                                <div className={`h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center mb-6 ${mod.color} group-hover:scale-110 transition-transform`}>
                                    <mod.icon className="h-6 w-6 stroke-[2.5]" />
                                </div>
                                <h3 className="text-xl font-black uppercase tracking-tight mb-3">{mod.title}</h3>
                                <p className="text-sm text-muted-foreground font-medium leading-relaxed">{mod.desc}</p>
                            </div>
                        ))}
                    </section>

                    <section className="relative py-24 px-10 rounded-[3rem] bg-amber-600 overflow-hidden group text-center space-y-10 shadow-2xl shadow-amber-500/20">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-600 via-orange-700 to-amber-900 opacity-90" />
                        <div className="space-y-6 relative z-10">
                            <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">Control the <br /><span className="text-white/40 italic">Timeline</span></h2>
                        </div>
                        <div className="flex justify-center gap-6 relative z-10">
                            <Button asChild size="lg" className="h-14 px-12 bg-white text-amber-600 font-black uppercase tracking-[0.2em] rounded-xl shadow-2xl hover:scale-110 transition-all text-xs">
                                <Link href="/auth/sign-up">START SCHEDULING</Link>
                            </Button>
                        </div>
                    </section>
                </div>
            </main>

            <footer className="py-20 px-6 border-t border-border/40 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40">
                    © 2026 AISAM Platform. Automation Engine Active.
                </p>
            </footer>
        </div>
    );
}

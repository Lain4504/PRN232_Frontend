import { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Target, Shield, Palette, Layers, Lock, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
    title: "AISAM | Brand Management",
    description: "Centralized brand identity hub and unified asset management.",
};

export default function BrandManagementPage() {
    return (
        <div className="min-h-screen bg-background font-fira-sans">
            <Header />

            <main className="pt-40 pb-20 px-6">
                <div className="max-w-[1440px] mx-auto space-y-32">

                    <section className="text-center space-y-8 max-w-4xl mx-auto">
                        <Badge variant="outline" className="px-6 py-2 rounded-full border-rose-500/20 bg-rose-500/5 text-rose-500 font-black uppercase tracking-[0.3em] text-[10px]">
                            Branding Feature
                        </Badge>
                        <h1 className="text-6xl md:text-9xl font-black tracking-tight uppercase leading-[0.85] text-foreground">
                            Brand <br />
                            <span className="text-rose-500 italic">Hub</span>.
                        </h1>
                        <p className="text-xl md:text-3xl text-muted-foreground font-medium leading-relaxed tracking-tight">
                            Absolute brand consistency across every social channel. One source of truth for your global identity.
                        </p>
                    </section>

                    {/* Branding Modules */}
                    <section className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {[
                            { icon: Palette, title: "Color Presets", desc: "Always use your official brand colors in every AI-generated image and video.", color: "text-rose-500" },
                            { icon: Layout, title: "Layout Standards", desc: "Ensure logos, text, and primary visuals are perfectly placed every time.", color: "text-blue-500" },
                            { icon: Layers, title: "Asset Management", desc: "Organize thousands of brand assets and stock photos into a simple library.", color: "text-amber-500" },
                            { icon: Shield, title: "Style Templates", desc: "Lock in specific visual styles so your content always feels like your brand.", color: "text-emerald-500" },
                            { icon: Lock, title: "User Permissions", desc: "Advanced controls to ensure only authorized team members can edit brand settings.", color: "text-indigo-500" },
                            { icon: Target, title: "AI Voice Tuning", desc: "Train the AI to write in your unique brand voice, from professional to playful.", color: "text-orange-500" },
                        ].map((mod) => (
                            <div key={mod.title} className="p-12 rounded-[3.5rem] bg-card/40 border border-border/40 backdrop-blur-3xl hover:bg-card/60 transition-all group">
                                <div className={`h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-8 ${mod.color} group-hover:scale-110 transition-transform`}>
                                    <mod.icon className="h-8 w-8 stroke-[2.5]" />
                                </div>
                                <h3 className="text-2xl font-black uppercase tracking-tight mb-4">{mod.title}</h3>
                                <p className="text-muted-foreground font-medium leading-relaxed">{mod.desc}</p>
                            </div>
                        ))}
                    </section>

                    <section className="relative py-32 px-10 rounded-[5rem] bg-rose-600 overflow-hidden group text-center space-y-12 shadow-2xl shadow-rose-500/20">
                        <div className="absolute inset-0 bg-gradient-to-br from-rose-600 via-pink-700 to-rose-900 opacity-90" />
                        <div className="space-y-6 relative z-10">
                            <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none">Sync Your <br /><span className="text-white/40 italic">Identity</span></h2>
                        </div>
                        <div className="flex justify-center gap-6 relative z-10">
                            <Button asChild size="lg" className="h-20 px-16 bg-white text-rose-600 font-black uppercase tracking-[0.2em] rounded-[2.5rem] shadow-2xl hover:scale-110 transition-all text-sm">
                                <Link href="/auth/sign-up">SET UP BRAND</Link>
                            </Button>
                        </div>
                    </section>
                </div>
            </main>

            <footer className="py-20 px-6 border-t border-border/40 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40">
                    © 2026 AISAM Platform. Brand Management Online.
                </p>
            </footer>
        </div>
    );
}

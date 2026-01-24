import { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Brain, Sparkles, Zap, Image as ImageIcon, Video, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
    title: "AISAM | AI Content Creator",
    description: "Autonomous content generation engine for social media assets.",
};

export default function AiContentPage() {
    return (
        <div className="min-h-screen bg-background font-fira-sans">
            <Header />

            <main className="pt-40 pb-20 px-6">
                <div className="max-w-[1440px] mx-auto space-y-32">

                    <section className="text-center space-y-8 max-w-4xl mx-auto">
                        <Badge variant="outline" className="px-6 py-2 rounded-full border-blue-500/20 bg-blue-500/5 text-blue-500 font-black uppercase tracking-[0.3em] text-[10px]">
                            Content Feature
                        </Badge>
                        <h1 className="text-6xl md:text-9xl font-black tracking-tight uppercase leading-[0.85] text-foreground">
                            AI Content <br />
                            <span className="text-blue-500 italic">Creator</span>.
                        </h1>
                        <p className="text-xl md:text-3xl text-muted-foreground font-medium leading-relaxed tracking-tight">
                            A professional AI engine optimized for high-conversion social content across all platform formats.
                        </p>
                    </section>

                    {/* Capabilities Matrix */}
                    <section className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {[
                            { icon: ImageIcon, title: "AI Image Generation", desc: "High-resolution social assets with your specific brand colors and styles.", color: "text-blue-500" },
                            { icon: Video, title: "Social Video Creation", desc: "Short video sequences optimized for TikTok, Reels, and YouTube Shorts.", color: "text-rose-500" },
                            { icon: MessageSquare, title: "Persuasive Copy", desc: "Engaging social copy and ad text trained on top-performing campaign data.", color: "text-amber-500" },
                            { icon: Sparkles, title: "Style Consistency", desc: "AI-enforced adherence to your organization's specific visual guidelines.", color: "text-emerald-500" },
                            { icon: Brain, title: "Smart Adapting", desc: "The creator adapts to your successful posts to improve future results.", color: "text-indigo-500" },
                            { icon: Zap, title: "Bulk Generation", desc: "Generate dozens of variations for a single concept in under a minute.", color: "text-orange-500" },
                        ].map((cap) => (
                            <div key={cap.title} className="p-12 rounded-[3rem] bg-card/40 border border-border/40 backdrop-blur-3xl hover:bg-card/60 transition-all group">
                                <div className={`h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-8 ${cap.color} group-hover:scale-110 transition-transform`}>
                                    <cap.icon className="h-8 w-8 stroke-[2.5]" />
                                </div>
                                <h3 className="text-2xl font-black uppercase tracking-tight mb-4">{cap.title}</h3>
                                <p className="text-muted-foreground font-medium leading-relaxed">{cap.desc}</p>
                            </div>
                        ))}
                    </section>

                    <section className="relative py-32 px-10 rounded-[5rem] bg-blue-600 overflow-hidden group text-center space-y-12 shadow-2xl shadow-blue-500/20">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-indigo-900 opacity-90" />
                        <div className="space-y-6 relative z-10">
                            <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none">Start <br /><span className="text-white/40 italic">Creating</span></h2>
                        </div>
                        <div className="flex justify-center gap-6 relative z-10">
                            <Button asChild size="lg" className="h-20 px-16 bg-white text-blue-600 font-black uppercase tracking-[0.2em] rounded-[2.5rem] shadow-2xl hover:scale-110 transition-all text-sm">
                                <Link href="/auth/sign-up">GET STARTED</Link>
                            </Button>
                        </div>
                    </section>
                </div>
            </main>

            <footer className="py-20 px-6 border-t border-border/40 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40">
                    © 2026 AISAM Platform. Content Engine Active.
                </p>
            </footer>
        </div>
    );
}

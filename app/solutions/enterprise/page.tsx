import { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Shield, Globe, Users, BarChart3, Rocket, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
    title: "AISAM | Enterprise Solutions",
    description: "Enterprise-grade AI marketing infrastructure for global corporations.",
};

export default function EnterprisePage() {
    return (
        <div className="min-h-screen bg-background font-fira-sans">
            <Header />

            <main className="pt-40 pb-20 px-6">
                <div className="max-w-[1440px] mx-auto space-y-32">

                    <section className="text-center space-y-8 max-w-4xl mx-auto">
                        <Badge variant="outline" className="px-6 py-2 rounded-full border-primary/20 bg-primary/5 text-primary font-black uppercase tracking-[0.3em] text-[10px]">
                            Corporate Tier
                        </Badge>
                        <h1 className="text-6xl md:text-9xl font-black tracking-tight uppercase leading-[0.85] text-foreground">
                            Total Brand <br />
                            <span className="text-primary italic">Control</span>.
                        </h1>
                        <p className="text-xl md:text-3xl text-muted-foreground font-medium leading-relaxed tracking-tight">
                            AISAM Enterprise provides the integrated AI stack for global organizations requiring scale, security, and team collaboration.
                        </p>
                    </section>

                    {/* Core Features */}
                    <section className="grid gap-px bg-border/20 rounded-[4rem] overflow-hidden border border-border/40 shadow-2xl">
                        {[
                            { icon: Shield, title: "Brand Governance", desc: "Centralize brand guidelines across all social channels with automated consistency enforcement." },
                            { icon: Globe, title: "Global Distribution", desc: "Deploy social content across multiple regions and platforms with instant synchronization." },
                            { icon: Users, title: "Team Collaboration", desc: "Advanced user roles and approval workflows for complex marketing teams." },
                            { icon: BarChart3, title: "Strategic Analytics", desc: "Enterprise-level performance tracking and cross-platform campaign attribution." },
                        ].map((feature) => (
                            <div key={feature.title} className="p-16 bg-card/40 backdrop-blur-3xl hover:bg-card/60 transition-all group border-b border-border/20 last:border-b-0">
                                <div className="flex flex-col lg:flex-row lg:items-center gap-10">
                                    <div className="h-20 w-20 rounded-[2rem] bg-muted/50 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                        <feature.icon className="h-10 w-10 stroke-[2.5]" />
                                    </div>
                                    <div className="space-y-4 flex-1">
                                        <h3 className="text-4xl font-black uppercase tracking-tight text-foreground">{feature.title}</h3>
                                        <p className="text-xl text-muted-foreground font-medium leading-relaxed max-w-3xl">{feature.desc}</p>
                                    </div>
                                    <div className="hidden lg:block group-hover:translate-x-4 transition-transform text-primary opacity-0 group-hover:opacity-100">
                                        <Rocket className="h-12 w-12 stroke-[2.5]" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </section>

                    {/* Infrastructure Hooks */}
                    <section className="relative py-32 px-10 rounded-[5rem] bg-muted/20 border border-border/40 overflow-hidden group text-center space-y-12">
                        <div className="absolute top-0 right-0 p-20 opacity-5 group-hover:rotate-12 transition-transform duration-1000">
                            <Zap className="h-[20rem] w-[20rem]" />
                        </div>
                        <div className="space-y-6 relative z-10">
                            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">Dedicated AI <br /><span className="text-primary italic">Models</span></h2>
                            <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
                                Train custom generative models on your private brand data within an isolated, ultra-secure infrastructure.
                            </p>
                        </div>
                        <div className="flex justify-center gap-6 relative z-10">
                            <Button asChild size="lg" className="h-20 px-16 bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] rounded-[2.5rem] shadow-2xl shadow-primary/30 hover:scale-110 transition-all">
                                <Link href="/contact">TALK TO SALES</Link>
                            </Button>
                        </div>
                    </section>
                </div>
            </main>

            <footer className="py-20 px-6 border-t border-border/40 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40">
                    © 2026 AISAM Platform. Enterprise Division.
                </p>
            </footer>
        </div>
    );
}

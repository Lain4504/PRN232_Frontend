import { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Rocket, Zap, Target, TrendingUp, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
    title: "AISAM | For Startups",
    description: "Accelerate your creative cycles with the AISAM Startup Program.",
};

export default function StartupPage() {
    return (
        <div className="min-h-screen bg-background font-fira-sans">
            <Header />

            <main className="pt-40 pb-20 px-6">
                <div className="max-w-[1440px] mx-auto space-y-32">

                    <section className="text-center space-y-8 max-w-4xl mx-auto">
                        <Badge variant="outline" className="px-6 py-2 rounded-full border-amber-500/20 bg-amber-500/5 text-amber-500 font-black uppercase tracking-[0.3em] text-[10px]">
                            Early Stage Program
                        </Badge>
                        <h1 className="text-6xl md:text-9xl font-black tracking-tight uppercase leading-[0.85] text-foreground">
                            Move <br />
                            <span className="text-amber-500 italic">Faster</span>.
                        </h1>
                        <p className="text-xl md:text-3xl text-muted-foreground font-medium leading-relaxed tracking-tight">
                            Stop struggling with content blocks. AISAM gives early-stage teams the creative power of a 50-person agency.
                        </p>
                    </section>

                    {/* Startup Benefits Grid */}
                    <section className="grid gap-8 md:grid-cols-3">
                        {[
                            { icon: Zap, title: "Launch in Minutes", desc: "Create and publish your first social campaigns in minutes, not days.", color: "text-amber-500" },
                            { icon: Target, title: "Perfect Focus", desc: "Let AI handle the creative work while your team focuses on product-market fit.", color: "text-rose-500" },
                            { icon: TrendingUp, title: "Scalability", desc: "Our platform grows with your company. Scale from 1 to 100 channels instantly.", color: "text-emerald-500" },
                        ].map((benefit) => (
                            <div key={benefit.title} className="p-12 rounded-[3.5rem] bg-card/40 border border-border/40 backdrop-blur-3xl hover:bg-card/60 transition-all group">
                                <div className={`h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-8 ${benefit.color} group-hover:scale-110 transition-transform`}>
                                    <benefit.icon className="h-8 w-8 stroke-[2.5]" />
                                </div>
                                <h3 className="text-2xl font-black uppercase tracking-tight mb-4">{benefit.title}</h3>
                                <p className="text-muted-foreground font-medium leading-relaxed">{benefit.desc}</p>
                            </div>
                        ))}
                    </section>

                    {/* Pricing Hook */}
                    <section className="grid lg:grid-cols-2 bg-primary rounded-[4rem] overflow-hidden shadow-2xl relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary via-blue-700 to-indigo-900 opacity-90" />
                        <div className="p-16 lg:p-24 space-y-12 relative z-10">
                            <div className="space-y-6">
                                <h2 className="text-5xl lg:text-7xl font-black text-white uppercase tracking-tighter leading-none">The Startup <br /><span className="text-white/40 italic">Advantage</span></h2>
                                <div className="space-y-4">
                                    {[
                                        "Free 14-day trial access",
                                        "Unlimited AI content generation",
                                        "Priority customer support",
                                        "Personal Success Manager"
                                    ].map((feature) => (
                                        <div key={feature} className="flex items-center gap-3">
                                            <CheckCircle className="h-5 w-5 text-white/60 stroke-[3]" />
                                            <span className="text-lg font-black text-white/90 uppercase tracking-tight">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <Button asChild className="h-20 px-16 bg-white text-primary font-black uppercase tracking-widest rounded-2xl hover:scale-110 transition-all text-sm">
                                <Link href="/auth/sign-up">GET STARTED NOW</Link>
                            </Button>
                        </div>
                        <div className="hidden lg:block relative overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=1200" alt="Startup Office" className="absolute inset-0 w-full h-full object-cover grayscale opacity-50 group-hover:scale-110 group-hover:grayscale-0 transition-all duration-1000" />
                        </div>
                    </section>
                </div>
            </main>

            <footer className="py-20 px-6 border-t border-border/40 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40">
                    © 2026 AISAM Platform. Startup Program.
                </p>
            </footer>
        </div>
    );
}

import { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Rocket, Shield } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
    title: "AISAM | Tactical Tiers",
    description: "Pricing protocols forAIS AM Intelligence Core.",
};

export default function PricingPage() {
    const tiers = [
        {
            name: "Tactical",
            price: "$29",
            desc: "For solo operators and small units.",
            features: ["3 Social Nodes", "AI Genesis (100 assets/mo)", "Impact Matrix Lite", "Chronos Axis"],
            icon: Zap,
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        },
        {
            name: "Strategic",
            price: "$99",
            desc: "The standard for high-growth teams.",
            features: ["15 Social Nodes", "Unlimited AI Genesis", "Impact Matrix Pro", "Identity Vault", "24/7 Intelligence Support"],
            icon: Rocket,
            color: "text-primary",
            bg: "bg-primary/10",
            featured: true
        },
        {
            name: "Enterprise",
            price: "Custom",
            desc: "Absolute marketing sovereignty.",
            features: ["Unlimited Nodes", "Custom AI Models", "Governance Protocol", "Sovereign Cloud API", "Dedicated Command Team"],
            icon: Shield,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
        }
    ];

    return (
        <div className="min-h-screen bg-background font-fira-sans">
            <Header />

            <main className="pt-40 pb-20 px-6">
                <div className="max-w-[1440px] mx-auto space-y-24">

                    <section className="text-center space-y-6 max-w-3xl mx-auto">
                        <Badge variant="outline" className="px-6 py-2 rounded-full border-primary/20 bg-primary/5 text-primary font-black uppercase tracking-[0.3em] text-[10px]">
                            Access Protocols
                        </Badge>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight uppercase leading-none">
                            Operational <span className="text-primary italic">Tiers</span>.
                        </h1>
                        <p className="text-lg text-muted-foreground font-medium">
                            Choose your tactical scale. No hidden fees. Instant activation.
                        </p>
                    </section>

                    <section className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {tiers.map((tier) => (
                            <div key={tier.name} className={`relative p-8 rounded-[2rem] bg-card/40 border ${tier.featured ? 'border-primary/50 border-2 shadow-2xl shadow-primary/20 scale-105 z-10' : 'border-border/40'} backdrop-blur-3xl space-y-8 group`}>
                                {tier.featured && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-6 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.3em]">
                                        Most Deployed
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div className={`h-14 w-14 rounded-2xl ${tier.bg} flex items-center justify-center ${tier.color}`}>
                                        <tier.icon className="h-7 w-7 stroke-[2.5]" />
                                    </div>
                                    <h3 className="text-3xl font-black uppercase tracking-tight">{tier.name}</h3>
                                    <p className="text-muted-foreground font-medium text-sm leading-relaxed">{tier.desc}</p>
                                </div>

                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-black tracking-tighter">{tier.price}</span>
                                    {tier.price !== "Custom" && <span className="text-muted-foreground font-bold uppercase tracking-widest text-xs">/mo</span>}
                                </div>

                                <div className="space-y-4 pt-4">
                                    {tier.features.map((feature) => (
                                        <div key={feature} className="flex items-center gap-3">
                                            <Check className={`h-4 w-4 ${tier.color} stroke-[3]`} />
                                            <span className="text-sm font-bold tracking-tight text-foreground/80">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <Button asChild className={`w-full h-12 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${tier.featured ? 'bg-primary text-primary-foreground hover:scale-105 shadow-xl shadow-primary/20' : 'bg-muted/20 text-foreground hover:bg-muted/40'}`}>
                                    <Link href="/auth/sign-up">INITIALIZE {tier.name}</Link>
                                </Button>
                            </div>
                        ))}
                    </section>

                    {/* Pricing FAQ Shards */}
                    <section className="max-w-4xl mx-auto space-y-12">
                        <div className="text-center">
                            <h2 className="text-3xl font-black uppercase tracking-tight">System FAQ</h2>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2">
                            {[
                                { q: "Can I upgrade mid-cycle?", a: "Yes. Tactical upgrades are instant and prorated." },
                                { q: "Is there a free trial?", a: "Every node starts with a 14-day Genesis trial." },
                                { q: "What social nodes are supported?", a: "TikTok, Meta (FB/IG), and X are currently operational." },
                                { q: "Are there long-term contracts?", a: "No. All protocols are month-to-month by default." },
                            ].map((item) => (
                                <div key={item.q} className="p-6 rounded-[1.5rem] bg-muted/20 border border-border/20">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-2 italic px-1">{item.q}</h4>
                                    <p className="text-sm font-medium text-muted-foreground leading-relaxed">{item.a}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </main>

            <footer className="py-20 px-6 border-t border-border/40 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40">
                    © 2026 AISAM Intelligence Core. Pricing Protocols Active.
                </p>
            </footer>
        </div>
    );
}

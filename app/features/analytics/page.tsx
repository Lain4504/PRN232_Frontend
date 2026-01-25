import { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, PieChart, Activity, Cpu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
    title: "AISAM | Campaign Analytics",
    description: "High-fidelity campaign performance tracking and strategic insights.",
};

export default function AnalyticsPage() {
    return (
        <div className="min-h-screen bg-background font-fira-sans">
            <Header />

            <main className="pt-40 pb-20 px-6">
                <div className="max-w-[1440px] mx-auto space-y-32">

                    <section className="text-center space-y-8 max-w-4xl mx-auto">
                        <Badge variant="outline" className="px-6 py-2 rounded-full border-emerald-500/20 bg-emerald-500/5 text-emerald-500 font-black uppercase tracking-[0.3em] text-[10px]">
                            Analytics Feature
                        </Badge>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight uppercase leading-[0.85] text-foreground">
                            Campaign <br />
                            <span className="text-emerald-500 italic">Analytics</span>.
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed tracking-tight">
                            Powerful marketing intelligence. Track the growth and performance of your brand across all social platforms.
                        </p>
                    </section>

                    {/* Intel Modules */}
                    <section className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {[
                            { icon: BarChart3, title: "Smart Attribution", desc: "Identify exactly which creative posts are driving your actual sales and conversions.", color: "text-emerald-500" },
                            { icon: Activity, title: "Real-time Insights", desc: "See live feedback on how your active campaigns are performing right now.", color: "text-rose-500" },
                            { icon: TrendingUp, title: "Growth Trends", desc: "Predict future campaign results based on your historical performance data.", color: "text-blue-500" },
                            { icon: Cpu, title: "Usage Stats", desc: "Monitor your AI generation limits and see exactly where your tokens are being used.", color: "text-amber-500" },
                            { icon: Search, title: "Granular Reports", desc: "Drill down into specific posts or campaigns to see detailed engagement metrics.", color: "text-indigo-500" },
                            { icon: PieChart, title: "Market Share", desc: "Visualize how your brand's presence compares to competitors in your industry.", color: "text-orange-500" },
                        ].map((mod) => (
                            <div key={mod.title} className="p-8 rounded-2xl bg-card/40 border border-border/40 backdrop-blur-3xl hover:bg-card/60 transition-all group">
                                <div className={`h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center mb-6 ${mod.color} group-hover:scale-110 transition-transform`}>
                                    <mod.icon className="h-6 w-6 stroke-[2.5]" />
                                </div>
                                <h3 className="text-xl font-black uppercase tracking-tight mb-3">{mod.title}</h3>
                                <p className="text-sm text-muted-foreground font-medium leading-relaxed">{mod.desc}</p>
                            </div>
                        ))}
                    </section>

                    <section className="relative py-24 px-10 rounded-3xl bg-emerald-600 overflow-hidden group text-center space-y-10 shadow-2xl shadow-emerald-500/20">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 opacity-90" />
                        <div className="space-y-6 relative z-10">
                            <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">Unlock the <br /><span className="text-white/40 italic">Insights</span></h2>
                        </div>
                        <div className="flex justify-center gap-6 relative z-10">
                            <Button asChild size="lg" className="h-14 px-12 bg-white text-emerald-600 font-black uppercase tracking-[0.2em] rounded-xl shadow-2xl hover:scale-110 transition-all text-xs">
                                <Link href="/auth/sign-up">VIEW ANALYTICS</Link>
                            </Button>
                        </div>
                    </section>
                </div>
            </main>

            <footer className="py-20 px-6 border-t border-border/40 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40">
                    © 2026 AISAM Platform. Analytics Engine Active.
                </p>
            </footer>
        </div>
    );
}

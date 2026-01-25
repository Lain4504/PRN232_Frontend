"use client"

import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Brain, Sparkles, Zap, Image as ImageIcon, Video, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function AiContentPage() {
    const { t } = useTranslation("common");

    const capabilities = [
        { icon: ImageIcon, title: t("features.aiContent.features.0.title"), desc: t("features.aiContent.features.0.desc"), color: "text-blue-500" },
        { icon: Video, title: t("features.aiContent.features.1.title"), desc: t("features.aiContent.features.1.desc"), color: "text-rose-500" },
        { icon: MessageSquare, title: t("features.aiContent.features.2.title"), desc: t("features.aiContent.features.2.desc"), color: "text-amber-500" },
        { icon: Sparkles, title: "Style Consistency", desc: "AI-enforced adherence to your organization's specific visual guidelines.", color: "text-emerald-500" },
        { icon: Brain, title: "Smart Adapting", desc: "The creator adapts to your successful posts to improve future results.", color: "text-indigo-500" },
        { icon: Zap, title: "Bulk Generation", desc: "Generate dozens of variations for a single concept in under a minute.", color: "text-orange-500" },
    ];

    return (
        <div className="min-h-screen bg-background font-fira-sans">
            <Header />

            <main className="pt-40 pb-20 px-6">
                <div className="max-w-[1440px] mx-auto space-y-32">

                    <section className="text-center space-y-8 max-w-4xl mx-auto">
                        <Badge variant="outline" className="px-6 py-2 rounded-full border-blue-500/20 bg-blue-500/5 text-blue-500 font-black uppercase tracking-[0.3em] text-[10px]">
                            {t("features.aiContent.badge")}
                        </Badge>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight uppercase leading-[0.85] text-foreground">
                            {t("features.aiContent.title")} <br />
                            <span className="text-blue-500 italic">{t("features.aiContent.accent")}</span>
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed tracking-tight">
                            {t("features.aiContent.description")}
                        </p>
                    </section>

                    {/* Capabilities Matrix */}
                    <section className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {capabilities.map((cap) => (
                            <div key={cap.title} className="p-8 rounded-2xl bg-card/40 border border-border/40 backdrop-blur-3xl hover:bg-card/60 transition-all group">
                                <div className={`h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center mb-6 ${cap.color} group-hover:scale-110 transition-transform`}>
                                    <cap.icon className="h-6 w-6 stroke-[2.5]" />
                                </div>
                                <h3 className="text-xl font-black uppercase tracking-tight mb-3">{cap.title}</h3>
                                <p className="text-sm text-muted-foreground font-medium leading-relaxed">{cap.desc}</p>
                            </div>
                        ))}
                    </section>

                    <section className="relative py-24 px-10 rounded-3xl bg-blue-600 overflow-hidden group text-center space-y-10 shadow-2xl shadow-blue-500/20">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-indigo-900 opacity-90" />
                        <div className="space-y-6 relative z-10">
                            <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">{t("about.ctaTitle")} <br /><span className="text-white/40 italic">{t("common.header.buttons.deployMatrix")}</span></h2>
                        </div>
                        <div className="flex justify-center gap-6 relative z-10">
                            <Button asChild size="lg" className="h-14 px-12 bg-white text-blue-600 font-black uppercase tracking-[0.2em] rounded-xl shadow-2xl hover:scale-110 transition-all text-xs">
                                <Link href="/auth/sign-up">{t("common.getStartedFree")}</Link>
                            </Button>
                        </div>
                    </section>
                </div>
            </main>

            <footer className="py-20 px-6 border-t border-border/40 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40">
                    {t("footer.rightsReserved")}
                </p>
            </footer>
        </div>
    );
}

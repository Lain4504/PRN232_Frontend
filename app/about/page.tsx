"use client"

import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Zap, Shield, Target, Users, Globe, Rocket } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export default function AboutPage() {
    const { t } = useTranslation("common");

    const values = [
        { icon: Shield, title: t("about.values.0.title"), desc: t("about.values.0.desc"), color: "text-blue-500" },
        { icon: Target, title: t("about.values.1.title"), desc: t("about.values.1.desc"), color: "text-rose-500" },
        { icon: Rocket, title: t("about.values.2.title"), desc: t("about.values.2.desc"), color: "text-amber-500" },
        { icon: Users, title: t("about.values.3.title"), desc: t("about.values.3.desc"), color: "text-emerald-500" },
        { icon: Globe, title: t("about.values.4.title"), desc: t("about.values.4.desc"), color: "text-indigo-500" },
        { icon: Zap, title: t("about.values.5.title"), desc: t("about.values.5.desc"), color: "text-orange-500" },
    ];

    return (
        <div className="min-h-screen bg-background font-fira-sans">
            <Header />

            <main className="pt-40 pb-20 px-6">
                <div className="max-w-[1440px] mx-auto space-y-32">

                    {/* Mission Hero */}
                    <section className="text-center space-y-8 max-w-4xl mx-auto">
                        <Badge variant="outline" className="px-6 py-2 rounded-full border-primary/20 bg-primary/5 text-primary font-black uppercase tracking-[0.3em] text-[10px]">
                            {t("about.badge")}
                        </Badge>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tight uppercase leading-[0.9]">
                            {t("about.title")} <br />
                            <span className="text-primary italic">{t("about.accent")}</span> {t("about.subtitle")}
                        </h1>
                        <p className="text-xl md:text-2xl text-muted-foreground font-medium leading-relaxed">
                            {t("about.description")}
                        </p>
                    </section>

                    {/* Core Values Matrix */}
                    <section className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {values.map((value) => (
                            <div key={value.title} className="p-12 rounded-3xl bg-card/40 border border-border/40 backdrop-blur-3xl hover:bg-card/60 transition-all group">
                                <div className={`h-16 w-16 rounded-[1.5rem] bg-muted/50 flex items-center justify-center mb-8 ${value.color} group-hover:scale-110 transition-transform`}>
                                    <value.icon className="h-8 w-8 stroke-[2.5]" />
                                </div>
                                <h3 className="text-2xl font-black uppercase tracking-tight mb-4">{value.title}</h3>
                                <p className="text-muted-foreground font-medium leading-relaxed">{value.desc}</p>
                            </div>
                        ))}
                    </section>

                    {/* CTA Section */}
                    <section className="relative py-32 px-10 rounded-[4rem] bg-primary overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary via-blue-700 to-indigo-900 opacity-90" />
                        <div className="relative z-10 text-center space-y-12">
                            <h2 className="text-5xl md:text-7xl font-black text-white leading-none uppercase tracking-tighter">
                                {t("about.ctaTitle")} <br />
                                <span className="text-white/40 italic">{t("about.ctaAccent")}</span> {t("about.ctaSuffix")}
                            </h2>
                            <div className="flex justify-center gap-6">
                                <Button asChild size="lg" className="h-16 px-12 bg-white text-primary font-black uppercase tracking-widest rounded-2xl hover:scale-110 transition-all">
                                    <Link href="/auth/sign-up">{t("about.ctaButton")}</Link>
                                </Button>
                            </div>
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

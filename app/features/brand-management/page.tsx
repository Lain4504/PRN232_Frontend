"use client"

import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Target, Shield, Palette, Layers, Lock, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function BrandManagementPage() {
    const { t } = useTranslation("common");

    interface FeatureItem {
        title: string;
        desc: string;
    }

    const featureItems = t("features.brandManagement.features", { returnObjects: true }) as FeatureItem[];
    const icons = [Palette, Layout, Layers, Shield, Lock, Target];
    const colors = ["text-rose-500", "text-blue-500", "text-amber-500", "text-emerald-500", "text-indigo-500", "text-orange-500"];

    const capabilities = featureItems.map((item, index) => ({
        ...item,
        icon: icons[index] || Target,
        color: colors[index] || "text-primary"
    }));

    return (
        <div className="min-h-screen bg-background font-fira-sans">
            <Header />

            <main className="pt-40 pb-20 px-6">
                <div className="max-w-[1440px] mx-auto space-y-32">

                    <section className="text-center space-y-8 max-w-4xl mx-auto">
                        <Badge variant="outline" className="px-6 py-2 rounded-full border-rose-500/20 bg-rose-500/5 text-rose-500 font-black uppercase tracking-[0.3em] text-[10px]">
                            {t("features.brandManagement.badge")}
                        </Badge>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight uppercase leading-[0.85] text-foreground">
                            {t("features.brandManagement.title")} <br />
                            <span className="text-rose-500 italic">{t("features.brandManagement.accent")}</span>
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed tracking-tight">
                            {t("features.brandManagement.description")}
                        </p>
                    </section>

                    {/* Branding Modules */}
                    <section className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {capabilities.map((mod) => (
                            <div key={mod.title} className="p-8 rounded-2xl bg-card/40 border border-border/40 backdrop-blur-3xl hover:bg-card/60 transition-all group">
                                <div className={`h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center mb-6 ${mod.color} group-hover:scale-110 transition-transform`}>
                                    <mod.icon className="h-6 w-6 stroke-[2.5]" />
                                </div>
                                <h3 className="text-xl font-black uppercase tracking-tight mb-3">{mod.title}</h3>
                                <p className="text-sm text-muted-foreground font-medium leading-relaxed">{mod.desc}</p>
                            </div>
                        ))}
                    </section>

                    <section className="relative py-24 px-10 rounded-3xl bg-rose-600 overflow-hidden group text-center space-y-10 shadow-2xl shadow-rose-500/20">
                        <div className="absolute inset-0 bg-gradient-to-br from-rose-600 via-pink-700 to-rose-900 opacity-90" />
                        <div className="space-y-6 relative z-10">
                            <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">
                                {t("features.brandManagement.ctaTitle")} <br />
                                <span className="text-white/40 italic">{t("features.brandManagement.ctaAccent")}</span>
                            </h2>
                        </div>
                        <div className="flex justify-center gap-6 relative z-10">
                            <Button asChild size="lg" className="h-14 px-12 bg-white text-rose-600 font-black uppercase tracking-[0.2em] rounded-xl shadow-2xl hover:scale-110 transition-all text-xs">
                                <Link href="/auth/sign-up">{t("features.brandManagement.ctaButton")}</Link>
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

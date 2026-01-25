"use client"

import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Code, Terminal, Zap, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export default function ApiPage() {
    const { t } = useTranslation("common");

    const endpoints = [
        { method: "POST", path: "/v1/content/generate", desc: t("api.endpoints.0.desc") },
        { method: "GET", path: "/v1/analytics/stats", desc: t("api.endpoints.1.desc") },
        { method: "POST", path: "/v1/schedule/post", desc: t("api.endpoints.2.desc") },
        { method: "GET", path: "/v1/brand/profiles", desc: t("api.endpoints.3.desc") }
    ];

    return (
        <div className="min-h-screen bg-background font-fira-sans">
            <Header />

            <main className="pt-40 pb-20 px-6">
                <div className="max-w-[1440px] mx-auto space-y-24">

                    <section className="text-center space-y-6 max-w-3xl mx-auto">
                        <Badge variant="outline" className="px-6 py-2 rounded-full border-primary/20 bg-primary/5 text-primary font-black uppercase tracking-[0.3em] text-[10px]">
                            {t("api.badge")}
                        </Badge>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tight uppercase leading-none">
                            {t("api.title")} <span className="text-primary italic">{t("api.accent")}</span>
                        </h1>
                        <p className="text-xl text-muted-foreground font-medium">
                            {t("api.baseUrl")}
                        </p>
                    </section>

                    {/* Authentication Section */}
                    <section className="space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                <Zap className="w-5 h-5 stroke-[2.5]" />
                            </div>
                            <h2 className="text-2xl font-black uppercase tracking-tight">{t("api.authentication.title")}</h2>
                        </div>
                        <div className="bg-card/40 border border-border/40 rounded-3xl p-10 backdrop-blur-3xl space-y-6">
                            <p className="text-muted-foreground font-medium leading-relaxed">
                                {t("api.authentication.description")}
                            </p>
                            <div className="bg-muted/30 rounded-2xl p-6 font-fira-mono text-sm relative group">
                                <code className="text-primary tracking-tighter">{t("api.authentication.example")}</code>
                                <Button variant="ghost" size="icon" className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100 transition-opacity">
                                    <Copy className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </section>

                    {/* Endpoints */}
                    <section className="space-y-10">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                                <Terminal className="w-5 h-5 stroke-[2.5]" />
                            </div>
                            <h2 className="text-2xl font-black uppercase tracking-tight">{t("api.endpointsTitle")}</h2>
                        </div>
                        <div className="grid gap-6">
                            {endpoints.map((ep) => (
                                <div key={ep.path} className="flex flex-col md:flex-row md:items-center justify-between p-8 rounded-3xl bg-card/40 border border-border/40 backdrop-blur-3xl hover:bg-card/60 transition-all group">
                                    <div className="flex items-center gap-6">
                                        <Badge className={`h-10 px-4 flex items-center justify-center border-none font-black text-xs rounded-xl ${ep.method === 'POST' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-blue-500/20 text-blue-500'}`}>
                                            {ep.method}
                                        </Badge>
                                        <div className="space-y-1">
                                            <code className="text-lg font-black font-fira-mono tracking-tighter text-foreground/90">{ep.path}</code>
                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{ep.desc}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" className="hidden md:flex text-[10px] font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-all pr-0">
                                        {t("api.viewDetails")}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </main>

            <footer className="py-20 px-6 border-t border-border/40 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40">
                    {t("api.footer")}
                </p>
            </footer>
        </div>
    );
}

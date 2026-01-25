"use client";

import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Book, Code, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function DocsContent() {
    const { t } = useTranslation("common");
    const sections = t("docs.sections", { returnObjects: true }) as any[];
    const cards = t("docs.cards", { returnObjects: true }) as any[];

    return (
        <div className="min-h-screen bg-background font-fira-sans">
            <Header />

            <main className="pt-40 pb-20 px-6">
                <div className="max-w-[1440px] mx-auto grid lg:grid-cols-12 gap-16">

                    {/* Sidebar Nav */}
                    <aside className="hidden lg:block lg:col-span-3 space-y-12">
                        {sections.map((section: any) => (
                            <div key={section.title} className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic px-2">{section.title}</h4>
                                <nav className="flex flex-col">
                                    {section.items.map((item: string) => (
                                        <Link key={item} href="#" className="h-10 flex items-center px-4 rounded-xl text-sm font-bold text-muted-foreground hover:bg-muted/30 hover:text-foreground transition-all">
                                            {item}
                                        </Link>
                                    ))}
                                </nav>
                            </div>
                        ))}
                    </aside>

                    {/* Content Main */}
                    <div className="lg:col-span-9 space-y-20">
                        <section className="space-y-10">
                            <div className="flex items-center justify-between">
                                <div className="space-y-4">
                                    <Badge variant="outline" className="px-4 py-1 rounded-full border-primary/20 bg-primary/5 text-primary font-black uppercase tracking-[0.3em] text-[10px]">
                                        {t("docs.badge")}
                                    </Badge>
                                    <h1 className="text-5xl md:text-7xl font-black tracking-tight uppercase leading-none">
                                        {t("docs.title")} <span className="text-primary italic">{t("docs.accent")}</span>
                                    </h1>
                                </div>
                                <div className="hidden sm:block relative w-64 group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                                    <Input placeholder={t("docs.searchPlaceholder").toUpperCase()} className="pl-10 h-12 rounded-xl bg-muted/20 border-border/40 font-fira-mono text-[10px] tracking-widest focus:bg-background" />
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-6">
                                <Link href="#" className="p-8 rounded-[2rem] bg-card/40 border border-border/40 backdrop-blur-3xl hover:bg-card/60 transition-all group border-l-4 border-l-primary">
                                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                                        <Book className="w-5 h-5 stroke-[2.5]" />
                                    </div>
                                    <h3 className="text-xl font-black uppercase tracking-tight mb-2">{cards[0].title}</h3>
                                    <p className="text-muted-foreground font-medium text-xs">{cards[0].description}</p>
                                </Link>
                                <Link href="/api" className="p-8 rounded-[2rem] bg-card/40 border border-border/40 backdrop-blur-3xl hover:bg-card/60 transition-all group border-l-4 border-l-blue-500">
                                    <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4 group-hover:scale-110 transition-transform">
                                        <Code className="w-5 h-5 stroke-[2.5]" />
                                    </div>
                                    <h3 className="text-xl font-black uppercase tracking-tight mb-2">{cards[1].title}</h3>
                                    <p className="text-muted-foreground font-medium text-xs">{cards[1].description}</p>
                                </Link>
                            </div>
                        </section>

                        <section className="prose prose-invert max-w-none space-y-12">
                            <div className="p-8 rounded-[2rem] bg-muted/20 border border-border/10 space-y-4">
                                <h2 className="text-2xl font-black uppercase tracking-tight text-foreground m-0">{t("docs.overviewTitle")}</h2>
                                <p className="text-muted-foreground font-medium text-base leading-relaxed">
                                    {t("docs.overviewBody")}
                                </p>
                                <div className="h-[2px] w-20 bg-primary/40 rounded-full" />
                                <p className="text-xs text-muted-foreground/60 italic font-medium">
                                    {t("docs.overviewFootnote")}
                                </p>
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            <footer className="py-20 px-6 border-t border-border/40 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40">
                    © 2026 AISAM Platform. All documentation is kept current.
                </p>
            </footer>
        </div>
    );
}

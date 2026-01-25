"use client";

import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export default function BlogContent() {
    interface BlogPost {
        image: string;
        tag: string;
        title: string;
        desc: string;
        date: string;
        author: string;
    }

    const { t } = useTranslation("common");
    const featured = t("blog.featured", { returnObjects: true }) as BlogPost;
    const posts = t("blog.posts", { returnObjects: true }) as BlogPost[];

    return (
        <div className="min-h-screen bg-background font-fira-sans">
            <Header />

            <main className="pt-40 pb-20 px-6">
                <div className="max-w-[1440px] mx-auto space-y-32">

                    <section className="text-center space-y-6 max-w-3xl mx-auto">
                        <Badge variant="outline" className="px-6 py-2 rounded-full border-primary/20 bg-primary/5 text-primary font-black uppercase tracking-[0.3em] text-[10px]">
                            {t("blog.badge")}
                        </Badge>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight uppercase leading-none">
                            {t("blog.title")} & <span className="text-primary italic">{t("blog.accent")}</span>
                        </h1>
                        <p className="text-lg text-muted-foreground font-medium">
                            {t("blog.description")}
                        </p>
                    </section>

                    {/* Featured Post Section */}
                    <section className="group cursor-pointer">
                        <div className="grid lg:grid-cols-2 bg-card/40 border border-border/40 rounded-2xl overflow-hidden backdrop-blur-3xl hover:bg-card/60 transition-all shadow-2xl">
                            <div className="h-[400px] lg:h-full relative overflow-hidden">
                                <img src={featured.image} alt="Featured" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            </div>
                            <div className="p-10 flex flex-col justify-between space-y-8">
                                <div className="space-y-4">
                                    <Badge className="bg-primary/10 text-primary border-none font-black text-[9px] px-4 py-1.5 uppercase tracking-[0.3em]">{featured.tag}</Badge>
                                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter leading-none">{featured.title}</h2>
                                    <p className="text-base text-muted-foreground font-medium leading-relaxed">{featured.desc}</p>
                                </div>
                                <div className="flex items-center justify-between border-t border-border/20 pt-8">
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                                            <Clock className="w-3.5 h-3.5" /> {featured.date}
                                        </div>
                                        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-primary">
                                            <User className="w-3.5 h-3.5" /> {featured.author}
                                        </div>
                                    </div>
                                    <Button variant="ghost" className="rounded-full h-12 w-12 border border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                        <ArrowRight className="w-5 h-5 stroke-[3]" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Grid Section */}
                    <section className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {posts.map((post) => (
                            <div key={post.title} className="p-8 rounded-2xl bg-card/40 border border-border/40 backdrop-blur-3xl hover:bg-card/60 transition-all group flex flex-col justify-between h-[500px]">
                                <div className="space-y-6">
                                    <div className="h-48 relative rounded-[1.5rem] overflow-hidden mb-6">
                                        <img src={post.image} alt={post.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    </div>
                                    <Badge className="bg-muted/50 text-muted-foreground border-none font-black text-[9px] px-4 py-1.5 uppercase tracking-[0.3em]">{post.tag}</Badge>
                                    <h3 className="text-2xl font-black uppercase tracking-tight leading-none group-hover:text-primary transition-colors">{post.title}</h3>
                                    <p className="text-muted-foreground font-medium text-sm leading-relaxed line-clamp-2">{post.desc}</p>
                                </div>
                                <div className="flex items-center justify-between border-t border-border/10 pt-6 opacity-60">
                                    <span className="text-[9px] font-black uppercase tracking-widest">{post.date}</span>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-primary italic">{post.author}</span>
                                </div>
                            </div>
                        ))}
                    </section>
                </div>
            </main>

            <footer className="py-20 px-6 border-t border-border/40 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40">
                    {t("blog.footer")}
                </p>
            </footer>
        </div>
    );
}

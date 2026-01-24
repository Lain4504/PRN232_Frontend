import { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Code, Terminal, Zap, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
    title: "AISAM | API Reference",
    description: "REST API documentation for programmatically interacting with AISAM.",
};

export default function ApiPage() {
    const endpoints = [
        { method: "POST", path: "/v1/content/generate", desc: "Start a new content generation request." },
        { method: "GET", path: "/v1/analytics/stats", desc: "Retrieve campaign performance data." },
        { method: "POST", path: "/v1/schedule/post", desc: "Schedule a post for a specific social channel." },
        { method: "GET", path: "/v1/brand/profiles", desc: "List all active brand identity profiles." }
    ];

    return (
        <div className="min-h-screen bg-background font-fira-sans">
            <Header />

            <main className="pt-40 pb-20 px-6">
                <div className="max-w-[1440px] mx-auto space-y-24">

                    <section className="text-center space-y-6 max-w-3xl mx-auto">
                        <Badge variant="outline" className="px-6 py-2 rounded-full border-primary/20 bg-primary/5 text-primary font-black uppercase tracking-[0.3em] text-[10px]">
                            Developer Tools
                        </Badge>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tight uppercase leading-none">
                            API <span className="text-primary italic">Reference</span>.
                        </h1>
                        <p className="text-xl text-muted-foreground font-medium">
                            V1.0.4 - Base URL: https://api.aisam.app
                        </p>
                    </section>

                    {/* Authentication Section */}
                    <section className="space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                <Zap className="w-5 h-5 stroke-[2.5]" />
                            </div>
                            <h2 className="text-2xl font-black uppercase tracking-tight">Authentication</h2>
                        </div>
                        <div className="bg-card/40 border border-border/40 rounded-[3rem] p-10 backdrop-blur-3xl space-y-6">
                            <p className="text-muted-foreground font-medium leading-relaxed">
                                All API requests must include a Bearer token in the `Authorization` header.
                            </p>
                            <div className="bg-muted/30 rounded-2xl p-6 font-fira-mono text-sm relative group">
                                <code className="text-primary tracking-tighter">Authorization: Bearer YOUR_API_TOKEN</code>
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
                            <h2 className="text-2xl font-black uppercase tracking-tight">Common Endpoints</h2>
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
                                        VIEW DETAILS
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </main>

            <footer className="py-20 px-6 border-t border-border/40 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40">
                    © 2026 AISAM Intelligence Core. API Integrity Verified.
                </p>
            </footer>
        </div>
    );
}

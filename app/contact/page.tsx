import { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageSquare, Globe, MapPin, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const metadata: Metadata = {
    title: "AISAM | Contact Us",
    description: "Get in touch with the AISAM support and partnership team.",
};

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-background font-fira-sans">
            <Header />

            <main className="pt-40 pb-20 px-6">
                <div className="max-w-[1440px] mx-auto space-y-32">

                    <section className="text-center space-y-6 max-w-3xl mx-auto">
                        <Badge variant="outline" className="px-6 py-2 rounded-full border-primary/20 bg-primary/5 text-primary font-black uppercase tracking-[0.3em] text-[10px]">
                            Get In Touch
                        </Badge>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tight uppercase leading-[0.9]">
                            Contact <br />
                            <span className="text-primary italic">Us</span>.
                        </h1>
                        <p className="text-xl text-muted-foreground font-medium">
                            Have questions or want to partner with us? Reach out and we'll get back to you within 24 hours.
                        </p>
                    </section>

                    <section className="grid lg:grid-cols-12 gap-16">
                        {/* Info Sector */}
                        <div className="lg:col-span-5 space-y-12">
                            <div className="space-y-10">
                                <h2 className="text-4xl font-black uppercase tracking-tight text-foreground leading-[0.9]">Contact <br />Details.</h2>
                                <div className="space-y-8">
                                    {[
                                        { icon: Mail, label: "Email Address", value: "hello@aisam.app" },
                                        { icon: MessageSquare, label: "Live Support", value: "Chat Available" },
                                        { icon: MapPin, label: "Location", value: "Global (Distributed)" },
                                        { icon: Globe, label: "Availability", value: "24/7 Digital Hub" },
                                    ].map((item) => (
                                        <div key={item.label} className="flex gap-6 group">
                                            <div className="h-14 w-14 rounded-2xl bg-muted/20 border border-border/40 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                                                <item.icon className="w-6 h-6 stroke-[2.5]" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic mb-1">{item.label}</p>
                                                <p className="text-xl font-black uppercase tracking-tight text-foreground/90">{item.value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-8 rounded-[3rem] bg-card/40 border border-border/40 backdrop-blur-3xl space-y-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <Globe className="w-32 h-32" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 italic leading-none">Global Pulse Active</span>
                                </div>
                                <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                                    Our support team is always active. We prioritize inquiries from our Enterprise and Strategic partners.
                                </p>
                            </div>
                        </div>

                        {/* Form Sector */}
                        <div className="lg:col-span-7 bg-card/40 border border-border/40 rounded-[4rem] p-12 lg:p-20 backdrop-blur-3xl shadow-2xl relative">
                            <form className="space-y-8">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 italic">YOUR NAME</label>
                                        <Input className="h-16 rounded-2xl bg-muted/10 border-border/40 h-16 font-fira-mono text-sm tracking-tight focus:bg-background transition-all" placeholder="John Doe" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 italic">EMAIL ADDRESS</label>
                                        <Input className="h-16 rounded-2xl bg-muted/10 border-border/40 h-16 font-fira-mono text-sm tracking-tight focus:bg-background transition-all" placeholder="john@example.com" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 italic">INQUIRY TYPE</label>
                                    <Input className="h-16 rounded-2xl bg-muted/10 border-border/40 h-16 font-fira-mono text-sm tracking-tight focus:bg-background transition-all" placeholder="Strategic Partnership / Support / Billing" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 italic">YOUR MESSAGE</label>
                                    <Textarea className="min-h-[200px] rounded-3xl bg-muted/10 border-border/40 font-fira-mono text-sm tracking-tight focus:bg-background transition-all p-6" placeholder="How can we help you today?" />
                                </div>
                                <Button className="w-full h-20 rounded-3xl bg-primary hover:bg-primary/95 text-primary-foreground font-black uppercase tracking-[0.3em] text-sm shadow-2xl shadow-primary/30 transition-all hover:scale-[1.03] active:scale-[0.97]">
                                    <Send className="w-5 h-5 mr-3 stroke-[3]" />
                                    SEND MESSAGE
                                </Button>
                            </form>
                        </div>
                    </section>
                </div>
            </main>

            <footer className="py-20 px-6 border-t border-border/40 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40">
                    © 2026 AISAM Platform. Contact Us Anytime.
                </p>
            </footer>
        </div>
    );
}

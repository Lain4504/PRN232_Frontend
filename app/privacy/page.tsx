import { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, Fingerprint, EyeOff, Database } from "lucide-react";

export const metadata: Metadata = {
    title: "AISAM | Privacy Policy",
    description: "How we protect and manage your data at AISAM.",
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background font-fira-sans">
            <Header />

            <main className="pt-40 pb-20 px-6">
                <div className="max-w-4xl mx-auto space-y-20">

                    <section className="text-center space-y-6">
                        <Badge variant="outline" className="px-6 py-2 rounded-full border-primary/20 bg-primary/5 text-primary font-black uppercase tracking-[0.3em] text-[10px]">
                            Data Protection
                        </Badge>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tight uppercase leading-none">
                            Privacy <span className="text-primary italic">Policy</span>.
                        </h1>
                        <p className="text-xl text-muted-foreground font-medium">
                            We take the security of your data seriously.
                        </p>
                    </section>

                    <section className="bg-card/40 border border-border/40 rounded-3xl p-12 lg:p-20 backdrop-blur-3xl space-y-16">
                        <div className="prose prose-invert max-w-none space-y-12">
                            <div>
                                <div className="flex items-center gap-3 text-primary mb-4">
                                    <ShieldAlert className="w-6 h-6 stroke-[2.5]" />
                                    <h2 className="text-2xl font-black uppercase tracking-tight text-foreground m-0">1. Data Collection</h2>
                                </div>
                                <p className="text-muted-foreground font-medium leading-relaxed">
                                    We collect minimal data necessary for platform operations, including your email address and basic brand assets.
                                    We do not sell your personal information to third parties.
                                </p>
                            </div>

                            <div>
                                <div className="flex items-center gap-3 text-primary mb-4">
                                    <Fingerprint className="w-6 h-6 stroke-[2.5]" />
                                    <h2 className="text-2xl font-black uppercase tracking-tight text-foreground m-0">2. Security Measures</h2>
                                </div>
                                <p className="text-muted-foreground font-medium leading-relaxed">
                                    All user assets are encrypted using high-standard protocols. Our servers are located in secure,
                                    compliant data centers with 24/7 monitoring.
                                </p>
                            </div>

                            <div>
                                <div className="flex items-center gap-3 text-primary mb-4">
                                    <Database className="w-6 h-6 stroke-[2.5]" />
                                    <h2 className="text-2xl font-black uppercase tracking-tight text-foreground m-0">3. User Rights</h2>
                                </div>
                                <p className="text-muted-foreground font-medium leading-relaxed">
                                    You have full control over your data. You can request to export or delete your entire account history
                                    at any time through your dashboard settings.
                                </p>
                            </div>

                            <div>
                                <div className="flex items-center gap-3 text-primary mb-4">
                                    <EyeOff className="w-6 h-6 stroke-[2.5]" />
                                    <h2 className="text-2xl font-black uppercase tracking-tight text-foreground m-0">4. Third-Party Apps</h2>
                                </div>
                                <p className="text-muted-foreground font-medium leading-relaxed">
                                    When you connect social media accounts (TikTok, Meta, X), we only access the permissions
                                    required to post content on your behalf.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            <footer className="py-20 px-6 border-t border-border/40 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40">
                    © 2026 AISAM Platform. Privacy Ensured.
                </p>
            </footer>
        </div>
    );
}

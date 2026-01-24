import { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { ScrollText, Gavel, Scale, FileWarning } from "lucide-react";

export const metadata: Metadata = {
    title: "AISAM | Terms of Service",
    description: "General terms and conditions for using the AISAM AI platform.",
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background font-fira-sans">
            <Header />

            <main className="pt-40 pb-20 px-6">
                <div className="max-w-4xl mx-auto space-y-20">

                    <section className="text-center space-y-6">
                        <Badge variant="outline" className="px-6 py-2 rounded-full border-primary/20 bg-primary/5 text-primary font-black uppercase tracking-[0.3em] text-[10px]">
                            General Terms
                        </Badge>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tight uppercase leading-none">
                            Terms of <span className="text-primary italic">Service</span>.
                        </h1>
                        <p className="text-xl text-muted-foreground font-medium">
                            Rules and guidelines for the AISAM platform users.
                        </p>
                    </section>

                    <section className="bg-card/40 border border-border/40 rounded-[3rem] p-12 lg:p-20 backdrop-blur-3xl space-y-16">
                        <div className="prose prose-invert max-w-none space-y-12">
                            <div>
                                <div className="flex items-center gap-3 text-primary mb-4">
                                    <Scale className="w-6 h-6 stroke-[2.5]" />
                                    <h2 className="text-2xl font-black uppercase tracking-tight text-foreground m-0">1. User Accounts</h2>
                                </div>
                                <p className="text-muted-foreground font-medium leading-relaxed">
                                    By creating an account on AISAM, you agree to provide accurate information and maintain the
                                    security of your login credentials. You are responsible for all activity under your account.
                                </p>
                            </div>

                            <div>
                                <div className="flex items-center gap-3 text-primary mb-4">
                                    <Gavel className="w-6 h-6 stroke-[2.5]" />
                                    <h2 className="text-2xl font-black uppercase tracking-tight text-foreground m-0">2. Acceptable Use</h2>
                                </div>
                                <p className="text-muted-foreground font-medium leading-relaxed">
                                    You must not use our AI tools to create illegal or harmful content, or to violate the terms
                                    of the social media platforms you connect to (TikTok, Instagram, X).
                                </p>
                            </div>

                            <div>
                                <div className="flex items-center gap-3 text-primary mb-4">
                                    <ScrollText className="w-6 h-6 stroke-[2.5]" />
                                    <h2 className="text-2xl font-black uppercase tracking-tight text-foreground m-0">3. System Resources</h2>
                                </div>
                                <p className="text-muted-foreground font-medium leading-relaxed">
                                    Monthly generation limits (tokens) are determined by your chosen subscription plan.
                                    Unused tokens do not roll over to the next billing cycle.
                                </p>
                            </div>

                            <div>
                                <div className="flex items-center gap-3 text-rose-500 mb-4">
                                    <FileWarning className="w-6 h-6 stroke-[2.5]" />
                                    <h2 className="text-2xl font-black uppercase tracking-tight text-foreground m-0">4. Account Termination</h2>
                                </div>
                                <p className="text-muted-foreground font-medium leading-relaxed">
                                    We reserve the right to suspend or terminate accounts that violate our terms or use excessive
                                    system resources that impact other users.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            <footer className="py-20 px-6 border-t border-border/40 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40">
                    © 2026 AISAM Platform. All Rights Reserved.
                </p>
            </footer>
        </div>
    );
}

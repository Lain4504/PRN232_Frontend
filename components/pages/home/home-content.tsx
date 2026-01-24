"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sparkles,
  Brain,
  Target,
  Zap,
  ArrowRight,
  CheckCircle,
  Star,
  Play,
  Shield,
  Clock,
  TrendingUp,
  Globe,
  Rocket
} from "lucide-react";

export function HomeContent() {
  return (
    <div className="min-h-screen bg-background font-fira-sans selection:bg-primary/20 selection:text-primary-foreground overflow-x-hidden">
      {/* Immersive Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-6 pt-20 pb-16 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[160px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/5 rounded-full blur-[140px] animate-bounce" style={{ animationDuration: '10s' }} />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        </div>

        <div className="relative z-10 max-w-[1440px] mx-auto text-center space-y-12">
          <div className="space-y-6">
            <div className="flex justify-center">
              <Badge variant="outline" className="px-6 py-2 rounded-full border-primary/20 bg-primary/5 backdrop-blur-md text-primary font-black uppercase tracking-[0.3em] text-[10px] animate-fade-in">
                <Sparkles className="w-3.5 h-3.5 mr-2 stroke-[3]" />
                AI Marketing Platform
              </Badge>
            </div>

            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-foreground leading-[0.85] animate-reveal">
              Social Ads, <br />
              <span className="relative inline-block mt-4">
                <span className="text-primary italic">Perfected.</span>
                <div className="absolute -bottom-2 left-0 w-full h-2 bg-primary/10 -rotate-1 rounded-full" />
              </span>
            </h1>

            <p className="max-w-3xl mx-auto text-xl md:text-2xl text-muted-foreground/80 font-medium leading-relaxed font-fira-sans tracking-tight">
              Scale your creative studio across TikTok, Meta, and Instagram with
              an enterprise AI engine built for hyper-growth.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
            <Button asChild size="lg" className="h-16 px-12 text-lg font-black uppercase tracking-widest rounded-2xl bg-primary hover:bg-primary/95 text-primary-foreground shadow-2xl shadow-primary/30 transition-all hover:scale-[1.05] active:scale-[0.95]">
              <Link href="/auth/sign-up" className="flex items-center gap-3">
                Start Free Trial
                <ArrowRight className="h-5 w-5 stroke-[3]" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="h-16 px-10 text-lg font-bold rounded-2xl border border-border/40 hover:bg-muted/50 backdrop-blur-sm transition-all">
              <Link href="/solutions/startup" className="flex items-center gap-3">
                <Play className="h-5 w-5 fill-current" />
                View Solutions
              </Link>
            </Button>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-px py-12 px-10 bg-card/40 backdrop-blur-2xl border border-border/40 rounded-[3rem] shadow-2xl mt-20 max-w-6xl mx-auto relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 rounded-[3rem]" />

            <div className="relative space-y-2 md:px-6">
              <div className="text-4xl font-black text-foreground font-fira-mono tracking-tighter">12k<span className="text-primary">+</span></div>
              <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] leading-tight px-1">Global Marketers</div>
            </div>

            <div className="relative space-y-2 md:px-6 md:border-l border-border/20">
              <div className="text-4xl font-black text-foreground font-fira-mono tracking-tighter">65M<span className="text-primary">/</span>mo</div>
              <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] leading-tight px-1">Assets Generated</div>
            </div>

            <div className="relative space-y-2 md:px-6 md:border-l border-border/20">
              <div className="text-4xl font-black text-foreground font-fira-mono tracking-tighter">4.98</div>
              <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] leading-tight px-1">Satisfaction Score</div>
            </div>

            <div className="relative space-y-2 md:px-6 md:border-l border-border/20">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <div className="text-4xl font-black text-foreground font-fira-mono tracking-tighter">Live</div>
              </div>
              <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] leading-tight px-1">Autonomous Engine</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 lg:py-40 px-6 bg-muted/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[120px] -rotate-12 translate-x-1/2" />

        <div className="max-w-[1440px] mx-auto">
          <div className="flex flex-col lg:flex-row items-end justify-between gap-10 mb-20 lg:mb-32">
            <div className="space-y-6 max-w-3xl">
              <div className="flex items-center gap-3">
                <div className="h-2 w-10 bg-primary rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/70 italic">Core AI Capabilities</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-black tracking-tight text-foreground leading-none uppercase">
                The Complete <span className="text-primary">Marketing</span> Suite.
              </h2>
            </div>
            <p className="text-xl text-muted-foreground font-medium max-w-sm leading-relaxed tracking-tight border-l-2 border-primary/20 pl-6">
              Shatter the creative bottleneck. AISAM provides a robust platform for modern marketing teams.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* AI Creator */}
            <Card className="group relative border-border/40 bg-card/60 backdrop-blur-xl rounded-[2.5rem] p-10 overflow-hidden shadow-2xl transition-all hover:scale-[1.02] hover:bg-card/80">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Brain className="h-32 w-32 stroke-[1]" />
              </div>
              <div className="relative space-y-8 h-full flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                    <Brain className="h-7 w-7 stroke-[2.5]" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-black uppercase tracking-tight">AI Content Creator</h3>
                    <p className="text-muted-foreground font-medium text-sm leading-relaxed">
                      Deep-learning generative models optimized for high-conversion social assets across all platform formats.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-primary/5 text-primary border-none font-bold text-[9px] px-3 uppercase tracking-widest">Image Engine</Badge>
                  <Badge className="bg-primary/5 text-primary border-none font-bold text-[9px] px-3 uppercase tracking-widest">Video AI</Badge>
                </div>
              </div>
            </Card>

            {/* Brand Control */}
            <Card className="group relative border-border/40 bg-card/60 backdrop-blur-xl rounded-[2.5rem] p-10 overflow-hidden shadow-2xl transition-all hover:scale-[1.02] hover:bg-card/80">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Target className="h-32 w-32 stroke-[1]" />
              </div>
              <div className="relative space-y-8 h-full flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="h-14 w-14 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-600 shadow-inner">
                    <Target className="h-7 w-7 stroke-[2.5]" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-black uppercase tracking-tight">Brand Management</h3>
                    <p className="text-muted-foreground font-medium text-sm leading-relaxed">
                      Maintain absolute brand consistency with AI-enforced visual guidelines and tone-of-voice control.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-blue-600/5 text-blue-600 border-none font-bold text-[9px] px-3 uppercase tracking-widest">Asset Hub</Badge>
                  <Badge className="bg-blue-600/5 text-blue-600 border-none font-bold text-[9px] px-3 uppercase tracking-widest">Global Sync</Badge>
                </div>
              </div>
            </Card>

            {/* Scheduling */}
            <Card className="group relative border-border/40 bg-card/60 backdrop-blur-xl rounded-[2.5rem] p-10 overflow-hidden shadow-2xl transition-all hover:scale-[1.02] hover:bg-card/80">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Zap className="h-32 w-32 stroke-[1]" />
              </div>
              <div className="relative space-y-8 h-full flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="h-14 w-14 rounded-2xl bg-amber-600/10 flex items-center justify-center text-amber-600 shadow-inner">
                    <Zap className="h-7 w-7 stroke-[2.5]" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-black uppercase tracking-tight">Automated Scheduling</h3>
                    <p className="text-muted-foreground font-medium text-sm leading-relaxed">
                      Optimize your post timing across global networks with centralized approval and automated workflows.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-amber-600/5 text-amber-600 border-none font-bold text-[9px] px-3 uppercase tracking-widest">Auto-Post</Badge>
                  <Badge className="bg-amber-600/5 text-amber-600 border-none font-bold text-[9px] px-3 uppercase tracking-widest">Meta & TikTok</Badge>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 lg:py-40 px-6 bg-background">
        <div className="max-w-[1440px] mx-auto space-y-24">
          <div className="text-center space-y-6">
            <Badge variant="outline" className="px-4 py-1 rounded-full border-border/60 font-black text-[10px] uppercase tracking-[0.3em]">Client Success</Badge>
            <h2 className="text-5xl md:text-7xl font-black tracking-tight uppercase leading-none">
              Trusted by the <br />
              <span className="text-primary italic">Modern</span> Marketing Elite.
            </h2>
          </div>

          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {[
              { name: "Lan Nguyen", role: "CEO, TechStart", initial: "LN", quote: "AISAM has completely transformed how we manage advertising. From content creation to performance analysis, everything is automated." },
              { name: "Minh Tran", role: "Marketing Director, LuxBrand", initial: "MT", quote: "The AI content creator is truly impressive. We save 70% of creative production time while maintaining extreme quality standards." },
              { name: "Hoang Le", role: "Founder, Zenith Digital", initial: "HL", quote: "The interface is professional and intuitive. Integration with our social channels was seamless. Support is top-tier." }
            ].map((t, idx) => (
              <Card key={idx} className="bg-muted/30 border-none rounded-[2.5rem] p-10 space-y-8 group transition-all hover:bg-primary/5">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-primary text-primary stroke-0" />)}
                </div>
                <p className="text-lg font-bold italic tracking-tight text-foreground/80 leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-4 pt-4">
                  <Avatar className="h-12 w-12 rounded-2xl border-2 border-primary/20">
                    <AvatarFallback className="bg-primary text-primary-foreground font-black text-xs">{t.initial}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-0.5">
                    <p className="font-black text-sm uppercase tracking-wider">{t.name}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 lg:py-48 px-6 overflow-hidden bg-primary shadow-[0_0_120px_-20px_rgba(var(--color-primary),0.3)] mx-6 lg:mx-10 rounded-[3rem] my-20 group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-blue-700 to-indigo-900 opacity-90" />
        <div className="absolute top-0 right-0 w-[50%] h-full bg-white/5 skew-x-[-20deg] translate-x-1/2 group-hover:translate-x-1/3 transition-transform duration-1000" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-12">
          <div className="space-y-6">
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter text-white leading-[0.9] uppercase">
              Ready to Grow <br />
              <span className="text-white/40 italic">Your</span> Brand?
            </h2>
            <p className="text-xl md:text-2xl text-white/70 font-bold tracking-tight max-w-2xl mx-auto">
              Start your 14-day free trial today. No credit card required.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button asChild size="lg" className="h-20 px-16 text-xl font-black uppercase tracking-[0.2em] rounded-3xl bg-white text-primary hover:bg-white/95 shadow-2xl transition-all hover:scale-110 active:scale-90">
              <Link href="/auth/sign-up">
                Get Started
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-20 px-12 text-lg font-bold rounded-3xl border-2 border-white/30 bg-transparent text-white hover:bg-white/10 backdrop-blur-md transition-all">
              <Link href="/about">
                Our Mission
              </Link>
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-8 text-[11px] font-black uppercase tracking-[0.3em] text-white/40">
            <div className="flex items-center gap-3"><CheckCircle className="h-4 w-4 stroke-[3]" /> Global Support</div>
            <div className="flex items-center gap-3"><CheckCircle className="h-4 w-4 stroke-[3]" /> Instant Setup</div>
            <div className="flex items-center gap-3"><CheckCircle className="h-4 w-4 stroke-[3]" /> Free Tier Available</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-24 pb-12 px-6 bg-muted/20 border-t border-border/40">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid gap-16 md:grid-cols-2 lg:grid-cols-4 pb-20">
            <div className="space-y-8">
              <Link href="/" className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <Zap className="h-6 w-6 text-primary-foreground fill-current" />
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-sm uppercase tracking-[0.4em] leading-none mb-0.5">Aisam</span>
                  <span className="font-bold text-[9px] uppercase tracking-widest leading-none text-muted-foreground/60">Platform</span>
                </div>
              </Link>
              <p className="text-muted-foreground font-medium text-sm leading-relaxed tracking-tight max-w-xs">
                The leading AI platform for modern marketing teams.
                Built for the next generation of social advertising.
              </p>
            </div>

            <div className="space-y-6">
              <h4 className="font-black text-[10px] uppercase tracking-[0.4em] text-foreground">Features</h4>
              <div className="flex flex-col gap-4">
                <Link href="/features/ai-content" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors tracking-tight">AI Content Creator</Link>
                <Link href="/features/brand-management" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors tracking-tight">Brand Hub</Link>
                <Link href="/features/scheduling" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors tracking-tight">Post Scheduling</Link>
                <Link href="/features/analytics" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors tracking-tight">Campaign Analytics</Link>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="font-black text-[10px] uppercase tracking-[0.4em] text-foreground">Resources</h4>
              <div className="flex flex-col gap-4">
                <Link href="/docs" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors tracking-tight">Documentation</Link>
                <Link href="/api" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors tracking-tight">API Reference</Link>
                <Link href="/blog" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors tracking-tight">Blog & Insights</Link>
                <Link href="/contact" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors tracking-tight">Contact Support</Link>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="font-black text-[10px] uppercase tracking-[0.4em] text-foreground">Company</h4>
              <div className="flex flex-col gap-4">
                <Link href="/about" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors tracking-tight">Our Mission</Link>
                <Link href="/solutions/enterprise" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors tracking-tight">Enterprise</Link>
                <Link href="/solutions/startup" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors tracking-tight">Startups</Link>
                <Link href="/contact" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors tracking-tight">Partnerships</Link>
              </div>
            </div>
          </div>

          <div className="pt-10 border-t border-border/20 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">
              © 2026 AISAM Platform. All Rights Reserved.
            </div>
            <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
              <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
              <Link href="/contact" className="hover:text-primary transition-colors">Security</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

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
    <div className="min-h-screen bg-background selection:bg-primary/10 selection:text-primary">
      {/* Hero Section */}
      <section className="relative px-6 pt-32 pb-20 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto text-center space-y-10">
          <div className="space-y-6">
            <div className="flex justify-center">
              <Badge variant="secondary" className="px-4 py-1.5 rounded-full border-primary/10 bg-primary/5 text-primary font-bold">
                <Sparkles className="size-3.5 mr-2" />
                AI-Powered Marketing Suite
              </Badge>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]">
              Social Media Strategy, <br />
              <span className="text-primary">Perfected by AI.</span>
            </h1>

            <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground font-medium leading-relaxed">
              Scale your creative output across TikTok, Meta, and Instagram.
              Our enterprise-grade AI engine handles the complexity so you can focus on growth.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="h-12 px-8 rounded-lg font-bold shadow-lg shadow-primary/20">
              <Link href="/auth/sign-up" className="flex items-center gap-2">
                Start Free Trial
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 rounded-lg font-semibold border-border/60">
              <Link href="/solutions/startup" className="flex items-center gap-2">
                <Play className="size-4 fill-current" />
                See Solutions
              </Link>
            </Button>
          </div>

          {/* Social Proof */}
          <div className="pt-12 flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-50 grayscale">
            {/* Simple placeholders or icons for brands could go here */}
            <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">TRUSTED BY 12,000+ MARKETERS</div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Everything you need to <span className="text-primary">win</span> in social commerce.
            </h2>
            <p className="text-lg text-muted-foreground font-medium">
              We've built the most comprehensive toolkit for modern marketing teams.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <Card className="p-8 rounded-xl border border-border/50 bg-card hover:shadow-xl transition-all group">
              <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <Brain className="size-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">AI Content Engine</h3>
              <p className="text-muted-foreground font-medium leading-relaxed mb-6">
                Generate high-converting assets optimized for every platform's unique algorithm and audience.
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="rounded-md px-2 py-0 font-bold text-[10px] uppercase">Image AI</Badge>
                <Badge variant="outline" className="rounded-md px-2 py-0 font-bold text-[10px] uppercase">Video Gen</Badge>
              </div>
            </Card>

            {/* Feature 2 */}
            <Card className="p-8 rounded-xl border border-border/50 bg-card hover:shadow-xl transition-all group">
              <div className="size-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform">
                <Target className="size-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Brand Integrity</h3>
              <p className="text-muted-foreground font-medium leading-relaxed mb-6">
                Maintain absolute consistency across all channels with AI-enforced visual and tone guidelines.
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="rounded-md px-2 py-0 font-bold text-[10px] uppercase">Brand Hub</Badge>
                <Badge variant="outline" className="rounded-md px-2 py-0 font-bold text-[10px] uppercase">Audit AI</Badge>
              </div>
            </Card>

            {/* Feature 3 */}
            <Card className="p-8 rounded-xl border border-border/50 bg-card hover:shadow-xl transition-all group">
              <div className="size-12 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 mb-6 group-hover:scale-110 transition-transform">
                <Zap className="size-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Smart Automation</h3>
              <p className="text-muted-foreground font-medium leading-relaxed mb-6">
                Automate your posting schedule and approval workflows to save hundreds of hours every month.
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="rounded-md px-2 py-0 font-bold text-[10px] uppercase">Scheduler</Badge>
                <Badge variant="outline" className="rounded-md px-2 py-0 font-bold text-[10px] uppercase">Auto-Post</Badge>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Loved by high-growth brands.</h2>
            <div className="flex items-center justify-center gap-1 text-primary">
              {[...Array(5)].map((_, i) => <Star key={i} className="size-5 fill-current" />)}
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              { name: "Lan Nguyen", role: "Marketing Director", initial: "LN", quote: "AISAM has completely transformed how we manage advertising. We save 70% of creative production time." },
              { name: "Minh Tran", role: "Brand Lead", initial: "MT", quote: "The AI content engine is truly impressive. It maintains our quality standards while scaling output." },
              { name: "Hoang Le", role: "Growth Manager", initial: "HL", quote: "Professional, intuitive, and the integration was seamless. Our engagement is up 25% since joining." }
            ].map((t, idx) => (
              <Card key={idx} className="p-8 rounded-xl border bg-card flex flex-col justify-between shadow-sm">
                <p className="text-lg font-medium text-foreground italic mb-8">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <Avatar className="size-10 rounded-lg">
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xs">{t.initial}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground font-medium">{t.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto p-12 lg:p-20 rounded-2xl bg-primary text-primary-foreground text-center space-y-10 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-20 opacity-10">
            <Rocket className="size-48" />
          </div>

          <div className="relative space-y-6">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">Ready to scale your brand?</h2>
            <p className="text-xl opacity-80 font-medium max-w-2xl mx-auto">
              Join 12,000+ marketers leveraging AI to dominate social media.
              Start your 14-day free trial now.
            </p>
          </div>

          <div className="relative flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="h-14 px-10 rounded-lg bg-white text-primary hover:bg-white/90 font-bold shadow-xl">
              <Link href="/auth/sign-up">Get Started for Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 px-10 rounded-lg bg-transparent border-white/30 text-white hover:bg-white/10 font-bold">
              <Link href="/contact">Schedule a Demo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-12 lg:grid-cols-4 pb-16">
            <div className="space-y-6">
              <Link href="/" className="flex items-center gap-3">
                <div className="size-8 bg-primary rounded-lg flex items-center justify-center">
                  <Zap className="size-4 text-primary-foreground fill-current" />
                </div>
                <span className="text-xl font-bold text-foreground">AISAM</span>
              </Link>
              <p className="text-muted-foreground font-medium text-sm leading-relaxed max-w-xs">
                The leading AI platform for modern marketing teams.
                Built for the next generation of social commerce.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-foreground mb-6">Product</h4>
              <ul className="space-y-4">
                <li><Link href="/features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link href="/solutions" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Solutions</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-foreground mb-6">Resources</h4>
              <ul className="space-y-4">
                <li><Link href="/docs" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Documentation</Link></li>
                <li><Link href="/blog" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Insights</Link></li>
                <li><Link href="/api" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">API</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-foreground mb-6">Company</h4>
              <ul className="space-y-4">
                <li><Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Our Story</Link></li>
                <li><Link href="/contact" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
                <li><Link href="/privacy" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Privacy</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs font-medium text-muted-foreground opacity-60">
              © 2026 AISAM Platform. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">
              <Link href="/terms" className="hover:text-primary">Terms</Link>
              <Link href="/security" className="hover:text-primary">Security</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

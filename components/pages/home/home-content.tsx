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
import { useTranslation } from "react-i18next";


export function HomeContent() {
  const { t } = useTranslation("common");

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

        <div className="max-w-7xl mx-auto text-center space-y-8 md:space-y-10">
          <div className="space-y-6">
            <div className="flex justify-center">
              <Badge variant="secondary" className="px-3 md:px-4 py-1.5 rounded-full border-primary/10 bg-primary/5 text-primary font-bold text-[10px] md:text-xs">
                <Sparkles className="size-3 md:size-3.5 mr-2" />
                {t('aiPoweredMarketingSuite')}
              </Badge>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.2] md:leading-[1.1] px-4 md:px-0">
              {t('socialMediaStrategy')} <br className="hidden sm:block" />
              <span className="text-primary">{t('perfectedByAI')}</span>
            </h1>

            <p className="max-w-2xl mx-auto text-base md:text-xl text-muted-foreground font-medium leading-relaxed px-6 md:px-0">
              {t('heroDescription')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-6 md:px-0">
            <Button asChild size="lg" className="w-full sm:w-auto h-12 md:h-14 px-8 rounded-xl font-bold shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 transition-all">
              <Link href="/auth/sign-up" className="flex items-center gap-2">
                {t('startFreeTrial')}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-12 md:h-14 px-8 rounded-xl font-bold border-border/60 hover:bg-muted/50 transition-all">
              <Link href="/solutions/startup" className="flex items-center gap-2">
                <Play className="size-4 fill-current" />
                {t('seeSolutions')}
              </Link>
            </Button>
          </div>

          {/* Social Proof */}
          <div className="pt-8 md:pt-12 flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-50 grayscale px-6">
            <div className="flex items-center gap-2 font-black text-sm md:text-xl tracking-tighter uppercase whitespace-nowrap">{t('trustedBy')}</div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 md:py-24 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-12 md:mb-16 space-y-4 text-center md:text-left">
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-foreground">
              {t('everythingYouNeed')} <span className="text-primary">{t('winInSocialCommerce')}</span> {t('winInSocialCommerceSuffix')}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground font-medium">
              {t('toolkitDescription')}
            </p>
          </div>

          <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <Card className="p-6 md:p-8 rounded-2xl border border-border/50 bg-card hover:shadow-xl transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                <Brain className="size-24" />
              </div>
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <Brain className="size-6" />
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-3 uppercase tracking-tight">{t('aiContentEngine')}</h3>
              <p className="text-sm md:text-muted-foreground font-medium leading-relaxed mb-6">
                {t('aiContentEngineDesc')}
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="rounded-lg px-2 py-0.5 font-bold text-[9px] uppercase tracking-wider">{t('imageAI')}</Badge>
                <Badge variant="outline" className="rounded-lg px-2 py-0.5 font-bold text-[9px] uppercase tracking-wider">{t('videoGen')}</Badge>
              </div>
            </Card>

            {/* Feature 2 */}
            <Card className="p-6 md:p-8 rounded-2xl border border-border/50 bg-card hover:shadow-xl transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                <Target className="size-24" />
              </div>
              <div className="size-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 mb-6 group-hover:scale-110 transition-transform">
                <Target className="size-6" />
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-3 uppercase tracking-tight">{t('brandIntegrity')}</h3>
              <p className="text-sm md:text-muted-foreground font-medium leading-relaxed mb-6">
                {t('brandIntegrityDesc')}
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="rounded-lg px-2 py-0.5 font-bold text-[9px] uppercase tracking-wider">{t('brandHub')}</Badge>
                <Badge variant="outline" className="rounded-lg px-2 py-0.5 font-bold text-[9px] uppercase tracking-wider">{t('auditAI')}</Badge>
              </div>
            </Card>

            {/* Feature 3 */}
            <Card className="p-6 md:p-8 rounded-2xl border border-border/50 bg-card hover:shadow-xl transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                <Zap className="size-24" />
              </div>
              <div className="size-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-6 group-hover:scale-110 transition-transform">
                <Zap className="size-6" />
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-3 uppercase tracking-tight">{t('smartAutomation')}</h3>
              <p className="text-sm md:text-muted-foreground font-medium leading-relaxed mb-6">
                {t('smartAutomationDesc')}
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="rounded-lg px-2 py-0.5 font-bold text-[9px] uppercase tracking-wider">{t('scheduler')}</Badge>
                <Badge variant="outline" className="rounded-lg px-2 py-0.5 font-bold text-[9px] uppercase tracking-wider">{t('autoPost')}</Badge>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-7xl mx-auto space-y-12 md:space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight uppercase italic">{t('lovedByBrands')}</h2>
            <div className="flex items-center justify-center gap-1 text-primary">
              {[...Array(5)].map((_, i) => <Star key={i} className="size-4 md:size-5 fill-current" />)}
            </div>
          </div>

          <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              { name: "Lan Nguyen", role: t('roles.marketingDirector'), initial: "LN", quote: "AISAM has completely transformed how we manage advertising. We save 70% of creative production time." },
              { name: "Minh Tran", role: t('roles.brandLead'), initial: "MT", quote: "The AI content engine is truly impressive. It maintains our quality standards while scaling output." },
              { name: "Hoang Le", role: t('roles.growthManager'), initial: "HL", quote: "Professional, intuitive, and the integration was seamless. Our engagement is up 25% since joining." }
            ].map((testimonial, idx) => (
              <Card key={idx} className="p-6 md:p-8 rounded-2xl border bg-card flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                <p className="text-base md:text-lg font-medium text-foreground italic mb-8">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <Avatar className="size-10 rounded-xl">
                    <AvatarFallback className="bg-primary text-primary-foreground font-black text-xs">{testimonial.initial}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-sm uppercase tracking-tight">{testimonial.name}</p>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{testimonial.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-5xl mx-auto p-8 md:p-12 lg:p-20 rounded-[32px] bg-primary text-primary-foreground text-center space-y-8 md:space-y-10 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-20 opacity-10 rotate-12">
            <Rocket className="size-48 md:size-64" />
          </div>

          <div className="relative space-y-4 md:space-y-6">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight uppercase italic">{t('readyToScale')}</h2>
            <p className="text-lg md:text-xl opacity-80 font-medium max-w-2xl mx-auto px-4">
              {t('ctaDescription')}
            </p>
          </div>

          <div className="relative flex flex-col sm:flex-row items-center justify-center gap-4 px-4 md:px-0">
            <Button asChild size="lg" className="w-full sm:w-auto h-14 px-10 rounded-xl bg-white text-primary hover:bg-white/90 font-black uppercase tracking-widest text-xs shadow-xl">
              <Link href="/auth/sign-up">{t('getStartedFree')}</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-14 px-10 rounded-xl bg-transparent border-white/30 text-white hover:bg-white/10 font-black uppercase tracking-widest text-xs">
              <Link href="/contact">{t('scheduleDemo')}</Link>
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
                {t('footer.desc')}
              </p>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-foreground mb-6">{t('footer.product')}</h4>
              <ul className="space-y-4">
                <li><Link href="/features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">{t('footer.features')}</Link></li>
                <li><Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">{t('footer.pricing')}</Link></li>
                <li><Link href="/solutions" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">{t('footer.solutions')}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-foreground mb-6">{t('footer.resources')}</h4>
              <ul className="space-y-4">
                <li><Link href="/docs" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">{t('footer.documentation')}</Link></li>
                <li><Link href="/blog" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">{t('footer.insights')}</Link></li>
                <li><Link href="/api" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">{t('footer.api')}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-foreground mb-6">{t('footer.company')}</h4>
              <ul className="space-y-4">
                <li><Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">{t('footer.ourStory')}</Link></li>
                <li><Link href="/contact" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">{t('footer.contact')}</Link></li>
                <li><Link href="/privacy" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">{t('footer.privacy')}</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs font-medium text-muted-foreground opacity-60">
              {t('footer.rightsReserved')}
            </p>
            <div className="flex items-center gap-6 text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">
              <Link href="/terms" className="hover:text-primary">{t('footer.terms')}</Link>
              <Link href="/security" className="hover:text-primary">{t('footer.security')}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

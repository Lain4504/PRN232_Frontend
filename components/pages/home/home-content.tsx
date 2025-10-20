"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Sparkles, 
  Brain, 
  Target, 
  Calendar, 
  BarChart3, 
  Users, 
  Zap,
  ArrowRight,
  CheckCircle,
  Star,
  Play,
  Shield,
  Clock,
  TrendingUp,
  Globe,
  MessageSquare,
  Heart,
  ThumbsUp,
  Award,
  Rocket,
  Lightbulb,
  Palette,
  BarChart,
  Smartphone,
  Laptop,
  Monitor
} from "lucide-react";

export function HomeContent() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 px-6">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-2/5" />
        <div className="absolute top-20 left-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-chart-2/10 rounded-full blur-3xl animate-pulse delay-1000" />
        
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-xs font-medium bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors">
              <Sparkles className="w-3 h-3 mr-2" />
              Powered by Advanced AI Technology
          </Badge>
          
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-primary via-chart-2 to-chart-3 bg-clip-text text-transparent">
            AISAM
              </span>
          </h1>
          
            <p className="text-lg md:text-xl lg:text-2xl font-semibold text-foreground max-w-4xl mx-auto mb-4 leading-tight">
              Smart Social Media Advertising Management Platform
          </p>
          
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
            Manage multi-platform advertising campaigns (TikTok, Facebook, Instagram) in one place. 
            Automate content creation, brand asset management, scheduling, and performance analysis with AI.
          </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button asChild size="lg" className="text-base px-8 py-4 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Link href="/auth/sign-up">
                  <Rocket className="mr-2 h-4 w-4" />
                  Start Free
                  <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
              <Button asChild variant="outline" size="lg" className="text-base px-8 py-4 border-2 hover:bg-accent/50 transition-all duration-300">
                <Link href="/dashboard" className="flex items-center">
                  <Play className="mr-2 h-4 w-4" />
                  View Demo
                </Link>
            </Button>
            </div>

            {/* Enhanced Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="text-center group">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform duration-300">10K+</div>
                <div className="text-muted-foreground font-medium text-sm">Trusted Users</div>
                <div className="text-xs text-muted-foreground/70 mt-1">From around the world</div>
              </div>
              <div className="text-center group">
                <div className="text-3xl md:text-4xl font-bold text-chart-2 mb-2 group-hover:scale-110 transition-transform duration-300">50M+</div>
                <div className="text-muted-foreground font-medium text-sm">Content Created</div>
                <div className="text-xs text-muted-foreground/70 mt-1">With smart AI</div>
              </div>
              <div className="text-center group">
                <div className="text-3xl md:text-4xl font-bold text-chart-3 mb-2 group-hover:scale-110 transition-transform duration-300">99.9%</div>
                <div className="text-muted-foreground font-medium text-sm">Uptime</div>
                <div className="text-xs text-muted-foreground/70 mt-1">Guaranteed 24/7</div>
              </div>
            </div>
          </div>

          {/* Platform Icons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mb-8">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Globe className="h-4 w-4" />
              <span className="font-medium text-sm">Multi-platform</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span className="font-medium text-sm">Secure & Reliable</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="font-medium text-sm">24/7 Support</span>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* Features Section */}
      <section className="py-16 px-6 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 px-3 py-1.5 text-xs font-medium">
              <Lightbulb className="w-3 h-3 mr-2" />
              Featured Features
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
              Everything you need for{" "}
              <span className="bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
                effective advertising management
              </span>
            </h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
              From AI content creation to performance analysis, AISAM provides all the tools to 
              optimize your marketing campaigns.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* AI Content Creation */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm hover:bg-card/80 hover:scale-105 hover:-translate-y-1">
              <CardHeader className="pb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg font-bold mb-1">AI Content Creation</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Images, videos and text following brand identity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Automatically generate ideas, visuals and copywriting aligned with products, USP and target audience.
                </p>
                <div className="flex items-center text-xs text-primary font-medium">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  GPT-4 & DALL-E
                </div>
                <div className="flex items-center text-xs text-chart-2 font-medium">
                  <Palette className="h-3 w-3 mr-1" />
                  Auto visual creation
                </div>
              </CardContent>
            </Card>

            {/* Brand Management */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm hover:bg-card/80 hover:scale-105 hover:-translate-y-1">
              <CardHeader className="pb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-chart-2/20 to-chart-2/10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                  <Target className="h-5 w-5 text-chart-2" />
                </div>
                <CardTitle className="text-lg font-bold mb-1">Brand Management</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Logo, slogan, tone of voice, brand persona
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Maintain consistent messaging and imagery across all channels.
                </p>
                <div className="flex items-center text-xs text-chart-2 font-medium">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Auto Brand Guidelines
                </div>
                <div className="flex items-center text-xs text-chart-2 font-medium">
                  <Award className="h-3 w-3 mr-1" />
                  Brand templates
                </div>
              </CardContent>
            </Card>

            {/* Scheduling & Auto-posting */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm hover:bg-card/80 hover:scale-105 hover:-translate-y-1">
              <CardHeader className="pb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-chart-3/20 to-chart-3/10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="h-5 w-5 text-chart-3" />
                </div>
                <CardTitle className="text-lg font-bold mb-1">Scheduling & Auto-posting</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Multi-platform, approval before posting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Centralize posting on TikTok, Facebook, Instagram with clear approval workflow.
                </p>
                <div className="flex items-center text-xs text-chart-3 font-medium">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Support 10+ platforms
                </div>
                <div className="flex items-center text-xs text-chart-3 font-medium">
                  <Clock className="h-3 w-3 mr-1" />
                  Smart scheduling
                </div>
              </CardContent>
            </Card>

            {/* Analytics */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm hover:bg-card/80 hover:scale-105 hover:-translate-y-1">
              <CardHeader className="pb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-chart-4/20 to-chart-4/10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="h-5 w-5 text-chart-4" />
                </div>
                <CardTitle className="text-lg font-bold mb-1">Smart Analytics</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Detailed reports and trend predictions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Track campaign performance with AI analysis and optimization suggestions.
                </p>
                <div className="flex items-center text-xs text-chart-4 font-medium">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Real-time Analytics
                </div>
                <div className="flex items-center text-xs text-chart-4 font-medium">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Trend prediction
                </div>
              </CardContent>
            </Card>

            {/* Team Management */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm hover:bg-card/80 hover:scale-105 hover:-translate-y-1">
              <CardHeader className="pb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-chart-5/20 to-chart-5/10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-5 w-5 text-chart-5" />
                </div>
                <CardTitle className="text-lg font-bold mb-1">Team Management</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Role-based permissions and effective collaboration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Manage teams with detailed permissions, approval workflows and real-time collaboration.
                </p>
                <div className="flex items-center text-xs text-chart-5 font-medium">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Role-based Access
                </div>
                <div className="flex items-center text-xs text-chart-5 font-medium">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Real-time collaboration
                </div>
              </CardContent>
            </Card>

            {/* Integration */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm hover:bg-card/80 hover:scale-105 hover:-translate-y-1">
              <CardHeader className="pb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-chart-2/20 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg font-bold mb-1">Powerful Integration</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  API and webhooks for all needs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Integrate with existing marketing tools through powerful API and webhooks.
                </p>
                <div className="flex items-center text-xs text-primary font-medium">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  RESTful API
                </div>
                <div className="flex items-center text-xs text-chart-2 font-medium">
                  <Globe className="h-3 w-3 mr-1" />
                  Webhook support
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Separator />

      {/* Testimonials Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 px-3 py-1.5 text-xs font-medium">
              <Heart className="w-3 h-3 mr-2" />
              What our customers say
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Trusted by{" "}
              <span className="bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
                thousands of businesses
              </span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              From startups to large enterprises, AISAM has helped them optimize their marketing campaigns
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Testimonial 1 */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                  "AISAM has completely transformed how we manage advertising. From content creation to performance analysis, 
                  everything is automated and optimized."
                </p>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">NL</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">Nguyen Thi Lan</p>
                    <p className="text-xs text-muted-foreground">CEO, TechStart Vietnam</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 2 */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                  "AISAM's AI content creation feature is truly impressive. We save 70% of content creation time 
                  and the quality is even better than before."
                </p>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-chart-2/10 text-chart-2 font-semibold text-sm">TM</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">Tran Minh</p>
                    <p className="text-xs text-muted-foreground">Marketing Director, Fashion Brand</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 3 */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                  "User-friendly interface, easy to use and perfect integration with social media platforms. 
                  The support team is also very professional and enthusiastic."
                </p>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-chart-3/10 text-chart-3 font-semibold text-sm">LH</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">Le Hoang</p>
                    <p className="text-xs text-muted-foreground">Founder, Digital Agency</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-12 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">4.9/5</div>
              <div className="text-muted-foreground text-sm">Average rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-chart-2 mb-1">10K+</div>
              <div className="text-muted-foreground text-sm">Satisfied customers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-chart-3 mb-1">99.9%</div>
              <div className="text-muted-foreground text-sm">Uptime guarantee</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-chart-4 mb-1">24/7</div>
              <div className="text-muted-foreground text-sm">Customer support</div>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* Enhanced CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-br from-primary/5 via-transparent to-chart-2/5">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
            Ready to{" "}
            <span className="bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
              get started?
            </span>
          </h2>
          
          <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Join thousands of businesses that trust AISAM for more effective advertising management.
            Start free today!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Button asChild size="lg" className="text-base px-8 py-4 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <Link href="/auth/sign-up">
                <Rocket className="mr-2 h-4 w-4" />
                Create Free Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base px-8 py-4 border-2 hover:bg-accent/50 transition-all duration-300">
              <Link href="/dashboard" className="flex items-center">
                <Play className="mr-2 h-4 w-4" />
                View Demo
              </Link>
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-chart-2" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-chart-2" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-chart-2" />
              <span>24/7 support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="py-12 px-6 bg-muted/30 border-t">
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Company Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 bg-primary rounded flex items-center justify-center">
                  <Zap className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold text-foreground">AISAM</span>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Smart social media advertising management application powered by AI. 
                Optimize your marketing campaigns with advanced technology.
              </p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Smartphone className="h-3 w-3" />
                  <span>Mobile App</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Laptop className="h-3 w-3" />
                  <span>Web Platform</span>
                </div>
              </div>
            </div>

            {/* Product */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground text-sm">Product</h3>
              <div className="space-y-1">
                <Link href="/features/ai-content" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                  AI Content Creation
                </Link>
                <Link href="/features/brand-management" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Brand Management
                </Link>
                <Link href="/features/scheduling" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Post Scheduling
                </Link>
                <Link href="/features/analytics" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Performance Analytics
                </Link>
              </div>
            </div>

            {/* Company */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground text-sm">Company</h3>
              <div className="space-y-1">
                <Link href="/about" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
                <Link href="/careers" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Careers
                </Link>
                <Link href="/blog" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Blog
                </Link>
                <Link href="/contact" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </div>
            </div>

            {/* Support */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground text-sm">Support</h3>
              <div className="space-y-1">
                <Link href="/help" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Help Center
                </Link>
                <Link href="/docs" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Documentation
                </Link>
                <Link href="/api" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                  API Documentation
                </Link>
                <Link href="/status" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                  System Status
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground">
              © 2024 AISAM. All rights reserved.
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="hover:text-foreground transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}



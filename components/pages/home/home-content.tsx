"use client";

import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Brain,
  Target,
  Zap,
  ArrowRight,
  BarChart3,
  Calendar,
  Layers,
  Shield,
  ZapIcon,
  Check,
  Smartphone,
  LayoutDashboard,
  TrendingUp,
  Cpu
} from "lucide-react";
import { cn } from "@/lib/utils";

export function HomeContent() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/10 selection:text-primary transition-colors">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] -z-10 opacity-30 dark:opacity-10">
          <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px]" />
          <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 text-center space-y-10">
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Badge variant="outline" className="px-4 py-1.5 rounded-full border-primary/20 bg-primary/5 text-primary font-bold text-xs backdrop-blur-sm">
                <Sparkles className="size-3.5 mr-2 fill-primary" />
                Nền tảng quảng cáo AI thế hệ mới
              </Badge>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tight text-foreground leading-[1.05] animate-in fade-in slide-in-from-bottom-6 duration-1000">
              Tự động hóa <br />
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Quảng cáo đa kênh</span>
            </h1>

            <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              OmniAdly giúp bạn sáng tạo nội dung, quản lý chiến dịch và tối ưu hóa hiệu quả quảng cáo trên TikTok, Facebook, Instagram bằng trí tuệ nhân tạo.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
            <Button asChild size="lg" className="h-14 px-10 rounded-2xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl shadow-primary/20 transition-all hover:-translate-y-1">
              <Link href="/auth/sign-up" className="flex items-center gap-2">
                Bắt đầu miễn phí
                <ArrowRight className="size-5" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="h-14 px-10 rounded-2xl font-bold text-muted-foreground hover:text-foreground hover:bg-accent transition-all">
              <Link href="#features">Tìm hiểu thêm</Link>
            </Button>
          </div>

          {/* Hero Image Mockup - Thinner & Cinematic */}
          <div className="relative mt-20 max-w-6xl mx-auto animate-in fade-in zoom-in duration-1000 delay-500">
            {/* Glow effect context */}
            <div className="absolute -inset-10 bg-gradient-to-r from-rose-500/5 via-primary/5 to-blue-500/5 rounded-[5rem] blur-[100px] opacity-50 -z-10" />

            <div className="relative rounded-2xl border border-border bg-card/40 backdrop-blur-3xl p-1.5 shadow-[0_32px_80px_-20px_rgba(0,0,0,0.08)] dark:shadow-black/20 overflow-hidden">
              <div className="relative rounded-xl overflow-hidden border border-border/50 bg-muted/20 aspect-[21/9]">
                <Image
                  src="/images/hero_mockup.png"
                  alt="OmniAdly Dashboard"
                  fill
                  className="object-cover object-top transition-all duration-1000"
                  priority
                />
              </div>
            </div>

            {/* Platform Trust Bar */}
            <div className="mt-16 flex flex-col items-center gap-8 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-700">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">Tích hợp đa nền tảng</p>
              <div className="flex flex-wrap items-center justify-center gap-12 md:gap-20 opacity-30 grayscale hover:opacity-80 hover:grayscale-0 transition-all duration-500">
                <div className="flex items-center gap-3">
                  <svg className="size-6 fill-foreground" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" /></svg>
                  <span className="text-xl font-black tracking-tighter text-foreground">TikTok</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="size-6 fill-foreground" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                  <span className="text-xl font-black tracking-tighter text-foreground">Facebook</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="size-6 fill-foreground" viewBox="0 0 24 24"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.984 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.584-.071 4.85c-.055 1.17-.249 1.805-.415 2.227-.217.562-.477.96-.896 1.382-.42.419-.819.679-1.381.896-.422.164-1.057.36-2.227.413-1.266.057-1.646.07-4.85.07s-3.584-.015-4.85-.07c-1.17-.055-1.805-.249-2.227-.415-.562-.217-.96-.477-1.382-.896-.419-.42-.679-.819-.896-1.381-.164-.422-.36-1.057-.413-2.227-.057-1.266-.07-1.646-.07-4.85s.016-3.584.071-4.85c.055-1.17.249-1.805.415-2.227.217-.562.477-.96.896-1.382.42-.419.819-.679 1.381-.896.422-.164 1.057-.36 2.227-.413 1.266-.057 1.646-.07 4.85-.07zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                  <span className="text-xl font-black tracking-tighter text-foreground">Instagram</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Overview Section */}
      <section id="features" className="py-32 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground leading-tight">
                  Sáng tạo nội dung <br />
                  <span className="text-primary italic font-serif">thông minh hơn</span> cùng AI
                </h2>
                <p className="text-lg text-muted-foreground font-medium leading-relaxed max-w-xl">
                  Không còn đau đầu với việc lên ý tưởng hay thiết kế. AI của chúng tôi tự động tạo ra những mẫu quảng cáo thu hút nhất dựa trên dữ liệu thật.
                </p>
              </div>

              <div className="space-y-6">
                {[
                  { title: "Tạo nội dung đa định dạng", desc: "Tự động sinh văn bản, hình ảnh và video ngắn tối ưu cho từng nền tảng.", icon: Cpu },
                  { title: "Tùy chỉnh nhân vật thương hiệu", desc: "Tạo ra đại diện ảo mang phong cách riêng của thương hiệu bạn.", icon: Target },
                  { title: "Lịch đăng bài tự động", desc: "Quản lý tập trung lịch trình đăng bài cho tất cả các kênh mạng xã hội.", icon: Calendar }
                ].map((item, i) => (
                  <div key={i} className="flex gap-5 group">
                    <div className="size-12 rounded-2xl bg-muted border border-border flex items-center justify-center text-muted-foreground/50 group-hover:text-primary group-hover:bg-primary/5 transition-colors">
                      <item.icon className="size-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground mb-1">{item.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden border border-border shadow-2xl">
                <Image
                  src="/images/features_preview.png"
                  alt="Feature Overview"
                  width={800}
                  height={1000}
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute -bottom-10 -right-10 bg-primary p-10 rounded-3xl text-white hidden xl:block shadow-2xl animate-in zoom-in slide-in-from-right-10 duration-1000">
                <ZapIcon className="size-12 fill-white mb-4" />
                <div className="text-2xl font-black">X3 Hiệu suất</div>
                <div className="text-sm font-medium opacity-80">Tiết kiệm 70% thời gian sáng tạo</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-32 px-6 bg-secondary/30">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">Tính năng cốt lõi</h2>
            <p className="text-muted-foreground font-medium font-lg">Mọi công cụ bạn cần để chinh phục khách hàng trên mạng xã hội.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "AI Ad Content Generator", desc: "Tạo hàng nghìn phương án sáng tạo chỉ với một click.", icon: Brain, color: "rose" },
              { title: "Quản lý tài sản thương hiệu", desc: "Lưu trữ và quản lý thống nhất hình ảnh, video, logo.", icon: Layers, color: "blue" },
              { title: "Xuất bản đa nền tảng", desc: "Đăng tải trực tiếp lên TikTok, FB, IG từ một bảng điều khiển.", icon: Smartphone, color: "green" },
              { title: "Luồng phê duyệt thông minh", desc: "Quản lý quy trình duyệt bài chuyên nghiệp cho Agency và Team.", icon: Check, color: "amber" },
              { title: "Bảng điều khiển hợp nhất", desc: "Một nơi duy nhất để kiểm soát mọi hoạt động quảng cáo.", icon: LayoutDashboard, color: "purple" },
              { title: "Tự động tối ưu ngân sách", desc: "AI kiến nghị phân bổ ngân sách vào các chiến dịch hiệu quả nhất.", icon: Zap, color: "orange" },
            ].map((feature, i) => (
              <Card key={i} className="group p-8 rounded-3xl border-border bg-card/50 backdrop-blur-xl hover:shadow-2xl transition-all hover:-translate-y-2 cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-125 group-hover:opacity-10 transition-all">
                  <feature.icon className="size-32" />
                </div>
                <div className="size-14 rounded-2xl bg-muted shadow-lg shadow-primary/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="size-7 text-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground font-medium text-sm leading-relaxed">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Real-Time Analytics Showcase */}
      <section className="py-32 px-6 bg-background overflow-hidden relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="grid grid-cols-2 gap-6 relative z-10">
                {[
                  { label: "Lượt hiển thị", value: "1.2M", trend: "+12%", color: "blue" },
                  { label: "Tương tác", value: "85.4K", trend: "+25%", color: "rose" },
                  { label: "Tỷ lệ nhấp (CTR)", value: "3.2%", trend: "+5.1%", color: "emerald" },
                  { label: "Chi phí mỗi kết quả", value: "2.400đ", trend: "-15%", color: "amber" },
                ].map((stat, i) => (
                  <div key={i} className="bg-card/80 backdrop-blur-md border border-border p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
                    <div className="text-muted-foreground/50 text-xs font-bold uppercase tracking-widest mb-2">{stat.label}</div>
                    <div className="text-3xl font-black text-foreground mb-2">{stat.value}</div>
                    <div className={cn("text-xs font-bold", stat.trend.startsWith('+') ? "text-green-500" : "text-red-500")}>
                      {stat.trend} <span className="text-muted-foreground/30 font-medium">so với tháng trước</span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Background Glass Plate */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-muted rounded-full blur-[100px] -z-10 opacity-50 dark:opacity-20" />
            </div>

            <div className="order-1 lg:order-2 space-y-8">
              <Badge variant="outline" className="px-4 py-1.5 rounded-full border-blue-100 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold text-xs">
                <BarChart3 className="size-3.5 mr-2" />
                Dữ liệu thời gian thực
              </Badge>
              <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tight leading-tight">
                Phân tích & Tối ưu <br />
                <span className="text-blue-600 italic font-serif">dựa trên AI Insights</span>
              </h2>
              <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                Đừng chỉ dừng lại ở việc xem dữ liệu. AI của OmniAdly cung cấp các gợi ý hành động cụ thể để tối ưu hóa ngân sách và tăng tỷ lệ chuyển đổi ngay lập tức.
              </p>
              <ul className="space-y-4">
                {[
                  "Tự động nhận diện mẫu quảng cáo hoạt động tốt nhất",
                  "Kiến nghị nội dung dựa trên trending thời gian thực",
                  "Cảnh báo sớm khi chiến dịch có dấu hiệu bão hòa",
                  "Dự báo kết quả chiến dịch trước khi triển khai"
                ].map((text, i) => (
                  <li key={i} className="flex items-center gap-3 text-foreground/80 font-bold">
                    <div className="size-6 bg-blue-100 dark:bg-blue-500/10 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 italic">
                      <Check className="size-3.5 stroke-[3]" />
                    </div>
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-32 px-6 bg-secondary/30">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">Bảng giá linh hoạt</h2>
            <p className="text-muted-foreground font-medium font-lg">Chọn gói dịch vụ phù hợp để bắt đầu hành trình tăng trưởng cùng AI.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Miễn phí",
                price: "0",
                features: [
                  "Lên lịch đăng tự động tối đa 5 bài/tháng",
                  "Phân tích cơ bản theo độ tuổi và giới tính",
                  "Kết nối tối đa 1 nền tảng",
                  "Tối đa 1 tài khoản đăng nhập và sử dụng"
                ],
                cta: "Bắt đầu miễn phí",
                popular: false
              },
              {
                name: "Plus",
                price: "159.000",
                features: [
                  "AI nâng cấp: tạo tối đa 2 nội dung/ngày và 6 hình ảnh/ngày",
                  "Lên lịch đăng tự động tối đa 30 bài",
                  "Phân tích hiệu suất quảng cáo và lượng khách hàng tiếp cận",
                  "Kết nối tối đa 2 nền tảng",
                  "Tối đa 3 tài khoản đăng nhập và sử dụng"
                ],
                cta: "Dùng thử miễn phí",
                popular: true
              },
              {
                name: "Premium",
                price: "299.000",
                features: [
                  "AI nâng cấp hơn: tạo tối đa 4 nội dung/ngày và 9 hình ảnh/ngày",
                  "Lên lịch đăng tự động không giới hạn bài đăng",
                  "Phân tích hiệu suất quảng cáo và lượng khách hàng tiếp cận",
                  "Đề xuất ngân sách quảng cáo hợp lý theo tháng",
                  "Đề xuất nội dung và ngân sách quảng cáo cho tháng sau",
                  "Kết nối tối đa 3 nền tảng",
                  "Tối đa 5 tài khoản đăng nhập và sử dụng"
                ],
                cta: "Liên hệ tư vấn",
                popular: false
              }
            ].map((plan, i) => (
              <div key={i} className={cn(
                "p-10 rounded-3xl border bg-card relative transition-all hover:-translate-y-2 duration-300",
                plan.popular ? "border-primary shadow-2xl shadow-primary/10" : "border-border"
              )}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                    Phổ biến nhất
                  </div>
                )}
                <div className="mb-8">
                  <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">{plan.name}</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground font-medium">đ/tháng</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-10">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm font-bold text-muted-foreground">
                      <Check className="size-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button variant={plan.popular ? "default" : "outline"} className={cn(
                  "w-full h-14 rounded-2xl font-bold uppercase tracking-widest text-xs",
                  plan.popular ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20" : "border-border text-foreground/70 hover:bg-muted"
                )}>
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 bg-background">
        <div className="max-w-7xl mx-auto rounded-[3.5rem] bg-foreground text-background p-16 md:p-24 text-center relative overflow-hidden shadow-2xl">
          {/* Abstract Decorations */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -z-0" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -z-0" />

          <div className="relative z-10 space-y-10 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight text-background">
              Sẵn sàng để <br /> <span className="text-primary italic font-serif">bứt phá doanh thu?</span>
            </h2>
            <p className="text-lg md:text-xl text-background/60 font-medium">
              Gia nhập cộng đồng hơn 5.000+ Nhà sáng tạo và Doanh nghiệp đã tối ưu hóa quảng cáo cùng OmniAdly.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="h-16 px-12 rounded-2xl font-black uppercase tracking-widest text-sm bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20">
                <Link href="/auth/sign-up">Trải nghiệm ngay bây giờ</Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="h-16 px-12 rounded-2xl font-bold text-background hover:bg-background/10">
                <Link href="/demo">Xem bản Demo</Link>
              </Button>
            </div>

            <div className="pt-10 flex flex-wrap items-center justify-center gap-8 opacity-30 grayscale invert">
              <span className="text-sm font-bold tracking-widest">SAFE & SECURE</span>
              <span className="text-sm font-bold tracking-widest">GDPR COMPLIANT</span>
              <span className="text-sm font-bold tracking-widest">ENCRYPTED DATA</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 px-6 border-t border-border bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-16 lg:grid-cols-4 pb-20">
            <div className="space-y-6">
              <Link href="/" className="flex items-center gap-3">
                <div className="size-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                  <Zap className="size-5 text-primary-foreground fill-current" />
                </div>
                <span className="text-2xl font-bold text-foreground tracking-tight">OmniAdly</span>
              </Link>
              <p className="text-muted-foreground font-medium text-sm leading-relaxed max-w-xs">
                Nền tảng quản lý quảng cáo được vận hành bởi AI, giúp bạn tối ưu hóa sự hiện diện của thương hiệu trên mọi nền tảng số.
              </p>
            </div>

            {[
              { title: "Sản phẩm", links: ["Bảng giá", "Giải pháp Startup", "Giải pháp Doanh nghiệp"] },
              { title: "Hỗ trợ", links: ["Tài liệu", "Trung tâm trợ giúp"] },
              { title: "Công ty", links: ["Về chúng tôi", "Blog", "Liên hệ"] }
            ].map((col, i) => (
              <div key={i}>
                <h4 className="font-bold text-xs uppercase tracking-widest text-muted-foreground/50 mb-8">{col.title}</h4>
                <ul className="space-y-4">
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <Link href="#" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">{link}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-10 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-xs font-bold text-muted-foreground/30 uppercase tracking-widest">
              © 2026 OmniAdly inc. All rights reserved.
            </p>
            <div className="flex items-center gap-8 text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.2em]">
              <Link href="/terms" className="hover:text-primary transition-colors">Điều khoản</Link>
              <Link href="/privacy" className="hover:text-primary transition-colors">Bảo mật</Link>
              <Link href="/cookies" className="hover:text-primary transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

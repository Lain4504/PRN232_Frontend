import { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Rocket, Zap, Target, TrendingUp, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
    title: "omniadly | Dành cho Startup",
    description: "Tăng tốc chu kỳ sáng tạo của bạn với Chương trình Startup của omniadly.",
};

export default function StartupPage() {
    return (
        <div className="min-h-screen bg-background dark:bg-slate-950 font-fira-sans text-slate-900 dark:text-slate-50">
            <Header />

            <main className="pt-40 pb-20 px-6">
                <div className="max-w-[1440px] mx-auto space-y-32">

                    <section className="text-center space-y-8 max-w-4xl mx-auto">
                        <Badge variant="outline" className="px-6 py-2 rounded-full border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-500 font-black uppercase tracking-[0.3em] text-[10px]">
                            Chương trình Early Stage
                        </Badge>
                        <h1 className="text-6xl md:text-9xl font-black tracking-tight uppercase leading-[0.85] text-foreground dark:text-white">
                            Chuyển động <br />
                            <span className="text-amber-500 italic">Nhanh hơn</span>.
                        </h1>
                        <p className="text-xl md:text-3xl text-muted-foreground dark:text-slate-400 font-medium leading-relaxed tracking-tight">
                            Đừng để việc bí ý tưởng nội dung cản bước bạn. omniadly mang lại cho các đội ngũ startup sức mạnh sáng tạo của một agency 50 nhân sự.
                        </p>
                    </section>

                    {/* Startup Benefits Grid */}
                    <section className="grid gap-8 md:grid-cols-3">
                        {[
                            { icon: Zap, title: "Triển khai trong vài phút", desc: "Tạo và xuất bản chiến dịch mạng xã hội đầu tiên của bạn chỉ trong vài phút, không phải vài ngày.", color: "text-amber-500" },
                            { icon: Target, title: "Tập trung tuyệt đối", desc: "Hãy để AI lo phần công việc sáng tạo để đội ngũ của bạn tập trung vào việc tìm kiếm thị trường mục tiêu.", color: "text-rose-500" },
                            { icon: TrendingUp, title: "Khả năng mở rộng", desc: "Nền tảng của chúng tôi phát triển cùng doanh nghiệp của bạn. Mở rộng từ 1 lên 100 kênh ngay tức thì.", color: "text-emerald-500" },
                        ].map((benefit) => (
                            <div key={benefit.title} className="p-12 rounded-[3.5rem] bg-card/40 dark:bg-slate-900/40 border border-border/40 dark:border-slate-800/50 backdrop-blur-3xl hover:bg-card/60 dark:hover:bg-slate-800/60 transition-all group">
                                <div className={`h-16 w-16 rounded-2xl bg-muted/50 dark:bg-slate-800 flex items-center justify-center mb-8 ${benefit.color} group-hover:scale-110 transition-transform`}>
                                    <benefit.icon className="h-8 w-8 stroke-[2.5]" />
                                </div>
                                <h3 className="text-2xl font-black uppercase tracking-tight mb-4 text-slate-900 dark:text-white">{benefit.title}</h3>
                                <p className="text-muted-foreground dark:text-slate-400 font-medium leading-relaxed">{benefit.desc}</p>
                            </div>
                        ))}
                    </section>

                    {/* Pricing Hook */}
                    <section className="grid lg:grid-cols-2 bg-primary rounded-[4rem] overflow-hidden shadow-2xl relative group border border-primary/20">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary via-blue-700 to-indigo-900 dark:from-primary/80 dark:via-blue-800/80 dark:to-slate-950 opacity-90" />
                        <div className="p-16 lg:p-24 space-y-12 relative z-10">
                            <div className="space-y-6">
                                <h2 className="text-5xl lg:text-7xl font-black text-white uppercase tracking-tighter leading-none text-white">Lợi thế <br /><span className="text-white/40 italic">Startup</span></h2>
                                <div className="space-y-4">
                                    {[
                                        "Dùng thử miễn phí 14 ngày",
                                        "Tạo nội dung AI không giới hạn",
                                        "Hỗ trợ ưu tiên khách hàng",
                                        "Quản lý thành công cá nhân"
                                    ].map((feature) => (
                                        <div key={feature} className="flex items-center gap-3 text-white">
                                            <CheckCircle className="h-5 w-5 text-white/60 stroke-[3]" />
                                            <span className="text-lg font-black uppercase tracking-tight">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <Button asChild className="h-20 px-16 bg-white dark:bg-slate-950 text-primary dark:text-white font-black uppercase tracking-widest rounded-2xl hover:scale-110 transition-all text-sm shadow-xl shadow-black/20">
                                <Link href="/auth/sign-up">BẮT ĐẦU NGAY BÂY GIỜ</Link>
                            </Button>
                        </div>
                        <div className="hidden lg:block relative overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=1200" alt="Văn phòng Startup" className="absolute inset-0 w-full h-full object-cover grayscale opacity-50 group-hover:scale-110 group-hover:grayscale-0 transition-all duration-1000" />
                        </div>
                    </section>
                </div>
            </main>

            <footer className="py-20 px-6 border-t border-border/40 dark:border-slate-800 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 dark:text-slate-600">
                    © 2026 omniadly Platform. Chương trình Startup.
                </p>
            </footer>
        </div>
    );
}

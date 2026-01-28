import { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Shield, Globe, Users, BarChart3, Rocket, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
    title: "omniadly | Giải pháp Doanh nghiệp",
    description: "Cơ sở hạ tầng marketing AI cấp độ doanh nghiệp cho các tập đoàn toàn cầu.",
};

export default function EnterprisePage() {
    return (
        <div className="min-h-screen bg-background dark:bg-slate-950 font-fira-sans text-slate-900 dark:text-slate-50">
            <Header />

            <main className="pt-40 pb-20 px-6">
                <div className="max-w-[1440px] mx-auto space-y-32">

                    <section className="text-center space-y-8 max-w-4xl mx-auto">
                        <Badge variant="outline" className="px-6 py-2 rounded-full border-primary/20 bg-primary/5 text-primary font-black uppercase tracking-[0.3em] text-[10px]">
                            Phân khúc tập đoàn
                        </Badge>
                        <h1 className="text-6xl md:text-9xl font-black tracking-tight uppercase leading-[0.85] text-foreground dark:text-white">
                            Kiểm soát <br />
                            <span className="text-primary italic">Thương hiệu</span>.
                        </h1>
                        <p className="text-xl md:text-3xl text-muted-foreground dark:text-slate-400 font-medium leading-relaxed tracking-tight">
                            omniadly Enterprise cung cấp hệ sinh thái AI tích hợp cho các tổ chức toàn cầu yêu cầu quy mô, bảo mật và khả năng cộng tác nhóm cao.
                        </p>
                    </section>

                    {/* Core Features */}
                    <section className="grid gap-px bg-border/20 dark:bg-slate-800/20 rounded-[4rem] overflow-hidden border border-border/40 dark:border-slate-800/50 shadow-2xl">
                        {[
                            { icon: Shield, title: "Quản trị Thương hiệu", desc: "Tập trung hóa các nguyên tắc thương hiệu trên tất cả các kênh xã hội với việc thực thi tính nhất quán tự động." },
                            { icon: Globe, title: "Phân phối Toàn cầu", desc: "Triển khai nội dung mạng xã hội trên nhiều khu vực và nền tảng với khả năng đồng bộ hóa tức thì." },
                            { icon: Users, title: "Cộng tác Đội ngũ", desc: "Phân quyền người dùng nâng cao và quy trình phê duyệt cho các đội ngũ marketing phức tạp." },
                            { icon: BarChart3, title: "Phân tích Chiến lược", desc: "Theo dõi hiệu quả cấp độ doanh nghiệp và đối chiếu chiến dịch đa nền tảng." },
                        ].map((feature) => (
                            <div key={feature.title} className="p-16 bg-card/40 dark:bg-slate-900/40 backdrop-blur-3xl hover:bg-card/60 dark:hover:bg-slate-800/60 transition-all group border-b border-border/20 dark:border-slate-800/30 last:border-b-0">
                                <div className="flex flex-col lg:flex-row lg:items-center gap-10">
                                    <div className="h-20 w-20 rounded-2xl bg-muted/50 dark:bg-slate-800 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                        <feature.icon className="h-10 w-10 stroke-[2.5]" />
                                    </div>
                                    <div className="space-y-4 flex-1">
                                        <h3 className="text-4xl font-black uppercase tracking-tight text-foreground dark:text-white">{feature.title}</h3>
                                        <p className="text-xl text-muted-foreground dark:text-slate-400 font-medium leading-relaxed max-w-3xl">{feature.desc}</p>
                                    </div>
                                    <div className="hidden lg:block group-hover:translate-x-4 transition-transform text-primary opacity-0 group-hover:opacity-100">
                                        <Rocket className="h-12 w-12 stroke-[2.5]" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </section>

                    {/* Infrastructure Hooks */}
                    <section className="relative py-32 px-10 rounded-[5rem] bg-muted/20 dark:bg-slate-900/40 border border-border/40 dark:border-slate-800/50 overflow-hidden group text-center space-y-12 shadow-inner">
                        <div className="absolute top-0 right-0 p-20 opacity-5 group-hover:rotate-12 transition-transform duration-1000 text-primary">
                            <Zap className="h-[20rem] w-[20rem] fill-current" />
                        </div>
                        <div className="space-y-6 relative z-10">
                            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none dark:text-white">Mô hình AI <br /><span className="text-primary italic">Riêng biệt</span></h2>
                            <p className="text-xl text-muted-foreground dark:text-slate-400 font-medium max-w-2xl mx-auto">
                                Huấn luyện các mô hình sáng tạo tùy chỉnh trên dữ liệu thương hiệu riêng tư của bạn trong một cơ sở hạ tầng biệt lập và siêu bảo mật.
                            </p>
                        </div>
                        <div className="flex justify-center gap-6 relative z-10">
                            <Button asChild size="lg" className="h-20 px-16 bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] rounded-3xl shadow-2xl shadow-primary/30 hover:scale-110 transition-all font-sans text-sm">
                                <Link href="/contact">LIÊN HỆ PHÒNG KINH DOANH</Link>
                            </Button>
                        </div>
                    </section>
                </div>
            </main>

            <footer className="py-20 px-6 border-t border-border/40 dark:border-slate-800 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 dark:text-slate-600">
                    © 2026 omniadly Platform. Phân khúc Doanh nghiệp.
                </p>
            </footer>
        </div>
    );
}

"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  Star
} from "lucide-react";

export function HomeContent() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <div className="relative max-w-6xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm">
            <Sparkles className="w-4 h-4 mr-2" />
            Powered by AI Technology
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-6">
            AISAM
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto mb-8 leading-relaxed">
            Ứng dụng quản lý quảng cáo mạng xã hội thông minh ứng dụng AI
          </p>
          
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-12">
            Quản lý chiến dịch quảng cáo đa nền tảng (TikTok, Facebook, Instagram) trong một nơi duy nhất. 
            Tự động hoá tạo nội dung, quản lý tài sản thương hiệu, đăng lịch và phân tích hiệu quả bằng AI.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link href="/auth/login">
                Bắt đầu ngay
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
              <Link href="/dashboard">Xem bảng điều khiển</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">10K+</div>
              <div className="text-muted-foreground">Người dùng tin tưởng</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">50M+</div>
              <div className="text-muted-foreground">Nội dung được tạo</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">99.9%</div>
              <div className="text-muted-foreground">Thời gian hoạt động</div>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Tính năng nổi bật
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tất cả những gì bạn cần để quản lý quảng cáo hiệu quả
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Tạo nội dung bằng AI</CardTitle>
                <CardDescription className="text-base">
                  Ảnh, video và văn bản theo nhận diện thương hiệu
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Tự động sinh ý tưởng, visual và copywriting bám sát sản phẩm, USP và đối tượng mục tiêu.
                </p>
                <div className="mt-4 flex items-center text-sm text-primary font-medium">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Tích hợp GPT-4 & DALL-E
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Quản lý thương hiệu</CardTitle>
                <CardDescription className="text-base">
                  Logo, slogan, tông giọng, persona đại diện
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Duy trì tính nhất quán thông điệp và hình ảnh trên mọi kênh.
                </p>
                <div className="mt-4 flex items-center text-sm text-primary font-medium">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Brand Guidelines tự động
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Lập lịch & đăng tự động</CardTitle>
                <CardDescription className="text-base">
                  Đa nền tảng, phê duyệt trước khi đăng
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Trung tâm hoá đăng bài trên TikTok, Facebook, Instagram với quy trình phê duyệt rõ ràng.
                </p>
                <div className="mt-4 flex items-center text-sm text-primary font-medium">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Hỗ trợ 10+ nền tảng
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Phân tích thông minh</CardTitle>
                <CardDescription className="text-base">
                  Báo cáo chi tiết và dự đoán xu hướng
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Theo dõi hiệu suất chiến dịch với AI phân tích và đưa ra gợi ý tối ưu.
                </p>
                <div className="mt-4 flex items-center text-sm text-primary font-medium">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Real-time Analytics
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Quản lý nhóm</CardTitle>
                <CardDescription className="text-base">
                  Phân quyền và cộng tác hiệu quả
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Quản lý đội ngũ với phân quyền chi tiết, workflow phê duyệt và cộng tác real-time.
                </p>
                <div className="mt-4 flex items-center text-sm text-primary font-medium">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Role-based Access
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Tích hợp mạnh mẽ</CardTitle>
                <CardDescription className="text-base">
                  API và webhook cho mọi nhu cầu
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Tích hợp với các công cụ marketing hiện có thông qua API mạnh mẽ và webhook.
                </p>
                <div className="mt-4 flex items-center text-sm text-primary font-medium">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  RESTful API
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Separator />

      {/* CTA Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
            Sẵn sàng bắt đầu?
          </h2>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Tham gia cùng hàng nghìn doanh nghiệp đã tin tưởng AISAM để quản lý quảng cáo hiệu quả hơn.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link href="/auth/sign-up">
                Tạo tài khoản miễn phí
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
              <Link href="/dashboard/organizations">Xem tổ chức</Link>
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            Không cần thẻ tín dụng • Dùng thử 14 ngày miễn phí
          </p>
        </div>
      </section>
    </div>
  );
}



"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-3">
            AISAM — Ứng dụng quản lý quảng cáo mạng xã hội thông minh ứng dụng AI
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Quản lý chiến dịch quảng cáo đa nền tảng (TikTok, Facebook, Instagram) trong một nơi duy nhất. Tự động hoá tạo nội dung, quản lý tài sản thương hiệu, đăng lịch và phân tích hiệu quả bằng AI.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Tạo nội dung bằng AI</CardTitle>
              <CardDescription>Ảnh, video và văn bản theo nhận diện thương hiệu</CardDescription>
            </CardHeader>
            <CardContent>
              Tự động sinh ý tưởng, visual và copywriting bám sát sản phẩm, USP và đối tượng mục tiêu.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quản lý thương hiệu</CardTitle>
              <CardDescription>Logo, slogan, tông giọng, persona đại diện</CardDescription>
            </CardHeader>
            <CardContent>
              Duy trì tính nhất quán thông điệp và hình ảnh trên mọi kênh.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lập lịch & đăng tự động</CardTitle>
              <CardDescription>Đa nền tảng, phê duyệt trước khi đăng</CardDescription>
            </CardHeader>
            <CardContent>
              Trung tâm hoá đăng bài trên TikTok, Facebook, Instagram với quy trình phê duyệt rõ ràng.
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 flex items-center justify-center gap-4">
          <Button onClick={() => router.push("/login")} size="lg">
            Bắt đầu ngay
          </Button>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>Xem bảng điều khiển</Button>
        </div>
      </div>
    </div>
  )
}

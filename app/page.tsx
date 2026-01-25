import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { HomeContent } from "@/components/pages/home/home-content";

export const metadata: Metadata = {
  title: "omniadly | Quản lý quảng cáo thông minh",
  description: "Quản lý chiến dịch quảng cáo đa nền tảng với AI: tạo nội dung, lập lịch, phân tích hiệu quả.",
  openGraph: {
    title: "omniadly | Quản lý quảng cáo thông minh",
    description: "Quản lý chiến dịch quảng cáo đa nền tảng với AI: tạo nội dung, lập lịch, phân tích hiệu quả.",
    url: "https://omniadly.app/",
    siteName: "omniadly",
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "omniadly | Quản lý quảng cáo thông minh",
    description: "Quản lý chiến dịch quảng cáo đa nền tảng với AI: tạo nội dung, lập lịch, phân tích hiệu quả.",
  },
};

export default function Home() {
  return (
    <>
      <Header />
      <HomeContent />
    </>
  );
}
